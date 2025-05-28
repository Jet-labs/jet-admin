const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { dashboardService } = require("./dashboard.service");

const dashboardController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
dashboardController.getAllDashboards = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "dashboardController:getAllDashboards:params",
      params: {
        userID: user.userID,
        tenantID,
      },
    });

    const dashboards = await dashboardService.getAllDashboards({
      userID: parseInt(user.userID),
      tenantID,
    });

    Logger.log("success", {
      message: "dashboardController:getAllDashboards:success",
      params: {
        userID: user.userID,
        tenantID,
        dashboardsLength: dashboards.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      dashboards,
      message: "Dashboards fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardController:getAllDashboards:catch-1",
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
dashboardController.createDashboard = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { dashboardTitle, dashboardDescription, dashboardConfig } = req.body;

    Logger.log("info", {
      message: "dashboardController:createDashboard:params",
      params: {
        userID: user.userID,
        tenantID,
        dashboardTitle,
        dashboardDescription,
        dashboardConfig,
      },
    });

    const result = await dashboardService.createDashboard({
      userID: parseInt(user.userID),
      tenantID,
      dashboardTitle,
      dashboardDescription,
      dashboardConfig,
    });

    Logger.log("success", {
      message: "dashboardController:createDashboard:success",
      params: {
        userID: user.userID,
        tenantID,
        dashboardTitle,
        dashboardDescription,
        dashboardConfig,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Dashboard created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardController:createDashboard:catch-1",
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
dashboardController.getDashboardByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, dashboardID } = req.params;
    Logger.log("info", {
      message: "dashboardController:getDashboardByID:params",
      params: {
        userID: user.userID,
        tenantID,
        dashboardID,
      },
    });

    const dashboard = await dashboardService.getDashboardByID({
      userID: parseInt(user.userID),
      tenantID,
      dashboardID,
    });

    Logger.log("success", {
      message: "dashboardController:getDashboardByID:success",
      params: {
        userID: user.userID,
        tenantID,
        dashboardID,
        dashboard,
      },
    });

    return expressUtils.sendResponse(res, true, {
      dashboard,
      message: "Dashboard fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardController:getDashboardByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
dashboardController.cloneDashboardByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, dashboardID } = req.params;
    Logger.log("info", {
      message: "dashboardController:cloneDashboardByID:params",
      params: {
        userID: user.userID,
        tenantID,
        dashboardID,
      },
    });

    await dashboardService.cloneDashboardByID({
      userID: parseInt(user.userID),
      tenantID,
      dashboardID,
    });

    Logger.log("success", {
      message: "dashboardController:cloneDashboardByID:success",
      params: {
        userID: user.userID,
        tenantID,
        dashboardID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Dashboard cloned successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardController:cloneDashboardByID:catch-1",
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
dashboardController.updateDashboardByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, dashboardID } = req.params; // Assuming `dashboardID` identifies the query to update
    const { dashboardConfig, dashboardDescription, dashboardTitle } = req.body;

    Logger.log("info", {
      message: "dashboardController:updateDashboardByID:params",
      params: {
        userID: user.userID,
        tenantID,
        dashboardID,
        dashboardConfig,
        dashboardDescription,
        dashboardTitle,
      },
    });

    const result = await dashboardService.updateDashboardByID({
      userID: parseInt(user.userID),
      tenantID,
      dashboardID,
      dashboardConfig,
      dashboardDescription,
      dashboardTitle,
    });

    Logger.log("success", {
      message: "dashboardController:updateDashboardByID:success",
      params: {
        userID: user.userID,
        tenantID,
        dashboardID,
        dashboardConfig,
        dashboardDescription,
        dashboardTitle,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Dashboard updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardController:updateDashboardByID:catch-1",
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
dashboardController.deleteDashboardByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, dashboardID } = req.params; // Assuming `dashboardID` identifies the query to update

    Logger.log("info", {
      message: "dashboardController:deleteDashboardByID:params",
      params: {
        userID: user.userID,
        tenantID,
        dashboardID,
      },
    });

    const result = await dashboardService.deleteDashboardByID({
      userID: parseInt(user.userID),
      tenantID,
      dashboardID,
    });

    Logger.log("success", {
      message: "dashboardController:deleteDashboardByID:success",
      params: {
        userID: user.userID,
        tenantID,
        dashboardID,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Dashboard deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardController:deleteDashboardByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { dashboardController };
