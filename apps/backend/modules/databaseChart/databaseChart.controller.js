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
databaseChartController.generateAIPromptBasedChart = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { tenantID } = req.params;
    const { aiPrompt } = req.body;
    Logger.log("info", {
      message: "databaseChartController:generateAIPromptBasedChart:params",
      params: {
        userID: user.userID,
        tenantID,
        aiPrompt,
      },
    });

    const databaseChartData =
      await databaseChartService.generateAIPromptBasedChart({
        userID: parseInt(user.userID),
        tenantID,
        aiPrompt,
        dbPool,
      });

    Logger.log("success", {
      message: "databaseChartController:generateAIPromptBasedChart:success",
      params: {
        userID: user.userID,
        tenantID,
        aiPrompt,
        databaseChartData,
      },
    });

    return expressUtils.sendResponse(res, true, { databaseChartData });
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartController:generateAIPromptBasedChart:catch-1",
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
databaseChartController.generateAIPromptBasedChartStyle = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { tenantID } = req.params;
    const { aiPrompt, databaseChartData:inputDatabaseChartData } = req.body;
    Logger.log("info", {
      message: "databaseChartController:generateAIPromptBasedChartStyle:params",
      params: {
        userID: user.userID,
        tenantID,
        aiPrompt,
      },
    });

    const databaseChartData =
      await databaseChartService.generateAIPromptBasedChartStyle({
        userID: parseInt(user.userID),
        tenantID,
        aiPrompt,
        dbPool,
        databaseChartData:inputDatabaseChartData
      });

    Logger.log("success", {
      message: "databaseChartController:generateAIPromptBasedChartStyle:success",
      params: {
        userID: user.userID,
        tenantID,
        aiPrompt,
        databaseChartData,
      },
    });

    return expressUtils.sendResponse(res, true, { databaseChartData });
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartController:generateAIPromptBasedChartStyle:catch-1",
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
        error,
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

module.exports = { databaseChartController };
