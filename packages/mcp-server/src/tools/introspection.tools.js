/**
 * introspection.tools.js — context-aware, multi-tenant ready
 * Handler signature: async (args, context) where context = { tenantId, apiKey }
 */

import { createApiClient } from "../client.js";
import { safeArray } from "../utils.js";

const MAX_PAGES = 50; // Hard cap to prevent infinite loops

/**
 * Helper to iteratively fetch all pages from a paginated resource API.
 * @param {Function} apiMethod - The list method (e.g. queryAPI.list)
 * @param {string} key - The key of the list inside the response object (e.g. "dataQueries")
 * @returns {Promise<Array>}
 */
async function fetchAllPages(apiMethod, key) {
  let allItems = [];
  let page = 1;
  const pageSize = 100; // max allowed by schemas

  while (page <= MAX_PAGES) {
    const data = await apiMethod({ page, pageSize });
    const items = safeArray(data, key);

    if (items.length === 0) break;

    allItems.push(...items);

    const totalCount = data?.totalCount;
    if (typeof totalCount === "number" && allItems.length >= totalCount) break;
    if (items.length < pageSize) break;

    page++;
  }

  if (page > MAX_PAGES) {
    process.stderr.write(
      `[jet-admin-mcp] WARNING: fetchAllPages hit max page limit (${MAX_PAGES}) for key "${key}". Some items may be missing.\n`
    );
  }

  return allItems;
}

export const introspectionTools = [
  {
    name: "get_tenant_resource_summary",
    description:
      "Get a complete summary of all resources in the Jet Admin tenant in a single call. " +
      "Returns lists of datasources, queries, widgets, app pages, listeners, and workflows. " +
      "ALWAYS call this at the start of any build task to:\n" +
      "  1. Avoid creating duplicate resources\n" +
      "  2. Find existing resources to reuse\n" +
      "  3. Understand the current state of the tenant\n" +
      "This is cheaper than calling list_* for each resource type separately.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { datasourceAPI, queryAPI, widgetAPI, appPageAPI, listenerAPI, workflowAPI } =
        createApiClient(context.tenantId, context.apiKey, context.bearerToken);

      // All 6 resource types in parallel — one context, one auth credential
      const [
        datasourcesResult,
        queriesResult,
        widgetsResult,
        pagesResult,
        listenersResult,
        workflowsResult,
      ] = await Promise.allSettled([
        fetchAllPages((p) => datasourceAPI.list(p), "datasources"),
        fetchAllPages((p) => queryAPI.list(p), "dataQueries"),
        fetchAllPages((p) => widgetAPI.list(p), "widgets"),
        fetchAllPages((p) => appPageAPI.list(p), "appPages"),
        fetchAllPages((p) => listenerAPI.list(p), "listeners"),
        fetchAllPages((p) => workflowAPI.list(p), "workflows"),
      ]);

      const getFulfilled = (result, label) => {
        if (result.status === "fulfilled") return result.value;
        process.stderr.write(
          `[jet-admin-mcp] WARNING: Failed to fetch ${label}: ${result.reason?.message || result.reason}\n`
        );
        return [];
      };

      const datasources = getFulfilled(datasourcesResult, "datasources");
      const queries     = getFulfilled(queriesResult, "queries");
      const widgets     = getFulfilled(widgetsResult, "widgets");
      const pages       = getFulfilled(pagesResult, "appPages");
      const listeners   = getFulfilled(listenersResult, "listeners");
      const workflows   = getFulfilled(workflowsResult, "workflows");

      return {
        summary: {
          datasources: datasources.length,
          queries: queries.length,
          widgets: widgets.length,
          appPages: pages.length,
          listeners: listeners.length,
          workflows: workflows.length,
        },
        datasources: datasources.map((d) => ({
          id: d.datasourceID,
          title: d.datasourceTitle,
          type: d.datasourceType,
        })),
        queries: queries.map((q) => ({
          id: q.dataQueryID,
          title: q.dataQueryTitle,
          datasourceType: q.datasourceType,
          datasourceID: q.datasourceID,
        })),
        widgets: widgets.map((w) => ({
          id: w.widgetID,
          title: w.widgetTitle,
          type: w.widgetType,
        })),
        appPages: pages.map((p) => ({
          id: p.appPageID,
          title: p.appPageTitle,
          description: p.appPageDescription,
        })),
        listeners: listeners.map((l) => ({
          id: l.listenerID,
          title: l.listenerTitle,
          type: l.listenerType,
          status: l.status,
        })),
        // DB field is `title` (not `workflowTitle`); status from `isDisabled`
        workflows: workflows.map((w) => ({
          id: w.workflowID,
          title: w.title ?? "(untitled)",
          status: w.isDisabled ? "inactive" : "active",
        })),
      };
    },
  },

  {
    name: "search_resources",
    description:
      "Search across all Jet Admin resource types by title/description. " +
      "Returns a ranked list of matching resources with their type and ID. " +
      "Use this to find an existing resource before creating a new one.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search string to match against resource titles." },
        types: {
          type: "array",
          items: {
            type: "string",
            enum: ["datasource", "query", "widget", "appPage", "listener", "workflow"],
          },
          description: "Limit search to specific resource types. Leave empty to search all types.",
        },
      },
      required: ["query"],
    },
    handler: async ({ query, types }, context) => {
      const searchTerm = query.toLowerCase();
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);

      const allTypes = ["datasource", "query", "widget", "appPage", "listener", "workflow"];
      const targetTypes = types && types.length > 0 ? types : allTypes;

      const fetchers = {
        datasource: () => client.datasourceAPI.list({ search: query, pageSize: 100 }),
        query:      () => client.queryAPI.list({ search: query, pageSize: 100 }),
        widget:     () => client.widgetAPI.list({ search: query, pageSize: 100 }),
        appPage:    () => client.appPageAPI.list({ search: query, pageSize: 100 }),
        listener:   () => client.listenerAPI.list({ search: query, pageSize: 100 }),
        workflow:   () => client.workflowAPI.list({ search: query, pageSize: 100 }),
      };

      const activeFetchers = targetTypes
        .filter((t) => fetchers[t])
        .map((type) =>
          fetchers[type]()
            .then((data) => ({ type, data }))
            .catch((err) => {
              // Log per-type errors instead of silently swallowing them
              process.stderr.write(
                `[jet-admin-mcp] search_resources: failed to fetch ${type}: ${err?.message || err}\n`
              );
              return { type, data: null };
            })
        );

      const results = await Promise.all(activeFetchers);
      const matches = [];

      const extractors = {
        datasource: (d) =>
          safeArray(d, "datasources").map((r) => ({
            type: "datasource", id: r.datasourceID, title: r.datasourceTitle, subtype: r.datasourceType,
          })),
        query: (d) =>
          safeArray(d, "dataQueries").map((r) => ({
            type: "query", id: r.dataQueryID, title: r.dataQueryTitle, subtype: r.datasourceType,
          })),
        widget: (d) =>
          safeArray(d, "widgets").map((r) => ({
            type: "widget", id: r.widgetID, title: r.widgetTitle, subtype: r.widgetType,
          })),
        appPage: (d) =>
          safeArray(d, "appPages").map((r) => ({
            type: "appPage", id: r.appPageID, title: r.appPageTitle,
          })),
        listener: (d) =>
          safeArray(d, "listeners").map((r) => ({
            type: "listener", id: r.listenerID, title: r.listenerTitle, subtype: r.listenerType,
          })),
        workflow: (d) =>
          // DB field is `title` (not workflowTitle)
          safeArray(d, "workflows").map((r) => ({
            type: "workflow", id: r.workflowID, title: r.title,
          })),
      };

      for (const { type, data } of results) {
        if (!data) continue;
        const extractor = extractors[type];
        if (extractor) {
          const items = extractor(data).filter(
            (item) =>
              item.title?.toLowerCase().includes(searchTerm) ||
              item.subtype?.toLowerCase().includes(searchTerm)
          );
          matches.push(...items);
        }
      }

      return { query, totalMatches: matches.length, results: matches };
    },
  },
  {
    name: "get_widget_schemas",
    description: "Get JSON schemas for widget configurations. Use this to understand the required properties and structure when creating or updating widgets.",
    inputSchema: {
      type: "object",
      properties: {
        widgetType: {
          type: "string",
          description: "Optional. Fetch schema for a specific widget type (e.g., 'table', 'button'). If omitted, returns schemas for all widget types."
        }
      }
    },
    handler: async ({ widgetType }, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.widgetAPI.getSchemas({ widgetType });
      return res?.schemas || res;
    }
  },
  {
    name: "get_data_query_schemas",
    description: "Get JSON schemas for data query configurations. Use this to understand the required properties for querying different datasources.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceType: {
          type: "string",
          description: "Optional. Fetch schema for a specific datasource type (e.g., 'postgresql', 'restapi'). If omitted, returns all."
        }
      }
    },
    handler: async ({ datasourceType }, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.queryAPI.getSchemas({ datasourceType });
      return res?.schemas || res;
    }
  },
  {
    name: "get_datasource_schemas",
    description: "Get JSON schemas for datasource connection forms. Use this to understand the required credentials and settings when creating datasources.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceType: {
          type: "string",
          description: "Optional. Fetch schema for a specific datasource type. If omitted, returns all."
        }
      }
    },
    handler: async ({ datasourceType }, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.datasourceAPI.getSchemas({ datasourceType });
      return res?.schemas || res;
    }
  },
  {
    name: "get_listener_schemas",
    description: "Get JSON schemas for listener configurations (real-time events). Use this to understand the required connection settings.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceType: {
          type: "string",
          description: "Optional. Fetch schema for a specific listener datasource type (e.g., 'firebase', 'websocket'). If omitted, returns all."
        }
      }
    },
    handler: async ({ datasourceType }, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.listenerAPI.getSchemas({ datasourceType });
      return res?.schemas || res;
    }
  },
  {
    name: "get_workflow_schema",
    description: "Get JSON schema for the complete workflow, including node configurations and edges. Use this to understand the structure of a workflow and its steps.",
    inputSchema: {
      type: "object",
      properties: {
        nodeType: {
          type: "string",
          description: "Optional. Fetch schema for a specific workflow node type. If omitted, returns the complete workflow schema with all nodes."
        }
      }
    },
    handler: async ({ nodeType }, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.workflowAPI.getSchemas({ nodeType });
      return res?.schemas || res;
    }
  },
  {
    name: "get_app_page_schema",
    description: "Get the JSON schema for app page configurations. App pages define the layout grid of widgets.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.appPageAPI.getSchema();
      return res?.schema || res;
    }
  }
];
