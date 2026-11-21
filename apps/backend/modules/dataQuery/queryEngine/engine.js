// src/engine.js
const constants = require("../../../constants");
const Logger = require("../../../utils/logger");
const { resolveTemplate, validateTemplate } = require("@jet-admin/expression-engine");
const { DATASOURCE_TYPES } = require("@jet-admin/datasource-types");
const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
const fileStorageUtil = require("../../../utils/fileStorage.util");
const { vaultService } = require("../../vault/vault.service");
const { BoundedCache } = require("../../../utils/cache.util");

const QUERY_TEMPLATE_OPTIONS = {
  allowedRoots: ["inputs"],
  preserveSingleExpressionType: true,
};

// Short-lived shared result cache. A value only survives 10 seconds so a
// query/datasource edit is visible quickly even without explicit invalidation.
// The cache is bounded because query results may be large.
const QUERY_CACHE_TTL_MS = 10 * 1000;
const DATASOURCE_CACHE_TTL_MS = 30 * 1000;

const READ_ONLY_REDIS_OPERATIONS = new Set([
  "get", "mget", "hget", "hgetall", "hmget", "lrange", "llen", "smembers",
  "sismember", "zrange", "zcard", "keys", "scan", "exists", "ttl", "pttl",
  "type", "dbsize", "ping", "info", "xlen", "xrange", "xread",
]);
const READ_ONLY_MONGO_OPERATIONS = new Set(["find", "findOne", "aggregate", "count", "distinct"]);
const READ_ONLY_S3_OPERATIONS = new Set(["listObjects", "getObject", "headObject"]);
const READ_ONLY_KAFKA_OPERATIONS = new Set(["listTopics", "getTopicMetadata"]);
const READ_ONLY_RABBIT_OPERATIONS = new Set(["getQueueInfo"]);

function stripSqlComments(sql) {
  return String(sql || "")
    .replace(/--[^\n\r]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .trim();
}

function isSingleStatement(sql) {
  // Multi-statements (e.g. `SELECT 1; INSERT INTO t ...`) must never be
  // treated as a read, even when the first statement is a SELECT.
  const text = stripSqlComments(sql);
  if (!text) return false;
  // Strip quoted literals so `;` inside a string doesn't count.
  const withoutStrings = text
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, "``");
  return !/;\s*\S/.test(withoutStrings);
}

function isReadOnlySql(sql) {
  const text = stripSqlComments(sql);
  if (!text || !isSingleStatement(text)) return false;
  const first = text.match(/^[a-z]+/i)?.[0]?.toLowerCase();
  if (!first) return false;
  if (["select", "show", "explain", "describe", "desc", "pragma", "values"].includes(first)) {
    return true;
  }
  if (first !== "with") return false;
  // A CTE can prefix a mutation (`WITH x AS (...) DELETE ...`). Only cache
  // when the statement contains a SELECT and no mutating keyword.
  return /\bselect\b/i.test(text) &&
    !/\b(insert|update|delete|merge|upsert|create|alter|drop|truncate|grant|revoke|call|copy|vacuum|analyze|refresh|do|execute)\b/i.test(text);
}

/**
 * Decide whether a query result may be served from the short-lived result
 * cache. Only read-only operations are cacheable. The default is "not
 * cacheable" so a new datasource/operation can never silently lose a write.
 */
function isQueryResultCacheable(query) {
  const options = query?.dataQueryOptions || {};
  if (options.cache === false) return false;
  const type = String(query?.datasourceType || "").toLowerCase();
  const sqlTypes = new Set([
    "postgresql", "mysql", "mssql", "oracle", "sqlite", "cockroachdb",
    "clickhouse", "duckdb",
  ]);

  if (sqlTypes.has(type)) {
    const sql = typeof options.query === "string" ? options.query : "";
    return isReadOnlySql(sql);
  }
  if (type === "restapi") {
    return ["GET", "HEAD", "OPTIONS"].includes(String(options.method || "GET").toUpperCase());
  }
  if (type === "weburl") {
    return ["GET", "HEAD"].includes(String(options.action || "GET").toUpperCase());
  }
  if (type === "graphql") {
    const raw = typeof options.query === "string" ? options.query : "";
    return raw.trim().length > 0 && !/\b(mutation|subscription)\b/i.test(raw);
  }
  if (type === "redis") {
    return READ_ONLY_REDIS_OPERATIONS.has(String(options.operation || "").toLowerCase());
  }
  if (type === "mongodb") {
    return READ_ONLY_MONGO_OPERATIONS.has(String(options.operation || "find"));
  }
  if (type === "neo4j") {
    const cypher = stripSqlComments(options.query || "");
    if (!cypher) return false;
    if (!/^(match|return|with|unwind)\b/i.test(cypher)) return false;
    return !/\b(create|merge|delete|detach|set|remove|drop|call)\b/i.test(cypher);
  }
  if (type === "s3") {
    return READ_ONLY_S3_OPERATIONS.has(String(options.operation || ""));
  }
  if (type === "kafka") {
    return READ_ONLY_KAFKA_OPERATIONS.has(String(options.operation || ""));
  }
  if (type === "rabbitmq") {
    return READ_ONLY_RABBIT_OPERATIONS.has(String(options.operation || ""));
  }
  if (type === "excelcsv") {
    return true;
  }
  if (type === "prometheus") {
    return true;
  }
  if (type === "filesystem") {
    return ["list", "read", "stat"].includes(String(options.operation || "list").toLowerCase());
  }
  if (type === "sftp") {
    return ["list", "read", "stat"].includes(String(options.operation || "list").toLowerCase());
  }
  if (type === "influxdb") {
    if (String(options.operation || "query").toLowerCase() !== "query") return false;
    // Flux `to()` is the mutation form of Flux; cacheable only for read-only
    // pipelines. Anything containing a `to(` token is never cached.
    const flux = String(options.flux || options.query || "");
    return !/\bto\s*\(/i.test(flux);
  }
  if (type === "github" || type === "gitlab") {
    return ["GET", "HEAD"].includes(String(options.method || "GET").toUpperCase());
  }
  if (type === "ldap") {
    return String(options.operation || "search").toLowerCase() === "search";
  }
  if (type === "smtp") {
    return false;
  }
  return false;
}


class QueryEngine {
  constructor(queryFetcher, datasourceFetcher) {
    this.queryFetcher = queryFetcher;
    this.datasourceFetcher = datasourceFetcher;
    this.cache = new BoundedCache(1000);
    this.dataSourceCache = new BoundedCache(100);
  }

  _readCache(cache, key) {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  _writeCache(cache, key, value, ttlMs) {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /**
   * Drop all cached query results and datasource instances.
   * Called after a query/datasource changes when the caller can do so
   * synchronously; the TTL remains the backstop for other writers.
   */
  clearCache() {
    this.cache.clear();
    this.dataSourceCache.clear();
  }

  async executeQuery(dataQueryID, runtimeInputs, opts = {}) {
    const tenantID = opts?.tenantID;
    const fetchContext = tenantID ? { tenantID } : undefined;
    const query = fetchContext
      ? await this.queryFetcher(dataQueryID, fetchContext)
      : await this.queryFetcher(dataQueryID);
    if (!query) {
      Logger.log("error", {
        message: "QueryEngine:executeQuery:queryNotFound",
        params: { dataQueryID, tenantID },
      });
      throw new Error(`Query ${dataQueryID} not found`);
    }

    // Include the query revision so editing a query invalidates its cached
    // result immediately. Datasource edits are covered by the short TTL and
    // clearCache() from the datasource service where available.
    const revision = query.updatedAt instanceof Date
      ? query.updatedAt.toISOString()
      : (query.updatedAt || "");
    const cacheKey = `${tenantID || ""}|${dataQueryID}|${revision}|${JSON.stringify(runtimeInputs)}`;

    Logger.log("info", {
      message: "QueryEngine:executeQuery:start",
      params: { dataQueryID, tenantID, runtimeInputs },
    });

    const cacheable = isQueryResultCacheable(query);
    const cached = cacheable ? this._readCache(this.cache, cacheKey) : undefined;
    if (cached !== undefined) {
      Logger.log("info", {
        message: "QueryEngine:executeQuery:cacheHit",
        params: { dataQueryID },
      });
      return cached;
    }

    Logger.log("info", {
      message: "QueryEngine:executeQuery:fetchedQuery",
      params: { dataQueryID, query },
    });

    const templateViolations = [];
    this._collectTemplateViolations(
      query.dataQueryOptions,
      "dataQueryOptions",
      templateViolations
    );
    if (templateViolations.length > 0) {
      throw new Error(
        `Query template validation failed: ${templateViolations.map((v) => `${v.path}: ${v.message}`).join("; ")}`
      );
    }

    const resolvedTemplate = await this.resolveTemplate(
      query.dataQueryOptions,
      runtimeInputs,
      dataQueryID
    );
    Logger.log("info", {
      message: "QueryEngine:executeQuery:resolvedTemplate",
      params: { dataQueryID, resolvedTemplate },
    });

    const datasource = await this.getDataSource(query, dataQueryID, tenantID);
    // Timeout precedence: per-node/per-workflow override (workflow node) >
    // the query's own dataQueryOptions.timeoutSeconds > platform default.
    const overrideSeconds = Number(opts?.timeoutSeconds);
    const timeoutSeconds = (Number.isFinite(overrideSeconds) && overrideSeconds > 0)
      ? Math.trunc(overrideSeconds)
      : (query.dataQueryOptions?.timeoutSeconds || constants.DEFAULTS.QUERY_TIMEOUT_SECONDS);
    const timeoutMs = timeoutSeconds * 1000;

    const abortController = new AbortController();
    let timeoutID;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutID = setTimeout(() => {
        abortController.abort();
        reject(new Error(`Query execution timed out after ${timeoutSeconds}s`));
      }, timeoutMs);
    });

    let result;
    try {
      const orderedInputs = (query.dataQueryOptions?.inputDefinitions || []).map((def) =>
        runtimeInputs && runtimeInputs[def.key] !== undefined ? runtimeInputs[def.key] : null
      );
      result = await Promise.race([
        datasource.execute(
          resolvedTemplate,
          { inputs: orderedInputs },
          {
            fileStorage: fileStorageUtil,
            signal: abortController.signal,
            inputs: orderedInputs,
            tenantID,
            getCredential: async (vaultCredentialID) => {
              return await vaultService.getCredential({
                tenantID: query.tenantID,
                vaultCredentialID,
              });
            },
            getGoogleClientConfig: () => {
              return vaultService.getGoogleClientConfig();
            },
          }
        ),
        timeoutPromise
      ]);
    } finally {
      clearTimeout(timeoutID);
    }

    if (cacheable) {
      this._writeCache(this.cache, cacheKey, result, QUERY_CACHE_TTL_MS);
    }
    Logger.log("info", {
      message: "QueryEngine:executeQuery:executed",
      params: { dataQueryID, runtimeInputs, cacheable },
    });
    return result;
  }

  async getDataSource(query, dataQueryID, tenantID) {
    const cacheKey = `${query.datasourceType}_${query.datasourceID}_${tenantID || ""}`;

    Logger.log("info", {
      message: "QueryEngine:getDataSource:start",
      params: { dataQueryID, cacheKey },
    });

    const cached = this._readCache(this.dataSourceCache, cacheKey);
    if (cached) {
      Logger.log("info", {
        message: "QueryEngine:getDataSource:cacheHit",
        params: { dataQueryID },
      });
      return cached;
    }

    let datasourceConfig;
    switch (query.datasourceType) {
      default:
        datasourceConfig = tenantID
          ? await this.datasourceFetcher(query.datasourceID, { tenantID })
          : await this.datasourceFetcher(query.datasourceID);
        break;
    }

    if (!datasourceConfig) {
      Logger.log("error", {
        message: "QueryEngine:getDataSource:configNotFound",
        params: { dataQueryID, datasourceID: query.datasourceID },
      });
      throw new Error(`Datasource configuration not found or invalid for ID: ${query.datasourceID || 'unspecified'}`);
    }

    const DataSource = dataSourceRegistry.getDataSource(query.datasourceType);
    const instance = new DataSource(datasourceConfig, {
      fileStorage: fileStorageUtil,
      getCredential: async (vaultCredentialID) => {
        return await vaultService.getCredential({
          tenantID: query.tenantID,
          vaultCredentialID,
        });
      },
    });

    this._writeCache(this.dataSourceCache, cacheKey, instance, DATASOURCE_CACHE_TTL_MS);
    Logger.log("info", {
      message: "QueryEngine:getDataSource:created",
      params: { dataQueryID, cacheKey },
    });
    return instance;
  }

  _collectTemplateViolations(value, path, violations) {
    if (typeof value === "string") {
      const result = validateTemplate(value, "safe-path", { allowedRoots: ["inputs"] });
      if (!result.valid) {
        for (const error of result.errors) {
          violations.push({ path, message: error.message });
        }
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => this._collectTemplateViolations(item, `${path}[${index}]`, violations));
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, nested] of Object.entries(value)) {
        this._collectTemplateViolations(nested, `${path}.${key}`, violations);
      }
    }
  }

  async resolveTemplate(template, runtimeInputs, dataQueryID) {
    Logger.log("info", {
      message: "QueryEngine:resolveTemplate:start",
      params: { dataQueryID, template },
    });

    const resolvedTemplate = resolveTemplate(
      template,
      runtimeInputs, // flat object directly, as expression-engine strips the allowedRoot prefix
      QUERY_TEMPLATE_OPTIONS,
      { dataQueryID, module: "dataQuery" }
    );

    Logger.log("info", {
      message: "QueryEngine:resolveTemplate:done",
      params: { dataQueryID, resolvedTemplate },
    });

    return resolvedTemplate;
  }
}

module.exports = { QueryEngine, isQueryResultCacheable };
