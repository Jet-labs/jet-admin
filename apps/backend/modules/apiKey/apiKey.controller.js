const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { apiKeyService } = require("./apiKey.service");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

const apiKeyController = {};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
apiKeyController.getAllAPIKeys = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const authContext = getServiceAuthContext(req);

    Logger.log("info", {
      message: "apiKeyController:getAllAPIKeys:params",
      params: { userID: user.userID, tenantID },
    });

    const apiKeys = await apiKeyService.getAllAPIKeys({
      userID: user.userID,
      tenantID,
      authContext,
    });

    return expressUtils.sendResponse(res, true, {
      apiKeys,
      message: "APIKeys fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyController:getAllAPIKeys:catch-1",
      params: { errorMessage: error.message },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
apiKeyController.createAPIKey = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { apiKeyTitle, roleIDs } = req.body;
    const authContext = getServiceAuthContext(req);

    Logger.log("info", {
      message: "apiKeyController:createAPIKey:params",
      params: { userID: user.userID, tenantID, apiKeyTitle },
    });

    const { apiKey } = await apiKeyService.createAPIKey({
      userID: user.userID,
      tenantID: tenantID,
      roleIDs,
      apiKeyTitle,
      authContext,
    });

    return expressUtils.sendResponse(res, true, {
      apiKey,
      message: "APIKey created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyController:createAPIKey:catch-1",
      params: { errorMessage: error.message },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
apiKeyController.getAPIKeyByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, apiKeyID } = req.params;

    Logger.log("info", {
      message: "apiKeyController:getAPIKeyByID:params",
      params: { userID: user.userID, tenantID, apiKeyID },
    });

    const apiKey = await apiKeyService.getAPIKeyByID({
      userID: user.userID,
      tenantID,
      apiKeyID: apiKeyID,
    });

    return expressUtils.sendResponse(res, true, {
      apiKey,
      message: "APIKey fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyController:getAPIKeyByID:catch-1",
      params: { errorMessage: error.message },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
apiKeyController.updateAPIKeyByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, apiKeyID } = req.params;
    const { apiKeyTitle, roleIDs, isDisabled } = req.body;

    Logger.log("info", {
      message: "apiKeyController:updateAPIKeyByID:params",
      params: {
        userID: user.userID,
        tenantID,
        apiKeyID,
        apiKeyTitle,
        roleIDs,
        isDisabled,
      },
    });

    await apiKeyService.updateAPIKeyByID({
      userID: user.userID,
      tenantID: tenantID,
      apiKeyID: apiKeyID,
      apiKeyTitle,
      roleIDs,
      isDisabled,
    });

    Logger.log("success", {
      message: "apiKeyController:updateAPIKeyByID:success",
      params: {
        userID: user.userID,
        tenantID,
        apiKeyID,
        apiKeyTitle,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "APIKey updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyController:updateAPIKeyByID:catch-1",
      params: { errorMessage: error.message },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
apiKeyController.deleteAPIKeyByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, apiKeyID } = req.params;

    Logger.log("info", {
      message: "apiKeyController:deleteAPIKeyByID:params",
      params: { userID: user.userID, tenantID, apiKeyID },
    });

    await apiKeyService.deleteAPIKeyByID({
      userID: user.userID,
      tenantID: tenantID,
      apiKeyID: apiKeyID,
    });

    return expressUtils.sendResponse(res, true, {
      message: "APIKey deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyController:deleteAPIKeyByID:catch-1",
      params: { errorMessage: error.message },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
apiKeyController.cloneAPIKey = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, apiKeyID } = req.params;
    const authContext = getServiceAuthContext(req);

    Logger.log("info", {
      message: "apiKeyController:cloneAPIKey:params",
      params: { userID: user.userID, tenantID, apiKeyID },
    });

    const { apiKey } = await apiKeyService.cloneAPIKey({
      userID: user.userID,
      tenantID: tenantID,
      apiKeyID: apiKeyID,
      authContext,
    });

    return expressUtils.sendResponse(res, true, {
      apiKey,
      message: "APIKey cloned successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyController:cloneAPIKey:catch-1",
      params: { errorMessage: error.message },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { apiKeyController };
