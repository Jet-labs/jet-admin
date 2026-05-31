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
  },
  DATE_PICKER: {
    name: "Date / Time Picker",
    value: "date-picker"
  },
  DATE_RANGE_PICKER: {
    name: "Date Range Picker",
    value: "date-range-picker"
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
    {
      value: "onClick",
      label: "On Click",
      desc: "Fires when the widget is clicked",
      args: [
        { key: "event.args[0]", description: "Native click event" }
      ]
    },
    { value: "onRefresh", label: "On Refresh", desc: "Fires when the widget refreshes data" },
    { value: "onLoad", label: "On Load", desc: "Fires when the widget finishes mounting" }
  ],
  /** Table-specific events */
  table: [
    {
      value: "onRowSelect",
      label: "On Row Select",
      desc: "Fires when a table row is selected",
      args: [
        { key: "event.row", description: "Selected row object" },
        { key: "event.rowIndex", description: "Zero-based row index" }
      ]
    },
    {
      value: "onPageChange",
      label: "On Page Change",
      desc: "Fires when the table page changes",
      args: [
        { key: "event.page", description: "Current page number" },
        { key: "event.pageSize", description: "Rows per page (limit)" },
        { key: "event.offset", description: "Row offset (skip)" }
      ]
    },
    {
      value: "onSearch",
      label: "On Search",
      desc: "Fires when search term changes (debounced)",
      args: [
        { key: "event.searchTerm", description: "Debounced search term" }
      ]
    },
    {
      value: "onExport",
      label: "On Export",
      desc: "Fires when export is triggered",
      args: [
        { key: "event.format", description: "Export format (csv / json)" },
        { key: "event.rowCount", description: "Total rows exported" }
      ]
    },
    {
      value: "onRowSave",
      label: "On Row Save",
      desc: "Fires when an edited row is saved",
      args: [
        { key: "event.rowIndex", description: "Edited row index" },
        { key: "event.originalRow", description: "Row before edit" },
        { key: "event.updatedRow", description: "Row after edit" },
        { key: "event.changes", description: "Changed fields object" }
      ]
    },
    {
      value: "onBulkDelete",
      label: "On Bulk Delete",
      desc: "Fires when bulk delete is triggered",
      args: [
        { key: "event.selectedRows", description: "Array of selected row objects" },
        { key: "event.selectedRowIndices", description: "Array of selected row indices" }
      ]
    },
    {
      value: "onBulkExport",
      label: "On Bulk Export",
      desc: "Fires when bulk export is triggered",
      args: [
        { key: "event.selectedRows", description: "Array of selected row objects" },
        { key: "event.format", description: "Export format (csv / json)" }
      ]
    },
    {
      value: "onBulkAction",
      label: "On Bulk Action",
      desc: "Fires for custom bulk actions",
      args: [
        { key: "event.actionKey", description: "Custom action key" },
        { key: "event.selectedRows", description: "Array of selected row objects" }
      ]
    },
    {
      value: "onBulkEdit",
      label: "On Bulk Edit",
      desc: "Fires when bulk edits are saved",
      args: [
        { key: "event.edits", description: "Array of { rowIndex, originalRow, changes } objects" }
      ]
    }
  ],
  /** Button-specific events */
  button: [
    {
      value: "onSubmit",
      label: "On Submit",
      desc: "Fires when the button is submitted",
      args: [
        { key: "event.args[0]", description: "Submit payload" }
      ]
    }
  ],
  /** Form-specific events */
  form: [
    {
      value: "onSubmit",
      label: "On Submit",
      desc: "Fires when the form is submitted",
      args: [
        { key: "event.formData", description: "Submitted form data object" }
      ]
    },
    {
      value: "onFieldChange",
      label: "On Field Change",
      desc: "Fires when any form field changes",
      args: [
        { key: "event.field", description: "Changed field name" },
        { key: "event.value", description: "New field value" },
        { key: "event.formData", description: "Current form data" }
      ]
    }
  ],
  /** Alert-specific events */
  alert: [
    {
      value: "onDismiss",
      label: "On Dismiss",
      desc: "Fires when the alert is dismissed",
      args: [
        { key: "event.args[0]", description: "Dismiss payload" }
      ]
    }
  ],
  "date-picker": [
    {
      value: "onChange",
      label: "On Change",
      desc: "Fires when the selected date/time changes",
      args: [
        { key: "event.value", description: "ISO datetime string" },
        { key: "event.date", description: "ISO date string (YYYY-MM-DD)" },
        { key: "event.time", description: "Time portion (HH:mm:ss) when enableTime is on" }
      ]
    },
    { value: "onOpen", label: "On Open", desc: "Fires when the picker popover opens" },
    { value: "onClose", label: "On Close", desc: "Fires when the picker popover closes" },
    {
      value: "onClear",
      label: "On Clear",
      desc: "Fires when the selected value is cleared",
      args: [
        { key: "event.value", description: "Cleared value (empty string)" }
      ]
    }
  ],
  "date-range-picker": [
    {
      value: "onChange",
      label: "On Change",
      desc: "Fires when the selected range changes",
      args: [
        { key: "event.start", description: "ISO start datetime" },
        { key: "event.end", description: "ISO end datetime" },
        { key: "event.startDate", description: "ISO start date (YYYY-MM-DD)" },
        { key: "event.endDate", description: "ISO end date (YYYY-MM-DD)" }
      ]
    },
    { value: "onOpen", label: "On Open", desc: "Fires when the picker popover opens" },
    { value: "onClose", label: "On Close", desc: "Fires when the picker popover closes" },
    {
      value: "onClear",
      label: "On Clear",
      desc: "Fires when the range is cleared",
      args: [
        { key: "event.start", description: "Cleared start (empty string)" }
      ]
    }
  ]
};
var getWidgetEventTypes = (widgetType) => {
  const common = WIDGET_EVENT_TYPES.COMMON || [];
  const specific = WIDGET_EVENT_TYPES[widgetType] || [];
  return [...common, ...specific];
};
var getEventArgs = (widgetType, eventType) => {
  const specific = WIDGET_EVENT_TYPES[widgetType] || [];
  const specificEvent = specific.find((e) => e.value === eventType);
  if (specificEvent?.args) return specificEvent.args;
  const common = WIDGET_EVENT_TYPES.COMMON || [];
  const commonEvent = common.find((e) => e.value === eventType);
  if (commonEvent?.args) return commonEvent.args;
  return [];
};
var WIDGET_METHODS = {
  table: [
    { name: "refresh", description: "Reload table data" },
    { name: "setSelectedRow", description: "Select a row by index" },
    { name: "clearSelection", description: "Clear row selection" }
  ],
  "vega-lite": [
    { name: "refresh", description: "Redraw visual chart" },
    { name: "resize", description: "Resize chart to fit container" }
  ],
  vega: [
    { name: "refresh", description: "Redraw visual chart" },
    { name: "resize", description: "Resize chart to fit container" }
  ],
  button: [
    { name: "click", description: "Trigger button action" }
  ]
};
var getWidgetMethods = (widgetType) => {
  return WIDGET_METHODS[widgetType] || [];
};
export {
  WIDGET_ADVANCED_OPTIONS,
  WIDGET_DATASET_ADVANCED_OPTIONS,
  WIDGET_EVENT_TYPES,
  WIDGET_METHODS,
  WIDGET_TYPES,
  getEventArgs,
  getWidgetEventTypes,
  getWidgetMethods
};
//# sourceMappingURL=index.mjs.map
