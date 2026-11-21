/**
 * Repair the known blank legacy "PostgreSQL Admin App" installation in place.
 *
 * The original marketplace entry was a v1 page-only placeholder: fake grid
 * blocks, no widgets, no queries and a non-runtime datasource descriptor.
 * This script installs the curated PostgreSQL bundle into the same tenant,
 * copies its real page config onto the existing page, and removes ONLY the
 * duplicate page created by that import. Datasource/query/widget assets stay.
 *
 * Dry run by default. --apply is required and all guards must match exactly.
 */
const fs = require("fs");
const path = require("path");
const { buildCuratedCatalog } = require("./catalog/curatedMarketplace");

const DEFAULTS = {
  tenantID: "97ca7876-7c73-4578-bccb-6d56b98a0113",
  pageID: "29c5dd86-d3c7-4b2f-8da9-ca2ba6bea71f",
  title: "PostgreSQL Admin App",
  slug: "curated-postgresql-admin-app",
};

function parseArgs(argv) {
  const args = { apply: false, ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") args.apply = true;
    else if (arg === "--tenant") args.tenantID = argv[++i];
    else if (arg === "--page") args.pageID = argv[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!/^[0-9a-f-]{36}$/i.test(args.tenantID) || !/^[0-9a-f-]{36}$/i.test(args.pageID)) {
    throw new Error("Tenant and page IDs must be UUIDs.");
  }
  return args;
}

function isLegacyPlaceholder(page) {
  const config = page.appPageConfig || {};
  return (
    page.appPageTitle === DEFAULTS.title &&
    config.layoutVersion !== 2 &&
    config.layout?.type === "grid" &&
    !Array.isArray(config.widgets)
  );
}

async function main(argv = process.argv.slice(2), deps = {}) {
  const args = parseArgs(argv);
  const item = buildCuratedCatalog().find((entry) => entry.slug === args.slug);
  if (!item) throw new Error("Curated PostgreSQL marketplace item is missing.");
  const summary = {
    mode: args.apply ? "apply" : "dry-run",
    tenantID: args.tenantID,
    pageID: args.pageID,
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
    const file = path.join(dir, `legacy-postgres-repair-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), { flag: "wx" });
    return file;
  });

  try {
    console.log("repair: reading target page");
    const page = await prisma.tblAppPages.findFirst({
      where: { appPageID: args.pageID, tenantID: args.tenantID },
    });
    if (!page) throw new Error("Target page was not found in the requested tenant.");
    console.log("repair: target page loaded");
    if (page.appPageConfig?.layoutVersion === 2 && Array.isArray(page.appPageConfig?.widgets)) {
      const result = { ...summary, status: "already-repaired", pageID: page.appPageID };
      console.log(JSON.stringify(result, null, 2));
      return result;
    }
    if (!isLegacyPlaceholder(page)) {
      throw new Error("Target page no longer matches the blank legacy placeholder signature; refusing to modify it.");
    }

    let creatorID = page.creatorID;
    if (!creatorID) {
      const membership = await prisma.tblUsersTenantsRelationship.findFirst({
        where: { tenantID: args.tenantID },
        select: { userID: true },
      });
      creatorID = membership?.userID;
    }
    if (!creatorID) throw new Error("No creator/member user is available for imported asset ownership.");
    console.log(`repair: creator resolved (${creatorID.slice(0, 8)}…)`);

    const backupFile = writeBackup({ page });
    console.log(`repair: backup written to ${backupFile}`);
    // Install the dependency-complete curated bundle first.
    console.log("repair: importing curated bundle");
    const imported = await bundleService.executeImport({
      tenantID: args.tenantID,
      userID: creatorID,
      authContext: { authType: "USER", userID: creatorID },
      bundle: item.payload,
    });
    console.log(`repair: import complete (${imported.results.length} assets)`);
    const newPageResult = imported.results.find((row) => row.type === "appPage");
    if (!newPageResult) throw new Error("Curated import did not create an app page.");
    const newPage = await prisma.tblAppPages.findFirst({
      where: { appPageID: newPageResult.newID, tenantID: args.tenantID },
    });
    if (!newPage) throw new Error("Imported app page could not be read back.");

    // Atomic swap: only replace the exact legacy config observed at the start.
    await prisma.$transaction(async (tx) => {
      const updated = await tx.tblAppPages.updateMany({
        where: {
          appPageID: page.appPageID,
          tenantID: args.tenantID,
          appPageConfig: { equals: page.appPageConfig },
        },
        data: {
          appPageConfig: newPage.appPageConfig,
          appPageTitle: newPage.appPageTitle,
          appPageDescription: newPage.appPageDescription,
        },
      });
      if (updated.count !== 1) throw new Error("Concurrent page edit detected; repair aborted.");
      await tx.tblAppPages.delete({ where: { appPageID: newPage.appPageID } });
    });

    const result = {
      ...summary,
      status: "repaired",
      backupFile,
      pageID: page.appPageID,
      created: imported.results,
      removedDuplicatePageID: newPage.appPageID,
      note: "Reconnect the PostgreSQL datasource before expecting table data.",
    };
    console.log(JSON.stringify(result, null, 2));
    return result;
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
module.exports = { main, parseArgs, isLegacyPlaceholder, DEFAULTS };
