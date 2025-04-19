const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { databaseWidgetService } = require("./databaseWidget.service");

const databaseWidgetController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseWidgetController.getAllDatabaseWidgets = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "databaseWidgetController:getAllDatabaseWidgets:params",
      params: {
        userID: user.userID,
        tenantID,
      },
    });

    const databaseWidgets = await databaseWidgetService.getAllDatabaseWidgets({
      userID: parseInt(user.userID),
      tenantID,
    });

    Logger.log("success", {
      message: "databaseWidgetController:getAllDatabaseWidgets:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseWidgetsLength: databaseWidgets.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      databaseWidgets,
      message: "Widgets fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseWidgetController:getAllDatabaseWidgets:catch-1",
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
databaseWidgetController.createDatabaseWidget = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const {
      databaseWidgetName,
      databaseWidgetDescription,
      databaseWidgetType,
      databaseWidgetConfig,
      databaseQueries,
    } = req.body;

    Logger.log("info", {
      message: "databaseWidgetController:createDatabaseWidget:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseWidgetName,
        databaseWidgetDescription,
        databaseWidgetType,
        databaseWidgetConfig,
        databaseQueries,
      },
    });

    const result = await databaseWidgetService.createDatabaseWidget({
      userID: parseInt(user.userID),
      tenantID,
      databaseWidgetName,
      databaseWidgetDescription,
      databaseWidgetType,
      databaseWidgetConfig,
      databaseQueries,
    });

    Logger.log("success", {
      message: "databaseWidgetController:createDatabaseWidget:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseWidgetName,
        databaseWidgetDescription,
        databaseWidgetType,
        databaseWidgetConfig,
        databaseQueries,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Widget created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseWidgetController:createDatabaseWidget:catch-1",
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
databaseWidgetController.getDatabaseWidgetByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseWidgetID } = req.params;
    Logger.log("info", {
      message: "databaseWidgetController:getDatabaseWidgetByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseWidgetID,
      },
    });

    const databaseWidget = await databaseWidgetService.getDatabaseWidgetByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseWidgetID,
    });

    Logger.log("success", {
      message: "databaseWidgetController:getDatabaseWidgetByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseWidgetID,
        databaseWidget,
      },
    });

    return expressUtils.sendResponse(res, true, {
      databaseWidget,
      message: "Widget fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseWidgetController:getDatabaseWidgetByID:catch-1",
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
databaseWidgetController.getDatabaseWidgetDataByID = async (req, res) => {
  const { user, dbPool } = req;
  const { tenantID, databaseWidgetID } = req.params;

  Logger.log(
    "info",
    "databaseWidgetController:getDatabaseWidgetDataByID:init",
    {
      userID: user.userID,
      tenantID,
      databaseWidgetID,
    }
  );

  try {
    const databaseWidgetData =
      await databaseWidgetService.getDatabaseWidgetDataByID({
        userID: parseInt(user.userID, 10),
        tenantID,
        dbPool,
        databaseWidgetID,
      });

    Logger.log(
      "success",
      "databaseWidgetController:getDatabaseWidgetDataByID:success",
      {
        databaseWidgetID,
        userID: user.userID,
      }
    );

    return expressUtils.sendResponse(res, true, {
      databaseWidgetData,
      message: "Widget data retrieved successfully",
    });
  } catch (error) {
    Logger.log(
      "error",
      "databaseWidgetController:getDatabaseWidgetDataByID:catch-1",
      {
        error,
        stack: error.stack,
        params: { databaseWidgetID, userID: user.userID },
      }
    );
    return expressUtils.sendResponse(
      res,
      false,
      null,
      "Failed to retrieve widget data"
    );
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseWidgetController.getDatabaseWidgetDataUsingDatabaseWidget = async (
  req,
  res
) => {
  const { user, dbPool } = req;
  const { tenantID } = req.params;
  const databaseWidget = req.body;

  Logger.log("info", {
    message:
      "databaseWidgetController:getDatabaseWidgetDataUsingDatabaseWidget:init",
    params: {
      userID: user.userID,
      tenantID,
      databaseWidget,
    },
  });

  try {
    const databaseWidgetData =
      await databaseWidgetService.getDatabaseWidgetDataUsingDatabaseWidget({
        userID: parseInt(user.userID, 10),
        tenantID,
        dbPool,
        databaseWidget,
      });

    Logger.log("success", {
      message:
        "databaseWidgetController:getDatabaseWidgetDataUsingDatabaseWidget:success",
      params: {
        databaseWidget,
        userID: user.userID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      databaseWidgetData,
      message: "Widget data retrieved successfully",
    });
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseWidgetController:getDatabaseWidgetDataUsingDatabaseWidget:catch-1",
      params: {
        error,
        stack: error.stack,
        params: { databaseWidget, userID: user.userID },
      },
    });
    return expressUtils.sendResponse(
      res,
      false,
      null,
      "Failed to retrieve widget data"
    );
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseWidgetController.updateDatabaseWidgetByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseWidgetID } = req.params; // Assuming `databaseWidgetID` identifies the query to update
    const {
      databaseWidgetConfig,
      databaseWidgetDescription,
      databaseWidgetName,
      databaseWidgetType,
      databaseQueries,
    } = req.body;

    Logger.log("info", {
      message: "databaseWidgetController:updateDatabaseWidgetByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseWidgetID,
        databaseWidgetConfig,
        databaseWidgetDescription,
        databaseWidgetName,
        databaseWidgetType,
        databaseQueries,
      },
    });

    const result = await databaseWidgetService.updateDatabaseWidgetByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseWidgetID,
      databaseWidgetConfig,
      databaseWidgetDescription,
      databaseWidgetName,
      databaseWidgetType,
      databaseQueries,
    });

    Logger.log("success", {
      message: "databaseWidgetController:updateDatabaseWidgetByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseWidgetID,
        databaseWidgetConfig,
        databaseWidgetDescription,
        databaseWidgetName,
        databaseWidgetType,
        databaseQueries,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Widget updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseWidgetController:updateDatabaseWidgetByID:catch-1",
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
databaseWidgetController.deleteDatabaseWidgetByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseWidgetID } = req.params; // Assuming `databaseWidgetID` identifies the query to update

    Logger.log("info", {
      message: "databaseWidgetController:deleteDatabaseWidgetByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseWidgetID,
      },
    });

    const result = await databaseWidgetService.deleteDatabaseWidgetByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseWidgetID,
    });

    Logger.log("success", {
      message: "databaseWidgetController:deleteDatabaseWidgetByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseWidgetID,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Widget deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseWidgetController:deleteDatabaseWidgetByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { databaseWidgetController };
