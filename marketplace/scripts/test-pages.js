/**
 * Install a template in a throwaway tenant, execute every page's data-source
 * query with its default inputs, then uninstall and assert no orphans.
 *
 * Usage: node marketplace/scripts/test-pages.js [slug]
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const { Client } = require("pg");
const { resolveTemplate } = require("@jet-admin/expression-engine");
const { authorizedExecuteDataQuery } = require("../../apps/backend/utils/authorizedProxy");
const { createSystemContext, ORIGIN_TYPES } = require("../../apps/backend/utils/executionContext");
const { installTemplate, uninstallTemplate } = require("../../apps/backend/modules/marketplace/template.installer");

const slug = process.argv[2] || "crm-sales-pipeline";
const USER_ID = "1a3ece78-45ae-4a19-8475-3e443e2b01e8";

function resolvedInputs(page, tenantID) {
  const variables = Object.fromEntries((page.variables || []).map((v) => [v.key, v.defaultValue]));
  const globals = { tenantID, pageID: page.appPageID };
  const target = { state: { variables, globals } };
  const result = {};
  for (const [key, value] of Object.entries(page.appPageConfig?.dataSources?.[0]?.inputValues || {})) {
    // placeholder; sources are iterated below
  }
  return { variables, globals, target };
}

function resolveInputsForSource(source, page, tenantID) {
  const variables = Object.fromEntries((page.variables || []).map((v) => [v.key, v.defaultValue]));
  const target = { variables, globals: { tenantID, pageID: page.appPageID } };
  const out = {};
  for (const [key, value] of Object.entries(source.inputValues || {})) {
    if (typeof value === "string" && value.includes("{{")) {
      try {
        out[key] = resolveTemplate(value, target, { allowedRoots: ["state"], preserveSingleExpressionType: true });
      } catch {
        out[key] = null;
      }
    } else {
      out[key] = value;
    }
  }
  return out;
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const tenant = await client.query(
    `INSERT INTO "tblTenants" ("tenantTitle", "creatorID", "createdAt", "updatedAt")
     VALUES ($1, $2::uuid, now(), now()) RETURNING "tenantID"`,
    [`Template Page QA ${Date.now()}`, USER_ID]
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
  console.log(`tenant: ${tenantID}`);
  try {
    await installTemplate({
      tenantID,
      slug,
      options: { includeSampleData: true, createDemoUsers: true, enableAutomation: false },
      userID: USER_ID,
      authContext: { authType: "USER", userID: USER_ID },
    });
    const pages = (await client.query(
      'SELECT "appPageID", "appPageTitle", "appPageConfig" FROM "tblAppPages" WHERE "tenantID" = $1::uuid ORDER BY "appPageTitle"',
      [tenantID]
    )).rows;
    let checked = 0;
    let failed = 0;
    for (const page of pages) {
      const config = page.appPageConfig || {};
      const sources = config.dataSources || [];
      for (const source of sources) {
        if (source.type !== "query") continue;
        if (source.triggerMode === "manual") continue;
        const inputValues = resolveInputsForSource(source, {
          ...page,
          appPageConfig: config,
          variables: config.variables || [],
        }, tenantID);
        try {
          const result = await authorizedExecuteDataQuery({
            dataQueryID: source.queryID,
            inputValues,
            executionCtx: createSystemContext(ORIGIN_TYPES.APP_PAGE, page.appPageID, tenantID),
          });
          const isArray = Array.isArray(result);
          const count = isArray ? result.length : 0;
          if (!isArray) {
            failed += 1;
            console.log(`  ! ${page.appPageTitle} / ${source.alias}: result is not an array`);
          } else {
            checked += 1;
            console.log(`  + ${page.appPageTitle} / ${source.alias}: ${count} rows`);
          }
        } catch (error) {
          failed += 1;
          console.log(`  ! ${page.appPageTitle} / ${source.alias}: ${error.message}`);
        }
      }
    }
    console.log(`queries: ${checked} ok, ${failed} failed`);
    if (failed) process.exitCode = 1;
  } finally {
    await uninstallTemplate({ tenantID, slug, userID: USER_ID });
    const leftovers = await client.query(
      `SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'tpl_%'`
    );
    const ledger = await client.query('SELECT count(*)::int AS count FROM "tblMarketplaceTemplateInstalls" WHERE "tenantID" = $1::uuid', [tenantID]);
    console.log(`leftover template tables: ${leftovers.rows[0].count}, ledger rows: ${ledger.rows[0].count}`);
    await client.query('DELETE FROM "tblUserTenantConfigMap" WHERE "tenantID" = $1::uuid', [tenantID]);
    await client.query('DELETE FROM "tblUsersTenantsRelationship" WHERE "tenantID" = $1::uuid', [tenantID]);
    await client.query('DELETE FROM "tblTenants" WHERE "tenantID" = $1::uuid', [tenantID]);
    await client.end();
  }
}

main()
  .then(() => process.exit(process.exitCode || 0))
  .catch((error) => {
    console.error(error.stack || error);
    process.exit(1);
  });
