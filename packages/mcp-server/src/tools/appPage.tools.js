/**
 * appPage.tools.js — context-aware, multi-tenant ready
 * Handler signature: async (args, context) where context = { tenantId, apiKey }
 */

import { createApiClient } from "../client.js";
import { safeArray, trimId } from "../utils.js";
import { config } from "../config.js";

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
      "List all App Pages in this Jet Admin tenant. " +
      "App Pages are the main user-facing dashboards and forms. " +
      "Check this before creating a new page — a matching one may already exist.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Optional title or description filter." },
        page: { type: "number" },
        pageSize: { type: "number" },
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
      "Get the full configuration of an App Page, including its layout, " +
      "data source bindings (queries/listeners/workflows), widgets, and page variables.",
    inputSchema: {
      type: "object",
      properties: {
        appPageID: { type: "string", description: "The UUID of the App Page to retrieve." },
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
        config: p.appPageConfig,
        createdAt: p.createdAt,
      };
    },
  },

  {
    name: "create_app_page",
    description:
      "Create a new App Page with a layout configuration.\n" +
      "appPageConfig structure:\n" +
      "  {\n" +
      "    widgets: [ 'widget_<widgetID>_1' ], // Array of widget instance keys\n" +
      "    layouts: {\n" +
      "      lg: [ { i: 'widget_<widgetID>_1', x: 0, y: 0, w: 12, h: 6 } ] // Grid positions per breakpoint (lg, md, sm, xs, xxs)\n" +
      "    },\n" +
      "    dataSources: [\n" +
      "      { alias: 'query_alias', type: 'query', queryID: 'uuid', triggerMode: 'auto' },\n" +
      "      { alias: 'workflow_alias', type: 'workflow', workflowID: 'uuid', triggerMode: 'manual' },\n" +
      "      { alias: 'listener_alias', type: 'listener', listenerID: 'uuid' }\n" +
      "    ],\n" +
      "    variables: [ { key: 'var_name', type: 'string'|'number'|'boolean'|'object'|'array', defaultValue: '' } ]\n" +
      "  }\n\n" +
      "Layout strategy by use case:\n" +
      "  Single metric: 1 stat widget (w: 12, h: 6)\n" +
      "  Chart + table: chart (w: 12, h: 6, x: 0, y: 0) stacked above table (w: 12, h: 10, x: 0, y: 6)\n" +
      "  Multi-metric dashboard: 3-4 KPI stats in a row (w: 3-4, h: 6 each) + chart below",
    inputSchema: {
      type: "object",
      properties: {
        appPageTitle: { type: "string", description: "Human-readable title for the page (shown in the nav)." },
        appPageDescription: { type: "string", description: "Optional description of the page's purpose." },
        appPageConfig: {
          type: "object",
          description: "Full page configuration including layouts, dataSources, widgets, and variables.",
        },
      },
      required: ["appPageTitle"],
    },
    handler: async ({ appPageTitle, appPageDescription, appPageConfig }, context) => {
      const { appPageAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const result = await appPageAPI.create({
        appPageTitle,
        appPageDescription,
        appPageConfig: appPageConfig || {
          layout: { type: "grid", columns: 12 },
          dataSources: [],
          widgets: [],
          variables: [],
        },
      });
      if (!result) throw new Error("App Page creation returned no data.");
      return result;
    },
  },

  {
    name: "update_app_page",
    description:
      "Update an App Page's title, description, or full configuration. " +
      "Use this to add widgets, update data source bindings, or modify the layout after creation.",
    inputSchema: {
      type: "object",
      properties: {
        appPageID: { type: "string", description: "UUID of the App Page to update." },
        appPageTitle: { type: "string" },
        appPageDescription: { type: "string" },
        appPageConfig: {
          type: "object",
          description: "Updated page configuration. Replaces the entire config — include all existing fields.",
        },
      },
      required: ["appPageID"],
    },
    handler: async ({ appPageID, ...updates }, context) => {
      const { appPageAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(appPageID, "appPageID");
      await appPageAPI.update(id, updates);
      return { success: true, appPageID: id };
    },
  },

  {
    name: "delete_app_page",
    description:
      "Permanently delete an App Page. " +
      "WARNING: This removes the page from the tenant nav. Confirm with the user before deleting.",
    inputSchema: {
      type: "object",
      properties: {
        appPageID: { type: "string", description: "UUID of the App Page to delete." },
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
      "Generate a direct URL to view an App Page in the Jet Admin frontend. " +
      "Useful for sharing a link or confirming a page was created correctly.",
    inputSchema: {
      type: "object",
      properties: {
        appPageID: { type: "string", description: "The UUID of the App Page." },
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
