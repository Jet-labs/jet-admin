const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { policyUtils } = require("../../utils/policy.utils");

const tableAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
tableAuthorizationMiddleware.populateAuthorizedRowsForRead = async (
  req,
  res,
  next
) => {
  try {
    const { pmUser, state } = req;
    const authorization_policy = state?.authorization_policy;
    const { table_name } = req.params;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "tableAuthorizationMiddleware:populateAuthorizedRows:params",
      params: { pm_user_id, table_name },
    });
    let authorized_rows =
      policyUtils.extractAuthorizedRowsForReadFromPolicyObject({
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
tableAuthorizationMiddleware.populateAuthorizedColumnsForRead = async (
  req,
  res,
  next
) => {
  try {
    const { pmUser, state } = req;
    const authorization_policy = state?.authorization_policy;
    const { table_name } = req.params;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "tableAuthorizationMiddleware:populateAuthorizedColumns:params",
      params: { pm_user_id },
    });
    let authorized_columns =
      policyUtils.extractAuthorizedColumnsForReadFromPolicyObject({
        policyObject: authorization_policy,
        tableName: table_name,
      });

    req.state = { ...req.state, authorized_columns };
    Logger.log("success", {
      message: "tableAuthorizationMiddleware:populateAuthorizedColumns:success",
      params: { pm_user_id, table_name, authorized_columns },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message: "tableAuthorizationMiddleware:populateAuthorizedColumns:catch-1",
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
tableAuthorizationMiddleware.populateAuthorizedIncludeColumnsForRead = async (
  req,
  res,
  next
) => {
  try {
    const { pmUser, state } = req;
    const authorization_policy = state?.authorization_policy;
    const { table_name } = req.params;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message:
        "tableAuthorizationMiddleware:populateAuthorizedIncludeColumnsForRead:params",
      params: { pm_user_id },
    });
    let authorized_include_columns =
      policyUtils.extractAuthorizedIncludeColumnsForReadFromPolicyObject({
        policyObject: authorization_policy,
        tableName: table_name,
      });

    req.state = { ...req.state, authorized_include_columns };
    Logger.log("success", {
      message:
        "tableAuthorizationMiddleware:populateAuthorizedIncludeColumnsForRead:success",
      params: { pm_user_id, table_name, authorized_include_columns },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "tableAuthorizationMiddleware:populateAuthorizedIncludeColumnsForRead:catch-1",
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
    let authorized_rows =
      policyUtils.extractAuthorizedRowsForEditFromPolicyObject({
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
tableAuthorizationMiddleware.authorizeColumnUpdate = async (req, res, next) => {
  try {
    const { pmUser, state, body } = req;
    const authorization_policy = state?.authorization_policy;
    const { table_name } = req.params;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "tableAuthorizationMiddleware:authorizeColumnUpdate:params",
      params: { pm_user_id },
    });

    let authorized_columns =
      policyUtils.extractAuthorizedColumnsForEditFromPolicyObject({
        policyObject: authorization_policy,
        tableName: table_name,
      });
    let error = [];

    if (Array.isArray(authorized_columns)) {
      Object.keys(body).forEach((field) => {
        let s = `${field}`;
        if (!authorized_columns.includes(s)) {
          error.push(s);
        }
      });
    }
    if (authorized_columns === false || error.length > 0) {
      Logger.log("error", {
        message: "tableAuthorizationMiddleware:authorizeColumnUpdate:catch-2",
        params: { error },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    } else {
      Logger.log("success", {
        message: "tableAuthorizationMiddleware:authorizeColumnUpdate:success",
        params: { pm_user_id, table_name },
      });
      return next();
    }
  } catch (error) {
    Logger.log("error", {
      message: "tableAuthorizationMiddleware:authorizeColumnUpdate:catch-1",
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
    let authorization =
      policyUtils.extractAuthorizedForRowAdditionFromPolicyObject({
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
    let authorized_rows =
      policyUtils.extractAuthorizedForRowDeletionFromPolicyObject({
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
