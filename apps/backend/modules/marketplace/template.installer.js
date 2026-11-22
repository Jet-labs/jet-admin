/**
 * Marketplace App Template installer / uninstaller.
 *
 * Layers schema + seed + cron + roles + ledger on top of Bundle v1. Bundle v1
 * remains the single installer for datasources, queries, widgets, pages,
 * workflows and listeners.
 */
const { Client } = require("pg");
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { encryptOptions } = require("../../utils/datasourceOptions.util");
const { bundleService } = require("../bundle/bundle.service");
const { tenantRoleService } = require("../tenantRole/tenantRole.service");
const { addPolicy, removePoliciesForResource, removePoliciesForRole, getEnforcer, reloadPolicies } = require("../../config/casbin.config");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const { loadPackage, listSlugs, tablePrefix, resolvePlaceholders, compileBundle, deterministicUUID, readAsset } = require("./template.package");

const LEDGER_TABLE = '"tblMarketplaceTemplateInstalls"';

function templateError(message, code = "TEMPLATE_ERROR", statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

async function getLedger(client, tenantID, slug) {
  const result = await client.query(
    `SELECT * FROM ${LEDGER_TABLE} WHERE "tenantID" = $1::uuid AND "slug" = $2 LIMIT 1`,
    [tenantID, slug]
  );
  return result.rows[0] || null;
}

async function listLedgers(client, tenantID) {
  const result = await client.query(
    `SELECT "slug", "version", "status", "tablePrefix", "resources", "tables", "createdAt", "updatedAt" FROM ${LEDGER_TABLE} WHERE "tenantID" = $1::uuid ORDER BY "slug"`,
    [tenantID]
  );
  return result.rows;
}

async function upsertLedger(client, { tenantID, slug, version, prefix, options, resources, tables, status, userID }) {
  await client.query(
    `INSERT INTO ${LEDGER_TABLE}
      ("tenantID", "slug", "version", "tablePrefix", "options", "resources", "tables", "status", "installedByUserID", "createdAt", "updatedAt")
     VALUES ($1::uuid, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9::uuid, now(), now())
     ON CONFLICT ("tenantID", "slug") DO UPDATE SET
       "version" = EXCLUDED."version",
       "tablePrefix" = EXCLUDED."tablePrefix",
       "options" = EXCLUDED."options",
       "resources" = EXCLUDED."resources",
       "tables" = EXCLUDED."tables",
       "status" = EXCLUDED."status",
       "installedByUserID" = EXCLUDED."installedByUserID",
       "updatedAt" = now()`,
    [tenantID, slug, version, prefix, JSON.stringify(options || {}), JSON.stringify(resources || []), JSON.stringify(tables || []), status, userID || null]
  );
}

async function deleteLedger(client, tenantID, slug) {
  await client.query(`DELETE FROM ${LEDGER_TABLE} WHERE "tenantID" = $1::uuid AND "slug" = $2`, [tenantID, slug]);
}

async function dropTemplateTables(client, prefix, tableNames) {
  if (!Array.isArray(tableNames) || tableNames.length === 0) return;
  const quoted = tableNames.map((name) => `"${String(prefix).replace(/"/g, '""')}${String(name).replace(/"/g, '""')}"`);
  await client.query(`DROP TABLE IF EXISTS ${quoted.join(", ")} CASCADE`);
  await client.query(`DROP FUNCTION IF EXISTS "${String(prefix).replace(/"/g, '""')}fn_audit"() CASCADE`);
}

async function createCronJobs({ tenantID, pkg, ledger, enableAutomation, creatorID }) {
  const workflowMap = new Map(
    ledger.resources.filter((r) => r.type === "workflow").map((r) => [r.originalID, r.id])
  );
  const created = [];
  for (const cron of pkg.cronJobs) {
    const workflowID = workflowMap.get(cron.workflow);
    if (!workflowID) continue;
    const row = await prisma.tblCronJobs.create({
      data: {
        tenantID,
        cronJobTitle: cron.title,
        cronJobDescription: cron.description,
        cronJobSchedule: cron.schedule,
        isDisabled: !enableAutomation,
        timeoutSeconds: cron.timeoutSeconds || 300,
        retryAttempts: cron.retryAttempts ?? 0,
        retryDelaySeconds: cron.retryDelaySeconds ?? 60,
        workflowID,
        workflowConfig: cron.workflowConfig || {},
        creatorID: creatorID || null,
        nextRunAt: null,
      },
    });
    created.push({ type: "cronJob", id: row.cronJobID, key: cron.key });
  }
  return created;
}

async function createRoles({ tenantID, pkg, ledger, authContext, userID }) {
  const pageMap = new Map(ledger.resources.filter((r) => r.type === "appPage").map((r) => [r.originalID, r.id]));
  const queryMap = new Map(ledger.resources.filter((r) => r.type === "dataQuery").map((r) => [r.originalID, r.id]));
  const workflowMap = new Map(ledger.resources.filter((r) => r.type === "workflow").map((r) => [r.originalID, r.id]));
  const pageId = (slug) => deterministicUUID(`${pkg.manifest.slug}:appPage:${slug}`);
  const queryId = (slug) => deterministicUUID(`${pkg.manifest.slug}:dataQuery:${slug}`);
  const workflowId = (slug) => deterministicUUID(`${pkg.manifest.slug}:workflow:${slug}`);
  const permissionTitles = new Set();
  const rolePlans = [];
  for (const role of pkg.roles) {
    const general = new Set(role.generalPermissions || []);
    for (const title of general) permissionTitles.add(title);
    const assetPermissions = [];
    for (const page of role.pages || []) {
      if (!page.canView) continue;
      const target = pageMap.get(pageId(page.page));
      if (!target) continue;
      assetPermissions.push({ resourceType: "appPage", resourceID: target, action: "read" });
      assetPermissions.push({ resourceType: "appPage", resourceID: target, action: "execute" });
      permissionTitles.add(`tenant:asset:apppage:${target}:read`);
      permissionTitles.add(`tenant:asset:apppage:${target}:execute`);
    }
    // Grant query/workflow execution per asset instead of a wildcard. This is
    // what makes read-only roles genuinely read-only while still allowing
    // those roles to run the queries and workflows their template role names.
    for (const query of role.queries || []) {
      if (!query.canExecute) continue;
      const target = queryMap.get(queryId(query.query));
      if (!target) continue;
      assetPermissions.push({ resourceType: "dataquery", resourceID: target, action: "execute" });
      permissionTitles.add(`tenant:asset:dataquery:${target}:execute`);
    }
    for (const workflow of role.workflows || []) {
      if (!workflow.canTrigger) continue;
      const target = workflowMap.get(workflowId(workflow.workflow));
      if (!target) continue;
      assetPermissions.push({ resourceType: "workflow", resourceID: target, action: "execute" });
      permissionTitles.add(`tenant:asset:workflow:${target}:execute`);
    }
    rolePlans.push({ role, general, assetPermissions });
  }
  // Create every asset permission outside the role transaction. Creating them
  // one-by-one inside tenantRoleService.createRole exceeded Prisma's default
  // 5s interactive transaction budget on remote databases.
  await prisma.tblPermissions.createMany({
    data: [...permissionTitles].map((permissionTitle) => ({
      permissionTitle,
      permissionDescription: `Marketplace template permission ${permissionTitle}`,
    })),
    skipDuplicates: true,
  });
  const permissionRows = await prisma.tblPermissions.findMany({
    where: { permissionTitle: { in: [...permissionTitles] } },
    select: { permissionID: true, permissionTitle: true },
  });
  const permissionByTitle = new Map(permissionRows.map((row) => [row.permissionTitle.trim().toLowerCase(), row.permissionID]));
  const created = [];
  for (const plan of rolePlans) {
    const permissionIDs = [...plan.general]
      .map((title) => permissionByTitle.get(title.trim().toLowerCase()))
      .filter(Boolean);
    for (const asset of plan.assetPermissions) {
      const title = `tenant:asset:${asset.resourceType.toLowerCase()}:${asset.resourceID}:${asset.action}`;
      const id = permissionByTitle.get(title);
      if (id) permissionIDs.push(id);
    }
    await tenantRoleService.createRole({
      tenantID,
      roleTitle: plan.role.title,
      roleDescription: plan.role.description,
      permissionIDs: [...new Set(permissionIDs)],
      assetPermissions: [],
    });
    const roleRow = await prisma.tblRoles.findFirst({
      where: { tenantID, roleTitle: plan.role.title },
      orderBy: { roleID: "desc" },
    });
    if (!roleRow) throw new Error(`Role "${plan.role.title}" was created but could not be loaded.`);
    if (plan.role.key === "admin") {
      await addPolicy(`role:${roleRow.roleID}`, tenantID, "*", "*", "allow");
    }
    created.push({ type: "role", id: roleRow.roleID, key: plan.role.key });
  }
  await reloadPolicies();
  return created;
}

async function createDemoUsers({ tenantID, pkg, ledger, roles, creatorID }) {
  const created = [];
  const short = String(tenantID).replace(/-/g, "").slice(0, 8);
  for (const role of roles) {
    const rolePlan = (pkg.roles || []).find((r) => r.key === role.key);
    if (!rolePlan) continue;
    const email = `demo+${pkg.manifest.slug}+${short}+${role.key}@example.invalid`;
    let user = await prisma.tblUsers.findFirst({ where: { email } });
    if (!user) {
      user = await prisma.tblUsers.create({
        data: {
          firebaseID: `demo:${pkg.manifest.slug}:${short}:${role.key}`.slice(0, 128),
          email,
          firstName: rolePlan.title.slice(0, 64),
          lastName: "Demo",
          isDisabled: false,
        },
      });
    }
    await prisma.tblUsersTenantsRelationship.upsert({
      where: { tenantID_userID: { tenantID, userID: user.userID } },
      update: {},
      create: { tenantID, userID: user.userID, role: "MEMBER" },
    });
    await prisma.tblUserTenantRoleMappings.upsert({
      where: { userID_tenantID_roleID: { userID: user.userID, tenantID, roleID: role.id } },
      update: {},
      create: { userID: user.userID, tenantID, roleID: role.id },
    });
    const { addRoleForUser } = require("../../config/casbin.config");
    await addRoleForUser(user.userID, `role:${role.id}`, tenantID);
    created.push({ type: "demoUser", id: user.userID, key: role.key });
  }
  return created;
}

async function installTemplate({ tenantID, slug, options = {}, userID, authContext }) {
  const pkg = await loadPackage(slug);
  const includeSampleData = options.includeSampleData !== false;
  const createDemoUsersOption = options.createDemoUsers === true;
  const enableAutomation = options.enableAutomation === true;
  const reinstall = options.reinstall === true;
  const prefix = tablePrefix(pkg.manifest, tenantID);
  const creatorID = (userID || getCreationContextFromAuthContext(authContext).creatorID) || null;

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  let lockAcquired = false;
  try {
    await client.query("SELECT pg_advisory_lock(hashtext($1))", [`marketplace-template:${tenantID}:${slug}`]);
    lockAcquired = true;
    const existing = await getLedger(client, tenantID, slug);
    if (existing && existing.status === "INSTALLED" && !reinstall && existing.version === pkg.manifest.version) {
      return { alreadyInstalled: true, install: existing };
    }
    if (existing) {
      const ledgerResources = Array.isArray(existing.resources) ? existing.resources : [];
      const ledgerTables = Array.isArray(existing.tables) ? existing.tables : pkg.tables;
      await cleanupInstall({ tenantID, slug, prefix: existing.tablePrefix || prefix, resources: ledgerResources, tables: ledgerTables, client });
    }

    await upsertLedger(client, {
      tenantID,
      slug,
      version: pkg.manifest.version,
      prefix,
      options,
      resources: [],
      tables: pkg.tables,
      status: "INSTALLING",
      userID: creatorID,
    });

    const schemaSql = resolvePlaceholders(pkg.schemaSql, prefix);
    const seedSql = resolvePlaceholders(pkg.seedSql, prefix);
    await client.query("BEGIN");
    await client.query(schemaSql);
    if (includeSampleData && seedSql.trim()) await client.query(seedSql);
    await client.query("COMMIT");

    let bundleResult;
    const resources = [];
    try {
      const bundle = compileBundle(pkg, prefix);
      bundleResult = await bundleService.executeImport({
        tenantID,
        userID: creatorID,
        authContext: authContext || { authType: "USER", userID: creatorID },
        bundle,
      });
      for (const row of bundleResult.results) {
        resources.push({
          type: row.type,
          id: row.newID,
          originalID: row.originalID,
          key: bundle.items.find((item) => item.id === row.originalID)?.payload?.dataQueryTitle ||
            bundle.items.find((item) => item.id === row.originalID)?.payload?.appPageTitle ||
            bundle.items.find((item) => item.id === row.originalID)?.payload?.widgetTitle ||
            bundle.items.find((item) => item.id === row.originalID)?.payload?.title ||
            bundle.items.find((item) => item.id === row.originalID)?.payload?.listenerTitle ||
            bundle.items.find((item) => item.id === row.originalID)?.payload?.datasourceTitle ||
            row.originalID,
        });
      }

      // Install the real platform connection after bundle import. Bundle v1
      // strips credentials by design; this datasource is created server-side.
      const primaryOriginal = deterministicUUID(`${pkg.manifest.slug}:datasource:primary`);
      const primaryResult = bundleResult.results.find((r) => r.type === "datasource" && r.originalID === primaryOriginal);
      if (primaryResult) {
        await prisma.tblDatasources.update({
          where: { datasourceID: primaryResult.newID },
          data: {
            datasourceOptions: encryptOptions({
              connectionOption: "connectionString",
              connectionString: process.env.DATABASE_URL,
            }),
            connectionStatus: "active",
          },
        });
      }

      const cronResources = await createCronJobs({ tenantID, pkg, ledger: { resources }, enableAutomation, creatorID });
      resources.push(...cronResources);
      const roleResources = await createRoles({ tenantID, pkg, ledger: { resources }, authContext, userID: creatorID });
      resources.push(...roleResources);
      if (createDemoUsersOption) {
        const userResources = await createDemoUsers({ tenantID, pkg, ledger: { resources }, roles: roleResources, creatorID });
        resources.push(...userResources);
      }

      const ledger = await upsertLedger(client, {
        tenantID,
        slug,
        version: pkg.manifest.version,
        prefix,
        options,
        resources,
        tables: pkg.tables,
        status: "INSTALLED",
        userID: creatorID,
      });
      const installed = await getLedger(client, tenantID, slug);
      Logger.log("success", {
        message: "templateInstaller:install:success",
        params: { tenantID, slug, resources: resources.length, warnings: bundleResult.warnings?.length || 0 },
      });
      return {
        alreadyInstalled: false,
        install: installed,
        created: resources.length,
        warnings: bundleResult.warnings || [],
        skipped: bundleResult.skipped || [],
      };
    } catch (error) {
      await cleanupInstall({ tenantID, slug, prefix, resources, tables: pkg.tables, client });
      await deleteLedger(client, tenantID, slug);
      throw error;
    }
  } catch (error) {
    Logger.log("error", {
      message: "templateInstaller:install:failure",
      params: { tenantID, slug, error: error.message },
    });
    throw error;
  } finally {
    if (lockAcquired) await client.query("SELECT pg_advisory_unlock(hashtext($1))", [`marketplace-template:${tenantID}:${slug}`]).catch(() => {});
    await client.end().catch(() => {});
  }
}

async function cleanupInstall({ tenantID, slug, prefix, resources = [], tables = [], client }) {
  const byType = (type) => resources.filter((r) => r.type === type).map((r) => r.id).filter(Boolean);
  const ids = (list) => (list.length ? { in: list } : null);

  // Platform resources, FK-safe order.
  const cronIDs = byType("cronJob");
  if (cronIDs.length) {
    await prisma.tblCronJobHistory.deleteMany({ where: { cronJobID: { in: cronIDs } } });
    await prisma.tblCronJobs.deleteMany({ where: { cronJobID: { in: cronIDs } } });
  }
  const listenerIDs = byType("listener");
  if (listenerIDs.length) await prisma.tblListeners.deleteMany({ where: { listenerID: { in: listenerIDs } } });
  const pageIDs = byType("appPage");
  if (pageIDs.length) {
    await prisma.tblAppPageVersions.deleteMany({ where: { appPageID: { in: pageIDs } } });
    await prisma.tblAppPages.deleteMany({ where: { appPageID: { in: pageIDs } } });
  }
  const widgetIDs = byType("widget");
  if (widgetIDs.length) await prisma.tblWidgets.deleteMany({ where: { widgetID: { in: widgetIDs } } });
  const queryIDs = byType("dataQuery");
  if (queryIDs.length) await prisma.tblDataQueries.deleteMany({ where: { dataQueryID: { in: queryIDs } } });
  const workflowIDs = byType("workflow");
  if (workflowIDs.length) {
    await prisma.tblWorkflowInstances.deleteMany({ where: { workflowID: { in: workflowIDs } } });
    await prisma.tblWorkflows.deleteMany({ where: { workflowID: { in: workflowIDs } } });
  }
  const datasourceIDs = byType("datasource");
  if (datasourceIDs.length) await prisma.tblDatasources.deleteMany({ where: { datasourceID: { in: datasourceIDs } } });

  // Roles and demo users.
  const roleIDs = byType("role");
  const demoUserIDs = byType("demoUser");
  if (roleIDs.length) {
    await prisma.tblUserTenantRoleMappings.deleteMany({ where: { roleID: { in: roleIDs } } });
    await prisma.tblRolePermissionMappings.deleteMany({ where: { roleID: { in: roleIDs } } });
    for (const pageID of pageIDs) {
      await prisma.tblPermissions.deleteMany({
        where: { permissionTitle: { startsWith: `tenant:asset:apppage:${pageID}:` } },
      }).catch(() => {});
    }
    for (const roleID of roleIDs) {
      await removePoliciesForRole(`role:${roleID}`, tenantID).catch(() => {});
    }
    await prisma.tblRoles.deleteMany({ where: { roleID: { in: roleIDs } } });
  }
  if (demoUserIDs.length) {
    await prisma.tblUserTenantRoleMappings.deleteMany({ where: { userID: { in: demoUserIDs } } });
    await prisma.tblUsersTenantsRelationship.deleteMany({ where: { userID: { in: demoUserIDs } } });
    await prisma.tblUserTenantConfigMap.deleteMany({ where: { userID: { in: demoUserIDs } } });
    await prisma.tblUsers.deleteMany({ where: { userID: { in: demoUserIDs } } });
    const enforcer = await getEnforcer();
    for (const userID of demoUserIDs) await enforcer.removeFilteredPolicy(0, userID).catch(() => {});
  }

  // Casbin asset policies for template resources.
  const resourceTypes = {
    appPage: "appPage",
    widget: "widget",
    workflow: "workflow",
    dataQuery: "dataquery",
    datasource: "datasource",
    listener: "listener",
  };
  for (const resource of resources) {
    const casbinType = resourceTypes[resource.type];
    if (casbinType && resource.id) await removePoliciesForResource(tenantID, `${casbinType}:${resource.id}`).catch(() => {});
  }

  // Tenant tables, function and ledger.
  if (client) {
    await dropTemplateTables(client, prefix, tables);
    await deleteLedger(client, tenantID, slug);
  } else {
    const scratch = new Client({ connectionString: process.env.DATABASE_URL });
    await scratch.connect();
    try {
      await dropTemplateTables(scratch, prefix, tables);
      await deleteLedger(scratch, tenantID, slug);
    } finally {
      await scratch.end().catch(() => {});
    }
  }
  await reloadPolicies().catch(() => {});
}

async function uninstallTemplate({ tenantID, slug, userID }) {
  let pkg = null;
  try {
    pkg = await loadPackage(slug);
  } catch (error) {
    // The ledger is still authoritative for uninstall even if the package was
    // unregistered from the store.
    pkg = null;
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  let lockAcquired = false;
  try {
    await client.query("SELECT pg_advisory_lock(hashtext($1))", [`marketplace-template:${tenantID}:${slug}`]);
    lockAcquired = true;
    const ledger = await getLedger(client, tenantID, slug);
    if (!ledger) return { removed: false, reason: "not-installed" };
    await cleanupInstall({
      tenantID,
      slug,
      prefix: ledger.tablePrefix || (pkg ? tablePrefix(pkg.manifest, tenantID) : ""),
      resources: Array.isArray(ledger.resources) ? ledger.resources : [],
      tables: Array.isArray(ledger.tables) && ledger.tables.length ? ledger.tables : (pkg ? pkg.tables : []),
      client,
    });
    Logger.log("success", { message: "templateInstaller:uninstall:success", params: { tenantID, slug, userID } });
    return { removed: true };
  } finally {
    if (lockAcquired) await client.query("SELECT pg_advisory_unlock(hashtext($1))", [`marketplace-template:${tenantID}:${slug}`]).catch(() => {});
    await client.end().catch(() => {});
  }
}

async function listTemplates({ tenantID, search, category }) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const ledgers = await listLedgers(client, tenantID);
    const ledgerBySlug = new Map(ledgers.map((row) => [row.slug, row]));
    const searchValue = String(search || "").toLowerCase();
    const entries = [];
    for (const slug of await listSlugs()) {
      const pkg = await loadPackage(slug);
      const manifest = pkg.manifest;
      if (searchValue) {
        const haystack = `${manifest.name} ${manifest.slug} ${manifest.category} ${(manifest.tags || []).join(" ")} ${manifest.shortDescription}`.toLowerCase();
        if (!haystack.includes(searchValue)) continue;
      }
      if (category && String(manifest.category).toLowerCase() !== String(category).toLowerCase()) continue;
      const ledger = ledgerBySlug.get(slug);
      entries.push({
        ...manifest,
        installed: !!ledger && ledger.status === "INSTALLED",
        installStatus: ledger?.status || "NOT_INSTALLED",
        installedVersion: ledger?.version || null,
      });
    }
    const categories = [...new Set(entries.map((entry) => entry.category))].sort();
    return { entries, totalCount: entries.length, categories };
  } finally {
    await client.end().catch(() => {});
  }
}

async function getTemplate({ tenantID, slug }) {
  const pkg = await loadPackage(slug);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const ledger = await getLedger(client, tenantID, slug);
    const erdMatch = pkg.readme.match(/```mermaid\n([\s\S]*?)```/);
    return {
      manifest: pkg.manifest,
      readme: pkg.readme,
      erd: erdMatch ? erdMatch[1] : "",
      installed: !!ledger && ledger.status === "INSTALLED",
      install: ledger
        ? {
            status: ledger.status,
            version: ledger.version,
            tablePrefix: ledger.tablePrefix,
            options: ledger.options,
            resources: Array.isArray(ledger.resources) ? ledger.resources.length : 0,
            createdAt: ledger.createdAt,
          }
        : null,
    };
  } finally {
    await client.end().catch(() => {});
  }
}

module.exports = { installTemplate, uninstallTemplate, listTemplates, getTemplate, readAsset };
