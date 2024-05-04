const constants = require("../../../constants");
const Logger = require("../../../utils/logger");
const { policyUtils } = require("../../../utils/policy.utils");

const actionAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
actionAuthorizationMiddleware.checkActionAuthorization = async (
  req,
  res,
  next
) => {
  try {
    const { pmUser, state, route } = req;
    const authorization_policy = state?.authorization_policy;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const actionStrings = String(route.path).split("/");
    Logger.log("info", {
      message: "actionAuthorizationMiddleware:checkActionAuthorization:params",
      params: { pm_user_id, actionStrings },
    });

    const actionAuthorization = policyUtils.extractAuthorizationForActions({
      policyObject: authorization_policy,
      actionEntity: actionStrings[1],
      actionCommand: actionStrings[2],
    });
    if (actionAuthorization) {
      Logger.log("success", {
        message:
          "actionAuthorizationMiddleware:checkActionAuthorization:success",
      });
      return next();
    } else {
      Logger.log("error", {
        message:
          "actionAuthorizationMiddleware:checkActionAuthorization:catch-2",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    }
  } catch (error) {
    Logger.log("error", {
      message: "actionAuthorizationMiddleware:checkActionAuthorization:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: constants.ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = { actionAuthorizationMiddleware };
