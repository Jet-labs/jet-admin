const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { policyUtils } = require("../../utils/policy.utils");

const accountAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
accountAuthorizationMiddleware.authorizedAccountsForRead = async (
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
        "accountAuthorizationMiddleware:authorizedAccountsForRead:params",
      params: { pm_user_id },
    });
    let authorized_accounts =
      policyUtils.extractAuthorizedAccountsForReadFromPolicyObject({
        policyObject: authorization_policy,
      });

    req.state = { ...req.state, authorized_accounts };
    Logger.log("success", {
      message:
        "accountAuthorizationMiddleware:authorizedAccountsForRead:success",
      params: { pm_user_id, authorized_accounts },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "accountAuthorizationMiddleware:authorizedAccountsForRead:catch-1",
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
accountAuthorizationMiddleware.authorizeAccountUpdate = async (
  req,
  res,
  next
) => {
  try {
    const { pmUser, state, body } = req;
    const authorization_policy = state?.authorization_policy;
    const { query } = req.params;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "accountAuthorizationMiddleware:authorizeAccountUpdate:params",
      params: { pm_user_id, query },
    });
    let authorized_accounts =
      policyUtils.extractAuthorizedAccountsForUpdateFromPolicyObject({
        policyObject: authorization_policy,
      });

    if (authorized_accounts === false) {
      Logger.log("error", {
        message:
          "accountAuthorizationMiddleware:authorizeAccountUpdate:catch-2",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    } else {
      Logger.log("success", {
        message:
          "accountAuthorizationMiddleware:authorizeAccountUpdate:success",
        params: { pm_user_id },
      });
      req.state = { ...req.state, authorized_accounts };
      return next();
    }
  } catch (error) {
    Logger.log("error", {
      message: "accountAuthorizationMiddleware:authorizeAccountUpdate:catch-1",
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
accountAuthorizationMiddleware.authorizeAccountAddition = async (
  req,
  res,
  next
) => {
  try {
    const { pmUser, state, body } = req;
    const authorization_policy = state?.authorization_policy;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "accountAuthorizationMiddleware:authorizeAccountAddition:params",
      params: { pm_user_id },
    });
    let authorization =
      policyUtils.extractAuthorizationForAccountAddFromPolicyObject({
        policyObject: authorization_policy,
      });

    if (!authorization) {
      Logger.log("error", {
        message:
          "accountAuthorizationMiddleware:authorizeAccountAddition:catch-2",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    } else {
      Logger.log("success", {
        message:
          "accountAuthorizationMiddleware:authorizeAccountAddition:success",
        params: { pm_user_id },
      });
      return next();
    }
  } catch (error) {
    Logger.log("error", {
      message:
        "accountAuthorizationMiddleware:authorizeAccountAddition:catch-1",
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
accountAuthorizationMiddleware.authorizeAccountDeletion = async (
  req,
  res,
  next
) => {
  try {
    const { pmUser, state } = req;
    const authorization_policy = state?.authorization_policy;
    const { query } = req.params;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "accountAuthorizationMiddleware:authorizeAccountDeletion:params",
      params: { pm_user_id, query },
    });
    let authorized_accounts =
      policyUtils.extractAuthorizedAccountsForDeleteFromPolicyObject({
        policyObject: authorization_policy,
      });
    if (!authorized_accounts) {
      Logger.log("error", {
        message:
          "accountAuthorizationMiddleware:authorizeAccountDeletion:catch-2",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    } else {
      Logger.log("success", {
        message:
          "accountAuthorizationMiddleware:authorizeAccountDeletion:success",
        params: { pm_user_id, query },
      });
      req.state = { ...req.state, authorized_accounts };
      return next();
    }
  } catch (error) {
    Logger.log("error", {
      message:
        "accountAuthorizationMiddleware:authorizeAccountDeletion:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: constants.ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = { accountAuthorizationMiddleware };
