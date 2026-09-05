// src/engine.js
const constants = require("../../../constants");
const Logger = require("../../../utils/logger");
const { resolveTemplate } = require("@jet-admin/expression-engine");
const { DATASOURCE_TYPES } = require("@jet-admin/datasource-types");
const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
const fileStorageUtil = require("../../../utils/fileStorage.util");
const { vaultService } = require("../../vault/vault.service");
const { BoundedCache } = require("../../../utils/cache.util");

const QUERY_TEMPLATE_OPTIONS = {
  allowedRoots: ["inputs"],
  preserveSingleExpressionType: true,
};

class QueryEngine {
  constructor(queryFetcher, datasourceFetcher) {
    this.queryFetcher = queryFetcher;
    this.datasourceFetcher = datasourceFetcher;
    this.cache = new BoundedCache(1000);
    this.dataSourceCache = new BoundedCache(100);
  }

  async executeQuery(dataQueryID, runtimeInputs, opts = {}) {
    const cacheKey = `${dataQueryID}|${JSON.stringify(runtimeInputs)}`;
    Logger.log("info", {
      message: "QueryEngine:executeQuery:start",
      params: { dataQueryID, runtimeInputs },
    });

    if (this.cache.has(cacheKey)) {
      Logger.log("info", {
        message: "QueryEngine:executeQuery:cacheHit",
        params: { dataQueryID },
      });
      return this.cache.get(cacheKey);
    }

    const query = await this.queryFetcher(dataQueryID);
    if (!query) {
      Logger.log("error", {
        message: "QueryEngine:executeQuery:queryNotFound",
        params: { dataQueryID },
      });
      throw new Error(`Query ${dataQueryID} not found`);
    }

    Logger.log("info", {
      message: "QueryEngine:executeQuery:fetchedQuery",
      params: { dataQueryID, query },
    });

    const resolvedTemplate = await this.resolveTemplate(
      query.dataQueryOptions,
      runtimeInputs,
      dataQueryID
    );
    Logger.log("info", {
      message: "QueryEngine:executeQuery:resolvedTemplate",
      params: { dataQueryID, resolvedTemplate },
    });

    const datasource = await this.getDataSource(query, dataQueryID);
    // Timeout precedence: per-node/per-workflow override (workflow node) >
    // the query's own dataQueryOptions.timeoutSeconds > platform default.
    const overrideSeconds = Number(opts?.timeoutSeconds);
    const timeoutSeconds = (Number.isFinite(overrideSeconds) && overrideSeconds > 0)
      ? Math.trunc(overrideSeconds)
      : (query.dataQueryOptions?.timeoutSeconds || constants.DEFAULTS.QUERY_TIMEOUT_SECONDS);
    const timeoutMs = timeoutSeconds * 1000;

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Query execution timed out after ${timeoutSeconds}s`)), timeoutMs);
    });

    let result = await Promise.race([
      datasource.execute(
        resolvedTemplate,
        {},
        {
          fileStorage: fileStorageUtil,
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

    this.cache.set(cacheKey, result);
    Logger.log("info", {
      message: "QueryEngine:executeQuery:executed",
      params: { dataQueryID, runtimeInputs },
    });
    return result;
  }

  async getDataSource(query, dataQueryID) {
    const cacheKey = `${query.datasourceType}_${query.datasourceID}`;

    Logger.log("info", {
      message: "QueryEngine:getDataSource:start",
      params: { dataQueryID, cacheKey },
    });

    if (this.dataSourceCache.has(cacheKey)) {
      Logger.log("info", {
        message: "QueryEngine:getDataSource:cacheHit",
        params: { dataQueryID },
      });
      return this.dataSourceCache.get(cacheKey);
    }

    let datasourceConfig;
    switch (query.datasourceType) {
      default:
        datasourceConfig = await this.datasourceFetcher(query.datasourceID);
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

    this.dataSourceCache.set(cacheKey, instance);
    Logger.log("info", {
      message: "QueryEngine:getDataSource:created",
      params: { dataQueryID, cacheKey },
    });
    return instance;
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

module.exports = { QueryEngine };
