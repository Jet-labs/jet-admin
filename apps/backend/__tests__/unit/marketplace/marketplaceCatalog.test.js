const {
  buildCatalog,
  getCatalogStats,
  MARKETPLACE_ITEM_TYPES,
} = require("../../../scripts/catalog/marketplaceCatalog");
const { bundleSchema } = require("../../../modules/bundle/bundle.validator");

const catalog = buildCatalog();

test("catalog size is within the required 400-500 range", () => {
  expect(catalog.length).toBeGreaterThanOrEqual(400);
  expect(catalog.length).toBeLessThanOrEqual(500);
});

test("catalog generation is deterministic", () => {
  expect(buildCatalog()).toEqual(catalog);
});

test("slugs and item IDs are unique", () => {
  expect(new Set(catalog.map((i) => i.slug)).size).toBe(catalog.length);
  expect(new Set(catalog.map((i) => i.itemID)).size).toBe(catalog.length);
});

test("all four item types are represented", () => {
  const stats = getCatalogStats(catalog);
  expect(Object.keys(stats.byType).sort()).toEqual([...MARKETPLACE_ITEM_TYPES].sort());
  for (const type of MARKETPLACE_ITEM_TYPES) {
    expect(stats.byType[type]).toBeGreaterThan(0);
  }
});

test("every item payload is a valid Bundle v1 document", () => {
  for (const item of catalog) {
    const parsed = bundleSchema.safeParse(item.payload);
    expect(parsed.success).toBe(true);
    expect(item.payload.bundleVersion).toBe(1);
    expect(item.payload.items.length).toBeGreaterThan(0);
  }
});

test("datasource items carry a concrete datasourceType", () => {
  const datasourceItems = catalog.filter((i) => i.itemType === "datasource");
  expect(datasourceItems.length).toBeGreaterThan(0);
  for (const item of datasourceItems) {
    const ds = item.payload.items.find((it) => it.type === "datasource");
    expect(typeof ds.payload.datasourceType).toBe("string");
    expect(ds.payload.datasourceType.length).toBeGreaterThan(0);
    expect(ds.payload.datasourceTags).toContain("integration");
  }
});

test("widget items ship a non-empty widget configuration", () => {
  for (const item of catalog.filter((i) => i.itemType === "widget")) {
    const widget = item.payload.items[0].payload;
    expect(Object.keys(widget.widgetConfig).length).toBeGreaterThan(0);
    expect(widget.widgetType.length).toBeGreaterThan(0);
    expect(widget.refreshInterval).toBeGreaterThan(0);
  }
});

test("workflow items have real nodes and internally consistent edges", () => {
  for (const item of catalog.filter((i) => i.itemType === "workflow")) {
    const wf = item.payload.items[0].payload;
    expect(wf.nodes.length).toBeGreaterThanOrEqual(2);
    const nodeIDs = new Set(wf.nodes.map((n) => n.nodeID));
    expect(wf.edges.length).toBeGreaterThan(0);
    for (const edge of wf.edges) {
      expect(nodeIDs.has(edge.upstreamNodeID)).toBe(true);
      expect(nodeIDs.has(edge.downstreamNodeID)).toBe(true);
    }
  }
});

test("appTemplate items have a non-empty page layout", () => {
  for (const item of catalog.filter((i) => i.itemType === "appTemplate")) {
    const page = item.payload.items[0].payload;
    expect(page.appPageConfig.layout.blocks.length).toBeGreaterThan(0);
    expect(page.appPageConfig.dataSources.length).toBeGreaterThan(0);
  }
});
