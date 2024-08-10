const constants = require("../../constants");
const Logger = require("../../utils/logger");

const policyMiddleware = {};

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

module.exports = { policyMiddleware };
