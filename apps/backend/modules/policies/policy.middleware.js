const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { policyUtils } = require("../../utils/policy.utils");

const policyMiddleware = {};
const policyAuthorizationMiddleware = {};
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
policyMiddleware.populateAuthorizationPolicies = async (req, res, next) => {
  try {
    const { pmUser } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message:
        "tableAuthorizationMiddleware:populateAuthorizationPolicies:params",
      params: {
        pm_user_id,
      },
    });
    const authorization_policy = pmUser?.policy
      ? JSON.parse(pmUser.policy)
      : constants.DUMMY_PERMISSION;
    Logger.log("info", {
      message:
        "tableAuthorizationMiddleware:populateAuthorizationPolicies:policy",
      params: { pm_user_id, policy_object: authorization_policy },
    });
    req.state = {
      ...req.state,
      authorization_policy: authorization_policy,
    };

    Logger.log("info", {
      message:
        "tableAuthorizationMiddleware:populateAuthorizationPolicies:params",
      params: { pm_user_id, policy: constants.DUMMY_PERMISSION },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "tableAuthorizationMiddleware:populateAuthorizationPolicies:catch-1",
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
policyAuthorizationMiddleware.authorizedPoliciesForRead = async (
  req,
  res,
  next
) => {
  try {
    const { pmUser, state } = req;
    const authorization_policy = state?.authorization_policy;

    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "policyAuthorizationMiddleware:authorizedPoliciesForRead:params",
      params: { pm_user_id },
    });
    let authorized_policies =
      policyUtils.extractAuthorizedPoliciesForReadFromPolicyObject({
        policyObject: authorization_policy,
      });

    req.state = { ...req.state, authorized_policies };
    Logger.log("success", {
      message:
        "policyAuthorizationMiddleware:authorizedPoliciesForRead:success",
      params: { pm_user_id, authorized_policies },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "policyAuthorizationMiddleware:authorizedPoliciesForRead:catch-1",
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
policyAuthorizationMiddleware.authorizePolicyUpdate = async (
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
      message: "policyAuthorizationMiddleware:authorizePolicyUpdate:params",
      params: { pm_user_id, query },
    });
    let authorized_policies =
      policyUtils.extractAuthorizedPoliciesForUpdateFromPolicyObject({
        policyObject: authorization_policy,
      });

    if (authorized_policies === false) {
      Logger.log("error", {
        message: "policyAuthorizationMiddleware:authorizePolicyUpdate:catch-2",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    } else {
      Logger.log("success", {
        message: "policyAuthorizationMiddleware:authorizePolicyUpdate:success",
        params: { pm_user_id },
      });
      req.state = { ...req.state, authorized_policies };
      return next();
    }
  } catch (error) {
    Logger.log("error", {
      message: "policyAuthorizationMiddleware:authorizePolicyUpdate:catch-1",
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
policyAuthorizationMiddleware.authorizePolicyAddition = async (
  req,
  res,
  next
) => {
  try {
    const { pmUser, state, body } = req;
    const authorization_policy = state?.authorization_policy;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "policyAuthorizationMiddleware:authorizePolicyAddition:params",
      params: { pm_user_id },
    });
    let authorization =
      policyUtils.extractAuthorizationForPolicyAddFromPolicyObject({
        policyObject: authorization_policy,
      });

    if (!authorization) {
      Logger.log("error", {
        message:
          "policyAuthorizationMiddleware:authorizePolicyAddition:catch-2",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    } else {
      Logger.log("success", {
        message:
          "policyAuthorizationMiddleware:authorizePolicyAddition:success",
        params: { pm_user_id },
      });
      return next();
    }
  } catch (error) {
    Logger.log("error", {
      message: "policyAuthorizationMiddleware:authorizePolicyAddition:catch-1",
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
policyAuthorizationMiddleware.authorizePolicyDeletion = async (
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
      message: "policyAuthorizationMiddleware:authorizePolicyDeletion:params",
      params: { pm_user_id, query },
    });
    let authorized_policies =
      policyUtils.extractAuthorizedPoliciesForDeleteFromPolicyObject({
        policyObject: authorization_policy,
      });
    if (!authorized_policies) {
      Logger.log("error", {
        message:
          "policyAuthorizationMiddleware:authorizePolicyDeletion:catch-2",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    } else {
      Logger.log("success", {
        message:
          "policyAuthorizationMiddleware:authorizePolicyDeletion:success",
        params: { pm_user_id, query },
      });
      req.state = { ...req.state, authorized_policies };
      return next();
    }
  } catch (error) {
    Logger.log("error", {
      message: "policyAuthorizationMiddleware:authorizePolicyDeletion:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: constants.ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = { policyMiddleware, policyAuthorizationMiddleware };
