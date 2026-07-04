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

const PERMISSION_MAP = {
  // Data queries
  "tenant:query:list": { resource: "dataquery", action: "list" },
  "tenant:query:create": { resource: "dataquery", action: "create" },
  "tenant:query:read": { resource: "dataquery", action: "read" },
  "tenant:query:update": { resource: "dataquery", action: "update" },
  "tenant:query:delete": { resource: "dataquery", action: "delete" },
  "tenant:query:test": { resource: "dataquery", action: "test" },
  "tenant:query:clone": { resource: "dataquery", action: "clone" },
  "tenant:query:bulk:create": { resource: "dataquery", action: "create" },

  // Workflows
  "tenant:workflow:list": { resource: "workflow", action: "list" },
  "tenant:workflow:create": { resource: "workflow", action: "create" },
  "tenant:workflow:read": { resource: "workflow", action: "read" },
  "tenant:workflow:update": { resource: "workflow", action: "update" },
  "tenant:workflow:delete": { resource: "workflow", action: "delete" },
  "tenant:workflow:execute": { resource: "workflow", action: "execute" },

  // App pages
  "tenant:apppage:list": { resource: "appPage", action: "list" },
  "tenant:apppage:create": { resource: "appPage", action: "create" },
  "tenant:apppage:read": { resource: "appPage", action: "read" },
  "tenant:apppage:update": { resource: "appPage", action: "update" },
  "tenant:apppage:delete": { resource: "appPage", action: "delete" },
  "tenant:apppage:clone": { resource: "appPage", action: "clone" },

  // Datasources
  "tenant:datasource:list": { resource: "datasource", action: "list" },
  "tenant:datasource:create": { resource: "datasource", action: "create" },
  "tenant:datasource:read": { resource: "datasource", action: "read" },
  "tenant:datasource:update": { resource: "datasource", action: "update" },
  "tenant:datasource:delete": { resource: "datasource", action: "delete" },
  "tenant:datasource:test": { resource: "datasource", action: "test" },

  // Widgets
  "tenant:widget:list": { resource: "widget", action: "list" },
  "tenant:widget:create": { resource: "widget", action: "create" },
  "tenant:widget:read": { resource: "widget", action: "read" },
  "tenant:widget:update": { resource: "widget", action: "update" },
  "tenant:widget:delete": { resource: "widget", action: "delete" },
  "tenant:widget:clone": { resource: "widget", action: "clone" },

  // User management
  "tenant:user:list": { resource: "user", action: "list" },
  "tenant:user:create": { resource: "user", action: "create" },
  "tenant:user:read": { resource: "user", action: "read" },
  "tenant:user:update": { resource: "user", action: "update" },
  "tenant:user:delete": { resource: "user", action: "delete" },

  // Roles
  "tenant:role:list": { resource: "role", action: "list" },
  "tenant:role:create": { resource: "role", action: "create" },
  "tenant:role:read": { resource: "role", action: "read" },
  "tenant:role:update": { resource: "role", action: "update" },
  "tenant:role:delete": { resource: "role", action: "delete" },
  "tenant:permissions:list": { resource: "permission", action: "list" },

  // Tenant-level scoped permissions (used in tenant.v1.routes.js)
  "tenant:read": { resource: "tenant", action: "read" },
  "tenant:update": { resource: "tenant", action: "update" },
  "tenant:delete": { resource: "tenant", action: "delete" },
  "tenant:user": { resource: "user", action: "*" },
  "tenant:role": { resource: "role", action: "*" },
  "tenant:apikey": { resource: "apikey", action: "*" },
  "tenant:cronjobs": { resource: "cronjob", action: "*" },
  "tenant:datasource": { resource: "datasource", action: "*" },
  "tenant:query": { resource: "dataquery", action: "*" },
  "tenant:workflow": { resource: "workflow", action: "*" },
  "tenant:widget": { resource: "widget", action: "*" },
  "tenant:apppage": { resource: "appPage", action: "*" },
  "tenant:audit": { resource: "audit", action: "*" },
  "tenant:ai": { resource: "ai", action: "*" },
  "tenant:ai:chat": { resource: "ai", action: "chat" },
  "tenant:ai:read": { resource: "ai", action: "read" },
  "tenant:ai:delete": { resource: "ai", action: "delete" },
};

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
