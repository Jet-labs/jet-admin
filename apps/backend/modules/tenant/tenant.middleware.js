const {
  tenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { tenantService } = require("./tenant.service");

//tenant middlewares
const tenantMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
tenantMiddleware.checkIfUserIsAdmin = async (req, res, next) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "tenantMiddleware:checkIfUserIsAdmin:params",
      params: { userID: user.userID, tenantID },
    });
    const isTenantAdmin = await tenantService.checkIfUserIsAdmin({
      tenantID: parseInt(tenantID),
      userID: parseInt(user.userID),
    });
    if (isTenantAdmin) {
      Logger.log("success", {
        message: "tenantMiddleware:checkIfUserIsAdmin:success",
        params: { userID: user.userID, tenantID, isTenantAdmin },
      });
      return next();
    } else {
      Logger.log("error", {
        message: "tenantMiddleware:checkIfUserIsAdmin:catch2",
        params: {
          userID: user.userID,
          tenantID,
          isTenantAdmin,
          error: constants.ERROR_CODES.USER_NOT_ADMIN_OF_TENANT,
        },
      });
      return expressUtils.sendResponse(
        res,
        false,
        {},
        constants.ERROR_CODES.USER_NOT_ADMIN_OF_TENANT
      );
    }
  } catch (error) {
    Logger.log("error", {
      message: "tenantMiddleware:checkIfUserIsAdmin:catch-1",
      params: {
        error,
      },
    });
    return expressUtils.sendResponse(
      res,
      false,
      {},
      constants.ERROR_CODES.SERVER_ERROR
    );
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
tenantMiddleware.checkTenantCreationLimit = async function (req, res, next) {
  const userPlan = constants.SAMPLE_PLAN;
  try {
    const { user } = req;
    Logger.log("info", {
      message: "tenantMiddleware:checkTenantCreationLimit:params",
      params: { userID: user.userID },
    });
    const userCreatedTenantCount =
      await tenantService.getUserCreatedTenantCount({
        userID: parseInt(user.userID),
      });
    if (userPlan.maxTenantCount > userCreatedTenantCount) {
      Logger.log("success", {
        message: "tenantMiddleware:checkTenantCreationLimit:success",
        params: { userID: user.userID, userCreatedTenantCount },
      });
      return next();
    } else {
      Logger.log("error", {
        message: "tenantMiddleware:checkTenantCreationLimit:catch2",
        params: {
          userCreatedTenantCount,
          error: constants.ERROR_CODES.TENANT_CREATION_LIMIT_EXCEED,
        },
      });
      return expressUtils.sendResponse(
        res,
        false,
        {},
        constants.ERROR_CODES.TENANT_CREATION_LIMIT_EXCEED
      );
    }
  } catch (error) {
    Logger.log("error", {
      message: "tenantMiddleware:checkTenantCreationLimit:catch-1",
      params: {
        error,
      },
    });
    return expressUtils.sendResponse(
      res,
      false,
      {},
      error
    );
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
tenantMiddleware.poolProvider = async (req, res, next) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "tenantMiddleware:poolProvider:params",
      params: { userID: user.userID, tenantID },
    });

    if (!tenantID) {
      Logger.log("error", {
        message: "tenantMiddleware:poolProvider:catch-2",
        params: {
          userID: user.userID,
          tenantID,
          error: constants.ERROR_CODES.INVALID_TENANT,
        },
      });
      return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.INVALID_TENANT)
    }
    req.dbPool = await tenantAwarePostgreSQLPoolManager.getPool(tenantID);
    Logger.log("success", {
      message: "tenantMiddleware:poolProvider:dbPool",
      params: { userID: user.userID, tenantID },
    });
    next();
  } catch (error) {
    Logger.log("error", {
      message: "tenantMiddleware:poolProvider:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error)
  }
};

module.exports = { tenantMiddleware };
