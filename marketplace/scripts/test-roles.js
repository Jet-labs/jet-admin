const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const { Client } = require("pg");
const { prisma } = require("../../apps/backend/config/prisma.config");
const { enforce } = require("../../apps/backend/config/casbin.config");
const { installTemplate, uninstallTemplate } = require("../../apps/backend/modules/marketplace/template.installer");

const slug = "crm-sales-pipeline";
const USER_ID = "1a3ece78-45ae-4a19-8475-3e443e2b01e8";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const tenant = await client.query(
    `INSERT INTO "tblTenants" ("tenantTitle","creatorID","createdAt","updatedAt") VALUES ($1,$2::uuid,now(),now()) RETURNING "tenantID"`,
    [`Template Role QA ${Date.now()}`, USER_ID]
  );
  const tenantID = tenant.rows[0].tenantID;
  await client.query(`INSERT INTO "tblUsersTenantsRelationship" ("tenantID","userID","role") VALUES ($1::uuid,$2::uuid,'ADMIN')`, [tenantID, USER_ID]);
  await client.query(`INSERT INTO "tblUserTenantConfigMap" ("tenantID","userID","config") VALUES ($1::uuid,$2::uuid,'{}'::jsonb)`, [tenantID, USER_ID]);
  console.log("tenant", tenantID);
  try {
    await installTemplate({
      tenantID,
      slug,
      options: { includeSampleData: true, createDemoUsers: true },
      userID: USER_ID,
      authContext: { authType: "USER", userID: USER_ID },
    });
    const pages = await prisma.tblAppPages.findMany({ where: { tenantID }, select: { appPageID: true, appPageTitle: true } });
    const adminPage = pages.find((p) => /Admin . users/.test(p.appPageTitle)) || pages.find((p) => /^Admin/.test(p.appPageTitle));
    const portalPage = pages.find((p) => /Client portal/.test(p.appPageTitle));
    const query = await prisma.tblDataQueries.findFirst({ where: { tenantID, dataQueryTitle: { contains: "Deals" } }, select: { dataQueryID: true, dataQueryTitle: true } });
    const users = await prisma.tblUsers.findMany({ where: { email: { contains: `${slug}` } }, select: { userID: true, email: true } });
    const userFor = (role) => users.find((u) => u.email.includes(`+${role}@`));
    const matrix = [
      ["admin", true, true],
      ["manager", true, true],
      ["sales_rep", false, true],
      ["analyst", false, false],
      ["client", false, false],
    ];
    let failed = 0;
    for (const [role, adminAllowed, queryAllowed] of matrix) {
      const user = userFor(role);
      if (!user) {
        console.log(`  ! ${role}: demo user not found`);
        failed += 1;
        continue;
      }
      const pageAllowed = await enforce(user.userID, tenantID, `appPage:${adminPage.appPageID}`, "read");
      const portalAllowed = await enforce(user.userID, tenantID, `appPage:${portalPage.appPageID}`, "read");
      const queryCanRun = await enforce(user.userID, tenantID, `dataquery:${query.dataQueryID}`, "execute");
      const ok = pageAllowed === adminAllowed && portalAllowed === true && queryCanRun === queryAllowed;
      console.log(`  ${ok ? "+" : "!"} ${role}: adminPage=${pageAllowed} portalPage=${portalAllowed} query=${queryCanRun}`);
      if (!ok) failed += 1;
    }
    console.log(`roles: ${matrix.length - failed} ok, ${failed} failed`);
    if (failed) process.exitCode = 1;
  } finally {
    await uninstallTemplate({ tenantID, slug, userID: USER_ID });
    const leftoverUsers = await prisma.tblUsers.count({ where: { email: { contains: slug } } });
    const leftoverRoles = await prisma.tblRoles.count({ where: { tenantID } });
    console.log(`leftover demo users: ${leftoverUsers}, roles: ${leftoverRoles}`);
    await client.query('DELETE FROM "tblUserTenantConfigMap" WHERE "tenantID"=$1::uuid', [tenantID]);
    await client.query('DELETE FROM "tblUsersTenantsRelationship" WHERE "tenantID"=$1::uuid', [tenantID]);
    await client.query('DELETE FROM "tblTenants" WHERE "tenantID"=$1::uuid', [tenantID]);
    await client.end();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect().catch(() => {});
    process.exit(process.exitCode || 0);
  })
  .catch(async (error) => {
    console.error(error.stack || error);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  });
