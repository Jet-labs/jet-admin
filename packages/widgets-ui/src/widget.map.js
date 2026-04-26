import React from "react";
import { FaChartBar } from "react-icons/fa";
import { getDemoData, registerWidgets } from "./widget.config";
import { WIDGET_TYPES } from "@jet-admin/widget-types";
import { VegaConfigEditor } from "./vega/vegaConfigEditor";
import { VegaDataMappingEditor } from "./vega/vegaDataMappingEditor";
import { ButtonConfigEditor } from "./button/buttonConfigEditor";
import { TableConfigEditor } from "./table/tableConfigEditor";
import { TableDataMappingEditor } from "./table/tableDataMappingEditor";
import { MdOutlineSmartButton, MdOutlineTableChart } from "react-icons/md";


// Register widgets
registerWidgets();

// Hoist lazy-loaded component outside render to avoid re-creation on every render
const LazyVegaWidget = React.lazy(() =>
  import("./vega/index.js").then(module => ({ default: module.VegaWidget }))
);

const LazyButtonWidget = React.lazy(() =>
  import("./button/index.js").then(module => ({ default: module.ButtonWidget }))
);

const LazyTableWidget = React.lazy(() =>
  import("./table/index.js").then(module => ({ default: module.TableWidget }))
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
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-[#1c1c1e]">Loading chart...</div>}>
          <LazyVegaWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: VegaConfigEditor,
    dataMappingEditor: VegaDataMappingEditor,
    icon: ({ className }) => <FaChartBar className={`!text-lg ${className}`} />,
    sampleConfig: {
      options: {
        showActions: false,
        renderer: "svg",
        theme: undefined,
      },
      showHeader: true,
    },
  },
  'vega': {
    label: "Vega",
    value: WIDGET_TYPES.VEGA.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Low-level visualization grammar",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-[#1c1c1e]">Loading chart...</div>}>
          <LazyVegaWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: VegaConfigEditor,
    dataMappingEditor: VegaDataMappingEditor,
    icon: ({ className }) => <FaChartBar className={`!text-lg ${className}`} />,
    sampleConfig: {
      options: {
        showActions: false,
        renderer: "svg",
        theme: undefined,
      },
      showHeader: true,
    },
  },
  'button': {
    label: "Button",
    value: WIDGET_TYPES.BUTTON.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Trigger a workflow",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-[#1c1c1e]">Loading button...</div>}>
          <LazyButtonWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: ButtonConfigEditor,
    dataMappingEditor: null,
    icon: ({ className }) => <MdOutlineSmartButton className={`!text-lg ${className}`} />,
    sampleConfig: {
      text: "Click Me",
      variant: "default",
      size: "default",
      showHeader: true,
    },
  },
  'table': {
    label: "Data Table",
    value: WIDGET_TYPES.TABLE.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Tabular data display with pagination",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-[#1c1c1e]">Loading table...</div>}>
          <LazyTableWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: TableConfigEditor,
    dataMappingEditor: TableDataMappingEditor,
    icon: ({ className }) => <MdOutlineTableChart className={`!text-lg ${className}`} />,
    sampleConfig: {
      dataArrayTemplate: "{{ctx.data}}",
      columns: [],
      pagination: {
        enabled: false,
        pageParam: "page",
        totalTemplate: "{{ctx.total}}",
      },
      showHeader: true,
    },
  },
};

