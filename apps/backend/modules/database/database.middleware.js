const Logger = require("../../utils/logger");
const constants = require("../../constants");
const {
  tenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
const { expressUtils } = require("../../utils/express.utils");

//auth middlewares
const databaseMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
databaseMiddleware.poolProvider = async (req, res, next) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "databaseMiddleware:poolProvider:params",
      params: { userID: user.userID, tenantID },
    });

    if (!tenantID) {
      Logger.log("error", {
        message: "databaseMiddleware:poolProvider:catch-2",
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
      message: "databaseMiddleware:poolProvider:dbPool",
      params: { userID: user.userID, tenantID },
    });
    next();
  } catch (error) {
    Logger.log("error", {
      message: "databaseMiddleware:poolProvider:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error)
  }
};

module.exports = { databaseMiddleware };
