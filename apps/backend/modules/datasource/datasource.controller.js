const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { datasourceService } = require("./datasource.service");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");
const { createClient } = require("@supabase/supabase-js");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const environmentVariables = require("../../environment");

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
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "datasourceController:getAllDatasources:params",
      params: {
        userID: user.userID,
        tenantID,
        authContext,
      },
    });

    const datasources = await datasourceService.getAllDatasources({
      userID: user.userID,
      tenantID,
      authContext,
    });

    Logger.log("success", {
      message: "datasourceController:getAllDatasources:success",
      params: {
        // datasources,
      },
    });

    return expressUtils.sendResponse(res, true, {
      datasources,
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

    return expressUtils.sendResponse(res, true, {
      datasource,
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

    return expressUtils.sendResponse(res, true, {
      datasource,
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

    Logger.log("info", {
      message: "datasourceController:cloneDatasourceByID:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
      },
    });

    await datasourceService.cloneDatasourceByID({
      userID: user.userID,
      tenantID,
      datasourceID,
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
    const filePath = `excel-csv-datasources/${tenantID}/${uniqueName}`;

    const s3AccessKeyId = environmentVariables.SUPABASE_S3_ACCESS_KEY_ID;
    const s3SecretAccessKey = environmentVariables.SUPABASE_S3_SECRET_ACCESS_KEY;
    const useS3 = s3AccessKeyId && s3AccessKeyId !== "will add manually";

    let publicUrl;
    const bucketName = useS3
      ? (environmentVariables.SUPABASE_S3_BUCKET || "jet-admin-datasource-file-uploads")
      : "tenant-assets";

    if (useS3) {
      Logger.log("info", {
        message: "datasourceController:uploadFile:s3",
        params: { bucketName, filePath },
      });

      const s3Client = new S3Client({
        endpoint: environmentVariables.SUPABASE_S3_ENDPOINT || "https://apopjzvhqwlrcykesema.storage.supabase.co/storage/v1/s3",
        region: environmentVariables.SUPABASE_S3_REGION || "ap-south-1",
        credentials: {
          accessKeyId: s3AccessKeyId,
          secretAccessKey: s3SecretAccessKey,
        },
        forcePathStyle: true,
      });

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);

      // Construct public URL
      const supabaseUrl = environmentVariables.SUPABASE_URL || "https://apopjzvhqwlrcykesema.supabase.co";
      publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
    } else {
      // Initialize Supabase Client
      const supabase = createClient(
        environmentVariables.SUPABASE_URL,
        environmentVariables.SUPABASE_ANON_KEY
      );

      // Upload to Supabase bucket
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Generate public URL
      const { data: { publicUrl: generatedUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      publicUrl = generatedUrl;
    }

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

module.exports = {
  datasourceController,
};
