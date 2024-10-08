const constants = require("../../constants");
const Logger = require("../../utils/logger");
const {
  policyAuthorizations,
} = require("../../utils/policy-utils/policy-authorization");

const triggerAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
triggerAuthorizationMiddleware.populateAuthorizedTriggersForRead = async (
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
        "triggerAuthorizationMiddleware:populateAuthorizedTriggersForRead:params",
      params: { pm_user_id },
    });
    if (
      policyAuthorizations.extractTriggerReadAuthorization({
        policyObject: authorization_policy,
      })
    ) {
      Logger.log("success", {
        message:
          "triggerAuthorizationMiddleware:populateAuthorizedTriggersForRead:success",
        params: { pm_user_id },
      });
      return next();
    } else {
      Logger.log("error", {
        message:
          "triggerAuthorizationMiddleware:populateAuthorizedTriggersForRead:catch-1",
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
        "triggerAuthorizationMiddleware:populateAuthorizedTriggersForRead:catch-1",
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
triggerAuthorizationMiddleware.populateAuthorizedTriggersForAdd = async (
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
        "triggerAuthorizationMiddleware:populateAuthorizedTriggersForAdd:params",
      params: { pm_user_id },
    });
    if (
      policyAuthorizations.extractTriggerAddAuthorization({
        policyObject: authorization_policy,
      })
    ) {
      Logger.log("success", {
        message:
          "triggerAuthorizationMiddleware:populateAuthorizedTriggersForAdd:success",
        params: { pm_user_id },
      });
      return next();
    } else {
      Logger.log("error", {
        message:
          "triggerAuthorizationMiddleware:populateAuthorizedTriggersForAdd:catch-1",
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
        "triggerAuthorizationMiddleware:populateAuthorizedTriggersForAdd:catch-1",
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
triggerAuthorizationMiddleware.populateAuthorizedTriggersForDelete = async (
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
        "triggerAuthorizationMiddleware:populateAuthorizedTriggersForDelete:params",
      params: { pm_user_id },
    });
    if (
      policyAuthorizations.extractTriggerDeleteAuthorization({
        policyObject: authorization_policy,
      })
    ) {
      Logger.log("success", {
        message:
          "triggerAuthorizationMiddleware:populateAuthorizedTriggersForDelete:success",
        params: { pm_user_id },
      });
      return next();
    } else {
      Logger.log("error", {
        message:
          "triggerAuthorizationMiddleware:populateAuthorizedTriggersForDelete:catch-1",
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
        "triggerAuthorizationMiddleware:populateAuthorizedTriggersForDelete:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: constants.ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = { triggerAuthorizationMiddleware };
