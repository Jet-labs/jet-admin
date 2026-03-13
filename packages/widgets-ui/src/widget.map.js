import React from "react";
import { FaChartBar } from "react-icons/fa";
import { getDemoData, registerWidgets } from "./widget.config";
import { WIDGET_TYPES, WIDGET_INITIAL_CONFIG } from "@jet-admin/widget-types";
import { VegaConfigEditor } from "./vega/vegaConfigEditor";
import { ButtonConfigEditor } from "./button/buttonConfigEditor";
import { MdOutlineSmartButton } from "react-icons/md";


// Register widgets
registerWidgets();

// Hoist lazy-loaded component outside render to avoid re-creation on every render
const LazyVegaWidget = React.lazy(() =>
  import("./vega/index.js").then(module => ({ default: module.VegaWidget }))
);

const LazyButtonWidget = React.lazy(() =>
  import("./button/index.js").then(module => ({ default: module.ButtonWidget }))
);


// Widget map - only Vega and Vega-Lite
export const WIDGETS_MAP = {
  'vega-lite': {
    label: "Vega-Lite",
    value: WIDGET_TYPES.VEGA_LITE.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Declarative visualization grammar",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-slate-400">Loading chart...</div>}>
          <LazyVegaWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => <FaChartBar className={`!text-lg ${className}`} />,
    sampleConfig: WIDGET_INITIAL_CONFIG["vega-lite"] || {},
  },
  'vega': {
    label: "Vega",
    value: WIDGET_TYPES.VEGA.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Low-level visualization grammar",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-slate-400">Loading chart...</div>}>
          <LazyVegaWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => <FaChartBar className={`!text-lg ${className}`} />,
    sampleConfig: WIDGET_INITIAL_CONFIG.vega || {},
  },
  'button': {
    label: "Button",
    value: WIDGET_TYPES.BUTTON.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Trigger a workflow",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-slate-400">Loading button...</div>}>
          <LazyButtonWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: ButtonConfigEditor,
    icon: ({ className }) => <MdOutlineSmartButton className={`!text-lg ${className}`} />,
    sampleConfig: WIDGET_INITIAL_CONFIG.button || {},
  },
};

