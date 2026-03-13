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
};

export const WIDGET_INITIAL_CONFIG = {
  "vega-lite": {
    options: {
      showActions: false,
      renderer: "svg",
      theme: undefined,
    },
  },
  vega: {
    options: {
      showActions: false,
      renderer: "svg",
      theme: undefined,
    },
  },
  button: {
    text: "Click Me",
    variant: "default",
    size: "default",
  },
};

// Advanced options for Vega widgets (minimal set)
export const WIDGET_ADVANCED_OPTIONS = [
  {
    name: "Show Actions",
    key: "widgetConfig.options.showActions",
    type: "boolean",
    description: "Show Vega embed action buttons",
    relevantWidgets: ["vega", "vega-lite"],
    defaultValue: false,
  },
  {
    name: "Renderer",
    key: "widgetConfig.options.renderer",
    type: "select",
    description: "Rendering engine for the chart",
    options: ["svg", "canvas"],
    relevantWidgets: ["vega", "vega-lite"],
  },
];

// No dataset-specific advanced options for Vega widgets
export const WIDGET_DATASET_ADVANCED_OPTIONS = [];