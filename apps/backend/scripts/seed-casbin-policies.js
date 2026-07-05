/**
 * Migration Script: Seed Casbin policies from existing RBAC tables.
 *
 * This script reads the current tblRoles, tblRolePermissionMappings,
 * tblUserTenantRoleMappings, and tblAPIKeyRoleMappings tables and
 * generates equivalent Casbin policies in the casbin_rule table.
 *
 * Run with:  node scripts/seed-casbin-policies.js
 *
 * Safe to run multiple times — it clears existing Casbin policies first.
 */

const { prisma } = require("../config/prisma.config");
const {
  getEnforcer,
  addPolicy,
  addRoleForUser,
  shutdown,
} = require("../config/casbin.config");
const Logger = require("../utils/logger");

// ── Permission-to-Action mapping ─────────────────────────────────────────────
// Maps legacy permission strings to Casbin (resourceType, action) tuples.

const { PERMISSION_MAP } = require("../config/permissions");

async function main() {
  console.log("🔄 Starting Casbin policy migration...\n");

  // 1. Initialize the enforcer (creates casbin_rule table if needed)
  const enforcer = await getEnforcer();

  // 2. Clear existing Casbin policies to make this idempotent
  await enforcer.clearPolicy();
  console.log("✅ Cleared existing Casbin policies\n");

  // 3. Fetch all roles with their permission mappings
  const roles = await prisma.tblRoles.findMany({
    include: {
      tblRolePermissionMappings: {
        include: { tblPermissions: true },
      },
    },
  });

  console.log(`📋 Found ${roles.length} roles\n`);

  // 4. For each role, generate Casbin policies
  let policyCount = 0;
  for (const role of roles) {
    const roleName = `role:${role.roleID}`;
    const permissions = role.tblRolePermissionMappings;

    // Determine which tenants this role applies to
    const tenantIDs = [];
    if (role.tenantID) {
      tenantIDs.push(role.tenantID);
    } else {
      // Global role — fetch all tenants
      const tenants = await prisma.tblTenants.findMany({
        select: { tenantID: true },
      });
      tenantIDs.push(...tenants.map((t) => t.tenantID));
    }

    for (const tenantID of tenantIDs) {
      for (const pm of permissions) {
        const permTitle = pm.tblPermissions.permissionTitle
          .trim()
          .toLowerCase();
        const mapping = PERMISSION_MAP[permTitle];

        if (mapping) {
          // Wildcard resource: applies to all resources of this type
          const resource = `${mapping.resource}:*`;
          const added = await addPolicy(
            roleName,
            tenantID,
            resource,
            mapping.action,
            "allow"
          );
          if (added) policyCount++;
        } else {
          // Check if it's an asset permission: tenant:asset:resourceType:resourceID:action
          const parts = permTitle.split(":");
          if (parts.length === 5 && parts[0] === "tenant" && parts[1] === "asset") {
            const resourceType = parts[2];
            const resourceID = parts[3];
            const action = parts[4];

            let finalResourceType = resourceType;
            if (resourceType === "apppage") finalResourceType = "appPage";

            const added = await addPolicy(
              roleName,
              tenantID,
              `${finalResourceType}:${resourceID}`,
              action,
              "allow"
            );
            if (added) policyCount++;
          } else {
            console.log(`  ⚠️  Unmapped permission: "${permTitle}"`);
          }
        }
      }
    }

    console.log(
      `  ✅ Role "${role.roleTitle}" (${roleName}): ${permissions.length} permissions mapped`
    );
  }

  console.log(`\n📋 Created ${policyCount} Casbin policies\n`);

  // 5. Fetch user-to-role mappings and create Casbin role assignments
  const userRoleMappings = await prisma.tblUserTenantRoleMappings.findMany();
  let roleAssignmentCount = 0;

  for (const mapping of userRoleMappings) {
    await addRoleForUser(
      mapping.userID,
      `role:${mapping.roleID}`,
      mapping.tenantID
    );
    roleAssignmentCount++;
  }

  console.log(
    `✅ Created ${roleAssignmentCount} user-role assignments\n`
  );

  // 6. Fetch API key-to-role mappings
  const apiKeyRoleMappings = await prisma.tblAPIKeyRoleMappings.findMany({
    include: { tblAPIKeys: true },
  });
  let apiKeyAssignmentCount = 0;

  for (const mapping of apiKeyRoleMappings) {
    const tenantID = mapping.tblAPIKeys?.tenantID;
    if (tenantID) {
      await addRoleForUser(
        mapping.apiKeyID,
        `role:${mapping.roleID}`,
        tenantID
      );
      apiKeyAssignmentCount++;
    }
  }

  console.log(
    `✅ Created ${apiKeyAssignmentCount} API key-role assignments\n`
  );

  // 7. Handle ADMIN users — give them wildcard access
  const adminUsers = await prisma.tblUsersTenantsRelationship.findMany({
    where: { role: "ADMIN" },
  });
  let adminPolicyCount = 0;

  for (const admin of adminUsers) {
    // Admins get a direct wildcard policy (no role indirection needed)
    const added = await addPolicy(
      admin.userID,
      admin.tenantID,
      "*",
      "*",
      "allow"
    );
    if (added) adminPolicyCount++;
  }

  console.log(
    `✅ Created ${adminPolicyCount} admin wildcard policies\n`
  );

  // 8. Save all policies to DB
  await enforcer.savePolicy();
  console.log("💾 Saved all policies to database\n");

  // 9. Cleanup
  await shutdown();
  await prisma.$disconnect();

  console.log("🎉 Migration complete!\n");
  console.log("Summary:");
  console.log(`  - ${policyCount} role policies`);
  console.log(`  - ${roleAssignmentCount} user-role assignments`);
  console.log(`  - ${apiKeyAssignmentCount} API key-role assignments`);
  console.log(`  - ${adminPolicyCount} admin wildcard policies`);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
