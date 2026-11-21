/**
 * Direct installer smoke test (temporary QA tenant).
 * Usage: node marketplace/scripts/test-install.js [slug]
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const { Client } = require("pg");
const slug = process.argv[2] || "crm-sales-pipeline";
const { installTemplate, uninstallTemplate } = require("../../apps/backend/modules/marketplace/template.installer");

const USER_ID = "1a3ece78-45ae-4a19-8475-3e443e2b01e8";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const tenant = await client.query(
    `INSERT INTO "tblTenants" ("tenantTitle", "creatorID", "createdAt", "updatedAt")
     VALUES ($1, $2::uuid, now(), now()) RETURNING "tenantID"`,
    [`Template QA ${Date.now()}`, USER_ID]
  );
  const tenantID = tenant.rows[0].tenantID;
  await client.query(
    `INSERT INTO "tblUsersTenantsRelationship" ("tenantID", "userID", "role") VALUES ($1::uuid, $2::uuid, 'ADMIN')`,
    [tenantID, USER_ID]
  );
  await client.query(
    `INSERT INTO "tblUserTenantConfigMap" ("tenantID", "userID", "config") VALUES ($1::uuid, $2::uuid, '{}'::jsonb)`,
    [tenantID, USER_ID]
  );
  await client.end();
  console.log(`tenant: ${tenantID}`);
  try {
    const result = await installTemplate({
      tenantID,
      slug,
      options: { includeSampleData: true, createDemoUsers: true, enableAutomation: false },
      userID: USER_ID,
      authContext: { authType: "USER", userID: USER_ID },
    });
    console.log("install:", { alreadyInstalled: result.alreadyInstalled, created: result.created, warnings: result.warnings?.length, skipped: result.skipped?.length });
    const verify = new Client({ connectionString: process.env.DATABASE_URL });
    await verify.connect();
    const tables = await verify.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'tpl_%'`
    );
    const pages = await verify.query('SELECT count(*)::int AS count FROM "tblAppPages" WHERE "tenantID" = $1::uuid', [tenantID]);
    const queries = await verify.query('SELECT count(*)::int AS count FROM "tblDataQueries" WHERE "tenantID" = $1::uuid', [tenantID]);
    const roles = await verify.query('SELECT count(*)::int AS count FROM "tblRoles" WHERE "tenantID" = $1::uuid', [tenantID]);
    const crons = await verify.query('SELECT count(*)::int AS count FROM "tblCronJobs" WHERE "tenantID" = $1::uuid', [tenantID]);
    console.log("verify:", { tables: tables.rows.length, pages: pages.rows[0].count, queries: queries.rows[0].count, roles: roles.rows[0].count, crons: crons.rows[0].count });
    await verify.end();
    const uninstall = await uninstallTemplate({ tenantID, slug, userID: USER_ID });
    console.log("uninstall:", uninstall);
  } finally {
    const cleanup = new Client({ connectionString: process.env.DATABASE_URL });
    await cleanup.connect();
    await cleanup.query('DELETE FROM "tblUserTenantConfigMap" WHERE "tenantID" = $1::uuid', [tenantID]);
    await cleanup.query('DELETE FROM "tblUsersTenantsRelationship" WHERE "tenantID" = $1::uuid', [tenantID]);
    await cleanup.query('DELETE FROM "tblTenants" WHERE "tenantID" = $1::uuid', [tenantID]);
    await cleanup.end();
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
