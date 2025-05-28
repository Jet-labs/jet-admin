const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { widgetService } = require("./widget.service");

const widgetController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
widgetController.getAllWidgets = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "widgetController:getAllWidgets:params",
      params: {
        userID: user.userID,
        tenantID,
      },
    });

    const widgets = await widgetService.getAllWidgets({
      userID: parseInt(user.userID),
      tenantID,
    });

    Logger.log("success", {
      message: "widgetController:getAllWidgets:success",
      params: {
        userID: user.userID,
        tenantID,
        widgetsLength: widgets.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      widgets,
      message: "Widgets fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:getAllWidgets:catch-1",
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
widgetController.createWidget = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const {
      widgetTitle,
      widgetDescription,
      widgetType,
      widgetConfig,
      dataQueries,
    } = req.body;

    Logger.log("info", {
      message: "widgetController:createWidget:params",
      params: {
        userID: user.userID,
        tenantID,
        widgetTitle,
        widgetDescription,
        widgetType,
        widgetConfig,
        dataQueries,
      },
    });

    const result = await widgetService.createWidget({
      userID: parseInt(user.userID),
      tenantID,
      widgetTitle,
      widgetDescription,
      widgetType,
      widgetConfig,
      dataQueries,
    });

    Logger.log("success", {
      message: "widgetController:createWidget:success",
      params: {
        userID: user.userID,
        tenantID,
        widgetTitle,
        widgetDescription,
        widgetType,
        widgetConfig,
        dataQueries,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Widget created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:createWidget:catch-1",
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
widgetController.getWidgetByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, widgetID } = req.params;
    Logger.log("info", {
      message: "widgetController:getWidgetByID:params",
      params: {
        userID: user.userID,
        tenantID,
        widgetID,
      },
    });

    const widget = await widgetService.getWidgetByID({
      userID: parseInt(user.userID),
      tenantID,
      widgetID,
    });

    Logger.log("success", {
      message: "widgetController:getWidgetByID:success",
      params: {
        userID: user.userID,
        tenantID,
        widgetID,
        widget,
      },
    });

    return expressUtils.sendResponse(res, true, {
      widget,
      message: "Widget fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:getWidgetByID:catch-1",
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
widgetController.cloneWidgetByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, widgetID } = req.params;
    Logger.log("info", {
      message: "widgetController:cloneWidgetByID:params",
      params: {
        userID: user.userID,
        tenantID,
        widgetID,
      },
    });

    await widgetService.cloneWidgetByID({
      userID: parseInt(user.userID),
      tenantID,
      widgetID,
    });

    Logger.log("success", {
      message: "widgetController:cloneWidgetByID:success",
      params: {
        userID: user.userID,
        tenantID,
        widgetID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Widget cloned successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:cloneWidgetByID:catch-1",
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
widgetController.getWidgetDataByID = async (req, res) => {
  const { user, dbPool } = req;
  const { tenantID, widgetID } = req.params;

  Logger.log("info", "widgetController:getWidgetDataByID:init", {
    userID: user.userID,
    tenantID,
    widgetID,
  });

  try {
    const widgetData = await widgetService.getWidgetDataByID({
      userID: parseInt(user.userID, 10),
      tenantID,
      dbPool,
      widgetID,
    });

    Logger.log("success", "widgetController:getWidgetDataByID:success", {
      widgetID,
      widgetData,
      userID: user.userID,
    });

    return expressUtils.sendResponse(res, true, {
      widgetData,
      message: "Widget data retrieved successfully",
    });
  } catch (error) {
    Logger.log("error", "widgetController:getWidgetDataByID:catch-1", {
      error,
      stack: error.stack,
      params: { widgetID, userID: user.userID },
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
widgetController.getWidgetDataUsingWidget = async (req, res) => {
  const { user, dbPool } = req;
  const { tenantID } = req.params;
  const widget = req.body;

  Logger.log("info", {
    message: "widgetController:getWidgetDataUsingWidget:init",
    params: {
      userID: user.userID,
      tenantID,
      widget,
    },
  });

  try {
    const widgetData = await widgetService.getWidgetDataUsingWidget({
      userID: parseInt(user.userID, 10),
      tenantID,
      dbPool,
      widget,
    });

    Logger.log("success", {
      message: "widgetController:getWidgetDataUsingWidget:success",
      params: {
        widget,
        widgetData,
        userID: user.userID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      widgetData,
      message: "Widget data retrieved successfully",
    });
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:getWidgetDataUsingWidget:catch-1",
      params: {
        error,
        stack: error.stack,
        params: { widget, userID: user.userID },
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
widgetController.updateWidgetByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, widgetID } = req.params; // Assuming `widgetID` identifies the query to update
    const {
      widgetConfig,
      widgetDescription,
      widgetTitle,
      widgetType,
      dataQueries,
    } = req.body;

    Logger.log("info", {
      message: "widgetController:updateWidgetByID:params",
      params: {
        userID: user.userID,
        tenantID,
        widgetID,
        widgetConfig,
        widgetDescription,
        widgetTitle,
        widgetType,
        dataQueries,
      },
    });

    const result = await widgetService.updateWidgetByID({
      userID: parseInt(user.userID),
      tenantID,
      widgetID,
      widgetConfig,
      widgetDescription,
      widgetTitle,
      widgetType,
      dataQueries,
    });

    Logger.log("success", {
      message: "widgetController:updateWidgetByID:success",
      params: {
        userID: user.userID,
        tenantID,
        widgetID,
        widgetConfig,
        widgetDescription,
        widgetTitle,
        widgetType,
        dataQueries,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Widget updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:updateWidgetByID:catch-1",
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
widgetController.deleteWidgetByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, widgetID } = req.params; // Assuming `widgetID` identifies the query to update

    Logger.log("info", {
      message: "widgetController:deleteWidgetByID:params",
      params: {
        userID: user.userID,
        tenantID,
        widgetID,
      },
    });

    const result = await widgetService.deleteWidgetByID({
      userID: parseInt(user.userID),
      tenantID,
      widgetID,
    });

    Logger.log("success", {
      message: "widgetController:deleteWidgetByID:success",
      params: {
        userID: user.userID,
        tenantID,
        widgetID,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Widget deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:deleteWidgetByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { widgetController };
