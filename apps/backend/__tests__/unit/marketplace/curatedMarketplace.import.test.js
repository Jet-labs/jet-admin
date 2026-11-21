/**
 * Integration-style import check for every curated marketplace bundle.
 *
 * Uses a mocked Prisma transaction (no database, no containers). Verifies that
 * executeImport creates every item and rewrites every cross-resource ID:
 * datasource links, page query/workflow sources, page widget instance keys,
 * dataQuery nodes and child workflow references.
 */
jest.mock("../../../config/prisma.config", () => ({
  prisma: { $transaction: jest.fn() },
}));
jest.mock("../../../config/casbin.config", () => ({
  grantCreatorAccess: jest.fn().mockResolvedValue(true),
  removePoliciesForResource: jest.fn().mockResolvedValue(true),
}));
jest.mock("../../../modules/datasource/datasource.service", () => ({
  encryptOptions: (options) => options,
  decryptOptions: (options) => options,
}));
jest.mock("../../../utils/logger", () => ({ log: jest.fn() }));
jest.mock("../../../utils/auth.context.utils", () => ({
  getCreationContextFromAuthContext: () => ({ creatorID: "creator-1" }),
}));

const crypto = require("crypto");
const { prisma } = require("../../../config/prisma.config");
const { bundleService } = require("../../../modules/bundle/bundle.service");
const { buildCuratedCatalog } = require("../../../scripts/catalog/curatedMarketplace");

jest.setTimeout(120000);

const REF_KEY_TO_TYPE = {
  queryID: "dataQuery",
  dataQueryID: "dataQuery",
  workflowID: "workflow",
  childWorkflowID: "workflow",
  listenerID: "listener",
  datasourceID: "datasource",
};

const catalog = buildCuratedCatalog();

function createTx() {
  const rows = {
    datasource: [], dataQuery: [], workflow: [], widget: [], appPage: [], listener: [],
  };
  const ids = {
    datasource: [], dataQuery: [], workflow: [], widget: [], appPage: [], listener: [],
  };
  const nodes = [];
  const edges = [];
  const listenerActions = [];

  const create = (type, idField) => jest.fn(async ({ data }) => {
    const id = crypto.randomUUID();
    rows[type].push(data);
    ids[type].push(id);
    return { [idField]: id };
  });

  const tx = {
    tblDatasources: { create: create("datasource", "datasourceID") },
    tblDataQueries: { create: create("dataQuery", "dataQueryID") },
    tblWorkflows: { create: create("workflow", "workflowID") },
    tblWidgets: { create: create("widget", "widgetID") },
    tblAppPages: { create: create("appPage", "appPageID") },
    tblListeners: {
      create: create("listener", "listenerID"),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    tblWorkflowNodes: { createMany: jest.fn(async ({ data }) => { nodes.push(...data); return { count: data.length }; }) },
    tblWorkflowEdge: { createMany: jest.fn(async ({ data }) => { edges.push(...data); return { count: data.length }; }) },
    tblListenerActions: { createMany: jest.fn(async ({ data }) => { listenerActions.push(...data); return { count: data.length }; }) },
  };
  return { tx, rows, ids, nodes, edges, listenerActions };
}

function walk(value, visit, key = null) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) { value.forEach((v) => walk(v, visit)); return; }
  for (const [k, v] of Object.entries(value)) {
    visit(k, v);
    walk(v, visit, k);
  }
}

function assertEveryReferenceTargetsCreatedIds(rows, createdIds) {
  const sets = Object.fromEntries(Object.entries(createdIds).map(([k, v]) => [k, new Set(v)]));
  walk(rows, (key, value) => {
    const type = REF_KEY_TO_TYPE[key];
    if (!type || typeof value !== "string") return;
    expect(sets[type].has(value)).toBe(true);
  });
}

test.each(catalog.map((entry) => [entry.slug, entry]))(
  "%s imports every item and remaps all embedded references",
  async (slug, entry) => {
    const bundle = entry.payload;
    const { tx, rows, ids, nodes, edges } = createTx();
    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    const { results, skipped, warnings } = await bundleService.executeImport({
      tenantID: "tenant-import-test",
      userID: "user-import-test",
      authContext: { userID: "user-import-test" },
      bundle,
    });

    // No silent drops: every bundled item must be imported exactly once.
    expect(warnings).toEqual([]);
    expect(skipped).toEqual([]);
    expect(results).toHaveLength(bundle.items.length);
    expect(results.map((r) => `${r.type}:${r.originalID}`).sort())
      .toEqual(bundle.items.map((i) => `${i.type}:${i.id}`).sort());
    expect(new Set(results.map((r) => r.newID)).size).toBe(results.length);
    for (const result of results) expect(ids[result.type]).toContain(result.newID);

    // No original bundle UUID may survive inside any persisted payload.
    const persisted = JSON.stringify({ rows, nodes, edges });
    for (const item of bundle.items) expect(persisted).not.toContain(item.id);

    // Every ref-key value must point at a row created in this transaction.
    assertEveryReferenceTargetsCreatedIds({ rows, nodes, edges }, ids);

    const idMap = Object.fromEntries(results.map((r) => [`${r.type}:${r.originalID}`, r.newID]));

    // Datasource links point at the freshly created datasource for that item.
    for (const item of bundle.items.filter((i) => i.type === "dataQuery")) {
      const query = rows.dataQuery.find((q) => q.dataQueryTitle === item.payload.dataQueryTitle);
      expect(query).toBeDefined();
      const dsDep = (item.dependencies || []).find((d) => d.type === "datasource");
      if (dsDep) expect(query.datasourceID).toBe(idMap[`datasource:${dsDep.id}`]);
    }

    // Workflow nodes/edges are re-keyed; child workflow and query refs pair up
    // with the exact created ID, not merely some ID of the right type.
    for (const item of bundle.items.filter((i) => i.type === "workflow")) {
      const workflowID = idMap[`workflow:${item.id}`];
      const workflowNodes = nodes.filter((n) => n.workflowID === workflowID);
      const workflowEdges = edges.filter((e) => e.workflowID === workflowID);
      expect(workflowNodes).toHaveLength(item.payload.nodes.length);
      expect(workflowEdges).toHaveLength(item.payload.edges.length);

      const createdNodeIDByOld = {};
      item.payload.nodes.forEach((original, index) => {
        const created = workflowNodes[index];
        expect(created.nodeType).toBe(original.nodeType);
        createdNodeIDByOld[original.nodeID] = created.nodeID;
        if (original.nodeConfig?.dataQueryID) {
          expect(created.nodeConfig.dataQueryID)
            .toBe(idMap[`dataQuery:${original.nodeConfig.dataQueryID}`]);
        }
        if (original.nodeConfig?.childWorkflowID) {
          expect(created.nodeConfig.childWorkflowID)
            .toBe(idMap[`workflow:${original.nodeConfig.childWorkflowID}`]);
        }
      });
      item.payload.edges.forEach((original, index) => {
        expect(workflowEdges[index].upstreamNodeID).toBe(createdNodeIDByOld[original.upstreamNodeID]);
        expect(workflowEdges[index].downstreamNodeID).toBe(createdNodeIDByOld[original.downstreamNodeID]);
      });
    }

    // Page sources and widget instances pair 1:1 with the created rows.
    for (const item of bundle.items.filter((i) => i.type === "appPage")) {
      const page = rows.appPage.find((p) => p.appPageTitle === item.payload.appPageTitle);
      const original = item.payload.appPageConfig;
      expect(page).toBeDefined();
      expect(page.appPageConfig.dataSources).toHaveLength(original.dataSources.length);
      original.dataSources.forEach((source, index) => {
        const created = page.appPageConfig.dataSources[index];
        expect(created.alias).toBe(source.alias);
        if (source.type === "query") expect(created.queryID).toBe(idMap[`dataQuery:${source.queryID}`]);
        if (source.type === "workflow") expect(created.workflowID).toBe(idMap[`workflow:${source.workflowID}`]);
      });
      expect(page.appPageConfig.widgets).toHaveLength(original.widgets.length);
      original.widgets.forEach((key, index) => {
        const [, oldWidgetID, suffix] = key.split("_");
        expect(page.appPageConfig.widgets[index]).toBe(`widget_${idMap[`widget:${oldWidgetID}`]}_${suffix}`);
      });
      walk(page.appPageConfig.layout, (key, value) => {
        if (key !== "widgetKey") return;
        const match = /^widget_([0-9a-f-]{36})_\d+$/.exec(value);
        expect(match).not.toBeNull();
        expect(ids.widget).toContain(match[1]);
      });
    }
  }
);
