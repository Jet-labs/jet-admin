const constants = require("../../constants");
const Logger = require("../../utils/logger");
const {
  policyAuthorizations,
} = require("../../utils/policy-utils/policy-authorization");

const tableAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
tableAuthorizationMiddleware.authorizeRowRead = async (req, res, next) => {
  try {
    const { pmUser, state } = req;
    const authorization_policy = state?.authorization_policy;
    const { table_name } = req.params;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "tableAuthorizationMiddleware:populateAuthorizedRows:params",
      params: { pm_user_id, table_name },
    });
    let authorized_rows = policyAuthorizations.extractRowReadAuthorization({
      policyObject: authorization_policy,
      tableName: table_name,
    });

    req.state = { ...req.state, authorized_rows };
    Logger.log("success", {
      message: "tableAuthorizationMiddleware:populateAuthorizedRows:success",
      params: { pm_user_id, table_name, authorized_rows },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message: "tableAuthorizationMiddleware:populateAuthorizedRows:catch-1",
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
tableAuthorizationMiddleware.authorizeRowUpdate = async (req, res, next) => {
  try {
    const { pmUser, state, body } = req;
    const authorization_policy = state?.authorization_policy;
    const { table_name, query } = req.params;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "tableAuthorizationMiddleware:authorizeRowUpdate:params",
      params: { pm_user_id, table_name, query },
    });
    let authorized_rows = policyAuthorizations.extractRowEditAuthorization({
      policyObject: authorization_policy,
      tableName: table_name,
    });

    if (authorized_rows === false) {
      Logger.log("error", {
        message: "tableAuthorizationMiddleware:authorizeRowUpdate:catch-2",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    } else {
      Logger.log("success", {
        message: "tableAuthorizationMiddleware:authorizeRowUpdate:success",
        params: { pm_user_id, table_name },
      });
      req.state = { ...req.state, authorized_rows };
      return next();
    }
  } catch (error) {
    Logger.log("error", {
      message: "tableAuthorizationMiddleware:authorizeRowUpdate:catch-1",
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
tableAuthorizationMiddleware.authorizeRowAddition = async (req, res, next) => {
  try {
    const { pmUser, state, body } = req;
    const authorization_policy = state?.authorization_policy;
    const { table_name } = req.params;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "tableAuthorizationMiddleware:authorizeRowAddition:params",
      params: { pm_user_id, table_name },
    });
    let authorization = policyAuthorizations.extractRowAddAuthorization({
      policyObject: authorization_policy,
      tableName: table_name,
    });

    if (!authorization) {
      Logger.log("error", {
        message: "tableAuthorizationMiddleware:authorizeRowAddition:catch-2",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    } else {
      Logger.log("success", {
        message: "tableAuthorizationMiddleware:authorizeRowAddition:success",
        params: { pm_user_id, table_name },
      });
      return next();
    }
  } catch (error) {
    Logger.log("error", {
      message: "tableAuthorizationMiddleware:authorizeRowAddition:catch-1",
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
tableAuthorizationMiddleware.authorizeRowDeletion = async (req, res, next) => {
  try {
    const { pmUser, state } = req;
    const authorization_policy = state?.authorization_policy;
    const { table_name, query } = req.params;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "tableAuthorizationMiddleware:authorizeRowDeletion:params",
      params: { pm_user_id, table_name, query },
    });
    let authorized_rows = policyAuthorizations.extractRowDeleteAuthorization({
      policyObject: authorization_policy,
      tableName: table_name,
    });

    if (!authorized_rows) {
      Logger.log("error", {
        message: "tableAuthorizationMiddleware:authorizeRowDeletion:catch-2",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    } else {
      Logger.log("success", {
        message: "tableAuthorizationMiddleware:authorizeRowDeletion:success",
        params: { pm_user_id, table_name, query },
      });
      req.state = { ...req.state, authorized_rows };
      return next();
    }
  } catch (error) {
    Logger.log("error", {
      message: "tableAuthorizationMiddleware:authorizeRowDeletion:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: constants.ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = { tableAuthorizationMiddleware };
