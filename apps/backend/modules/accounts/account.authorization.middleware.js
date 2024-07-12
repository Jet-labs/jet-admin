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
accountAuthorizationMiddleware.populateAuthorizedAccountsForRead = async (
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
        "accountAuthorizationMiddleware:populateAuthorizedAccountsForRead:params",
      params: { pm_user_id },
    });
    let authorized_rows =
      policyUtils.extractAuthorizedRowsForReadFromPolicyObject({
        policyObject: authorization_policy,
        tableName: constants.STRINGS.PM_USER_TABLE,
      });

    req.state = { ...req.state, authorized_rows };
    Logger.log("success", {
      message:
        "accountAuthorizationMiddleware:populateAuthorizedAccountsForRead:success",
      params: { pm_user_id, table_name, authorized_rows },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "accountAuthorizationMiddleware:populateAuthorizedAccountsForRead:catch-1",
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
accountAuthorizationMiddleware.populateAuthorizedColumnsForRead = async (
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
        "accountAuthorizationMiddleware:populateAuthorizedColumns:params",
      params: { pm_user_id },
    });
    let authorized_columns =
      policyUtils.extractAuthorizedColumnsForReadFromPolicyObject({
        policyObject: authorization_policy,
        tableName: constants.STRINGS.PM_USER_TABLE,
      });

    req.state = { ...req.state, authorized_columns };
    Logger.log("success", {
      message:
        "accountAuthorizationMiddleware:populateAuthorizedColumns:success",
      params: { pm_user_id, authorized_columns },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "accountAuthorizationMiddleware:populateAuthorizedColumns:catch-1",
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
accountAuthorizationMiddleware.populateAuthorizedIncludeColumnsForRead = async (
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
        "accountAuthorizationMiddleware:populateAuthorizedIncludeColumnsForRead:params",
      params: { pm_user_id },
    });
    let authorized_include_columns =
      policyUtils.extractAuthorizedIncludeColumnsForReadFromPolicyObject({
        policyObject: authorization_policy,
        tableName: constants.STRINGS.PM_USER_TABLE,
      });

    req.state = { ...req.state, authorized_include_columns };
    Logger.log("success", {
      message:
        "accountAuthorizationMiddleware:populateAuthorizedIncludeColumnsForRead:success",
      params: { pm_user_id, authorized_include_columns },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "accountAuthorizationMiddleware:populateAuthorizedIncludeColumnsForRead:catch-1",
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
    let authorized_rows =
      policyUtils.extractAuthorizedRowsForEditFromPolicyObject({
        policyObject: authorization_policy,
        tableName: constants.STRINGS.PM_USER_TABLE,
      });

    if (authorized_rows === false) {
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
      req.state = { ...req.state, authorized_rows };
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
accountAuthorizationMiddleware.authorizeColumnUpdate = async (
  req,
  res,
  next
) => {
  try {
    const { pmUser, state, body } = req;
    const authorization_policy = state?.authorization_policy;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "accountAuthorizationMiddleware:authorizeColumnUpdate:params",
      params: { pm_user_id },
    });

    let authorized_columns =
      policyUtils.extractAuthorizedColumnsForEditFromPolicyObject({
        policyObject: authorization_policy,
        tableName: constants.STRINGS.PM_USER_TABLE,
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
        message: "accountAuthorizationMiddleware:authorizeColumnUpdate:catch-2",
        params: { error },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.PERMISSION_DENIED,
      });
    } else {
      Logger.log("success", {
        message: "accountAuthorizationMiddleware:authorizeColumnUpdate:success",
        params: { pm_user_id },
      });
      return next();
    }
  } catch (error) {
    Logger.log("error", {
      message: "accountAuthorizationMiddleware:authorizeColumnUpdate:catch-1",
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
      policyUtils.extractAuthorizedForRowAdditionFromPolicyObject({
        policyObject: authorization_policy,
        tableName: constants.STRINGS.PM_USER_TABLE,
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
    let authorized_rows =
      policyUtils.extractAuthorizedForRowDeletionFromPolicyObject({
        policyObject: authorization_policy,
        tableName: constants.STRINGS.PM_USER_TABLE,
      });

    if (!authorized_rows) {
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
      req.state = { ...req.state, authorized_rows };
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
