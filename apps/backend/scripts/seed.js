const { prisma } = require("../config/prisma.config");

const permissions = [
  {
    permissionID: 1,
    permissionName: "tenant:read",
    permissionDescription: "Permission to read tenant details",
  },
  {
    permissionID: 2,
    permissionName: "tenant:update",
    permissionDescription: "Permission to update tenant details",
  },
  {
    permissionID: 3,
    permissionName: "tenant:create",
    permissionDescription: "Permission to create a new tenant",
  },
  {
    permissionID: 4,
    permissionName: "tenant:role:create",
    permissionDescription: "Permission to create a new role",
  },
  {
    permissionID: 5,
    permissionName: "tenant:role:list",
    permissionDescription: "Permission to list all roles",
  },
  {
    permissionID: 6,
    permissionName: "tenant:role:read",
    permissionDescription: "Permission to read a specific role",
  },
  {
    permissionID: 7,
    permissionName: "tenant:role:update",
    permissionDescription: "Permission to update a role",
  },
  {
    permissionID: 8,
    permissionName: "tenant:role:delete",
    permissionDescription: "Permission to delete a role",
  },
  {
    permissionID: 9,
    permissionName: "tenant:user:list",
    permissionDescription: "Permission to list all users in a tenant",
  },
  {
    permissionID: 10,
    permissionName: "tenant:user:read",
    permissionDescription: "Permission to read a specific user in a tenant",
  },
  {
    permissionID: 11,
    permissionName: "tenant:user:update",
    permissionDescription: "Permission to update a user's roles in a tenant",
  },
  {
    permissionID: 12,
    permissionName: "tenant:user:create",
    permissionDescription: "Permission to add a user to a tenant",
  },
  {
    permissionID: 13,
    permissionName: "tenant:user:delete",
    permissionDescription: "Permission to remove a user from a tenant",
  },
  {
    permissionID: 14,
    permissionName: "tenant:database:metadata",
    permissionDescription: "Permission to view database metadata",
  },
  {
    permissionID: 15,
    permissionName: "tenant:database:schema:create",
    permissionDescription: "Permission to create a new database schema",
  },
  {
    permissionID: 16,
    permissionName: "tenant:database:query:list",
    permissionDescription: "Permission to list all database queries",
  },
  {
    permissionID: 17,
    permissionName: "tenant:database:query:create",
    permissionDescription: "Permission to create a new database query",
  },
  {
    permissionID: 18,
    permissionName: "tenant:database:query:test",
    permissionDescription: "Permission to test a database query",
  },
  {
    permissionID: 19,
    permissionName: "tenant:database:query:read",
    permissionDescription: "Permission to read a specific database query",
  },
  {
    permissionID: 20,
    permissionName: "tenant:database:query:update",
    permissionDescription: "Permission to update a database query",
  },
  {
    permissionID: 21,
    permissionName: "tenant:database:query:delete",
    permissionDescription: "Permission to delete a database query",
  },
  {
    permissionID: 22,
    permissionName: "tenant:database:table:list",
    permissionDescription: "Permission to list all database tables",
  },
  {
    permissionID: 23,
    permissionName: "tenant:database:table:create",
    permissionDescription: "Permission to create a new database table",
  },
  {
    permissionID: 24,
    permissionName: "tenant:database:table:read",
    permissionDescription: "Permission to read a specific database table",
  },
  {
    permissionID: 25,
    permissionName: "tenant:database:table:update",
    permissionDescription: "Permission to update a database table",
  },
  {
    permissionID: 26,
    permissionName: "tenant:database:table:row:read",
    permissionDescription: "Permission to read rows from a database table",
  },
  {
    permissionID: 27,
    permissionName: "tenant:database:table:row:create",
    permissionDescription: "Permission to create rows in a database table",
  },
  {
    permissionID: 28,
    permissionName: "tenant:database:table:row:update",
    permissionDescription: "Permission to update rows in a database table",
  },
  {
    permissionID: 29,
    permissionName: "tenant:database:table:stats",
    permissionDescription: "Permission to view statistics of a database table",
  },
  {
    permissionID: 30,
    permissionName: "tenant:database:trigger:list",
    permissionDescription: "Permission to list all database triggers",
  },
  {
    permissionID: 31,
    permissionName: "tenant:database:trigger:create",
    permissionDescription: "Permission to create a new database trigger",
  },
  {
    permissionID: 32,
    permissionName: "tenant:database:trigger:read",
    permissionDescription: "Permission to read a specific database trigger",
  },
  {
    permissionID: 33,
    permissionName: "tenant:database:trigger:delete",
    permissionDescription: "Permission to delete a database trigger",
  },
  {
    permissionID: 34,
    permissionName: "tenant:permissions:list",
    permissionDescription: "Permission to read permissions",
  },
  {
    permissionID: 35,
    permissionName: "tenant:database:chart:list",
    permissionDescription: "Permission to list all tenant charts",
  },
  {
    permissionID: 36,
    permissionName: "tenant:database:chart:create",
    permissionDescription: "Permission to create tenant chart",
  },
  {
    permissionID: 37,
    permissionName: "tenant:database:chart:delete",
    permissionDescription: "Permission to delete tenant chart",
  },
  {
    permissionID: 38,
    permissionName: "tenant:database:chart:update",
    permissionDescription: "Permission to update tenant chart",
  },
  {
    permissionID: 39,
    permissionName: "tenant:database:chart:read",
    permissionDescription: "Permission to read tenant chart",
  },
];

const roles = [
  {
    roleID: 1,
    roleName: "TenantManager",
    roleDescription: "Manages tenant creation, updates, and deletion",
    tenantID: null,
  },
  {
    roleID: 2,
    roleName: "TenantViewer",
    roleDescription: "Can view tenant details but cannot modify them",
    tenantID: null,
  },
  {
    roleID: 3,
    roleName: "RoleManager",
    roleDescription: "Manages role creation, updates, and deletion",
    tenantID: null,
  },
  {
    roleID: 4,
    roleName: "RoleViewer",
    roleDescription: "Can view roles but cannot modify them",
    tenantID: null,
  },
  {
    roleID: 5,
    roleName: "UserManager",
    roleDescription: "Manages tenant users and their roles",
    tenantID: null,
  },
  {
    roleID: 6,
    roleName: "UserViewer",
    roleDescription: "Can view tenant users but cannot modify them",
    tenantID: null,
  },
  {
    roleID: 7,
    roleName: "DatabaseManager",
    roleDescription: "Manages database schemas, queries, and tables",
    tenantID: null,
  },
  {
    roleID: 8,
    roleName: "DatabaseViewer",
    roleDescription: "Can view database metadata, schemas, and queries",
    tenantID: null,
  },
  {
    roleID: 9,
    roleName: "QueryCreator",
    roleDescription: "Can create and test database queries",
    tenantID: null,
  },
  {
    roleID: 10,
    roleName: "QueryEditor",
    roleDescription: "Can edit and delete database queries",
    tenantID: null,
  },
  {
    roleID: 11,
    roleName: "QueryRunner",
    roleDescription: "Can run and test database queries",
    tenantID: null,
  },
  {
    roleID: 12,
    roleName: "TableManager",
    roleDescription: "Manages database tables and rows",
    tenantID: null,
  },
  {
    roleID: 13,
    roleName: "TableViewer",
    roleDescription: "Can view database tables and rows",
    tenantID: null,
  },
  {
    roleID: 14,
    roleName: "TriggerManager",
    roleDescription: "Manages database triggers",
    tenantID: null,
  },
  {
    roleID: 15,
    roleName: "TriggerViewer",
    roleDescription: "Can view database triggers",
    tenantID: null,
  },
];

const rolePermissions = [
  { roleID: 1, permissionID: 1 },
  { roleID: 1, permissionID: 2 },
  { roleID: 1, permissionID: 3 },
  { roleID: 2, permissionID: 1 },
  { roleID: 3, permissionID: 4 },
  { roleID: 3, permissionID: 5 },
  { roleID: 3, permissionID: 6 },
  { roleID: 3, permissionID: 7 },
  { roleID: 3, permissionID: 8 },
  { roleID: 4, permissionID: 5 },
  { roleID: 4, permissionID: 6 },
  { roleID: 5, permissionID: 9 },
  { roleID: 5, permissionID: 10 },
  { roleID: 5, permissionID: 11 },
  { roleID: 5, permissionID: 12 },
  { roleID: 5, permissionID: 13 },
  { roleID: 6, permissionID: 9 },
  { roleID: 6, permissionID: 10 },
  { roleID: 7, permissionID: 14 },
  { roleID: 7, permissionID: 15 },
  { roleID: 7, permissionID: 16 },
  { roleID: 7, permissionID: 17 },
  { roleID: 7, permissionID: 18 },
  { roleID: 7, permissionID: 19 },
  { roleID: 7, permissionID: 20 },
  { roleID: 7, permissionID: 21 },
  { roleID: 7, permissionID: 22 },
  { roleID: 7, permissionID: 23 },
  { roleID: 7, permissionID: 24 },
  { roleID: 7, permissionID: 25 },
  { roleID: 7, permissionID: 26 },
  { roleID: 7, permissionID: 27 },
  { roleID: 7, permissionID: 28 },
  { roleID: 7, permissionID: 29 },
  { roleID: 7, permissionID: 30 },
  { roleID: 7, permissionID: 31 },
  { roleID: 7, permissionID: 32 },
  { roleID: 7, permissionID: 33 },
  { roleID: 8, permissionID: 14 },
  { roleID: 8, permissionID: 16 },
  { roleID: 8, permissionID: 19 },
  { roleID: 8, permissionID: 22 },
  { roleID: 8, permissionID: 24 },
  { roleID: 8, permissionID: 26 },
  { roleID: 8, permissionID: 29 },
  { roleID: 8, permissionID: 30 },
  { roleID: 8, permissionID: 32 },
  { roleID: 9, permissionID: 17 },
  { roleID: 9, permissionID: 18 },
  { roleID: 10, permissionID: 20 },
  { roleID: 10, permissionID: 21 },
  { roleID: 11, permissionID: 18 },
  { roleID: 11, permissionID: 19 },
  { roleID: 12, permissionID: 22 },
  { roleID: 12, permissionID: 23 },
  { roleID: 12, permissionID: 24 },
  { roleID: 12, permissionID: 25 },
  { roleID: 12, permissionID: 26 },
  { roleID: 12, permissionID: 27 },
  { roleID: 12, permissionID: 28 },
  { roleID: 12, permissionID: 29 },
  { roleID: 13, permissionID: 22 },
  { roleID: 13, permissionID: 24 },
  { roleID: 13, permissionID: 26 },
  { roleID: 13, permissionID: 29 },
  { roleID: 14, permissionID: 30 },
  { roleID: 14, permissionID: 31 },
  { roleID: 14, permissionID: 32 },
  { roleID: 14, permissionID: 33 },
  { roleID: 15, permissionID: 30 },
  { roleID: 15, permissionID: 32 },
];

const user = {
  userID: 1,
  firebaseID: "WuX3ZrZ4sHSkDsBQgUHhnlkAc7R2",
  phoneNumber: "+919999999999",
  firstName: "test",
  lastName: null,
  address1: null,
  address2: null,
  email: "test@test.com",
  isDisabled: false,
  disabledAt: null,
  disableReason: null,
  lastSeen: null,
};

async function main() {
  // Create permissions
  for (const permission of permissions) {
    await prisma.tblPermissions.upsert({
      where: { permissionID: permission.permissionID },
      update: {},
      create: permission,
    });
  }

  // Create roles
  for (const role of roles) {
    await prisma.tblRoles.upsert({
      where: { roleID: role.roleID },
      update: {},
      create: {
        ...role,
        tenantID: role.tenantID ? role.tenantID : undefined,
      },
    });
  }

  // Create role-permission mappings
  for (const mapping of rolePermissions) {
    await prisma.tblRolePermissionMappings.upsert({
      where: {
        roleID_permissionID: {
          roleID: mapping.roleID,
          permissionID: mapping.permissionID,
        },
      },
      update: {},
      create: mapping,
    });
  }

  // Create system user
  const systemUser = await prisma.tblUsers.upsert({
    where: { userID: user.userID },
    update: {},
    create: {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("Seed data successfully populated");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
