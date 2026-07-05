const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { tenantService } = require("./tenant.service");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

const tenantController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tenantController.getUserTenantByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "tenantController:getUserTenantByID:params",
      params: { userID: user.userID, tenantID, authContext },
    });
    const tenant = await tenantService.getUserTenantByID({
      userID: user.userID,
      tenantID: tenantID,
      authContext,
    });
    Logger.log("success", {
      message: "tenantController:getUserTenantByID:tenant",
      params: { tenant: tenant.tenantID },
    });
    return expressUtils.sendResponse(res, true, { tenant });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:getUserTenantByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tenantController.deleteUserTenantByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "tenantController:deleteUserTenantByID:params",
      params: { userID: user.userID, tenantID },
    });
    await tenantService.deleteUserTenantByID({
      userID: user.userID,
      tenantID: tenantID,
    });
    Logger.log("success", {
      message: "tenantController:deleteUserTenantByID:success",
      params: { userID: user.userID, tenantID },
    });
    return expressUtils.sendResponse(res, true, {});
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:deleteUserTenantByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tenantController.getAllUserTenants = async (req, res) => {
  try {
    const { user } = req;
    Logger.log("info", {
      message: "tenantController:getAllUserTenants:params",
      params: { userID: user.userID },
    });
    const tenants = await tenantService.getAllUserTenants({
      userID: user.userID,
    });
    Logger.log("success", {
      message: "tenantController:getAllUserTenants:tenantsLength",
      params: { tenantsLength: tenants.length },
    });
    return expressUtils.sendResponse(res, true, { tenants });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:getAllUserTenants:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tenantController.createNewTenant = async (req, res) => {
  try {
    const { user } = req;
    const { tenantTitle, tenantLogoURL } = req.body;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "tenantController:createNewTenant:params",
      params: {
        userID: user.userID,
        tenantTitle,
        tenantLogoURL,
        authContext,
      },
    });
    const newTenant = await tenantService.createTenant({
      userID: user.userID,
      tenantTitle,
      tenantLogoURL,
      authContext,
    });
    Logger.log("success", {
      message: "tenantController:createNewTenant:createdNewTenant",
      params: { newTenant },
    });
    return expressUtils.sendResponse(res, true, { tenant: newTenant });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:createNewTenant:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};



/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tenantController.updateTenant = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { tenantTitle, tenantLogoURL } = req.body;
    Logger.log("info", {
      message: "tenantController:updateTenant:params",
      params: {
        userID: user.userID,
        tenantID,
        tenantTitle,
        tenantLogoURL,
      },
    });
    const updatedTenant = await tenantService.updateTenant({
      userID: user.userID,
      tenantID: tenantID,
      tenantTitle,
      tenantLogoURL,
    });
    Logger.log("success", {
      message: "tenantController:updateTenant:updatedTenant",
      params: { updatedTenant },
    });
    return expressUtils.sendResponse(res, true, { tenant: updatedTenant });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:updateTenant:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Uploads a tenant logo file to Supabase storage.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
tenantController.uploadLogo = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      throw new Error("No file uploaded.");
    }

    Logger.log("info", {
      message: "tenantController:uploadLogo:params",
      params: {
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
      },
    });

    // Create unique filename and upload path
    const uniqueName = `${Date.now()}-${file.originalname}`;
    const filePath = `${constants.STORAGE.FOLDERS.LOGOS}/${uniqueName}`;

    const fileStorageUtil = require("../../utils/fileStorage.util");
    // Upload to default bucket and get the public URL
    const publicUrl = await fileStorageUtil.uploadFile(file.buffer, file.mimetype, filePath, constants.STORAGE.BUCKETS.TENANT_ASSETS);

    Logger.log("success", {
      message: "tenantController:uploadLogo:success",
      params: {
        url: publicUrl,
        filePath,
      },
    });

    return expressUtils.sendResponse(res, true, {
      url: publicUrl,
      filePath,
      fileName: file.originalname,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:uploadLogo:error",
      params: {
        error: error.message || error,
      },
    });
    return expressUtils.sendResponse(res, false, {}, error.message || error);
  }
};

/**
 * Retrieves the AI configuration status for the tenant.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
tenantController.getTenantAIConfig = async (req, res) => {
  try {
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "tenantController:getTenantAIConfig:params",
      params: { tenantID },
    });

    const { vaultService } = require("../vault/vault.service");
    const credential = await vaultService.getCredentialByProvider({
      tenantID,
      provider: "ai_config",
    });

    const aiConfig = {
      isApiKeySet: !!(credential && credential.apiKey),
      baseURL: credential?.baseURL || "",
      provider: credential?.provider || "openai",
      model: credential?.model || "",
    };

    Logger.log("success", {
      message: "tenantController:getTenantAIConfig:success",
      params: { tenantID, hasConfig: !!credential },
    });
    return expressUtils.sendResponse(res, true, { aiConfig });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:getTenantAIConfig:error",
      params: { error: error.message || error },
    });
    return expressUtils.sendResponse(res, false, {}, error.message || error);
  }
};

/**
 * Updates the AI configuration for the tenant securely in the vault.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
tenantController.updateTenantAIConfig = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const { apiKey, baseURL, provider, model } = req.body;
    const { user, apiKey: systemApiKey } = req;
    
    Logger.log("info", {
      message: "tenantController:updateTenantAIConfig:params",
      params: { tenantID, baseURL, provider, model },
    });

    const { vaultService } = require("../vault/vault.service");
    
    // We only update apiKey if it's provided. If it's a placeholder "******", we keep the old one.
    let finalApiKey = apiKey;
    if (!apiKey || apiKey === "******") {
      const existing = await vaultService.getCredentialByProvider({ tenantID, provider: "ai_config" });
      finalApiKey = existing?.apiKey || "";
    }

    await vaultService.upsertCredentialByProvider({
      tenantID,
      provider: "ai_config",
      name: "Tenant AI Configuration",
      data: { apiKey: finalApiKey, baseURL, provider, model },
      creatorID: user?.userID,
      createdByApiKeyID: systemApiKey?.apiKeyID,
    });

    Logger.log("success", {
      message: "tenantController:updateTenantAIConfig:success",
      params: { tenantID },
    });
    return expressUtils.sendResponse(res, true, {});
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:updateTenantAIConfig:error",
      params: { error: error.message || error },
    });
    return expressUtils.sendResponse(res, false, {}, error.message || error);
  }
};

module.exports = { tenantController };
