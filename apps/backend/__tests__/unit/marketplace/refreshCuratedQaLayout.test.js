/**
 * Mocked-Prisma contract tests for scripts/refresh-curated-qa-layout.js.
 * No database, dotenv file, backup filesystem write or browser is touched.
 */
jest.mock("dotenv", () => ({ config: jest.fn() }));

const { main, FIXTURES, TENANT_ID } = require("../../../scripts/refresh-curated-qa-layout");
const { CONTENT_HEIGHTS } = require("../../../scripts/catalog/curatedLayout");

const WIDGET_TYPES = ["vega-lite", "table", "timeline", "json-viewer", "text", "vega-lite", "button"];
const CHART_TYPES = new Set(["vega", "vega-lite"]);

function fixturePages() {
  return FIXTURES.map((fixture, pageIndex) => ({
    appPageID: fixture.pageID,
    appPageTitle: fixture.title,
    appPageConfig: {
      layout: {
        id: `root-${pageIndex}`,
        type: "column",
        children: [{
          id: `row-${pageIndex}`,
          type: "row",
          sizing: "auto",
          children: fixture.widgets.map((id, widgetIndex) => ({
            id: `slot-${pageIndex}-${widgetIndex}`,
            type: "widget",
            widgetKey: `widget_${id}_1`,
            span: 6,
            sizing: "fill",
          })),
        }],
      },
      dataSources: [{ alias: `query_${pageIndex}`, type: "query", queryID: `query-${pageIndex}` }],
      widgets: fixture.widgets.map((id) => `widget_${id}_1`),
    },
  }));
}

function fixtureWidgets() {
  return FIXTURES.flatMap((fixture, pageIndex) =>
    fixture.widgets.map((id, widgetIndex) => ({
      widgetID: id,
      tenantID: TENANT_ID,
      widgetType: WIDGET_TYPES[widgetIndex],
      widgetConfig: CHART_TYPES.has(WIDGET_TYPES[widgetIndex])
        ? {
            showHeader: true,
            vegaSpec: {
              background: "#eeeeee",
              data: { values: [] },
              encoding: { x: { field: "a" } },
              config: { axis: { labelColor: "#ffffff" } },
            },
          }
        : { label: `widget-${pageIndex}-${widgetIndex}` },
    }))
  );
}

function createMockPrisma(options = {}) {
  const pages = fixturePages();
  const widgets = fixtureWidgets();
  options.mutatePages?.(pages);
  options.mutateWidgets?.(widgets);

  const pageUpdates = [];
  const widgetUpdates = [];
  let pageCountIndex = 0;
  let widgetCountIndex = 0;
  const pageCounts = options.pageCounts || [];
  const widgetCounts = options.widgetCounts || [];

  const tx = {
    tblAppPages: {
      updateMany: jest.fn(async (args) => {
        pageUpdates.push(args);
        return { count: pageCounts.length ? (pageCounts[pageCountIndex++] ?? 1) : 1 };
      }),
    },
    tblWidgets: {
      updateMany: jest.fn(async (args) => {
        widgetUpdates.push(args);
        return { count: widgetCounts.length ? (widgetCounts[widgetCountIndex++] ?? 1) : 1 };
      }),
    },
  };
  let transactionOptions;

  const prisma = {
    tblAppPages: {
      findFirst: jest.fn(async ({ where }) => (
        where.tenantID === TENANT_ID
          ? pages.find((page) => page.appPageID === where.appPageID) || null
          : null
      )),
    },
    tblWidgets: {
      findMany: jest.fn(async ({ where }) => widgets.filter((widget) => (
        where.tenantID === TENANT_ID && where.widgetID.in.includes(widget.widgetID)
      ))),
    },
    $transaction: jest.fn(async (callback, options) => {
      transactionOptions = options;
      return callback(tx);
    }),
  };

  return {
    prisma, tx, pages, widgets, pageUpdates, widgetUpdates,
    get transactionOptions() { return transactionOptions; },
  };
}

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  visit(node);
  (node.children || []).forEach((child) => walk(child, visit));
}

afterEach(() => {
  jest.restoreAllMocks();
});

test("default invocation is a no-connection dry run scoped to the two QA pages", async () => {
  const mock = createMockPrisma();
  const log = jest.spyOn(console, "log").mockImplementation(() => {});
  const result = await main([], { prisma: mock.prisma });

  expect(result).toEqual({
    mode: "dry-run",
    tenantID: TENANT_ID,
    pageIDs: FIXTURES.map((f) => f.pageID),
  });
  expect(require("dotenv").config).not.toHaveBeenCalled();
  expect(mock.prisma.tblAppPages.findFirst).not.toHaveBeenCalled();
  expect(mock.prisma.tblWidgets.findMany).not.toHaveBeenCalled();
  expect(mock.prisma.$transaction).not.toHaveBeenCalled();
  expect(log).toHaveBeenCalledTimes(1);
});

test("rejects unsupported flags before any connection", async () => {
  const mock = createMockPrisma();
  await expect(main(["--force"], { prisma: mock.prisma })).rejects.toThrow(/Only --apply/);
  expect(mock.prisma.$transaction).not.toHaveBeenCalled();
});

test("apply scopes reads/writes to allowlisted tenant, pages, widgets and charts", async () => {
  const mock = createMockPrisma();
  const originals = structuredClone(mock.pages.map((page) => page.appPageConfig));
  const writeBackup = jest.fn(() => "/mock/backup.json");
  const log = jest.spyOn(console, "log").mockImplementation(() => {});

  const result = await main(["--apply"], { prisma: mock.prisma, writeBackup });

  expect(result).toEqual({ changedPages: 2, changedCharts: 4, backupFile: "/mock/backup.json" });
  expect(writeBackup).toHaveBeenCalledTimes(1);
  const backup = writeBackup.mock.calls[0][0];
  expect(backup.tenantID).toBe(TENANT_ID);
  expect(backup.pages).toHaveLength(2);
  expect(backup.widgets).toHaveLength(14);
  expect(backup.pages[0].appPageConfig).toEqual(originals[0]);
  expect(writeBackup.mock.invocationCallOrder[0])
    .toBeLessThan(mock.prisma.$transaction.mock.invocationCallOrder[0]);

  expect(mock.prisma.tblAppPages.findFirst.mock.calls.map((call) => call[0].where))
    .toEqual(FIXTURES.map((fixture) => ({ appPageID: fixture.pageID, tenantID: TENANT_ID })));
  const expectedWidgetIDs = FIXTURES.map((fixture) => [...fixture.widgets].sort());
  expect(mock.prisma.tblWidgets.findMany.mock.calls.map((call) => call[0].where.tenantID))
    .toEqual([TENANT_ID, TENANT_ID]);
  expect(mock.prisma.tblWidgets.findMany.mock.calls.map((call) => [...call[0].where.widgetID.in].sort()))
    .toEqual(expectedWidgetIDs);

  // Only the two allowlisted pages, and only their chart widgets, are written.
  expect(mock.pageUpdates).toHaveLength(2);
  expect(mock.pageUpdates.map((u) => u.where.appPageID).sort())
    .toEqual(FIXTURES.map((f) => f.pageID).sort());
  expect(mock.pageUpdates.every((u) => u.where.tenantID === TENANT_ID)).toBe(true);
  expect(mock.pageUpdates.map((u) => u.where.appPageConfig.equals)).toEqual(originals);

  const allWidgetIDs = FIXTURES.flatMap((f) => f.widgets);
  const chartWidgetIDs = mock.widgets.filter((w) => CHART_TYPES.has(w.widgetType)).map((w) => w.widgetID);
  expect(mock.widgetUpdates).toHaveLength(chartWidgetIDs.length);
  expect(mock.widgetUpdates.map((u) => u.where.widgetID).sort()).toEqual([...chartWidgetIDs].sort());
  expect(mock.widgetUpdates.every((u) => u.where.tenantID === TENANT_ID)).toBe(true);
  expect(mock.widgetUpdates.every((u) => allWidgetIDs.includes(u.where.widgetID))).toBe(true);

  // No query/workflow/other-page delegate is even available on the tx double.
  expect(Object.keys(mock.tx).sort()).toEqual(["tblAppPages", "tblWidgets"]);
  expect(mock.transactionOptions).toEqual({ timeout: 30000 });

  const typeForWidget = new Map(mock.widgets.map((w) => [w.widgetID, w.widgetType]));
  mock.pageUpdates.forEach((update, index) => {
    walk(update.data.appPageConfig.layout, (node) => {
      if (node.type !== "widget") return;
      const type = typeForWidget.get(node.widgetKey.split("_")[1]);
      if (CONTENT_HEIGHTS[type]) {
        expect(node.sizing).toBe("fixed");
        expect(node.height).toBe(CONTENT_HEIGHTS[type]);
        expect(node.fixedHeight).toBe(CONTENT_HEIGHTS[type]);
      }
    });
    expect(update.data.appPageConfig.dataSources).toEqual(originals[index].dataSources);
  });
  for (const update of mock.widgetUpdates) {
    const spec = update.data.widgetConfig.vegaSpec;
    expect(spec.background).toBe("#ffffff");
    expect(spec.autosize).toEqual({ type: "fit", contains: "padding" });
    expect(spec.config.axis.labelColor).toBe("#374151");
  }
  expect(log).toHaveBeenCalledTimes(1);
});

test("rejects a page whose title no longer matches the QA fixture", async () => {
  const mock = createMockPrisma({ mutatePages: (pages) => { pages[0].appPageTitle = "Changed title"; } });
  const writeBackup = jest.fn();
  await expect(main(["--apply"], { prisma: mock.prisma, writeBackup }))
    .rejects.toThrow(/QA fixture missing or changed/);
  expect(writeBackup).not.toHaveBeenCalled();
  expect(mock.prisma.$transaction).not.toHaveBeenCalled();
  expect(mock.pageUpdates).toHaveLength(0);
});

test("rejects a page whose widget set no longer matches the QA fixture", async () => {
  const mock = createMockPrisma({
    mutatePages: (pages) => { pages[0].appPageConfig.widgets.push("widget_00000000-0000-4000-8000-000000000000_1"); },
  });
  const writeBackup = jest.fn();
  await expect(main(["--apply"], { prisma: mock.prisma, writeBackup }))
    .rejects.toThrow(/QA widget set changed/);
  expect(writeBackup).not.toHaveBeenCalled();
  expect(mock.prisma.$transaction).not.toHaveBeenCalled();
});

test("rejects missing widget rows before writing anything", async () => {
  const mock = createMockPrisma({ mutateWidgets: (widgets) => { widgets.pop(); } });
  const writeBackup = jest.fn();
  await expect(main(["--apply"], { prisma: mock.prisma, writeBackup }))
    .rejects.toThrow(/QA widgets missing/);
  expect(writeBackup).not.toHaveBeenCalled();
  expect(mock.prisma.$transaction).not.toHaveBeenCalled();
});

test("aborts on a concurrent page edit (update count 0)", async () => {
  const mock = createMockPrisma({ pageCounts: [0, 1] });
  const writeBackup = jest.fn(() => "/mock/backup.json");
  const log = jest.spyOn(console, "log").mockImplementation(() => {});

  await expect(main(["--apply"], { prisma: mock.prisma, writeBackup }))
    .rejects.toThrow(/Concurrent page edit/);
  expect(mock.pageUpdates).toHaveLength(1);
  expect(mock.widgetUpdates).toHaveLength(0);
  expect(writeBackup).toHaveBeenCalledTimes(1);
  expect(log).not.toHaveBeenCalled();
});

test("aborts on a concurrent widget edit after page writes (count 0)", async () => {
  const mock = createMockPrisma({ pageCounts: [1, 1], widgetCounts: [0, 1, 1, 1] });
  const writeBackup = jest.fn(() => "/mock/backup.json");
  jest.spyOn(console, "log").mockImplementation(() => {});

  await expect(main(["--apply"], { prisma: mock.prisma, writeBackup }))
    .rejects.toThrow(/Concurrent widget edit/);
  expect(mock.pageUpdates).toHaveLength(2);
  expect(mock.widgetUpdates).toHaveLength(1);
  expect(writeBackup).toHaveBeenCalledTimes(1);
});
