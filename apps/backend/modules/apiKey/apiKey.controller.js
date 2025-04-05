const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { apiKeyService } = require("./apiKey.service");

const apiKeyController = {};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
apiKeyController.getAllAPIKeys = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;

    Logger.log("info", {
      message: "apiKeyController:getAllAPIKeys:params",
      params: { userID: user.userID, tenantID },
    });

    const apiKeys = await apiKeyService.getAllAPIKeys({
      userID: parseInt(user.userID),
      tenantID,
    });

    return expressUtils.sendResponse(res, true, {
      apiKeys,
      message: "APIKeys fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyController:getAllAPIKeys:catch-1",
      params: { error },
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
    const { apiKeyName, roleIDs } = req.body;

    Logger.log("info", {
      message: "apiKeyController:createAPIKey:params",
      params: { userID: user.userID, tenantID, apiKeyName },
    });

    const result = await apiKeyService.createAPIKey({
      userID: parseInt(user.userID),
      tenantID: parseInt(tenantID),
      roleIDs,
      apiKeyName,
    });

    return expressUtils.sendResponse(res, true, {
      message: "APIKey created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyController:createAPIKey:catch-1",
      params: { error },
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
      userID: parseInt(user.userID),
      tenantID,
      apiKeyID: parseInt(apiKeyID),
    });

    return expressUtils.sendResponse(res, true, {
      apiKey,
      message: "APIKey fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyController:getAPIKeyByID:catch-1",
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
apiKeyController.updateAPIKeyByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, apiKeyID } = req.params; // Assuming `apiKeyID` identifies the query to update
    const { apiKeyName,roleIDs,isDisabled } = req.body;

    Logger.log("info", {
      message: "apiKeyController:updateAPIKeyByID:params",
      params: {
        userID: user.userID,
        tenantID,
        apiKeyID,
        apiKeyName,
        roleIDs,
        isDisabled,
      },
    });

    const result = await apiKeyService.updateAPIKeyByID({
      userID: parseInt(user.userID),
      tenantID:parseInt(tenantID),
      apiKeyID:parseInt(apiKeyID),
      apiKeyName,
      roleIDs,
      isDisabled,
    });

    Logger.log("success", {
      message: "apiKeyController:updateAPIKeyByID:success",
      params: {
        userID: user.userID,
        tenantID,
        apiKeyID,
        apiKeyName,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "APIKey updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyController:updateAPIKeyByID:catch-1",
      params: { error },
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
      userID: parseInt(user.userID),
      tenantID: parseInt(tenantID),
      apiKeyID: parseInt(apiKeyID),
    });

    return expressUtils.sendResponse(res, true, {
      message: "APIKey deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyController:deleteAPIKeyByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { apiKeyController };
