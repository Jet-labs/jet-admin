const { Prisma } = require("@prisma/client");
const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
class DashboardLayoutService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.title
   * @param {any} param0.dashboardLayoutOptions
   * @returns {any|null}
   */
  static addDashboardLayout = async ({ title, dashboardLayoutOptions }) => {
    Logger.log("info", {
      message: "DashboardLayoutService:addDashboardLayout:params",
      params: {
        title,
        dashboardLayoutOptions,
      },
    });
    try {
      let newDashboardLayout = null;
      newDashboardLayout = await prisma.tbl_pm_dashboard_layouts.create({
        data: {
          title: String(title),
          dashboard_layout_options: dashboardLayoutOptions,
        },
      });
      Logger.log("success", {
        message: "DashboardLayoutService:addDashboardLayout:newDashboardLayout",
        params: {
          title,
          newDashboardLayout,
        },
      });
      return newDashboardLayout;
    } catch (error) {
      Logger.log("error", {
        message: "DashboardLayoutService:addDashboardLayout:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.dashboardLayoutID
   * @param {String} param0.title
   * @param {any} param0.dashboardLayoutOptions
   * @param {Boolean|Array<Number>} param0.authorizedDashboardLayouts
   * @returns {any|null}
   */
  static updateDashboardLayout = async ({
    dashboardLayoutID,
    title,
    dashboardLayoutOptions,
    authorizedDashboardLayouts,
  }) => {
    Logger.log("info", {
      message: "DashboardLayoutService:updateDashboardLayout:params",
      params: { dashboardLayoutID, title, dashboardLayoutOptions },
    });
    try {
      if (
        authorizedDashboardLayouts === true ||
        authorizedDashboardLayouts.includes(dashboardLayoutID)
      ) {
        const updatedDashboardLayout =
          await prisma.tbl_pm_dashboard_layouts.update({
            where: {
              pm_dashboard_layout_id: dashboardLayoutID,
            },
            data: {
              title: String(title),
              dashboard_layout_options: dashboardLayoutOptions,
            },
          });
        Logger.log("success", {
          message:
            "DashboardLayoutService:updateDashboardLayout:newDashboardLayout",
          params: {
            updatedDashboardLayout,
          },
        });
        return updatedDashboardLayout;
      } else {
        Logger.log("error", {
          message: "DashboardLayoutService:updateDashboardLayout:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "DashboardLayoutService:updateDashboardLayout:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Boolean|Array<Number>} param0.authorizedDashboardLayouts
   * @returns {any|null}
   */
  static getAllDashboardLayouts = async ({ authorizedDashboardLayouts }) => {
    Logger.log("info", {
      message: "DashboardLayoutService:getAllDashboardLayouts:params",
    });
    try {
      const dashboardLayouts = await prisma.tbl_pm_dashboard_layouts.findMany({
        where:
          authorizedDashboardLayouts === true
            ? {}
            : {
                pm_dashboard_layout_id: {
                  in: authorizedDashboardLayouts,
                },
              },
      });
      Logger.log("info", {
        message:
          "DashboardLayoutService:getAllDashboardLayouts:dashboardLayout",
        params: {
          dashboardLayoutsLength: dashboardLayouts?.length,
        },
      });
      return dashboardLayouts;
    } catch (error) {
      Logger.log("error", {
        message: "DashboardLayoutService:getAllDashboardLayouts:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.dashboardLayoutID
   * @param {Boolean|Array<Number>} param0.authorizedDashboardLayouts
   * @returns {any|null}
   */
  static getDashboardLayoutByID = async ({
    dashboardLayoutID,
    authorizedDashboardLayouts,
  }) => {
    Logger.log("info", {
      message: "DashboardLayoutService:getDashboardLayoutByID:params",
      params: {
        authorizedDashboardLayouts,
      },
    });
    try {
      if (
        authorizedDashboardLayouts === true ||
        authorizedDashboardLayouts.includes(dashboardLayoutID)
      ) {
        const dashboardLayout =
          await prisma.tbl_pm_dashboard_layouts.findUnique({
            where: {
              pm_dashboard_layout_id: dashboardLayoutID,
            },
          });
        Logger.log("info", {
          message:
            "DashboardLayoutService:getDashboardLayoutByID:dashboardLayout",
          params: {
            dashboardLayout,
          },
        });
        return dashboardLayout;
      } else {
        Logger.log("error", {
          message: "DashboardLayoutService:getDashboardLayoutByID:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "DashboardLayoutService:getDashboardLayoutByID:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { DashboardLayoutService };
