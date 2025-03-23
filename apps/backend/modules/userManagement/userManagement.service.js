const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const { notificationService } = require("../notification/notification.service");

const userManagementService = {};

/**
 * Promotes a user to admin.
 *
 * @param {number} tenantUserID
 * @param {number} tenantID
 */
userManagementService.promoteUserToAdmin = async (tenantUserID, tenantID) => {
  Logger.log("info", {
    message: "userManagementService:promoteUserToAdmin:params",
    params: { tenantUserID, tenantID },
  });

  await prisma.$transaction(async (tx) => {
    await tx.tblUsersTenantsRelationship.update({
      where: { tenantID_userID: { tenantID, userID: tenantUserID } },
      data: { role: constants.ROLES.PRIMARY.ADMIN.value },
    });
  });

  Logger.log("success", {
    message: "userManagementService:promoteUserToAdmin:success",
    params: { tenantUserID, tenantID },
  });
};

/**
 * Demotes a user to member and updates their roles.
 *
 * @param {number} tenantUserID
 * @param {number} tenantID
 */
userManagementService.demoteUserToMember = async (tenantUserID, tenantID) => {
  Logger.log("info", {
    message: "userManagementService:demoteUserToMember:params",
    params: { tenantUserID, tenantID },
  });

  await prisma.$transaction(async (tx) => {
    // Demote to member
    await tx.tblUsersTenantsRelationship.update({
      where: { tenantID_userID: { tenantID, userID: tenantUserID } },
      data: { role: constants.ROLES.PRIMARY.MEMBER.value },
    });
  });

  Logger.log("success", {
    message: "userManagementService:demoteUserToMember:success",
    params: { tenantUserID, tenantID },
  });
};

/**
 * Demotes a user to member and updates their roles.
 *
 * @param {number} tenantUserID
 * @param {number} tenantID
 * @param {Array<number>} roleIDs
 */
userManagementService.updateTenantUserRoles = async (
  tenantUserID,
  tenantID,
  roleIDs
) => {
  Logger.log("info", {
    message: "userManagementService:updateTenantUserRoles:params",
    params: { tenantUserID, tenantID, roleIDs },
  });

  await prisma.$transaction(async (tx) => {
    // Remove existing roles
    await tx.tblUserTenantRoleMappings.deleteMany({
      where: { userID: tenantUserID, tenantID },
    });

    // Assign new roles if provided
    if (roleIDs && roleIDs.length > 0) {
      await Promise.all(
        roleIDs.map((roleID) =>
          tx.tblUserTenantRoleMappings.create({
            data: { userID: tenantUserID, tenantID, roleID },
          })
        )
      );
    }
  });

  Logger.log("success", {
    message: "userManagementService:updateTenantUserRoles:success",
    params: { tenantUserID, tenantID, roleIDs },
  });
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.skip
 * @param {number} param0.take
 * @returns {Promise<Array<import("@prisma/client").tblUsersTenantsRelationship>>}
 */
userManagementService.getAllTenantUsers = async ({
  userID,
  tenantID,
  skip,
  take,
}) => {
  Logger.log("info", {
    message: "userManagementService:getAllTenantUsers:params",
    params: {
      userID,
      tenantID,
      skip,
      take,
    },
  });

  try {
    const users = await prisma.tblUsersTenantsRelationship.findMany({
      where: {
        tenantID: tenantID, // Filter by tenant ID
      },
      include: {
        tblUsers: true, // Include user details
        tblUserTenantRoleMappings: {
          include: {
            tblRoles: true, // Include roles assigned to the user
          },
        },
      },
      skip,
      take,
    });

    // Transform the result to include roles in a more readable format
    const usersWithRoles = users.map((userRelation) => ({
      ...userRelation.tblUsers, // Include user details
      isTenantAdmin: userRelation.role == constants.ROLES.PRIMARY.ADMIN.value,
      tenantUserFrom: userRelation.createdAt,
      roles: userRelation.tblUserTenantRoleMappings.map(
        (roleMapping) => roleMapping.tblRoles
      ),
    }));

    Logger.log("success", {
      message: "userManagementService:getAllTenantUsers:success",
      params: {
        userID,
        tenantID,
        usersLength: usersWithRoles?.length,
        skip,
        take,
      },
    });

    return usersWithRoles;
  } catch (error) {
    Logger.log("error", {
      message: "userManagementService:getAllTenantUsers:catch-1",
      params: {
        userID,
        tenantID,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Retrieves a target user's details by their ID, scoped to a specific tenant.
 *
 * @param {object} param0
 * @param {number} param0.userID - The ID of the user making the request.
 * @param {number} param0.tenantUserID - The ID of the user whose details are being fetched.
 * @param {number} param0.tenantID - The tenant ID to scope the request.
 * @returns {Promise<object>} - The target user object with roles and permissions within the tenant.
 */
userManagementService.getTenantUserByID = async ({
  userID,
  tenantUserID,
  tenantID,
}) => {
  Logger.log("info", {
    message: "userManagementService:getTenantUserByID:params",
    params: { userID, tenantUserID, tenantID },
  });

  try {
    //Fetch the target user's details within the tenant
    const tenantUserRelationship =
      await prisma.tblUsersTenantsRelationship.findUnique({
        where: {
          tenantID_userID: {
            tenantID: tenantID,
            userID: tenantUserID,
          },
        },
        include: {
          tblUsers: true,
        },
      });

    if (!tenantUserRelationship) {
      Logger.log("error", {
        message:
          "userManagementService:getTenantUserByID:target-user-not-found",
        params: { userID, tenantUserID, tenantID },
      });
      throw new Error("Target user not found or not part of the tenant");
    }
    const tenantUserRoles = await prisma.tblUserTenantRoleMappings.findMany({
      where: {
        tenantID: tenantID,
        userID: tenantUserID,
      },
      include: {
        tblRoles: true,
      },
    });

    Logger.log("success", {
      message: "userManagementService:getTenantUserByID:success",
      params: { userID, tenantUserID, tenantID },
    });

    return {
      ...tenantUserRelationship.tblUsers,
      isTenantAdmin:
        tenantUserRelationship.role == constants.ROLES.PRIMARY.ADMIN.value,
      tenantUserFrom: tenantUserRelationship.createdAt,
      roles: tenantUserRoles.map((v) => v.tblRoles),
    };
  } catch (error) {
    Logger.log("error", {
      message: "userManagementService:getTenantUserByID:catch-1",
      params: { userID, tenantUserID, tenantID, error: error.message },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {Number} param0.tenantUserID
 * @param {Number} param0.tenantID
 * @returns
 */
userManagementService.addUserToTenant = async ({
  userID,
  tenantUserID,
  tenantID,
}) => {
  try {
    Logger.log("info", {
      message: "userManagementService:addUserToTenant:params",
      params: { userID, tenantID, tenantUserID },
    });

    const existingUserTenantRelationship =
      await prisma.tblUsersTenantsRelationship.findUnique({
        where: {
          tenantID_userID: {
            tenantID,
            userID: tenantUserID,
          },
        },
      });
    if (existingUserTenantRelationship) {
      Logger.log("error", {
        message: "userManagementService:addUserToTenant:catch2",
        params: { error: constants.ERROR_CODES.USER_ALREADY_MEMBER_OF_TENANT },
      });
      throw constants.ERROR_CODES.USER_ALREADY_MEMBER_OF_TENANT;
    }
    const newUserTenantRelationship =
      await prisma.tblUsersTenantsRelationship.create({
        data: {
          tenantID,
          userID: tenantUserID,
          role: "MEMBER",
        },
      });
    await notificationService.sendUserTenantAdditionNotification({
      notifierID: userID,
      userID: tenantUserID,
      tenantID,
    });
    Logger.log("success", {
      message:
        "userManagementService:addUserToTenant:newUserTenantRelationship",
      params: { userID, newUserTenantRelationship },
    });
    return newUserTenantRelationship;
  } catch (error) {
    Logger.log("error", {
      message: "userManagementService:addUserToTenant:catch1",
      params: { error },
    });
    throw error;
  }
};

/**
 * Updates a user's roles and details.
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantUserID - The ID of the user to update.
 * @param {number} param0.tenantID - The tenant ID for which the roles are being updated.
 * @param {Array<number>} param0.roleIDs - An array of role IDs to assign to the user.
 * @param {string} param0.userTenantRelationship - An array of role IDs to assign to the user.
 * @returns {Promise<void>}
 */
userManagementService.updateTenantUserRolesByID = async ({
  userID,
  tenantUserID,
  tenantID,
  roleIDs,
  userTenantRelationship,
}) => {
  Logger.log("info", {
    message: "userManagementService:updateTenantUserRolesByID:params",
    params: { userID, tenantUserID, tenantID, roleIDs, userTenantRelationship },
  });

  try {
    // Validate inputs
    if (!tenantID || !tenantUserID || !userTenantRelationship) {
      throw new Error(constants.ERROR_CODES.INVALID_INPUT);
    }

    const existingUserTenantRelationship =
      await prisma.tblUsersTenantsRelationship.findUnique({
        where: {
          tenantID_userID: { tenantID, userID: tenantUserID },
        },
      });

    if (!existingUserTenantRelationship) {
      throw new Error(constants.ERROR_CODES.USER_NOT_FOUND_IN_TENANT);
    }

    const { role: currentRole } = existingUserTenantRelationship;
    const ADMIN_ROLE = constants.ROLES.PRIMARY.ADMIN.value;
    const MEMBER_ROLE = constants.ROLES.PRIMARY.MEMBER.value;

    Logger.log("info", {
      message: "userManagementService:updateTenantUserRolesByID:currentRole",
      params: {
        userID,
        tenantUserID,
        tenantID,
        roleIDs,
        userTenantRelationship,
        currentRole,
      },
    });

    // Check if user is already an admin
    if (currentRole == ADMIN_ROLE && userTenantRelationship == ADMIN_ROLE) {
      Logger.log("error", {
        message:
          "userManagementService:updateTenantUserRolesByID:user-already-admin",
        params: { userID, tenantUserID, tenantID },
      });
      throw new Error(constants.ERROR_CODES.USER_ALREADY_ADMIN_OF_TENANT);
    } else if (
      currentRole == ADMIN_ROLE &&
      userTenantRelationship == MEMBER_ROLE
    ) {
      await userManagementService.demoteUserToMember(tenantUserID, tenantID);
    } else if (
      currentRole == MEMBER_ROLE &&
      userTenantRelationship == ADMIN_ROLE
    ) {
      await userManagementService.promoteUserToAdmin(tenantUserID, tenantID);
    } else {
      await userManagementService.updateTenantUserRoles(
        tenantUserID,
        tenantID,
        roleIDs
      );
    }

    Logger.log("success", {
      message: "userManagementService:updateTenantUserRolesByID:success",
      params: {
        userID,
        tenantUserID,
        tenantID,
        roleIDs,
        userTenantRelationship,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "userManagementService:updateTenantUserRolesByID:catch-1",
      params: {
        userID,
        tenantUserID,
        tenantID,
        roleIDs,
        userTenantRelationship,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Updates a user's roles and details.
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantUserID - The ID of the user to update.
 * @param {number} param0.tenantID - The tenant ID for which the roles are being updated.
 * @param {Array<number>} param0.roleIDs - An array of role IDs to assign to the user.
 * @returns {Promise<void>}
 */
userManagementService.removeTenantUserFromTenantByID = async ({
  userID,
  tenantUserID,
  tenantID,
}) => {
  Logger.log("info", {
    message: "userManagementService:removeTenantUserFromTenantByID:params",
    params: { userID, tenantUserID, tenantID },
  });

  try {
    const userTenantAdminRelationships =
      await prisma.tblUsersTenantsRelationship.findMany({
        where: {
          tenantID,
          role: constants.ROLES.PRIMARY.ADMIN.value,
        },
      });
    const existingUserTenantRelationship =
      await prisma.tblUsersTenantsRelationship.findUnique({
        where: {
          tenantID_userID: {
            tenantID,
            userID: tenantUserID,
          },
        },
      });
    if (
      (!userTenantAdminRelationships ||
        userTenantAdminRelationships.length < 2) &&
      existingUserTenantRelationship.role == constants.ROLES.PRIMARY.ADMIN.value
    ) {
      Logger.log("error", {
        message: "userManagementService:removeTenantUserFromTenantByID:catch-1",
        params: {
          userID,
          tenantUserID,
          tenantID,
          error: constants.ERROR_CODES.ONLY_ONE_ADMIN_IN_TENANT,
        },
      });
      throw constants.ERROR_CODES.ONLY_ONE_ADMIN_IN_TENANT;
    }
    // Start a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Remove existing roles for the user in the specified tenant
      await tx.tblUsersTenantsRelationship.delete({
        where: {
          tenantID_userID: {
            tenantID,
            userID: tenantUserID,
          },
        },
      });
      await tx.tblUserTenantRoleMappings.deleteMany({
        where: { userID: tenantUserID, tenantID },
      });
    });

    Logger.log("success", {
      message: "userManagementService:removeTenantUserFromTenantByID:success",
      params: { userID, tenantUserID, tenantID },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "userManagementService:removeTenantUserFromTenantByID:catch-1",
      params: { userID, tenantUserID, tenantID, error: error.message },
    });
    throw error;
  }
};

module.exports = { userManagementService };
