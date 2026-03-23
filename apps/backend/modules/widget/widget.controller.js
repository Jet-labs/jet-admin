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
      workflowID,
      workflowConfig,
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
        workflowID,
        workflowConfig,
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
      workflowID,
      workflowConfig,
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
        workflowID,
        workflowConfig,
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
widgetController.getWidgetDataByID = async (req, res) => {
  const { user } = req;
  const { tenantID, widgetID } = req.params;
  const { executionMode } = req.query;
  const inputArgs = req.body?.inputArgs || {};
  const authContext = getServiceAuthContext(req);

  Logger.log("info", {
    message: "widgetController:getWidgetDataByID:init",
    params: {
      userID: user.userID,
      tenantID,
      widgetID,
      executionMode,
      inputArgs,
    },
  });

  try {
    const widgetData = await widgetService.getWidgetDataByID({
      authContext,
      tenantID,
      widgetID,
      executionMode,
      inputArgs,
    });

    Logger.log("success", {
      message: "widgetController:getWidgetDataByID:success",
      params: {
        widgetID,
        userID: user.userID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      widgetData,
      message: "Widget data retrieved successfully",
    });
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:getWidgetDataByID:catch-1",
      params: {
        error,
        widgetID,
        userID: user.userID,
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
widgetController.getWidgetDataUsingWidget = async (req, res) => {
  const { user } = req;
  const { tenantID } = req.params;
  const widget = req.body;
  const { executionMode } = req.query;
  const inputArgs = req.body?.inputArgs || {};
  const authContext = getServiceAuthContext(req);

  Logger.log("info", {
    message: "widgetController:getWidgetDataUsingWidget:init",
    params: {
      userID: user.userID,
      tenantID,
      widget,
      executionMode,
      inputArgs,
    },
  });

  try {
    const widgetData = await widgetService.getWidgetDataUsingWidget({
      authContext,
      tenantID,
      widget,
      executionMode,
      inputArgs,
    });

    Logger.log("success", {
      message: "widgetController:getWidgetDataUsingWidget:success",
      params: {
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
        userID: user.userID,
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
      workflowID,
      workflowConfig,
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
        workflowID,
        workflowConfig,
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
      workflowID,
      workflowConfig,
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
        workflowID,
        workflowConfig,
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

/**
 * Get workflow context schema for widget binding
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
widgetController.getWidgetWorkflowSchema = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, widgetID } = req.params;

    Logger.log("info", {
      message: "widgetController:getWidgetWorkflowSchema:params",
      params: { userID: user.userID, tenantID, widgetID },
    });

    const { widgetSocketController } = require("./widget.socket.controller");

    // Get widget to find associated workflow
    const widget = await widgetService.getWidgetByID({
      userID: user.userID,
      tenantID,
      widgetID,
    });

    if (!widget || !widget.workflowID) {
      return expressUtils.sendResponse(res, false, {}, "Widget has no associated workflow");
    }

    // Get workflow schema
    const schema = await widgetSocketController.getWorkflowContextSchema({
      workflowID: widget.workflowID,
      tenantID,
    });

    Logger.log("success", {
      message: "widgetController:getWidgetWorkflowSchema:success",
      params: { widgetID, workflowID: widget.workflowID },
    });

    return expressUtils.sendResponse(res, true, {
      schema,
      message: "Workflow schema retrieved successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:getWidgetWorkflowSchema:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Get widget-workflow bridge connection stats (admin/debug)
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
widgetController.getWidgetBridgeStats = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;

    Logger.log("info", {
      message: "widgetController:getWidgetBridgeStats:params",
      params: { userID: user.userID, tenantID },
    });

    const { widgetWorkflowBridge } = require("./widgetWorkflowBridge");
    const stats = widgetWorkflowBridge.getStats();

    Logger.log("success", {
      message: "widgetController:getWidgetBridgeStats:success",
      params: { stats },
    });

    return expressUtils.sendResponse(res, true, {
      stats,
      message: "Bridge stats retrieved successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:getWidgetBridgeStats:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { widgetController };
