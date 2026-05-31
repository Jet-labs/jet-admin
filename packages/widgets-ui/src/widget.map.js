import React from "react";
import { getDemoData, registerWidgets } from "./widget.config";
import { WIDGET_TYPES } from "@jet-admin/widget-types";
import { VegaConfigEditor } from "./vega/vegaConfigEditor";
import { ButtonConfigEditor } from "./button/buttonConfigEditor";
import { TableConfigEditor } from "./table/tableConfigEditor";
import { TextConfigEditor } from "./text/textConfigEditor";
import { StatConfigEditor } from "./stat/statConfigEditor";
import { AlertConfigEditor } from "./alert/alertConfigEditor";
import { FormConfigEditor } from "./form/formConfigEditor";
import { ImageConfigEditor } from "./image/imageConfigEditor";
import { IframeConfigEditor } from "./iframe/iframeConfigEditor";
import { DatePickerConfigEditor } from "./date-picker/datePickerConfigEditor";
import { DateRangePickerConfigEditor } from "./date-range-picker/dateRangePickerConfigEditor";
import { BarChart, Component, Table, Type, TrendingUp, AlertTriangle, FileText, Image, Globe, Calendar, CalendarRange } from 'lucide-react';


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


const LazyTextWidget = React.lazy(() =>
  import("./text/index.js").then(module => ({ default: module.TextWidget }))
);

const LazyStatWidget = React.lazy(() =>
  import("./stat/index.js").then(module => ({ default: module.StatWidget }))
);

const LazyAlertWidget = React.lazy(() =>
  import("./alert/index.js").then(module => ({ default: module.AlertWidget }))
);

const LazyFormWidget = React.lazy(() =>
  import("./form/index.js").then(module => ({ default: module.FormWidget }))
);

const LazyImageWidget = React.lazy(() =>
  import("./image/index.js").then(module => ({ default: module.ImageWidget }))
);

const LazyIframeWidget = React.lazy(() =>
  import("./iframe/index.js").then(module => ({ default: module.IframeWidget }))
);

const LazyDatePickerWidget = React.lazy(() =>
  import("./date-picker/index.js").then(module => ({ default: module.DatePickerWidget }))
);

const LazyDateRangePickerWidget = React.lazy(() =>
  import("./date-range-picker/index.js").then(module => ({ default: module.DateRangePickerWidget }))
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
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading chart...</div>}>
          <LazyVegaWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => <BarChart className={`!text-lg ${className}`} />,
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
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading chart...</div>}>
          <LazyVegaWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => <BarChart className={`!text-lg ${className}`} />,
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
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading button...</div>}>
          <LazyButtonWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: ButtonConfigEditor,
    icon: ({ className }) => <Component className={`!text-lg ${className}`} />,
    sampleConfig: {
      text: "Click Me",
      variant: "default",
      size: "default",
      showHeader: false,
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
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading table...</div>}>
          <LazyTableWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: TableConfigEditor,
    icon: ({ className }) => <Table className={`!text-lg ${className}`} />,
    sampleConfig: {
      dataArrayTemplate: "{{ctx.data}}",
      columns: [],
      isLoading: "",
      pagination: {
        enabled: false,
        pageParam: "page",
        totalTemplate: "{{ctx.total}}",
      },
      search: {
        enabled: false,
        serverSide: false,
        placeholder: "Search...",
      },
      export: {
        enabled: false,
        format: "csv",
        serverSide: false,
        buttonLabel: "Export",
      },
      editing: {
        enabled: false,
      },
      multiSelect: {
        enabled: false,
        showSelectAll: true,
        actions: [],
      },
      bulkEdit: {
        enabled: false,
        saveLabel: "Save All Changes",
      },
      showHeader: true,
    },
  },
  'text': {
    label: "Text / Markdown",
    value: WIDGET_TYPES.TEXT.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Display text or markdown",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading text...</div>}>
          <LazyTextWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: TextConfigEditor,
    icon: ({ className }) => <Type className={`!text-lg ${className}`} />,
    sampleConfig: {
      content: "### Heading\n\nEdit this markdown in the properties tab.",
      format: "markdown",
      textAlign: "left",
      fontSize: "sm",
      showHeader: false,
    },
  },
  'stat': {
    label: "Stat / KPI",
    value: WIDGET_TYPES.STAT.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Display a metric / KPI card",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading stat...</div>}>
          <LazyStatWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: StatConfigEditor,
    icon: ({ className }) => <TrendingUp className={`!text-lg ${className}`} />,
    sampleConfig: {
      label: "Metric Label",
      valueTemplate: "42",
      prefix: "",
      suffix: "",
      trendTemplate: "",
      trendDirection: "up-is-good",
      textAlign: "center",
      showHeader: false,
    },
  },
  'alert': {
    label: "Alert Banner",
    value: WIDGET_TYPES.ALERT.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Display a colored banner message",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading alert...</div>}>
          <LazyAlertWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: AlertConfigEditor,
    icon: ({ className }) => <AlertTriangle className={`!text-lg ${className}`} />,
    sampleConfig: {
      title: "Notice",
      message: "This is a banner notice.",
      variant: "info",
      dismissible: true,
      showHeader: false,
    },
  },
  'form': {
    label: "Form",
    value: WIDGET_TYPES.FORM.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Capture user input and trigger workflows",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading form...</div>}>
          <LazyFormWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: FormConfigEditor,
    icon: ({ className }) => <FileText className={`!text-lg ${className}`} />,
    sampleConfig: {
      fields: [],
      submitLabel: "Submit",
      size: "default",
      showReset: false,
      showHeader: true,
    },
  },
  'image': {
    label: "Image",
    value: WIDGET_TYPES.IMAGE.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Display an image",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading image...</div>}>
          <LazyImageWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: ImageConfigEditor,
    icon: ({ className }) => <Image className={`!text-lg ${className}`} />,
    sampleConfig: {
      src: "",
      alt: "Image Content",
      objectFit: "cover",
      borderRadius: "none",
      showHeader: false,
    },
  },
  'iframe': {
    label: "IFrame Embed",
    value: WIDGET_TYPES.IFRAME.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Embed an external webpage",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading embed...</div>}>
          <LazyIframeWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: IframeConfigEditor,
    icon: ({ className }) => <Globe className={`!text-lg ${className}`} />,
    sampleConfig: {
      url: "",
      allowScripts: true,
      allowForms: true,
      allowPopups: false,
      allowSameOrigin: false,
      showHeader: false,
    },
  },
  'date-picker': {
    label: "Date / Time Picker",
    value: WIDGET_TYPES.DATE_PICKER.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Select a single date and optional time",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading picker...</div>}>
          <LazyDatePickerWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: DatePickerConfigEditor,
    icon: ({ className }) => <Calendar className={`!text-lg ${className}`} />,
    sampleConfig: {
      label: "Select Date",
      placeholder: "Choose a date...",
      enableTime: false,
      defaultValue: "",
      showHeader: false,
    },
  },
  'date-range-picker': {
    label: "Date Range Picker",
    value: WIDGET_TYPES.DATE_RANGE_PICKER.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Select a range of dates and optional times",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading range picker...</div>}>
          <LazyDateRangePickerWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: DateRangePickerConfigEditor,
    icon: ({ className }) => <CalendarRange className={`!text-lg ${className}`} />,
    sampleConfig: {
      label: "Select Date Range",
      placeholderStart: "Start date",
      placeholderEnd: "End date",
      enableTime: false,
      defaultStart: "",
      defaultEnd: "",
      presets: [
        { label: "Today", startOffset: 0, endOffset: 0 },
        { label: "Last 7 days", startOffset: -7, endOffset: 0 },
        { label: "This month", startOffset: "startOfMonth", endOffset: "endOfMonth" }
      ],
      showHeader: false,
    },
  },
};

