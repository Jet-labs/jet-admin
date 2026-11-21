/**
 * Scenario-first marketplace seeding. Dry-run by default; never republishes
 * the old integration-name x four placeholders or calls them verified.
 *
 * node scripts/seed-marketplace.js
 * node scripts/seed-marketplace.js --apply
 * node scripts/seed-marketplace.js --apply --unverify-generated
 *
 * --unverify-generated only removes the verification claim on our old built-in
 * generated rows. It does not delete entries or change tenant-installed assets.
 */
const path = require("path");
const fs = require("fs");
const { buildCuratedCatalog } = require("./catalog/curatedMarketplace");
const { validateCuratedCatalog } = require("./catalog/validateCuratedMarketplace");

function statsFor(catalog) {
  const byType = {};
  for (const entry of catalog) byType[entry.itemType] = (byType[entry.itemType] || 0) + 1;
  return { total: catalog.length, byType, qualityTarget: "400-500 substantive items (not yet achieved)" };
}

async function main(args = process.argv.slice(2), dependencies = {}) {
  const allowed = new Set(["--apply", "--unverify-generated"]);
  for (const arg of args) if (!allowed.has(arg)) throw new Error(`Unknown argument: ${arg}`);
  const catalog = buildCuratedCatalog();
  validateCuratedCatalog(catalog);
  const apply = args.includes("--apply");
  const summary = { mode: apply ? "apply" : "dry-run", ...statsFor(catalog) };
  if (!apply) {
    console.log(JSON.stringify(summary, null, 2));
    return summary;
  }
  // Do not open a database connection before the explicit apply boundary.
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
  const prisma = dependencies.prisma || require("../config/prisma.config").prisma;
  const writeBackup = dependencies.writeBackup || ((backup) => {
    const dir = path.join(__dirname, "..", "..", "..", "backups", "marketplace");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `verification-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(file, JSON.stringify(backup, null, 2), { flag: "wx" });
    return file;
  });
  try {
    let created = 0, updated = 0, unverified = 0;
    for (const item of catalog) {
      const existing = await prisma.tblMarketplaceItem.findUnique({ where: { slug: item.slug } });
      if (existing && (existing.publisher !== "jet-admin" || existing.publishedByUserID)) {
        throw new Error(`Refusing to overwrite a user-published entry: ${item.slug}`);
      }
      const { itemID, installCount, isVerified, ...definition } = item;
      // Keep install statistics and operator verification when the content is unchanged.
      const changed = existing && JSON.stringify(existing.payload) !== JSON.stringify(item.payload);
      await prisma.tblMarketplaceItem.upsert({
        where: { slug: item.slug },
        create: item,
        update: { ...definition, ...(changed ? { isVerified: false } : {}), updatedAt: new Date() },
      });
      if (existing) updated += 1; else created += 1;
    }
    let verificationBackup;
    if (args.includes("--unverify-generated")) {
      // Both generator and publisher must match; never blanket-reset admin entries.
      const where = { publisher: "jet-admin", publishedByUserID: null, payload: { path: ["generator"], equals: "marketplace-catalog" } };
      const old = await prisma.tblMarketplaceItem.findMany({ where: { ...where, isVerified: true }, select: { itemID: true, slug: true, isVerified: true } });
      if (old.length) {
        verificationBackup = writeBackup(old);
        const result = await prisma.tblMarketplaceItem.updateMany({ where: { ...where, itemID: { in: old.map((i) => i.itemID) } }, data: { isVerified: false, updatedAt: new Date() } });
        unverified = result.count;
      }
    }
    const result = { ...summary, created, updated, unverified, verificationBackup, storedTotal: await prisma.tblMarketplaceItem.count() };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } finally {
    if (!dependencies.prisma) await prisma.$disconnect();
  }
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { main, statsFor };
