/**
 * Upgrade the existing PostgreSQL Admin App page to the full admin console.
 *
 * Installs the current curated bundle, repoints its queries at the page's
 * EXISTING datasource (preserving credentials), swaps the new page config onto
 * the old page ID, removes the duplicate page, and deletes old page-scoped
 * queries/widgets only when nothing else references them.
 *
 * Dry run by default; --apply required. A backup is written before import.
 */
const fs = require("fs");
const path = require("path");
const { buildCuratedCatalog } = require("./catalog/curatedMarketplace");

const TENANT_ID = "97ca7876-7c73-4578-bccb-6d56b98a0113";
const PAGE_ID = "29c5dd86-d3c7-4b2f-8da9-ca2ba6bea71f";

function parseArgs(argv) {
  const args = { apply: false };
  for (const arg of argv) {
    if (arg === "--apply") args.apply = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

async function main(argv = process.argv.slice(2), deps = {}) {
  const args = parseArgs(argv);
  const item = buildCuratedCatalog().find((entry) => entry.slug === "curated-postgresql-admin-app");
  if (!item) throw new Error("Curated PostgreSQL item is missing.");
  const summary = {
    mode: args.apply ? "apply" : "dry-run",
    tenantID: TENANT_ID,
    pageID: PAGE_ID,
    marketplaceItemID: item.itemID,
    bundleItems: item.payload.items.length,
  };
  if (!args.apply) {
    console.log(JSON.stringify(summary, null, 2));
    return summary;
  }

  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
  const prisma = deps.prisma || require("../config/prisma.config").prisma;
  const bundleService = deps.bundleService || require("../modules/bundle/bundle.service").bundleService;
  const writeBackup = deps.writeBackup || ((data) => {
    const dir = path.join(__dirname, "..", "..", "..", "backups", "marketplace");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `postgres-admin-upgrade-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), { flag: "wx" });
    return file;
  });

  try {
    const page = await prisma.tblAppPages.findFirst({
      where: { appPageID: PAGE_ID, tenantID: TENANT_ID },
    });
    if (!page) throw new Error("Target page was not found.");
    if (page.appPageTitle !== "PostgreSQL Admin App") {
      throw new Error("Target page is not the PostgreSQL Admin App.");
    }
    const oldQueryIDs = (page.appPageConfig?.dataSources || [])
      .filter((s) => s.type === "query" && s.queryID)
      .map((s) => s.queryID);
    const oldWidgetIDs = (page.appPageConfig?.widgets || [])
      .map((key) => key.split("_")[1])
      .filter(Boolean);
    const oldQueries = await prisma.tblDataQueries.findMany({
      where: { tenantID: TENANT_ID, dataQueryID: { in: oldQueryIDs } },
    });
    const oldWidgets = await prisma.tblWidgets.findMany({
      where: { tenantID: TENANT_ID, widgetID: { in: oldWidgetIDs } },
    });
    const oldDatasourceID = oldQueries.find((q) => q.datasourceID)?.datasourceID;
    if (!oldDatasourceID) throw new Error("The existing page has no datasource to preserve.");
    if (page.appPageConfig?.layoutVersion === 2 && oldWidgetIDs.length >= 11) {
      const result = { ...summary, status: "already-upgraded" };
      console.log(JSON.stringify(result, null, 2));
      return result;
    }

    let creatorID = page.creatorID;
    if (!creatorID) {
      const membership = await prisma.tblUsersTenantsRelationship.findFirst({
        where: { tenantID: TENANT_ID },
        select: { userID: true },
      });
      creatorID = membership?.userID;
    }
    if (!creatorID) throw new Error("No tenant member is available to own the imported assets.");

    const backupFile = writeBackup({ page, oldQueries, oldWidgets });
    console.log("upgrade: importing curated admin bundle");
    const imported = await bundleService.executeImport({
      tenantID: TENANT_ID,
      userID: creatorID,
      authContext: { authType: "USER", userID: creatorID },
      bundle: item.payload,
    });
    const newPageID = imported.results.find((r) => r.type === "appPage")?.newID;
    const newQueryIDs = imported.results.filter((r) => r.type === "dataQuery").map((r) => r.newID);
    const newWidgetIDs = imported.results.filter((r) => r.type === "widget").map((r) => r.newID);
    const newDatasourceID = imported.results.find((r) => r.type === "datasource")?.newID;
    if (!newPageID || !newQueryIDs.length || !newWidgetIDs.length || !newDatasourceID) {
      throw new Error("Curated import did not return the expected assets.");
    }
    const newPage = await prisma.tblAppPages.findFirst({
      where: { appPageID: newPageID, tenantID: TENANT_ID },
    });
    if (!newPage) throw new Error("Imported admin page could not be read back.");

    // Do not delete old assets referenced from another page or workflow.
    const otherPages = await prisma.tblAppPages.findMany({
      where: { tenantID: TENANT_ID, appPageID: { not: page.appPageID } },
      select: { appPageConfig: true },
    });
    const workflows = await prisma.tblWorkflows.findMany({
      where: { tenantID: TENANT_ID },
      include: { tblWorkflowNodes: { select: { nodeConfig: true } } },
    });
    const otherText = JSON.stringify({ otherPages, workflows });
    const removableQueries = oldQueries.filter((q) => !otherText.includes(q.dataQueryID)).map((q) => q.dataQueryID);
    const removableWidgets = oldWidgets.filter((w) => !otherText.includes(w.widgetID)).map((w) => w.widgetID);

    const result = await prisma.$transaction(async (tx) => {
      // Preserve the connected datasource: repoint all new queries to it.
      await tx.tblDataQueries.updateMany({
        where: { dataQueryID: { in: newQueryIDs }, tenantID: TENANT_ID },
        data: { datasourceID: oldDatasourceID },
      });
      const stillUsed = await tx.tblDataQueries.count({
        where: { datasourceID: newDatasourceID, tenantID: TENANT_ID },
      });
      if (stillUsed === 0) {
        await tx.tblDatasources.deleteMany({
          where: { datasourceID: newDatasourceID, tenantID: TENANT_ID },
        });
      }
      const updated = await tx.tblAppPages.updateMany({
        where: {
          appPageID: page.appPageID,
          tenantID: TENANT_ID,
          appPageConfig: { equals: page.appPageConfig },
        },
        data: {
          appPageConfig: newPage.appPageConfig,
          appPageTitle: newPage.appPageTitle,
          appPageDescription: newPage.appPageDescription,
        },
      });
      if (updated.count !== 1) throw new Error("Concurrent page edit detected; upgrade aborted.");
      await tx.tblAppPages.deleteMany({ where: { appPageID: newPageID, tenantID: TENANT_ID } });
      if (removableQueries.length) {
        await tx.tblDataQueries.deleteMany({ where: { dataQueryID: { in: removableQueries }, tenantID: TENANT_ID } });
      }
      if (removableWidgets.length) {
        await tx.tblWidgets.deleteMany({ where: { widgetID: { in: removableWidgets }, tenantID: TENANT_ID } });
      }
      return {
        newQueryIDs,
        newWidgetIDs,
        removedQueryIDs: removableQueries,
        removedWidgetIDs: removableWidgets,
        keptQueryIDs: oldQueryIDs.filter((id) => !removableQueries.includes(id)),
        keptWidgetIDs: oldWidgetIDs.filter((id) => !removableWidgets.includes(id)),
      };
    },
    { timeout: 60000 });

    const response = {
      ...summary,
      status: "upgraded",
      backupFile,
      preservedDatasourceID: oldDatasourceID,
      created: imported.results.length,
      removedDuplicatePageID: newPageID,
      ...result,
    };
    console.log(JSON.stringify(response, null, 2));
    return response;
  } finally {
    if (!deps.prisma) await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
module.exports = { main, TENANT_ID, PAGE_ID };
