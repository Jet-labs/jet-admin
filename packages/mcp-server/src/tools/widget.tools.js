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
      "List all widgets in this Jet Admin tenant. " +
      "Returns widget IDs, titles, and types. " +
      "Always check for existing widgets before creating new ones to avoid duplication.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Optional title filter." },
        page: { type: "number" },
        pageSize: { type: "number" },
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
      "Get the full configuration of a widget including its type-specific properties and event handlers.",
    inputSchema: {
      type: "object",
      properties: {
        widgetID: { type: "string", description: "The UUID of the widget to retrieve." },
      },
      required: ["widgetID"],
    },
    handler: async ({ widgetID }, context) => {
      const { widgetAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const w = await widgetAPI.getById(trimId(widgetID, "widgetID"));
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
      "Create a new widget. Widget types and their typical use cases:\n" +
      "  'table'  — show records/rows/lists of data\n" +
      "  'chart'  — visualize data (bar, line, pie charts)\n" +
      "  'stat'   — display a single KPI metric value\n" +
      "  'form'   — let users submit or edit data\n" +
      "  'text'   — display static or dynamic text/markdown\n" +
      "  'button' — trigger queries or workflows on click\n" +
      "After creating a widget, add it to an App Page with update_app_page.",
    inputSchema: {
      type: "object",
      properties: {
        widgetTitle: { type: "string", description: "Human-readable name for the widget." },
        widgetType: { type: "string", description: "Widget type (table, chart, stat, form, text, button, etc.)" },
        widgetConfig: {
          type: "object",
          description:
            "Type-specific widget configuration:\n" +
            "  table: { columns: [{ field, label, width }], pagination? }\n" +
            "  chart: { chartType: 'bar'|'line'|'pie', xAxis, yAxis }\n" +
            "  stat: { label, valueBinding, format? }\n" +
            "  form: { fields: [{ name, type, label, required? }], submitAction? }",
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
    description: "Update a widget's title or configuration.",
    inputSchema: {
      type: "object",
      properties: {
        widgetID: { type: "string", description: "UUID of the widget to update." },
        widgetTitle: { type: "string" },
        widgetConfig: { type: "object" },
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
      "Permanently delete a widget. " +
      "WARNING: App Pages that include this widget will be affected. Confirm before deleting.",
    inputSchema: {
      type: "object",
      properties: {
        widgetID: { type: "string", description: "UUID of the widget to delete." },
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
