const { prisma } = require("../config/prisma.config");

// Optional: Predefined UUIDs for deterministic seeding (or let DB generate)
// For simplicity, we'll let PostgreSQL generate UUIDs via `default(dbgenerated(...))`
// So we OMIT the ID fields and let the DB handle it.

const { P, PERMISSIONS_LIST } = require("../config/permissions");

const roles = [
  { roleTitle: "TenantManager", roleDescription: "Manages tenant creation, updates, and deletion" },
  { roleTitle: "TenantViewer", roleDescription: "Can view tenant details but cannot modify them" },
  { roleTitle: "RoleManager", roleDescription: "Manages role creation, updates, and deletion" },
  { roleTitle: "RoleViewer", roleDescription: "Can view roles but cannot modify them" },
  { roleTitle: "UserManager", roleDescription: "Manages tenant users and their roles" },
  { roleTitle: "UserViewer", roleDescription: "Can view tenant users but cannot modify them" },
  { roleTitle: "QueryCreator", roleDescription: "Can create and test database queries" },
  { roleTitle: "QueryEditor", roleDescription: "Can edit and delete database queries" },
  { roleTitle: "QueryRunner", roleDescription: "Can run and test database queries" },
  { roleTitle: "WorkflowManager", roleDescription: "Manages workflows" },
  { roleTitle: "WidgetManager", roleDescription: "Manages widgets" },
  { roleTitle: "DatasourceManager", roleDescription: "Manages datasources" },
  { roleTitle: "AppPageManager", roleDescription: "Manages app pages" },
  { roleTitle: "ListenerManager", roleDescription: "Manages listeners" },
  { roleTitle: "CronJobManager", roleDescription: "Manages cron jobs" },
  { roleTitle: "ApiKeyManager", roleDescription: "Manages API keys" },
  { roleTitle: "AuditViewer", roleDescription: "Can view audit logs" },
  { roleTitle: "AIManager", roleDescription: "Manages AI interactions" },
  { roleTitle: "ADMIN", roleDescription: "Full administrative access" },
];

const rolePermissionsMap = {
  TenantManager: [P.tenant.read.title, P.tenant.update.title, P.tenant.delete.title],
  TenantViewer: [P.tenant.read.title],
  RoleManager: [P.role.create.title, P.role.list.title, P.role.read.title, P.role.update.title, P.role.delete.title],
  RoleViewer: [P.role.list.title, P.role.read.title, P.permission.list.title],
  UserManager: [P.user.list.title, P.user.read.title, P.user.update.title, P.user.create.title, P.user.delete.title],
  UserViewer: [P.user.list.title, P.user.read.title],
  QueryCreator: [P.dataquery.create.title, P.dataquery.test.title, P.dataquery.list.title, P.dataquery.read.title],
  QueryEditor: [P.dataquery.update.title, P.dataquery.delete.title, P.dataquery.list.title, P.dataquery.read.title],
  QueryRunner: [P.dataquery.execute.title, P.dataquery.list.title, P.dataquery.read.title],
  WorkflowManager: [P.workflow.list.title, P.workflow.create.title, P.workflow.read.title, P.workflow.update.title, P.workflow.delete.title, P.workflow.execute.title, P.workflow.test.title],
  WidgetManager: [P.widget.list.title, P.widget.create.title, P.widget.read.title, P.widget.update.title, P.widget.delete.title, P.widget.execute.title],
  DatasourceManager: [P.datasource.list.title, P.datasource.create.title, P.datasource.read.title, P.datasource.update.title, P.datasource.delete.title, P.datasource.test.title, P.datasource.export.title],
  AppPageManager: [P.appPage.list.title, P.appPage.create.title, P.appPage.read.title, P.appPage.update.title, P.appPage.delete.title],
  ListenerManager: [P.listener.list.title, P.listener.create.title, P.listener.read.title, P.listener.update.title, P.listener.delete.title, P.listener.execute.title],
  CronJobManager: [P.cronjob.list.title, P.cronjob.create.title, P.cronjob.read.title, P.cronjob.update.title, P.cronjob.delete.title],
  ApiKeyManager: [P.apikey.list.title, P.apikey.create.title, P.apikey.read.title, P.apikey.update.title, P.apikey.delete.title],
  AuditViewer: [P.audit.list.title],
  AIManager: [P.ai.chat.title, P.ai.read.title, P.ai.delete.title],
  ADMIN: PERMISSIONS_LIST.map(p => p.permissionTitle),
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
      // 1. Fetch existing permissions
      const existingPermissions = await tx.tblPermissions.findMany();
      const existingPermissionTitles = new Set(
        existingPermissions.map((p) => p.permissionTitle.toLowerCase())
      );

      // Filter to only new permissions
      const newPermissions = PERMISSIONS_LIST.filter(
        (p) => !existingPermissionTitles.has(p.permissionTitle.toLowerCase())
      );

      if (newPermissions.length > 0) {
        const createdPermissions = await tx.tblPermissions.createMany({
          data: newPermissions,
        });
        console.log("New permissions created:", createdPermissions.count);
      } else {
        console.log("No new permissions to create.");
      }

      // Fetch all permissions again to map title -> ID
      const allPermissions = await tx.tblPermissions.findMany();
      const permissionTitleToId = {};
      allPermissions.forEach((p) => {
        permissionTitleToId[p.permissionTitle.toLowerCase()] = p.permissionID;
      });

      // 2. Fetch existing roles
      const existingRoles = await tx.tblRoles.findMany();
      const existingRoleTitles = new Set(
        existingRoles.map((r) => r.roleTitle.toLowerCase())
      );

      // Filter to only new roles
      const newRoles = roles.filter(
        (r) => !existingRoleTitles.has(r.roleTitle.toLowerCase())
      );

      if (newRoles.length > 0) {
        const createdRoles = await tx.tblRoles.createMany({
          data: newRoles,
        });
        console.log("New roles created:", createdRoles.count);
      } else {
        console.log("No new roles to create.");
      }

      const allRoles = await tx.tblRoles.findMany();
      const roleTitleToId = {};
      allRoles.forEach((r) => {
        roleTitleToId[r.roleTitle.toLowerCase()] = r.roleID;
      });

      // 3. Fetch existing mappings to avoid duplicates
      const existingMappings = await tx.tblRolePermissionMappings.findMany();
      const existingMappingKeys = new Set(
        existingMappings.map((m) => `${m.roleID}:${m.permissionID}`)
      );

      // Prepare role-permission mappings
      const rolePermissionData = [];
      for (const [roleTitle, permTitles] of Object.entries(
        rolePermissionsMap
      )) {
        const roleId = roleTitleToId[roleTitle.toLowerCase()];
        if (!roleId) {
          console.warn(`Role ${roleTitle} not found`);
          continue;
        }
        for (const permTitle of permTitles) {
          const permId = permissionTitleToId[permTitle.toLowerCase()];
          if (!permId) {
            console.warn(`Permission ${permTitle} not found`);
            continue;
          }
          const key = `${roleId}:${permId}`;
          if (!existingMappingKeys.has(key)) {
            rolePermissionData.push({ roleID: roleId, permissionID: permId });
          }
        }
      }

      if (rolePermissionData.length > 0) {
        const createdMappings = await tx.tblRolePermissionMappings.createMany({
          data: rolePermissionData,
        });
        console.log("Role-permission mappings created:", createdMappings.count);
      } else {
        console.log("No new role-permission mappings to create.");
      }

      // 4. Create System User
      const existingUser = await tx.tblUsers.findFirst({
        where: { firebaseID: systemUser.firebaseID },
      });

      if (!existingUser) {
        await tx.tblUsers.create({
          data: systemUser,
        });
        console.log("✅ System user created");
      } else {
        console.log("ℹ️ System user already exists");
      }

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
