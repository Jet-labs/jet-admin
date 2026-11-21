/**
 * Refresh the installed PostgreSQL admin console's connection-state copy and
 * manual catalog trigger modes. Dry run by default; --apply required.
 */
const fs = require("fs");
const path = require("path");
const { buildCuratedCatalog } = require("./catalog/curatedMarketplace");

const TENANT_ID = "97ca7876-7c73-4578-bccb-6d56b98a0113";
const PAGE_ID = "47be057e-ccaa-40ff-ad48-3134f5b043d1";

function curatedAdminConfig() {
  const item = buildCuratedCatalog().find((entry) => entry.slug === "curated-postgresql-admin-app");
  if (!item) throw new Error("Curated PostgreSQL item is missing.");
  const widgets = item.payload.items.filter((entry) => entry.type === "widget").map((entry) => entry.payload);
  const instructions = widgets.find((widget) => widget.widgetTitle === "PostgreSQL admin");
  const catalog = widgets.find((widget) => widget.widgetTitle === "Table catalog");
  if (!instructions || !catalog) throw new Error("Curated admin widgets are missing.");
  return { instructions, catalog };
}

async function main(argv = process.argv.slice(2), deps = {}) {
  const apply = argv.includes("--apply");
  const unknown = argv.filter((arg) => arg !== "--apply");
  if (unknown.length) throw new Error(`Unknown argument: ${unknown[0]}`);
  const summary = { mode: apply ? "apply" : "dry-run", tenantID: TENANT_ID, pageID: PAGE_ID };
  if (!apply) {
    console.log(JSON.stringify(summary, null, 2));
    return summary;
  }
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
  const prisma = deps.prisma || require("../config/prisma.config").prisma;
  const writeBackup = deps.writeBackup || ((data) => {
    const dir = path.join(__dirname, "..", "..", "..", "backups", "marketplace");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `postgres-admin-console-refresh-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), { flag: "wx" });
    return file;
  });
  try {
    const page = await prisma.tblAppPages.findFirst({ where: { appPageID: PAGE_ID, tenantID: TENANT_ID } });
    if (!page) throw new Error("PostgreSQL admin page was not found.");
    const widgets = await prisma.tblWidgets.findMany({
      where: {
        tenantID: TENANT_ID,
        widgetID: { in: (page.appPageConfig.widgets || []).map((k) => k.split("_")[1]).filter(Boolean) },
      },
    });
    const instructions = widgets.find((w) => w.widgetType === "text" && w.widgetTitle === "PostgreSQL admin");
    const catalog = widgets.find((w) => w.widgetType === "table" && w.widgetTitle === "Table catalog");
    if (!instructions || !catalog) throw new Error("Expected admin widgets were not found.");

    const nextPageConfig = JSON.parse(JSON.stringify(page.appPageConfig));
    for (const alias of ["tables", "table_count"]) {
      const source = (nextPageConfig.dataSources || []).find((s) => s.alias === alias);
      if (!source) throw new Error(`Missing page data source ${alias}.`);
      source.triggerMode = "auto";
    }
    const curated = curatedAdminConfig();
    const nextInstructions = {
      ...instructions.widgetConfig,
      content: curated.instructions.widgetConfig.content,
    };
    const nextCatalog = {
      ...catalog.widgetConfig,
      emptyText: curated.catalog.widgetConfig.emptyText,
      events: curated.catalog.widgetConfig.events,
    };
    const backupFile = writeBackup({ page, instructions, catalog });

    const result = await prisma.$transaction(async (tx) => {
      const i = await tx.tblWidgets.updateMany({
        where: { widgetID: instructions.widgetID, tenantID: TENANT_ID, widgetConfig: { equals: instructions.widgetConfig } },
        data: { widgetConfig: nextInstructions },
      });
      if (i.count !== 1) throw new Error("Concurrent instructions edit detected.");
      const c = await tx.tblWidgets.updateMany({
        where: { widgetID: catalog.widgetID, tenantID: TENANT_ID, widgetConfig: { equals: catalog.widgetConfig } },
        data: { widgetConfig: nextCatalog },
      });
      if (c.count !== 1) throw new Error("Concurrent catalog edit detected.");
      const p = await tx.tblAppPages.updateMany({
        where: { appPageID: page.appPageID, tenantID: TENANT_ID, appPageConfig: { equals: page.appPageConfig } },
        data: { appPageConfig: nextPageConfig },
      });
      if (p.count !== 1) throw new Error("Concurrent page edit detected.");
      return { widgets: i.count + c.count, pages: p.count };
    },
    { timeout: 30000 });
    const response = { ...summary, status: "updated", backupFile, ...result };
    console.log(JSON.stringify(response, null, 2));
    return response;
  } finally {
    if (!deps.prisma) await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { main, TENANT_ID, PAGE_ID };
