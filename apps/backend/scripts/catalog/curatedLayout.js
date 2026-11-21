/** Content sizing using fields preserved by both Craft editor and page viewer. */
const CONTENT_HEIGHTS = { "vega-lite": 360, vega: 360, table: 440, timeline: 360, "json-viewer": 320 };

function sizeCuratedPage(config, widgetTypeForID) {
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === "widget") {
      const type = widgetTypeForID(node.widgetKey.split("_")[1]);
      if (CONTENT_HEIGHTS[type]) {
        // minHeight is not carried through treeNodeToCraft/craftToTree.
        node.height = CONTENT_HEIGHTS[type];
        node.sizing = "fixed";
        node.fixedHeight = node.height;
        delete node.minHeight;
      }
    }
    (node.children || []).forEach(visit);
  }
  visit(config.layout);
  return config;
}

function readableChart(widgetConfig) {
  if (!widgetConfig.vegaSpec) return widgetConfig;
  const spec = widgetConfig.vegaSpec;
  // An explicit plot surface keeps axes readable in either application theme.
  // Do not assume Vega inherits CSS foreground tokens from the surrounding card.
  spec.background = "#ffffff";
  spec.padding = 12;
  spec.autosize = { type: "fit", contains: "padding" };
  spec.config = {
    ...spec.config,
    axis: { ...spec.config?.axis, labelColor: "#374151", titleColor: "#111827", gridColor: "#e5e7eb", domainColor: "#9ca3af", labelFontSize: 12, titleFontSize: 12 },
    legend: { ...spec.config?.legend, labelColor: "#374151", titleColor: "#111827", labelFontSize: 12, orient: "bottom" },
    view: { ...spec.config?.view, stroke: null },
  };
  return widgetConfig;
}

module.exports = { CONTENT_HEIGHTS, sizeCuratedPage, readableChart };
