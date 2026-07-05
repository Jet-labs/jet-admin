/**
 * Fix: Add missing datasource (and other missing) permissions to the ADMIN role.
 * Run once with: node scripts/fix-admin-permissions.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ADMIN_ROLE_ID = "d527f3b0-31a7-4a81-b85a-8a1973f56aec";

const { PERMISSION_MAP, PERMISSIONS_LIST } = require("../config/permissions");
const MISSING_PERMISSIONS = PERMISSIONS_LIST.map(p => p.permissionTitle);

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
