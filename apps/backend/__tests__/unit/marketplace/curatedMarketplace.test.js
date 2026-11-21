const { buildCuratedCatalog } = require("../../../scripts/catalog/curatedMarketplace");
const { validateCuratedCatalog } = require("../../../scripts/catalog/validateCuratedMarketplace");
const { createScenarioRuntime } = require("../../../scripts/showcase/runtime");
const { ref } = require("../../../scripts/showcase/manifest");
jest.mock("../../../utils/logger", () => ({ log: jest.fn() }));
jest.setTimeout(60000);

const catalog = buildCuratedCatalog();
function runtimeFor(entry) {
  const m = { tenantID: "d03c4d10-bfa3-4fd1-812b-3e129cf249b1", datasources: [], queries: [], workflows: [] };
  entry.payload.items.forEach(({ type, id, payload: p, dependencies }) => {
    if (type === "datasource") m.datasources.push({ ...p, datasourceID: id });
    if (type === "dataQuery") m.queries.push({ ...p, dataQueryID: id, datasourceID: dependencies.find((d) => d.type === "datasource").id });
    if (type === "workflow") m.workflows.push({ ...p, workflowID: id });
  });
  return { m, runtime: createScenarioRuntime(m) };
}

test("curated bundles use real widget contracts, layouts and complete dependencies", () => {
  expect(validateCuratedCatalog(catalog)).toEqual({ entries: 36, valid: true });
  expect(buildCuratedCatalog()).toEqual(catalog);
  expect(new Set(catalog.map((e) => JSON.stringify(e.payload.items))).size).toBe(catalog.length);
});

test("a missing dependency fails publication instead of producing an orphan", () => {
  const bad = structuredClone(catalog[0]);
  bad.payload.items.shift();
  expect(() => validateCuratedCatalog([bad])).toThrow(/dependency|dangling/i);
});

test("a missing page alias and an empty query node both fail publication", () => {
  const bad = structuredClone(catalog.find((e) => e.slug === "curated-commerce-workspace"));
  bad.payload.items.find((i) => i.type === "appPage").payload.appPageConfig.dataSources = [];
  expect(() => validateCuratedCatalog([bad])).toThrow(/alias/i);
  const wf = structuredClone(catalog.find((e) => e.slug === "curated-fulfillment-playbook"));
  delete wf.payload.items.find((i) => i.type === "workflow" && i.payload.nodes.some((n) => n.nodeType === "dataQuery"))
    .payload.nodes.find((n) => n.nodeType === "dataQuery").nodeConfig.dataQueryID;
  expect(() => validateCuratedCatalog([wf])).toThrow(/empty query node/i);
});

test.each(catalog.filter((e) => e.payload.marketplace.mode === "demo"))("real embedded queries in $slug", async (entry) => {
  const { m, runtime } = runtimeFor(entry);
  for (const query of m.queries) {
    if (!["duckdb", "sqlite"].includes(query.datasourceType)) throw new Error("Demo unexpectedly requires external credentials");
    const rows = await runtime.executeQuery(query.dataQueryID);
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
    expect(() => JSON.stringify(rows)).not.toThrow();
  }
});

test.each(catalog.filter((e) => e.itemType === "workflow"))("actual DSL execution in $slug", async (entry) => {
  const { runtime } = runtimeFor(entry);
  const r = await runtime.runWorkflow(entry.payload.marketplace.root.id, entry.payload.marketplace.sampleInputs);
  expect(r.trace.at(-1).finalStatus).toBe("COMPLETED");
  expect(r.context._workflowOutput.result).toBeDefined();
});

test("fulfillment really holds high-risk orders instead of ignoring child scoring", async () => {
  const entry = catalog.find((e) => e.slug === "curated-fulfillment-playbook");
  const { runtime } = runtimeFor(entry);
  // Order 6 is paid and in stock but has a high score: risk must gate allocation.
  const result = await runtime.runWorkflow(ref("workflow", "fulfillment"), { orderID: 6 });
  expect(result.context._workflowOutput.result.state).toBe("held");
});

test("dunning takes the low-exposure draft branch without opening approval", async () => {
  const entry = catalog.find((e) => e.slug === "curated-renewal-dunning-playbook");
  const { runtime } = runtimeFor(entry);
  const r = await runtime.runWorkflow(entry.payload.marketplace.root.id, { approvalThreshold: 1000000 });
  expect(r.humanRequest).toBeNull();
  expect(r.context._workflowOutput.result.status).toBe("draft");
  expect(r.context._workflowOutput.result.externalWrites).toBe(0);
});

test.each(["reject", "expired"])("dunning preserves %s instead of reporting approval", async (decision) => {
  const entry = catalog.find((e) => e.slug === "curated-renewal-dunning-playbook");
  const { runtime } = runtimeFor(entry);
  const r = await runtime.runWorkflow(entry.payload.marketplace.root.id, {}, decision);
  expect(r.context._workflowOutput.result.status).toBe(decision === "reject" ? "rejected" : "expired");
  expect(r.context._workflowOutput.result.externalWrites).toBe(0);
});

test("support triage bounds the batch and emits actionable scores", async () => {
  const entry = catalog.find((e) => e.slug === "curated-support-triage-playbook");
  const { runtime } = runtimeFor(entry);
  const r = await runtime.runWorkflow(entry.payload.marketplace.root.id);
  const packet = r.context._workflowOutput.result;
  expect(packet.summary.processed).toBe(8);
  expect(packet.summary.cases.every((c) => Number.isFinite(c.score) && c.owner)).toBe(true);
  expect(packet.externalWrites).toBe(0);
});

test("access recertification rejection never produces a revocation result", async () => {
  const entry = catalog.find((e) => e.slug === "curated-access-recertification-playbook");
  const { runtime } = runtimeFor(entry);
  const r = await runtime.runWorkflow(entry.payload.marketplace.root.id, {}, "reject");
  expect(r.context._workflowOutput.result.status).toBe("rejected");
  expect(r.context._workflowOutput.result.externalWrites).toBe(0);
});

test("typed numeric filters reject injected SQL before execution", async () => {
  const entry = catalog.find((e) => e.slug === "curated-renewal-dunning-playbook");
  const { m, runtime } = runtimeFor(entry);
  const query = m.queries.find((q) => q.dataQueryOptions.inputDefinitions.some((d) => d.key === "minAge"));
  await expect(runtime.executeQuery(query.dataQueryID, { minAge: "0;DROP TABLE invoices" })).rejects.toThrow(/finite number/);
});

test("PostgreSQL app bundles its datasource, queries, widgets and page", () => {
  const entry = catalog.find((e) => e.slug === "curated-postgresql-admin-app");
  const items = entry.payload.items;
  const byType = (type) => items.filter((i) => i.type === type);
  expect(byType("datasource")).toHaveLength(1);
  expect(byType("dataQuery")).toHaveLength(2);
  expect(byType("widget")).toHaveLength(3);
  expect(byType("appPage")).toHaveLength(1);
  expect(byType("datasource")[0].payload).toMatchObject({
    datasourceType: "postgresql",
    requiresReconnect: true,
  });
  expect(byType("dataQuery").every((q) => q.payload.datasourceType === "postgresql")).toBe(true);
  const tablesQuery = byType("dataQuery").find((q) => /visible tables/.test(q.payload.dataQueryTitle));
  expect(tablesQuery.payload.dataQueryOptions.query).toContain(
    "LIMIT {{ inputs.limit }} OFFSET {{ inputs.offset }}"
  );
  expect(tablesQuery.payload.dataQueryOptions.inputDefinitions.map((d) => d.key)).toEqual([
    "limit",
    "offset",
  ]);
  const tableWidget = byType("widget").find((w) => w.payload.widgetType === "table");
  expect(tableWidget.payload.widgetConfig.pagination).toMatchObject({
    enabled: true,
    mode: "server",
    pageSize: 15,
    totalTemplate: expect.stringContaining("table_count"),
  });
  expect(
    tableWidget.payload.widgetConfig.events.onPageChange[0].config.inputValues
  ).toEqual({
    limit: "{{ event.pageSize }}",
    offset: "{{ event.offset }}",
  });
  const page = byType("appPage")[0].payload.appPageConfig;
  expect(page.layoutVersion).toBe(2);
  expect(page.widgets).toHaveLength(3);
  expect(page.dataSources).toHaveLength(2);
  expect(page.dataSources.map((s) => s.alias).sort()).toEqual(["table_count", "tables"]);
  expect(page.dataSources.find((s) => s.alias === "tables").inputValues).toEqual({
    limit: 15,
    offset: 0,
  });
});

module.exports = { runtimeFor };
