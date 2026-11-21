/**
 * Regression probe for bracket-notation page-source references.
 * Widget expressions may read state.workflows["alias"]; the publishing guard
 * and the focused-panel source filter currently only recognise state.workflows.alias.
 */
const { buildCuratedCatalog, collectPageAliases } = require("../../../scripts/catalog/curatedMarketplace");
const { validateCuratedCatalog } = require("../../../scripts/catalog/validateCuratedMarketplace");

const catalog = buildCuratedCatalog();
const panel = () => structuredClone(catalog.find((e) => e.slug === "curated-events-payload-panel"));

describe("collectPageAliases", () => {
  test("reads dot, double-quoted bracket and single-quoted bracket syntax", () => {
    const aliases = collectPageAliases({
      dot: "{{ (state.queries.orders || {}).data }}",
      doubleQuoted: '{{ (state.workflows["playbook_1"] || {}).data }}',
      singleQuoted: "{{ (state.workflows['playbook_2'] || {}).isLoading }}",
      spaced: '{{ state.queries[ "orders_spaced" ].data }}',
      action: { actionType: "EXECUTE_QUERY", config: { alias: "playbook_3" } },
      unrelated: "{{ (state.listeners.live_events || {}).data }}",
    });
    expect([...aliases].sort()).toEqual([
      "orders", "orders_spaced", "playbook_1", "playbook_2", "playbook_3",
    ]);
  });

  test("deduplicates aliases and walks nested arrays", () => {
    const aliases = collectPageAliases([
      { a: "state.workflows.playbook_1.data" },
      { b: ['state.workflows["playbook_1"].data', { c: "state.queries.orders" }] },
    ]);
    expect([...aliases].sort()).toEqual(["orders", "playbook_1"]);
  });

  test("ignores malformed, unquoted and other state roots", () => {
    const aliases = collectPageAliases({
      emptyDot: "state.queries.",
      emptyBracket: "state.workflows[]",
      unquoted: "state.workflows[playbook_1]",
      listeners: "state.listeners.live_events",
      plain: "playbook_1",
    });
    expect([...aliases]).toEqual([]);
  });
});

test("bracket-notation workflow references keep their page source reachable", () => {
  const entry = panel();
  const widgets = entry.payload.items.filter((i) => i.type === "widget");
  const widgetText = JSON.stringify(widgets.map((w) => w.payload.widgetConfig));
  expect(widgetText).toContain('state.workflows[\\"playbook_1\\"]');
  // Remove the form action that also carries an alias key, leaving only bracket reads.
  widgets.find((w) => w.payload.widgetTitle === "Envelope intake").payload.widgetConfig.events = {};
  entry.payload.items.find((i) => i.type === "appPage").payload.appPageConfig.dataSources = [];

  expect(() => validateCuratedCatalog([entry])).toThrow(/alias|source/i);
});
