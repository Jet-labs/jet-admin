const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { databaseDashboardService } = require("./databaseDashboard.service");

const databaseDashboardController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseDashboardController.getAllDatabaseDashboards = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "databaseDashboardController:getAllDatabaseDashboards:params",
      params: {
        userID: user.userID,
        tenantID,
      },
    });

    const databaseDashboards = await databaseDashboardService.getAllDatabaseDashboards({
      userID: parseInt(user.userID),
      tenantID,
    });

    Logger.log("success", {
      message: "databaseDashboardController:getAllDatabaseDashboards:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseDashboardsLength: databaseDashboards.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      databaseDashboards,
      message: "Dashboards fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseDashboardController:getAllDatabaseDashboards:catch-1",
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
databaseDashboardController.createDatabaseDashboard = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const {
      databaseDashboardName,
      databaseDashboardDescription,
      databaseDashboardConfig,
    } = req.body;

    Logger.log("info", {
      message: "databaseDashboardController:createDatabaseDashboard:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseDashboardName,
        databaseDashboardDescription,
        databaseDashboardConfig,
      },
    });

    const result = await databaseDashboardService.createDatabaseDashboard({
      userID: parseInt(user.userID),
      tenantID,
      databaseDashboardName,
      databaseDashboardDescription,
      databaseDashboardConfig,
    });

    Logger.log("success", {
      message: "databaseDashboardController:createDatabaseDashboard:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseDashboardName,
        databaseDashboardDescription,
        databaseDashboardConfig,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Dashboard created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseDashboardController:createDatabaseDashboard:catch-1",
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
databaseDashboardController.getDatabaseDashboardByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseDashboardID } = req.params;
    Logger.log("info", {
      message: "databaseDashboardController:getDatabaseDashboardByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseDashboardID,
      },
    });

    const databaseDashboard =
      await databaseDashboardService.getDatabaseDashboardByID({
        userID: parseInt(user.userID),
        tenantID,
        databaseDashboardID,
      });

    Logger.log("success", {
      message: "databaseDashboardController:getDatabaseDashboardByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseDashboardID,
        databaseDashboard,
      },
    });

    return expressUtils.sendResponse(res, true, {
      databaseDashboard,
      message: "Dashboard fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseDashboardController:getDatabaseDashboardByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseDashboardController.cloneDatabaseDashboardByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseDashboardID } = req.params;
    Logger.log("info", {
      message: "databaseDashboardController:cloneDatabaseDashboardByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseDashboardID,
      },
    });

    await databaseDashboardService.cloneDatabaseDashboardByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseDashboardID,
    });

    Logger.log("success", {
      message: "databaseDashboardController:cloneDatabaseDashboardByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseDashboardID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Dashboard cloned successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseDashboardController:cloneDatabaseDashboardByID:catch-1",
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
databaseDashboardController.updateDatabaseDashboardByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseDashboardID } = req.params; // Assuming `databaseDashboardID` identifies the query to update
    const {
      databaseDashboardConfig,
      databaseDashboardDescription,
      databaseDashboardName,
    } = req.body;

    Logger.log("info", {
      message: "databaseDashboardController:updateDatabaseDashboardByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseDashboardID,
        databaseDashboardConfig,
        databaseDashboardDescription,
        databaseDashboardName,
      },
    });

    const result = await databaseDashboardService.updateDatabaseDashboardByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseDashboardID,
      databaseDashboardConfig,
      databaseDashboardDescription,
      databaseDashboardName,
    });

    Logger.log("success", {
      message:
        "databaseDashboardController:updateDatabaseDashboardByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseDashboardID,
        databaseDashboardConfig,
        databaseDashboardDescription,
        databaseDashboardName,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Dashboard updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseDashboardController:updateDatabaseDashboardByID:catch-1",
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
databaseDashboardController.deleteDatabaseDashboardByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseDashboardID } = req.params; // Assuming `databaseDashboardID` identifies the query to update

    Logger.log("info", {
      message: "databaseDashboardController:deleteDatabaseDashboardByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseDashboardID,
      },
    });

    const result = await databaseDashboardService.deleteDatabaseDashboardByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseDashboardID,
    });

    Logger.log("success", {
      message: "databaseDashboardController:deleteDatabaseDashboardByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseDashboardID,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Dashboard deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseDashboardController:deleteDatabaseDashboardByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { databaseDashboardController };
