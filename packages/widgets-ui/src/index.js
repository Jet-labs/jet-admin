// Widget UI Package - React Components
// This package contains React components for rendering widgets
// Browser-compatible, depends on React and Chart.js

// Chart components
export { BarChartComponent } from "./bar/index";
export { LineChartComponent } from "./line/index";
export { PieChartComponent } from "./pie/index";
export { RadarChartComponent } from "./radar/index";
export { PolarAreaChartComponent } from "./polarArea/index";
export { ScatterChartComponent } from "./scatter/index";
export { BubbleChartComponent } from "./bubble/index";

// Advanced visualization
export { VegaLiteWidget } from "./vega/index";

// Other widget components
export { TextWidgetComponent } from "./text/index";
export { TableWidgetComponent } from "./table/index";
export { IframeWidgetComponent } from "./iframe/index";

// Widget map and configuration
export * from "./widget.map";
export { getDemoData, registerWidgets } from "./widget.config";

