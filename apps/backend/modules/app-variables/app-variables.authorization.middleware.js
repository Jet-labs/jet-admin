const constants = require("../../constants");
const Logger = require("../../utils/logger");
const {
  policyAuthorizations,
} = require("../../utils/policy-utils/policy-authorization");

const appVariableAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
appVariableAuthorizationMiddleware.populateAuthorizedAppVariablesForRead =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "appVariableAuthorizationMiddleware:populateAuthorizedAppVariablesForRead:params",
        params: { pm_user_id },
      });
      let authorized_app_variables =
        policyAuthorizations.extractAppVariableReadAuthorization({
          policyObject: authorization_policy,
        });

      req.state = { ...req.state, authorized_app_variables };
      Logger.log("success", {
        message:
          "appVariableAuthorizationMiddleware:populateAuthorizedAppVariablesForRead:success",
        params: { pm_user_id, authorized_app_variables },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "appVariableAuthorizationMiddleware:populateAuthorizedAppVariablesForRead:catch-1",
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
appVariableAuthorizationMiddleware.populateAuthorizedAppVariablesForUpdate =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "appVariableAuthorizationMiddleware:populateAuthorizedAppVariablesForUpdate:params",
        params: { pm_user_id },
      });
      let authorized_app_variables =
        policyAuthorizations.extractAppVariableEditAuthorization({
          policyObject: authorization_policy,
        });

      req.state = { ...req.state, authorized_app_variables };
      Logger.log("success", {
        message:
          "appVariableAuthorizationMiddleware:populateAuthorizedAppVariablesForUpdate:success",
        params: { pm_user_id, authorized_app_variables },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "appVariableAuthorizationMiddleware:populateAuthorizedAppVariablesForUpdate:catch-1",
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
appVariableAuthorizationMiddleware.populateAuthorizedAppVariablesForDelete =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "appVariableAuthorizationMiddleware:populateAuthorizedAppVariablesForDelete:params",
        params: { pm_user_id },
      });
      let authorized_app_variables =
        policyAuthorizations.extractAppVariableDeleteAuthorization({
          policyObject: authorization_policy,
        });

      req.state = { ...req.state, authorized_app_variables };
      Logger.log("success", {
        message:
          "appVariableAuthorizationMiddleware:populateAuthorizedAppVariablesForDelete:success",
        params: { pm_user_id, authorized_app_variables },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "appVariableAuthorizationMiddleware:populateAuthorizedAppVariablesForDelete:catch-1",
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
appVariableAuthorizationMiddleware.populateAuthorizationForAppVariableAddition =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "appVariableAuthorizationMiddleware:populateAuthorizationForAppVariableAddition:params",
        params: { pm_user_id },
      });
      let authorizationToAdd =
        policyAuthorizations.extractAppVariableAddAuthorization({
          policyObject: authorization_policy,
        });

      if (!authorizationToAdd) {
        Logger.log("error", {
          message:
            "appVariableAuthorizationMiddleware:populateAuthorizationForAppVariableAddition:catch-2",
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
          "appVariableAuthorizationMiddleware:populateAuthorizationForAppVariableAddition:success",
        params: { pm_user_id, authorizationToAdd },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "appVariableAuthorizationMiddleware:populateAuthorizationForAppVariableAddition:catch-1",
        params: { error },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.SERVER_ERROR,
      });
    }
  };

module.exports = { appVariableAuthorizationMiddleware };
