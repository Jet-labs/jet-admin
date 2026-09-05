/**
 * Widget Types Package
 * Contains type definitions and configurations for Vega widgets
 */

export const WIDGET_TYPES = {
  VEGA_LITE: {
    name: "Vega-Lite Chart",
    value: "vega-lite",
  },
  VEGA: {
    name: "Vega Chart",
    value: "vega",
  },
  BUTTON: {
    name: "Button",
    value: "button",
  },
  TABLE: {
    name: "Data Table",
    value: "table",
  },
  TEXT: {
    name: "Text / Markdown",
    value: "text",
  },
  STAT: {
    name: "Stat / KPI",
    value: "stat",
  },
  ALERT: {
    name: "Alert Banner",
    value: "alert",
  },
  FORM: {
    name: "Form",
    value: "form",
  },
  IMAGE: {
    name: "Image",
    value: "image",
  },
  IFRAME: {
    name: "IFrame Embed",
    value: "iframe",
  },
  DATE_PICKER: {
    name: "Date / Time Picker",
    value: "date-picker",
  },
  DATE_RANGE_PICKER: {
    name: "Date Range Picker",
    value: "date-range-picker",
  },
  HTML: {
    name: "HTML Widget",
    value: "html",
  },
  TEXT_INPUT: {
    name: "Text Input",
    value: "text-input",
  },
  SELECT: {
    name: "Select",
    value: "select",
  },
  MULTI_SELECT: {
    name: "Multi Select",
    value: "multi-select",
  },
  CHECKBOX: {
    name: "Checkbox",
    value: "checkbox",
  },
  RADIO_GROUP: {
    name: "Radio Group",
    value: "radio-group",
  },
  SWITCH: {
    name: "Switch",
    value: "switch",
  },
  SLIDER: {
    name: "Slider",
    value: "slider",
  },
  SEARCH_INPUT: {
    name: "Search Input",
    value: "search-input",
  },
  FILE_UPLOAD: {
    name: "File Upload",
    value: "file-upload",
  },
  DIVIDER: {
    name: "Divider",
    value: "divider",
  },
  TABS: {
    name: "Tabs",
    value: "tabs",
  },
  KEY_VALUE: {
    name: "Key Value",
    value: "key-value",
  },
  JSON_VIEWER: {
    name: "JSON Viewer",
    value: "json-viewer",
  },
  LIST: {
    name: "List",
    value: "list",
  },
  BADGE: {
    name: "Badge",
    value: "badge",
  },
  PROGRESS: {
    name: "Progress",
    value: "progress",
  },
  TIMELINE: {
    name: "Timeline",
    value: "timeline",
  },
  VIDEO: {
    name: "Video",
    value: "video",
  },
  CODE_BLOCK: {
    name: "Code Block",
    value: "code-block",
  },
};

// Advanced options for Vega widgets (using JSON Schema + UI Schema for jsonforms)
export const WIDGET_ADVANCED_OPTIONS = {
  "vega": {
    schema: {
      type: "object",
      properties: {
        showActions: {
          type: "boolean",
          title: "Show Actions",
          description: "Show Vega embed action buttons",
          default: false,
        },
        renderer: {
          type: "string",
          title: "Renderer",
          enum: ["svg", "canvas"],
          description: "Rendering engine for the chart",
        },
      },
    },
    uischema: {
      type: "VerticalLayout",
      elements: [
        {
          type: "Control",
          scope: "#/properties/showActions",
        },
        {
          type: "Control",
          scope: "#/properties/renderer",
        },
      ],
    },
  },
  "vega-lite": {
    schema: {
      type: "object",
      properties: {
        showActions: {
          type: "boolean",
          title: "Show Actions",
          description: "Show Vega embed action buttons",
          default: false,
        },
        renderer: {
          type: "string",
          title: "Renderer",
          enum: ["svg", "canvas"],
          description: "Rendering engine for the chart",
        },
      },
    },
    uischema: {
      type: "VerticalLayout",
      elements: [
        {
          type: "Control",
          scope: "#/properties/showActions",
        },
        {
          type: "Control",
          scope: "#/properties/renderer",
        },
      ],
    },
  },
};

// No dataset-specific advanced options for Vega widgets
export const WIDGET_DATASET_ADVANCED_OPTIONS = [];

// ─── Widget Event Types ─────────────────────────────────────────────────────
// Canonical map of supported events per widget type.
// "COMMON" events are available to ALL widget types.
// Widget-specific keys (e.g. "table") add extra events on top of COMMON.
//
// Each event entry may include an `args` array describing the event payload
// shape available in templates via {{ event.<key> }}.
// Always-available keys: event.type, event.widgetID

/**
 * @type {Record<string, Array<{ value: string, label: string, desc: string, inputDefinitions?: Array<{ key: string, description: string }> }>>}
 */
export const WIDGET_EVENT_TYPES = {
  /** Events available to every widget type */
  COMMON: [
    {
      value: "onClick", label: "On Click", desc: "Fires when the widget is clicked",
      inputDefinitions: [
        { key: "event.inputDefinitions[0]", description: "Native click event" },
      ],
    },
    { value: "onRefresh", label: "On Refresh", desc: "Fires when the widget refreshes data" },
    { value: "onLoad", label: "On Load", desc: "Fires when the widget finishes mounting" },
  ],

  /** Table-specific events */
  table: [    {
      value: "onRowSelect", label: "On Row Select", desc: "Fires when a table row is selected",
      inputDefinitions: [
        { key: "event.row", description: "Selected row object" },
        { key: "event.rowIndex", description: "Zero-based row index" },
      ],
    },
    {
      value: "onPageChange", label: "On Page Change", desc: "Fires when the table page changes",
      inputDefinitions: [
        { key: "event.page", description: "Current page number" },
        { key: "event.pageSize", description: "Rows per page (limit)" },
        { key: "event.offset", description: "Row offset (skip)" },
      ],
    },
    {
      value: "onSearch", label: "On Search", desc: "Fires when search term changes (debounced)",
      inputDefinitions: [
        { key: "event.searchTerm", description: "Debounced search term" },
      ],
    },
    {
      value: "onExport", label: "On Export", desc: "Fires when export is triggered",
      inputDefinitions: [
        { key: "event.format", description: "Export format (csv / json)" },
        { key: "event.rowCount", description: "Total rows exported" },
      ],
    },
    {
      value: "onRowSave", label: "On Row Save", desc: "Fires when an edited row is saved",
      inputDefinitions: [
        { key: "event.rowIndex", description: "Edited row index" },
        { key: "event.originalRow", description: "Row before edit" },
        { key: "event.updatedRow", description: "Row after edit" },
        { key: "event.changes", description: "Changed fields object" },
      ],
    },
    {
      value: "onBulkDelete", label: "On Bulk Delete", desc: "Fires when bulk delete is triggered",
      inputDefinitions: [
        { key: "event.selectedRows", description: "Array of selected row objects" },
        { key: "event.selectedRowIndices", description: "Array of selected row indices" },
      ],
    },
    {
      value: "onBulkExport", label: "On Bulk Export", desc: "Fires when bulk export is triggered",
      inputDefinitions: [
        { key: "event.selectedRows", description: "Array of selected row objects" },
        { key: "event.format", description: "Export format (csv / json)" },
      ],
    },
    {
      value: "onBulkAction", label: "On Bulk Action", desc: "Fires for custom bulk actions",
      inputDefinitions: [
        { key: "event.actionKey", description: "Custom action key" },
        { key: "event.selectedRows", description: "Array of selected row objects" },
      ],
    },
    {
      value: "onBulkEdit", label: "On Bulk Edit", desc: "Fires when bulk edits are saved",
      inputDefinitions: [
        { key: "event.edits", description: "Array of { rowIndex, originalRow, changes } objects" },
      ],
    },
  ],

  /** Button-specific events */
  button: [
    {
      value: "onSubmit", label: "On Submit", desc: "Fires when the button is submitted",
      inputDefinitions: [
        { key: "event.inputDefinitions[0]", description: "Submit payload" },
      ],
    },
  ],

  /** Vega chart drill-down events (vega + vega-lite) */
  "vega-lite": [
    {
      value: "onMarkClick", label: "On Mark Click", desc: "Fires when a chart mark is clicked (drill-down)",
      inputDefinitions: [
        { key: "event.datum", description: "Clicked datum object (e.g. {{ event.datum.category }})" },
      ],
    },
    {
      value: "onBrush", label: "On Brush", desc: "Fires when an interval brush selection changes",
      inputDefinitions: [
        { key: "event.value", description: "Brush interval selection value" },
      ],
    },
  ],
  vega: [
    {
      value: "onMarkClick", label: "On Mark Click", desc: "Fires when a chart mark is clicked (drill-down)",
      inputDefinitions: [
        { key: "event.datum", description: "Clicked datum object (e.g. {{ event.datum.category }})" },
      ],
    },
    {
      value: "onBrush", label: "On Brush", desc: "Fires when an interval brush selection changes",
      inputDefinitions: [
        { key: "event.value", description: "Brush interval selection value" },
      ],
    },
  ],

  /** Form-specific events */
  form: [
    {
      value: "onSubmit", label: "On Submit", desc: "Fires when the form is submitted",
      inputDefinitions: [
        { key: "event.formData", description: "Submitted form data object" },
      ],
    },
    {
      value: "onFieldChange", label: "On Field Change", desc: "Fires when any form field changes",
      inputDefinitions: [
        { key: "event.field", description: "Changed field name" },
        { key: "event.value", description: "New field value" },
        { key: "event.formData", description: "Current form data" },
      ],
    },
  ],

  /** Alert-specific events */
  alert: [
    {
      value: "onDismiss", label: "On Dismiss", desc: "Fires when the alert is dismissed",
      inputDefinitions: [
        { key: "event.inputDefinitions[0]", description: "Dismiss payload" },
      ],
    },
  ],

  "date-picker": [
    {
      value: "onChange", label: "On Change", desc: "Fires when the selected date/time changes",
      inputDefinitions: [
        { key: "event.value", description: "ISO datetime string" },
        { key: "event.date", description: "ISO date string (YYYY-MM-DD)" },
        { key: "event.time", description: "Time portion (HH:mm:ss) when enableTime is on" },
      ],
    },
    { value: "onOpen", label: "On Open", desc: "Fires when the picker popover opens" },
    { value: "onClose", label: "On Close", desc: "Fires when the picker popover closes" },
    {
      value: "onClear", label: "On Clear", desc: "Fires when the selected value is cleared",
      inputDefinitions: [
        { key: "event.value", description: "Cleared value (empty string)" },
      ],
    },
  ],

  "date-range-picker": [
    {
      value: "onChange", label: "On Change", desc: "Fires when the selected range changes",
      inputDefinitions: [
        { key: "event.start", description: "ISO start datetime" },
        { key: "event.end", description: "ISO end datetime" },
        { key: "event.startDate", description: "ISO start date (YYYY-MM-DD)" },
        { key: "event.endDate", description: "ISO end date (YYYY-MM-DD)" },
      ],
    },
    { value: "onOpen", label: "On Open", desc: "Fires when the picker popover opens" },
    { value: "onClose", label: "On Close", desc: "Fires when the picker popover closes" },
    {
      value: "onClear", label: "On Clear", desc: "Fires when the range is cleared",
      inputDefinitions: [
        { key: "event.start", description: "Cleared start (empty string)" },
      ],
    },
  ],
  html: [
    {
      value: "onMessage",
      label: "On Message",
      desc: "Fires when custom HTML code dispatches a message",
      inputDefinitions: [
        { key: "event.data", description: "The payload object received" },
      ],
    },
  ],
  "text-input": [
    {
      value: "onChange", label: "On Change", desc: "Fires when the input value changes",
      inputDefinitions: [{ key: "event.value", description: "Current input value" }],
    },
    { value: "onFocus", label: "On Focus", desc: "Fires when the input gains focus" },
    { value: "onBlur", label: "On Blur", desc: "Fires when the input loses focus" },
    {
      value: "onClear", label: "On Clear", desc: "Fires when the input is cleared",
      inputDefinitions: [{ key: "event.value", description: "Cleared value (empty string)" }],
    },
  ],
  select: [
    {
      value: "onChange", label: "On Change", desc: "Fires when selection changes",
      inputDefinitions: [{ key: "event.value", description: "Selected option value" }],
    },
    {
      value: "onClear", label: "On Clear", desc: "Fires when selection is cleared",
      inputDefinitions: [{ key: "event.value", description: "Cleared value" }],
    },
    { value: "onOpen", label: "On Open", desc: "Fires when dropdown opens" },
    { value: "onClose", label: "On Close", desc: "Fires when dropdown closes" },
  ],
  "multi-select": [
    {
      value: "onChange", label: "On Change", desc: "Fires when selection changes",
      inputDefinitions: [{ key: "event.value", description: "Array of selected values" }],
    },
    {
      value: "onClear", label: "On Clear", desc: "Fires when selection is cleared",
      inputDefinitions: [{ key: "event.value", description: "Empty array" }],
    },
  ],
  checkbox: [
    {
      value: "onChange", label: "On Change", desc: "Fires when checked state changes",
      inputDefinitions: [{ key: "event.value", description: "Boolean checked state" }],
    },
  ],
  "radio-group": [
    {
      value: "onChange", label: "On Change", desc: "Fires when selection changes",
      inputDefinitions: [{ key: "event.value", description: "Selected option value" }],
    },
  ],
  switch: [
    {
      value: "onChange", label: "On Change", desc: "Fires when toggle state changes",
      inputDefinitions: [{ key: "event.value", description: "Boolean toggle state" }],
    },
  ],
  slider: [
    {
      value: "onChange", label: "On Change", desc: "Fires when slider value changes",
      inputDefinitions: [{ key: "event.value", description: "Numeric slider value" }],
    },
  ],
  "search-input": [
    {
      value: "onChange", label: "On Change", desc: "Fires instantly on each keystroke",
      inputDefinitions: [{ key: "event.value", description: "Current search text" }],
    },
    {
      value: "onSearch", label: "On Search", desc: "Fires debounced after typing pauses",
      inputDefinitions: [{ key: "event.searchTerm", description: "Debounced search term" }],
    },
    {
      value: "onClear", label: "On Clear", desc: "Fires when search is cleared",
      inputDefinitions: [{ key: "event.value", description: "Cleared value" }],
    },
    { value: "onFocus", label: "On Focus", desc: "Fires when search gains focus" },
    { value: "onBlur", label: "On Blur", desc: "Fires when search loses focus" },
  ],
  "file-upload": [
    {
      value: "onChange", label: "On Change", desc: "Fires when files are selected",
      inputDefinitions: [
        { key: "event.files", description: "Array of { name, size, type } file metadata" },
        { key: "event.fileNames", description: "Array of file names" },
      ],
    },
    {
      value: "onClear", label: "On Clear", desc: "Fires when files are cleared",
      inputDefinitions: [{ key: "event.files", description: "Empty array" }],
    },
  ],
  tabs: [
    {
      value: "onChange", label: "On Change", desc: "Fires when active tab changes",
      inputDefinitions: [{ key: "event.value", description: "Selected tab value" }],
    },
  ],
  list: [
    {
      value: "onItemClick", label: "On Item Click", desc: "Fires when a list item is clicked",
      inputDefinitions: [
        { key: "event.item", description: "Clicked item object" },
        { key: "event.index", description: "Clicked item index" },
      ],
    },
    {
      value: "onSearch", label: "On Search", desc: "Fires when list filter changes",
      inputDefinitions: [{ key: "event.searchTerm", description: "Filter text" }],
    },
  ],
  timeline: [
    {
      value: "onItemClick", label: "On Item Click", desc: "Fires when a timeline event is clicked",
      inputDefinitions: [
        { key: "event.item", description: "Clicked event object" },
        { key: "event.index", description: "Clicked event index" },
      ],
    },
  ],
};

/**
 * Get all supported event types for a given widget type.
 * Returns COMMON events + widget-specific events.
 *
 * @param {string} widgetType - e.g. "table", "vega-lite", "button"
 * @returns {Array<{ value: string, label: string, desc: string, inputDefinitions?: Array<{ key: string, description: string }> }>}
 */
export const getWidgetEventTypes = (widgetType) => {
  const common = WIDGET_EVENT_TYPES.COMMON || [];
  const specific = WIDGET_EVENT_TYPES[widgetType] || [];
  return [...common, ...specific];
};

/**
 * Get the event arguments for a specific event type on a specific widget type.
 * Checks the widget-specific entry first, then falls back to COMMON events.
 * Returns the inputDefinitions array if found, otherwise an empty array.
 *
 * @param {string} widgetType - e.g. "table", "date-picker"
 * @param {string} eventType - e.g. "onClick", "onChange"
 * @returns {Array<{ key: string, description: string }>}
 */
export const getEventInputDefinitions = (widgetType, eventType) => {
  // Check widget-specific events first
  const specific = WIDGET_EVENT_TYPES[widgetType] || [];
  const specificEvent = specific.find((e) => e.value === eventType);
  if (specificEvent?.inputDefinitions) return specificEvent.inputDefinitions;

  // Check COMMON events
  const common = WIDGET_EVENT_TYPES.COMMON || [];
  const commonEvent = common.find((e) => e.value === eventType);
  if (commonEvent?.inputDefinitions) return commonEvent.inputDefinitions;

  // No inputDefinitions defined for this event
  return [];
};

// ─── Widget Methods ─────────────────────────────────────────────────────────
// Canonical map of callable methods exposed by each widget type.
// These are referenced in CALL_WIDGET_METHOD event actions.

/**
 * @type {Record<string, Array<{ name: string, description: string }>>}
 */
export const WIDGET_METHODS = {
  table: [
    { name: "refresh", description: "Reload table data" },
    { name: "setSelectedRow", description: "Select a row by index (fires onRowSelect)" },
    { name: "clearSelection", description: "Clear row selection" },
  ],
  "vega-lite": [
    { name: "refresh", description: "Redraw visual chart" },
    { name: "resize", description: "Resize chart to fit container" },
  ],
  vega: [
    { name: "refresh", description: "Redraw visual chart" },
    { name: "resize", description: "Resize chart to fit container" },
  ],
  button: [
    { name: "click", description: "Trigger button action" },
  ],
  html: [
    { name: "refresh", description: "Reload iframe content" },
  ],
  "text-input": [
    { name: "setValue", description: "Set input value" },
    { name: "clear", description: "Clear input value" },
    { name: "focus", description: "Focus the input" },
  ],
  select: [
    { name: "setValue", description: "Set selected value" },
    { name: "clear", description: "Clear selection" },
  ],
  "multi-select": [
    { name: "setValue", description: "Set selected values array" },
    { name: "clear", description: "Clear selection" },
  ],
  checkbox: [
    { name: "setValue", description: "Set checked state" },
    { name: "toggle", description: "Toggle checked state" },
    { name: "clear", description: "Uncheck" },
  ],
  "radio-group": [
    { name: "setValue", description: "Set selected value" },
    { name: "clear", description: "Clear selection" },
  ],
  switch: [
    { name: "setValue", description: "Set toggle state" },
    { name: "toggle", description: "Toggle state" },
    { name: "clear", description: "Turn off" },
  ],
  slider: [
    { name: "setValue", description: "Set slider value" },
    { name: "clear", description: "Reset to minimum" },
  ],
  "search-input": [
    { name: "setValue", description: "Set search text" },
    { name: "clear", description: "Clear search" },
  ],
  "file-upload": [
    { name: "clear", description: "Clear selected files" },
  ],
  tabs: [
    { name: "setTab", description: "Select tab by value" },
    { name: "setValue", description: "Select tab by value" },
  ],
};

/**
 * Get the list of callable methods for a widget type.
 *
 * @param {string} widgetType - e.g. "table", "vega-lite"
 * @returns {Array<{ name: string, description: string }>}
 */
export const getWidgetMethods = (widgetType) => {
  return WIDGET_METHODS[widgetType] || [];
};

export * from './schemas/index.js';
