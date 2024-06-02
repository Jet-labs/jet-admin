const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const { DashboardService } = require("../services/dashboard.services");

const dashboardController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
dashboardController.getAllDashboards = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_dashboards = state.authorized_dashboards;

    Logger.log("info", {
      message: "dashboardController:getAllDashboards:params",
      params: { pm_user_id },
    });

    const dashboards = await DashboardService.getAllDashboards({
      authorizedDashboards: authorized_dashboards,
    });

    Logger.log("success", {
      message: "dashboardController:getAllDashboards:success",
      params: { pm_user_id, dashboards },
    });

    return res.json({
      success: true,
      dashboards: dashboards,
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardController:getAllDashboards:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
dashboardController.getDashboardByID = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_dashboard_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_dashboards = state.authorized_dashboards;

    Logger.log("info", {
      message: "dashboardController:getDashboardByID:params",
      params: { pm_user_id, pm_dashboard_id },
    });

    const dashboard = await DashboardService.getDashboardByID({
      dashboardID: pm_dashboard_id,
      authorizedDashboards: authorized_dashboards,
    });

    Logger.log("success", {
      message: "dashboardController:getDashboardByID:success",
      params: { pm_user_id, dashboard },
    });

    return res.json({
      success: true,
      dashboard: dashboard,
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardController:getDashboardByID:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
dashboardController.addDashboard = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "dashboardController:addDashboard:params",
      params: { pm_user_id, body },
    });

    const dashboard = await DashboardService.addDashboard({
      dashboardTitle: body.dashboard_title,
      dashboardDescription: body.dashboard_description,
      dashboardOptions: body.dashboard_options,
    });

    Logger.log("success", {
      message: "dashboardController:addDashboard:success",
      params: { pm_user_id, dashboard },
    });

    return res.json({
      success: true,
      dashboard,
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardController:addDashboard:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
dashboardController.updateDashboard = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_dashboards = state.authorized_dashboards;

    Logger.log("info", {
      message: "dashboardController:updateDashboard:params",
      params: { pm_user_id, body },
    });

    const dashboard = await DashboardService.updateDashboard({
      dashboardID: parseInt(body.pm_dashboard_id),
      dashboardTitle: body.dashboard_title,
      dashboardDescription: body.dashboard_description,
      dashboardOptions: body.dashboard_options,
      authorizedDashboards: authorized_dashboards,
    });

    Logger.log("success", {
      message: "dashboardController:updateDashboard:success",
      params: { pm_user_id, dashboard },
    });

    return res.json({
      success: true,
      dashboard,
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardController:updateDashboard:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
dashboardController.deleteDashboard = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_dashboard_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_dashboards = state.authorized_dashboards;

    Logger.log("info", {
      message: "dashboardController:deleteDashboard:params",
      params: { pm_user_id, pm_dashboard_id },
    });

    await DashboardService.deleteDashboard({
      dashboardID: pm_dashboard_id,
      authorizedDashboards: authorized_dashboards,
    });

    Logger.log("success", {
      message: "dashboardController:deleteDashboard:success",
      params: { pm_user_id },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardController:deleteDashboard:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { dashboardController };
