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
      return res.json({
        error: constants.ERROR_CODES.USER_NOT_ADMIN_OF_TENANT,
      });
    }
  } catch (error) {
    Logger.log("error", {
      message: "tenantMiddleware:checkIfUserIsAdmin:catch1",
      params: {
        error,
      },
    });
    return res.json({
      error,
    });
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
      return res.json({
        error: constants.ERROR_CODES.TENANT_CREATION_LIMIT_EXCEED,
      });
    }
  } catch (error) {
    Logger.log("error", {
      message: "tenantMiddleware:checkTenantCreationLimit:catch1",
      params: {
        error,
      },
    });
    return res.json({
      error,
    });
  }
};

module.exports = { tenantMiddleware };
