/** Publishing guard: real schemas, closed references and runnable graph shapes. */
const assert = require("node:assert/strict");
const { validateWidgetConfig } = require("@jet-admin/widget-types");
const { DATASOURCE_TYPES } = require("@jet-admin/datasource-types");
const { bundleSchema } = require("../../modules/bundle/bundle.validator");
const { collectReferences, collectPageAliases } = require("./curatedMarketplace");

function validateCuratedCatalog(catalog) {
  const slugs = new Set(), ids = new Set();
  const datasourceTypes = new Set(Object.values(DATASOURCE_TYPES).map((d) => d.value));
  const titles = { datasource: "datasourceTitle", dataQuery: "dataQueryTitle", widget: "widgetTitle", workflow: "title", appPage: "appPageTitle" };
  const roots = { datasource: "datasource", widget: "widget", workflow: "workflow", appTemplate: "appPage" };
  for (const entry of catalog) {
    assert.ok(!slugs.has(entry.slug), `Duplicate slug ${entry.slug}`); slugs.add(entry.slug);
    assert.ok(!ids.has(entry.itemID), `Duplicate catalog ID ${entry.itemID}`); ids.add(entry.itemID);
    assert.ok(entry.description && entry.payload.marketplace.setup.length, `${entry.slug}: missing setup`);
    assert.equal(entry.isVerified, false, `${entry.slug}: generated definitions must not claim verification`);
    const parsed = bundleSchema.safeParse(entry.payload);
    assert.ok(parsed.success, `${entry.slug}: ${JSON.stringify(parsed.error?.issues)}`);
    const items = new Map(entry.payload.items.map((i) => [`${i.type}:${i.id}`, i]));
    assert.equal(items.size, entry.payload.items.length, `${entry.slug}: duplicate bundle ID`);
    const root = entry.payload.marketplace.root;
    assert.equal(root.type, roots[entry.itemType], `${entry.slug}: root type mismatch`);
    assert.ok(items.has(`${root.type}:${root.id}`), `${entry.slug}: absent root`);
    const visited = new Set();
    for (const item of entry.payload.items) {
      const p = item.payload;
      assert.ok(p[titles[item.type]], `${entry.slug}: missing resource title`);
      for (const dep of item.dependencies || []) {
        assert.ok(visited.has(`${dep.type}:${dep.id}`), `${entry.slug}: dependency missing or out of order ${dep.type}:${dep.id}`);
      }
      for (const r of collectReferences(p)) assert.ok(items.has(`${r.type}:${r.id}`), `${entry.slug}: dangling ${r.type}:${r.id}`);
      if (item.type === "datasource") {
        assert.ok(datasourceTypes.has(p.datasourceType), `${entry.slug}: unsupported connector`);
        assert.ok(Object.keys(p.datasourceOptions).length, `${entry.slug}: empty datasource`);
      }
      if (item.type === "dataQuery") {
        assert.ok(item.dependencies.some((d) => d.type === "datasource"), `${entry.slug}: query has no datasource`);
        assert.ok(Object.keys(p.dataQueryOptions).length, `${entry.slug}: empty query`);
        const ds = items.get(`datasource:${item.dependencies.find((d) => d.type === "datasource").id}`);
        assert.equal(ds.payload.datasourceType, p.datasourceType, `${entry.slug}: query/connector type mismatch`);
        assert.ok(p.dataQueryOptions.timeoutSeconds <= 30, `${entry.slug}: unbounded query`);
      }
      if (item.type === "widget") {
        const result = validateWidgetConfig(p.widgetType, p.widgetConfig);
        assert.ok(result.valid, `${entry.slug}: ${p.widgetTitle}: ${JSON.stringify(result.errors)}`);
        assert.ok(!/direct_workflow_[0-9a-f-]{36}/.test(JSON.stringify(p.widgetConfig)), `${entry.slug}: UUID embedded in binding`);
      }
      if (item.type === "workflow") {
        const nodes = new Map(p.nodes.map((n) => [n.nodeID, n]));
        assert.equal(nodes.size, p.nodes.length, `${entry.slug}: duplicate graph node`);
        const starts = p.nodes.filter((n) => n.nodeType === "start");
        assert.equal(starts.length, 1, `${entry.slug}: expected one start`);
        const reachable = new Set(starts.map((n) => n.nodeID));
        p.edges.forEach((e) => assert.ok(nodes.has(e.upstreamNodeID) && nodes.has(e.downstreamNodeID), `${entry.slug}: dangling graph edge`));
        // Exclusive branches must not default to an all-predecessors barrier.
        // Require an explicit policy at every convergence, including End nodes.
        for (const node of p.nodes) {
          const incoming = p.edges.filter((e) => e.downstreamNodeID === node.nodeID);
          if (incoming.length > 1) {
            assert.ok(["any", "all"].includes(node.nodeConfig.joinMode), `${entry.slug}: convergence requires an explicit joinMode`);
          }
        }
        for (let i = 0; i < nodes.size; i++) p.edges.forEach((e) => { if (reachable.has(e.upstreamNodeID)) reachable.add(e.downstreamNodeID); });
        assert.equal(reachable.size, nodes.size, `${entry.slug}: unreachable graph node`);
        p.nodes.forEach((n) => {
          if (n.nodeType === "dataQuery") assert.ok(n.nodeConfig.dataQueryID, `${entry.slug}: empty query node`);
          if (n.nodeType === "loop") assert.ok(n.nodeConfig.maxIterations > 0 && n.nodeConfig.maxIterations <= 10, `${entry.slug}: unbounded loop`);
        });
      }
      if (item.type === "appPage") {
        const c = p.appPageConfig;
        assert.equal(c.layoutVersion, 2, `${entry.slug}: unsupported layout format`);
        assert.ok(c.layout.children.length, `${entry.slug}: empty page layout`);
        assert.equal(new Set(c.dataSources.map((s) => s.alias)).size, c.dataSources.length, `${entry.slug}: duplicate page alias`);
        const aliases = new Set(c.dataSources.map((s) => s.alias));
        c.dataSources.forEach((s) => assert.ok(["query", "workflow"].includes(s.type) && s[`${s.type === "query" ? "query" : "workflow"}ID`], `${entry.slug}: invalid page source`));
        for (const wk of c.widgets) {
          const widget = items.get(`widget:${wk.split("_")[1]}`);
          assert.ok(widget, `${entry.slug}: orphan widget instance`);
          collectPageAliases(widget.payload.widgetConfig).forEach((alias) => assert.ok(aliases.has(alias), `${entry.slug}: widget needs missing alias ${alias}`));
          function actions(value) {
            if (!value || typeof value !== "object") return;
            if (value.actionType === "EXECUTE_QUERY") assert.ok(aliases.has(value.config.alias), `${entry.slug}: action needs missing alias ${value.config.alias}`);
            Object.values(value).forEach(actions);
          }
          actions(widget.payload.widgetConfig);
        }
      }
      visited.add(`${item.type}:${item.id}`);
    }
  }
  return { entries: catalog.length, valid: true };
}

module.exports = { validateCuratedCatalog };
