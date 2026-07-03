const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { datasourceService } = require("./datasource.service");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");
const { createClient } = require("@supabase/supabase-js");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const environmentVariables = require("../../environment");
const fileStorageUtil = require("../../utils/fileStorage.util");

const maskSensitiveOptions = (options) => {
  if (!options) return options;
  const masked = { ...options };
  const sensitiveKeys = ["password", "secret", "token", "private_key", "apiKey", "key", "passphrase"];
  for (const k of Object.keys(masked)) {
    if (sensitiveKeys.some(sk => k.toLowerCase().includes(sk))) {
      masked[k] = "●●●●●●●●";
    } else if (typeof masked[k] === "object" && masked[k] !== null) {
      masked[k] = maskSensitiveOptions(masked[k]);
    }
  }
  return masked;
};

const datasourceController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.getAllDatasources = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { search, page, pageSize } = req.query;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "datasourceController:getAllDatasources:params",
      params: {
        userID: user.userID,
        tenantID,
        search,
        page,
        pageSize,
        authContext,
      },
    });

    const result = await datasourceService.getAllDatasources({
      userID: user.userID,
      tenantID,
      search,
      page,
      pageSize,
      authContext,
    });

    Logger.log("success", {
      message: "datasourceController:getAllDatasources:success",
      params: {
        userID: user.userID,
        tenantID,
        datasourcesLength: result.datasources.length,
      },
    });

    const sanitizedDatasources = result.datasources.map((d) => ({
      ...d,
      datasourceOptions: maskSensitiveOptions(d.datasourceOptions),
    }));

    return expressUtils.sendResponse(res, true, {
      datasources: sanitizedDatasources,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      page: result.page,
      pageSize: result.pageSize,
      message: "Datasources fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:getAllDatasources:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.testDatasourceConnection = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { datasourceType, datasourceOptions } = req.body;

    Logger.log("info", {
      message: "datasourceController:testDatasourceConnection:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceType,
        datasourceOptions,
      },
    });

    const connectionResult = await datasourceService.testDatasourceConnection({
      userID: user.userID,
      tenantID,
      datasourceType,
      datasourceOptions,
    });

    Logger.log("success", {
      message: "datasourceController:testDatasourceConnection:success",
      params: {
        connectionResult,
      },
    });
    return expressUtils.sendResponse(res, true, {
      connectionResult,
      message: "Datasource connection tested successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:testDatasourceConnection:error",
      params: {
        error,
      },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.getDatasourceByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, datasourceID } = req.params;

    Logger.log("info", {
      message: "datasourceController:getDatasourceByID:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
      },
    });

    const datasource = await datasourceService.getDatasourceByID({
      userID: user.userID,
      tenantID,
      datasourceID,
    });

    Logger.log("success", {
      message: "datasourceController:getDatasourceByID:success",
      params: {
        datasource,
      },
    });

    const sanitizedDatasource = datasource ? {
      ...datasource,
      datasourceOptions: maskSensitiveOptions(datasource.datasourceOptions),
    } : null;

    return expressUtils.sendResponse(res, true, {
      datasource: sanitizedDatasource,
      message: "Datasource fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:getDatasourceByID:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.createDatasource = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const authContext = getServiceAuthContext(req);
    const {
      datasourceTitle,
      datasourceDescription,
      datasourceType,
      datasourceOptions,
      datasourceTags,
    } = req.body;

    Logger.log("info", {
      message: "datasourceController:createDatasource:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceTitle,
        datasourceDescription,
        datasourceType,
        datasourceOptions,
        datasourceTags,
        authContext,
      },
    });

    const datasource = await datasourceService.createDatasource({
      userID: user.userID,
      tenantID,
      datasourceTitle,
      datasourceDescription,
      datasourceType,
      datasourceOptions,
      datasourceTags,
      authContext,
    });

    Logger.log("success", {
      message: "datasourceController:createDatasource:success",
      params: {
        datasource,
      },
    });

    const sanitizedDatasource = datasource ? {
      ...datasource,
      datasourceOptions: maskSensitiveOptions(datasource.datasourceOptions),
    } : null;

    return expressUtils.sendResponse(res, true, {
      datasource: sanitizedDatasource,
      message: "Datasource created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:createDatasource:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.updateDatasourceByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, datasourceID } = req.params;
    const {
      datasourceTitle,
      datasourceDescription,
      datasourceType,
      datasourceOptions,
      datasourceTags,
    } = req.body;

    Logger.log("info", {
      message: "datasourceController:updateDatasourceByID:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
        datasourceTitle,
        datasourceDescription,
        datasourceType,
        datasourceOptions,
        datasourceTags,
      },
    });

    const datasource = await datasourceService.updateDatasourceByID({
      userID: user.userID,
      tenantID,
      datasourceID,
      datasourceTitle,
      datasourceDescription,
      datasourceType,
      datasourceOptions,
      datasourceTags,
    });

    Logger.log("success", {
      message: "datasourceController:updateDatasourceByID:success",
      params: {
        datasource,
      },
    });

    return expressUtils.sendResponse(res, true, {
      datasource,
      message: "Datasource updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:updateDatasourceByID:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.deleteDatasourceByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, datasourceID } = req.params;

    Logger.log("info", {
      message: "datasourceController:deleteDatasourceByID:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
      },
    });

    await datasourceService.deleteDatasourceByID({
      userID: user.userID,
      tenantID,
      datasourceID,
    });

    Logger.log("success", {
      message: "datasourceController:deleteDatasourceByID:success",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Datasource deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:deleteDatasourceByID:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.cloneDatasourceByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, datasourceID } = req.params;
    const authContext = getServiceAuthContext(req);

    Logger.log("info", {
      message: "datasourceController:cloneDatasourceByID:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
        authContext,
      },
    });

    await datasourceService.cloneDatasourceByID({
      userID: user.userID,
      tenantID,
      datasourceID,
      authContext,
    });

    Logger.log("success", {
      message: "datasourceController:cloneDatasourceByID:success",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Datasource cloned successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:cloneDatasourceByID:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Uploads a datasource file (Excel/CSV) to Supabase storage.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.uploadFile = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const file = req.file;

    if (!file) {
      throw new Error("No file uploaded.");
    }

    // Validate file extensions
    const fileExt = file.originalname.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileExt)) {
      throw new Error("Invalid file type. Only CSV, XLSX, and XLS files are allowed.");
    }

    Logger.log("info", {
      message: "datasourceController:uploadFile:params",
      params: {
        tenantID,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
      },
    });

    // Create unique filename and upload path
    const uniqueName = `${Date.now()}-${file.originalname}`;
    const filePath = `${constants.STORAGE.FOLDERS.EXCEL_CSV_DATASOURCES}/${tenantID}/${uniqueName}`;

    const publicUrl = await fileStorageUtil.uploadFile(file.buffer, file.mimetype, filePath);

    Logger.log("success", {
      message: "datasourceController:uploadFile:success",
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
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:uploadFile:error",
      params: {
        error: error.message || error,
      },
    });
    return expressUtils.sendResponse(res, false, {}, error.message || error);
  }
};

/**
 * Proxies an action call to an instantiated DataSource class.
 *
 * Dedicated editors use this endpoint to call datasource-specific helper methods
 * (e.g. listSpreadsheets, listSheets, previewData) without exposing credentials
 * to the frontend.
 *
 * POST /api/v1/tenants/:tenantID/datasources/:datasourceID/proxy
 * Body: { action: "listSpreadsheets", params: { query: "Budget", pageToken: null } }
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.proxyDatasourceAction = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, datasourceID } = req.params;
    const { action, params } = req.body;

    Logger.log("info", {
      message: "datasourceController:proxyDatasourceAction:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
        action,
        params,
      },
    });

    if (!action || typeof action !== "string") {
      throw new Error("Missing or invalid 'action' in request body.");
    }

    const result = await datasourceService.proxyDatasourceAction({
      userID: user.userID,
      tenantID,
      datasourceID,
      action,
      params: params || {},
    });

    Logger.log("success", {
      message: "datasourceController:proxyDatasourceAction:success",
      params: { action, datasourceID },
    });

    return expressUtils.sendResponse(res, true, {
      result,
      message: `Proxy action '${action}' executed successfully.`,
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:proxyDatasourceAction:error",
      params: {
        error: error.message || error,
      },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = {
  datasourceController,
};
