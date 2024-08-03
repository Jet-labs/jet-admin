const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { policyUtils } = require("../../utils/policy.utils");

const schemaAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
schemaAuthorizationMiddleware.populateAuthorizedSchemasForRead = async (
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
        "schemaAuthorizationMiddleware:populateAuthorizedSchemasForRead:params",
      params: { pm_user_id },
    });
    let authorized_schemas =
      policyUtils.extractAuthorizedSchemasForReadFromPolicyObject({
        policyObject: authorization_policy,
      });

    req.state = { ...req.state, authorized_schemas };
    Logger.log("success", {
      message:
        "schemaAuthorizationMiddleware:populateAuthorizedSchemasForRead:success",
      params: { pm_user_id, authorized_schemas },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "schemaAuthorizationMiddleware:populateAuthorizedSchemasForRead:catch-1",
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
schemaAuthorizationMiddleware.populateAuthorizedSchemasForUpdate = async (
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
        "schemaAuthorizationMiddleware:populateAuthorizedSchemasForUpdate:params",
      params: { pm_user_id },
    });
    let authorized_schemas =
      policyUtils.extractAuthorizedSchemasForUpdateFromPolicyObject({
        policyObject: authorization_policy,
      });

    req.state = { ...req.state, authorized_schemas };
    Logger.log("success", {
      message:
        "schemaAuthorizationMiddleware:populateAuthorizedSchemasForUpdate:success",
      params: { pm_user_id, authorized_schemas },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "schemaAuthorizationMiddleware:populateAuthorizedSchemasForUpdate:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: constants.ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = { schemaAuthorizationMiddleware };
