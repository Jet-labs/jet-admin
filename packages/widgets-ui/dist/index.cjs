var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/vega/index.js
var vega_exports = {};
__export(vega_exports, {
  VegaWidget: () => VegaWidget,
  default: () => vega_default
});
var import_react, import_vega_embed, VegaWidget, vega_default;
var init_vega = __esm({
  "src/vega/index.js"() {
    import_react = __toESM(require("react"));
    import_vega_embed = __toESM(require("vega-embed"));
    VegaWidget = ({
      data,
      // Processed Vega/Vega-Lite spec from processor
      widgetConfig,
      // Widget-level config (showActions, renderer, theme)
      onSignal,
      // Callback for selections/interactions
      onError,
      // Error handler
      onWidgetInit
      // Callback when widget initializes
    }) => {
      const containerRef = (0, import_react.useRef)(null);
      const viewRef = (0, import_react.useRef)(null);
      const [error, setError] = (0, import_react.useState)(null);
      const [loading, setLoading] = (0, import_react.useState)(true);
      const handleError = (0, import_react.useCallback)((err) => {
        setError(err.message || "Visualization error");
        setLoading(false);
        onError?.(err);
      }, [onError]);
      (0, import_react.useEffect)(() => {
        if (!containerRef.current) return;
        if (!data || !data.$schema) {
          setLoading(false);
          setError("No visualization spec provided");
          return;
        }
        const renderChart = async () => {
          try {
            setLoading(true);
            setError(null);
            if (viewRef.current) {
              viewRef.current.finalize();
              viewRef.current = null;
            }
            const embedOptions = {
              actions: widgetConfig?.showActions ?? false,
              renderer: widgetConfig?.renderer ?? "svg",
              theme: widgetConfig?.theme ?? void 0,
              tooltip: { theme: "dark" },
              config: {
                background: "transparent",
                view: { stroke: "transparent" }
              }
            };
            const result = await (0, import_vega_embed.default)(containerRef.current, data, embedOptions);
            viewRef.current = result.view;
            setLoading(false);
            onWidgetInit?.(result.view);
            if (onSignal && data.params) {
              for (const param of data.params) {
                if (param.name) {
                  result.view.addSignalListener(param.name, (name, value) => {
                    onSignal(name, value);
                  });
                }
              }
            }
          } catch (err) {
            handleError(err);
          }
        };
        renderChart();
        return () => {
          if (viewRef.current) {
            viewRef.current.finalize();
            viewRef.current = null;
          }
        };
      }, [data, widgetConfig, onSignal, onWidgetInit, handleError]);
      return /* @__PURE__ */ import_react.default.createElement("div", { style: { width: "100%", height: "100%", position: "relative" } }, loading && !error && /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            color: "#94a3b8",
            fontSize: "13px",
            pointerEvents: "none"
          }
        },
        /* @__PURE__ */ import_react.default.createElement("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          borderRadius: "6px",
          backgroundColor: "rgba(241, 245, 249, 0.9)"
        } }, /* @__PURE__ */ import_react.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", style: { animation: "spin 1s linear infinite" } }, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), /* @__PURE__ */ import_react.default.createElement("style", null, `@keyframes spin { to { transform: rotate(360deg); } }`), "Loading visualization\u2026")
      ), error && /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            textAlign: "center",
            zIndex: 20,
            pointerEvents: "none"
          }
        },
        /* @__PURE__ */ import_react.default.createElement("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          borderRadius: "6px",
          backgroundColor: "rgba(254, 242, 242, 0.95)",
          color: "#dc2626",
          fontSize: "13px",
          border: "1px solid rgba(220, 38, 38, 0.2)"
        } }, /* @__PURE__ */ import_react.default.createElement("span", null, "\u26A0"), /* @__PURE__ */ import_react.default.createElement("span", null, error))
      ), /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          ref: containerRef,
          style: {
            width: "100%",
            height: "100%",
            visibility: error ? "hidden" : "visible"
          }
        }
      ));
    };
    vega_default = VegaWidget;
  }
});

// src/index.js
var index_exports = {};
__export(index_exports, {
  VegaWidget: () => VegaWidget,
  WIDGETS_MAP: () => WIDGETS_MAP,
  getDemoData: () => getDemoData,
  registerWidgets: () => registerWidgets
});
module.exports = __toCommonJS(index_exports);
init_vega();

// src/widget.map.js
var import_react2 = __toESM(require("react"));
var import_fa = require("react-icons/fa");

// src/widget.config.js
var registerWidgets = () => {
};
var getDemoData = (type) => {
  switch (type) {
    case "vega":
      return {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        description: "A simple bar chart with embedded data.",
        width: 400,
        height: 200,
        padding: 5,
        data: [
          {
            name: "table",
            values: [
              { category: "A", amount: 28 },
              { category: "B", amount: 55 },
              { category: "C", amount: 43 },
              { category: "D", amount: 91 },
              { category: "E", amount: 81 },
              { category: "F", amount: 53 },
              { category: "G", amount: 19 },
              { category: "H", amount: 87 }
            ]
          }
        ],
        signals: [
          {
            name: "tooltip",
            value: {},
            on: [
              { events: "rect:mouseover", update: "datum" },
              { events: "rect:mouseout", update: "{}" }
            ]
          }
        ],
        scales: [
          {
            name: "xscale",
            type: "band",
            domain: { data: "table", field: "category" },
            range: "width",
            padding: 0.05,
            round: true
          },
          {
            name: "yscale",
            domain: { data: "table", field: "amount" },
            nice: true,
            range: "height"
          }
        ],
        axes: [
          { orient: "bottom", scale: "xscale" },
          { orient: "left", scale: "yscale" }
        ],
        marks: [
          {
            type: "rect",
            from: { data: "table" },
            encode: {
              enter: {
                x: { scale: "xscale", field: "category" },
                width: { scale: "xscale", band: 1 },
                y: { scale: "yscale", field: "amount" },
                y2: { scale: "yscale", value: 0 }
              },
              update: {
                fill: { value: "steelblue" }
              },
              hover: {
                fill: { value: "red" }
              }
            }
          }
        ]
      };
    case "vega-lite":
      return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "A simple bar chart with embedded data.",
        data: {
          values: [
            { category: "A", value: 28 },
            { category: "B", value: 55 },
            { category: "C", value: 43 },
            { category: "D", value: 91 },
            { category: "E", value: 81 }
          ]
        },
        mark: "bar",
        encoding: {
          x: { field: "category", type: "nominal", axis: { labelAngle: 0 } },
          y: { field: "value", type: "quantitative" }
        }
      };
    default:
      return {};
  }
};

// src/widget.map.js
var import_widget_types = require("@jet-admin/widget-types");
registerWidgets();
var LazyVegaWidget = import_react2.default.lazy(
  () => Promise.resolve().then(() => (init_vega(), vega_exports)).then((module2) => ({ default: module2.VegaWidget }))
);
var WIDGETS_MAP = {
  "vega-lite": {
    label: "Vega-Lite",
    value: import_widget_types.WIDGET_TYPES.VEGA_LITE.value,
    datasetFields: [],
    description: "Declarative visualization grammar",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Suspense, { fallback: /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-slate-400" }, "Loading chart...") }, /* @__PURE__ */ import_react2.default.createElement(LazyVegaWidget, { data, ...props }));
    },
    icon: ({ className }) => /* @__PURE__ */ import_react2.default.createElement(import_fa.FaChartBar, { className: `!text-lg ${className}` }),
    sampleConfig: import_widget_types.WIDGET_INITIAL_CONFIG["vega-lite"] || {}
  },
  "vega": {
    label: "Vega",
    value: import_widget_types.WIDGET_TYPES.VEGA.value,
    datasetFields: [],
    description: "Low-level visualization grammar",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Suspense, { fallback: /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-slate-400" }, "Loading chart...") }, /* @__PURE__ */ import_react2.default.createElement(LazyVegaWidget, { data, ...props }));
    },
    icon: ({ className }) => /* @__PURE__ */ import_react2.default.createElement(import_fa.FaChartBar, { className: `!text-lg ${className}` }),
    sampleConfig: import_widget_types.WIDGET_INITIAL_CONFIG.vega || {}
  }
};
//# sourceMappingURL=index.cjs.map
