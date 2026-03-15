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