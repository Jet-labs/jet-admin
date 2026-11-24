// File: packages/mcp-server/src/tools/appPage.tools.js (javascript)
/**
 * appPage.tools.js — context-aware, multi-tenant ready
 * Handler signature: async (args, context) where context = { tenantId, apiKey }
 */

import { createApiClient } from "../client.js";
import { safeArray, trimId } from "../utils.js";
import { config } from "../config.js";
import { validateAppPageConfig } from "../validation/appPage.js";

/**
 * Resolves the frontend base URL for preview links.
 * Prefers the explicit JET_ADMIN_FRONTEND_URL env var (for split-domain deployments).
 * Falls back to deriving it from the backend URL (for same-origin setups).
 *
 * Examples:
 *   JET_ADMIN_FRONTEND_URL=http://localhost:3000 → http://localhost:3000
 *   (fallback) http://localhost:5000        → http://localhost:5000
 *   (fallback) http://localhost:5000/api/v1 → http://localhost:5000
 */
function getFrontendBaseUrl() {
  if (config.frontendUrl) return config.frontendUrl;
  // Strip any /api... path suffix to get the root origin
  return config.baseUrl.replace(/\/api(\/.*)?$/, "");
}

export const appPageTools = [
  {
    name: "list_app_pages",
    description:
      "List App Pages in this Jet Admin tenant.\n\n" +
      "Returns: { appPages: [{ appPageID, title, description, createdAt }], totalCount }.\n" +
      "appPageID (UUID) is the handle for get_app_page, update_app_page, delete_app_page, and\n" +
      "get_app_page_preview_url.\n\n" +
      "Use this to find an existing page's ID, check whether a page for a purpose already exists before\n" +
      "creating one, or to find pages affected before deleting a query/widget.\n" +
      "Prefer get_tenant_resource_summary as the first call of a session.\n\n" +
      "Example call:\n" +
      '  { "search": "orders", "pageSize": 20 }\n\n' +
      "Related: get_app_page, create_app_page, get_app_page_preview_url, search_resources.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Optional. Filter by title or description. Example: 'orders'." },
        page: { type: "number", description: "Page number (1-based). Default 1. Example: 1." },
        pageSize: { type: "number", description: "Results per page (max 100). Default 20. Example: 20." },
      },
    },
    handler: async ({ search, page, pageSize } = {}, context) => {
      const { appPageAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await appPageAPI.list({ search, page, pageSize });
      const pages = safeArray(data, "appPages");
      return {
        appPages: pages.map((p) => ({
          appPageID: p.appPageID,
          title: p.appPageTitle,
          description: p.appPageDescription,
          createdAt: p.createdAt,
        })),
        totalCount: data?.totalCount ?? pages.length,
      };
    },
  },

  {
    name: "get_app_page",
    description:
      "Get the FULL configuration of an App Page.\n\n" +
      "Returns: { appPageID, title, description, config, createdAt } where config contains the layout\n" +
      "grid (layouts), data source bindings (dataSources), widget instance keys (widgets), and\n" +
      "page variables (variables).\n\n" +
      "Use this when:\n" +
      "  - Preparing an update_app_page call — read the full config, modify it, send the complete object\n" +
      "    (update_app_page REPLACES the config; a partial send drops existing widgets/layout)\n" +
      "  - Checking which queries/widgets a page references (impact analysis before delete_query/delete_widget)\n" +
      "  - Reusing a page's structure as a template for a new page\n\n" +
      "Example call:\n" +
      '  { "appPageID": "7e8f9a0b-1c2d-4e3f-a4b5-c6d7e8f9a0b1" }\n\n' +
      "Related: update_app_page, create_app_page, delete_query, delete_widget.",
    inputSchema: {
      type: "object",
      properties: {
        appPageID: {
          type: "string",
          description: "UUID of the App Page. Get it from list_app_pages or get_tenant_resource_summary. " +
            "Example: '7e8f9a0b-1c2d-4e3f-a4b5-c6d7e8f9a0b1'.",
        },
      },
      required: ["appPageID"],
    },
    handler: async ({ appPageID }, context) => {
      const { appPageAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await appPageAPI.getById(trimId(appPageID, "appPageID"));
      const p = res?.appPage || res;
      if (!p) throw new Error(`App Page not found: ${appPageID}`);
      return {
        appPageID: p.appPageID,
        title: p.appPageTitle,
        description: p.appPageDescription,
        folderID: p.folderID ?? null,
        config: p.appPageConfig,
        createdAt: p.createdAt,
      };
    },
  },

  {
    name: "create_app_page",
    description:
      "Create a NEW App Page — the user-facing dashboard/form composed of widgets bound to data sources.\n\n" +
      "Returns: the created page object including its new appPageID. Get a shareable URL with\n" +
      "get_app_page_preview_url afterwards.\n\n" +
      "PREREQUISITES — build these FIRST, in order:\n" +
      "  1. create_query (and/or create_workflow, create_listener) for the data\n" +
      "  2. create_widget for each visual element\n" +
      "  3. create_app_page referencing the widget IDs\n\n" +
      "appPageConfig structure (V2 layout tree — get_app_page_schema is authoritative; layouts.lg is LEGACY):\n" +
      "  {\n" +
      "    widgets: [ 'widget_<widgetID>_1' ],        // instance keys: 'widget_' + widgetID + '_' + index\n" +
      "    layoutVersion: 2,                            // REQUIRED for new pages\n" +
      "    layout: { type: 'column', children: [       // root is ALWAYS a column node; 'grid' is NOT a legal type\n" +
      "      { id: 'row_1', type: 'row', sizing: 'auto', children:\n" +
      "        [{ id: 'slot_1', type: 'widget', span: 12, sizing: 'fill', widgetKey: 'widget_<widgetID>_1' }] } ] },\n" +
      "    layouts: {},                                // MUST stay {} on V2 — legacy lg/md grids are ignored\n" +
      "    dataSources: [                              // data bindings used by the widgets\n" +
      "      { alias: 'orders', type: 'query', queryID: '<dataQueryID>', triggerMode: 'auto', refreshOn: [] },\n" +
      "      { alias: 'notify', type: 'workflow', workflowID: '<workflowID>', triggerMode: 'manual', refreshOn: [] },\n" +
      "      { alias: 'live', type: 'listener', listenerID: '<listenerID>', triggerMode: 'reactive', refreshOn: ['searchText'] } ],\n" +
      "    variables: [ { key: 'statusFilter', type: 'string', defaultValue: 'all' } ]\n" +
      "  }\n" +
      "DATA LOADING MODEL (query runOnLoad vs page triggerMode/refreshOn — set BOTH consistently):\n" +
      "  query runOnLoad:true  = default when the query SHOULD load with the page (KPIs, tables).\n" +
      "  page triggerMode: 'auto' (load on open) | 'manual' (only via EXECUTE_QUERY/button) | 'reactive' (re-run when refreshOn vars change).\n" +
      "  refreshOn: variable keys that re-trigger a reactive source. One auto query per intent; put search-driven\n" +
      "  queries on manual/reactive + explicit EXECUTE_QUERY {alias} from the search widget.\n" +
      "  RACE WARNING: firing EXECUTE_QUERY per keystroke lets a late 404 overwrite good data (no debounce in the\n" +
      "  page runtime). Debounce at the widget/event layer or gate on submit; never share one auto variable\n" +
      "  across 6 competing queries.\n\n" +
      "Layout strategy by use case (V2 spans are 12 columns wide):\n" +
      "  Single metric: 1 stat widget (span: 12)\n" +
      "  Chart + table: vega-lite chart row above table row\n" +
      "  KPI dashboard: 3-4 stat widgets in one row (span: 3-4 each) + chart below\n\n" +
      "Example call — dashboard with a KPI, a vega-lite chart, and a table (V2 layout):\n" +
      '  { "appPageTitle": "Orders Dashboard",\n' +
      '    "appPageDescription": "KPIs, revenue trend, and recent orders.",\n' +
      '    "appPageConfig": {\n' +
      '      "widgets": ["widget_11111111-aaaa-4bbb-8ccc-000000000001_1",\n' +
      '                  "widget_22222222-bbbb-4ccc-8ddd-000000000002_1",\n' +
      '                  "widget_33333333-cccc-4ddd-8eee-000000000003_1"],\n' +
      '      "layoutVersion": 2,\n' +
      '      "layout": { "type": "column", "children": [\n' +
      '        { "id": "row_1", "type": "row", "sizing": "auto", "children": [\n' +
      '          { "id": "slot_1", "type": "widget", "span": 12, "sizing": "fill", "widgetKey": "widget_11111111-aaaa-4bbb-8ccc-000000000001_1" } ] },\n' +
      '        { "id": "row_2", "type": "row", "sizing": "auto", "children": [\n' +
      '          { "id": "slot_2", "type": "widget", "span": 12, "sizing": "fill", "widgetKey": "widget_22222222-bbbb-4ccc-8ddd-000000000002_1" } ] },\n' +
      '        { "id": "row_3", "type": "row", "sizing": "auto", "children": [\n' +
      '          { "id": "slot_3", "type": "widget", "span": 12, "sizing": "fill", "widgetKey": "widget_33333333-cccc-4ddd-8eee-000000000003_1" } ] } ] },\n' +
      '      "layouts": {},\n' +
      '      "dataSources": [\n' +
      '        { "alias": "orders_summary", "type": "query", "queryID": "9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c", "triggerMode": "auto", "refreshOn": [] } ],\n' +
      '      "variables": [] } }\n\n' +
      "Related: create_widget, create_query, update_app_page, get_app_page_preview_url, get_app_page_schema.",
    inputSchema: {
      type: "object",
      properties: {
        appPageTitle: {
          type: "string",
          description: "Human-readable title shown in the tenant navigation. Example: 'Orders Dashboard'.",
        },
        appPageDescription: {
          type: "string",
          description: "Optional. Purpose of the page. Example: 'KPIs, revenue trend, and recent orders.'",
        },
        appPageConfig: {
          type: "object",
          description: "Full page configuration (layouts, dataSources, widgets, variables) — see tool " +
            "description for structure and example. Reuse widget instance keys consistently between " +
            "widgets[] and layouts[].",
        },
      },
      required: ["appPageTitle"],
    },
    handler: async ({ appPageTitle, appPageDescription, appPageConfig }, context) => {
      const { appPageAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const pageConfig = appPageConfig || {
        layoutVersion: 2,
        layout: { id: "ROOT", type: "column", children: [] },
        widgets: [],
        dataSources: [],
        variables: [],
        layouts: {},
      };
      const validation = validateAppPageConfig(pageConfig);
      if (!validation.valid) {
        const summary = validation.errors.slice(0, 6).map((e) => `${e.path}: ${e.message}`).join("; ");
        throw Object.assign(
          new Error(`Invalid appPageConfig: ${summary}`),
          { code: "APP_PAGE_VALIDATION_FAILED", details: validation }
        );
      }
      const result = await appPageAPI.create({
        appPageTitle,
        appPageDescription,
        appPageConfig: pageConfig,
      });
      if (!result) throw new Error("App Page creation returned no data.");
      return result;
    },
  },

  {
    name: "update_app_page",
    description:
      "Update an App Page's title, description, or configuration — the tool for adding widgets to an\n" +
      "existing page, changing layouts, or rebinding data sources.\n\n" +
      "Returns: { success: true, appPageID }.\n\n" +
      "CRITICAL: appPageConfig REPLACES the page's ENTIRE config. Always:\n" +
      "  1. get_app_page to read the current config\n" +
      "  2. Add/modify what you need\n" +
      "  3. Send the COMPLETE config back. Sending only the new widget drops every existing widget,\n" +
      "     layout entry, and data source binding.\n\n" +
      "When adding a widget (V2 layout), update BOTH consistently:\n" +
      "  - widgets: append 'widget_<widgetID>_<suffix>' (suffix unique per page, e.g. _1)\n" +
      "  - layout.children: append a row node containing a widget leaf:\n" +
      '    { id: \'row_x\', type: \'row\', sizing: \'auto\', children:\n' +
      '      [{ id: \'slot_x\', type: \'widget\', span: 12, sizing: \'fill\',\n' +
      '         widgetKey: \'widget_<widgetID>_<suffix>\' }] }\n' +
      "  (Do NOT use legacy layouts.lg — V2 pages use the layout tree; layouts must stay {}.)\n" +
      "The widget itself must already exist (create_widget).\n" +
      "NOTE: the backend requires appPageTitle on update — if you omit it, this tool\n" +
      "re-sends the page's current title automatically.\n\n" +
      "Example call — append a stat widget row to existing V2 layout (read get_app_page first):\n" +
      '  { "appPageID": "7e8f9a0b-1c2d-4e3f-a4b5-c6d7e8f9a0b1",\n' +
      '    "appPageConfig": {\n' +
      '      "widgets": [ ...existing keys..., "widget_44444444-dddd-4eee-8fff-000000000004_1" ],\n' +
      '      "layoutVersion": 2,\n' +
      '      "layout": { "type": "column", "children": [ ...existing rows...,\n' +
      '        { "id": "row_new", "type": "row", "sizing": "auto", "children": [\n' +
      '          { "id": "slot_new", "type": "widget", "span": 12, "sizing": "fill",\n' +
      '            "widgetKey": "widget_44444444-dddd-4eee-8fff-000000000004_1" } ] } ] },\n' +
      '      "layouts": {},\n' +
      '      "dataSources": [ ...existing bindings (preserve triggerMode/refreshOn!)... ],\n' +
      '      "variables": [ ...existing variables... ] } }\n\n' +
      "Related: get_app_page (always read first), create_widget, get_app_page_preview_url.",
    inputSchema: {
      type: "object",
      properties: {
        appPageID: {
          type: "string",
          description: "UUID of the App Page to update. Example: '7e8f9a0b-1c2d-4e3f-a4b5-c6d7e8f9a0b1'.",
        },
        appPageTitle: { type: "string", description: "Optional. New title. Example: 'Orders Dashboard v2'." },
        appPageDescription: {
          type: "string",
          description: "Optional. New description. Example: 'KPIs, revenue trend, and recent orders.'",
        },
        appPageConfig: {
          type: "object",
          description: "Optional. REPLACEMENT page configuration — must include ALL fields from the " +
            "current config plus your changes. See get_app_page and create_app_page for the structure.",
        },
      },
      required: ["appPageID"],
    },
    handler: async ({ appPageID, ...updates }, context) => {
      const { appPageAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(appPageID, "appPageID");
      if (updates.appPageConfig !== undefined) {
        const validation = validateAppPageConfig(updates.appPageConfig);
        if (!validation.valid) {
          const summary = validation.errors.slice(0, 6).map((e) => `${e.path}: ${e.message}`).join("; ");
          throw Object.assign(
            new Error(`Invalid appPageConfig: ${summary}`),
            { code: "APP_PAGE_VALIDATION_FAILED", details: validation }
          );
        }
      }
      // Backend rejects updates without appPageTitle — backfill from current page.
      if (updates.appPageTitle === undefined) {
        const current = await appPageAPI.getById(id);
        const page = current?.appPage || current;
        if (page?.appPageTitle) updates.appPageTitle = page.appPageTitle;
      }
      await appPageAPI.update(id, updates);
      return {
        success: true,
        appPageID: id,
        ...(updates.appPageConfig ? { config: updates.appPageConfig } : {}),
        hint: "Re-read with get_app_page to verify persistence (update replaces the whole config).",
      };
    },
  },

  {
    name: "delete_app_page",
    description:
      "PERMANENTLY delete an App Page and remove it from the tenant navigation.\n\n" +
      "Returns: { success: true, deleted: { appPageID } }.\n\n" +
      "DESTRUCTIVE — the page and its layout config are gone; queries and widgets it referenced are NOT\n" +
      "deleted (they survive for reuse on other pages). Confirm with the user before deleting.\n\n" +
      "Example call:\n" +
      '  { "appPageID": "7e8f9a0b-1c2d-4e3f-a4b5-c6d7e8f9a0b1" }\n\n' +
      "Related: list_app_pages, delete_widget, delete_query.",
    inputSchema: {
      type: "object",
      properties: {
        appPageID: {
          type: "string",
          description: "UUID of the App Page to delete. Example: '7e8f9a0b-1c2d-4e3f-a4b5-c6d7e8f9a0b1'.",
        },
      },
      required: ["appPageID"],
    },
    handler: async ({ appPageID }, context) => {
      const { appPageAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await appPageAPI.delete(trimId(appPageID, "appPageID"));
      return { success: true, deleted: { appPageID } };
    },
  },

  {
    name: "get_app_page_preview_url",
    description:
      "Get the direct URL to view an App Page in the Jet Admin frontend — no backend call, instant.\n\n" +
      "Returns: { appPageID, tenantId, url }.\n\n" +
      "Call this AFTER creating or updating a page so the user can open and visually verify it. Also use\n" +
      "it to share the page link.\n\n" +
      "Example call:\n" +
      '  { "appPageID": "7e8f9a0b-1c2d-4e3f-a4b5-c6d7e8f9a0b1" }\n\n' +
      "Related: create_app_page, update_app_page.",
    inputSchema: {
      type: "object",
      properties: {
        appPageID: {
          type: "string",
          description: "UUID of the App Page. Example: '7e8f9a0b-1c2d-4e3f-a4b5-c6d7e8f9a0b1'.",
        },
      },
      required: ["appPageID"],
    },
    handler: async ({ appPageID }, context) => {
      const id = trimId(appPageID, "appPageID");
      const frontendBase = getFrontendBaseUrl();
      const url = `${frontendBase}/tenants/${context.tenantId}/app-pages/${id}`;
      return { appPageID: id, tenantId: context.tenantId, url };
    },
  },
];
