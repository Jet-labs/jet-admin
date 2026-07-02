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
      "List all datasources configured in this Jet Admin tenant. " +
      "Returns id, title, type, and status for each datasource. " +
      "Call this first to discover what data sources are available before building queries or pages.",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Optional search string to filter datasources by title or type.",
        },
        page: { type: "number", description: "Page number for pagination (default: 1)." },
        pageSize: { type: "number", description: "Number of results per page." },
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
      "Get a single datasource by its ID, including its full configuration. " +
      "Use this to inspect the connection options of a specific datasource.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: { type: "string", description: "The UUID of the datasource to retrieve." },
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
      "Introspect the schema of a datasource — returns tables and their fields/columns. " +
      "Supports SQL databases (PostgreSQL, MySQL, MSSQL) and other structured datasources. " +
      "If the datasource is an API or unstructured (like restapi, stripe, slack), it returns the connection configuration.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: { type: "string", description: "The UUID of the datasource to introspect." },
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
      "Fetch a sample of rows from a specific table in a datasource. " +
      "Useful to preview data shape and values before building queries. " +
      "Returns up to `limit` rows (default 5).",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: { type: "string", description: "The UUID of the datasource." },
        table: { type: "string", description: "The table name to sample rows from." },
        limit: { type: "number", description: "Maximum number of rows to return (default: 5, max: 50)." },
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
      "Test the connection to an existing saved datasource. " +
      "Returns whether the connection succeeded and the latency in milliseconds.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceType: {
          type: "string",
          description: "The type of the datasource (e.g. postgresql, mysql, restapi).",
        },
        datasourceOptions: {
          type: "object",
          description: "Connection options for the datasource (e.g. host, port, database, user).",
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
      "Create a new datasource connection in the Jet Admin tenant. " +
      "The datasource is saved but not tested — use test_datasource_connection first. " +
      "Returns the created datasource with its new ID.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceTitle: {
          type: "string",
          description: "Human-readable name for the datasource (e.g. 'Production PostgreSQL').",
        },
        datasourceType: {
          type: "string",
          enum: ["postgresql", "mysql", "mssql", "restapi"],
          description: "The type of datasource to create.",
        },
        datasourceOptions: {
          type: "object",
          description:
            "Connection configuration. Shape depends on type:\n" +
            "  postgresql/mysql/mssql: { host, port, database, user, password, ssl? }\n" +
            "  restapi: { baseUrl, headers?, authType? }",
        },
        datasourceTags: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of tags for organization.",
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
      return {
        datasourceID: result.datasourceID,
        title: result.datasourceTitle,
        type: result.datasourceType,
      };
    },
  },

  {
    name: "update_datasource",
    description: "Update the title, type, options, or tags of an existing datasource.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: { type: "string", description: "The UUID of the datasource to update." },
        datasourceTitle: { type: "string" },
        datasourceType: { type: "string" },
        datasourceOptions: { type: "object" },
        datasourceTags: { type: "array", items: { type: "string" } },
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
      "Permanently delete a datasource. " +
      "WARNING: This will cascade-delete all queries that depend on this datasource. " +
      "Confirm with the user before calling this tool.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: { type: "string", description: "The UUID of the datasource to delete." },
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
