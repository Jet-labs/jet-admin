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
import { HtmlConfigEditor } from "./html/htmlConfigEditor";
import { TextInputConfigEditor } from "./text-input/textInputConfigEditor";
import { SelectConfigEditor } from "./select/selectConfigEditor";
import { MultiSelectConfigEditor } from "./multi-select/multiSelectConfigEditor";
import { CheckboxConfigEditor } from "./checkbox/checkboxConfigEditor";
import { RadioGroupConfigEditor } from "./radio-group/radioGroupConfigEditor";
import { SwitchConfigEditor } from "./switch/switchConfigEditor";
import { SliderConfigEditor } from "./slider/sliderConfigEditor";
import { SearchInputConfigEditor } from "./search-input/searchInputConfigEditor";
import { FileUploadConfigEditor } from "./file-upload/fileUploadConfigEditor";
import { DividerConfigEditor } from "./divider/dividerConfigEditor";
import { TabsConfigEditor } from "./tabs/tabsConfigEditor";
import { KeyValueConfigEditor } from "./key-value/keyValueConfigEditor";
import { JsonViewerConfigEditor } from "./json-viewer/jsonViewerConfigEditor";
import { ListConfigEditor } from "./list/listConfigEditor";
import { BadgeConfigEditor } from "./badge/badgeConfigEditor";
import { ProgressConfigEditor } from "./progress/progressConfigEditor";
import { TimelineConfigEditor } from "./timeline/timelineConfigEditor";
import { VideoConfigEditor } from "./video/videoConfigEditor";
import { CodeBlockConfigEditor } from "./code-block/codeBlockConfigEditor";
import { BarChart, Component, Table, Type, TrendingUp, AlertTriangle, FileText, Image, Globe, Calendar, CalendarRange, Code, PenLine, ChevronDown, ListChecks, Check, CircleDot, ToggleRight, SlidersHorizontal, Search, Upload, Minus, Layers, Info, Braces, List, Tag, Activity, History, Video, TerminalSquare } from 'lucide-react';


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

const LazyHtmlWidget = React.lazy(() =>
  import("./html/index.js").then(module => ({ default: module.HtmlWidget }))
);

const LazyTextInputWidget = React.lazy(() =>
  import("./text-input/index.js").then(module => ({ default: module.TextInputWidget }))
);

const LazySelectWidget = React.lazy(() =>
  import("./select/index.js").then(module => ({ default: module.SelectWidget }))
);

const LazyMultiSelectWidget = React.lazy(() =>
  import("./multi-select/index.js").then(module => ({ default: module.MultiSelectWidget }))
);

const LazyCheckboxWidget = React.lazy(() =>
  import("./checkbox/index.js").then(module => ({ default: module.CheckboxWidget }))
);

const LazyRadioGroupWidget = React.lazy(() =>
  import("./radio-group/index.js").then(module => ({ default: module.RadioGroupWidget }))
);

const LazySwitchWidget = React.lazy(() =>
  import("./switch/index.js").then(module => ({ default: module.SwitchWidget }))
);

const LazySliderWidget = React.lazy(() =>
  import("./slider/index.js").then(module => ({ default: module.SliderWidget }))
);

const LazySearchInputWidget = React.lazy(() =>
  import("./search-input/index.js").then(module => ({ default: module.SearchInputWidget }))
);

const LazyFileUploadWidget = React.lazy(() =>
  import("./file-upload/index.js").then(module => ({ default: module.FileUploadWidget }))
);

const LazyDividerWidget = React.lazy(() =>
  import("./divider/index.js").then(module => ({ default: module.DividerWidget }))
);

const LazyTabsWidget = React.lazy(() =>
  import("./tabs/index.js").then(module => ({ default: module.TabsWidget }))
);

const LazyKeyValueWidget = React.lazy(() =>
  import("./key-value/index.js").then(module => ({ default: module.KeyValueWidget }))
);

const LazyJsonViewerWidget = React.lazy(() =>
  import("./json-viewer/index.js").then(module => ({ default: module.JsonViewerWidget }))
);

const LazyListWidget = React.lazy(() =>
  import("./list/index.js").then(module => ({ default: module.ListWidget }))
);

const LazyBadgeWidget = React.lazy(() =>
  import("./badge/index.js").then(module => ({ default: module.BadgeWidget }))
);

const LazyProgressWidget = React.lazy(() =>
  import("./progress/index.js").then(module => ({ default: module.ProgressWidget }))
);

const LazyTimelineWidget = React.lazy(() =>
  import("./timeline/index.js").then(module => ({ default: module.TimelineWidget }))
);

const LazyVideoWidget = React.lazy(() =>
  import("./video/index.js").then(module => ({ default: module.VideoWidget }))
);

const LazyCodeBlockWidget = React.lazy(() =>
  import("./code-block/index.js").then(module => ({ default: module.CodeBlockWidget }))
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
      isLoading: "",
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
      emptyText: "No data available.",
      emptyHint: "Ensure the data array template resolves to a non-empty array.",
      striped: true,
      dense: false,
      stickyHeader: true,
      isLoading: "",
      pagination: {
        enabled: false,
        pageParam: "page",
        pageSize: 10,
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
      isLoading: "",
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
      isLoading: "",
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
      isLoading: "",
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
      isLoading: "",
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
      isLoading: "",
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
      isLoading: "",
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
      isLoading: "",
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
      isLoading: "",
      showHeader: false,
    },
  },
  'html': {
    label: "HTML Widget",
    value: WIDGET_TYPES.HTML.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Custom HTML, CSS, and interactive scripting",
    component: ({ data, ...props }) => {
      return (
        <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading widget...</div>}>
          <LazyHtmlWidget data={data} {...props} />
        </React.Suspense>
      );
    },
    configEditor: HtmlConfigEditor,
    icon: ({ className }) => <Code className={`!text-lg ${className}`} />,
    sampleConfig: {
      html: "<div>\n  <h3>Hello Custom HTML!</h3>\n  <p>Customize this content inside properties.</p>\n</div>",
      css: "h3 {\n  color: #3b82f6;\n}\np {\n  color: #6b7280;\n}",
      allowScripts: false,
      allowForms: false,
      allowPopups: false,
      isLoading: "",
      showHeader: true,
    },
  },
  'text-input': {
    label: "Text Input",
    value: WIDGET_TYPES.TEXT_INPUT.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Single-line or multi-line text entry",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading input...</div>}>
        <LazyTextInputWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: TextInputConfigEditor,
    icon: ({ className }) => <PenLine className={`!text-lg ${className}`} />,
    sampleConfig: { label: "Name", placeholder: "Type...", inputType: "text", defaultValue: "", isLoading: "", showHeader: false },
  },
  'select': {
    label: "Select",
    value: WIDGET_TYPES.SELECT.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Single-choice dropdown",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading select...</div>}>
        <LazySelectWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: SelectConfigEditor,
    icon: ({ className }) => <ChevronDown className={`!text-lg ${className}`} />,
    sampleConfig: { label: "Status", placeholder: "Select option...", options: [{ label: "Active", value: "active" }, { label: "Archived", value: "archived" }], defaultValue: "", isLoading: "", showHeader: false },
  },
  'multi-select': {
    label: "Multi Select",
    value: WIDGET_TYPES.MULTI_SELECT.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Pick multiple options",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyMultiSelectWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: MultiSelectConfigEditor,
    icon: ({ className }) => <ListChecks className={`!text-lg ${className}`} />,
    sampleConfig: { label: "Tags", placeholder: "Select options...", options: [{ label: "VIP", value: "vip" }, { label: "New", value: "new" }], isLoading: "", showHeader: false },
  },
  'checkbox': {
    label: "Checkbox",
    value: WIDGET_TYPES.CHECKBOX.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Boolean checkbox with label",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyCheckboxWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: CheckboxConfigEditor,
    icon: ({ className }) => <Check className={`!text-lg ${className}`} />,
    sampleConfig: { label: "Include archived", defaultChecked: false, isLoading: "", showHeader: false },
  },
  'radio-group': {
    label: "Radio Group",
    value: WIDGET_TYPES.RADIO_GROUP.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Mutually exclusive options",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyRadioGroupWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: RadioGroupConfigEditor,
    icon: ({ className }) => <CircleDot className={`!text-lg ${className}`} />,
    sampleConfig: { label: "Priority", options: [{ label: "Low", value: "low" }, { label: "High", value: "high" }], orientation: "vertical", isLoading: "", showHeader: false },
  },
  'switch': {
    label: "Switch",
    value: WIDGET_TYPES.SWITCH.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "On/off toggle",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazySwitchWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: SwitchConfigEditor,
    icon: ({ className }) => <ToggleRight className={`!text-lg ${className}`} />,
    sampleConfig: { label: "Active only", defaultChecked: false, isLoading: "", showHeader: false },
  },
  'slider': {
    label: "Slider",
    value: WIDGET_TYPES.SLIDER.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Numeric range picker",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazySliderWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: SliderConfigEditor,
    icon: ({ className }) => <SlidersHorizontal className={`!text-lg ${className}`} />,
    sampleConfig: { label: "Min revenue", min: 0, max: 100, step: 1, defaultValue: 50, showValue: true, isLoading: "", showHeader: false },
  },
  'search-input': {
    label: "Search",
    value: WIDGET_TYPES.SEARCH_INPUT.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Search field with debounced event",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazySearchInputWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: SearchInputConfigEditor,
    icon: ({ className }) => <Search className={`!text-lg ${className}`} />,
    sampleConfig: { label: "", placeholder: "Search...", debounceMs: 300, defaultValue: "", isLoading: "", showHeader: false },
  },
  'file-upload': {
    label: "File Upload",
    value: WIDGET_TYPES.FILE_UPLOAD.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Pick files for workflows",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyFileUploadWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: FileUploadConfigEditor,
    icon: ({ className }) => <Upload className={`!text-lg ${className}`} />,
    sampleConfig: { label: "Upload file", buttonLabel: "Choose file", multiple: false, isLoading: "", showHeader: false },
  },
  'divider': {
    label: "Divider",
    value: WIDGET_TYPES.DIVIDER.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Visual section separator",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyDividerWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: DividerConfigEditor,
    icon: ({ className }) => <Minus className={`!text-lg ${className}`} />,
    sampleConfig: { label: "", orientation: "horizontal", thickness: "thin", spacing: "md", showHeader: false },
  },
  'tabs': {
    label: "Tabs",
    value: WIDGET_TYPES.TABS.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Tab bar driving widget state",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyTabsWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: TabsConfigEditor,
    icon: ({ className }) => <Layers className={`!text-lg ${className}`} />,
    sampleConfig: { tabs: [{ label: "Overview", value: "overview" }, { label: "Details", value: "details" }], defaultTab: "overview", isLoading: "", showHeader: false },
  },
  'key-value': {
    label: "Key Value",
    value: WIDGET_TYPES.KEY_VALUE.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Record detail panel",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyKeyValueWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: KeyValueConfigEditor,
    icon: ({ className }) => <Info className={`!text-lg ${className}`} />,
    sampleConfig: { dataTemplate: "{{ctx.data}}", columns: 1, emptyText: "No data", isLoading: "", showHeader: true },
  },
  'json-viewer': {
    label: "JSON Viewer",
    value: WIDGET_TYPES.JSON_VIEWER.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Pretty-print query results",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyJsonViewerWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: JsonViewerConfigEditor,
    icon: ({ className }) => <Braces className={`!text-lg ${className}`} />,
    sampleConfig: { dataTemplate: "{{ctx.data}}", collapsed: false, isLoading: "", showHeader: true },
  },
  'list': {
    label: "List",
    value: WIDGET_TYPES.LIST.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Rows or cards from an array",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyListWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: ListConfigEditor,
    icon: ({ className }) => <List className={`!text-lg ${className}`} />,
    sampleConfig: { dataTemplate: "{{ctx.data}}", titleKey: "title", subtitleKey: "subtitle", layout: "rows", searchable: false, emptyText: "No items", isLoading: "", showHeader: true },
  },
  'badge': {
    label: "Badge",
    value: WIDGET_TYPES.BADGE.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Status pill",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyBadgeWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: BadgeConfigEditor,
    icon: ({ className }) => <Tag className={`!text-lg ${className}`} />,
    sampleConfig: { text: "Active", variant: "default", size: "default", isLoading: "", showHeader: false },
  },
  'progress': {
    label: "Progress",
    value: WIDGET_TYPES.PROGRESS.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Bar or ring completion",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyProgressWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: ProgressConfigEditor,
    icon: ({ className }) => <Activity className={`!text-lg ${className}`} />,
    sampleConfig: { valueTemplate: "72", variant: "bar", status: "default", showValue: true, isLoading: "", showHeader: false },
  },
  'timeline': {
    label: "Timeline",
    value: WIDGET_TYPES.TIMELINE.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Activity feed",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyTimelineWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: TimelineConfigEditor,
    icon: ({ className }) => <History className={`!text-lg ${className}`} />,
    sampleConfig: { dataTemplate: "{{ctx.data}}", titleKey: "title", timeKey: "time", descriptionKey: "description", emptyText: "No activity yet", isLoading: "", showHeader: true },
  },
  'video': {
    label: "Video",
    value: WIDGET_TYPES.VIDEO.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Embed video by URL",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyVideoWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: VideoConfigEditor,
    icon: ({ className }) => <Video className={`!text-lg ${className}`} />,
    sampleConfig: { src: "", controls: true, autoplay: false, loop: false, muted: false, isLoading: "", showHeader: false },
  },
  'code-block': {
    label: "Code Block",
    value: WIDGET_TYPES.CODE_BLOCK.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "SQL / JSON / logs with copy",
    component: ({ data, ...props }) => (
      <React.Suspense fallback={<div className="flex justify-center items-center h-full text-xs text-brand-text-primary">Loading...</div>}>
        <LazyCodeBlockWidget data={data} {...props} />
      </React.Suspense>
    ),
    configEditor: CodeBlockConfigEditor,
    icon: ({ className }) => <TerminalSquare className={`!text-lg ${className}`} />,
    sampleConfig: { code: "SELECT * FROM orders LIMIT 10;", language: "sql", showCopy: true, isLoading: "", showHeader: true },
  },
};

