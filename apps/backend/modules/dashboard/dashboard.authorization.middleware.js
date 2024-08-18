const constants = require("../../constants");
const Logger = require("../../utils/logger");
const {
  policyAuthorizations,
} = require("../../utils/policy-utils/policy-authorization");

const dashboardAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
dashboardAuthorizationMiddleware.populateAuthorizedDashboardsForRead = async (
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
        "dashboardAuthorizationMiddleware:populateAuthorizedDashboardsForRead:params",
      params: { pm_user_id },
    });
    let authorized_dashboards =
      policyAuthorizations.extractDashboardReadAuthorization({
        policyObject: authorization_policy,
      });

    req.state = { ...req.state, authorized_dashboards };
    Logger.log("success", {
      message:
        "dashboardAuthorizationMiddleware:populateAuthorizedDashboardsForRead:success",
      params: { pm_user_id, authorized_dashboards },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "dashboardAuthorizationMiddleware:populateAuthorizedDashboardsForRead:catch-1",
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
dashboardAuthorizationMiddleware.populateAuthorizedDashboardsForUpdate = async (
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
        "dashboardAuthorizationMiddleware:populateAuthorizedDashboardsForUpdate:params",
      params: { pm_user_id },
    });
    let authorized_dashboards =
      policyAuthorizations.extractDashboardEditAuthorization({
        policyObject: authorization_policy,
      });

    req.state = { ...req.state, authorized_dashboards };
    Logger.log("success", {
      message:
        "dashboardAuthorizationMiddleware:populateAuthorizedDashboardsForUpdate:success",
      params: { pm_user_id, authorized_dashboards },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "dashboardAuthorizationMiddleware:populateAuthorizedDashboardsForUpdate:catch-1",
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
dashboardAuthorizationMiddleware.populateAuthorizedDashboardsForDelete = async (
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
        "dashboardAuthorizationMiddleware:populateAuthorizedDashboardsForDelete:params",
      params: { pm_user_id },
    });
    let authorized_dashboards =
      policyAuthorizations.extractDashboardDeleteAuthorization({
        policyObject: authorization_policy,
      });

    req.state = { ...req.state, authorized_dashboards };
    Logger.log("success", {
      message:
        "dashboardAuthorizationMiddleware:populateAuthorizedDashboardsForDelete:success",
      params: { pm_user_id, authorized_dashboards },
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message:
        "dashboardAuthorizationMiddleware:populateAuthorizedDashboardsForDelete:catch-1",
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
dashboardAuthorizationMiddleware.populateAuthorizationForDashboardAddition =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "dashboardAuthorizationMiddleware:populateAuthorizationForDashboardAddition:params",
        params: { pm_user_id },
      });
      let authorizationToAdd =
        policyAuthorizations.extractDashboardAddAuthorization({
          policyObject: authorization_policy,
        });

      if (!authorizationToAdd) {
        Logger.log("error", {
          message:
            "dashboardAuthorizationMiddleware:populateAuthorizationForDashboardAddition:catch-2",
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
          "dashboardAuthorizationMiddleware:populateAuthorizationForDashboardAddition:success",
        params: { pm_user_id, authorizationToAdd },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "dashboardAuthorizationMiddleware:populateAuthorizationForDashboardAddition:catch-1",
        params: { error },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.SERVER_ERROR,
      });
    }
  };

module.exports = { dashboardAuthorizationMiddleware };
