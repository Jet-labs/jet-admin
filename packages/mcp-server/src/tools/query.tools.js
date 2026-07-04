/**
 * query.tools.js — context-aware, multi-tenant ready
 * Handler signature: async (args, context) where context = { tenantId, apiKey }
 */

import { createApiClient } from "../client.js";
import { safeArray, trimId } from "../utils.js";

export const queryTools = [
  {
    name: "list_queries",
    description:
      "List all data queries saved in this Jet Admin tenant. " +
      "Returns id, title, datasource type, and datasource ID. " +
      "Always call this before creating a new query to check if a suitable one already exists.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Optional search string to filter by title or datasource type." },
        page: { type: "number", description: "Page number (default: 1)." },
        pageSize: { type: "number", description: "Results per page." },
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
      "Get the full configuration of a saved data query by its ID. " +
      "Returns the query title, datasource binding, query options (SQL/REST config), and run-on-load setting.",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryID: { type: "string", description: "The UUID of the query to retrieve." },
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
      "Create a new data query in the tenant. " +
      "For SQL datasources, the query options typically include { sql: 'SELECT ...' }. " +
      "For REST API datasources, options include { method, path, headers, body }. " +
      "The query is saved but not executed — use test_query or run_query afterwards.",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryTitle: {
          type: "string",
          description: "Human-readable name for the query (e.g. 'refund_count_by_status').",
        },
        datasourceID: {
          type: "string",
          description: "UUID of the datasource this query runs against.",
        },
        datasourceType: {
          type: "string",
          description: "Type of the datasource (e.g. 'postgresql', 'restapi').",
        },
        dataQueryOptions: {
          type: "object",
          description:
            "Query configuration. Shape depends on datasource type:\n" +
            "  postgresql/mysql/mssql: { sql: 'SELECT ...', inputArgs?: [{ name, type }] }\n" +
            "  restapi: { method, path, headers?, body?, queryParams? }",
        },
        runOnLoad: {
          type: "boolean",
          description: "If true, the query auto-executes when an App Page loads. Default: false.",
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
    description: "Update the configuration of an existing saved query.",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryID: { type: "string", description: "The UUID of the query to update." },
        dataQueryTitle: { type: "string" },
        datasourceID: { type: "string" },
        datasourceType: { type: "string" },
        dataQueryOptions: { type: "object" },
        runOnLoad: { type: "boolean" },
      },
      required: ["dataQueryID"],
    },
    handler: async ({ dataQueryID, ...updates }, context) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(dataQueryID, "dataQueryID");
      await queryAPI.update(id, updates);
      return { success: true, dataQueryID: id };
    },
  },

  {
    name: "delete_query",
    description:
      "Permanently delete a saved query. " +
      "WARNING: App Pages that reference this query will break. Confirm with the user before deleting.",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryID: { type: "string", description: "The UUID of the query to delete." },
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
      "Test a saved query by executing it with provided input values. " +
      "Returns the query result data and row count. " +
      "Use this to validate a query before exposing it to users in an App Page.",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryID: { type: "string", description: "The UUID of the saved query to test." },
        inputValues: {
          type: "object",
          description: "Key-value map of input argument values. Example: { 'status': 'refunded' }",
        },
      },
      required: ["dataQueryID"],
    },
    handler: async ({ dataQueryID, inputValues = {} }, context) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return queryAPI.test(trimId(dataQueryID, "dataQueryID"), { inputValues });
    },
  },

  {
    name: "run_query",
    description:
      "Execute a saved query and return its results. " +
      "Use for read operations (SELECT, GET). Avoid for write operations unless intended.",
    inputSchema: {
      type: "object",
      properties: {
        dataQueryID: { type: "string", description: "The UUID of the saved query to execute." },
        inputValues: { type: "object", description: "Key-value map of input argument values." },
      },
      required: ["dataQueryID"],
    },
    handler: async ({ dataQueryID, inputValues = {} }, context) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return queryAPI.run(trimId(dataQueryID, "dataQueryID"), { inputValues });
    },
  },

  {
    name: "test_query_by_data",
    description:
      "Test a query WITHOUT saving it first — provide the full query configuration inline. " +
      "Useful for iterating on SQL or REST config before committing to create_query.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: { type: "string", description: "UUID of the datasource to run against." },
        datasourceType: { type: "string", description: "Type of datasource (e.g. 'postgresql')." },
        dataQueryOptions: { type: "object", description: "Query config — same format as create_query." },
        inputValues: { type: "object", description: "Input argument values to substitute." },
      },
      required: ["datasourceType", "dataQueryOptions"],
    },
    handler: async ({ datasourceID, datasourceType, dataQueryOptions, inputValues = {} }, context) => {
      const { queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return queryAPI.testByData({
        datasourceID: datasourceID ? trimId(datasourceID, "datasourceID") : undefined,
        datasourceType,
        dataQueryOptions,
        inputValues,
      });
    },
  },
];
