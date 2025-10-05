const { prisma } = require("../config/prisma.config");

// Optional: Predefined UUIDs for deterministic seeding (or let DB generate)
// For simplicity, we'll let PostgreSQL generate UUIDs via `default(dbgenerated(...))`
// So we OMIT the ID fields and let the DB handle it.

const permissions = [
  {
    permissionTitle: "tenant:read",
    permissionDescription: "Permission to read tenant details",
  },
  {
    permissionTitle: "tenant:update",
    permissionDescription: "Permission to update tenant details",
  },
  {
    permissionTitle: "tenant:create",
    permissionDescription: "Permission to create a new tenant",
  },
  {
    permissionTitle: "tenant:role:create",
    permissionDescription: "Permission to create a new role",
  },
  {
    permissionTitle: "tenant:role:list",
    permissionDescription: "Permission to list all roles",
  },
  {
    permissionTitle: "tenant:role:read",
    permissionDescription: "Permission to read a specific role",
  },
  {
    permissionTitle: "tenant:role:update",
    permissionDescription: "Permission to update a role",
  },
  {
    permissionTitle: "tenant:role:delete",
    permissionDescription: "Permission to delete a role",
  },
  {
    permissionTitle: "tenant:user:list",
    permissionDescription: "Permission to list all users in a tenant",
  },
  {
    permissionTitle: "tenant:user:read",
    permissionDescription: "Permission to read a specific user in a tenant",
  },
  {
    permissionTitle: "tenant:user:update",
    permissionDescription: "Permission to update a user's roles in a tenant",
  },
  {
    permissionTitle: "tenant:user:create",
    permissionDescription: "Permission to add a user to a tenant",
  },
  {
    permissionTitle: "tenant:user:delete",
    permissionDescription: "Permission to remove a user from a tenant",
  },
  {
    permissionTitle: "tenant:database:metadata",
    permissionDescription: "Permission to view database metadata",
  },
  {
    permissionTitle: "tenant:database:schema:create",
    permissionDescription: "Permission to create a new database schema",
  },
  {
    permissionTitle: "tenant:database:query:list",
    permissionDescription: "Permission to list all database queries",
  },
  {
    permissionTitle: "tenant:database:query:create",
    permissionDescription: "Permission to create a new database query",
  },
  {
    permissionTitle: "tenant:database:query:test",
    permissionDescription: "Permission to test a database query",
  },
  {
    permissionTitle: "tenant:database:query:read",
    permissionDescription: "Permission to read a specific database query",
  },
  {
    permissionTitle: "tenant:database:query:update",
    permissionDescription: "Permission to update a database query",
  },
  {
    permissionTitle: "tenant:database:query:delete",
    permissionDescription: "Permission to delete a database query",
  },
  {
    permissionTitle: "tenant:database:table:list",
    permissionDescription: "Permission to list all database tables",
  },
  {
    permissionTitle: "tenant:database:table:create",
    permissionDescription: "Permission to create a new database table",
  },
  {
    permissionTitle: "tenant:database:table:read",
    permissionDescription: "Permission to read a specific database table",
  },
  {
    permissionTitle: "tenant:database:table:update",
    permissionDescription: "Permission to update a database table",
  },
  {
    permissionTitle: "tenant:database:table:row:read",
    permissionDescription: "Permission to read rows from a database table",
  },
  {
    permissionTitle: "tenant:database:table:row:create",
    permissionDescription: "Permission to create rows in a database table",
  },
  {
    permissionTitle: "tenant:database:table:row:update",
    permissionDescription: "Permission to update rows in a database table",
  },
  {
    permissionTitle: "tenant:database:table:stats",
    permissionDescription: "Permission to view statistics of a database table",
  },
  {
    permissionTitle: "tenant:database:trigger:list",
    permissionDescription: "Permission to list all database triggers",
  },
  {
    permissionTitle: "tenant:database:trigger:create",
    permissionDescription: "Permission to create a new database trigger",
  },
  {
    permissionTitle: "tenant:database:trigger:read",
    permissionDescription: "Permission to read a specific database trigger",
  },
  {
    permissionTitle: "tenant:database:trigger:delete",
    permissionDescription: "Permission to delete a database trigger",
  },
  {
    permissionTitle: "tenant:permissions:list",
    permissionDescription: "Permission to read permissions",
  },
  {
    permissionTitle: "tenant:database:chart:list",
    permissionDescription: "Permission to list all tenant charts",
  },
  {
    permissionTitle: "tenant:database:chart:create",
    permissionDescription: "Permission to create tenant chart",
  },
  {
    permissionTitle: "tenant:database:chart:delete",
    permissionDescription: "Permission to delete tenant chart",
  },
  {
    permissionTitle: "tenant:database:chart:update",
    permissionDescription: "Permission to update tenant chart",
  },
  {
    permissionTitle: "tenant:database:chart:read",
    permissionDescription: "Permission to read tenant chart",
  },
];

const roles = [
  {
    roleTitle: "TenantManager",
    roleDescription: "Manages tenant creation, updates, and deletion",
  },
  {
    roleTitle: "TenantViewer",
    roleDescription: "Can view tenant details but cannot modify them",
  },
  {
    roleTitle: "RoleManager",
    roleDescription: "Manages role creation, updates, and deletion",
  },
  {
    roleTitle: "RoleViewer",
    roleDescription: "Can view roles but cannot modify them",
  },
  {
    roleTitle: "UserManager",
    roleDescription: "Manages tenant users and their roles",
  },
  {
    roleTitle: "UserViewer",
    roleDescription: "Can view tenant users but cannot modify them",
  },
  {
    roleTitle: "DatabaseManager",
    roleDescription: "Manages database schemas, queries, and tables",
  },
  {
    roleTitle: "DatabaseViewer",
    roleDescription: "Can view database metadata, schemas, and queries",
  },
  {
    roleTitle: "QueryCreator",
    roleDescription: "Can create and test database queries",
  },
  {
    roleTitle: "QueryEditor",
    roleDescription: "Can edit and delete database queries",
  },
  {
    roleTitle: "QueryRunner",
    roleDescription: "Can run and test database queries",
  },
  {
    roleTitle: "TableManager",
    roleDescription: "Manages database tables and rows",
  },
  {
    roleTitle: "TableViewer",
    roleDescription: "Can view database tables and rows",
  },
  { roleTitle: "TriggerManager", roleDescription: "Manages database triggers" },
  { roleTitle: "TriggerViewer", roleDescription: "Can view database triggers" },
  // Add an explicit ADMIN role if needed
  { roleTitle: "ADMIN", roleDescription: "Full administrative access" },
];

// We'll map role titles to permissions later
const rolePermissionsMap = {
  TenantManager: ["tenant:read", "tenant:update", "tenant:create"],
  TenantViewer: ["tenant:read"],
  RoleManager: [
    "tenant:role:create",
    "tenant:role:list",
    "tenant:role:read",
    "tenant:role:update",
    "tenant:role:delete",
  ],
  RoleViewer: ["tenant:role:list", "tenant:role:read"],
  UserManager: [
    "tenant:user:list",
    "tenant:user:read",
    "tenant:user:update",
    "tenant:user:create",
    "tenant:user:delete",
  ],
  UserViewer: ["tenant:user:list", "tenant:user:read"],
  DatabaseManager: [
    "tenant:database:metadata",
    "tenant:database:schema:create",
    "tenant:database:query:list",
    "tenant:database:query:create",
    "tenant:database:query:test",
    "tenant:database:query:read",
    "tenant:database:query:update",
    "tenant:database:query:delete",
    "tenant:database:table:list",
    "tenant:database:table:create",
    "tenant:database:table:read",
    "tenant:database:table:update",
    "tenant:database:table:row:read",
    "tenant:database:table:row:create",
    "tenant:database:table:row:update",
    "tenant:database:table:stats",
    "tenant:database:trigger:list",
    "tenant:database:trigger:create",
    "tenant:database:trigger:read",
    "tenant:database:trigger:delete",
  ],
  DatabaseViewer: [
    "tenant:database:metadata",
    "tenant:database:query:list",
    "tenant:database:query:read",
    "tenant:database:table:list",
    "tenant:database:table:read",
    "tenant:database:table:row:read",
    "tenant:database:table:stats",
    "tenant:database:trigger:list",
    "tenant:database:trigger:read",
  ],
  QueryCreator: ["tenant:database:query:create", "tenant:database:query:test"],
  QueryEditor: ["tenant:database:query:update", "tenant:database:query:delete"],
  QueryRunner: ["tenant:database:query:test", "tenant:database:query:read"],
  TableManager: [
    "tenant:database:table:list",
    "tenant:database:table:create",
    "tenant:database:table:read",
    "tenant:database:table:update",
    "tenant:database:table:row:read",
    "tenant:database:table:row:create",
    "tenant:database:table:row:update",
    "tenant:database:table:stats",
  ],
  TableViewer: [
    "tenant:database:table:list",
    "tenant:database:table:read",
    "tenant:database:table:row:read",
    "tenant:database:table:stats",
  ],
  TriggerManager: [
    "tenant:database:trigger:list",
    "tenant:database:trigger:create",
    "tenant:database:trigger:read",
    "tenant:database:trigger:delete",
  ],
  TriggerViewer: [
    "tenant:database:trigger:list",
    "tenant:database:trigger:read",
  ],
  ADMIN: [
    "tenant:read",
    "tenant:update",
    "tenant:create",
    "tenant:role:create",
    "tenant:role:list",
    "tenant:role:read",
    "tenant:role:update",
    "tenant:role:delete",
    "tenant:user:list",
    "tenant:user:read",
    "tenant:user:update",
    "tenant:user:create",
    "tenant:user:delete",
    "tenant:database:metadata",
    "tenant:database:schema:create",
    "tenant:database:query:list",
    "tenant:database:query:create",
    "tenant:database:query:test",
    "tenant:database:query:read",
    "tenant:database:query:update",
    "tenant:database:query:delete",
    "tenant:database:table:list",
    "tenant:database:table:create",
    "tenant:database:table:read",
    "tenant:database:table:update",
    "tenant:database:table:row:read",
    "tenant:database:table:row:create",
    "tenant:database:table:row:update",
    "tenant:database:table:stats",
    "tenant:database:trigger:list",
    "tenant:database:trigger:create",
    "tenant:database:trigger:read",
    "tenant:database:trigger:delete",
    "tenant:permissions:list",
    "tenant:database:chart:list",
    "tenant:database:chart:create",
    "tenant:database:chart:delete",
    "tenant:database:chart:update",
    "tenant:database:chart:read",
  ],
};

const systemUser = {
  firebaseID: "WuX3ZrZ4sHSkDsBQgUHhnlkAc7R2",
  phoneNumber: "+919999999999",
  firstName: "System",
  lastName: "Admin",
  email: "admin@example.com",
  isDisabled: false,
};

async function main() {
  await prisma.$transaction(
    async (tx) => {
      // 1. Create permissions
      const createdPermissions = await tx.tblPermissions.createMany({
        data: permissions,
        skipDuplicates: true, // optional safety
      });
      console.log("Permissions created:", createdPermissions.count);

      // Fetch all permissions to map title -> ID
      const allPermissions = await tx.tblPermissions.findMany();
      const permissionTitleToId = {};
      allPermissions.forEach((p) => {
        permissionTitleToId[p.permissionTitle] = p.permissionID;
      });

      // 2. Create roles
      const createdRoles = await tx.tblRoles.createMany({
        data: roles,
        skipDuplicates: true,
      });
      console.log("Roles created:", createdRoles.count);

      const allRoles = await tx.tblRoles.findMany();
      const roleTitleToId = {};
      allRoles.forEach((r) => {
        roleTitleToId[r.roleTitle] = r.roleID;
      });

      // 3. Prepare role-permission mappings
      const rolePermissionData = [];
      for (const [roleTitle, permTitles] of Object.entries(
        rolePermissionsMap
      )) {
        const roleId = roleTitleToId[roleTitle];
        if (!roleId) {
          console.warn(`Role ${roleTitle} not found`);
          continue;
        }
        for (const permTitle of permTitles) {
          const permId = permissionTitleToId[permTitle];
          if (!permId) {
            console.warn(`Permission ${permTitle} not found`);
            continue;
          }
          rolePermissionData.push({ roleID: roleId, permissionID: permId });
        }
      }

      await tx.tblRolePermissionMappings.createMany({
        data: rolePermissionData,
        skipDuplicates: true,
      });
      console.log(
        "Role-permission mappings created:",
        rolePermissionData.length
      );

      // 4. Create default tenant with embedded user
      const defaultTenant = await tx.tblTenants.create({
        data: {
          tenantTitle: "Default Tenant",
          tenantLogoURL: "https://example.com/logo.png",
          tenantDBURL: "postgresql://localhost:5432/default_tenant",
          tenantDBType: "postgresql",
          tblUsers: {
            create: systemUser,
          },
        },
        include: { tblUsers: true },
      });

      const user = defaultTenant.tblUsers;

      // 5. Update creatorID
      await tx.tblTenants.update({
        where: { tenantID: defaultTenant.tenantID },
        data: { creatorID: user.userID },
      });

      // 6. Create user-tenant relationship
      await tx.tblUsersTenantsRelationship.create({
        data: {
          tenantID: defaultTenant.tenantID,
          userID: user.userID,
          role: "ADMIN",
        },
      });

      console.log("✅ Seed data successfully populated");
    },
    {
      timeout: 60000, // 60 seconds — safe for large seeds
    }
  );
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
