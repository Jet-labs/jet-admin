const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { policyUtils } = require("../../utils/policy.utils");

const dashboardLayoutAuthorizationMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
dashboardLayoutAuthorizationMiddleware.populateAuthorizedDashboardLayoutsForRead =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "dashboardLayoutAuthorizationMiddleware:populateAuthorizedDashboardLayoutsForRead:params",
        params: { pm_user_id },
      });
      let authorized_dashboard_layouts =
        policyUtils.extractAuthorizedDashboardLayoutsForReadFromPolicyObject({
          policyObject: authorization_policy,
        });

      req.state = { ...req.state, authorized_dashboard_layouts };
      Logger.log("success", {
        message:
          "dashboardLayoutAuthorizationMiddleware:populateAuthorizedDashboardLayoutsForRead:success",
        params: { pm_user_id, authorized_dashboard_layouts },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "dashboardLayoutAuthorizationMiddleware:populateAuthorizedDashboardLayoutsForRead:catch-1",
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
dashboardLayoutAuthorizationMiddleware.populateAuthorizedDashboardLayoutsForUpdate =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "dashboardLayoutAuthorizationMiddleware:populateAuthorizedDashboardLayoutsForUpdate:params",
        params: { pm_user_id },
      });
      let authorized_dashboard_layouts =
        policyUtils.extractAuthorizedDashboardLayoutsForUpdateFromPolicyObject({
          policyObject: authorization_policy,
        });

      req.state = { ...req.state, authorized_dashboard_layouts };
      Logger.log("success", {
        message:
          "dashboardLayoutAuthorizationMiddleware:populateAuthorizedDashboardLayoutsForUpdate:success",
        params: { pm_user_id, authorized_dashboard_layouts },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "dashboardLayoutAuthorizationMiddleware:populateAuthorizedDashboardLayoutsForUpdate:catch-1",
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
dashboardLayoutAuthorizationMiddleware.populateAuthorizationForDashboardLayoutAddition =
  async (req, res, next) => {
    try {
      const { pmUser, state } = req;
      const authorization_policy = state?.authorization_policy;
      const pm_user_id = parseInt(pmUser.pm_user_id);
      Logger.log("info", {
        message:
          "dashboardLayoutAuthorizationMiddleware:populateAuthorizationForDashboardLayoutAddition:params",
        params: { pm_user_id },
      });
      let authorizationToAdd =
        policyUtils.extractAuthorizationForDashboardLayoutAddFromPolicyObject({
          policyObject: authorization_policy,
        });

      if (!authorizationToAdd) {
        Logger.log("error", {
          message:
            "dashboardLayoutAuthorizationMiddleware:populateAuthorizationForDashboardLayoutAddition:catch-2",
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
          "dashboardLayoutAuthorizationMiddleware:populateAuthorizationForDashboardLayoutAddition:success",
        params: { pm_user_id, authorizationToAdd },
      });
      return next();
    } catch (error) {
      Logger.log("error", {
        message:
          "dashboardLayoutAuthorizationMiddleware:populateAuthorizationForDashboardLayoutAddition:catch-1",
        params: { error },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.SERVER_ERROR,
      });
    }
  };

module.exports = { dashboardLayoutAuthorizationMiddleware };
