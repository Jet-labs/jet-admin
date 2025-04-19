const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");

const tenantRoleService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.tenantID
 * @param {string} param0.roleName
 * @param {string} param0.roleDescription
 * @param {Array<number>} param0.permissionIDs
 * @returns {Promise<boolean>}
 */
tenantRoleService.createRole = async ({
  tenantID,
  roleName,
  roleDescription,
  permissionIDs,
}) => {
  Logger.log("info", {
    message: "tenantRoleService:createRole:params",
    params: { tenantID, roleName, roleDescription, permissionIDs }, // Added permissionIDs to logging
  });

  // Input validation for permissionIDs
  if (!Array.isArray(permissionIDs)) {
    throw new Error("permissionIDs must be an array");
  }

  try {
    // Use a transaction for atomicity
    const createdRole = await prisma.$transaction(async (tx) => {
      // Create the role
      const role = await tx.tblRoles.create({
        data: {
          tenantID,
          roleName,
          roleDescription,
        },
      });

      // Create permission mappings
      const rolePermissionMappings = permissionIDs.map((permissionID) => ({
        roleID: role.roleID,
        permissionID,
      }));

      await tx.tblRolePermissionMappings.createMany({
        data: rolePermissionMappings,
      });

      return role;
    });

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
 * @param {string} param0.roleName
 * @param {string} param0.roleDescription
 * @param {Array<number>} param0.permissionIDs
 * @returns {Promise<boolean>}
 */
tenantRoleService.updateTenantRoleByID = async ({
  tenantID,
  roleID,
  roleName,
  roleDescription,
  permissionIDs,
}) => {
  Logger.log("info", {
    message: "tenantRoleService:updateTenantRoleByID:params",
    params: { tenantID, roleID, roleName, roleDescription, permissionIDs },
  });

  // Input validations

  if (!roleID) throw new Error("roleID is required");
  if (permissionIDs !== undefined && !Array.isArray(permissionIDs)) {
    throw new Error("permissionIDs must be an array");
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
        ...(roleName && { roleName }),
        ...(roleDescription && { roleDescription }),
      };

      const updated = await tx.tblRoles.update({
        where: { roleID },
        data: roleUpdateData,
      });

      // Update permissions if provided
      if (permissionIDs !== undefined) {
        // Delete existing mappings
        await tx.tblRolePermissionMappings.deleteMany({
          where: { roleID },
        });

        // Create new mappings
        if (permissionIDs.length > 0) {
          const newMappings = permissionIDs.map((permissionID) => ({
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

module.exports = { tenantRoleService };
