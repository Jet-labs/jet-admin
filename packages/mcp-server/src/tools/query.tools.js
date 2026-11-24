// File: packages/mcp-server/src/tools/query.tools.js (javascript)
/**
 * query.tools.js — context-aware, multi-tenant ready
 * Handler signature: async (args, context) where context = { tenantId, apiKey }
 */

import { createApiClient } from "../client.js";
import { safeArray, trimId, summarizeRows } from "../utils.js";

export const queryTools = [
  {
    name: "list_queries",
    description:
      "List saved data queries in this Jet Admin tenant.\n\n" +
      "Returns: { queries: [{ dataQueryID, title, datasourceType, datasourceID, runOnLoad, createdAt }], totalCount }.\n" +
      "dataQueryID (UUID) is the handle for get_query, test_query, run_query, update_query, delete_query,\n" +
      "and for binding the query to App Pages.\n\n" +
      "Use this before creating a new query (avoid duplicates), or when you need the ID of a query the\n" +
      "user referred to by name. Prefer get_tenant_resource_summary as the first call of a session.\n\n" +
      "Example call 1 — list all:\n" +
      "  {}\n" +
      "Example call 2 — filter by title:\n" +
      '  { "search": "refund", "pageSize": 20 }\n\n' +
      "Related: get_query (full config), create_query, search_resources.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Optional. Filter by title or datasource type. Example: 'refund', 'postgresql'.",
        },
        page: { type: "number", description: "Page number (1-based). Default 1. Example: 1." },
        pageSize: { type: "number", description: "Results per page (max 100). Default 20. Example: 20." },
      },
    },
    handler: async ({ search, page, pageSize } = {}, context) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await queryAPI.list({ search, page, pageSize });
      const queries = safeArray(data, "dataQueries");

      return {
        queries: queries.map((q) => ({
          dataQueryID: q.dataQueryID,
          title: q.dataQueryTitle,
          datasourceType: q.datasourceType,
          datasourceID: q.datasourceID,
          runOnLoad: q.runOnLoad,
          createdAt: q.createdAt,
        })),
        totalCount: data?.totalCount ?? queries.length,
      };
    },
  },

  {
    name: "get_query",
    description:
      "Get the FULL configuration of a saved query by ID.\n\n" +
      "Returns: { dataQueryID, title, description, datasourceID, datasourceType, runOnLoad,\n" +
      "  options: { ... the SQL / REST config exactly as it will run }, datasource: { datasourceID, title, type } }.\n\n" +
      "Use this when:\n" +
      "  - You need to see the exact SQL or REST config of an existing query (e.g. before update_query,\n" +
      "    so you can send the modified options rather than guessing the current ones)\n" +
      "  - A widget/page referencing the query returns wrong data and you need to inspect what it runs\n" +
      "  - You want a working example of dataQueryOptions to base a new query on\n\n" +
      "Example call:\n" +
      '  { "dataQueryID": "9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c" }\n\n' +
      "Related: update_query, test_query, list_queries.",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryID: {
          type: "string",
          description: "UUID of the query. Get it from list_queries or get_tenant_resource_summary. " +
            "Example: '9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c'.",
        },
      },
      required: ["dataQueryID"],
    },
    handler: async ({ dataQueryID }, context) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await queryAPI.getById(trimId(dataQueryID, "dataQueryID"));
      const q = res?.dataQuery || res;
      if (!q) throw new Error(`Query not found: ${dataQueryID}`);
      return {
        dataQueryID: q.dataQueryID,
        title: q.dataQueryTitle,
        description: q.dataQueryDescription,
        datasourceID: q.datasourceID,
        datasourceType: q.datasourceType,
        runOnLoad: q.runOnLoad,
        options: q.dataQueryOptions,
        datasource: q.tblDatasources
          ? {
              datasourceID: q.tblDatasources.datasourceID,
              title: q.tblDatasources.datasourceTitle,
              type: q.tblDatasources.datasourceType,
            }
          : null,
      };
    },
  },

  {
    name: "create_query",
    description:
      "Create a NEW saved data query.\n\n" +
      "Returns: the created query object including its new dataQueryID (UUID — needed for test_query,\n" +
      "run_query, and App Page data source bindings).\n\n" +
      "The query is saved but NOT executed — always call test_query (with real input values) afterwards\n" +
      "to verify it returns the expected data.\n\n" +
      "Before creating:\n" +
      "  1. Check list_queries / get_tenant_resource_summary for an existing equivalent query.\n" +
      "  2. For SQL, use real table/column names — get them from get_datasource_schema, never guess.\n\n" +
      "dataQueryOptions shape by datasourceType (BACKEND TRUTH — from get_data_query_schemas, not the legacy below):\n" +
      "  postgresql/mysql/mssql/sqlite/cockroachdb/oracle: { queryType: 'query', query: 'SELECT ... WHERE x = {{inputs.name}}', inputDefinitions?: [{ key, type }] }\n" +
      "    — inputDefinitions declares params substituted at run time via inputValues. Template refs use\n" +
      "    {{inputs.<key>}} inside apiEndpoint/query/body. Legacy {sql,inputArgs} is NOT accepted — use query/inputDefinitions.\n" +
      "  restapi: { apiEndpoint: '/resource', method: 'GET'|'POST'|'PUT'|'DELETE'|'PATCH', headers?: [{key,value}],\n" +
      "             body?, queryParams?: [{key,value}], contentType?, inputDefinitions?: [{key,type}] }\n" +
      "    — apiEndpoint is relative to the datasource baseUrl. For path params with slashes/URLs use\n" +
      "    encodeURIComponent in the template, e.g. /indicators/url/{{encodeURIComponent(inputs.url)}}/general.\n" +
      "    Legacy {method,path,...} is NOT accepted — use apiEndpoint/inputDefinitions.\n" +
      "If unsure of the exact schema, call get_data_query_schemas (all or per-type) and copy a get_query example.\n\n" +
      "Example call 1 — parameterized PostgreSQL query (backend shape):\n" +
      '  { "dataQueryTitle": "orders_by_status",\n' +
      '    "datasourceID": "d7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e",\n' +
      '    "datasourceType": "postgresql",\n' +
      '    "dataQueryOptions": {\n' +
      '      "queryType": "query",\n' +
      '      "query": "SELECT id, customer_name, status, total FROM orders WHERE status = {{inputs.status}} ORDER BY created_at DESC",\n' +
      '      "inputDefinitions": [{ "key": "status", "type": "string" }] },\n' +
      '    "runOnLoad": true }\n' +
      "Example call 2 — REST API query (backend shape):\n" +
      '  { "dataQueryTitle": "stripe_recent_charges",\n' +
      '    "datasourceID": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6f",\n' +
      '    "datasourceType": "restapi",\n' +
      '    "dataQueryOptions": { "method": "GET", "apiEndpoint": "/charges", "queryParams": [{ "key": "limit", "value": "50" }] } }\n\n' +
      "Typical flow: create_query → test_query → create_widget → create_app_page / update_app_page.\n\n" +
      "Related: test_query, test_query_by_data (try without saving), get_query, delete_query.",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryTitle: {
          type: "string",
          description: "Human-readable name, snake_case recommended. Example: 'orders_by_status'.",
        },
        datasourceID: {
          type: "string",
          description: "UUID of the datasource to run against. Get it from list_datasources. " +
            "Example: 'd7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e'.",
        },
        datasourceType: {
          type: "string",
          description: "Type of the datasource — must match it. Example: 'postgresql', 'restapi'.",
        },
        dataQueryOptions: {
          type: "object",
          description:
            "Query configuration, BACKEND shape (see tool description):\n" +
            "  SQL: { queryType: 'query', query: 'SELECT ... {{inputs.x}}', inputDefinitions?: [{ key, type }] }\n" +
            "  restapi: { apiEndpoint, method, headers?, body?, queryParams?, inputDefinitions? }\n" +
            "Example: { queryType: 'query', query: 'SELECT ...', inputDefinitions: [{ key: 'status', type: 'string' }] }",
        },
        runOnLoad: {
          type: "boolean",
          description: "If true the query auto-runs when an App Page loads. Prefer one auto query per page intent; " +
            "extra manual queries run via EXECUTE_QUERY. See create_app_page triggerMode/refreshOn mapping. Default false.",
        },
      },
      required: ["dataQueryTitle", "datasourceType"],
    },
    handler: async (
      { dataQueryTitle, datasourceID, datasourceType, dataQueryOptions, runOnLoad = false },
      context
    ) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const result = await queryAPI.create({
        dataQueryTitle,
        datasourceID: datasourceID ? trimId(datasourceID, "datasourceID") : undefined,
        datasourceType,
        dataQueryOptions,
        runOnLoad,
      });
      return result;
    },
  },

  {
    name: "update_query",
    description:
      "Update an existing saved query's title, datasource binding, options, or runOnLoad.\n\n" +
      "Returns: { success: true, dataQueryID }.\n\n" +
      "IMPORTANT: dataQueryOptions replaces the query configuration wholesale for the fields the backend\n" +
      "uses — when editing SQL or REST config, first call get_query to read the current options, then send\n" +
      "the complete modified object, not a fragment.\n" +
      "After updating, call test_query to confirm the query still returns valid data.\n\n" +
      "Example call — fix a WHERE clause:\n" +
      '  { "dataQueryID": "9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c",\n' +
      '    "dataQueryOptions": {\n' +
      '      "sql": "SELECT id, status, total FROM orders WHERE status = $1 AND total > 0",\n' +
      '      "inputArgs": [{ "name": "status", "type": "string" }] } }\n\n' +
      "Related: get_query (read current config first), test_query.",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryID: {
          type: "string",
          description: "UUID of the query to update. Example: '9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c'.",
        },
        dataQueryTitle: { type: "string", description: "REQUIRED by the backend. Always send the existing title for a title-less edit (read it with get_query) — this tool backfills it in code, but the API rejects an omitted title." },
        datasourceID: { type: "string", description: "Optional. New datasource UUID to run against." },
        datasourceType: { type: "string", description: "Optional. New datasource type. Example: 'postgresql'." },
        dataQueryOptions: {
          type: "object",
          description: "Optional. Replacement query config — send the COMPLETE object (see create_query for shape).",
        },
        runOnLoad: { type: "boolean", description: "Optional. Whether the query runs on App Page load." },
      },
      required: ["dataQueryID"],
    },
    handler: async ({ dataQueryID, ...updates }, context) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(dataQueryID, "dataQueryID");
      // Backend requires dataQueryOptions on update — backfill current values
      // for any required field the caller omitted (title-only renames).
      if (updates.dataQueryOptions === undefined || updates.datasourceID === undefined || updates.datasourceType === undefined) {
        const current = await queryAPI.getById(id);
        const q = current?.dataQuery || current;
        if (updates.dataQueryOptions === undefined && q?.dataQueryOptions) updates.dataQueryOptions = q.dataQueryOptions;
        if (updates.datasourceID === undefined && q?.datasourceID) updates.datasourceID = q.datasourceID;
        if (updates.datasourceType === undefined && q?.datasourceType) updates.datasourceType = q.datasourceType;
      }
      await queryAPI.update(id, updates);
      return { success: true, dataQueryID: id };
    },
  },

  {
    name: "delete_query",
    description:
      "PERMANENTLY delete a saved query.\n\n" +
      "Returns: { success: true, deleted: { dataQueryID } }.\n\n" +
      "DESTRUCTIVE — App Pages that bind this query as a data source will break (missing data / errors).\n" +
      "Before calling: confirm with the user, and optionally check impact via list_app_pages + get_app_page\n" +
      "to find pages whose dataSources reference this queryID.\n\n" +
      "Example call:\n" +
      '  { "dataQueryID": "9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c" }\n\n' +
      "Related: update_query, list_app_pages.",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryID: {
          type: "string",
          description: "UUID of the query to delete. Example: '9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c'.",
        },
      },
      required: ["dataQueryID"],
    },
    handler: async ({ dataQueryID }, context) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await queryAPI.delete(trimId(dataQueryID, "dataQueryID"));
      return { success: true, deleted: { dataQueryID } };
    },
  },

  {
    name: "test_query",
    description:
      "Execute a SAVED query with test input values WITHOUT persisting any results the query itself writes.\n" +
      "Returns the result data and row count.\n\n" +
      "Use this:\n" +
      "  - Immediately after create_query or update_query to validate the query works\n" +
      "  - With realistic inputValues to check parameterization behaves as expected\n" +
      "If the query declares inputDefinitions, pass a value for each key in inputValues.\n\n" +
      "Large payloads: pass maxRows (e.g. 50) to get { totalCount, truncated, rows } instead of the full\n" +
      "array — avoids MCP output truncation on 200KB+ responses. Prefer narrow queries (limit/filter) first.\n\n" +
      "Example call:\n" +
      '  { "dataQueryID": "9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c",\n' +
      '    "inputValues": { "status": "refunded" }, "maxRows": 50 }\n\n' +
      "Prefer test_query over run_query for validation — run_query is for actual reads during normal\n" +
      "operation. For write operations (INSERT/UPDATE/DELETE, POST/PUT), confirm with the user first.\n\n" +
      "Related: run_query, test_query_by_data (test unsaved config), create_query.",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryID: {
          type: "string",
          description: "UUID of the saved query. Example: '9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c'.",
        },
        inputValues: {
          type: "object",
          description: "Map of input argument names to values, one per inputDefinition key. " +
            "Example: { status: 'refunded', minTotal: 100 }.",
        },
        maxRows: {
          type: "number",
          description: "Optional row cap (1-1000) to avoid truncation. Returns summary envelope when capped.",
        },
      },
      required: ["dataQueryID"],
    },
    handler: async ({ dataQueryID, inputValues = {}, maxRows }, context) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await queryAPI.test(trimId(dataQueryID, "dataQueryID"), { inputValues });
      return summarizeRows(res, maxRows);
    },
  },

  {
    name: "run_query",
    description:
      "Execute a saved query and return its results — for READ operations (SELECT, GET).\n\n" +
      "Returns: the query result data. Pass maxRows to cap large responses (see test_query).\n\n" +
      "Use this to fetch live data for the user during normal operation (e.g. 'show me the latest orders').\n" +
      "For validation during development use test_query instead. For write operations (INSERT, UPDATE,\n" +
      "DELETE, POST/PUT/DELETE on REST), confirm with the user BEFORE running.\n\n" +
      "Example call:\n" +
      '  { "dataQueryID": "9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c",\n' +
      '    "inputValues": { "status": "pending" }, "maxRows": 50 }\n\n' +
      "Related: test_query, execute_workflow (for side-effecting operations).",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryID: {
          type: "string",
          description: "UUID of the saved query. Example: '9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c'.",
        },
        inputValues: {
          type: "object",
          description: "Map of input argument names to values. Example: { status: 'pending' }.",
        },
        maxRows: {
          type: "number",
          description: "Optional row cap (1-1000) to avoid truncation.",
        },
      },
      required: ["dataQueryID"],
    },
    handler: async ({ dataQueryID, inputValues = {}, maxRows }, context) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await queryAPI.run(trimId(dataQueryID, "dataQueryID"), { inputValues });
      return summarizeRows(res, maxRows);
    },
  },

  {
    name: "test_query_by_data",
    description:
      "Execute a query configuration WITHOUT saving it — pass the full query config inline.\n\n" +
      "Returns: the result data, exactly as a saved query would produce. Pass maxRows to cap large responses.\n\n" +
      "Use this to iterate on SQL or REST config BEFORE create_query: run here until the results look\n" +
      "right, then persist the exact same options with create_query. Also useful for trying query variants\n" +
      "without polluting the tenant with throwaway saved queries.\n\n" +
      "Backend shape: SQL { queryType: 'query', query: 'SELECT ... {{inputs.x}}', inputDefinitions }, " +
      "restapi { apiEndpoint, method, queryParams: [{key,value}], inputDefinitions }.\n\n" +
      "Example call:\n" +
      '  { "datasourceID": "d7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e",\n' +
      '    "datasourceType": "postgresql",\n' +
      '    "dataQueryOptions": { "queryType": "query", "query": "SELECT count(*) AS total FROM orders WHERE status = {{inputs.status}}",\n' +
      '                          "inputDefinitions": [{ "key": "status", "type": "string" }] },\n' +
      '    "inputValues": { "status": "refunded" }, "maxRows": 50 }\n\n' +
      "Related: create_query (persist the validated config), test_query (test an already-saved query).",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: {
          type: "string",
          description: "UUID of the datasource to run against. Example: 'd7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e'.",
        },
        datasourceType: {
          type: "string",
          description: "Datasource type. Example: 'postgresql', 'restapi'.",
        },
        dataQueryOptions: {
          type: "object",
          description: "Query config — BACKEND shape (see create_query). " +
            "Example: { queryType: 'query', query: 'SELECT count(*) FROM orders', inputDefinitions: [] }.",
        },
        inputValues: {
          type: "object",
          description: "Values for the query's inputDefinitions keys. Example: { status: 'refunded' }.",
        },
        maxRows: {
          type: "number",
          description: "Optional row cap (1-1000) to avoid truncation.",
        },
      },
      required: ["datasourceType", "dataQueryOptions"],
    },
    handler: async ({ datasourceID, datasourceType, dataQueryOptions, inputValues = {}, maxRows }, context) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await queryAPI.testByData({
        datasourceID: datasourceID ? trimId(datasourceID, "datasourceID") : undefined,
        datasourceType,
        dataQueryOptions,
        inputValues,
      });
      return summarizeRows(res, maxRows);
    },
  },
];
