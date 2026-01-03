
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const environmentVariables = require("../../environment");
const Logger = require("../../utils/logger");
const { notificationService } = require("../notification/notification.service");

const authService = {};

/**
 *
 * @param {object} param0
 * @param {String} param0.firebaseID
 * @returns
 */
authService.getUserFromFirebaseID = async ({ firebaseID }) => {
  try {
    Logger.log("info", {
      message: "authService:getUserFromFirebaseID:params",
      params: { firebaseID },
    });
    const user = await prisma.tblUsers.findFirst({
      where: {
        firebaseID,
      },
    });
    const notifications = await notificationService.getAllUserNotifications({
      userID: user.userID,
    });
    Logger.log("success", {
      message: "authService:getUserFromFirebaseID:userFound",
      params: { user },
    });
    return { ...user, notifications };
  } catch (error) {
    Logger.log("error", {
      message: "authService:getUserFromFirebaseID:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {Number} param0.tenantID
 * @returns
 */
authService.getUserConfig = async ({ userID, tenantID }) => {
  try {
    Logger.log("info", {
      message: "authService:getUserConfig:params",
      params: { userID, tenantID },
    });
    const userConfig = await prisma.tblUserTenantConfigMap.findUnique({
      where: {
        userID_tenantID: {
          userID: userID,
          tenantID: tenantID,
        },
      },
    });
    Logger.log("success", {
      message: "authService:getUserConfig:userConfig",
      params: { userConfig },
    });
    return userConfig?.config;
  } catch (error) {
    Logger.log("error", {
      message: "authService:getUserConfig:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {Number} param0.tenantID
 * @param {JSON} param0.config
 * @returns
 */
authService.updateUserConfig = async ({ userID, tenantID, config }) => {
  try {
    Logger.log("info", {
      message: "authService:updateUserConfig:params",
      params: { userID, tenantID, config },
    });
    await prisma.tblUserTenantConfigMap.upsert({
      where: {
        userID_tenantID: {
          userID: userID,
          tenantID: tenantID,
        },
      },
      create: {
        userID: userID,
        tenantID: tenantID,
        config,
      },
      update: {
        config,
      },
    });
    Logger.log("success", {
      message: "authService:updateUserConfig:success",
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "authService:updateUserConfig:catch-1",
      params: { error },
    });
    throw error;
  }
};
/**
 *
 * @param {object} param0
 * @param {String} param0.email
 * @returns
 */
authService.getUserFromEmailID = async ({ email }) => {
  try {
    Logger.log("info", {
      message: "authService:getUserFromEmailID:params",
      params: { email },
    });
    const user = await prisma.tblUsers.findFirst({
      where: {
        email,
      },
    });
    Logger.log("success", {
      message: "authService:getUserFromEmailID:userFound",
      params: { user },
    });
    return user;
  } catch (error) {
    Logger.log("error", {
      message: "authService:getUserFromEmailID:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {String} param0.firebaseID
 * @param {String} param0.email
 * @returns
 */
authService.createUser = async ({ firebaseID, email }) => {
  try {
    Logger.log("info", {
      message: "authService:createUser:create",
      params: { firebaseID, email },
    });
    // create user
    const newUser = await prisma.tblUsers.create({
      data: {
        email,
        firebaseID,
      },
    });

    Logger.log("success", {
      message: "authService:createUser:createdNewUser",
      params: { newUser },
    });
    return newUser;
  } catch (error) {
    Logger.log("error", {
      message: "authService:createUser:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 * Checks if a user has the required permissions within a tenant.
 *
 * @param {object} params - Input parameters.
 * @param {Number} params.userID - The ID of the user.
 * @param {Number} params.tenantID - The ID of the tenant.
 * @param {Array<string>} params.requiredPermissions - List of required permissions.
 * @param {Boolean} [params.requireAll=true] - Whether the user must have ALL or ANY of the required permissions.
 * @returns {Promise<{permission: boolean, reason?: string}>} - Result of the permission check.
 */
authService.checkUserPermissions = async ({
  userID,
  tenantID,
  requiredPermissions,
  requireAll = true,
}) => {
  try {
    // Input Validation

    if (
      !Array.isArray(requiredPermissions) ||
      !requiredPermissions.every((perm) => typeof perm === "string")
    ) {
      throw new Error("Invalid requiredPermissions");
    }
    if (typeof requireAll !== "boolean") {
      throw new Error("Invalid requireAll");
    }

    // Normalize Permissions
    const normalizePermission = (perm) => perm.trim().toLowerCase();
    requiredPermissions = requiredPermissions.map(normalizePermission);

    Logger.log("info", {
      message: "authService:checkUserPermissions:params",
      params: { userID, tenantID, requiredPermissions, requireAll },
    });

    // Step 1: Check if the user is a member of the tenant
    const userTenant = await prisma.tblUsersTenantsRelationship.findUnique({
      where: {
        tenantID_userID: {
          tenantID,
          userID,
        },
      },
    });

    if (!userTenant) {
      Logger.log("error", {
        message: "authService:checkUserPermissions:user-not-member",
        params: { userID, tenantID },
      });
      return {
        permission: false,
        reason: "User is not a member of the tenant",
      };
    }

    // Step 2: If the user is an ADMIN, bypass further permission checks
    if (userTenant.role === "ADMIN") {
      Logger.log("info", {
        message: "authService:checkUserPermissions:admin-bypass",
        params: { userID, tenantID },
      });
      return { permission: true };
    }

    // Step 3: Fetch all roles and permissions assigned to the user
    const roleMappings = await authService.fetchUserRolesAndPermissions(
      userID,
      tenantID
    );

    if (roleMappings.length === 0) {
      Logger.log("error", {
        message: "authService:checkUserPermissions:no-roles-assigned",
        params: { userID, tenantID },
      });
      return {
        permission: false,
        reason: "User has no roles assigned",
      };
    }

    // Extract user permissions into a Set
    const userPermissions = authService.extractUserPermissions(roleMappings);

    Logger.log("warning", {
      message: "authService:checkUserPermissions:permissions",
      params: {
        userID,
        tenantID,
        roleMappings,
      },
    });
    // Step 4: Check if the user has the required permissions
    const hasRequiredPermissions = authService.checkPermissions(
      userPermissions,
      requiredPermissions,
      requireAll
    );

    if (!hasRequiredPermissions) {
      Logger.log("error", {
        message: "authService:checkUserPermissions:insufficient-permissions",
        params: { userID, tenantID, requiredPermissions, requireAll },
      });
      return {
        permission: false,
        reason: "Insufficient permissions",
      };
    }

    // Permission check passed
    Logger.log("success", {
      message: "authService:checkUserPermissions:success",
      params: { userID, tenantID, requiredPermissions, requireAll },
    });
    return { permission: true };
  } catch (error) {
    Logger.log("error", {
      message: "authService:checkUserPermissions:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 * Fetches all roles and their associated permissions for a user in a tenant.
 *
 * @param {Number} userID - The ID of the user.
 * @param {Number} tenantID - The ID of the tenant.
 * @returns {Promise<Array>} - List of role mappings with permissions.
 */
authService.fetchUserRolesAndPermissions = async (userID, tenantID) => {
  return prisma.tblUserTenantRoleMappings.findMany({
    where: { tenantID, userID },
    include: {
      tblRoles: {
        include: {
          tblRolePermissionMappings: {
            include: {
              tblPermissions: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Extracts all unique permissions from role mappings into a Set.
 *
 * @param {Array} roleMappings - List of role mappings with permissions.
 * @returns {Set<string>} - Set of unique permission names.
 */
authService.extractUserPermissions = (roleMappings) => {
  const userPermissions = new Set();

  for (const mapping of roleMappings) {
    const role = mapping.tblRoles;
    if (!role) continue;

    const permissionMappings = role.tblRolePermissionMappings;
    for (const permMapping of permissionMappings) {
      const permission = permMapping.tblPermissions;
      if (permission) {
        userPermissions.add(permission.permissionTitle.trim().toLowerCase());
      }
    }
  }

  return userPermissions;
};

/**
 * Checks if the user satisfies the required permissions.
 *
 * @param {Set<string>} userPermissions - Set of user permissions.
 * @param {Array<string>} requiredPermissions - List of required permissions.
 * @param {Boolean} requireAll - Whether the user must have ALL or ANY of the required permissions.
 * @returns {Boolean} - Whether the user satisfies the permission requirements.
 */
authService.checkPermissions = (
  userPermissions,
  requiredPermissions,
  requireAll
) => {
  // Utility function to check wildcard matches for hierarchical permissions
  function matchesWildcardPermission(requiredPerm, userPerm) {
    const requiredParts = requiredPerm.split(":");
    const userParts = userPerm.split(":");

    // Ensure both permissions have the same number of segments or allow wildcards
    return requiredParts.every((requiredPart, index) => {
      const userPart = userParts[index];
      return (
        requiredPart === "*" || userPart === "*" || requiredPart === userPart
      );
    });
  }

  if (requireAll) {
    // User must have ALL required permissions
    return requiredPermissions.every((requiredPerm) =>
      Array.from(userPermissions).some(
        (userPerm) =>
          userPerm === requiredPerm || // Exact match
          matchesWildcardPermission(requiredPerm, userPerm) // Wildcard match
      )
    );
  } else {
    // User must have ANY of the required permissions
    return requiredPermissions.some((requiredPerm) =>
      Array.from(userPermissions).some(
        (userPerm) =>
          userPerm === requiredPerm || // Exact match
          matchesWildcardPermission(requiredPerm, userPerm) // Wildcard match
      )
    );
  }
};

/**
 * Fetches all roles and their associated permissions for an API key.
 *
 * @param {String} apiKeyID - The ID of the API key.
 * @returns {Promise<Array>} - List of role mappings with permissions.
 */
authService.fetchAPIKeyRolesAndPermissions = async (apiKeyID) => {
  Logger.log("info", {
    message: "authService:fetchAPIKeyRolesAndPermissions:params",
    params: { apiKeyID },
  });

  const roleMappings = await prisma.tblAPIKeyRoleMappings.findMany({
    where: { apiKeyID },
    include: {
      tblRoles: {
        include: {
          tblRolePermissionMappings: {
            include: {
              tblPermissions: true,
            },
          },
        },
      },
    },
  });

  Logger.log("info", {
    message: "authService:fetchAPIKeyRolesAndPermissions:result",
    params: { apiKeyID, roleCount: roleMappings.length },
  });

  return roleMappings;
};

/**
 * Extracts all unique permissions from API key role mappings into a Set.
 *
 * @param {Array} roleMappings - List of role mappings with permissions.
 * @returns {Set<string>} - Set of unique permission names.
 */
authService.extractAPIKeyPermissions = (roleMappings) => {
  const permissions = new Set();

  for (const mapping of roleMappings) {
    const role = mapping.tblRoles;
    if (!role) continue;

    const permissionMappings = role.tblRolePermissionMappings;
    for (const permMapping of permissionMappings) {
      const permission = permMapping.tblPermissions;
      if (permission) {
        permissions.add(permission.permissionTitle.trim().toLowerCase());
      }
    }
  }

  return permissions;
};

/**
 * Checks if an API key has the required permissions.
 *
 * @param {object} params - Input parameters.
 * @param {String} params.apiKeyID - The ID of the API key.
 * @param {String} params.tenantID - The ID of the tenant.
 * @param {Array<string>} params.requiredPermissions - List of required permissions.
 * @param {Boolean} [params.requireAll=true] - Whether the API key must have ALL or ANY of the required permissions.
 * @returns {Promise<{permission: boolean, reason?: string}>} - Result of the permission check.
 */
authService.checkAPIKeyPermissions = async ({
  apiKeyID,
  tenantID,
  requiredPermissions,
  requireAll = true,
}) => {
  try {
    // Input Validation
    if (
      !Array.isArray(requiredPermissions) ||
      !requiredPermissions.every((perm) => typeof perm === "string")
    ) {
      throw new Error("Invalid requiredPermissions");
    }
    if (typeof requireAll !== "boolean") {
      throw new Error("Invalid requireAll");
    }

    // Normalize Permissions
    const normalizePermission = (perm) => perm.trim().toLowerCase();
    requiredPermissions = requiredPermissions.map(normalizePermission);

    Logger.log("info", {
      message: "authService:checkAPIKeyPermissions:params",
      params: { apiKeyID, tenantID, requiredPermissions, requireAll },
    });

    // Step 1: Verify API key exists and belongs to the tenant
    const apiKey = await prisma.tblAPIKeys.findFirst({
      where: {
        apiKeyID,
        tenantID,
        isDisabled: false,
      },
    });

    if (!apiKey) {
      Logger.log("error", {
        message: "authService:checkAPIKeyPermissions:api-key-not-found",
        params: { apiKeyID, tenantID },
      });
      return {
        permission: false,
        reason: "API key not found or disabled",
      };
    }

    // Step 2: Fetch all roles and permissions assigned to the API key
    const roleMappings = await authService.fetchAPIKeyRolesAndPermissions(apiKeyID);

    if (roleMappings.length === 0) {
      Logger.log("error", {
        message: "authService:checkAPIKeyPermissions:no-roles-assigned",
        params: { apiKeyID, tenantID },
      });
      return {
        permission: false,
        reason: "API key has no roles assigned",
      };
    }

    // Extract API key permissions into a Set
    const apiKeyPermissions = authService.extractAPIKeyPermissions(roleMappings);

    Logger.log("info", {
      message: "authService:checkAPIKeyPermissions:permissions",
      params: {
        apiKeyID,
        tenantID,
        permissionCount: apiKeyPermissions.size,
        permissions: Array.from(apiKeyPermissions),
      },
    });

    // Step 3: Check if the API key has the required permissions
    // Reuse the same checkPermissions logic used for users
    const hasRequiredPermissions = authService.checkPermissions(
      apiKeyPermissions,
      requiredPermissions,
      requireAll
    );

    if (!hasRequiredPermissions) {
      Logger.log("error", {
        message: "authService:checkAPIKeyPermissions:insufficient-permissions",
        params: { apiKeyID, tenantID, requiredPermissions, requireAll },
      });
      return {
        permission: false,
        reason: "Insufficient permissions for API key",
      };
    }

    // Permission check passed
    Logger.log("success", {
      message: "authService:checkAPIKeyPermissions:success",
      params: { apiKeyID, tenantID, requiredPermissions, requireAll },
    });
    return { permission: true };
  } catch (error) {
    Logger.log("error", {
      message: "authService:checkAPIKeyPermissions:catch-1",
      params: { error },
    });
    throw error;
  }
};

module.exports = { authService };
