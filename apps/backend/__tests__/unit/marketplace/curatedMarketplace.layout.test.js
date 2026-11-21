/**
 * Regression tests for curated page sizing through the real frontend Craft adapter.
 * No browser: the adapter is bundled from source with esbuild and run in-process.
 */
const path = require("path");
const { buildSync } = require("esbuild");
const { buildCuratedCatalog } = require("../../../scripts/catalog/curatedMarketplace");
const { CONTENT_HEIGHTS } = require("../../../scripts/catalog/curatedLayout");

jest.mock("../../../utils/logger", () => ({ log: jest.fn() }));
jest.setTimeout(120000);

const ADAPTER = path.resolve(
  __dirname,
  "../../../../frontend/src/presentation/components/appPageComponents/layout/engine/craftAdapter.js"
);
const adapterSource = buildSync({
  entryPoints: [ADAPTER],
  bundle: true,
  write: false,
  format: "cjs",
  platform: "node",
}).outputFiles[0].text;
const adapterModule = { exports: {} };
new Function("module", "exports", adapterSource)(adapterModule, adapterModule.exports);
const { treeToCraft, craftToTree } = adapterModule.exports;

const catalog = buildCuratedCatalog();
const pages = [];
for (const entry of catalog) {
  for (const item of entry.payload.items) {
    if (item.type !== "appPage") continue;
    const widgetTypes = new Map(
      entry.payload.items.filter((i) => i.type === "widget").map((i) => [i.id, i.payload.widgetType])
    );
    pages.push({ entry, item, config: item.payload.appPageConfig, widgetTypes });
  }
}

function widgetNodes(node, out = []) {
  if (!node || typeof node !== "object") return out;
  if (node.type === "widget") out.push(node);
  (node.children || []).forEach((child) => widgetNodes(child, out));
  return out;
}

function roundTrip(tree) {
  const restored = craftToTree(JSON.parse(treeToCraft(tree)), "ROOT");
  return { ...restored, id: tree.id };
}

test("real catalog pages carry explicit content heights that the Craft adapter keeps", () => {
  expect(pages).toHaveLength(19);
  const seen = {};
  for (const { entry, config, widgetTypes } of pages) {
    for (const node of widgetNodes(config.layout)) {
      const type = widgetTypes.get(node.widgetKey.split("_")[1]);
      if (CONTENT_HEIGHTS[type]) {
        seen[type] = (seen[type] || 0) + 1;
        expect(node.height).toBe(CONTENT_HEIGHTS[type]);
        expect(node.fixedHeight).toBe(CONTENT_HEIGHTS[type]);
        expect(node.sizing).toBe("fixed");
        expect(node).not.toHaveProperty("minHeight");
      } else {
        expect(node.height).toBeUndefined();
        expect(node.fixedHeight).toBeUndefined();
      }
    }
  }
  expect(seen["vega-lite"]).toBeGreaterThan(0);
  expect(seen.table).toBeGreaterThan(0);
  expect(seen.timeline).toBeGreaterThan(0);
  expect(seen["json-viewer"]).toBeGreaterThan(0);
});

test("every curated layout survives the real tree -> Craft -> tree roundtrip", () => {
  for (const { entry, config } of pages) {
    const tree = structuredClone(config.layout);
    const beforeKeys = widgetNodes(tree).map((n) => n.widgetKey).sort();
    const restored = roundTrip(tree);
    expect(restored).toEqual(tree);
    expect(widgetNodes(restored).map((n) => n.widgetKey).sort()).toEqual(beforeKeys);
    for (const key of beforeKeys) expect(config.widgets).toContain(key);
  }
});

test("sizing and readable chart config never rewrite page source references", () => {
  for (const { entry, config } of pages) {
    const sources = structuredClone(config.dataSources);
    const widgets = [...config.widgets];
    const chartWidgets = entry.payload.items
      .filter((i) => i.type === "widget" && ["vega", "vega-lite"].includes(i.payload.widgetType));
    for (const chart of chartWidgets) {
      const spec = chart.payload.widgetConfig.vegaSpec;
      expect(spec.background).toBe("#ffffff");
      expect(spec.padding).toBe(12);
      expect(spec.autosize).toEqual({ type: "fit", contains: "padding" });
      expect(spec.config.axis).toMatchObject({
        labelColor: "#374151", titleColor: "#111827", labelFontSize: 12, titleFontSize: 12,
      });
      expect(spec.config.legend).toMatchObject({
        labelColor: "#374151", titleColor: "#111827", labelFontSize: 12, orient: "bottom",
      });
      expect(spec.config.view).toEqual({ stroke: null });
      expect(spec.data).toBeDefined();
      expect(spec.encoding).toBeDefined();
    }
    expect(config.dataSources).toEqual(sources);
    expect(config.widgets).toEqual(widgets);
  }
});

test("approval copy does not claim independent four-eyes review", () => {
  const entry = catalog.find((e) => e.slug === "curated-approval-playbook");
  const text = JSON.stringify(entry);
  expect(text).not.toMatch(/four[- ]?eyes|two independent reviewers|independent reviewer enforces/i);
  expect(entry.description).toMatch(/does not enforce independent-reviewer separation/i);
});
