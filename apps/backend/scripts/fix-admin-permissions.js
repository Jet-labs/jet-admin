/**
 * Fix: Add missing datasource (and other missing) permissions to the ADMIN role.
 * Run once with: node scripts/fix-admin-permissions.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ADMIN_ROLE_ID = "d527f3b0-31a7-4a81-b85a-8a1973f56aec";

// These are the permission titles that SHOULD exist in the ADMIN role
// but are currently missing (confirmed from DB query)
const MISSING_PERMISSIONS = [
  "tenant:datasource:list",
  "tenant:datasource:read",
  "tenant:datasource:create",
  "tenant:datasource:update",
  "tenant:datasource:delete",
  // Also add other commonly-expected admin permissions that might be missing
  "tenant:query:list",
  "tenant:query:read",
  "tenant:query:create",
  "tenant:query:update",
  "tenant:query:delete",
  "tenant:query:test",
  "tenant:apppage:list",
  "tenant:apppage:read",
  "tenant:apppage:create",
  "tenant:apppage:update",
  "tenant:apppage:delete",
  "tenant:apppage:clone",
  "tenant:listener:list",
  "tenant:listener:read",
  "tenant:listener:create",
  "tenant:listener:update",
  "tenant:listener:delete",
  "tenant:apikey",
  "tenant:cronjobs",
  "tenant:audit",
  "tenant:delete",
];

async function main() {
  console.log("🔍 Fetching existing ADMIN role permissions...\n");

  const existingMappings = await prisma.tblRolePermissionMappings.findMany({
    where: { roleID: ADMIN_ROLE_ID },
    include: { tblPermissions: { select: { permissionTitle: true } } },
  });
  const existingTitles = new Set(
    existingMappings.map((m) => m.tblPermissions.permissionTitle)
  );
  console.log(`  Current permissions: ${existingTitles.size}`);

  let added = 0;
  let skipped = 0;
  let notFound = 0;

  for (const title of MISSING_PERMISSIONS) {
    if (existingTitles.has(title)) {
      console.log(`  ✅ Already present: ${title}`);
      skipped++;
      continue;
    }

    // Look up the permission by title
    const perm = await prisma.tblPermissions.findFirst({
      where: { permissionTitle: title },
    });

    if (!perm) {
      console.log(`  ⚠️  Permission not found in tblPermissions: ${title}`);
      notFound++;
      continue;
    }

    // Add mapping
    await prisma.tblRolePermissionMappings.upsert({
      where: { roleID_permissionID: { roleID: ADMIN_ROLE_ID, permissionID: perm.permissionID } },
      update: {},
      create: { roleID: ADMIN_ROLE_ID, permissionID: perm.permissionID },
    });
    console.log(`  ✅ Added: ${title}`);
    added++;
  }

  console.log(`\n📋 Summary: ${added} added, ${skipped} already present, ${notFound} not found in DB`);

  // Now trigger a re-sync of Casbin policies for this role across all tenants
  console.log("\n🔄 Re-syncing Casbin policies for ADMIN role across all tenants...");
  const { getEnforcer, addPolicy, reloadPolicies } = require("../config/casbin.config");

  const PERMISSION_MAP = {
    "tenant:query:list": { resource: "dataquery", action: "list" },
    "tenant:query:create": { resource: "dataquery", action: "create" },
    "tenant:query:read": { resource: "dataquery", action: "read" },
    "tenant:query:update": { resource: "dataquery", action: "update" },
    "tenant:query:delete": { resource: "dataquery", action: "delete" },
    "tenant:query:test": { resource: "dataquery", action: "test" },
    "tenant:query:clone": { resource: "dataquery", action: "clone" },
    "tenant:query:bulk:create": { resource: "dataquery", action: "create" },
    "tenant:workflow:list": { resource: "workflow", action: "list" },
    "tenant:workflow:create": { resource: "workflow", action: "create" },
    "tenant:workflow:read": { resource: "workflow", action: "read" },
    "tenant:workflow:update": { resource: "workflow", action: "update" },
    "tenant:workflow:delete": { resource: "workflow", action: "delete" },
    "tenant:workflow:execute": { resource: "workflow", action: "execute" },
    "tenant:apppage:list": { resource: "appPage", action: "list" },
    "tenant:apppage:create": { resource: "appPage", action: "create" },
    "tenant:apppage:read": { resource: "appPage", action: "read" },
    "tenant:apppage:update": { resource: "appPage", action: "update" },
    "tenant:apppage:delete": { resource: "appPage", action: "delete" },
    "tenant:apppage:clone": { resource: "appPage", action: "clone" },
    "tenant:datasource:list": { resource: "datasource", action: "list" },
    "tenant:datasource:create": { resource: "datasource", action: "create" },
    "tenant:datasource:read": { resource: "datasource", action: "read" },
    "tenant:datasource:update": { resource: "datasource", action: "update" },
    "tenant:datasource:delete": { resource: "datasource", action: "delete" },
    "tenant:datasource:test": { resource: "datasource", action: "test" },
    "tenant:widget:list": { resource: "widget", action: "list" },
    "tenant:widget:create": { resource: "widget", action: "create" },
    "tenant:widget:read": { resource: "widget", action: "read" },
    "tenant:widget:update": { resource: "widget", action: "update" },
    "tenant:widget:delete": { resource: "widget", action: "delete" },
    "tenant:widget:clone": { resource: "widget", action: "clone" },
    "tenant:listener:list": { resource: "listener", action: "list" },
    "tenant:listener:create": { resource: "listener", action: "create" },
    "tenant:listener:read": { resource: "listener", action: "read" },
    "tenant:listener:update": { resource: "listener", action: "update" },
    "tenant:listener:delete": { resource: "listener", action: "delete" },
    "tenant:user:list": { resource: "user", action: "list" },
    "tenant:user:create": { resource: "user", action: "create" },
    "tenant:user:read": { resource: "user", action: "read" },
    "tenant:user:update": { resource: "user", action: "update" },
    "tenant:user:delete": { resource: "user", action: "delete" },
    "tenant:role:list": { resource: "role", action: "list" },
    "tenant:role:create": { resource: "role", action: "create" },
    "tenant:role:read": { resource: "role", action: "read" },
    "tenant:role:update": { resource: "role", action: "update" },
    "tenant:role:delete": { resource: "role", action: "delete" },
    "tenant:permissions:list": { resource: "permission", action: "list" },
    "tenant:read": { resource: "tenant", action: "read" },
    "tenant:update": { resource: "tenant", action: "update" },
    "tenant:delete": { resource: "tenant", action: "delete" },
    "tenant:apikey": { resource: "apikey", action: "*" },
    "tenant:cronjobs": { resource: "cronjob", action: "*" },
    "tenant:audit": { resource: "audit", action: "*" },
  };

  // Re-read all permissions for the role after adding
  const allPerms = await prisma.tblRolePermissionMappings.findMany({
    where: { roleID: ADMIN_ROLE_ID },
    include: { tblPermissions: { select: { permissionTitle: true } } },
  });

  // Get all tenants (ADMIN is a global role)
  const tenants = await prisma.tblTenants.findMany({ select: { tenantID: true } });
  const roleName = `role:${ADMIN_ROLE_ID}`;
  let policyCount = 0;

  await getEnforcer(); // ensure initialized

  for (const tenant of tenants) {
    for (const pm of allPerms) {
      const permTitle = pm.tblPermissions.permissionTitle.trim().toLowerCase();
      const mapping = PERMISSION_MAP[permTitle];
      if (mapping) {
        const added = await addPolicy(roleName, tenant.tenantID, `${mapping.resource}:*`, mapping.action, "allow");
        if (added) policyCount++;
      }
    }
  }

  await reloadPolicies();
  console.log(`  ✅ Added ${policyCount} new Casbin p-rules across ${tenants.length} tenant(s)\n`);
  console.log("🎉 Done! The ADMIN role now has full datasource (and other missing) permissions.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
