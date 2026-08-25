const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const { addPolicy, removePoliciesForRole, reloadPolicies } = require("../../config/casbin.config");
const { PERMISSION_MAP } = require("../../config/permissions");

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

    // Sync policies to Casbin. Global roles (no tenantID) must be synced
    // across every tenant domain.
    if (tenantID) {
      await tenantRoleService.syncRolePolicies(createdRole.roleID, tenantID);
    } else {
      await tenantRoleService.syncAllRolePolicies();
    }

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
    let roleScope = null; // the role's own tenantID, resolved inside the transaction
    const updatedRole = await prisma.$transaction(async (tx) => {
      // Check if role exists
      const existingRole = await tx.tblRoles.findFirst({
        where: { roleID },
      });
      if (!existingRole) {
        throw new Error(`Role with ID ${roleID} not found`);
      }
      roleScope = existingRole.tenantID;
      // When called without a tenantID (operator console / global surface),
      // any role may be edited. With a tenantID, ownership is enforced.
      if (tenantID && existingRole.tenantID !== tenantID) {
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

    // Sync policies to Casbin in every domain this role lives in.
    if (tenantID) {
      await tenantRoleService.syncRolePolicies(roleID, tenantID);
    } else if (roleScope) {
      await tenantRoleService.syncRolePolicies(roleID, roleScope);
    } else {
      await tenantRoleService.syncAllRolePolicies();
    }

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
      // With a tenantID: that tenant's roles plus global ones. Without:
      // the full registry (operator console treats roles as global).
      where: tenantID
        ? {
            OR: [{ tenantID: tenantID }, { tenantID: null }],
          }
        : {},
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
      // When called without a tenantID (operator console / global surface),
      // any role may be deleted. With a tenantID, ownership is enforced.
      if (tenantID && existingRole.tenantID !== tenantID) {
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

    // Remove Casbin policies for this role. Without a tenantID (global
    // surface), purge the role's policies from every tenant domain.
    const roleName = `role:${roleID}`;
    if (tenantID) {
      await removePoliciesForRole(roleName, tenantID);
    } else {
      const tenants = await prisma.tblTenants.findMany({
        select: { tenantID: true },
      });
      for (const tenant of tenants) {
        await removePoliciesForRole(roleName, tenant.tenantID);
      }
    }
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
      } else {
        // Manually registered permission (created outside permissions.json):
        // derive the Casbin policy from its well-formed title
        // ("tenant:<resource>:<action>" → "<resource>:*" + action) so it is
        // enforceable without a config entry.
        const generalParts = permTitle.split(":");
        if (generalParts.length === 3 && generalParts[0] === "tenant") {
          await addPolicy(
            roleName,
            tenantID,
            `${generalParts[1]}:*`,
            generalParts[2],
            "allow"
          );
        }
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

/**
 * Creates a permission manually (operator console / recovery path for
 * missing seeds).
 *
 * - Validates the "tenant:<resource>:<action>" title format so
 *   syncRolePolicies can derive an enforceable Casbin policy from it.
 * - Optionally maps the new permission onto the global ADMIN role and
 *   resyncs all Casbin policies (same convention as
 *   scripts/collect-and-seed-permissions.js).
 *
 * @param {object} param0
 * @param {string} param0.permissionTitle
 * @param {string} [param0.permissionDescription]
 * @param {boolean} [param0.mapToAdmin=true]
 * @returns {Promise<{permission: object, adminMapped: boolean}>}
 */
tenantRoleService.createPermission = async ({
  permissionTitle,
  permissionDescription,
  mapToAdmin = true,
}) => {
  const title = String(permissionTitle || "").trim().toLowerCase();
  const parts = title.split(":");
  if (
    parts.length !== 3 ||
    parts[0] !== "tenant" ||
    !parts[1] ||
    !parts[2] ||
    !/^[a-z0-9_-]+$/.test(parts[1]) ||
    !/^[a-z0-9_-]+$/.test(parts[2])
  ) {
    throw new Error(
      'permissionTitle must have the form "tenant:<resource>:<action>" using lowercase letters, digits, "-" or "_"'
    );
  }

  Logger.log("info", {
    message: "tenantRoleService:createPermission:params",
    params: { permissionTitle: title, mapToAdmin },
  });

  const existing = await prisma.tblPermissions.findFirst({
    where: { permissionTitle: title },
  });
  if (existing) {
    throw new Error(`Permission "${title}" already exists.`);
  }

  const permission = await prisma.tblPermissions.create({
    data: {
      permissionTitle: title,
      permissionDescription:
        permissionDescription && String(permissionDescription).trim()
          ? String(permissionDescription).trim()
          : null,
    },
  });

  let adminMapped = false;
  if (mapToAdmin) {
    // House convention (collect-and-seed-permissions.js): new registry
    // entries are granted to the global ADMIN role.
    const adminRole = await prisma.tblRoles.findFirst({
      where: { roleTitle: "ADMIN" },
    });
    if (adminRole) {
      await prisma.tblRolePermissionMappings.upsert({
        where: {
          roleID_permissionID: {
            roleID: adminRole.roleID,
            permissionID: permission.permissionID,
          },
        },
        update: {},
        create: {
          roleID: adminRole.roleID,
          permissionID: permission.permissionID,
        },
      });
      await tenantRoleService.syncAllRolePolicies();
      adminMapped = true;
    }
  }

  Logger.log("success", {
    message: "tenantRoleService:createPermission:success",
    params: { permissionID: permission.permissionID, adminMapped },
  });

  return { permission, adminMapped };
};

module.exports = { tenantRoleService };
