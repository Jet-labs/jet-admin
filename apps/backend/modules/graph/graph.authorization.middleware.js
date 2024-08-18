const constants = require("../../constants");
const Logger = require("../../utils/logger");
const {
  policyUtils,
} = require("../../utils/policy-utils/policy-authorization");

const graphAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
graphAuthorizationMiddleware.populateAuthorizedGraphsForRead = async (
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
        "graphAuthorizationMiddleware:populateAuthorizedGraphsForRead:params",
      params: { pm_user_id },
    });
    let authorized_graphs = policyUtils.extractGraphReadAuthorization({
      policyObject: authorization_policy,
    });

    req.state = { ...req.state, authorized_graphs };
    Logger.log("success", {
      message:
        "graphAuthorizationMiddleware:populateAuthorizedGraphsForRead:success",
      params: { pm_user_id, authorized_graphs },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "graphAuthorizationMiddleware:populateAuthorizedGraphsForRead:catch-1",
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
graphAuthorizationMiddleware.populateAuthorizedGraphsForUpdate = async (
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
        "graphAuthorizationMiddleware:populateAuthorizedGraphsForUpdate:params",
      params: { pm_user_id },
    });
    let authorized_graphs = policyUtils.extractGraphEditAuthorization({
      policyObject: authorization_policy,
    });

    req.state = { ...req.state, authorized_graphs };
    Logger.log("success", {
      message:
        "graphAuthorizationMiddleware:populateAuthorizedGraphsForUpdate:success",
      params: { pm_user_id, authorized_graphs },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "graphAuthorizationMiddleware:populateAuthorizedGraphsForUpdate:catch-1",
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
graphAuthorizationMiddleware.populateAuthorizedGraphsForDelete = async (
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
        "graphAuthorizationMiddleware:populateAuthorizedGraphsForDelete:params",
      params: { pm_user_id },
    });
    let authorized_graphs = policyUtils.extractGraphDeleteAuthorization({
      policyObject: authorization_policy,
    });

    req.state = { ...req.state, authorized_graphs };
    Logger.log("success", {
      message:
        "graphAuthorizationMiddleware:populateAuthorizedGraphsForDelete:success",
      params: { pm_user_id, authorized_graphs },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "graphAuthorizationMiddleware:populateAuthorizedGraphsForDelete:catch-1",
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
graphAuthorizationMiddleware.populateAuthorizationForGraphAddition = async (
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
        "graphAuthorizationMiddleware:populateAuthorizationForGraphAddition:params",
      params: { pm_user_id },
    });
    let authorizationToAdd = policyUtils.extractGraphAdditionAuthorization({
      policyObject: authorization_policy,
    });

    if (!authorizationToAdd) {
      Logger.log("error", {
        message:
          "graphAuthorizationMiddleware:populateAuthorizationForGraphAddition:catch-2",
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
        "graphAuthorizationMiddleware:populateAuthorizationForGraphAddition:success",
      params: { pm_user_id, authorizationToAdd },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "graphAuthorizationMiddleware:populateAuthorizationForGraphAddition:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: constants.ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = { graphAuthorizationMiddleware };
