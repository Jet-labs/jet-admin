jest.mock("../../../utils/logger", () => ({ log: jest.fn() }));

const { main } = require("../../../scripts/repair-legacy-postgres-app");
const { buildCuratedCatalog } = require("../../../scripts/catalog/curatedMarketplace");

const legacyConfig = {
  layout: { type: "grid", blocks: [{ id: "b1", type: "heading" }] },
  version: 1,
  variables: [],
  dataSources: [{ key: "records", kind: "datasource", datasourceType: "postgresql" }],
};
const repairedConfig = {
  layoutVersion: 2,
  layout: { id: "root", type: "column", children: [] },
  widgets: ["widget_w1_1"],
  dataSources: [{ alias: "tables", type: "query", queryID: "q1" }],
};

function setup({ page = {}, updateCount = 1, newPage = true } = {}) {
  const calls = [];
  const target = {
    appPageID: "29c5dd86-d3c7-4b2f-8da9-ca2ba6bea71f",
    tenantID: "97ca7876-7c73-4578-bccb-6d56b98a0113",
    appPageTitle: "PostgreSQL Admin App",
    creatorID: "user-1",
    appPageConfig: legacyConfig,
    ...page,
  };
  const prisma = {
    tblAppPages: {
      findFirst: jest.fn(async ({ where }) => {
        calls.push(["findFirst", where]);
        if (where.appPageID === target.appPageID) return target;
        return newPage
          ? { appPageID: "new-page", tenantID: target.tenantID, appPageTitle: "PostgreSQL Admin App", appPageDescription: "new", appPageConfig: repairedConfig }
          : null;
      }),
      updateMany: jest.fn(async () => ({ count: updateCount })),
      delete: jest.fn(async () => ({})),
    },
    tblUsersTenantsRelationship: { findFirst: jest.fn(async () => ({ userID: "member-1" })) },
    $transaction: jest.fn(async (callback) => callback(prisma)),
    $disconnect: jest.fn(),
  };
  const bundleService = {
    executeImport: jest.fn(async () => {
      calls.push(["executeImport"]);
      return {
        results: [
          { type: "widget", newID: "w1" },
          { type: "appPage", newID: "new-page" },
        ],
      };
    }),
  };
  const writeBackup = jest.fn(() => {
    calls.push(["backup"]);
    return "backup.json";
  });
  return { deps: { prisma, bundleService, writeBackup }, prisma, bundleService, writeBackup, calls, target };
}

test("dry-run performs no database or import work", async () => {
  const { deps, prisma, bundleService } = setup();
  const result = await main([], deps);
  expect(result.mode).toBe("dry-run");
  expect(prisma.tblAppPages.findFirst).not.toHaveBeenCalled();
  expect(bundleService.executeImport).not.toHaveBeenCalled();
});

test("already repaired pages are left untouched", async () => {
  const { deps, prisma, bundleService } = setup({
    page: { appPageConfig: repairedConfig },
  });
  const result = await main(["--apply"], deps);
  expect(result.status).toBe("already-repaired");
  expect(bundleService.executeImport).not.toHaveBeenCalled();
  expect(prisma.tblAppPages.updateMany).not.toHaveBeenCalled();
});

test("a page that no longer matches the legacy placeholder is refused", async () => {
  const { deps, bundleService } = setup({
    page: { appPageConfig: { ...legacyConfig, layout: { type: "freeform" } } },
  });
  await expect(main(["--apply"], deps)).rejects.toThrow(/legacy placeholder/i);
  expect(bundleService.executeImport).not.toHaveBeenCalled();
});

test("apply backs up, imports, swaps the exact legacy config and removes only the duplicate page", async () => {
  const { deps, calls, bundleService, writeBackup } = setup();
  const result = await main(["--apply"], deps);
  expect(writeBackup).toHaveBeenCalledTimes(1);
  const backupIndex = calls.findIndex((call) => call[0] === "backup");
  const importIndex = calls.findIndex((call) => call[0] === "executeImport");
  expect(backupIndex).toBeGreaterThanOrEqual(0);
  expect(importIndex).toBeGreaterThan(backupIndex);
  expect(bundleService.executeImport).toHaveBeenCalledWith(
    expect.objectContaining({
      tenantID: "97ca7876-7c73-4578-bccb-6d56b98a0113",
      bundle: buildCuratedCatalog().find((e) => e.slug === "curated-postgresql-admin-app").payload,
    })
  );
  expect(deps.prisma.tblAppPages.updateMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({ appPageConfig: { equals: legacyConfig } }),
      data: expect.objectContaining({ appPageConfig: repairedConfig }),
    })
  );
  expect(deps.prisma.tblAppPages.delete).toHaveBeenCalledWith({ where: { appPageID: "new-page" } });
  expect(result.status).toBe("repaired");
  expect(result.removedDuplicatePageID).toBe("new-page");
});

test("a concurrent page edit aborts the swap and never deletes the imported page", async () => {
  const { deps } = setup({ updateCount: 0 });
  await expect(main(["--apply"], deps)).rejects.toThrow(/concurrent page edit/i);
  expect(deps.prisma.tblAppPages.delete).not.toHaveBeenCalled();
});

test("unknown flags and non-UUID targets are rejected", async () => {
  const { deps } = setup();
  await expect(main(["--apply", "--delete"], deps)).rejects.toThrow(/unknown argument/i);
  await expect(main(["--apply", "--page", "not-a-uuid"], deps)).rejects.toThrow(/must be UUIDs/i);
});
