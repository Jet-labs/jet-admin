// File: packages/mcp-server/src/tools/widget.tools.js (javascript)
/**
 * widget.tools.js — context-aware, multi-tenant ready
 * Handler signature: async (args, context) where context = { tenantId, apiKey }
 */

import { createApiClient } from "../client.js";
import { safeArray, trimId } from "../utils.js";

export const widgetTools = [
  {
    name: "list_widgets",
    description:
      "List widgets in this Jet Admin tenant.\n\n" +
      "Returns: { widgets: [{ widgetID, title, type, createdAt }], totalCount }.\n" +
      "widgetID (UUID) is the handle for get_widget, update_widget, delete_widget, and for placing the\n" +
      "widget on an App Page (create_app_page / update_app_page).\n\n" +
      "Use this to find an existing widget's ID, check for reusable widgets before creating new ones\n" +
      "(a widget on one page can be referenced from another), or inventory what exists.\n" +
      "Prefer get_tenant_resource_summary as the first call of a session.\n\n" +
      "Example call:\n" +
      '  { "search": "revenue", "pageSize": 20 }\n\n' +
      "Related: get_widget, create_widget, update_app_page, search_resources.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Optional. Filter by title. Example: 'revenue'." },
        page: { type: "number", description: "Page number (1-based). Default 1. Example: 1." },
        pageSize: { type: "number", description: "Results per page (max 100). Default 20. Example: 20." },
      },
    },
    handler: async ({ search, page, pageSize } = {}, context) => {
      const { widgetAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await widgetAPI.list({ search, page, pageSize });
      const widgets = safeArray(data, "widgets");
      return {
        widgets: widgets.map((w) => ({
          widgetID: w.widgetID,
          title: w.widgetTitle,
          type: w.widgetType,
          createdAt: w.createdAt,
        })),
        totalCount: data?.totalCount ?? widgets.length,
      };
    },
  },

  {
    name: "get_widget",
    description:
      "Get the FULL configuration of a widget — its type-specific properties and event handlers.\n\n" +
      "Returns: { widgetID, title, type, config: { ...widgetConfig }, createdAt }.\n\n" +
      "Use this when:\n" +
      "  - Preparing an update_widget call — read the current config, modify it, send the complete object\n" +
      "  - Reusing a working widget's config as a template for a new one\n" +
      "  - Diagnosing a widget that renders wrong data (check its bindings inside config)\n\n" +
      "Example call:\n" +
      '  { "widgetID": "3d4e5f6a-7b8c-4d9e-0f1a-2b3c4d5e6f7a" }\n\n' +
      "Related: update_widget, get_widget_schemas (authoritative config shape).",
    inputSchema: {
      type: "object",
      properties: {
        widgetID: {
          type: "string",
          description: "UUID of the widget. Get it from list_widgets or get_tenant_resource_summary. " +
            "Example: '3d4e5f6a-7b8c-4d9e-0f1a-2b3c4d5e6f7a'.",
        },
      },
      required: ["widgetID"],
    },
    handler: async ({ widgetID }, context) => {
      const { widgetAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const res = await widgetAPI.getById(trimId(widgetID, "widgetID"));
      const w = res?.widget || res;
      if (!w) throw new Error(`Widget not found: ${widgetID}`);
      return {
        widgetID: w.widgetID,
        title: w.widgetTitle,
        type: w.widgetType,
        config: w.widgetConfig,
        createdAt: w.createdAt,
      };
    },
  },

  {
    name: "create_widget",
    description:
      "Create a NEW widget.\n\n" +
      "Returns: the created widget object including its new widgetID — you then add it to an App Page\n" +
      "with create_app_page or update_app_page.\n\n" +
      "A widget alone does nothing until it is placed on a page and bound to data (a query, listener, or\n" +
      "workflow configured in the page's dataSources). Create the query first (create_query), then the\n" +
      "widget, then the page.\n\n" +
      "Widget types and typical use cases:\n" +
      "  'table'  — show records/rows/lists of data\n" +
      "  'chart'  — visualize data (bar, line, pie)\n" +
      "  'stat'   — display a single KPI metric value\n" +
      "  'form'   — let users submit or edit data\n" +
      "  'text'   — display static or dynamic text/markdown\n" +
      "  'button' — trigger queries or workflows on click\n" +
      "For the authoritative, backend-validated config shape, call get_widget_schemas.\n\n" +
      "widgetConfig quick reference:\n" +
      "  table: { columns: [{ field, label, width }], pagination? }\n" +
      "  chart: { chartType: 'bar'|'line'|'pie', xAxis, yAxis }\n" +
      "  stat:  { label, valueBinding, format? }\n" +
      "  form:  { fields: [{ name, type, label, required? }], submitAction? }\n\n" +
      "Example call 1 — table of orders:\n" +
      '  { "widgetTitle": "Recent Orders", "widgetType": "table",\n' +
      '    "widgetConfig": { "columns": [\n' +
      '      { "field": "id", "label": "Order ID", "width": 120 },\n' +
      '      { "field": "customer_name", "label": "Customer", "width": 200 },\n' +
      '      { "field": "status", "label": "Status", "width": 100 },\n' +
      '      { "field": "total", "label": "Total", "width": 100 } ],\n' +
      '      "pagination": true } }\n' +
      "Example call 2 — revenue stat:\n" +
      '  { "widgetTitle": "Total Revenue", "widgetType": "stat",\n' +
      '    "widgetConfig": { "label": "Revenue", "valueBinding": "orders_summary.0.total_revenue",\n' +
      '                      "format": "currency" } }\n' +
      "Example call 3 — monthly revenue chart:\n" +
      '  { "widgetTitle": "Revenue by Month", "widgetType": "chart",\n' +
      '    "widgetConfig": { "chartType": "bar", "xAxis": "month", "yAxis": "revenue" } }\n\n' +
      "Typical flow: create_query → create_widget → create_app_page (or update_app_page to add it).\n\n" +
      "Related: get_widget_schemas, update_widget, create_app_page, update_app_page.",
    inputSchema: {
      type: "object",
      properties: {
        widgetTitle: {
          type: "string",
          description: "Human-readable name shown above the widget on the page. Example: 'Recent Orders'.",
        },
        widgetType: {
          type: "string",
          description: "Widget type: 'table', 'chart', 'stat', 'form', 'text', 'button', etc. " +
            "Example: 'table'.",
        },
        widgetConfig: {
          type: "object",
          description: "Type-specific configuration (see tool description for quick reference). " +
            "Example for table: { columns: [{ field: 'id', label: 'Order ID', width: 120 }], pagination: true }.",
        },
      },
      required: ["widgetTitle", "widgetType"],
    },
    handler: async ({ widgetTitle, widgetType, widgetConfig }, context) => {
      const { widgetAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const result = await widgetAPI.create({ widgetTitle, widgetType, widgetConfig: widgetConfig || {} });
      if (!result) throw new Error("Widget creation returned no data.");
      return result;
    },
  },

  {
    name: "update_widget",
    description:
      "Update a widget's title or configuration.\n\n" +
      "Returns: { success: true, widgetID }.\n\n" +
      "IMPORTANT: widgetConfig replaces the widget's config — call get_widget first, modify the returned\n" +
      "config, and send the complete object. Sending a partial config loses the fields you omit.\n\n" +
      "Example call — add a column to an existing table widget:\n" +
      '  { "widgetID": "3d4e5f6a-7b8c-4d9e-0f1a-2b3c4d5e6f7a",\n' +
      '    "widgetConfig": { "columns": [\n' +
      '      { "field": "id", "label": "Order ID", "width": 120 },\n' +
      '      { "field": "customer_name", "label": "Customer", "width": 200 },\n' +
      '      { "field": "status", "label": "Status", "width": 100 },\n' +
      '      { "field": "total", "label": "Total", "width": 100 },\n' +
      '      { "field": "created_at", "label": "Created", "width": 150 } ],\n' +
      '      "pagination": true } }\n\n' +
      "Related: get_widget (read config first), get_widget_schemas.",
    inputSchema: {
      type: "object",
      properties: {
        widgetID: {
          type: "string",
          description: "UUID of the widget to update. Example: '3d4e5f6a-7b8c-4d9e-0f1a-2b3c4d5e6f7a'.",
        },
        widgetTitle: { type: "string", description: "Optional. New title. Example: 'Orders — Last 30 Days'." },
        widgetConfig: {
          type: "object",
          description: "Optional. Replacement type-specific config — complete object, not a partial one.",
        },
      },
      required: ["widgetID"],
    },
    handler: async ({ widgetID, ...updates }, context) => {
      const { widgetAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(widgetID, "widgetID");
      await widgetAPI.update(id, updates);
      return { success: true, widgetID: id };
    },
  },

  {
    name: "delete_widget",
    description:
      "PERMANENTLY delete a widget.\n\n" +
      "Returns: { success: true, deleted: { widgetID } }.\n\n" +
      "DESTRUCTIVE — App Pages whose layouts reference this widget will have a hole (missing grid item)\n" +
      "until their config is updated. Before deleting, optionally check which pages use it via\n" +
      "list_app_pages + get_app_page. Confirm with the user before deleting.\n\n" +
      "Example call:\n" +
      '  { "widgetID": "3d4e5f6a-7b8c-4d9e-0f1a-2b3c4d5e6f7a" }\n\n' +
      "Related: update_app_page (fix affected page layouts), list_app_pages.",
    inputSchema: {
      type: "object",
      properties: {
        widgetID: {
          type: "string",
          description: "UUID of the widget to delete. Example: '3d4e5f6a-7b8c-4d9e-0f1a-2b3c4d5e6f7a'.",
        },
      },
      required: ["widgetID"],
    },
    handler: async ({ widgetID }, context) => {
      const { widgetAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await widgetAPI.delete(trimId(widgetID, "widgetID"));
      return { success: true, deleted: { widgetID } };
    },
  },
];
