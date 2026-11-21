/**
 * Install the curated PostgreSQL admin console into a tenant.
 * Dry run by default; --apply required. Creates a fresh datasource, eight
 * queries, eleven widgets and the admin page. The datasource must be connected
 * after install.
 *
 * Usage:
 *   node scripts/install-postgres-admin-console.js
 *   node scripts/install-postgres-admin-console.js --apply [--tenant <uuid>]
 */
const path = require("path");
const { buildCuratedCatalog } = require("./catalog/curatedMarketplace");

const DEFAULT_TENANT = "97ca7876-7c73-4578-bccb-6d56b98a0113";

function parseArgs(argv) {
  const args = { apply: false, tenantID: DEFAULT_TENANT };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") args.apply = true;
    else if (arg === "--tenant") args.tenantID = argv[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!/^[0-9a-f-]{36}$/i.test(args.tenantID)) throw new Error("Tenant ID must be a UUID.");
  return args;
}

async function main(argv = process.argv.slice(2), deps = {}) {
  const args = parseArgs(argv);
  const item = buildCuratedCatalog().find((entry) => entry.slug === "curated-postgresql-admin-app");
  if (!item) throw new Error("Curated PostgreSQL item is missing.");
  const summary = {
    mode: args.apply ? "apply" : "dry-run",
    tenantID: args.tenantID,
    marketplaceItemID: item.itemID,
    bundleItems: item.payload.items.length,
    queries: item.payload.items.filter((i) => i.type === "dataQuery").length,
    widgets: item.payload.items.filter((i) => i.type === "widget").length,
  };
  if (!args.apply) {
    console.log(JSON.stringify(summary, null, 2));
    return summary;
  }

  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
  const prisma = deps.prisma || require("../config/prisma.config").prisma;
  const bundleService = deps.bundleService || require("../modules/bundle/bundle.service").bundleService;
  try {
    const membership = await prisma.tblUsersTenantsRelationship.findFirst({
      where: { tenantID: args.tenantID },
      select: { userID: true },
    });
    if (!membership?.userID) throw new Error("No tenant member is available to own the imported assets.");
    const imported = await bundleService.executeImport({
      tenantID: args.tenantID,
      userID: membership.userID,
      authContext: { authType: "USER", userID: membership.userID },
      bundle: item.payload,
    });
    const page = imported.results.find((result) => result.type === "appPage");
    const datasource = imported.results.find((result) => result.type === "datasource");
    const result = {
      ...summary,
      status: "installed",
      pageID: page?.newID,
      datasourceID: datasource?.newID,
      created: imported.results.length,
      note: "Open the new datasource and enter PostgreSQL credentials before querying.",
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
module.exports = { main, DEFAULT_TENANT };
