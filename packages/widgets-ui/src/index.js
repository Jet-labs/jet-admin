// Widget UI Package - React Components
// This package contains React components for rendering widgets
// Browser-compatible, depends on React

// Vega visualization (primary widget type)
export { VegaWidget } from "./vega/index";

// Widget map and configuration
export * from "./widget.map";
export { getDemoData, registerWidgets } from "./widget.config";
