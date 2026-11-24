// File: packages/mcp-server/src/tools/datasource.tools.js (javascript)
/**
 * datasource.tools.js
 *
 * Each handler receives (args, context) where:
 *   context.tenantId  — the tenant to operate on
 *   context.apiKey    — the API key for authentication
 *
 * The client is instantiated per-call — no shared state.
 */

import { createApiClient } from "../client.js";
import { safeArray, trimId } from "../utils.js";

export const datasourceTools = [
  {
    name: "list_datasources",
    description:
      "List datasources configured in this Jet Admin tenant.\n\n" +
      "Returns: { datasources: [{ datasourceID, title, type, createdAt, tags }], totalCount }.\n" +
      "datasourceID (UUID) is the handle every other datasource tool and create_query expect.\n\n" +
      "Use this when you need a datasource ID and get_tenant_resource_summary was not called, or when you\n" +
      "want pagination/filtering over many datasources. Prefer get_tenant_resource_summary as the first\n" +
      "call of a session — it covers this plus all other resource types.\n\n" +
      "Example call 1 — first page, 20 per page:\n" +
      '  { "page": 1, "pageSize": 20 }\n' +
      "Example call 2 — find PostgreSQL datasources by title/type:\n" +
      '  { "search": "postgres" }\n\n' +
      "Related: get_datasource, create_datasource, search_resources.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description:
            "Optional. Filter datasources by title or type. " +
            "Example: 'production', 'postgres', 'stripe'.",
        },
        page: { type: "number", description: "Page number (1-based). Default 1. Example: 1." },
        pageSize: { type: "number", description: "Results per page (max 100). Default 20. Example: 20." },
        folderID: { type: "string", description: "Optional. Filter by folder UUID (see list_folders with entityType datasource)." },
      },
    },
    handler: async ({ search, page, pageSize, folderID } = {}, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await datasourceAPI.list({ search, page, pageSize, folderID });
      const datasources = safeArray(data, "datasources");

      return {
        datasources: datasources.map((ds) => ({
          datasourceID: ds.datasourceID,
          title: ds.datasourceTitle,
          type: ds.datasourceType,
          createdAt: ds.createdAt,
          tags: ds.datasourceTags,
        })),
        totalCount: data?.totalCount ?? datasources.length,
      };
    },
  },

  {
    name: "get_datasource",
    description:
      "Get a single datasource by ID including its FULL connection configuration.\n\n" +
      "Returns: { datasourceID, title, type, tags, createdAt, options } where options is the\n" +
      "datasourceOptions object (host, port, database / baseUrl, headers, etc.).\n\n" +
      "Use this when:\n" +
      "  - You need the exact connection settings of an existing datasource (e.g. to clone it or to\n" +
      "    reuse its options in test_datasource_connection)\n" +
      "  - create_query fails and you want to verify the datasource the query points at\n\n" +
      "NOTE: options may contain credentials — do not print secrets back to the user in full.\n\n" +
      "Example call:\n" +
      '  { "datasourceID": "d7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e" }\n\n' +
      "If you get 'Datasource not found', the ID is wrong or belongs to another tenant — call\n" +
      "list_datasources to get valid IDs.\n\n" +
      "Related: get_datasource_schema (tables/columns), get_datasource_sample_data (rows).",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: {
          type: "string",
          description: "UUID of the datasource. Get it from list_datasources or get_tenant_resource_summary. " +
            "Example: 'd7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e'.",
        },
      },
      required: ["datasourceID"],
    },
    handler: async ({ datasourceID }, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const dsResult = await datasourceAPI.getById(trimId(datasourceID, "datasourceID"));
      const ds = dsResult?.datasource || dsResult;
      if (!ds) throw new Error(`Datasource not found: ${datasourceID}`);
      return {
        datasourceID: ds.datasourceID,
        title: ds.datasourceTitle,
        type: ds.datasourceType,
        tags: ds.datasourceTags,
        createdAt: ds.createdAt,
        options: ds.datasourceOptions,
      };
    },
  },

  {
    name: "get_datasource_schema",
    description:
      "Introspect a datasource — list its TABLES, then fetch COLUMNS for one table.\n\n" +
      "SQL datasources:\n" +
      "  - call with datasourceID only → { tables: [{ tableName, columnCount }], totalCount, hint }\n" +
      "  - call with datasourceID + table → { table: '<name>', columns: [...] } (full column details)\n" +
      "This avoids dumping thousands of columns at once. Table names are exact.\n\n" +
      "Non-SQL datasources (e.g. restapi) fall back to connection config with an explanatory message — not an error.\n\n" +
      "Use this BEFORE writing SQL for create_query — write queries against real table/column names, never guessed ones.\n\n" +
      "Example call 1 — list tables:\n" +
      '  { "datasourceID": "d7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e" }\n' +
      "Example call 2 — columns of one table:\n" +
      '  { "datasourceID": "d7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e", "table": "orders" }\n\n' +
      "Typical flow: get_datasource_schema (table) → get_datasource_sample_data → create_query.\n\n" +
      "Related: get_datasource_sample_data (preview rows), get_datasource (connection config).",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: {
          type: "string",
          description: "UUID of the datasource to introspect. Example: 'd7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e'.",
        },
        table: {
          type: "string",
          description: "Optional. Exact table name to return full columns for. Omit to list table names + column counts.",
        },
      },
      required: ["datasourceID"],
    },
    handler: async ({ datasourceID, table }, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(datasourceID, "datasourceID");
      try {
        const res = await datasourceAPI.proxy(id, { action: "getSchema", params: {} });
        const tables = res?.result?.tables || res?.tables || [];
        if (table) {
          const found = tables.find((t) => (t.tableName || t.name) === table);
          if (!found) {
            throw Object.assign(
              new Error(`Table '${table}' not found. Available tables: ${tables.map((t) => t.tableName || t.name).slice(0, 30).join(", ")}`),
              { code: "TABLE_NOT_FOUND", details: { table, available: tables.map((t) => t.tableName || t.name) } }
            );
          }
          return {
            datasourceID: id,
            table: found.tableName || found.name,
            columnCount: (found.columns || []).length,
            columns: found.columns || [],
          };
        }
        return {
          datasourceID: id,
          tables: tables.map((t) => ({ tableName: t.tableName || t.name, columnCount: (t.columns || []).length })),
          totalCount: tables.length,
          hint: "Pass table:'<name>' to get the full column list for one table.",
        };
      } catch (proxyErr) {
        // If the datasource type doesn't support schema introspection, fall back to config info.
        // NOTE: the backend proxy answers ALL action failures with HTTP 400, so status
        // codes must NOT trigger the fallback — only messages stating the action is
        // unsupported/not allowed. Anything else (auth, timeout, SQL errors) is rethrown
        // so the real cause surfaces instead of a misleading "does not support" message.
        const msg = proxyErr.message || "";
        const isUnsupported =
          msg.includes("not supported") ||
          msg.includes("not allowed") ||
          msg.includes("is not supported or allowed");

        if (isUnsupported) {
          try {
            const dsResult = await datasourceAPI.getById(id);
            const ds = dsResult?.datasource || dsResult;
            if (!ds) throw new Error(`Datasource not found: ${datasourceID}`);
            return {
              success: true,
              datasourceID: ds.datasourceID,
              title: ds.datasourceTitle,
              type: ds.datasourceType,
              message: `This datasource of type '${ds.datasourceType}' does not support database schema tables. Returning connection configuration to predict behaviour.`,
              options: ds.datasourceOptions,
            };
          } catch (fetchErr) {
            // Surface the original proxy error rather than the fallback error
            throw new Error(
              `Schema introspection failed (${proxyErr.message}). ` +
                `Also failed to retrieve config as fallback: ${fetchErr.message}`
            );
          }
        }
        throw proxyErr;
      }
    },
  },

  {
    name: "get_datasource_sample_data",
    description:
      "Preview actual ROWS from one table of a datasource — the fastest way to learn the data shape\n" +
      "and real values before building queries, widgets, or pages.\n\n" +
      "Returns: the sampled rows (up to `limit`, default 5, max 50) from the given table.\n" +
      "For non-SQL datasources it falls back to returning the connection config with an explanatory\n" +
      "message — that fallback is not an error.\n\n" +
      "Use this when:\n" +
      "  - Deciding what a widget/chart should display and how values are formatted\n" +
      "  - Verifying a column contains the values the user described ('status' really has 'refunded' rows)\n" +
      "  - Choosing sensible defaults for page variables or query input arguments\n\n" +
      "Example call:\n" +
      '  { "datasourceID": "d7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e", "table": "orders", "limit": 10 }\n\n' +
      "Typical flow: get_datasource_schema (tables/columns) → get_datasource_sample_data → create_query.\n\n" +
      "Related: get_datasource_schema, create_query, test_query_by_data.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: {
          type: "string",
          description: "UUID of the datasource. Example: 'd7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e'.",
        },
        table: {
          type: "string",
          description: "Exact table name (use get_datasource_schema to find valid names). Example: 'orders'.",
        },
        limit: {
          type: "number",
          description: "Rows to return, clamped to 1–50. Default 5. Example: 10.",
        },
      },
      required: ["datasourceID", "table"],
    },
    handler: async ({ datasourceID, table, limit = 5 }, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(datasourceID, "datasourceID");
      try {
        return await datasourceAPI.proxy(id, {
          action: "getSampleData",
          params: { table, limit: Math.min(limit, 50) },
        });
      } catch (proxyErr) {
        // Same rule as get_datasource_schema above: HTTP 400 is the proxy's generic
        // failure status, so only unsupported-action messages trigger the fallback.
        const msg = proxyErr.message || "";
        const isUnsupported =
          msg.includes("not supported") ||
          msg.includes("not allowed") ||
          msg.includes("is not supported or allowed");

        if (isUnsupported) {
          try {
            const dsResult = await datasourceAPI.getById(id);
            const ds = dsResult?.datasource || dsResult;
            if (!ds) throw new Error(`Datasource not found: ${datasourceID}`);
            return {
              success: true,
              datasourceID: ds.datasourceID,
              title: ds.datasourceTitle,
              type: ds.datasourceType,
              message: `This datasource of type '${ds.datasourceType}' does not support sample data fetching for tables. Returning connection configuration to predict behaviour.`,
              options: ds.datasourceOptions,
            };
          } catch (fetchErr) {
            throw new Error(
              `Sample data fetch failed (${proxyErr.message}). ` +
                `Also failed to retrieve config as fallback: ${fetchErr.message}`
            );
          }
        }
        throw proxyErr;
      }
    },
  },

  {
    name: "test_datasource_connection",
    description:
      "Test whether candidate connection options can reach the backend - WITHOUT saving anything.\n\n" +
      "Pass datasourceType + datasourceOptions (the same shape create_datasource expects; get it from\n" +
      "get_datasource_schemas).\n\n" +
      "Returns the backend test result with large response bodies truncated to bodyPreview/bodyLength.\n" +
      "SCOPE: host reachability ONLY. For restapi, success:true on a bare baseUrl does NOT prove any API\n" +
      "endpoint serves JSON (an SPA shell also returns 200 HTML). For endpoint validation use\n" +
      "test_datasource_json_endpoint with a testPath instead.\n\n" +
      "NOTE: saved datasource options may be encrypted at rest, so this tool cannot reliably health-check an\n" +
      "existing datasource by replaying its stored options. Use a read-only test query (test_query_by_data)\n" +
      "against a known-good table instead, or re-enter the options.\n\n" +
      "Example - candidate REST API reachability:\n" +
      '  { "datasourceType": "restapi", "datasourceOptions": { "baseUrl": "https://api.example.com/v1",\n' +
      '      "timeout": 10, "authType": "none", "headers": [], "queryParams": [],\n' +
      '      "contentType": "application/json", "followRedirects": true, "sslVerify": true } }\n\n' +
      "Related: test_datasource_json_endpoint, create_datasource, get_datasource_schemas, list_datasources.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceType: {
          type: "string",
          description: "Datasource type from list_datasource_types. Required.",
        },
        datasourceOptions: {
          type: "object",
          description: "Connection options - same shape create_datasource expects. Required.",
        },
      },
      required: ["datasourceType", "datasourceOptions"],
    },
    handler: async ({ datasourceType, datasourceOptions }, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      if (!datasourceType || !datasourceOptions) {
        throw Object.assign(new Error("datasourceType and datasourceOptions are required."), { code: "TEST_INPUT_REQUIRED" });
      }
      const result = await datasourceAPI.test({ datasourceType, datasourceOptions });
      const cr = result?.connectionResult || result;
      if (cr && typeof cr.body === "string" && cr.body.length > 500) {
        const preview = cr.body.slice(0, 500);
        cr.bodyPreview = preview;
        cr.bodyLength = cr.body.length;
        cr.bodyTruncated = true;
        cr.looksLikeHtml = /^\s*</.test(preview) || /<html/i.test(preview);
        delete cr.body;
      }
      return { ...result, connectionResult: cr, source: "inline" };
    },
  },
  {
    name: "test_datasource_json_endpoint",
    description:
      "Validate that a restapi baseUrl + path serves parseable JSON — WITHOUT saving anything.\n\n" +
      "Separate from test_datasource_connection (reachability): hits baseUrl+testPath with the datasource's\n" +
      "headers/auth and returns { ok, validatedJson, status, topLevelKeys, bodyPreview, warning }.\n" +
      "validatedJson:false with HTML body means you hit an SPA shell, not the API — fix the path.\n\n" +
      "Example: { \"datasourceType\": \"restapi\", \"datasourceOptions\": { \"baseUrl\": \"https://api.example.com\" },\n" +
      '  "testPath": "/health" }\n\n' +
      "Related: test_datasource_connection, test_query_by_data.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceType: {
          type: "string",
          description: "Must be 'restapi' (other types rejected with a clear error).",
        },
        datasourceOptions: {
          type: "object",
          description: "restapi connection options (baseUrl, timeout?, authType?, headers?, queryParams?, ...).",
        },
        testPath: {
          type: "string",
          description: "API path appended to baseUrl (e.g. '/health', '/indicators/...').",
        },
        testMethod: {
          type: "string",
          description: "Optional: 'GET' (default) or 'HEAD'.",
        },
      },
      required: ["datasourceType", "datasourceOptions", "testPath"],
    },
    handler: async ({ datasourceType, datasourceOptions, testPath, testMethod }, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return datasourceAPI.testJson({ datasourceType, datasourceOptions, testPath, testMethod });
    },
  },

  {
    name: "create_datasource",
    description:
      "Create a NEW datasource connection in the tenant.\n\n" +
      "Returns: the created datasource object including its new datasourceID (a UUID — you will need it\n" +
      "for create_query, get_datasource_schema, etc.).\n\n" +
      "IMPORTANT:\n" +
      "  - Call list_datasource_types FIRST for the full 35-type catalog; call get_datasource_schemas for the\n" +
      "    live connection shape of the type you picked.\n" +
      "  - Creation does NOT validate credentials. Call test_datasource_connection FIRST with the same\n" +
      "    options; only create after it succeeds.\n" +
      "  - Check for an existing datasource first (get_tenant_resource_summary or list_datasources) —\n" +
      "    duplicate connections to the same database are a common mistake.\n\n" +
      "Example call — PostgreSQL (use get_datasource_schemas for the full shape):\n" +
      '  { "datasourceTitle": "Production PostgreSQL",\n' +
      '    "datasourceType": "postgresql",\n' +
      '    "datasourceOptions": { "connectionOption": "connectionString",\n' +
      '                           "connectionString": "postgresql://readonly:secret@db.example.com:5432/appdb?sslmode=require" },\n' +
      '    "datasourceTags": ["production", "primary"] }\n' +
      "Example call — REST API:\n" +
      '  { "datasourceTitle": "Stripe API",\n' +
      '    "datasourceType": "restapi",\n' +
      '    "datasourceOptions": { "baseUrl": "https://api.stripe.com/v1", "timeout": 10, "authType": "none",\n' +
      '                           "headers": [], "queryParams": [], "contentType": "application/json",\n' +
      '                           "followRedirects": true, "sslVerify": true } }\n\n' +
      "After creating: get_datasource_schema to confirm tables are visible, then create_query.\n\n" +
      "Related: test_datasource_connection, get_datasource_schema, create_query, delete_datasource.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceTitle: {
          type: "string",
          description: "Human-readable name shown in the Jet Admin UI. Example: 'Production PostgreSQL'.",
        },
        datasourceType: {
          type: "string",
          description:
            "Datasource type from list_datasource_types (35 values, e.g. 'postgresql', 'mongodb', 'stripe', 'kafka', 'restapi'). Example: 'postgresql'.",
        },
        datasourceOptions: {
          type: "object",
          description:
            "Connection configuration, shape depends on datasourceType:\n" +
            "  postgresql/mysql/mssql: { host, port, database, user, password, ssl? }\n" +
            "  restapi: { baseUrl, headers?, authType? }\n" +
            "Example: { host: 'db.example.com', port: 5432, database: 'appdb', user: 'readonly', password: 'secret' }",
        },
        datasourceTags: {
          type: "array",
          items: { type: "string" },
          description: "Optional tags for organization. Example: [\"production\", \"primary\"].",
        },
      },
      required: ["datasourceTitle", "datasourceType", "datasourceOptions"],
    },
    handler: async ({ datasourceTitle, datasourceType, datasourceOptions, datasourceTags }, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const result = await datasourceAPI.create({
        datasourceTitle,
        datasourceType,
        datasourceOptions,
        datasourceTags: datasourceTags || [],
      });
      if (!result) throw new Error("Datasource creation returned no data.");
      return result;
    },
  },

  {
    name: "update_datasource",
    description:
      "Update an existing datasource's title, type, connection options, or tags.\n\n" +
      "Returns: { success: true, datasourceID }.\n\n" +
      "Use this to fix a broken connection (e.g. rotated password), rename a datasource, or change its tags.\n" +
      "Only the fields you pass are changed. After updating connection options, call\n" +
      "test_datasource_connection (or get_datasource_schema) to confirm the connection still works.\n\n" +
      "Example call — rotate the DB connection string (send COMPLETE options):\n" +
      '  { "datasourceID": "d7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e",\n' +
      '    "datasourceType": "postgresql",\n' +
      '    "datasourceOptions": { "connectionOption": "connectionString",\n' +
      '      "connectionString": "postgresql://readonly:newSecret@db.example.com:5432/appdb?sslmode=require" } }\n' +
      "Example call — rename and re-tag:\n" +
      '  { "datasourceID": "d7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e",\n' +
      '    "datasourceTitle": "Analytics DB", "datasourceTags": ["analytics"] }\n\n' +
      "Related: get_datasource (current values), test_datasource_connection.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: {
          type: "string",
          description: "UUID of the datasource to update. Example: 'd7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e'.",
        },
        datasourceTitle: { type: "string", description: "Optional. New title. Example: 'Analytics DB'." },
        datasourceType: { type: "string", description: "Optional. New type. Example: 'postgresql'." },
        datasourceOptions: {
          type: "object",
          description: "Optional. New connection options — same shape as create_datasource. " +
            "Pass the COMPLETE options object (host/port/database/user/password/ssl), not a partial one.",
        },
        datasourceTags: {
          type: "array",
          items: { type: "string" },
          description: "Optional. Replacement tag list. Example: [\"analytics\"].",
        },
      },
      required: ["datasourceID"],
    },
    handler: async ({ datasourceID, ...updates }, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(datasourceID, "datasourceID");
      // Backend requires datasourceType + datasourceOptions on update — backfill
      // current values for any required field the caller omitted (title-only renames).
      if (updates.datasourceType === undefined || updates.datasourceOptions === undefined) {
        const current = await datasourceAPI.getById(id);
        const ds = current?.datasource || current;
        if (updates.datasourceType === undefined && ds?.datasourceType) updates.datasourceType = ds.datasourceType;
        if (updates.datasourceOptions === undefined && ds?.datasourceOptions) updates.datasourceOptions = ds.datasourceOptions;
      }
      await datasourceAPI.update(id, updates);
      return { success: true, datasourceID: id };
    },
  },

  {
    name: "delete_datasource",
    description:
      "PERMANENTLY delete a datasource.\n\n" +
      "Returns: { success: true, deleted: { datasourceID } }.\n\n" +
      "DESTRUCTIVE — cascade-deletes all queries that depend on this datasource, which in turn breaks\n" +
      "any App Pages using those queries. Before calling:\n" +
      "  1. Confirm with the user explicitly.\n" +
      "  2. Optionally check impact: list_queries and look for queries whose datasourceID matches.\n\n" +
      "Example call:\n" +
      '  { "datasourceID": "d7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e" }\n\n' +
      "Related: delete_query, list_queries.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: {
          type: "string",
          description: "UUID of the datasource to delete. Example: 'd7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e'.",
        },
      },
      required: ["datasourceID"],
    },
    handler: async ({ datasourceID }, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await datasourceAPI.delete(trimId(datasourceID, "datasourceID"));
      return { success: true, deleted: { datasourceID } };
    },
  },
];
