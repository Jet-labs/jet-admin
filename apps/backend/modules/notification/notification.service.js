const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const notificationService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.notifierID
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<object>}
 */
notificationService.sendUserTenantAdditionNotification = async ({
    notifierID,
  userID,
  tenantID,
}) => {
  Logger.log("info", {
    message: "notificationService:sendUserTenantAdditionNotification:params",
    params: {
      notifierID,
      userID,
      tenantID,
    },
  });

  try {
    const notification = await prisma.tblUserNotifications.create({
      data: {
        userID: parseInt(userID),
        tenantID: parseInt(tenantID),
        notifierID: `user_${notifierID}`,
        title: constants.STRINGS.USER_TENANT_ADDITION_NOTIFICATION_TITLE,
        description: constants.STRINGS.USER_TENANT_ADDITION_NOTIFICATION_DESCRIPTION,
        actionType:'link',
        action:`../tenants/${parseInt(tenantID)}`,
        actionText:'View Tenant'
      },
    });
    Logger.log("success", {
      message: "notificationService:sendUserTenantAdditionNotification:success",
      params: {
        notifierID,
        userID,
        tenantID,
      },
    });
    return notification;
  } catch (error) {
    Logger.log("error", {
      message: "notificationService:sendUserTenantAdditionNotification:catch-1",
      params: {
        notifierID,
        userID,
        tenantID,
        error
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.skip
 * @param {number} param0.take
 * @returns {Promise<Array<import("@prisma/client").tblUserNotifications>>}
 */
notificationService.getAllUserNotifications = async ({
  userID,
  skip=0,
  take=20,
}) => {
  Logger.log("info", {
    message: "notificationService:getAllUserNotifications:params",
    params: {
      userID,
      skip,
      take,
    },
  });

  try {
    const notifications = await prisma.tblUserNotifications.findMany({
      where: {
        userID: parseInt(userID),
      },
      skip,
      take,
    });

    Logger.log("success", {
      message: "notificationService:getAllUserNotifications:success",
      params: {
        userID,
        notificationsLength: notifications?.length,
        skip,
        take,
      },
    });

    return notifications;
  } catch (error) {
    Logger.log("error", {
      message: "notificationService:getAllUserNotifications:catch-1",
      params: {
        userID,
        error: error.message,
      },
    });
    throw error;
  }
};


module.exports = {notificationService}