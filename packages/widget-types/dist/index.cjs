var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  WIDGET_ADVANCED_OPTIONS: () => WIDGET_ADVANCED_OPTIONS,
  WIDGET_DATASET_ADVANCED_OPTIONS: () => WIDGET_DATASET_ADVANCED_OPTIONS,
  WIDGET_INITIAL_CONFIG: () => WIDGET_INITIAL_CONFIG,
  WIDGET_TYPES: () => WIDGET_TYPES
});
module.exports = __toCommonJS(index_exports);
var WIDGET_TYPES = {
  VEGA_LITE: {
    name: "Vega-Lite Chart",
    value: "vega-lite"
  },
  VEGA: {
    name: "Vega Chart",
    value: "vega"
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
//# sourceMappingURL=index.cjs.map
