/**
 * Partial/full uninstall test for a marketplace template.
 * Usage: node marketplace/scripts/test-uninstall.js [slug]
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const { Client } = require("pg");
const { prisma } = require("../../apps/backend/config/prisma.config");
const {
  installTemplate,
  uninstallTemplate,
  getTemplate,
} = require("../../apps/backend/modules/marketplace/template.installer");

const slug = process.argv[2] || "customer-support-console";
const USER_ID = "1a3ece78-45ae-4a19-8475-3e443e2b01e8";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const tenant = await client.query(
    `INSERT INTO "tblTenants" ("tenantTitle","creatorID","createdAt","updatedAt") VALUES ($1,$2::uuid,now(),now()) RETURNING "tenantID"`,
    [`Template Uninstall QA ${Date.now()}`, USER_ID]
  );
  const tenantID = tenant.rows[0].tenantID;
  await client.query(
    `INSERT INTO "tblUsersTenantsRelationship" ("tenantID","userID","role") VALUES ($1::uuid,$2::uuid,'ADMIN')`,
    [tenantID, USER_ID]
  );
  await client.query(
    `INSERT INTO "tblUserTenantConfigMap" ("tenantID","userID","config") VALUES ($1::uuid,$2::uuid,'{}'::jsonb)`,
    [tenantID, USER_ID]
  );
  console.log("tenant", tenantID);
  try {
    await installTemplate({
      tenantID,
      slug,
      options: { includeSampleData: true, createDemoUsers: false },
      userID: USER_ID,
      authContext: { authType: "USER", userID: USER_ID },
    });
    const detail = await getTemplate({ tenantID, slug });
    const plan = detail.install?.uninstallPlan;
    if (!plan) throw new Error("uninstall plan missing");
    const page = plan.resources.find((asset) => asset.type === "appPage");
    const table = plan.tables[0];
    if (!page || !table) throw new Error("expected at least one page and one table");

    const partial = await uninstallTemplate({
      tenantID,
      slug,
      userID: USER_ID,
      selectedAssetKeys: [page.key, table.key],
    });
    if (partial.mode !== "partial") throw new Error(`expected partial uninstall, got ${partial.mode}`);
    const deletedPage = await prisma.tblAppPages.findUnique({ where: { appPageID: page.id } });
    if (deletedPage) throw new Error("selected page was not deleted");
    const tableRows = await client.query(
      `SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
      [table.label]
    );
    if (tableRows.rows[0].count !== 0) throw new Error("selected table was not dropped");
    const ledgerAfterPartial = await client.query(
      `SELECT "resources", "tables" FROM "tblMarketplaceTemplateInstalls" WHERE "tenantID"=$1::uuid AND "slug"=$2`,
      [tenantID, slug]
    );
    if (!ledgerAfterPartial.rows.length) throw new Error("ledger should remain after partial uninstall");
    console.log("partial:", partial);
    console.log(
      "remaining ledger:",
      ledgerAfterPartial.rows[0].resources.length,
      "resources,",
      ledgerAfterPartial.rows[0].tables.length,
      "tables"
    );

    const full = await uninstallTemplate({ tenantID, slug, userID: USER_ID });
    if (full.mode !== "full") throw new Error(`expected full uninstall, got ${full.mode}`);
    const ledgerAfterFull = await client.query(
      `SELECT count(*)::int AS count FROM "tblMarketplaceTemplateInstalls" WHERE "tenantID"=$1::uuid AND "slug"=$2`,
      [tenantID, slug]
    );
    const short = String(tenantID).replace(/-/g, "").slice(0, 8);
    const leftoverTables = await client.query(
      `SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE $1`,
      [`tpl_%_${short}_%`]
    );
    console.log("full:", full);
    console.log("leftover ledger:", ledgerAfterFull.rows[0].count, "tables:", leftoverTables.rows[0].count);
    if (ledgerAfterFull.rows[0].count !== 0) throw new Error("ledger was not deleted");
  } finally {
    await client.query('DELETE FROM "tblUserTenantConfigMap" WHERE "tenantID"=$1::uuid', [tenantID]);
    await client.query('DELETE FROM "tblUsersTenantsRelationship" WHERE "tenantID"=$1::uuid', [tenantID]);
    await client.query('DELETE FROM "tblTenants" WHERE "tenantID"=$1::uuid', [tenantID]);
    await client.end();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error.stack || error);
    await prisma.$disconnect();
    process.exit(1);
  });
