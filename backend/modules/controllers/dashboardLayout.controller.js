const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const {
  DashboardLayoutService,
} = require("../services/dashboardLayout.services");

const dashboardLayoutController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
dashboardLayoutController.addDashboardLayout = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "dashboardLayoutController:addDashboardLayout:params",
      params: { pm_user_id, body },
    });

    const newDashboardLayout = await DashboardLayoutService.addDashboardLayout({
      title: body.dashboard_layout_title,
      dashboardLayoutOptions: body.dashboard_layout_options,
    });

    Logger.log("success", {
      message: "dashboardLayoutController:addDashboardLayout:success",
      params: { pm_user_id, newDashboardLayout },
    });

    return res.json({
      success: true,
      row: newDashboardLayout,
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardLayoutController:addDashboardLayout:catch-1",
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
dashboardLayoutController.updateDashboardLayout = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_dashboardLayouts = state.authorized_dashboardLayouts;

    Logger.log("info", {
      message: "dashboardLayoutController:updateDashboardLayout:params",
      params: { pm_user_id, body },
    });

    const updatedDashboardLayout =
      await DashboardLayoutService.updateDashboardLayout({
        dashboardLayoutID: parseInt(body.dashboardLayout_id),
        title: body.dashboard_layout_title,
        dashboardLayoutOptions: body.dashboard_layout_options,
        authorizedDashboardLayouts: authorized_dashboardLayouts,
      });

    Logger.log("success", {
      message: "dashboardLayoutController:updateDashboardLayout:success",
      params: { pm_user_id, updatedDashboardLayout },
    });

    return res.json({
      success: true,
      dashboardLayout: updatedDashboardLayout,
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardLayoutController:updateDashboardLayout:catch-1",
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
dashboardLayoutController.getAllDashboardLayouts = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_dashboardLayouts = state.authorized_dashboardLayouts;

    Logger.log("info", {
      message: "dashboardLayoutController:getAllDashboardLayouts:params",
      params: { pm_user_id },
    });

    const dashboardLayouts =
      await DashboardLayoutService.getAllDashboardLayouts({
        authorizedDashboardLayouts: authorized_dashboardLayouts,
      });

    Logger.log("success", {
      message: "dashboardLayoutController:getAllDashboardLayouts:success",
      params: { pm_user_id, dashboardLayouts },
    });

    return res.json({
      success: true,
      dashboardLayouts: dashboardLayouts,
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardLayoutController:getAllDashboardLayouts:catch-1",
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
dashboardLayoutController.getDashboardLayoutByID = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_dashboardLayouts = state.authorized_dashboardLayouts;

    Logger.log("info", {
      message: "dashboardLayoutController:getDashboardLayoutByID:params",
      params: { pm_user_id },
    });

    const dashboardLayouts =
      await DashboardLayoutService.getDashboardLayoutByID({
        dashboardLayoutID: id,
        authorizedDashboardLayouts: authorized_dashboardLayouts,
      });

    Logger.log("success", {
      message: "dashboardLayoutController:getDashboardLayoutByID:success",
      params: { pm_user_id, dashboardLayouts },
    });

    return res.json({
      success: true,
      dashboardLayouts: dashboardLayouts,
    });
  } catch (error) {
    Logger.log("error", {
      message: "dashboardLayoutController:getDashboardLayoutByID:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { dashboardLayoutController };
