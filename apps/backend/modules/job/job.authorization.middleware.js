const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { policyUtils } = require("../../utils/policy.utils");

const jobAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
jobAuthorizationMiddleware.populateAuthorizedJobsForRead = async (
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
        "jobAuthorizationMiddleware:populateAuthorizedJobsForRead:params",
      params: { pm_user_id },
    });
    let authorized_jobs =
      policyUtils.extractAuthorizedJobsForReadFromPolicyObject({
        policyObject: authorization_policy,
      });

    req.state = { ...req.state, authorized_jobs };
    Logger.log("success", {
      message:
        "jobAuthorizationMiddleware:populateAuthorizedJobsForRead:success",
      params: { pm_user_id, authorized_jobs },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "jobAuthorizationMiddleware:populateAuthorizedJobsForRead:catch-1",
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
jobAuthorizationMiddleware.populateAuthorizedJobsForUpdate = async (
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
        "jobAuthorizationMiddleware:populateAuthorizedJobsForUpdate:params",
      params: { pm_user_id },
    });
    let authorized_jobs =
      policyUtils.extractAuthorizedJobsForUpdateFromPolicyObject({
        policyObject: authorization_policy,
      });

    req.state = { ...req.state, authorized_jobs };
    Logger.log("success", {
      message:
        "jobAuthorizationMiddleware:populateAuthorizedJobsForUpdate:success",
      params: { pm_user_id, authorized_jobs },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "jobAuthorizationMiddleware:populateAuthorizedJobsForUpdate:catch-1",
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
jobAuthorizationMiddleware.populateAuthorizedJobsForDelete = async (
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
        "jobAuthorizationMiddleware:populateAuthorizedJobsForDelete:params",
      params: { pm_user_id },
    });
    let authorized_jobs =
      policyUtils.extractAuthorizedJobsForDeleteFromPolicyObject({
        policyObject: authorization_policy,
      });

    req.state = { ...req.state, authorized_jobs };
    Logger.log("success", {
      message:
        "jobAuthorizationMiddleware:populateAuthorizedJobsForDelete:success",
      params: { pm_user_id, authorized_jobs },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "jobAuthorizationMiddleware:populateAuthorizedJobsForDelete:catch-1",
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
jobAuthorizationMiddleware.populateAuthorizationForJobAddition = async (
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
        "jobAuthorizationMiddleware:populateAuthorizationForJobAddition:params",
      params: { pm_user_id },
    });
    let authorizationToAdd =
      policyUtils.extractAuthorizationForJobAddFromPolicyObject({
        policyObject: authorization_policy,
      });

    if (!authorizationToAdd) {
      Logger.log("error", {
        message:
          "jobAuthorizationMiddleware:populateAuthorizationForJobAddition:catch-2",
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
        "jobAuthorizationMiddleware:populateAuthorizationForJobAddition:success",
      params: { pm_user_id, authorizationToAdd },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "jobAuthorizationMiddleware:populateAuthorizationForJobAddition:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: constants.ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = { jobAuthorizationMiddleware };
