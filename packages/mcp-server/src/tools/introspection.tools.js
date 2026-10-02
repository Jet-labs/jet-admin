// File: packages/mcp-server/src/tools/introspection.tools.js (javascript)
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
      "Get a complete inventory of ALL resources in this Jet Admin tenant in ONE call — no parameters needed.\n\n" +
      "Returns, per resource type, an array of lightweight stubs:\n" +
      "  - datasources: { id, title, type }\n" +
      "  - queries:     { id, title, datasourceType, datasourceID }\n" +
      "  - widgets:     { id, title, type }\n" +
      "  - appPages:    { id, title, description }\n" +
      "  - listeners:   { id, title, type, status }\n" +
      "  - workflows:   { id, title, status }\n" +
      "  - summary:     { datasources, queries, widgets, appPages, listeners, workflows } — counts\n\n" +
      "MANDATORY first step for ANY task in this tenant. Call this before:\n" +
      "  - Creating anything — to avoid duplicate resources (search the returned titles first)\n" +
      "  - Building pages — to find existing widgets/queries you can reuse instead of creating new ones\n" +
      "  - Answering questions about the tenant — this is ONE call instead of six list_* calls\n\n" +
      "Example call: {} (no arguments)\n\n" +
      "If the stubs are not detailed enough (e.g. you need a widget's config), fetch the full resource with\n" +
      "get_widget / get_query / get_datasource / get_app_page using the id from this response.\n\n" +
      "Related: search_resources (find one resource by name), list_* (paginated full listings).",
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
      "Search across ALL Jet Admin resource types by title or subtype, in one call.\n\n" +
      "Returns: { query, totalMatches, results: [{ type, id, title, subtype? }] } where type is one of\n" +
      "'datasource' | 'query' | 'widget' | 'appPage' | 'listener' | 'workflow' and id is the resource UUID\n" +
      "you can pass directly to get_* / update_* / delete_* tools.\n\n" +
      "Use this when:\n" +
      "  - The user refers to a resource by name ('the Orders table', 'the revenue chart') and you need its UUID\n" +
      "  - You want to check whether a resource with a given name already exists BEFORE creating it\n" +
      "  - get_tenant_resource_summary returned too many items and you need a targeted lookup\n\n" +
      "Matching is case-insensitive substring match on title and subtype — short, distinctive terms work best.\n\n" +
      "Example call 1 — search everywhere:\n" +
      '  { "query": "orders" }\n' +
      "Example call 2 — only queries and widgets:\n" +
      '  { "query": "revenue", "types": ["query", "widget"] }\n\n' +
      "If zero matches, the resource likely does not exist — offer to create it with create_datasource /\n" +
      "create_query / create_widget / create_app_page / create_listener / create_workflow.\n\n" +
      "Related: get_tenant_resource_summary (full inventory, preferred first call).",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search string matched case-insensitively against resource titles and subtypes. " +
            "Example: 'orders', 'revenue chart', 'postgresql'.",
        },
        types: {
          type: "array",
          items: {
            type: "string",
            enum: ["datasource", "query", "widget", "appPage", "listener", "workflow"],
          },
          description:
            "Optional. Restrict the search to these resource types. Omit or pass [] to search ALL types. " +
            "Example: [\"query\", \"widget\"]",
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
    description:
      "Fetch the JSON schema(s) defining how a widget's widgetConfig object must be structured.\n\n" +
      "Returns: schema object(s) with required properties and structure per widget type.\n" +
      "Call WITHOUT widgetType to get schemas for every widget type at once (recommended — one call covers all).\n\n" +
      "Use this when create_widget or update_widget returns a validation error, or BEFORE constructing a\n" +
      "complex widgetConfig you are unsure about. The built-in quick reference in create_widget's description\n" +
      "covers simple cases (table, chart, stat, form) — come here for the authoritative, backend-validated shape.\n\n" +
      "Example call 1 — all widget schemas:\n" +
      "  {}\n" +
      "Example call 2 — just the chart schema:\n" +
      '  { "widgetType": "chart" }\n\n' +
      "Related: create_widget, update_widget.",
    inputSchema: {
      type: "object",
      properties: {
        widgetType: {
          type: "string",
          description:
            "Optional. Widget type to fetch the schema for (e.g. 'table', 'chart', 'stat', 'form', 'text', 'button'). " +
            "Omit to receive schemas for ALL widget types.",
        },
      },
    },
    handler: async ({ widgetType }, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.widgetAPI.getSchemas({ widgetType });
      return res?.schemas || res;
    }
  },
  {
    name: "get_data_query_schemas",
    description:
      "Fetch the JSON schema(s) defining how a query's dataQueryOptions object must be structured per datasource type.\n\n" +
      "Returns: schema object(s) with the required options for building queries against each datasource type.\n" +
      "Call WITHOUT datasourceType to get all schemas at once (recommended).\n\n" +
      "Use this when create_query / test_query_by_data needs options you are not sure about — e.g. how to pass\n" +
      "input arguments to a PostgreSQL query, or how to configure headers/auth for a REST API query.\n\n" +
      "Example call 1 — all datasource query schemas:\n" +
      "  {}\n" +
      "Example call 2 — only REST API query options:\n" +
      '  { "datasourceType": "restapi" }\n\n' +
      "Related: create_query, test_query_by_data, get_datasource_schemas (connection options, not query options).",
    inputSchema: {
      type: "object",
      properties: {
        datasourceType: {
          type: "string",
          description:
            "Optional. Datasource type to fetch query-option schemas for (e.g. 'postgresql', 'mysql', 'mssql', 'restapi'). " +
            "Omit to receive all.",
        },
      },
    },
    handler: async ({ datasourceType }, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.queryAPI.getSchemas({ datasourceType });
      return res?.schemas || res;
    }
  },
  {
    name: "get_datasource_schemas",
    description:
      "Fetch the JSON schema(s) defining the datasourceOptions object required to CONNECT to each datasource type\n" +
      "(credentials, host/port, base URLs, auth settings).\n\n" +
      "Returns: schema object(s) per datasource type.\n" +
      "Call WITHOUT datasourceType to get all schemas at once (recommended).\n\n" +
      "Use this BEFORE create_datasource or test_datasource_connection when you are unsure which fields the\n" +
      "connection options require for a given datasource type.\n\n" +
      "Example call 1 — all datasource connection schemas:\n" +
      "  {}\n" +
      "Example call 2 — only PostgreSQL connection requirements:\n" +
      '  { "datasourceType": "postgresql" }\n\n' +
      "Related: create_datasource, test_datasource_connection, get_data_query_schemas (query options, not connection options).",
    inputSchema: {
      type: "object",
      properties: {
        datasourceType: {
          type: "string",
          description:
            "Optional. Datasource type to fetch the connection schema for (e.g. 'postgresql', 'mysql', 'mssql', 'restapi'). " +
            "Omit to receive all.",
        },
      },
    },
    handler: async ({ datasourceType }, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.datasourceAPI.getSchemas({ datasourceType });
      return res?.schemas || res;
    }
  },
  {
    name: "get_listener_schemas",
    description:
      "Fetch the JSON schema(s) defining listener configurations — the connection settings and pipeline\n" +
      "structure for real-time event listeners (WebSocket, Kafka, MQTT, SSE, Webhook).\n\n" +
      "Returns: schema object(s) per listener type/datasource.\n" +
      "Call WITHOUT datasourceType to get all schemas at once (recommended).\n\n" +
      "Use this BEFORE create_listener when you need the exact listenerConfig shape or the valid pipelineSteps\n" +
      "structure for the listener type you plan to create.\n\n" +
      "Example call 1 — all listener schemas:\n" +
      "  {}\n" +
      "Example call 2 — only WebSocket listener requirements:\n" +
      '  { "datasourceType": "websocket" }\n\n' +
      "Related: create_listener, get_listener.",
    inputSchema: {
      type: "object",
      properties: {
        datasourceType: {
          type: "string",
          description:
            "Optional. Listener type/datasource to fetch schemas for (e.g. 'websocket', 'webhook', 'sse', 'kafka', 'mqtt'). " +
            "Omit to receive all.",
        },
      },
    },
    handler: async ({ datasourceType }, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.listenerAPI.getSchemas({ datasourceType });
      return res?.schemas || res;
    }
  },
  {
    name: "get_workflow_schema",
    description:
      "Fetch the JSON schema for workflow definitions — node configurations and edges.\n\n" +
      "Returns: schema object(s) describing valid node types, node data structures, and edge shapes.\n" +
      "Call WITHOUT nodeType to get the complete workflow schema with all node types (recommended).\n\n" +
      "Use this BEFORE create_workflow or update_workflow. Building workflow nodes/edges without consulting\n" +
      "this schema is the most common cause of validation errors — the valid node types and their data shapes\n" +
      "come from this call, not from guesswork.\n\n" +
      "Example call 1 — full workflow schema with all node types:\n" +
      "  {}\n" +
      "Example call 2 — schema for a single node type:\n" +
      '  { "nodeType": "runQuery" }\n\n' +
      "Related: create_workflow, update_workflow, get_workflow (inspect an existing workflow as a working example).",
    inputSchema: {
      type: "object",
      properties: {
        nodeType: {
          type: "string",
          description:
            "Optional. Workflow node type to fetch the schema for (e.g. 'runQuery', 'condition', 'httpRequest'). " +
            "Omit to receive the complete workflow schema with all node types.",
        },
      },
    },
    handler: async ({ nodeType }, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.workflowAPI.getSchemas({ nodeType });
      return res?.schemas || res;
    }
  },
  {
    name: "get_app_page_schema",
    description:
      "Fetch the JSON schema for App Page configurations — the appPageConfig object that defines the widget\n" +
      "layout grid, data source bindings, and page variables.\n\n" +
      "Returns: one schema object (takes no parameters).\n\n" +
      "Use this BEFORE create_app_page or update_app_page when you need the authoritative structure for\n" +
      "layouts/dataSources/variables. A condensed quick reference is also embedded in create_app_page's\n" +
      "description — use this schema call when you need field-level detail or hit a validation error.\n\n" +
      "Example call: {} (no arguments)\n\n" +
      "Related: create_app_page, update_app_page, get_app_page (inspect an existing page as a working example).",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const client = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await client.appPageAPI.getSchema();
      return res?.schema || res;
    }
  }
];
