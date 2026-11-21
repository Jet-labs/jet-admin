/**
 * Apply a template package's DDL + seed inside a rolled-back transaction and
 * run its read-only queries. This catches SQL/seed errors without polluting a
 * tenant database.
 *
 * Usage: node marketplace/scripts/smoke-sql.js <slug>
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const { Client } = require("pg");
const { deterministicUUID } = require("./lib/util");

const ROOT = path.resolve(__dirname, "..");
const slug = process.argv[2];
if (!slug) {
  console.error("usage: node marketplace/scripts/smoke-sql.js <slug>");
  process.exit(1);
}
const dir = path.join(ROOT, "templates", slug);
const prefix = `tpl_${slug.replace(/[^a-z0-9]/g, "").slice(0, 8)}_smoke_`;
const quoteIdent = (value) => `"${value.replace(/"/g, '""')}"`;
const tableName = (name) => quoteIdent(`${prefix}${name}`);
const resolvePlaceholders = (text) =>
  text
    .replace(/\{\{table:([a-z0-9_]+)\}\}/g, (_, name) => tableName(name))
    .replace(/\{\{rawtable:([a-z0-9_]+)\}\}/g, (_, name) => `${prefix}${name}`)
    .replace(/\{\{idx:([a-z0-9_]+)\}\}/g, (_, name) => `${prefix}idx_${name}`)
    .replace(/\{\{fn:([a-z0-9_]+)\}\}/g, (_, name) => `${prefix}fn_${name}`)
    .replace(/\{\{trigger:([a-z0-9_]+)\}\}/g, (_, name) => `${prefix}trg_${name}`);

function valuesFor(query) {
  const defs = query.options?.inputDefinitions || [];
  return defs.map((def) => {
    if (def.key === "tenantID") return "00000000-0000-4000-8000-000000000001";
    if (def.default !== undefined) return def.default;
    if (def.type === "number") return 1;
    if (def.type === "boolean") return false;
    if (def.type === "array") return [1, 2];
    if (def.type === "object") return {};
    return "";
  });
}

async function main() {
  const schemaText = fs.readFileSync(path.join(dir, "schema", "001-schema.sql"), "utf8");
  const schemaSql = resolvePlaceholders(schemaText);
  const seedSql = resolvePlaceholders(fs.readFileSync(path.join(dir, "seed", "001-seed.sql"), "utf8"));
  const queries = fs
    .readdirSync(path.join(dir, "queries"))
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, "queries", f), "utf8")));
  const datasources = JSON.parse(fs.readFileSync(path.join(dir, "datasources", "datasources.json"), "utf8"));
  const primary = datasources.find((d) => d.slug === "primary");
  if (!primary) throw new Error("primary datasource missing");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const created = [];
  try {
    await client.query("BEGIN");
    await client.query(schemaSql);
    await client.query(seedSql);
    const tableNames = [...new Set([...schemaText.matchAll(/\{\{table:([a-z0-9_]+)\}\}/g)].map((m) => m[1]))];
    for (const name of tableNames) {
      const result = await client.query(`SELECT count(*)::int AS count FROM ${tableName(name)}`);
      created.push([name, result.rows[0].count]);
    }
    let checked = 0;
    let failed = 0;
    for (const query of queries) {
      if (query.datasource !== "primary") continue;
      if ((query.tags || []).includes("write")) continue;
      const sql = resolvePlaceholders(query.options?.query || "");
      const values = valuesFor(query);
      try {
        await client.query("SAVEPOINT q");
        await client.query(sql, values);
        await client.query("RELEASE SAVEPOINT q");
        checked += 1;
      } catch (error) {
        await client.query("ROLLBACK TO SAVEPOINT q").catch(() => {});
        failed += 1;
        console.log(`  ! ${query.slug}: ${error.message.split("\n")[0]}`);
      }
    }
    console.log(`+ ${slug}: seed ok (${created.length} tables, ${created.reduce((n, [, c]) => n + c, 0)} rows), ${checked} queries ran, ${failed} failed`);
    await client.query("ROLLBACK");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(`x ${slug}: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
