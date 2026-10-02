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
      },
    },
    handler: async ({ search, page, pageSize } = {}, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await datasourceAPI.list({ search, page, pageSize });
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
      "Introspect a datasource — returns its TABLES and COLUMNS for SQL databases.\n\n" +
      "Returns (SQL datasources):\n" +
      "  { tables: [{ name, columns: [{ name, type, ... }] }, ...] } (exact key names come from the backend)\n" +
      "Returns (non-SQL datasources, e.g. restapi):\n" +
      "  { success: true, type: 'restapi', message: '...does not support database schema tables...',\n" +
      "    options: { ...connection config } } — the tool FALLS BACK automatically, this is not an error.\n\n" +
      "Use this BEFORE writing SQL for create_query — write queries against real table/column names,\n" +
      "never guessed ones. Also useful after create_datasource to confirm the connection sees the expected tables.\n\n" +
      "Example call:\n" +
      '  { "datasourceID": "d7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e" }\n\n' +
      "Typical flow: get_datasource_schema → get_datasource_sample_data → create_query.\n\n" +
      "Related: get_datasource_sample_data (preview rows), get_datasource (connection config).",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: {
          type: "string",
          description: "UUID of the datasource to introspect. Example: 'd7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e'.",
        },
      },
      required: ["datasourceID"],
    },
    handler: async ({ datasourceID }, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(datasourceID, "datasourceID");
      try {
        return await datasourceAPI.proxy(id, { action: "getSchema", params: {} });
      } catch (proxyErr) {
        // If the datasource type doesn't support schema introspection, fall back to config info
        const isUnsupported =
          proxyErr.message?.includes("not supported") ||
          proxyErr.message?.includes("getSchema") ||
          proxyErr.status === 400 ||
          proxyErr.status === 422;

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
        const isUnsupported =
          proxyErr.message?.includes("not supported") ||
          proxyErr.message?.includes("getSampleData") ||
          proxyErr.status === 400 ||
          proxyErr.status === 422;

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
      "Test whether a set of connection options can reach a datasource — WITHOUT saving anything.\n\n" +
      "Returns: the backend test result — typically { success, latencyMs?, ... } with latency when the\n" +
      "connection succeeds, and an error description when it fails.\n\n" +
      "Use this to validate credentials/options BEFORE create_datasource (creation does not test the\n" +
      "connection), or to diagnose a broken existing connection with modified options.\n" +
      "The options object is the same shape create_datasource expects for that datasourceType — if unsure,\n" +
      "call get_datasource_schemas first.\n\n" +
      "Example call 1 — PostgreSQL:\n" +
      '  { "datasourceType": "postgresql",\n' +
      '    "datasourceOptions": { "host": "db.example.com", "port": 5432, "database": "appdb",\n' +
      '                           "user": "readonly", "password": "secret", "ssl": true } }\n' +
      "Example call 2 — REST API:\n" +
      '  { "datasourceType": "restapi", "datasourceOptions": { "baseUrl": "https://api.example.com/v1",\n' +
      '                                                        "headers": { "Authorization": "Bearer xyz" } } }\n\n' +
      "Related: create_datasource, get_datasource_schemas.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceType: {
          type: "string",
          description:
            "Datasource type to test. Example: 'postgresql', 'mysql', 'mssql', 'restapi'.",
        },
        datasourceOptions: {
          type: "object",
          description:
            "Connection options for that type — same shape create_datasource expects:\n" +
            "  postgresql/mysql/mssql: { host, port, database, user, password, ssl? }\n" +
            "  restapi: { baseUrl, headers?, authType? }",
        },
      },
      required: ["datasourceType", "datasourceOptions"],
    },
    handler: async ({ datasourceType, datasourceOptions }, context) => {
      const { datasourceAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return datasourceAPI.test({ datasourceType, datasourceOptions });
    },
  },

  {
    name: "create_datasource",
    description:
      "Create a NEW datasource connection in the tenant.\n\n" +
      "Returns: the created datasource object including its new datasourceID (a UUID — you will need it\n" +
      "for create_query, get_datasource_schema, etc.).\n\n" +
      "IMPORTANT:\n" +
      "  - Creation does NOT validate credentials. Call test_datasource_connection FIRST with the same\n" +
      "    options; only create after it succeeds.\n" +
      "  - Check for an existing datasource first (get_tenant_resource_summary or list_datasources) —\n" +
      "    duplicate connections to the same database are a common mistake.\n" +
      "  - Supported types: 'postgresql', 'mysql', 'mssql', 'restapi'. For other connection types, the\n" +
      "    datasource must be created via the Jet Admin UI.\n" +
      "  - If unsure about required options fields, call get_datasource_schemas.\n\n" +
      "Example call — PostgreSQL:\n" +
      '  { "datasourceTitle": "Production PostgreSQL",\n' +
      '    "datasourceType": "postgresql",\n' +
      '    "datasourceOptions": { "host": "db.example.com", "port": 5432, "database": "appdb",\n' +
      '                           "user": "readonly", "password": "secret", "ssl": true },\n' +
      '    "datasourceTags": ["production", "primary"] }\n' +
      "Example call — REST API:\n" +
      '  { "datasourceTitle": "Stripe API",\n' +
      '    "datasourceType": "restapi",\n' +
      '    "datasourceOptions": { "baseUrl": "https://api.stripe.com/v1",\n' +
      '                           "headers": { "Authorization": "Bearer sk_live_..." } } }\n\n' +
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
          enum: ["postgresql", "mysql", "mssql", "restapi"],
          description:
            "Datasource type. Must be one of: postgresql, mysql, mssql, restapi. Example: 'postgresql'.",
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
      "Example call — rotate the DB password:\n" +
      '  { "datasourceID": "d7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e",\n' +
      '    "datasourceOptions": { "host": "db.example.com", "port": 5432, "database": "appdb",\n' +
      '                           "user": "readonly", "password": "newSecret", "ssl": true } }\n' +
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
