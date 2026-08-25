/**
 * Manual migrations runner.
 *
 * Applies every *.sql file from prisma/migrations/manual/ that has not been
 * applied yet, in filename order. Applied files are tracked in the
 * `_manual_migrations` table so re-running is always safe (idempotent).
 *
 * Usage:
 *   node scripts/run-manual-migrations.js            # apply all pending
 *   node scripts/run-manual-migrations.js --status   # list applied/pending
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { Client } = require("pg");

const MIGRATIONS_DIR = path.join(__dirname, "..", "prisma", "migrations", "manual");

async function main() {
  const statusOnly = process.argv.includes("--status");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Check apps/backend/.env");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // 1. Tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_manual_migrations" (
        "filename" VARCHAR(255) PRIMARY KEY,
        "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const { rows: appliedRows } = await client.query(
      `SELECT "filename" FROM "_manual_migrations"`
    );
    const applied = new Set(appliedRows.map((r) => r.filename));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("No manual migration files found.");
      return;
    }

    let failures = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`= ${file}  (already applied)`);
        continue;
      }
      if (statusOnly) {
        console.log(`? ${file}  (pending)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      try {
        await client.query("BEGIN");
        // Simple query protocol: multi-statement scripts are fine here.
        await client.query(sql);
        await client.query(
          `INSERT INTO "_manual_migrations" ("filename") VALUES ($1)`,
          [file]
        );
        await client.query("COMMIT");
        console.log(`+ ${file}  (applied)`);
      } catch (error) {
        await client.query("ROLLBACK");
        failures += 1;
        console.error(`x ${file}  FAILED: ${error.message}`);
      }
    }

    if (failures > 0) {
      console.error(`${failures} migration(s) failed.`);
      process.exitCode = 1;
    } else {
      console.log("Manual migrations up to date.");
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
