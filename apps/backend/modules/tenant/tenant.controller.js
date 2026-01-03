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
    const { user, dbPool } = req;
    const { tenantID } = req.params;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "tenantController:getUserTenantByID:params",
      params: { userID: user.userID, tenantID, authContext },
    });
    const tenant = await tenantService.getUserTenantByID({
      userID: user.userID,
      tenantID: tenantID,
      dbPool,
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
    const { user, dbPool } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "tenantController:deleteUserTenantByID:params",
      params: { userID: user.userID, tenantID },
    });
    await tenantService.deleteUserTenantByID({
      userID: user.userID,
      tenantID: tenantID,
      dbPool,
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
    const { tenantTitle, tenantLogoURL, tenantDBType, tenantDBURL } = req.body;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "tenantController:createNewTenant:params",
      params: {
        userID: user.userID,
        tenantTitle,
        tenantLogoURL,
        tenantDBType,
        tenantDBURL,
        authContext,
      },
    });
    const newTenant = await tenantService.createTenant({
      userID: user.userID,
      tenantTitle,
      tenantLogoURL,
      tenantDBType,
      tenantDBURL,
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
tenantController.testTenantDatabaseConnection = async (req, res) => {
  try {
    const { user } = req;
    const { tenantDBURL } = req.body;
    Logger.log("info", {
      message: "tenantController:testTenantDatabaseConnection:params",
      params: { userID: user.userID, tenantDBURL },
    });
    const connectionResult = await tenantService.testTenantDatabaseConnection({
      userID: user.userID,
      tenantDBURL,
    });
    Logger.log("success", {
      message: "tenantController:testTenantDatabaseConnection:connectionResult",
      params: { connectionResult },
    });
    return expressUtils.sendResponse(res, true, { connectionResult });
  } catch (error) {
    Logger.log("error", {
      message: "tenantController:testTenantDatabaseConnection:catch-1",
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
    const { tenantTitle, tenantLogoURL, tenantDBURL } = req.body;
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
      tenantDBURL,
      tenantDBType: constants.SUPPORTED_DATABASES.postgresql.value,
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

module.exports = { tenantController };
