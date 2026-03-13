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
  }
};
var WIDGET_INITIAL_CONFIG = {
  "vega-lite": {
    options: {
      showActions: false,
      renderer: "svg",
      theme: void 0
    }
  },
  vega: {
    options: {
      showActions: false,
      renderer: "svg",
      theme: void 0
    }
  },
  button: {
    text: "Click Me",
    variant: "default",
    size: "default"
  }
};
var WIDGET_ADVANCED_OPTIONS = [
  {
    name: "Show Actions",
    key: "widgetConfig.options.showActions",
    type: "boolean",
    description: "Show Vega embed action buttons",
    relevantWidgets: ["vega", "vega-lite"],
    defaultValue: false
  },
  {
    name: "Renderer",
    key: "widgetConfig.options.renderer",
    type: "select",
    description: "Rendering engine for the chart",
    options: ["svg", "canvas"],
    relevantWidgets: ["vega", "vega-lite"]
  }
];
var WIDGET_DATASET_ADVANCED_OPTIONS = [];
export {
  WIDGET_ADVANCED_OPTIONS,
  WIDGET_DATASET_ADVANCED_OPTIONS,
  WIDGET_INITIAL_CONFIG,
  WIDGET_TYPES
};
//# sourceMappingURL=index.mjs.map
