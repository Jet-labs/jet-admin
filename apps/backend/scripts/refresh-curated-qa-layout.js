/**
 * Update ONLY the two disposable pages installed during approved MC2 browser QA.
 * No reinstall, no production resources, no query/workflow edits. Saves a backup
 * and uses config equality guards so concurrent user changes abort the transaction.
 * Default is a no-connection dry run; --apply is required.
 */
const fs = require("fs");
const path = require("path");
const { sizeCuratedPage, readableChart } = require("./catalog/curatedLayout");
const TENANT_ID = "855b7183-350c-45cc-b0e8-d408e0c2e3f1";
const FIXTURES = [
  { pageID: "415b39fd-b71f-40ab-9d0f-79d978e54cc2", title: "Subscription retention, MRR exposure and dunning desk", widgets: ["3b2ef531-2dd7-4b70-b50b-978a9c2c6704", "dba213ae-09b5-45d1-b394-4d7bf0944f01", "f0555d0b-1ba1-4261-87dd-18cf15dbf5f9", "1314f5f7-78ed-41a0-a515-da420e2bb0d3", "f280dc7c-95b6-455f-8aa9-0922723358d7", "870071cf-b8c0-40fa-90c0-e72d6e53c65e", "9f03f253-01be-4fe5-ad50-5d439b46e9c2"] },
  { pageID: "7652303a-3f25-4dba-b553-f66c2d2902ef", title: "SLA budget, breach concentration and escalation desk", widgets: ["4e3e0d09-3fe7-4c30-a101-c276ca4627df", "a3ac0b9d-8b71-4661-9a6c-a19aa1402081", "45d05491-a4ef-4b8e-9d73-c5e9877dd569", "702904c9-a4cf-412a-9e51-61c04bc1e464", "229b9558-c5cb-4dc3-b3d0-9e5051c8abb4", "5e5dd533-a8c5-458a-8f43-877659213414", "2e445bc7-b5e6-46b2-8487-638712961874"] },
];
async function main(args = process.argv.slice(2), dependencies = {}) {
  if (args.some((a) => a !== "--apply")) throw new Error("Only --apply is supported");
  if (!args.includes("--apply")) {
    const result = { mode: "dry-run", tenantID: TENANT_ID, pageIDs: FIXTURES.map((f) => f.pageID) };
    console.log(JSON.stringify(result, null, 2));
    return result;
  }
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
  const prisma = dependencies.prisma || require("../config/prisma.config").prisma;
  try {
    const pages = [], widgets = [];
    for (const fixture of FIXTURES) {
      const page = await prisma.tblAppPages.findFirst({ where: { appPageID: fixture.pageID, tenantID: TENANT_ID } });
      if (!page || page.appPageTitle !== fixture.title) throw new Error(`QA fixture missing or changed: ${fixture.pageID}`);
      const widgetIDs = page.appPageConfig.widgets.map((k) => k.split("_")[1]);
      if (widgetIDs.length !== fixture.widgets.length || widgetIDs.some((id) => !fixture.widgets.includes(id))) throw new Error(`QA widget set changed: ${fixture.pageID}`);
      const rows = await prisma.tblWidgets.findMany({ where: { tenantID: TENANT_ID, widgetID: { in: fixture.widgets } } });
      if (rows.length !== fixture.widgets.length) throw new Error(`QA widgets missing: ${fixture.pageID}`);
      pages.push(page); widgets.push(...rows);
    }
    const backup = { tenantID: TENANT_ID, pages, widgets };
    const writeBackup = dependencies.writeBackup || ((data) => {
      const dir = path.join(__dirname, "..", "..", "..", "backups", "marketplace");
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `qa-layout-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
      fs.writeFileSync(file, JSON.stringify(data, null, 2), { flag: "wx" });
      return file;
    });
    const backupFile = writeBackup(backup);
    const types = new Map(widgets.map((w) => [w.widgetID, w.widgetType]));
    const result = await prisma.$transaction(async (tx) => {
      let changedPages = 0, changedCharts = 0;
      for (const page of pages) {
        const next = sizeCuratedPage(structuredClone(page.appPageConfig), (id) => types.get(id));
        const updated = await tx.tblAppPages.updateMany({ where: { appPageID: page.appPageID, tenantID: TENANT_ID, appPageConfig: { equals: page.appPageConfig } }, data: { appPageConfig: next } });
        if (updated.count !== 1) throw new Error("Concurrent page edit; layout refresh aborted");
        changedPages += 1;
      }
      for (const widget of widgets.filter((w) => ["vega", "vega-lite"].includes(w.widgetType))) {
        const next = readableChart(structuredClone(widget.widgetConfig));
        const updated = await tx.tblWidgets.updateMany({ where: { widgetID: widget.widgetID, tenantID: TENANT_ID, widgetConfig: { equals: widget.widgetConfig } }, data: { widgetConfig: next } });
        if (updated.count !== 1) throw new Error("Concurrent widget edit; layout refresh aborted");
        changedCharts += 1;
      }
      return { changedPages, changedCharts };
    }, { timeout: 30000 });
    console.log(JSON.stringify({ ...result, backupFile }, null, 2));
    return { ...result, backupFile };
  } finally {
    if (!dependencies.prisma) await prisma.$disconnect();
  }
}
if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { main, FIXTURES, TENANT_ID };
