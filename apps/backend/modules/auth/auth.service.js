
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

    if (!user) {
      Logger.log("info", {
        message: "authService:getUserFromFirebaseID:userNotFound",
        params: { firebaseID },
      });
      return null;
    }

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

module.exports = { authService };
