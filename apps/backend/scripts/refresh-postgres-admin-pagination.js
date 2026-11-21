/**
 * Apply the curated PostgreSQL assets (queries, widgets and the page's
 * data-source input defaults) to the already repaired page in the First tenant.
 * Dry run by default; --apply required. Every write is equality-guarded and a
 * backup is written before the transaction.
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

function payloads() {
  const bundle = buildCuratedCatalog().find(
    (entry) => entry.slug === "curated-postgresql-admin-app"
  ).payload;
  return {
    queries: bundle.items.filter((item) => item.type === "dataQuery").map((item) => item.payload),
    widgets: bundle.items.filter((item) => item.type === "widget").map((item) => item.payload),
    page: bundle.items.find((item) => item.type === "appPage").payload,
  };
}

async function main(argv = process.argv.slice(2), deps = {}) {
  const args = parseArgs(argv);
  const source = payloads();
  const summary = {
    mode: args.apply ? "apply" : "dry-run",
    tenantID: TENANT_ID,
    pageID: PAGE_ID,
    queryTitles: source.queries.map((q) => q.dataQueryTitle),
    widgetTitles: source.widgets.map((w) => w.widgetTitle),
    pageSize: source.widgets.find((w) => w.widgetType === "table").widgetConfig.pagination.pageSize,
  };
  if (!args.apply) {
    console.log(JSON.stringify(summary, null, 2));
    return summary;
  }

  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
  const prisma = deps.prisma || require("../config/prisma.config").prisma;
  const writeBackup = deps.writeBackup || ((data) => {
    const dir = path.join(__dirname, "..", "..", "..", "backups", "marketplace");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `postgres-pagination-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), { flag: "wx" });
    return file;
  });

  try {
    const page = await prisma.tblAppPages.findFirst({
      where: { appPageID: PAGE_ID, tenantID: TENANT_ID },
    });
    if (!page) throw new Error("Target page was not found.");
    if (page.appPageTitle !== "PostgreSQL Admin App" || page.appPageConfig?.layoutVersion !== 2) {
      throw new Error("Target page is not the repaired PostgreSQL admin app.");
    }
    // Scope strictly to assets referenced by this page. Duplicate PG assets may
    // exist from earlier installs; they must not be modified or counted.
    const pageWidgetIDs = (page.appPageConfig.widgets || [])
      .map((key) => key.split("_")[1])
      .filter(Boolean);
    const pageQueryIDs = (page.appPageConfig.dataSources || [])
      .filter((source) => source.type === "query" && source.queryID)
      .map((source) => source.queryID);
    const queries = await prisma.tblDataQueries.findMany({
      where: { tenantID: TENANT_ID, dataQueryID: { in: pageQueryIDs } },
    });
    const widgets = await prisma.tblWidgets.findMany({
      where: { tenantID: TENANT_ID, widgetID: { in: pageWidgetIDs } },
    });
    for (const payload of source.queries) {
      if (queries.filter((q) => q.dataQueryTitle === payload.dataQueryTitle).length !== 1) {
        throw new Error(`Target page does not reference exactly one query named ${payload.dataQueryTitle}.`);
      }
    }
    for (const payload of source.widgets) {
      if (widgets.filter((w) => w.widgetTitle === payload.widgetTitle).length !== 1) {
        throw new Error(`Target page does not reference exactly one widget named ${payload.widgetTitle}.`);
      }
    }

    const queryByTitle = new Map(queries.map((q) => [q.dataQueryTitle, q]));
    const widgetByTitle = new Map(widgets.map((w) => [w.widgetTitle, w]));
    const nextPageConfig = JSON.parse(JSON.stringify(page.appPageConfig));
    for (const alias of ["tables", "table_count"]) {
      const target = (nextPageConfig.dataSources || []).find((s) => s.alias === alias);
      const sourceDefault = source.page.appPageConfig.dataSources.find((s) => s.alias === alias);
      if (!target || !sourceDefault) throw new Error(`The page is missing its ${alias} data source.`);
      target.inputValues = sourceDefault.inputValues;
    }

    const backupFile = writeBackup({ page, queries, widgets });
    const result = await prisma.$transaction(async (tx) => {
      let queryUpdates = 0;
      let widgetUpdates = 0;
      for (const payload of source.queries) {
        const current = queryByTitle.get(payload.dataQueryTitle);
        const updated = await tx.tblDataQueries.updateMany({
          where: { dataQueryID: current.dataQueryID, tenantID: TENANT_ID, dataQueryOptions: { equals: current.dataQueryOptions } },
          data: { dataQueryOptions: payload.dataQueryOptions },
        });
        if (updated.count !== 1) throw new Error(`Concurrent query edit detected for ${payload.dataQueryTitle}.`);
        queryUpdates += 1;
      }
      for (const payload of source.widgets) {
        const current = widgetByTitle.get(payload.widgetTitle);
        const updated = await tx.tblWidgets.updateMany({
          where: { widgetID: current.widgetID, tenantID: TENANT_ID, widgetConfig: { equals: current.widgetConfig } },
          data: { widgetConfig: payload.widgetConfig },
        });
        if (updated.count !== 1) throw new Error(`Concurrent widget edit detected for ${payload.widgetTitle}.`);
        widgetUpdates += 1;
      }
      const p = await tx.tblAppPages.updateMany({
        where: { appPageID: page.appPageID, tenantID: TENANT_ID, appPageConfig: { equals: page.appPageConfig } },
        data: { appPageConfig: nextPageConfig },
      });
      if (p.count !== 1) throw new Error("Concurrent page edit detected; pagination refresh aborted.");
      return { queryUpdates, widgetUpdates, pageUpdates: p.count };
    },
    { timeout: 30000 });

    console.log(JSON.stringify({ ...summary, status: "updated", backupFile, ...result }, null, 2));
    return { ...summary, status: "updated", backupFile, ...result };
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
module.exports = { main, payloads, TENANT_ID, PAGE_ID };
