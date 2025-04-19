const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");

const databaseNotificationService = {};

/**
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
databaseNotificationService.getAllDatabaseNotifications = async ({
  userID,
  tenantID,
}) => {
  Logger.log("info", {
    message: "databaseNotificationService:getAllDatabaseNotifications:params",
    params: { userID, tenantID },
  });

  try {
    const databaseNotifications =
      await prisma.tblDatabaseNotifications.findMany({
        where: {
          tenantID: parseInt(tenantID),
        },
      });

    Logger.log("success", {
      message:
        "databaseNotificationService:getAllDatabaseNotifications:success",
      params: { userID, databaseNotifications },
    });

    return databaseNotifications;
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseNotificationService:getAllDatabaseNotifications:failure",
      params: { userID, error },
    });
    throw error;
  }
};

/**
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {string} param0.databaseNotificationName
 * @returns {Promise<boolean>}
 */
databaseNotificationService.createDatabaseNotification = async ({
  userID,
  tenantID,
  databaseNotificationName,
}) => {
  Logger.log("info", {
    message: "databaseNotificationService:createDatabaseNotification:params",
    params: { userID, tenantID, databaseNotificationName },
  });

  try {
    await prisma.tblDatabaseNotifications.create({
      data: {
        tenantID: parseInt(tenantID),
        databaseNotificationName,
      },
    });

    Logger.log("success", {
      message: "databaseNotificationService:createDatabaseNotification:success",
      params: { userID, databaseNotificationName },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseNotificationService:createDatabaseNotification:failure",
      params: { userID, error },
    });
    throw error;
  }
};

/**
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.databaseNotificationID
 * @returns {Promise<object>}
 */
databaseNotificationService.getDatabaseNotificationByID = async ({
  userID,
  tenantID,
  databaseNotificationID,
}) => {
  Logger.log("info", {
    message: "databaseNotificationService:getDatabaseNotificationByID:params",
    params: { userID, tenantID, databaseNotificationID },
  });

  try {
    const databaseNotification =
      await prisma.tblDatabaseNotifications.findFirst({
        where: {
          databaseNotificationID: parseInt(databaseNotificationID),
          tenantID: parseInt(tenantID),
        },
      });

    if (!databaseNotification) {
      throw new Error("Notification not found");
    }

    Logger.log("success", {
      message:
        "databaseNotificationService:getDatabaseNotificationByID:success",
      params: { userID, databaseNotification },
    });

    return databaseNotification;
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseNotificationService:getDatabaseNotificationByID:failure",
      params: { userID, error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {string} param0.tenantID
 * @param {number} param0.databaseNotificationID
 * @param {string} param0.databaseNotificationName
 * @param {string} param0.databaseNotificationDescription
 * @param {JSON} param0.databaseNotification
 * @param {Boolean} param0.runOnLoad
 * @returns {Promise<boolean>}
 */
databaseNotificationService.updateDatabaseNotificationByID = async ({
  userID,
  tenantID,
  databaseNotificationID,
  databaseNotificationName,
}) => {
  Logger.log("info", {
    message:
      "databaseNotificationService:updateDatabaseNotificationByID:params",
    params: {
      userID,
      tenantID,
      databaseNotificationID,
      databaseNotificationName,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblDatabaseNotifications.update({
      where: {
        databaseNotificationID: parseInt(databaseNotificationID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
      data: {
        databaseNotificationName,
      },
    });

    Logger.log("success", {
      message:
        "databaseNotificationService:updateDatabaseNotificationByID:success",
      params: {
        userID,
        tenantID,
        databaseNotificationID,
        databaseNotificationName,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseNotificationService:updateDatabaseNotificationByID:failure",
      params: {
        userID,
        tenantID,
        databaseNotificationID,
        error,
      },
    });
    throw error;
  }
};

/**
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.databaseNotificationID
 * @returns {Promise<boolean>}
 */
databaseNotificationService.deleteDatabaseNotificationByID = async ({
  userID,
  tenantID,
  databaseNotificationID,
}) => {
  Logger.log("info", {
    message:
      "databaseNotificationService:deleteDatabaseNotificationByID:params",
    params: { userID, tenantID, databaseNotificationID },
  });

  try {
    await prisma.tblDatabaseNotifications.delete({
      where: {
        databaseNotificationID: parseInt(databaseNotificationID),
        tenantID: parseInt(tenantID),
      },
    });

    Logger.log("success", {
      message:
        "databaseNotificationService:deleteDatabaseNotificationByID:success",
      params: { userID, databaseNotificationID },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseNotificationService:deleteDatabaseNotificationByID:failure",
      params: { userID, error },
    });
    throw error;
  }
};

module.exports = { databaseNotificationService };