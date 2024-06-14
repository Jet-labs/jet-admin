const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { policyUtils } = require("../../utils/policy.utils");

const dataSourceAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
dataSourceAuthorizationMiddleware.populateAuthorizedDataSourcesForRead = async (
  req,
  res,
  next
) => {
  try {
    const { pmUser, state } = req;
    const authorization_policy = state?.authorization_policy;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message:
        "dataSourceAuthorizationMiddleware:populateAuthorizedDataSourcesForRead:params",
      params: { pm_user_id },
    });
    let authorized_data_sources =
      policyUtils.extractAuthorizedDataSourcesForReadFromPolicyObject({
        policyObject: authorization_policy,
      });

    req.state = { ...req.state, authorized_data_sources };
    Logger.log("success", {
      message:
        "dataSourceAuthorizationMiddleware:populateAuthorizedDataSourcesForRead:success",
      params: { pm_user_id, authorized_data_sources },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "dataSourceAuthorizationMiddleware:populateAuthorizedDataSourcesForRead:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: constants.ERROR_CODES.SERVER_ERROR,
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
dataSourceAuthorizationMiddleware.populateAuthorizedDataSourcesForUpdate =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "dataSourceAuthorizationMiddleware:populateAuthorizedDataSourcesForUpdate:params",
        params: { pm_user_id },
      });
      let authorized_data_sources =
        policyUtils.extractAuthorizedDataSourcesForUpdateFromPolicyObject({
          policyObject: authorization_policy,
        });

      req.state = { ...req.state, authorized_data_sources };
      Logger.log("success", {
        message:
          "dataSourceAuthorizationMiddleware:populateAuthorizedDataSourcesForUpdate:success",
        params: { pm_user_id, authorized_data_sources },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "dataSourceAuthorizationMiddleware:populateAuthorizedDataSourcesForUpdate:catch-1",
        params: { error },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.SERVER_ERROR,
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
dataSourceAuthorizationMiddleware.populateAuthorizedDataSourcesForDelete =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "dataSourceAuthorizationMiddleware:populateAuthorizedDataSourcesForDelete:params",
        params: { pm_user_id },
      });
      let authorized_data_sources =
        policyUtils.extractAuthorizedDataSourcesForDeleteFromPolicyObject({
          policyObject: authorization_policy,
        });

      req.state = { ...req.state, authorized_data_sources };
      Logger.log("success", {
        message:
          "dataSourceAuthorizationMiddleware:populateAuthorizedDataSourcesForDelete:success",
        params: { pm_user_id, authorized_data_sources },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "dataSourceAuthorizationMiddleware:populateAuthorizedDataSourcesForDelete:catch-1",
        params: { error },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.SERVER_ERROR,
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
dataSourceAuthorizationMiddleware.populateAuthorizationForDataSourceAddition =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "dataSourceAuthorizationMiddleware:populateAuthorizationForDataSourceAddition:params",
        params: { pm_user_id },
      });
      let authorizationToAdd =
        policyUtils.extractAuthorizationForDataSourceAddFromPolicyObject({
          policyObject: authorization_policy,
        });

      if (!authorizationToAdd) {
        Logger.log("error", {
          message:
            "dataSourceAuthorizationMiddleware:populateAuthorizationForDataSourceAddition:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        return res.json({
          success: false,
          error: constants.ERROR_CODES.PERMISSION_DENIED,
        });
      }
      req.state = { ...req.state, authorizationToAdd };
      Logger.log("success", {
        message:
          "dataSourceAuthorizationMiddleware:populateAuthorizationForDataSourceAddition:success",
        params: { pm_user_id, authorizationToAdd },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "dataSourceAuthorizationMiddleware:populateAuthorizationForDataSourceAddition:catch-1",
        params: { error },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.SERVER_ERROR,
      });
    }
  };

module.exports = { dataSourceAuthorizationMiddleware };
