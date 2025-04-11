const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { tenantService } = require("./tenant.service");

const tenantController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tenantController.getUserTenantByID = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "tenantController:getUserTenantByID:params",
      params: { userID: user.userID, tenantID },
    });
    const tenant = await tenantService.getUserTenantByID({
      userID: parseInt(user.userID),
      tenantID: parseInt(tenantID),
      dbPool,
    });
    Logger.log("success", {
      message: "tenantController:getUserTenantByID:tenant",
      params: { tenant: tenant.tenantID },
    });
    return expressUtils.sendResponse(res, true, { tenant });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:getUserTenantByID:catch1",
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
    const { user, dbPool } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "tenantController:deleteUserTenantByID:params",
      params: { userID: user.userID, tenantID },
    });
    await tenantService.deleteUserTenantByID({
      userID: parseInt(user.userID),
      tenantID: parseInt(tenantID),
      dbPool,
    });
    Logger.log("success", {
      message: "tenantController:deleteUserTenantByID:success",
      params: {userID: user.userID, tenantID}
    });
    return expressUtils.sendResponse(res, true, { });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:deleteUserTenantByID:catch1",
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
      userID: parseInt(user.userID),
    });
    Logger.log("success", {
      message: "tenantController:getAllUserTenants:tenantsLength",
      params: { tenantsLength: tenants.length },
    });
    return expressUtils.sendResponse(res, true, { tenants });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:getAllUserTenants:catch1",
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
    const { tenantName, tenantLogoURL, tenantDBType, tenantDBURL } = req.body;
    Logger.log("info", {
      message: "tenantController:createNewTenant:params",
      params: {
        userID: user.userID,
        tenantName,
        tenantLogoURL,
        tenantDBType,
        tenantDBURL,
      },
    });
    const newTenant = await tenantService.createTenant({
      userID: parseInt(user.userID),
      tenantName,
      tenantLogoURL,
      tenantDBType,
      tenantDBURL,
    });
    Logger.log("success", {
      message: "tenantController:createNewTenant:createdNewTenant",
      params: { newTenant },
    });
    return expressUtils.sendResponse(res, true, { tenant: newTenant });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:createNewTenant:catch1",
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
tenantController.testTenantDatabaseConnection = async (req, res) => {
  try {
    const { user } = req;
    const { tenantDBURL } = req.body;
    Logger.log("info", {
      message: "tenantController:testTenantDatabaseConnection:params",
      params: { userID: user.userID, tenantDBURL },
    });
    const connectionResult = await tenantService.testTenantDatabaseConnection({
      userID: parseInt(user.userID),
      tenantDBURL,
    });
    Logger.log("success", {
      message: "tenantController:testTenantDatabaseConnection:connectionResult",
      params: { connectionResult },
    });
    return expressUtils.sendResponse(res, true, { connectionResult });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:testTenantDatabaseConnection:catch1",
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
    const { tenantName, tenantLogoURL, tenantDBURL, tenantDBType } = req.body;
    Logger.log("info", {
      message: "tenantController:updateTenant:params",
      params: {
        userID: user.userID,
        tenantID,
        tenantName,
        tenantLogoURL,
        tenantDBType,
        // do not log tenantDBURL
        // tenantDBURL,
      },
    });
    const updatedTenant = await tenantService.updateTenant({
      userID: parseInt(user.userID),
      tenantID: parseInt(tenantID),
      tenantName,
      tenantLogoURL,
      tenantDBURL,
      tenantDBType,
    });
    Logger.log("success", {
      message: "tenantController:updateTenant:updatedTenant",
      params: { updatedTenant },
    });
    return expressUtils.sendResponse(res, true, { tenant: updatedTenant });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:updateTenant:catch1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { tenantController };
