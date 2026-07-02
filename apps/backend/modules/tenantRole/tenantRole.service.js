const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const { addPolicy, removePoliciesForRole, reloadPolicies } = require("../../config/casbin.config");

const tenantRoleService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.tenantID
 * @param {string} param0.roleTitle
 * @param {string} param0.roleDescription
 * @param {Array<number>} param0.permissionIDs
 * @returns {Promise<boolean>}
 */
tenantRoleService.createRole = async ({
  tenantID,
  roleTitle,
  roleDescription,
  permissionIDs = [],
  assetPermissions = [],
}) => {
  Logger.log("info", {
    message: "tenantRoleService:createRole:params",
    params: { tenantID, roleTitle, roleDescription, permissionIDs, assetPermissions },
  });

  // Input validation for permissionIDs
  if (!Array.isArray(permissionIDs)) {
    throw new Error("permissionIDs must be an array");
  }
  if (!Array.isArray(assetPermissions)) {
    throw new Error("assetPermissions must be an array");
  }

  try {
    // Use a transaction for atomicity
    const createdRole = await prisma.$transaction(async (tx) => {
      // Create the role
      const role = await tx.tblRoles.create({
        data: {
          tenantID,
          roleTitle,
          roleDescription,
        },
      });

      // Create asset permissions and map them
      const allPermissionIDs = [...permissionIDs];
      for (const assetPerm of assetPermissions) {
        const { resourceType, resourceID, action } = assetPerm;
        if (!resourceType || !resourceID || !action) continue;

        const permissionTitle = `tenant:asset:${resourceType}:${resourceID}:${action}`;
        const permissionDescription = `Asset permission for ${resourceType} (${resourceID}) to ${action}`;

        let perm = await tx.tblPermissions.findFirst({
          where: { permissionTitle },
        });

        if (!perm) {
          perm = await tx.tblPermissions.create({
            data: {
              permissionTitle,
              permissionDescription,
            },
          });
        }

        if (!allPermissionIDs.includes(perm.permissionID)) {
          allPermissionIDs.push(perm.permissionID);
        }
      }

      // Create permission mappings
      const rolePermissionMappings = allPermissionIDs.map((permissionID) => ({
        roleID: role.roleID,
        permissionID,
      }));

      await tx.tblRolePermissionMappings.createMany({
        data: rolePermissionMappings,
      });

      return role;
    });

    // Sync policies to Casbin
    await tenantRoleService.syncRolePolicies(createdRole.roleID, tenantID);

    Logger.log("success", {
      message: "tenantRoleService:createRole:success",
      params: { roleID: createdRole.roleID },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleService:createRole:failure",
      params: {
        error,
        details: error?.meta?.cause || "Unknown database error", // Enhanced error logging
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.tenantID
 * @param {number} param0.roleID
 * @param {string} param0.roleTitle
 * @param {string} param0.roleDescription
 * @param {Array<number>} param0.permissionIDs
 * @returns {Promise<boolean>}
 */
tenantRoleService.updateTenantRoleByID = async ({
  tenantID,
  roleID,
  roleTitle,
  roleDescription,
  permissionIDs,
  assetPermissions,
}) => {
  Logger.log("info", {
    message: "tenantRoleService:updateTenantRoleByID:params",
    params: { tenantID, roleID, roleTitle, roleDescription, permissionIDs, assetPermissions },
  });

  // Input validations
  if (!roleID) throw new Error("roleID is required");
  if (permissionIDs !== undefined && !Array.isArray(permissionIDs)) {
    throw new Error("permissionIDs must be an array");
  }
  if (assetPermissions !== undefined && !Array.isArray(assetPermissions)) {
    throw new Error("assetPermissions must be an array");
  }

  try {
    const updatedRole = await prisma.$transaction(async (tx) => {
      // Check if role exists
      const existingRole = await tx.tblRoles.findFirst({
        where: { roleID },
      });
      if (!existingRole) {
        throw new Error(`Role with ID ${roleID} not found`);
      }
      if (!existingRole.tenantID) {
        throw new Error(
          `Role with ID ${roleID} is a global role and cannot be updated`
        );
      }
      if (existingRole.tenantID !== tenantID) {
        throw new Error(
          `Role with ID ${roleID} does not belong to tenant with ID ${tenantID}`
        );
      }

      // Update role details
      const roleUpdateData = {
        ...(roleTitle && { roleTitle }),
        ...(roleDescription && { roleDescription }),
      };

      const updated = await tx.tblRoles.update({
        where: { roleID },
        data: roleUpdateData,
      });

      // Update permissions if provided
      if (permissionIDs !== undefined || assetPermissions !== undefined) {
        // Delete existing mappings
        await tx.tblRolePermissionMappings.deleteMany({
          where: { roleID },
        });

        const allPermissionIDs = [...(permissionIDs || [])];

        if (assetPermissions && assetPermissions.length > 0) {
          for (const assetPerm of assetPermissions) {
            const { resourceType, resourceID, action } = assetPerm;
            if (!resourceType || !resourceID || !action) continue;

            const permissionTitle = `tenant:asset:${resourceType}:${resourceID}:${action}`;
            const permissionDescription = `Asset permission for ${resourceType} (${resourceID}) to ${action}`;

            let perm = await tx.tblPermissions.findFirst({
              where: { permissionTitle },
            });

            if (!perm) {
              perm = await tx.tblPermissions.create({
                data: {
                  permissionTitle,
                  permissionDescription,
                },
              });
            }

            if (!allPermissionIDs.includes(perm.permissionID)) {
              allPermissionIDs.push(perm.permissionID);
            }
          }
        }

        // Create new mappings
        if (allPermissionIDs.length > 0) {
          const newMappings = allPermissionIDs.map((permissionID) => ({
            roleID,
            permissionID,
          }));

          await tx.tblRolePermissionMappings.createMany({
            data: newMappings,
          });
        }
      }

      return updated;
    });

    // Sync policies to Casbin
    await tenantRoleService.syncRolePolicies(roleID, tenantID);

    Logger.log("success", {
      message: "tenantRoleService:updateTenantRoleByID:success",
      params: { roleID },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleService:updateTenantRoleByID:failure",
      params: {
        error,
        details: error?.meta?.cause || "Update failed",
      },
    });
    throw error;
  }
};

/**
 * Get all roles.
 *
 * @param {object} param0
 * @param {number} param0.tenantID
 * @returns {Promise<Array<import("@prisma/client").tblRoles>>}
 */
tenantRoleService.getAllTenantRoles = async ({ userID, tenantID }) => {
  try {
    Logger.log("info", {
      message: "tenantRoleService:getAllTenantRoles:params",
      params: { userID, tenantID },
    });
    const roles = await prisma.tblRoles.findMany({
      where: {
        OR: [
          { tenantID: tenantID },
          { tenantID: null },
          { tenantID: undefined },
        ],
      },
      include: {
        tblRolePermissionMappings: {
          include: {
            tblPermissions: true,
          },
        },
      },
    });
    Logger.log("success", {
      message: "tenantRoleService:getAllTenantRoles:success",
      params: { rolesLength: roles?.length },
    });
    return roles;
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleService:getAllTenantRoles:failure",
      params: { error },
    });
    throw error;
  }
};

/**
 * Get all roles.
 *
 * @param {object} param0
 * @param {number} param0.tenantID
 * @returns {Promise<Array<import("@prisma/client").tblRoles>>}
 */
tenantRoleService.getAllTenantPermissions = async ({ userID, tenantID }) => {
  try {
    Logger.log("info", {
      message: "tenantRoleService:getAllTenantPermissions:params",
      params: { userID, tenantID },
    });
    const permissions = await prisma.tblPermissions.findMany();
    Logger.log("success", {
      message: "tenantRoleService:getAllTenantPermissions:success",
      params: { permissionsLength: permissions?.length },
    });
    return permissions;
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleService:getAllTenantPermissions:failure",
      params: { error },
    });
    throw error;
  }
};

/**
 * Get a role by ID.
 *
 * @param {number} roleID
 * @returns {Promise<import("@prisma/client").tblRoles | null>}
 */
tenantRoleService.getTenantRoleByID = async (roleID) => {
  Logger.log("info", {
    message: "tenantRoleService:getTenantRoleByID:params",
    params: { roleID },
  });

  try {
    const role = await prisma.tblRoles.findUnique({
      where: { roleID },
      include: {
        tblRolePermissionMappings: {
          include: {
            tblPermissions: true,
          },
        },
      },
    });

    Logger.log("success", {
      message: "tenantRoleService:getTenantRoleByID:success",
      params: { roleID },
    });

    return role;
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleService:getTenantRoleByID:failure",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.tenantID
 * @param {number} param0.roleID
 */
tenantRoleService.deleteTenantRoleByID = async ({ tenantID, roleID }) => {
  Logger.log("info", {
    message: "tenantRoleService:deleteTenantRoleByID:params",
    params: { tenantID, roleID },
  });

  try {
    await prisma.$transaction(async (tx) => {
      // Check if role exists
      const existingRole = await tx.tblRoles.findFirst({
        where: { roleID },
      });
      if (!existingRole) {
        throw new Error(`Role with ID ${roleID} not found`);
      }
      if (!existingRole.tenantID) {
        throw new Error(
          `Role with ID ${roleID} is a global role and cannot be updated`
        );
      }
      if (existingRole.tenantID !== tenantID) {
        throw new Error(
          `Role with ID ${roleID} does not belong to tenant with ID ${tenantID}`
        );
      }
      await tx.tblRolePermissionMappings.deleteMany({
        where: { roleID },
      });

      await tx.tblRoles.delete({
        where: {
          roleID,
        },
      });

      return true;
    });

    // Remove Casbin policies
    await removePoliciesForRole(`role:${roleID}`, tenantID);
    await reloadPolicies();

    Logger.log("success", {
      message: "tenantRoleService:deleteTenantRoleByID:success",
      params: { roleID },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleService:deleteTenantRoleByID:failure",
      params: { error },
    });
    throw error;
  }
};

const PERMISSION_MAP = {
  // Data queries
  "tenant:dataquery:list": { resource: "dataquery", action: "list" },
  "tenant:dataquery:create": { resource: "dataquery", action: "create" },
  "tenant:dataquery:read": { resource: "dataquery", action: "read" },
  "tenant:dataquery:update": { resource: "dataquery", action: "update" },
  "tenant:dataquery:delete": { resource: "dataquery", action: "delete" },
  "tenant:dataquery:test": { resource: "dataquery", action: "test" },
  "tenant:dataquery:execute": { resource: "dataquery", action: "execute" },
  
  // Legacy/Alternative data query permissions in DB
  "tenant:database:query:list": { resource: "dataquery", action: "list" },
  "tenant:database:query:create": { resource: "dataquery", action: "create" },
  "tenant:database:query:read": { resource: "dataquery", action: "read" },
  "tenant:database:query:update": { resource: "dataquery", action: "update" },
  "tenant:database:query:delete": { resource: "dataquery", action: "delete" },
  "tenant:database:query:test": { resource: "dataquery", action: "test" },
  "tenant:query:bulk:create": { resource: "dataquery", action: "create" },
  "tenant:query:clone": { resource: "dataquery", action: "clone" },

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

  // Listeners
  "tenant:listener:list": { resource: "listener", action: "list" },
  "tenant:listener:create": { resource: "listener", action: "create" },
  "tenant:listener:read": { resource: "listener", action: "read" },
  "tenant:listener:update": { resource: "listener", action: "update" },
  "tenant:listener:delete": { resource: "listener", action: "delete" },

  // Users
  "tenant:user:list": { resource: "user", action: "list" },
  "tenant:user:create": { resource: "user", action: "create" },
  "tenant:user:read": { resource: "user", action: "read" },
  "tenant:user:update": { resource: "user", action: "update" },
  "tenant:user:delete": { resource: "user", action: "delete" },

  // Roles & Permissions
  "tenant:role:list": { resource: "role", action: "list" },
  "tenant:role:create": { resource: "role", action: "create" },
  "tenant:role:read": { resource: "role", action: "read" },
  "tenant:role:update": { resource: "role", action: "update" },
  "tenant:role:delete": { resource: "role", action: "delete" },
  "tenant:permissions:list": { resource: "permission", action: "list" },

  // Tenant / general fallbacks
  "tenant:read": { resource: "tenant", action: "read" },
  "tenant:update": { resource: "tenant", action: "update" },
  "tenant:delete": { resource: "tenant", action: "delete" },

  // Legacy/Wildcard fallbacks
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
};

tenantRoleService.syncRolePolicies = async (roleID, tenantID) => {
  const roleName = `role:${roleID}`;

  // 1. Remove existing policies for this role in this domain
  await removePoliciesForRole(roleName, tenantID);

  // 2. Fetch all current permission mappings for this role
  const rolePermissions = await prisma.tblRolePermissionMappings.findMany({
    where: { roleID },
    include: {
      tblPermissions: true,
    },
  });

  // 3. Re-add policies
  for (const rpm of rolePermissions) {
    const permTitle = rpm.tblPermissions.permissionTitle.trim().toLowerCase();

    // Check if it's an asset permission: tenant:asset:resourceType:resourceID:action
    const parts = permTitle.split(":");
    if (parts.length === 5 && parts[0] === "tenant" && parts[1] === "asset") {
      const resourceType = parts[2];
      const resourceID = parts[3];
      const action = parts[4];

      // Re-map to correct casing (e.g. apppage -> appPage)
      let finalResourceType = resourceType;
      if (resourceType === "apppage") finalResourceType = "appPage";

      await addPolicy(roleName, tenantID, `${finalResourceType}:${resourceID}`, action, "allow");
    } else {
      // General permission mapping
      const mapping = PERMISSION_MAP[permTitle];
      if (mapping) {
        await addPolicy(roleName, tenantID, `${mapping.resource}:*`, mapping.action, "allow");
      }
    }
  }

  // 4. Reload the enforcer rules cache
  await reloadPolicies();
};

/**
 * Re-syncs all Casbin policies for every role across all tenants.
 * Call this on startup to recover from stale rules in the casbin_rule table.
 */
tenantRoleService.syncAllRolePolicies = async () => {
  Logger.log("info", { message: "tenantRoleService:syncAllRolePolicies:start" });

  try {
    const allRoles = await prisma.tblRoles.findMany({
      select: { roleID: true, tenantID: true },
    });

    // For global roles (tenantID=null), we need all tenantIDs to sync against
    let allTenantIDs = null;

    for (const role of allRoles) {
      try {
        if (role.tenantID) {
          // Tenant-scoped role: sync only for its tenant
          await tenantRoleService.syncRolePolicies(role.roleID, role.tenantID);
        } else {
          // Global role (tenantID=null): sync for every tenant, same as the seed script
          if (!allTenantIDs) {
            const tenants = await prisma.tblTenants.findMany({ select: { tenantID: true } });
            allTenantIDs = tenants.map((t) => t.tenantID);
          }
          for (const tenantID of allTenantIDs) {
            await tenantRoleService.syncRolePolicies(role.roleID, tenantID);
          }
        }
      } catch (err) {
        Logger.log("warning", {
          message: "tenantRoleService:syncAllRolePolicies:roleSkipped",
          params: { roleID: role.roleID, error: err.message },
        });
      }
    }

    Logger.log("success", {
      message: "tenantRoleService:syncAllRolePolicies:done",
      params: { rolesCount: allRoles.length },
    });
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleService:syncAllRolePolicies:error",
      params: { error: error.message },
    });
    throw error;
  }
};

module.exports = { tenantRoleService };
