// Explicit, additive migration; never runs as a server-startup side effect.
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { Client } = require("pg");
const { readFileSync } = require("fs");
const path = require("path");

const MIGRATIONS = [
  "20261122_applications_foundation.sql",
  "20261122_applications_releases.sql",
  "20261123_asset_versions.sql",
  "20261123_asset_version_references.sql",
  "20261123_application_page_version_pins.sql",
];

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    if (process.argv.includes("--apply")) {
      for (const filename of MIGRATIONS) {
        await client.query(readFileSync(path.join(__dirname, "../prisma/migrations/manual", filename), "utf8"));
        console.log(`Applied ${filename}`);
      }
      console.log("Applications migrations applied; no existing roles or business data changed.");
    }
    const result = await client.query(`SELECT
      to_regclass('public."tblApplications"') IS NOT NULL
      AND to_regclass('public."tblApplicationReleases"') IS NOT NULL
      AND to_regclass('public."tblApplicationEnvironments"') IS NOT NULL
      AND to_regclass('public."tblAssetVersions"') IS NOT NULL
      AND to_regclass('public."tblAssetVersionReferences"') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tblApplicationAssets' AND column_name = 'pageVersionID'
      ) AS installed`);
    console.log(`Applications schema installed: ${result.rows[0].installed}`);
    if (!result.rows[0].installed) console.log("Run node scripts/migrate-applications.js --apply to install the additive schema.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Applications migration failed:", error.code || "UNKNOWN", error.message);
    process.exitCode = 1;
  } finally { await client.end(); }
}
main();
