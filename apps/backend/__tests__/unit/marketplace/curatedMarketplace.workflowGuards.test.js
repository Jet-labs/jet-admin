/**
 * Publication-guard probes for workflow references and branch convergence.
 * These are validator-only; no workflow is executed here.
 */
const { buildCuratedCatalog } = require("../../../scripts/catalog/curatedMarketplace");
const { validateCuratedCatalog } = require("../../../scripts/catalog/validateCuratedMarketplace");

const catalog = buildCuratedCatalog();
const clone = (slug) => structuredClone(catalog.find((e) => e.slug === slug));

test("dunning with an explicit any join on its convergent end passes validation", () => {
  expect(() => validateCuratedCatalog([clone("curated-renewal-dunning-playbook")])).not.toThrow();
});

test("rejects a workflow that references a child workflow outside its bundle", () => {
  const entry = clone("curated-fulfillment-playbook");
  const root = entry.payload.marketplace.root.id;
  const workflow = entry.payload.items.find((i) => i.type === "workflow" && i.id === root);
  const childID = workflow.payload.nodes.find((n) => n.nodeConfig?.childWorkflowID).nodeConfig.childWorkflowID;
  entry.payload.items = entry.payload.items.filter(
    (i) => !(i.type === "workflow" && i.id === childID)
  );
  expect(() => validateCuratedCatalog([entry])).toThrow(/dependency|dangling/i);
});

test("rejects a workflow query node whose dataQuery is outside its bundle", () => {
  const entry = clone("curated-fulfillment-playbook");
  const root = entry.payload.marketplace.root.id;
  const workflow = entry.payload.items.find((i) => i.type === "workflow" && i.id === root);
  workflow.payload.nodes.find((n) => n.nodeConfig?.dataQueryID).nodeConfig.dataQueryID =
    "00000000-0000-4000-8000-000000000001";
  expect(() => validateCuratedCatalog([entry])).toThrow(/dangling/i);
});

test("rejects exclusive branches converging on an end without joinMode", () => {
  for (const slug of [
    "curated-renewal-dunning-playbook",
    "curated-support-triage-playbook",
    "curated-access-recertification-playbook",
  ]) {
    const entry = clone(slug);
    const workflow = entry.payload.items.find((i) => i.type === "workflow").payload;
    const end = workflow.nodes.find((n) => n.nodeType === "end");
    const incoming = workflow.edges.filter((e) => e.downstreamNodeID === end.nodeID).length;
    expect(incoming).toBeGreaterThan(1);
    delete end.nodeConfig.joinMode;
    expect(() => validateCuratedCatalog([entry])).toThrow(/joinMode|converg/i);
  }
});
