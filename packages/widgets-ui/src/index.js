// Widget UI Package - React Components
// This package contains React components for rendering widgets
// Browser-compatible, depends on React

// Vega visualization (primary widget type)
export { VegaWidget } from "./vega/index";
export { VegaConfigEditor } from "./vega/vegaConfigEditor";

// Table widget
export { TableWidget } from "./table/tableWidget";
export { TableConfigEditor } from "./table/tableConfigEditor";

// Widget map and configuration
export * from "./widget.map";
export { getDemoData, registerWidgets } from "./widget.config";

// Text / Markdown
export { TextWidget } from "./text/textWidget";
export { TextConfigEditor } from "./text/textConfigEditor";

// Stat / KPI
export { StatWidget } from "./stat/statWidget";
export { StatConfigEditor } from "./stat/statConfigEditor";

// Alert Banner
export { AlertWidget } from "./alert/alertWidget";
export { AlertConfigEditor } from "./alert/alertConfigEditor";

// Form
export { FormWidget } from "./form/formWidget";
export { FormConfigEditor } from "./form/formConfigEditor";

// Image
export { ImageWidget } from "./image/imageWidget";
export { ImageConfigEditor } from "./image/imageConfigEditor";

// IFrame Embed
export { IframeWidget } from "./iframe/iframeWidget";
export { IframeConfigEditor } from "./iframe/iframeConfigEditor";

// Date and Time Pickers
export * from "./date-picker";
export * from "./date-range-picker";

// HTML Widget
export { HtmlWidget } from "./html/htmlWidget";
export { HtmlConfigEditor } from "./html/htmlConfigEditor";

// Shared components removed, TemplateAutocompleteInput moved to @jet-admin/ui
