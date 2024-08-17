const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { policyUtils } = require("../../utils/policy.utils");

const triggerChannelAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
triggerChannelAuthorizationMiddleware.populateAuthorizedTriggerChannelsForRead =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "triggerChannelAuthorizationMiddleware:populateAuthorizedTriggerChannelsForRead:params",
        params: { pm_user_id },
      });
      if (
        policyUtils.extractAuthorizedTriggerChannelsForReadFromPolicyObject({
          policyObject: authorization_policy,
        })
      ) {
        Logger.log("success", {
          message:
            "triggerAuthorizationMiddleware:populateAuthorizedTriggerChannelsForRead:success",
          params: { pm_user_id },
        });
        return next();
      } else {
        Logger.log("error", {
          message:
            "triggerAuthorizationMiddleware:populateAuthorizedTriggerChannelsForRead:catch-1",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        return res.json({
          success: false,
          error: constants.ERROR_CODES.PERMISSION_DENIED,
        });
      }
    } catch (error) {
      Logger.log("error", {
        message:
          "triggerAuthorizationMiddleware:populateAuthorizedTriggerChannelsForRead:catch-1",
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
triggerChannelAuthorizationMiddleware.populateAuthorizedTriggerChannelsForAdd =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "triggerChannelAuthorizationMiddleware:populateAuthorizedTriggerChannelsForAdd:params",
        params: { pm_user_id },
      });
      if (
        policyUtils.extractAuthorizedTriggerChannelsForAddFromPolicyObject({
          policyObject: authorization_policy,
        })
      ) {
        Logger.log("success", {
          message:
            "triggerAuthorizationMiddleware:populateAuthorizedTriggerChannelsForAdd:success",
          params: { pm_user_id },
        });
        return next();
      } else {
        Logger.log("error", {
          message:
            "triggerAuthorizationMiddleware:populateAuthorizedTriggerChannelsForAdd:catch-1",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        return res.json({
          success: false,
          error: constants.ERROR_CODES.PERMISSION_DENIED,
        });
      }
    } catch (error) {
      Logger.log("error", {
        message:
          "triggerAuthorizationMiddleware:populateAuthorizedTriggerChannelsForAdd:catch-1",
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
triggerChannelAuthorizationMiddleware.populateAuthorizedTriggerChannelsForDelete =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "triggerChannelAuthorizationMiddleware:populateAuthorizedTriggerChannelsForDelete:params",
        params: { pm_user_id },
      });
      if (
        policyUtils.extractAuthorizedTriggerChannelsForDeleteFromPolicyObject({
          policyObject: authorization_policy,
        })
      ) {
        Logger.log("success", {
          message:
            "triggerAuthorizationMiddleware:populateAuthorizedTriggerChannelsForDelete:success",
          params: { pm_user_id },
        });
        return next();
      } else {
        Logger.log("error", {
          message:
            "triggerAuthorizationMiddleware:populateAuthorizedTriggerChannelsForDelete:catch-1",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        return res.json({
          success: false,
          error: constants.ERROR_CODES.PERMISSION_DENIED,
        });
      }
    } catch (error) {
      Logger.log("error", {
        message:
          "triggerAuthorizationMiddleware:populateAuthorizedTriggerChannelsForDelete:catch-1",
        params: { error },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.SERVER_ERROR,
      });
    }
  };

module.exports = { triggerChannelAuthorizationMiddleware };
