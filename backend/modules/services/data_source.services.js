const { Prisma } = require("@prisma/client");
const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
class DataSourceService {
  constructor() {}

  // /**
  //  *
  //  * @param {object} param0
  //  * @param {String} param0.dashboardTitle
  //  * @param {String} param0.dashboardDescription
  //  * @param {any} param0.dashboardOptions
  //  * @returns {any|null}
  //  */
  // static addDashboard = async ({
  //   dashboardTitle,
  //   dashboardDescription,
  //   dashboardOptions,
  // }) => {
  //   Logger.log("info", {
  //     message: "DashboardService:addDashboard:params",
  //     params: {
  //       dashboardTitle,
  //       dashboardDescription,
  //       dashboardOptions,
  //     },
  //   });
  //   try {
  //     let newDashboard = null;
  //     const _graphIDs = [];
  //     if (
  //       dashboardOptions.graph_ids &&
  //       Array.isArray(dashboardOptions.graph_ids)
  //     ) {
  //       dashboardOptions.graph_ids.forEach((graph) => {
  //         _graphIDs.push(graph.graphID);
  //       });
  //     }
  //     newDashboard = await prisma.tbl_pm_dashboards.create({
  //       data: {
  //         dashboard_title: String(dashboardTitle),
  //         dashboard_description: String(dashboardDescription),
  //         dashboard_options: dashboardOptions,
  //         dashboard_graph_ids: _graphIDs,
  //       },
  //     });
  //     Logger.log("success", {
  //       message: "DashboardService:addDashboard:newDashboard",
  //       params: {
  //         dashboardTitle,
  //         newDashboard,
  //       },
  //     });
  //     return newDashboard;
  //   } catch (error) {
  //     Logger.log("error", {
  //       message: "DashboardService:addDashboard:catch-1",
  //       params: { error },
  //     });
  //     throw error;
  //   }
  // };

  // /**
  //  *
  //  * @param {object} param0
  //  * @param {Number} param0.dashboardID
  //  * @param {String} param0.dashboardTitle
  //  * @param {String} param0.dashboardDescription
  //  * @param {any} param0.dashboardOptions
  //  * @param {Boolean|Array<Number>} param0.authorizedDashboards
  //  * @returns {any|null}
  //  */
  // static updateDashboard = async ({
  //   dashboardID,
  //   dashboardTitle,
  //   dashboardDescription,
  //   dashboardOptions,
  //   authorizedDashboards,
  // }) => {
  //   Logger.log("info", {
  //     message: "DashboardService:updateDashboard:params",
  //     params: {
  //       dashboardID,
  //       dashboardTitle,
  //       dashboardDescription,
  //       dashboardOptions,
  //     },
  //   });
  //   try {
  //     if (
  //       authorizedDashboards === true ||
  //       authorizedDashboards.includes(dashboardID)
  //     ) {
  //       const _graphIDs = [];
  //       if (
  //         dashboardOptions.graph_ids &&
  //         Array.isArray(dashboardOptions.graph_ids)
  //       ) {
  //         dashboardOptions.graph_ids.forEach((graph)=>{
  //           _graphIDs.push(graph.graphID)
  //         })
  //       }
  //       const updatedDashboard = await prisma.tbl_pm_dashboards.update({
  //         where: {
  //           pm_dashboard_id: dashboardID,
  //         },
  //         data: {
  //           dashboard_title: String(dashboardTitle),
  //           dashboard_description: String(dashboardDescription),
  //           dashboard_options: dashboardOptions,
  //           dashboard_graph_ids: _graphIDs,
  //         },
  //       });
  //       Logger.log("success", {
  //         message: "DashboardService:updateDashboard:newDashboard",
  //         params: {
  //           updatedDashboard,
  //         },
  //       });
  //       return updatedDashboard;
  //     } else {
  //       Logger.log("error", {
  //         message: "DashboardService:updateDashboard:catch-2",
  //         params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
  //       });
  //       throw constants.ERROR_CODES.PERMISSION_DENIED;
  //     }
  //   } catch (error) {
  //     Logger.log("error", {
  //       message: "DashboardService:updateDashboard:catch-1",
  //       params: { error },
  //     });
  //     throw error;
  //   }
  // };

  /**
   *
   * @param {object} param0
   * @param {Boolean|Array<Number>} param0.authorizedDataSources
   * @returns {any|null}
   */
  static getAllDataSources = async ({ authorizedDataSources }) => {
    Logger.log("info", {
      message: "DataSourceService:getAllDataSources:params",
    });
    try {
      const dataSources = await prisma.tbl_pm_data_sources.findMany({
        where:
          authorizedDataSources === true
            ? {}
            : {
                pm_data_source_id: {
                  in: authorizedDataSources,
                },
              },
      });
      Logger.log("info", {
        message: "DataSourceService:getAllDataSources:data_source",
        params: {
          dataSourcesLength: dataSources?.length,
        },
      });
      return dataSources;
    } catch (error) {
      Logger.log("error", {
        message: "DataSourceService:getAllDataSources:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.query
   * @returns {any|null}
   */
  static runPGQueryDataSource = async ({ query }) => {
    Logger.log("info", {
      message: "DataSourceService:runPGQueryDataSource:params",
    });
    try {
      const result = await prisma.$queryRaw`${Prisma.raw(query)}`;

      Logger.log("info", {
        message: "DataSourceService:runPGQueryDataSource:data_source",
        params: {
          result: Array.isArray(query) ? { resultLength: query.length } : query,
        },
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "DataSourceService:runPGQueryDataSource:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  // /**
  //  *
  //  * @param {object} param0
  //  * @param {Number} param0.dashboardID
  //  * @param {Boolean|Array<Number>} param0.authorizedDashboards
  //  * @returns {any|null}
  //  */
  // static getDashboardByID = async ({ dashboardID, authorizedDashboards }) => {
  //   Logger.log("info", {
  //     message: "DashboardService:getDashboardByID:params",
  //     params: {
  //       dashboardID,
  //       authorizedDashboards,
  //     },
  //   });
  //   try {
  //     if (
  //       authorizedDashboards === true ||
  //       authorizedDashboards.includes(dashboardID)
  //     ) {
  //       const dashboard = await prisma.tbl_pm_dashboards.findUnique({
  //         where: {
  //           pm_dashboard_id: dashboardID,
  //         },
  //       });
  //       Logger.log("info", {
  //         message: "DashboardService:getDashboardByID:dashboard",
  //         params: {
  //           dashboard,
  //         },
  //       });
  //       return dashboard;
  //     } else {
  //       Logger.log("error", {
  //         message: "DashboardService:getDashboardByID:catch-2",
  //         params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
  //       });
  //       throw constants.ERROR_CODES.PERMISSION_DENIED;
  //     }
  //   } catch (error) {
  //     Logger.log("error", {
  //       message: "DashboardService:getDashboardByID:catch-1",
  //       params: { error },
  //     });
  //     throw error;
  //   }
  // };

  // /**
  //  *
  //  * @param {object} param0
  //  * @param {Number} param0.dashboardID
  //  * @param {Boolean|Array<Number>} param0.authorizedDashboards
  //  * @returns {any|null}
  //  */
  // static deleteDashboard = async ({ dashboardID, authorizedDashboards }) => {
  //   Logger.log("info", {
  //     message: "DashboardService:deleteDashboard:params",
  //     params: {
  //       dashboardID,
  //       authorizedDashboards,
  //     },
  //   });
  //   try {
  //     if (
  //       authorizedDashboards === true ||
  //       authorizedDashboards.includes(dashboardID)
  //     ) {
  //       const dashboard = await prisma.tbl_pm_dashboards.delete({
  //         where: {
  //           pm_dashboard_id: dashboardID,
  //         },
  //       });
  //       Logger.log("info", {
  //         message: "DashboardService:deleteDashboard:dashboard",
  //         params: {
  //           dashboard,
  //         },
  //       });
  //       return true;
  //     } else {
  //       Logger.log("error", {
  //         message: "DashboardService:deleteDashboard:catch-2",
  //         params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
  //       });
  //       throw constants.ERROR_CODES.PERMISSION_DENIED;
  //     }
  //   } catch (error) {
  //     Logger.log("error", {
  //       message: "DashboardService:deleteDashboard:catch-1",
  //       params: { error },
  //     });
  //     throw error;
  //   }
  // };
}

module.exports = { DataSourceService };
