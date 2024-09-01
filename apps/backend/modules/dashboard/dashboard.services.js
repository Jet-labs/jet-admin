const constants = require("../../constants");
const Logger = require("../../utils/logger");
const {
  dashboardQueryUtils,
} = require("../../utils/postgres-utils/dashboard-queries");
const { sqliteDB } = require("../../db/sqlite");
class DashboardService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.dashboardTitle
   * @param {String} param0.dashboardDescription
   * @param {any} param0.dashboardOptions
   * @returns {any|null}
   */
  static addDashboard = async ({
    dashboardTitle,
    dashboardDescription,
    dashboardOptions,
  }) => {
    Logger.log("info", {
      message: "DashboardService:addDashboard:params",
      params: {
        dashboardTitle,
        dashboardDescription,
        dashboardOptions,
      },
    });
    try {
      const newDashboardQuery = sqliteDB.prepare(
        dashboardQueryUtils.addDashboard()
      );
      const result = newDashboardQuery.run(
        String(dashboardTitle),
        String(dashboardDescription),
        JSON.stringify(dashboardOptions)
      );

      Logger.log("success", {
        message: "DashboardService:addDashboard:newDashboard",
        params: {
          dashboardTitle,
        },
      });
      return true;
    } catch (error) {
      Logger.log("error", {
        message: "DashboardService:addDashboard:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmDashboardID
   * @param {String} param0.dashboardTitle
   * @param {String} param0.dashboardDescription
   * @param {any} param0.dashboardOptions
   * @param {Boolean|Array<Number>} param0.authorizedDashboards
   * @returns {any|null}
   */
  static updateDashboard = async ({
    pmDashboardID,
    dashboardTitle,
    dashboardDescription,
    dashboardOptions,
    authorizedDashboards,
  }) => {
    Logger.log("info", {
      message: "DashboardService:updateDashboard:params",
      params: {
        pmDashboardID,
        dashboardTitle,
        dashboardDescription,
        dashboardOptions,
      },
    });
    try {
      if (
        authorizedDashboards === true ||
        authorizedDashboards.includes(pmDashboardID)
      ) {
        const updateDashboardQuery = sqliteDB.prepare(
          dashboardQueryUtils.updateDashboard()
        );

        // Execute the update
        updateDashboardQuery.run(
          String(dashboardTitle),
          String(dashboardDescription),
          JSON.stringify(dashboardOptions),
          pmDashboardID
        );
        Logger.log("success", {
          message: "DashboardService:updateDashboard:success",
        });
        return true;
      } else {
        Logger.log("error", {
          message: "DashboardService:updateDashboard:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "DashboardService:updateDashboard:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Boolean|Array<Number>} param0.authorizedDashboards
   * @returns {any|null}
   */
  static getAllDashboards = async ({ authorizedDashboards }) => {
    Logger.log("info", {
      message: "DashboardService:getAllDashboards:params",
    });
    try {
      let dashboards;
      if (authorizedDashboards === true) {
        // Fetch all dashboards if authorizedDashboards is true
        const getAllDashboardsQuery = sqliteDB.prepare(
          dashboardQueryUtils.getAllDashboards()
        );
        dashboards = getAllDashboardsQuery.all();
      } else {
        // Fetch dashboards where pm_dashboard_id is in the authorizedDashboards array
        const getAllDashboardsQuery = sqliteDB.prepare(
          dashboardQueryUtils.getAllDashboards(authorizedDashboards)
        );
        dashboards = getAllDashboardsQuery.all(...authorizedDashboards);
      }
      Logger.log("info", {
        message: "DashboardService:getAllDashboards:dashboard",
        params: {
          dashboardsLength: dashboards?.length,
        },
      });
      return dashboards;
    } catch (error) {
      Logger.log("error", {
        message: "DashboardService:getAllDashboards:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmDashboardID
   * @param {Boolean|Array<Number>} param0.authorizedDashboards
   * @returns {any|null}
   */
  static getDashboardByID = async ({ pmDashboardID, authorizedDashboards }) => {
    Logger.log("info", {
      message: "DashboardService:getDashboardByID:params",
      params: {
        pmDashboardID,
        authorizedDashboards,
      },
    });
    try {
      if (
        authorizedDashboards === true ||
        authorizedDashboards.includes(pmDashboardID)
      ) {
        const getDashboardByIDQuery = sqliteDB.prepare(
          dashboardQueryUtils.getDashboardByID()
        );
        const dashboard = getDashboardByIDQuery.get(pmDashboardID);
        Logger.log("info", {
          message: "DashboardService:getDashboardByID:dashboard",
          params: {
            dashboard,
          },
        });
        return dashboard;
      } else {
        Logger.log("error", {
          message: "DashboardService:getDashboardByID:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "DashboardService:getDashboardByID:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmDashboardID
   * @param {Boolean|Array<Number>} param0.authorizedDashboards
   * @returns {any|null}
   */
  static deleteDashboard = async ({ pmDashboardID, authorizedDashboards }) => {
    Logger.log("info", {
      message: "DashboardService:deleteDashboard:params",
      params: {
        pmDashboardID,
        authorizedDashboards,
      },
    });
    try {
      if (
        authorizedDashboards === true ||
        authorizedDashboards.includes(pmDashboardID)
      ) {
        const deleteDashboardQuery = sqliteDB.prepare(
          dashboardQueryUtils.deleteDashboard()
        );
        // Execute the delete
        deleteDashboardQuery.run(pmDashboardID);
        Logger.log("success", {
          message: "DashboardService:deleteDashboard:success",
        });
        return true;
      } else {
        Logger.log("error", {
          message: "DashboardService:deleteDashboard:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "DashboardService:deleteDashboard:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { DashboardService };
