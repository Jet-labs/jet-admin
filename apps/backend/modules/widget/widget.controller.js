const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { widgetService } = require("./widget.service");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

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
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "widgetController:getAllWidgets:params",
      params: {
        userID: user.userID,
        tenantID,
        authContext,
      },
    });

    const widgets = await widgetService.getAllWidgets({
      userID: user.userID,
      tenantID,
      authContext,
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
    const authContext = getServiceAuthContext(req);
    const {
      widgetTitle,
      widgetDescription,
      widgetType,
      widgetConfig,
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
        authContext,
      },
    });

    const result = await widgetService.createWidget({
      userID: user.userID,
      tenantID,
      widgetTitle,
      widgetDescription,
      widgetType,
      widgetConfig,
      authContext,
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
      userID: user.userID,
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
      userID: user.userID,
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
widgetController.updateWidgetByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, widgetID } = req.params; // Assuming `widgetID` identifies the query to update
    const {
      widgetConfig,
      widgetDescription,
      widgetTitle,
      widgetType,
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
      },
    });

    const result = await widgetService.updateWidgetByID({
      userID: user.userID,
      tenantID,
      widgetID,
      widgetConfig,
      widgetDescription,
      widgetTitle,
      widgetType,
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
        result,
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
      userID: user.userID,
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

