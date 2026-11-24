// File: packages/mcp-server/src/tools/widget.tools.js (javascript)
/**
 * widget.tools.js — context-aware, multi-tenant ready
 * Handler signature: async (args, context) where context = { tenantId, apiKey }
 */

import { createApiClient } from "../client.js";
import { safeArray, trimId } from "../utils.js";
import { WIDGET_TYPE_BY_TYPE, GENERATED_WIDGET_TYPES } from "../data/catalogs.js";

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
      "Widget types and typical use cases (full list via list_widget_types):\n" +
      "  'table'  — show records/rows/lists of data\n" +
      "  'vega-lite'/'vega' — visualize data (bar, line, pie; 'chart' is NOT a valid type)\n" +
      "  'stat'   — display a single KPI metric value\n" +
      "  'form'   — let users submit or edit data\n" +
      "  'text'   — display static or dynamic text/markdown\n" +
      "  'button' — trigger queries or workflows on click\n" +
      "For the authoritative, backend-validated config shape, call get_widget_schemas.\n\n" +
      "DATA BINDING (required for live widgets — a widget alone shows nothing until bound):\n" +
      "  Page dataSources are exposed as {{ state.queries.<alias>.data }},\n" +
      "  {{ state.listeners.<alias>.data }}, {{ state.workflows.<alias>.data }}\n" +
      "  plus {{ state.variables.<key> }} and {{ state.queries.<alias>.isLoading }}.\n" +
      "  BINDING-KEY MATRIX (per widgetType — using the wrong key renders blank with NO error):\n" +
      "  table:      dataArrayTemplate (array) | text: content | key-value/list/json-viewer: dataTemplate\n" +
      "  stat:       valueTemplate (canonical; legacy `value` accepted and mirrored on save)\n" +
      "  progress:   valueTemplate (0-100) | badge: text | alert: message | vega/vega-lite: vegaSpec\n" +
      "  table:    { columns: [{key,label,type,width,sortable}], dataArrayTemplate: '{{ state.queries.<alias>.data }}', isLoading?, pagination?, search?, export? }\n" +
      "  stat:     { valueTemplate: '{{ ... }}', label, prefix?, suffix?,\n" +
      "              trendTemplate?, trendDirection? ('up-is-good'|'down-is-good'), textAlign?, isLoading? }\n" +
      "            (Legacy `value`/`trend` aliases are accepted; the API migrates and mirrors them.)\n" +
      "  text:     { content: '... {{ state.queries.<alias>.data.field }} ...', format: 'markdown' }\n" +
      "  vega-lite:{ vegaSpec: { data: { values: '{{ state.queries.<alias>.data }}' }, mark, encoding },\n" +
      "              renderer?, showActions? }\n" +
      "            NOTE: vegaSpec is the canonical render spec (legacy `spec` accepted and mirrored on save).\n" +
      "  key-value:{ dataTemplate: '{{state.queries.<alias>.data.<object>}}', columns? }\n" +
      "  list:     { dataTemplate: '{{state.queries.<alias>.data.<array>}}', titleKey, subtitleKey }\n" +
      "  badge:    { text: '{{ ... }}', variant? } | alert: { message: '... {{...}} ...', variant? }\n" +
      "  json-viewer: { dataTemplate: '{{...}}' } | select: { label?, options:[{label,value}], defaultValue? }\n" +
      "  form:      { fields: [{key,label,type,required,options?,defaultValue?}], submitLabel?, layout? (vertical|horizontal|grid), columns?, size? (sm|default|lg), showReset?, resetLabel?; state.widgets.<id>.values holds the draft }\n" +
      "  date-picker: { label?, placeholder?, defaultValue? (YYYY-MM-DD or local wall-time YYYY-MM-DDTHH:mm:ss, no Z), enableTime?, minDate?, maxDate?, disabledDates?[], required?, disabled?, readOnly?; state.widgets.<id>.value }\n" +
      "  date-range-picker: { label?, placeholderStart/placeholderEnd (canonical; startPlaceholder/endPlaceholder legacy), defaultStart?, defaultEnd?, enableTime?, requireApply? (draft Apply/Cancel), presets? [{label,start,end}|{label,startOffset,endOffset}], minDate?, maxDate?; state.widgets.<id>.start/.end }\n" +
      "  TEMPLATE SUBSET (blank render instead of error on violation — keep expressions simple):\n" +
      "  SAFE: a ? b : c | a || b | arr.length | arr[0] | obj?.field | Math.round/JSON.stringify | encodeURIComponent(x)\n" +
      "  RISKY/BLANK: a && b | x != null | nested ternary | statements/loops | fetch/window/eval (shadowed).\n" +
      "  URL path params: wrap with encodeURIComponent, e.g. /indicators/url/{{encodeURIComponent(state.variables.url)}}/general.\n" +
      "  Always call get_widget on a working widget of the same type and copy its config shape.\n" +
      "EVENTS (widgetConfig.events — page interactivity, verified against frontend\n" +
      "  useWidgetEventHandlers.js / widgetEventsEditor.jsx):\n" +
      "  onClick/onRowSelect/onSearch/onPageChange etc. map to action lists:\n" +
      "  { events: { onClick: [ { config, actionType }, ... ] } }.\n" +
      "  Action types: SET_VARIABLE {key (bare, not state.variables.x), value},\n" +
      "  EXECUTE_QUERY {alias} — runs ANY page dataSource by alias (query, workflow\n" +
      "  with streaming, or listener refresh), SHOW_TOAST {message, variant},\n" +
      "  TRIGGER_WORKFLOW / TRIGGER_QUERY (direct, not page-bound).\n" +
      "  Example button → run page workflow alias 'nightly_digest':\n" +
      '  { events: { onClick: [ { config: { alias: \'nightly_digest\' },\n' +
      "    actionType: 'EXECUTE_QUERY' } ] } }.\n\n" +
      "Example call 1 — table bound to a page query alias 'orders_list':\n" +
      '  { "widgetTitle": "Recent Orders", "widgetType": "table",\n' +
      '    "widgetConfig": { "columns": [\n' +
      '      { "key": "id", "label": "Order ID", "width": 120 },\n' +
      '      { "key": "customer_name", "label": "Customer", "width": 200 },\n' +
      '      { "key": "status", "label": "Status", "width": 100 },\n' +
      '      { "key": "total", "label": "Total", "width": 100 } ],\n' +
      '      "dataArrayTemplate": "{{ state.queries.orders_list.data }}",\n' +
      '      "isLoading": "{{ state.queries.orders_list.isLoading }}" } }\n' +
      "Example call 2 — stat bound to first row (canonical valueTemplate):\n" +
      '  { "widgetTitle": "Total Revenue", "widgetType": "stat",\n' +
      '    "widgetConfig": { "label": "Revenue", "prefix": "$",\n' +
      '      "valueTemplate": "{{ (state.queries.orders_summary.data || [])[0]?.total_revenue }}" } }\n' +
      "Example call 3 — form with typed validation (numbers stay numbers):\n" +
      '  { "widgetTitle": "Add member", "widgetType": "form",\n' +
      '    "widgetConfig": { "fields": [{ "key": "name", "label": "Name", "type": "text", "required": true },\n' +
      '      { "key": "role", "label": "Role", "type": "select", "options": ["admin","member"], "required": true },\n' +
      '      { "key": "agree", "label": "Accept terms", "type": "checkbox", "required": true }],\n' +
      '      "submitLabel": "Save", "layout": "vertical", "showReset": false,\n' +
      '      "events": { "onSubmit": [{ "actionType": "EXECUTE_QUERY", "config": { "alias": "create_member" } }] } } }\n' +
      "Example call 4 — date range with presets (canonical placeholders):\n" +
      '  { "widgetTitle": "Period", "widgetType": "date-range-picker",\n' +
      '    "widgetConfig": { "label": "Period", "placeholderStart": "Start", "placeholderEnd": "End",\n' +
      '      "presets": [{ "label": "Last 7 days", "startOffset": -7, "endOffset": 0 }] } }\n' +
      "  (The API validates the type/config on create/update and migrates legacy aliases.)\n\n" +
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
          description: "Widget type from list_widget_types (e.g. 'table', 'vega-lite', 'stat', 'form', 'text', 'button'). " +
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
      if (!WIDGET_TYPE_BY_TYPE[widgetType]) {
        throw Object.assign(
          new Error(`Unknown widgetType '${widgetType}'. Valid types: ${GENERATED_WIDGET_TYPES.map((w) => w.type).sort().join(", ")}. Use list_widget_types, then get_widget_schemas for one type.`),
          { code: "WIDGET_TYPE_INVALID", details: { widgetType, validTypes: GENERATED_WIDGET_TYPES.map((w) => w.type) } }
        );
      }
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
      "FULL-REPLACE (destructive on omission): widgetConfig REPLACES the entire config. You MUST:\n" +
      "  1. get_widget to read the current config\n" +
      "  2. copy ALL existing keys (esp. table dataArrayTemplate/columns)\n" +
      "  3. send the COMPLETE object. A partial send silently drops binding keys and blanks the widget.\n" +
      "  Legacy aliases (stat value, vega spec, iframe src, text align, table searchable/...) are migrated server-side.\n\n" +
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
