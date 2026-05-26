// src/index.js
var WIDGET_TYPES = {
  VEGA_LITE: {
    name: "Vega-Lite Chart",
    value: "vega-lite"
  },
  VEGA: {
    name: "Vega Chart",
    value: "vega"
  },
  BUTTON: {
    name: "Button",
    value: "button"
  },
  TABLE: {
    name: "Data Table",
    value: "table"
  },
  TEXT: {
    name: "Text / Markdown",
    value: "text"
  },
  STAT: {
    name: "Stat / KPI",
    value: "stat"
  },
  ALERT: {
    name: "Alert Banner",
    value: "alert"
  },
  FORM: {
    name: "Form",
    value: "form"
  },
  IMAGE: {
    name: "Image",
    value: "image"
  },
  IFRAME: {
    name: "IFrame Embed",
    value: "iframe"
  }
};
var WIDGET_ADVANCED_OPTIONS = {
  "vega": {
    schema: {
      type: "object",
      properties: {
        showActions: {
          type: "boolean",
          title: "Show Actions",
          description: "Show Vega embed action buttons",
          default: false
        },
        renderer: {
          type: "string",
          title: "Renderer",
          enum: ["svg", "canvas"],
          description: "Rendering engine for the chart"
        }
      }
    },
    uischema: {
      type: "VerticalLayout",
      elements: [
        {
          type: "Control",
          scope: "#/properties/showActions"
        },
        {
          type: "Control",
          scope: "#/properties/renderer"
        }
      ]
    }
  },
  "vega-lite": {
    schema: {
      type: "object",
      properties: {
        showActions: {
          type: "boolean",
          title: "Show Actions",
          description: "Show Vega embed action buttons",
          default: false
        },
        renderer: {
          type: "string",
          title: "Renderer",
          enum: ["svg", "canvas"],
          description: "Rendering engine for the chart"
        }
      }
    },
    uischema: {
      type: "VerticalLayout",
      elements: [
        {
          type: "Control",
          scope: "#/properties/showActions"
        },
        {
          type: "Control",
          scope: "#/properties/renderer"
        }
      ]
    }
  }
};
var WIDGET_DATASET_ADVANCED_OPTIONS = [];
var WIDGET_EVENT_TYPES = {
  /** Events available to every widget type */
  COMMON: [
    { value: "onClick", label: "On Click", desc: "Fires when the widget is clicked" },
    { value: "onRefresh", label: "On Refresh", desc: "Fires when the widget refreshes data" },
    { value: "onLoad", label: "On Load", desc: "Fires when the widget finishes mounting" }
  ],
  /** Table-specific events */
  table: [
    { value: "onRowSelect", label: "On Row Select", desc: "Fires when a table row is selected" },
    { value: "onPageChange", label: "On Page Change", desc: "Fires when the table page changes. Event data: page, pageSize, offset" },
    { value: "onSearch", label: "On Search", desc: "Fires when search term changes (debounced). Event data: { searchTerm }" },
    { value: "onExport", label: "On Export", desc: "Fires when export is triggered (server-side mode). Event data: { format, rowCount }" },
    { value: "onRowSave", label: "On Row Save", desc: "Fires when an edited row is saved. Event data: { rowIndex, originalRow, updatedRow, changes }" },
    { value: "onBulkDelete", label: "On Bulk Delete", desc: "Fires when bulk delete is triggered. Event data: { selectedRows, selectedRowIndices }" },
    { value: "onBulkExport", label: "On Bulk Export", desc: "Fires when bulk export is triggered. Event data: { selectedRows, format }" },
    { value: "onBulkAction", label: "On Bulk Action", desc: "Fires for custom bulk actions. Event data: { actionKey, selectedRows }" },
    { value: "onBulkEdit", label: "On Bulk Edit", desc: "Fires when bulk edits are saved. Event data: { edits: [{ rowIndex, originalRow, changes }] }" }
  ],
  /** Button-specific events */
  button: [
    { value: "onSubmit", label: "On Submit", desc: "Fires when the button is submitted" }
  ],
  /** Form-specific events */
  form: [
    { value: "onSubmit", label: "On Submit", desc: "Fires when the form is submitted. Event data: { formData }" },
    { value: "onFieldChange", label: "On Field Change", desc: "Fires when any form field changes. Event data: { field, value }" }
  ],
  /** Alert-specific events */
  alert: [
    { value: "onDismiss", label: "On Dismiss", desc: "Fires when the alert is dismissed" }
  ]
};
var getWidgetEventTypes = (widgetType) => {
  const common = WIDGET_EVENT_TYPES.COMMON || [];
  const specific = WIDGET_EVENT_TYPES[widgetType] || [];
  return [...common, ...specific];
};
export {
  WIDGET_ADVANCED_OPTIONS,
  WIDGET_DATASET_ADVANCED_OPTIONS,
  WIDGET_EVENT_TYPES,
  WIDGET_TYPES,
  getWidgetEventTypes
};
//# sourceMappingURL=index.mjs.map
