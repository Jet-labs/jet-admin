var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/vega/index.js
var vega_exports = {};
__export(vega_exports, {
  VegaWidget: () => VegaWidget,
  default: () => vega_default
});
import React, { useEffect, useRef, useState, useCallback } from "react";
import vegaEmbed from "vega-embed";
var VegaWidget, vega_default;
var init_vega = __esm({
  "src/vega/index.js"() {
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
      const containerRef = useRef(null);
      const viewRef = useRef(null);
      const [error, setError] = useState(null);
      const [loading, setLoading] = useState(true);
      const handleError = useCallback((err) => {
        setError(err.message || "Visualization error");
        setLoading(false);
        onError?.(err);
      }, [onError]);
      useEffect(() => {
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
            const result = await vegaEmbed(containerRef.current, data, embedOptions);
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
      return /* @__PURE__ */ React.createElement("div", { style: { width: "100%", height: "100%", position: "relative" } }, loading && !error && /* @__PURE__ */ React.createElement(
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
        /* @__PURE__ */ React.createElement("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          borderRadius: "6px",
          backgroundColor: "rgba(241, 245, 249, 0.9)"
        } }, /* @__PURE__ */ React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", style: { animation: "spin 1s linear infinite" } }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), /* @__PURE__ */ React.createElement("style", null, `@keyframes spin { to { transform: rotate(360deg); } }`), "Loading visualization\u2026")
      ), error && /* @__PURE__ */ React.createElement(
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
        /* @__PURE__ */ React.createElement("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          borderRadius: "6px",
          backgroundColor: "rgba(254, 242, 242, 0.95)",
          color: "#dc2626",
          fontSize: "13px",
          border: "1px solid rgba(220, 38, 38, 0.2)"
        } }, /* @__PURE__ */ React.createElement("span", null, "\u26A0"), /* @__PURE__ */ React.createElement("span", null, error))
      ), /* @__PURE__ */ React.createElement(
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
init_vega();

// src/widget.map.js
import React2 from "react";
import { FaChartBar } from "react-icons/fa";

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
import { WIDGET_TYPES, WIDGET_INITIAL_CONFIG } from "@jet-admin/widget-types";
registerWidgets();
var LazyVegaWidget = React2.lazy(
  () => Promise.resolve().then(() => (init_vega(), vega_exports)).then((module) => ({ default: module.VegaWidget }))
);
var WIDGETS_MAP = {
  "vega-lite": {
    label: "Vega-Lite",
    value: WIDGET_TYPES.VEGA_LITE.value,
    datasetFields: [],
    description: "Declarative visualization grammar",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ React2.createElement(React2.Suspense, { fallback: /* @__PURE__ */ React2.createElement("div", { className: "flex justify-center items-center h-full text-xs text-slate-400" }, "Loading chart...") }, /* @__PURE__ */ React2.createElement(LazyVegaWidget, { data, ...props }));
    },
    icon: ({ className }) => /* @__PURE__ */ React2.createElement(FaChartBar, { className: `!text-lg ${className}` }),
    sampleConfig: WIDGET_INITIAL_CONFIG["vega-lite"] || {}
  },
  "vega": {
    label: "Vega",
    value: WIDGET_TYPES.VEGA.value,
    datasetFields: [],
    description: "Low-level visualization grammar",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ React2.createElement(React2.Suspense, { fallback: /* @__PURE__ */ React2.createElement("div", { className: "flex justify-center items-center h-full text-xs text-slate-400" }, "Loading chart...") }, /* @__PURE__ */ React2.createElement(LazyVegaWidget, { data, ...props }));
    },
    icon: ({ className }) => /* @__PURE__ */ React2.createElement(FaChartBar, { className: `!text-lg ${className}` }),
    sampleConfig: WIDGET_INITIAL_CONFIG.vega || {}
  }
};
export {
  VegaWidget,
  WIDGETS_MAP,
  getDemoData,
  registerWidgets
};
//# sourceMappingURL=index.mjs.map
