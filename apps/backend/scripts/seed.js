import { prisma } from "../config/prisma.config.js";

const permissions = [
  {
    permissionID: 34,
    permissionName: "tenant:read",
    permissionDescription: "Permission to read tenant details",
  },
  {
    permissionID: 35,
    permissionName: "tenant:update",
    permissionDescription: "Permission to update tenant details",
  },
  {
    permissionID: 36,
    permissionName: "tenant:create",
    permissionDescription: "Permission to create a new tenant",
  },
  {
    permissionID: 37,
    permissionName: "tenant:role:create",
    permissionDescription: "Permission to create a new role",
  },
  {
    permissionID: 38,
    permissionName: "tenant:role:list",
    permissionDescription: "Permission to list all roles",
  },
  {
    permissionID: 39,
    permissionName: "tenant:role:read",
    permissionDescription: "Permission to read a specific role",
  },
  {
    permissionID: 40,
    permissionName: "tenant:role:update",
    permissionDescription: "Permission to update a role",
  },
  {
    permissionID: 41,
    permissionName: "tenant:role:delete",
    permissionDescription: "Permission to delete a role",
  },
  {
    permissionID: 42,
    permissionName: "tenant:user:list",
    permissionDescription: "Permission to list all users in a tenant",
  },
  {
    permissionID: 43,
    permissionName: "tenant:user:read",
    permissionDescription: "Permission to read a specific user in a tenant",
  },
  {
    permissionID: 44,
    permissionName: "tenant:user:update",
    permissionDescription: "Permission to update a user's roles in a tenant",
  },
  {
    permissionID: 45,
    permissionName: "tenant:user:create",
    permissionDescription: "Permission to add a user to a tenant",
  },
  {
    permissionID: 46,
    permissionName: "tenant:user:delete",
    permissionDescription: "Permission to remove a user from a tenant",
  },
  {
    permissionID: 47,
    permissionName: "tenant:database:metadata",
    permissionDescription: "Permission to view database metadata",
  },
  {
    permissionID: 48,
    permissionName: "tenant:database:schema:create",
    permissionDescription: "Permission to create a new database schema",
  },
  {
    permissionID: 49,
    permissionName: "tenant:database:query:list",
    permissionDescription: "Permission to list all database queries",
  },
  {
    permissionID: 50,
    permissionName: "tenant:database:query:create",
    permissionDescription: "Permission to create a new database query",
  },
  {
    permissionID: 51,
    permissionName: "tenant:database:query:test",
    permissionDescription: "Permission to test a database query",
  },
  {
    permissionID: 52,
    permissionName: "tenant:database:query:read",
    permissionDescription: "Permission to read a specific database query",
  },
  {
    permissionID: 53,
    permissionName: "tenant:database:query:update",
    permissionDescription: "Permission to update a database query",
  },
  {
    permissionID: 54,
    permissionName: "tenant:database:query:delete",
    permissionDescription: "Permission to delete a database query",
  },
  {
    permissionID: 55,
    permissionName: "tenant:database:table:list",
    permissionDescription: "Permission to list all database tables",
  },
  {
    permissionID: 56,
    permissionName: "tenant:database:table:create",
    permissionDescription: "Permission to create a new database table",
  },
  {
    permissionID: 57,
    permissionName: "tenant:database:table:read",
    permissionDescription: "Permission to read a specific database table",
  },
  {
    permissionID: 58,
    permissionName: "tenant:database:table:update",
    permissionDescription: "Permission to update a database table",
  },
  {
    permissionID: 59,
    permissionName: "tenant:database:table:row:read",
    permissionDescription: "Permission to read rows from a database table",
  },
  {
    permissionID: 60,
    permissionName: "tenant:database:table:row:create",
    permissionDescription: "Permission to create rows in a database table",
  },
  {
    permissionID: 61,
    permissionName: "tenant:database:table:row:update",
    permissionDescription: "Permission to update rows in a database table",
  },
  {
    permissionID: 62,
    permissionName: "tenant:database:table:stats",
    permissionDescription: "Permission to view statistics of a database table",
  },
  {
    permissionID: 63,
    permissionName: "tenant:database:trigger:list",
    permissionDescription: "Permission to list all database triggers",
  },
  {
    permissionID: 64,
    permissionName: "tenant:database:trigger:create",
    permissionDescription: "Permission to create a new database trigger",
  },
  {
    permissionID: 65,
    permissionName: "tenant:database:trigger:read",
    permissionDescription: "Permission to read a specific database trigger",
  },
  {
    permissionID: 66,
    permissionName: "tenant:database:trigger:delete",
    permissionDescription: "Permission to delete a database trigger",
  },
  {
    permissionID: 67,
    permissionName: "tenant:permissions:list",
    permissionDescription: "Permission to read permissions",
  },
  {
    permissionID: 68,
    permissionName: "tenant:database:chart:list",
    permissionDescription: "Permission to list all tenant charts",
  },
  {
    permissionID: 70,
    permissionName: "tenant:database:chart:delete",
    permissionDescription: "Permission to delete tenant chart",
  },
  {
    permissionID: 69,
    permissionName: "tenant:database:chart:create",
    permissionDescription: "Permission to create tenant chart",
  },
  {
    permissionID: 71,
    permissionName: "tenant:database:chart:update",
    permissionDescription: "Permission to update tenant chart",
  },
  {
    permissionID: 72,
    permissionName: "tenant:database:chart:read",
    permissionDescription: "Permission to read tenant chart",
  },
];

const roles = [
  {
    roleID: 12,
    roleName: "TenantViewer",
    roleDescription: "Can view tenant details but cannot modify them",
    tenantID: null,
  },
  {
    roleID: 13,
    roleName: "RoleManager",
    roleDescription: "Manages role creation, updates, and deletion",
    tenantID: null,
  },
  {
    roleID: 14,
    roleName: "RoleViewer",
    roleDescription: "Can view roles but cannot modify them",
    tenantID: null,
  },
  {
    roleID: 15,
    roleName: "UserManager",
    roleDescription: "Manages tenant users and their roles",
    tenantID: null,
  },
  {
    roleID: 16,
    roleName: "UserViewer",
    roleDescription: "Can view tenant users but cannot modify them",
    tenantID: null,
  },
  {
    roleID: 17,
    roleName: "DatabaseManager",
    roleDescription: "Manages database schemas, queries, and tables",
    tenantID: null,
  },
  {
    roleID: 18,
    roleName: "DatabaseViewer",
    roleDescription: "Can view database metadata, schemas, and queries",
    tenantID: null,
  },
  {
    roleID: 19,
    roleName: "QueryCreator",
    roleDescription: "Can create and test database queries",
    tenantID: null,
  },
  {
    roleID: 20,
    roleName: "QueryEditor",
    roleDescription: "Can edit and delete database queries",
    tenantID: null,
  },
  {
    roleID: 21,
    roleName: "QueryRunner",
    roleDescription: "Can run and test database queries",
    tenantID: null,
  },
  {
    roleID: 22,
    roleName: "TableManager",
    roleDescription: "Manages database tables and rows",
    tenantID: null,
  },
  {
    roleID: 23,
    roleName: "TableViewer",
    roleDescription: "Can view database tables and rows",
    tenantID: null,
  },
  {
    roleID: 24,
    roleName: "TriggerManager",
    roleDescription: "Manages database triggers",
    tenantID: null,
  },
  {
    roleID: 25,
    roleName: "TriggerViewer",
    roleDescription: "Can view database triggers",
    tenantID: null,
  },
  {
    roleID: 11,
    roleName: "TenantManager",
    roleDescription: "Manages tenant creation, updates, and deletion",
    tenantID: 2,
  },
];
const rolePermissions  = [
  { roleID: 11, permissionID: 34 },
  { roleID: 11, permissionID: 35 },
  { roleID: 11, permissionID: 36 },
  { roleID: 12, permissionID: 34 },
  { roleID: 13, permissionID: 37 },
  { roleID: 13, permissionID: 38 },
  { roleID: 13, permissionID: 39 },
  { roleID: 13, permissionID: 40 },
  { roleID: 13, permissionID: 41 },
  { roleID: 14, permissionID: 38 },
  { roleID: 14, permissionID: 39 },
  { roleID: 15, permissionID: 42 },
  { roleID: 15, permissionID: 43 },
  { roleID: 15, permissionID: 44 },
  { roleID: 15, permissionID: 45 },
  { roleID: 15, permissionID: 46 },
  { roleID: 16, permissionID: 42 },
  { roleID: 16, permissionID: 43 },
  { roleID: 17, permissionID: 47 },
  { roleID: 17, permissionID: 48 },
  { roleID: 17, permissionID: 49 },
  { roleID: 17, permissionID: 50 },
  { roleID: 17, permissionID: 51 },
  { roleID: 17, permissionID: 52 },
  { roleID: 17, permissionID: 53 },
  { roleID: 17, permissionID: 54 },
  { roleID: 17, permissionID: 55 },
  { roleID: 17, permissionID: 56 },
  { roleID: 17, permissionID: 57 },
  { roleID: 17, permissionID: 58 },
  { roleID: 17, permissionID: 59 },
  { roleID: 17, permissionID: 60 },
  { roleID: 17, permissionID: 61 },
  { roleID: 17, permissionID: 62 },
  { roleID: 17, permissionID: 63 },
  { roleID: 17, permissionID: 64 },
  { roleID: 17, permissionID: 65 },
  { roleID: 17, permissionID: 66 },
  { roleID: 18, permissionID: 47 },
  { roleID: 18, permissionID: 49 },
  { roleID: 18, permissionID: 52 },
  { roleID: 18, permissionID: 55 },
  { roleID: 18, permissionID: 57 },
  { roleID: 18, permissionID: 59 },
  { roleID: 18, permissionID: 62 },
  { roleID: 18, permissionID: 63 },
  { roleID: 18, permissionID: 65 },
  { roleID: 19, permissionID: 50 },
  { roleID: 19, permissionID: 51 },
  { roleID: 20, permissionID: 53 },
  { roleID: 20, permissionID: 54 },
  { roleID: 21, permissionID: 51 },
  { roleID: 21, permissionID: 52 },
  { roleID: 22, permissionID: 55 },
  { roleID: 22, permissionID: 56 },
  { roleID: 22, permissionID: 57 },
  { roleID: 22, permissionID: 58 },
  { roleID: 22, permissionID: 59 },
  { roleID: 22, permissionID: 60 },
  { roleID: 22, permissionID: 61 },
  { roleID: 22, permissionID: 62 },
  { roleID: 23, permissionID: 55 },
  { roleID: 23, permissionID: 57 },
  { roleID: 23, permissionID: 59 },
  { roleID: 23, permissionID: 62 },
  { roleID: 24, permissionID: 63 },
  { roleID: 24, permissionID: 64 },
  { roleID: 24, permissionID: 65 },
  { roleID: 24, permissionID: 66 },
  { roleID: 25, permissionID: 63 },
  { roleID: 25, permissionID: 65 }
]

const user = {
    userID: 1,
    firebaseID: 'WuX3ZrZ4sHSkDsBQgUHhnlkAc7R2',
    phoneNumber: '+919999999999',
    firstName: 'test',
    lastName: null,
    address1: null,
    address2: null,
    email: 'test@test.com',
    isDisabled: false,
    disabledAt: null,
    disableReason: null,
    lastSeen: null
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

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

const _user = await prisma.tblUsers.findFirst();
console.log(_user)