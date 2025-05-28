const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { databaseNotificationService } = require("./databaseNotification.service");

const databaseNotificationController = {};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseNotificationController.getAllDatabaseNotifications = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;

    Logger.log("info", {
      message: "databaseNotificationController:getAllDatabaseNotifications:params",
      params: { userID: user.userID, tenantID },
    });

    const databaseNotifications =
      await databaseNotificationService.getAllDatabaseNotifications({
        userID: parseInt(user.userID),
        tenantID,
      });

    return expressUtils.sendResponse(res, true, {
      databaseNotifications,
      message: "Notifications fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseNotificationController:getAllDatabaseNotifications:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseNotificationController.createDatabaseNotification = async (
  req,
  res
) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { databaseNotificationTitle } = req.body;

    Logger.log("info", {
      message:
        "databaseNotificationController:createDatabaseNotification:params",
      params: { userID: user.userID, tenantID, databaseNotificationTitle },
    });

    const result = await databaseNotificationService.createDatabaseNotification(
      {
        userID: parseInt(user.userID),
        tenantID,
        databaseNotificationTitle,
      }
    );

    return expressUtils.sendResponse(res, true, {
      message: "Notification created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseNotificationController:createDatabaseNotification:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseNotificationController.getDatabaseNotificationByID = async (
  req,
  res
) => {
  try {
    const { user } = req;
    const { tenantID, databaseNotificationID } = req.params;

    Logger.log("info", {
      message:
        "databaseNotificationController:getDatabaseNotificationByID:params",
      params: { userID: user.userID, tenantID, databaseNotificationID },
    });

    const databaseNotification =
      await databaseNotificationService.getDatabaseNotificationByID({
        userID: parseInt(user.userID),
        tenantID,
        databaseNotificationID: parseInt(databaseNotificationID),
      });

    return expressUtils.sendResponse(res, true, {
      databaseNotification,
      message: "Notification fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseNotificationController:getDatabaseNotificationByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseNotificationController.updateDatabaseNotificationByID = async (
  req,
  res
) => {
  try {
    const { user } = req;
    const { tenantID, databaseNotificationID } = req.params; // Assuming `databaseNotificationID` identifies the query to update
    const { databaseNotificationTitle } = req.body;

    Logger.log("info", {
      message:
        "databaseNotificationController:updateDatabaseNotificationByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseNotificationID,
        databaseNotificationTitle,
      },
    });

    const result =
      await databaseNotificationService.updateDatabaseNotificationByID({
        userID: parseInt(user.userID),
        tenantID,
        databaseNotificationID,
        databaseNotificationTitle,
      });

    Logger.log("success", {
      message:
        "databaseNotificationController:updateDatabaseNotificationByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseNotificationID,
        databaseNotificationTitle,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Notification updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseNotificationController:updateDatabaseNotificationByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseNotificationController.deleteDatabaseNotificationByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseNotificationID } = req.params;

    Logger.log("info", {
      message: "databaseNotificationController:deleteDatabaseNotificationByID:params",
      params: { userID: user.userID, tenantID, databaseNotificationID },
    });

    await databaseNotificationService.deleteDatabaseNotificationByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseNotificationID: parseInt(databaseNotificationID),
    });

    return expressUtils.sendResponse(res, true, {
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseNotificationController:deleteDatabaseNotificationByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { databaseNotificationController };