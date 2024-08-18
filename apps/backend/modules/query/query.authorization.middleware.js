const constants = require("../../constants");
const Logger = require("../../utils/logger");
const {
  policyUtils,
} = require("../../utils/policy-utils/policy-authorization");

const queryAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
queryAuthorizationMiddleware.populateAuthorizedQueriesForRead = async (
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
        "queryAuthorizationMiddleware:populateAuthorizedQueriesForRead:params",
      params: { pm_user_id },
    });
    let authorized_queries = policyUtils.extractQueryReadAuthorization({
      policyObject: authorization_policy,
    });

    req.state = { ...req.state, authorized_queries };
    Logger.log("success", {
      message:
        "queryAuthorizationMiddleware:populateAuthorizedQueriesForRead:success",
      params: { pm_user_id, authorized_queries },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "queryAuthorizationMiddleware:populateAuthorizedQueriesForRead:catch-1",
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
queryAuthorizationMiddleware.populateAuthorizedQueriesForUpdate = async (
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
        "queryAuthorizationMiddleware:populateAuthorizedQueriesForUpdate:params",
      params: { pm_user_id },
    });
    let authorized_queries = policyUtils.extractQueryEditAuthorization({
      policyObject: authorization_policy,
    });

    req.state = { ...req.state, authorized_queries };
    Logger.log("success", {
      message:
        "queryAuthorizationMiddleware:populateAuthorizedQueriesForUpdate:success",
      params: { pm_user_id, authorized_queries },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "queryAuthorizationMiddleware:populateAuthorizedQueriesForUpdate:catch-1",
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
queryAuthorizationMiddleware.populateAuthorizedQueriesForDelete = async (
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
        "queryAuthorizationMiddleware:populateAuthorizedQueriesForDelete:params",
      params: { pm_user_id },
    });
    let authorized_queries = policyUtils.extractQueryDeleteAuthorization({
      policyObject: authorization_policy,
    });

    req.state = { ...req.state, authorized_queries };
    Logger.log("success", {
      message:
        "queryAuthorizationMiddleware:populateAuthorizedQueriesForDelete:success",
      params: { pm_user_id, authorized_queries },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "queryAuthorizationMiddleware:populateAuthorizedQueriesForDelete:catch-1",
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
queryAuthorizationMiddleware.populateAuthorizationForQueryAddition = async (
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
        "queryAuthorizationMiddleware:populateAuthorizationForQueryAddition:params",
      params: { pm_user_id },
    });
    let authorizationToAdd = policyUtils.extractQueryAdditionAuthorization({
      policyObject: authorization_policy,
    });

    if (!authorizationToAdd) {
      Logger.log("error", {
        message:
          "queryAuthorizationMiddleware:populateAuthorizationForQueryAddition:catch-2",
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
        "queryAuthorizationMiddleware:populateAuthorizationForQueryAddition:success",
      params: { pm_user_id, authorizationToAdd },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "queryAuthorizationMiddleware:populateAuthorizationForQueryAddition:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: constants.ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = { queryAuthorizationMiddleware };
