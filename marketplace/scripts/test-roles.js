const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const { Client } = require("pg");
const { prisma } = require("../../apps/backend/config/prisma.config");
const { enforce } = require("../../apps/backend/config/casbin.config");
const { installTemplate, uninstallTemplate } = require("../../apps/backend/modules/marketplace/template.installer");
const { deterministicUUID } = require("../../apps/backend/modules/marketplace/template.package");

const slug = process.argv[2] || "crm-sales-pipeline";
const rolePlans = require(path.join(__dirname, "..", "templates", slug, "roles", "roles.json"));
const USER_ID = "1a3ece78-45ae-4a19-8475-3e443e2b01e8";

const entryFor = (role, collection, key, field) =>
  (role[collection] || []).find((entry) => entry[key] === field);
const allows = (role, collection, key, field, flag) =>
  Boolean(entryFor(role, collection, key, field)?.[flag]);

function chooseChecks(roles) {
  const admin = roles.find((role) => role.key === "admin") || roles[0];
  const others = roles.filter((role) => role !== admin);

  const adminPage =
    admin.pages.find(
      (page) =>
        page.canView &&
        others.some((role) => !allows(role, "pages", "page", page.page, "canView"))
    ) || admin.pages.find((page) => page.canView);
  const commonPage =
    admin.pages.find((page) =>
      roles.every((role) => allows(role, "pages", "page", page.page, "canView"))
    ) || admin.pages[0];

  const adminQuery =
    admin.queries.find(
      (query) =>
        query.canExecute &&
        others.some((role) => !allows(role, "queries", "query", query.query, "canExecute"))
    ) || admin.queries.find((query) => query.canExecute);
  const commonQuery =
    admin.queries.find((query) =>
      roles.every((role) => allows(role, "queries", "query", query.query, "canExecute"))
    ) || admin.queries[0];

  const adminWorkflow =
    admin.workflows.find(
      (workflow) =>
        workflow.canTrigger &&
        others.some(
          (role) => !allows(role, "workflows", "workflow", workflow.workflow, "canTrigger")
        )
    ) || admin.workflows.find((workflow) => workflow.canTrigger);

  return { adminPage, commonPage, adminQuery, commonQuery, adminWorkflow };
}

async function main() {
  const checks = chooseChecks(rolePlans);
  if (!checks.adminPage || !checks.adminQuery) {
    throw new Error(`Template "${slug}" does not expose role-checkable admin assets.`);
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const tenant = await client.query(
    `INSERT INTO "tblTenants" ("tenantTitle","creatorID","createdAt","updatedAt") VALUES ($1,$2::uuid,now(),now()) RETURNING "tenantID"`,
    [`Template Role QA ${Date.now()}`, USER_ID]
  );
  const tenantID = tenant.rows[0].tenantID;
  const short = String(tenantID).replace(/-/g, "").slice(0, 8);
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
      options: { includeSampleData: true, createDemoUsers: true },
      userID: USER_ID,
      authContext: { authType: "USER", userID: USER_ID },
    });

    const users = await prisma.tblUsers.findMany({
      where: { email: { startsWith: `demo+${slug}+${short}+` } },
      select: { userID: true, email: true },
    });
    const userFor = (role) =>
      users.find((user) => user.email === `demo+${slug}+${short}+${role}@example.invalid`);

    const ledgerRows = await client.query(
      `SELECT "resources" FROM "tblMarketplaceTemplateInstalls" WHERE "tenantID"=$1::uuid AND "slug"=$2`,
      [tenantID, slug]
    );
    const ledgerResources = ledgerRows.rows[0]?.resources || [];
    const installedID = (type, key) => {
      const originalID = deterministicUUID(`${slug}:${type}:${key}`);
      const resource = ledgerResources.find(
        (entry) => entry.type === type && entry.originalID === originalID
      );
      return resource?.id || originalID;
    };
    const pageID = (pageSlug) => installedID("appPage", pageSlug);
    const queryID = (querySlug) => installedID("dataQuery", querySlug);
    const workflowID = (workflowSlug) => installedID("workflow", workflowSlug);

    let failed = 0;
    for (const role of rolePlans) {
      const user = userFor(role.key);
      if (!user) {
        console.log(`  ! ${role.key}: demo user not found`);
        failed += 1;
        continue;
      }
      const expectedAdminPage = allows(role, "pages", "page", checks.adminPage.page, "canView");
      const expectedCommonPage = allows(role, "pages", "page", checks.commonPage.page, "canView");
      const expectedAdminQuery = allows(
        role,
        "queries",
        "query",
        checks.adminQuery.query,
        "canExecute"
      );
      const expectedCommonQuery = allows(
        role,
        "queries",
        "query",
        checks.commonQuery.query,
        "canExecute"
      );
      const expectedWorkflow = checks.adminWorkflow
        ? allows(role, "workflows", "workflow", checks.adminWorkflow.workflow, "canTrigger")
        : null;

      const adminPage = await enforce(
        user.userID,
        tenantID,
        `appPage:${pageID(checks.adminPage.page)}`,
        "read"
      );
      const commonPage = await enforce(
        user.userID,
        tenantID,
        `appPage:${pageID(checks.commonPage.page)}`,
        "read"
      );
      const adminQuery = await enforce(
        user.userID,
        tenantID,
        `dataquery:${queryID(checks.adminQuery.query)}`,
        "execute"
      );
      const commonQuery = await enforce(
        user.userID,
        tenantID,
        `dataquery:${queryID(checks.commonQuery.query)}`,
        "execute"
      );
      const workflow = checks.adminWorkflow
        ? await enforce(
            user.userID,
            tenantID,
            `workflow:${workflowID(checks.adminWorkflow.workflow)}`,
            "execute"
          )
        : null;

      const ok =
        adminPage === expectedAdminPage &&
        commonPage === expectedCommonPage &&
        adminQuery === expectedAdminQuery &&
        commonQuery === expectedCommonQuery &&
        (expectedWorkflow === null || workflow === expectedWorkflow);
      console.log(
        `  ${ok ? "+" : "!"} ${role.key}: adminPage=${adminPage}/${expectedAdminPage} ` +
          `commonPage=${commonPage}/${expectedCommonPage} adminQuery=${adminQuery}/${expectedAdminQuery} ` +
          `commonQuery=${commonQuery}/${expectedCommonQuery} workflow=${workflow}/${expectedWorkflow}`
      );
      if (!ok) failed += 1;
    }
    console.log(`roles: ${rolePlans.length - failed} ok, ${failed} failed`);
    if (failed) process.exitCode = 1;
  } finally {
    await uninstallTemplate({ tenantID, slug, userID: USER_ID });
    const leftoverUsers = await prisma.tblUsers.count({
      where: { email: { startsWith: `demo+${slug}+${short}+` } },
    });
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
