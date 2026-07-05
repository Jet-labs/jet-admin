const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { widgetService } = require("./widget.service");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");
const fileStorageUtil = require("../../utils/fileStorage.util");
const environmentVariables = require("../../environment");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

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
    const { search, page, pageSize } = req.query;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "widgetController:getAllWidgets:params",
      params: {
        userID: user.userID,
        tenantID,
        search,
        page,
        pageSize,
        authContext,
      },
    });

    const result = await widgetService.getAllWidgets({
      userID: user.userID,
      tenantID,
      search,
      page,
      pageSize,
      authContext,
    });

    Logger.log("success", {
      message: "widgetController:getAllWidgets:success",
      params: {
        userID: user.userID,
        tenantID,
        widgetsLength: result.widgets.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      widgets: result.widgets,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      page: result.page,
      pageSize: result.pageSize,
      message: "Widgets fetched successfully.",
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:getAllWidgets:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
      widget: result,
      message: "Widget created successfully.",
    }, null, constants.HTTP_STATUS.CREATED);
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:createWidget:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:getWidgetByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "widgetController:cloneWidgetByID:params",
      params: {
        userID: user.userID,
        tenantID,
        widgetID,
        authContext,
      },
    });

    await widgetService.cloneWidgetByID({
      userID: user.userID,
      tenantID,
      widgetID,
      authContext,
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
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:cloneWidgetByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:updateWidgetByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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

    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "widgetController:deleteWidgetByID:params",
      params: {
        userID: user.userID,
        tenantID,
        widgetID,
        authContext,
      },
    });

    const result = await widgetService.deleteWidgetByID({
      userID: user.userID,
      tenantID,
      widgetID,
      authContext,
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
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:deleteWidgetByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Uploads a widget file (Image/Document) to Supabase storage.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
widgetController.uploadFile = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const file = req.file;

    if (!file) {
      throw new Error("No file uploaded.");
    }

    Logger.log("info", {
      message: "widgetController:uploadFile:params",
      params: {
        tenantID,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
      },
    });

    // Create unique filename and upload path
    const uniqueName = `${Date.now()}-${file.originalname}`;
    const filePath = `${constants.STORAGE.FOLDERS.WIDGET_FILES}/${tenantID}/${uniqueName}`;

    // Upload to default bucket and get the public URL
    const publicUrl = await fileStorageUtil.uploadFile(file.buffer, file.mimetype, filePath);

    Logger.log("success", {
      message: "widgetController:uploadFile:success",
      params: {
        url: publicUrl,
        filePath,
      },
    });

    return expressUtils.sendResponse(res, true, {
      url: publicUrl,
      filePath,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:uploadFile:error",
      params: {
        error: error.message || error,
      },
    });
    return expressUtils.sendResponse(res, false, {}, error.message || error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Serves a file from S3 using a proxy endpoint.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
widgetController.serveFile = async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      Logger.log("error", {
        message: "widgetController:serveFile:missingPath",
        params: { tenantID: req.params.tenantID },
      });
      return expressUtils.sendResponse(res, false, {}, { code: "INVALID_REQUEST", message: "Path is required" }, constants.HTTP_STATUS.BAD_REQUEST);
    }

    const tenantID = req.params.tenantID;
    if (!tenantID) {
      Logger.log("error", {
        message: "widgetController:serveFile:missingTenant",
        params: {},
      });
      return expressUtils.sendResponse(res, false, {}, { code: "INVALID_REQUEST", message: "Tenant ID is required" }, constants.HTTP_STATUS.BAD_REQUEST);
    }

    const expectedPrefix = `${constants.STORAGE.FOLDERS.WIDGET_FILES}/${tenantID}/`;
    if (!filePath.startsWith(expectedPrefix)) {
      Logger.log("error", {
        message: "widgetController:serveFile:invalidPath",
        params: { tenantID, filePath },
      });
      return expressUtils.sendResponse(res, false, {}, { code: "PERMISSION_DENIED", message: "Forbidden: Invalid file path for this tenant" }, constants.HTTP_STATUS.BAD_REQUEST);
    }

    const bucketName = environmentVariables.SUPABASE_S3_BUCKET || constants.STORAGE.BUCKETS.DATASOURCE_FILE_UPLOADS;
    const s3 = fileStorageUtil.getS3Client();

    const command = new GetObjectCommand({ Bucket: bucketName, Key: filePath });
    const s3Res = await s3.send(command);

    res.setHeader("Content-Type", s3Res.ContentType || "application/octet-stream");
    // Ensure CORS headers are present if needed, though they should be handled by middleware
    s3Res.Body.pipe(res);
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:serveFile:error",
      params: { error: error.message || error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { widgetController };
