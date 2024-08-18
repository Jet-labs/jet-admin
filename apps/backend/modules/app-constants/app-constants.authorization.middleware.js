const constants = require("../../constants");
const Logger = require("../../utils/logger");
const {
  policyAuthorizations,
} = require("../../utils/policy-utils/policy-authorization");

const appConstantAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
appConstantAuthorizationMiddleware.populateAuthorizedAppConstantsForRead =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "appConstantAuthorizationMiddleware:populateAuthorizedAppConstantsForRead:params",
        params: { pm_user_id },
      });
      let authorized_app_constants =
        policyAuthorizations.extractAppConstantReadAuthorization({
          policyObject: authorization_policy,
        });

      req.state = { ...req.state, authorized_app_constants };
      Logger.log("success", {
        message:
          "appConstantAuthorizationMiddleware:populateAuthorizedAppConstantsForRead:success",
        params: { pm_user_id, authorized_app_constants },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "appConstantAuthorizationMiddleware:populateAuthorizedAppConstantsForRead:catch-1",
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
appConstantAuthorizationMiddleware.populateAuthorizedAppConstantsForUpdate =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "appConstantAuthorizationMiddleware:populateAuthorizedAppConstantsForUpdate:params",
        params: { pm_user_id },
      });
      let authorized_app_constants =
        policyAuthorizations.extractAppConstantEditAuthorization({
          policyObject: authorization_policy,
        });

      req.state = { ...req.state, authorized_app_constants };
      Logger.log("success", {
        message:
          "appConstantAuthorizationMiddleware:populateAuthorizedAppConstantsForUpdate:success",
        params: { pm_user_id, authorized_app_constants },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "appConstantAuthorizationMiddleware:populateAuthorizedAppConstantsForUpdate:catch-1",
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
appConstantAuthorizationMiddleware.populateAuthorizedAppConstantsForDelete =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "appConstantAuthorizationMiddleware:populateAuthorizedAppConstantsForDelete:params",
        params: { pm_user_id },
      });
      let authorized_app_constants =
        policyAuthorizations.extractAppConstantDeleteAuthorization({
          policyObject: authorization_policy,
        });

      req.state = { ...req.state, authorized_app_constants };
      Logger.log("success", {
        message:
          "appConstantAuthorizationMiddleware:populateAuthorizedAppConstantsForDelete:success",
        params: { pm_user_id, authorized_app_constants },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "appConstantAuthorizationMiddleware:populateAuthorizedAppConstantsForDelete:catch-1",
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
appConstantAuthorizationMiddleware.populateAuthorizationForAppConstantAddition =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "appConstantAuthorizationMiddleware:populateAuthorizationForAppConstantAddition:params",
        params: { pm_user_id },
      });
      let authorizationToAdd =
        policyAuthorizations.extractAppConstantAddAuthorization({
          policyObject: authorization_policy,
        });

      if (!authorizationToAdd) {
        Logger.log("error", {
          message:
            "appConstantAuthorizationMiddleware:populateAuthorizationForAppConstantAddition:catch-2",
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
          "appConstantAuthorizationMiddleware:populateAuthorizationForAppConstantAddition:success",
        params: { pm_user_id, authorizationToAdd },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "appConstantAuthorizationMiddleware:populateAuthorizationForAppConstantAddition:catch-1",
        params: { error },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.SERVER_ERROR,
      });
    }
  };

module.exports = { appConstantAuthorizationMiddleware };
