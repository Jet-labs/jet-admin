const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { databaseChartService } = require("./databaseChart.service");

const databaseChartController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseChartController.getAllDatabaseCharts = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "databaseChartController:getAllDatabaseCharts:params",
      params: {
        userID: user.userID,
        tenantID,
      },
    });

    const databaseCharts = await databaseChartService.getAllDatabaseCharts({
      userID: parseInt(user.userID),
      tenantID,
    });

    Logger.log("success", {
      message: "databaseChartController:getAllDatabaseCharts:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseChartsLength: databaseCharts.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      databaseCharts,
      message: "Charts fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartController:getAllDatabaseCharts:catch-1",
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
databaseChartController.createDatabaseChart = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const {
      databaseChartName,
      databaseChartDescription,
      databaseChartType,
      databaseChartConfig,
      databaseQueries,
    } = req.body;

    Logger.log("info", {
      message: "databaseChartController:createDatabaseChart:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseChartName,
        databaseChartDescription,
        databaseChartType,
        databaseChartConfig,
        databaseQueries,
      },
    });

    const result = await databaseChartService.createDatabaseChart({
      userID: parseInt(user.userID),
      tenantID,
      databaseChartName,
      databaseChartDescription,
      databaseChartType,
      databaseChartConfig,
      databaseQueries,
    });

    Logger.log("success", {
      message: "databaseChartController:createDatabaseChart:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseChartName,
        databaseChartDescription,
        databaseChartType,
        databaseChartConfig,
        databaseQueries,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Chart created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartController:createDatabaseChart:catch-1",
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
databaseChartController.getDatabaseChartByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseChartID } = req.params;
    Logger.log("info", {
      message: "databaseChartController:getDatabaseChartByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseChartID,
      },
    });

    const databaseChart = await databaseChartService.getDatabaseChartByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseChartID,
    });

    Logger.log("success", {
      message: "databaseChartController:getDatabaseChartByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseChartID,
        databaseChart,
      },
    });

    return expressUtils.sendResponse(res, true, {
      databaseChart,
      message: "Chart fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartController:getDatabaseChartByID:catch-1",
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
databaseChartController.getDatabaseChartDataByID = async (req, res) => {
  const { user, dbPool } = req;
  const { tenantID, databaseChartID } = req.params;

  Logger.log("info", "databaseChartController:getDatabaseChartDataByID:init", {
    userID: user.userID,
    tenantID,
    databaseChartID,
  });

  try {
    const databaseChartData =
      await databaseChartService.getDatabaseChartDataByID({
        userID: parseInt(user.userID, 10),
        tenantID,
        dbPool,
        databaseChartID,
      });

    Logger.log(
      "success",
      "databaseChartController:getDatabaseChartDataByID:success",
      {
        databaseChartID,
        userID: user.userID,
      }
    );

    return expressUtils.sendResponse(res, true, {
      databaseChartData,
      message: "Chart data retrieved successfully",
    });
  } catch (error) {
    Logger.log(
      "error",
      "databaseChartController:getDatabaseChartDataByID:catch-1",
      {
        error: error.message,
        stack: error.stack,
        params: { databaseChartID, userID: user.userID },
      }
    );
    return expressUtils.sendResponse(
      res,
      false,
      null,
      "Failed to retrieve chart data"
    );
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseChartController.getDatabaseChartDataUsingDatabaseChart = async (
  req,
  res
) => {
  const { user, dbPool } = req;
  const { tenantID } = req.params;
  const databaseChart = req.body;

  Logger.log("info", {
    message:
      "databaseChartController:getDatabaseChartDataUsingDatabaseChart:init",
    params: {
      userID: user.userID,
      tenantID,
      databaseChart,
    },
  });

  try {
    const databaseChartData =
      await databaseChartService.getDatabaseChartDataUsingDatabaseChart({
        userID: parseInt(user.userID, 10),
        tenantID,
        dbPool,
        databaseChart,
      });

    Logger.log("success", {
      message:
        "databaseChartController:getDatabaseChartDataUsingDatabaseChart:success",
      params: {
        databaseChart,
        userID: user.userID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      databaseChartData,
      message: "Chart data retrieved successfully",
    });
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseChartController:getDatabaseChartDataUsingDatabaseChart:catch-1",
      params: {
        error: error.message,
        stack: error.stack,
        params: { databaseChart, userID: user.userID },
      },
    });
    return expressUtils.sendResponse(
      res,
      false,
      null,
      "Failed to retrieve chart data"
    );
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseChartController.updateDatabaseChartByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseChartID } = req.params; // Assuming `databaseChartID` identifies the query to update
    const {
      databaseChartConfig,
      databaseChartDescription,
      databaseChartName,
      databaseChartType,
      databaseQueries,
    } = req.body;

    Logger.log("info", {
      message: "databaseChartController:updateDatabaseChartByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseChartID,
        databaseChartConfig,
        databaseChartDescription,
        databaseChartName,
        databaseChartType,
        databaseQueries,
      },
    });

    const result = await databaseChartService.updateDatabaseChartByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseChartID,
      databaseChartConfig,
      databaseChartDescription,
      databaseChartName,
      databaseChartType,
      databaseQueries,
    });

    Logger.log("success", {
      message: "databaseChartController:updateDatabaseChartByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseChartID,
        databaseChartConfig,
        databaseChartDescription,
        databaseChartName,
        databaseChartType,
        databaseQueries,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Chart updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartController:updateDatabaseChartByID:catch-1",
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
databaseChartController.deleteDatabaseChartByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseChartID } = req.params; // Assuming `databaseChartID` identifies the query to update

    Logger.log("info", {
      message: "databaseChartController:deleteDatabaseChartByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseChartID,
      },
    });

    const result = await databaseChartService.deleteDatabaseChartByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseChartID,
    });

    Logger.log("success", {
      message: "databaseChartController:deleteDatabaseChartByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseChartID,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Chart deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartController:deleteDatabaseChartByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { databaseChartController };
