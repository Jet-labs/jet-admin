// src/schemas/vega-lite.schema.json
var vega_lite_schema_default = {
  widgetType: "vega-lite",
  description: "Vega-Lite chart widget. widgetConfig.spec is the full Vega-Lite JSON specification.",
  schema: {
    type: "object",
    properties: {
      spec: {
        type: "object",
        description: "Vega-Lite JSON specification (https://vega.github.io/vega-lite/docs/spec.html)",
        properties: {
          $schema: { type: "string" },
          mark: { description: "Mark type: bar, line, point, area, arc, rect, rule, text, tick, trail, circle, square, geoshape, boxplot, errorband, errorbar" },
          encoding: { type: "object" },
          data: { type: "object" },
          transform: { type: "array" },
          width: { type: ["number", "string"] },
          height: { type: ["number", "string"] },
          title: { type: ["string", "object"] },
          config: { type: "object" }
        }
      },
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
        description: "Rendering engine for the chart",
        default: "svg"
      }
    }
  },
  events: ["onClick", "onRefresh", "onLoad"]
};

// src/schemas/vega.schema.json
var vega_schema_default = {
  widgetType: "vega",
  description: "Vega chart widget. widgetConfig.spec is the full Vega JSON specification.",
  schema: {
    type: "object",
    properties: {
      spec: {
        type: "object",
        description: "Vega JSON specification (https://vega.github.io/vega/docs/specification/)",
        properties: {
          $schema: { type: "string" },
          width: { type: "number" },
          height: { type: "number" },
          signals: { type: "array" },
          data: { type: "array" },
          scales: { type: "array" },
          axes: { type: "array" },
          marks: { type: "array" },
          legends: { type: "array" },
          title: { type: ["string", "object"] },
          config: { type: "object" }
        }
      },
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
        description: "Rendering engine for the chart",
        default: "svg"
      }
    }
  },
  events: ["onClick", "onRefresh", "onLoad"]
};

// src/schemas/table.schema.json
var table_schema_default = {
  widgetType: "table",
  description: "Data table widget. Displays rows of data with configurable columns, pagination, sorting, filtering, and row actions.",
  schema: {
    type: "object",
    properties: {
      columns: {
        type: "array",
        description: "Column definitions for the table",
        items: {
          type: "object",
          properties: {
            field: { type: "string", description: "Data field key" },
            title: { type: "string", description: "Column header label" },
            type: { type: "string", enum: ["text", "number", "boolean", "date", "link", "image", "badge", "actions"], description: "Column render type" },
            width: { type: ["number", "string"], description: "Column width in px or percent" },
            sortable: { type: "boolean", default: false },
            filterable: { type: "boolean", default: false },
            editable: { type: "boolean", default: false },
            hidden: { type: "boolean", default: false },
            format: { type: "string", description: "Display format string (e.g. date format)" }
          },
          required: ["field"]
        }
      },
      pagination: {
        type: "object",
        properties: {
          enabled: { type: "boolean", default: true },
          pageSize: { type: "number", default: 20 },
          mode: { type: "string", enum: ["client", "server"], default: "client" }
        }
      },
      searchable: { type: "boolean", default: false },
      exportable: { type: "boolean", default: false },
      selectable: { type: "boolean", default: false },
      bulkActions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            label: { type: "string" },
            variant: { type: "string", enum: ["default", "danger", "success"] }
          },
          required: ["key", "label"]
        }
      },
      emptyText: { type: "string", description: "Text to show when table has no data" }
    }
  },
  events: ["onClick", "onRefresh", "onLoad", "onRowSelect", "onPageChange", "onSearch", "onExport", "onRowSave", "onBulkDelete", "onBulkExport", "onBulkAction", "onBulkEdit"]
};

// src/schemas/button.schema.json
var button_schema_default = {
  widgetType: "button",
  description: "Button widget. A clickable button that triggers an action.",
  schema: {
    type: "object",
    properties: {
      label: { type: "string", description: "Button text label", default: "Click me" },
      variant: {
        type: "string",
        enum: ["primary", "secondary", "danger", "success", "ghost", "outline"],
        default: "primary",
        description: "Visual style variant"
      },
      size: {
        type: "string",
        enum: ["sm", "md", "lg"],
        default: "md"
      },
      icon: { type: "string", description: "Icon name (from icon library)" },
      iconPosition: { type: "string", enum: ["left", "right"], default: "left" },
      disabled: { type: ["boolean", "string"], description: "Disabled state \u2014 boolean or template expression" },
      loading: { type: ["boolean", "string"], description: "Loading state \u2014 boolean or template expression" },
      fullWidth: { type: "boolean", default: false }
    }
  },
  events: ["onClick", "onRefresh", "onLoad", "onSubmit"]
};

// src/schemas/text.schema.json
var text_schema_default = {
  widgetType: "text",
  description: "Text / Markdown widget. Renders static or dynamic markdown/plain text content.",
  schema: {
    type: "object",
    properties: {
      content: { type: "string", description: "Markdown or plain text content. Supports template expressions {{ variable }}" },
      format: { type: "string", enum: ["markdown", "plain"], default: "markdown" },
      fontSize: { type: "string", description: "CSS font-size value e.g. '16px', '1rem'" },
      fontWeight: { type: "string", enum: ["normal", "bold", "semibold"], default: "normal" },
      color: { type: "string", description: "CSS color value" },
      align: { type: "string", enum: ["left", "center", "right"], default: "left" }
    }
  },
  events: ["onClick", "onRefresh", "onLoad"]
};

// src/schemas/stat.schema.json
var stat_schema_default = {
  widgetType: "stat",
  description: "Stat / KPI widget. Displays a single metric value with optional trend indicator and comparison.",
  schema: {
    type: "object",
    properties: {
      value: { type: ["string", "number"], description: "Main metric value. Supports template expressions." },
      label: { type: "string", description: "Label below the metric value" },
      prefix: { type: "string", description: "Prefix text/symbol (e.g. '$')" },
      suffix: { type: "string", description: "Suffix text/symbol (e.g. '%')" },
      trend: {
        type: "object",
        properties: {
          value: { type: ["string", "number"], description: "Trend/change value" },
          direction: { type: "string", enum: ["up", "down", "neutral"] },
          label: { type: "string", description: "e.g. 'vs last month'" },
          positiveIsGood: { type: "boolean", default: true }
        }
      },
      icon: { type: "string", description: "Icon name to display alongside the metric" },
      iconColor: { type: "string", description: "CSS color for the icon" },
      decimals: { type: "number", description: "Number of decimal places to display", default: 0 }
    }
  },
  events: ["onClick", "onRefresh", "onLoad"]
};

// src/schemas/alert.schema.json
var alert_schema_default = {
  widgetType: "alert",
  description: "Alert Banner widget. Shows an informational, success, warning, or error message.",
  schema: {
    type: "object",
    properties: {
      message: { type: "string", description: "Alert message text. Supports template expressions." },
      title: { type: "string", description: "Optional alert title" },
      variant: {
        type: "string",
        enum: ["info", "success", "warning", "error"],
        default: "info",
        description: "Alert severity type"
      },
      dismissible: { type: "boolean", default: false, description: "Whether the user can dismiss the alert" },
      icon: { type: "boolean", default: true, description: "Show variant icon" },
      visible: { type: ["boolean", "string"], description: "Visibility \u2014 boolean or template expression", default: true }
    },
    required: ["message"]
  },
  events: ["onClick", "onRefresh", "onLoad", "onDismiss"]
};

// src/schemas/form.schema.json
var form_schema_default = {
  widgetType: "form",
  description: "Form widget. Renders an input form with configurable fields and submit action.",
  schema: {
    type: "object",
    properties: {
      fields: {
        type: "array",
        description: "Form field definitions",
        items: {
          type: "object",
          properties: {
            key: { type: "string", description: "Field key (used as form data property name)" },
            label: { type: "string" },
            type: {
              type: "string",
              enum: ["text", "number", "email", "password", "textarea", "select", "multiselect", "checkbox", "radio", "date", "datetime", "file", "hidden"],
              default: "text"
            },
            placeholder: { type: "string" },
            defaultValue: { description: "Default value for the field" },
            required: { type: "boolean", default: false },
            disabled: { type: ["boolean", "string"], default: false },
            options: {
              type: "array",
              description: "Options for select/radio/multiselect fields",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  value: {}
                },
                required: ["label", "value"]
              }
            },
            validation: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" },
                minLength: { type: "number" },
                maxLength: { type: "number" },
                pattern: { type: "string" }
              }
            }
          },
          required: ["key", "label", "type"]
        }
      },
      submitLabel: { type: "string", default: "Submit" },
      resetLabel: { type: "string", description: "Label for reset button; omit to hide reset button" },
      layout: { type: "string", enum: ["vertical", "horizontal", "grid"], default: "vertical" },
      columns: { type: "number", description: "Number of columns when layout is 'grid'", default: 1 }
    },
    required: ["fields"]
  },
  events: ["onClick", "onRefresh", "onLoad", "onSubmit", "onFieldChange"]
};

// src/schemas/image.schema.json
var image_schema_default = {
  widgetType: "image",
  description: "Image widget. Displays an image from a URL.",
  schema: {
    type: "object",
    properties: {
      src: { type: "string", description: "Image URL. Supports template expressions." },
      alt: { type: "string", description: "Alt text for accessibility" },
      objectFit: { type: "string", enum: ["cover", "contain", "fill", "none", "scale-down"], default: "cover" },
      borderRadius: { type: "string", description: "CSS border-radius e.g. '8px', '50%'" },
      linkUrl: { type: "string", description: "Optional URL to navigate to when clicking the image" },
      linkTarget: { type: "string", enum: ["_blank", "_self"], default: "_blank" }
    },
    required: ["src"]
  },
  events: ["onClick", "onRefresh", "onLoad"]
};

// src/schemas/iframe.schema.json
var iframe_schema_default = {
  widgetType: "iframe",
  description: "IFrame Embed widget. Embeds an external URL inside the dashboard.",
  schema: {
    type: "object",
    properties: {
      src: { type: "string", description: "URL to embed. Supports template expressions." },
      height: { type: ["number", "string"], description: "Frame height in px or CSS value", default: 400 },
      scrolling: { type: "boolean", default: true },
      allowFullscreen: { type: "boolean", default: false },
      sandbox: { type: "string", description: "HTML sandbox attribute value (space-separated tokens)" }
    },
    required: ["src"]
  },
  events: ["onClick", "onRefresh", "onLoad"]
};

// src/schemas/date-picker.schema.json
var date_picker_schema_default = {
  widgetType: "date-picker",
  description: "Date / Time Picker widget. Allows users to select a date and optionally a time.",
  schema: {
    type: "object",
    properties: {
      label: { type: "string", description: "Input label" },
      placeholder: { type: "string" },
      defaultValue: { type: "string", description: "Default ISO date string" },
      enableTime: { type: "boolean", default: false, description: "Show time picker alongside date" },
      dateFormat: { type: "string", description: "Display format (e.g. 'YYYY-MM-DD')", default: "YYYY-MM-DD" },
      minDate: { type: "string", description: "Minimum selectable ISO date" },
      maxDate: { type: "string", description: "Maximum selectable ISO date" },
      disabled: { type: ["boolean", "string"], default: false }
    }
  },
  events: ["onClick", "onRefresh", "onLoad", "onChange", "onOpen", "onClose", "onClear"]
};

// src/schemas/date-range-picker.schema.json
var date_range_picker_schema_default = {
  widgetType: "date-range-picker",
  description: "Date Range Picker widget. Allows users to select a start and end date range.",
  schema: {
    type: "object",
    properties: {
      label: { type: "string", description: "Input label" },
      startPlaceholder: { type: "string", default: "Start date" },
      endPlaceholder: { type: "string", default: "End date" },
      defaultStart: { type: "string", description: "Default start ISO date" },
      defaultEnd: { type: "string", description: "Default end ISO date" },
      enableTime: { type: "boolean", default: false },
      dateFormat: { type: "string", default: "YYYY-MM-DD" },
      minDate: { type: "string" },
      maxDate: { type: "string" },
      presets: {
        type: "array",
        description: "Quick-select preset ranges",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            start: { type: "string", description: "ISO date or relative expression e.g. 'now-7d'" },
            end: { type: "string" }
          },
          required: ["label", "start", "end"]
        }
      },
      disabled: { type: ["boolean", "string"], default: false }
    }
  },
  events: ["onClick", "onRefresh", "onLoad", "onChange", "onOpen", "onClose", "onClear"]
};

// src/schemas/html.schema.json
var html_schema_default = {
  widgetType: "html",
  description: "HTML Widget. Renders arbitrary custom HTML/CSS/JS in an isolated sandbox. Communicates with the dashboard via window.postMessage.",
  schema: {
    type: "object",
    properties: {
      html: { type: "string", description: "Full HTML document content (or body fragment)" },
      css: { type: "string", description: "Additional CSS to inject" },
      js: { type: "string", description: "JavaScript to inject. Use window.parent.postMessage({ type: 'JET_MESSAGE', data: {...} }, '*') to emit the onMessage event." },
      height: { type: ["number", "string"], description: "Widget height in px", default: 300 },
      scrollable: { type: "boolean", default: false }
    }
  },
  events: ["onClick", "onRefresh", "onLoad", "onMessage"]
};

// src/schemas/index.js
var WIDGET_CONFIG_SCHEMAS = {
  "vega-lite": vega_lite_schema_default,
  "vega": vega_schema_default,
  "table": table_schema_default,
  "button": button_schema_default,
  "text": text_schema_default,
  "stat": stat_schema_default,
  "alert": alert_schema_default,
  "form": form_schema_default,
  "image": image_schema_default,
  "iframe": iframe_schema_default,
  "date-picker": date_picker_schema_default,
  "date-range-picker": date_range_picker_schema_default,
  "html": html_schema_default
};

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
  },
  HTML: {
    name: "HTML Widget",
    value: "html"
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
      inputDefinitions: [
        { key: "event.inputDefinitions[0]", description: "Native click event" }
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
      inputDefinitions: [
        { key: "event.row", description: "Selected row object" },
        { key: "event.rowIndex", description: "Zero-based row index" }
      ]
    },
    {
      value: "onPageChange",
      label: "On Page Change",
      desc: "Fires when the table page changes",
      inputDefinitions: [
        { key: "event.page", description: "Current page number" },
        { key: "event.pageSize", description: "Rows per page (limit)" },
        { key: "event.offset", description: "Row offset (skip)" }
      ]
    },
    {
      value: "onSearch",
      label: "On Search",
      desc: "Fires when search term changes (debounced)",
      inputDefinitions: [
        { key: "event.searchTerm", description: "Debounced search term" }
      ]
    },
    {
      value: "onExport",
      label: "On Export",
      desc: "Fires when export is triggered",
      inputDefinitions: [
        { key: "event.format", description: "Export format (csv / json)" },
        { key: "event.rowCount", description: "Total rows exported" }
      ]
    },
    {
      value: "onRowSave",
      label: "On Row Save",
      desc: "Fires when an edited row is saved",
      inputDefinitions: [
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
      inputDefinitions: [
        { key: "event.selectedRows", description: "Array of selected row objects" },
        { key: "event.selectedRowIndices", description: "Array of selected row indices" }
      ]
    },
    {
      value: "onBulkExport",
      label: "On Bulk Export",
      desc: "Fires when bulk export is triggered",
      inputDefinitions: [
        { key: "event.selectedRows", description: "Array of selected row objects" },
        { key: "event.format", description: "Export format (csv / json)" }
      ]
    },
    {
      value: "onBulkAction",
      label: "On Bulk Action",
      desc: "Fires for custom bulk actions",
      inputDefinitions: [
        { key: "event.actionKey", description: "Custom action key" },
        { key: "event.selectedRows", description: "Array of selected row objects" }
      ]
    },
    {
      value: "onBulkEdit",
      label: "On Bulk Edit",
      desc: "Fires when bulk edits are saved",
      inputDefinitions: [
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
      inputDefinitions: [
        { key: "event.inputDefinitions[0]", description: "Submit payload" }
      ]
    }
  ],
  /** Form-specific events */
  form: [
    {
      value: "onSubmit",
      label: "On Submit",
      desc: "Fires when the form is submitted",
      inputDefinitions: [
        { key: "event.formData", description: "Submitted form data object" }
      ]
    },
    {
      value: "onFieldChange",
      label: "On Field Change",
      desc: "Fires when any form field changes",
      inputDefinitions: [
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
      inputDefinitions: [
        { key: "event.inputDefinitions[0]", description: "Dismiss payload" }
      ]
    }
  ],
  "date-picker": [
    {
      value: "onChange",
      label: "On Change",
      desc: "Fires when the selected date/time changes",
      inputDefinitions: [
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
      inputDefinitions: [
        { key: "event.value", description: "Cleared value (empty string)" }
      ]
    }
  ],
  "date-range-picker": [
    {
      value: "onChange",
      label: "On Change",
      desc: "Fires when the selected range changes",
      inputDefinitions: [
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
      inputDefinitions: [
        { key: "event.start", description: "Cleared start (empty string)" }
      ]
    }
  ],
  html: [
    {
      value: "onMessage",
      label: "On Message",
      desc: "Fires when custom HTML code dispatches a message",
      inputDefinitions: [
        { key: "event.data", description: "The payload object received" }
      ]
    }
  ]
};
var getWidgetEventTypes = (widgetType) => {
  const common = WIDGET_EVENT_TYPES.COMMON || [];
  const specific = WIDGET_EVENT_TYPES[widgetType] || [];
  return [...common, ...specific];
};
var getEventInputDefinitions = (widgetType, eventType) => {
  const specific = WIDGET_EVENT_TYPES[widgetType] || [];
  const specificEvent = specific.find((e) => e.value === eventType);
  if (specificEvent?.inputDefinitions) return specificEvent.inputDefinitions;
  const common = WIDGET_EVENT_TYPES.COMMON || [];
  const commonEvent = common.find((e) => e.value === eventType);
  if (commonEvent?.inputDefinitions) return commonEvent.inputDefinitions;
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
  ],
  html: [
    { name: "refresh", description: "Reload iframe content" }
  ]
};
var getWidgetMethods = (widgetType) => {
  return WIDGET_METHODS[widgetType] || [];
};
export {
  WIDGET_ADVANCED_OPTIONS,
  WIDGET_CONFIG_SCHEMAS,
  WIDGET_DATASET_ADVANCED_OPTIONS,
  WIDGET_EVENT_TYPES,
  WIDGET_METHODS,
  WIDGET_TYPES,
  getEventInputDefinitions,
  getWidgetEventTypes,
  getWidgetMethods
};
//# sourceMappingURL=index.mjs.map
