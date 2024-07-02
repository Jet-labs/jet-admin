const { Prisma } = require("@prisma/client");
const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
class QueryService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.queryTitle
   * @param {String} param0.queryDescription
   * @param {any} param0.query
   * @returns {any|null}
   */
  static addPGQuery = async ({ queryTitle, queryDescription, query }) => {
    Logger.log("info", {
      message: "DashboardService:addPGQuery:params",
      params: {
        queryTitle,
        queryDescription,
        query,
      },
    });
    try {
      const newPGSQLQuery = await prisma.tbl_pm_postgres_queries.create({
        data: {
          pm_postgres_query: query,
        },
      });
      const newMasterQuery = await prisma.tbl_pm_master_queries.create({
        data: {
          pm_query_id: newPGSQLQuery.pm_postgres_query_id,
          pm_query_type: constants.QUERY_TYPE.POSTGRE_QUERY.value,
          pm_master_query_title: queryTitle,
          pm_master_query_description: queryDescription,
        },
      });

      Logger.log("success", {
        message: "DashboardService:addPGQuery:newMasterQuery",
        params: {
          newPGSQLQuery,
          newMasterQuery,
        },
      });
      return newMasterQuery;
    } catch (error) {
      Logger.log("error", {
        message: "DashboardService:addPGQuery:catch-1",
        params: { error },
      });
      throw error;
    }
  };

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
   * @param {Boolean|Array<Number>} param0.authorizedQueries
   * @returns {any|null}
   */
  static getAllQueries = async ({ authorizedQueries }) => {
    Logger.log("info", {
      message: "QueryService:getAllQueries:params",
    });
    try {
      const masterQueries = await prisma.tbl_pm_master_queries.findMany({
        where:
          authorizedQueries === true
            ? {}
            : {
                pm_master_query_id: {
                  in: authorizedQueries,
                },
              },
      });
      Logger.log("info", {
        message: "QueryService:getAllQueries:masterQueries",
        params: {
          masterQueries,
          authorizedQueries,
        },
      });
      const masterQueryPromises = masterQueries.map(async (masterQuery) => {
        let query = null;
        switch (masterQuery.pm_query_type) {
          case constants.QUERY_TYPE.POSTGRE_QUERY.value: {
            query = await prisma.tbl_pm_postgres_queries.findUnique({
              where: {
                pm_postgres_query_id: masterQuery.pm_query_id,
              },
            });
            query = {
              ...masterQuery,
              query: { ...query, pm_query_type: masterQuery.pm_query_type },
            };
            break;
          }

          default: {
            query = await prisma.tbl_pm_postgres_queries.findUnique({
              where: {
                pm_postgres_query_id: masterQuery.pm_query_id,
              },
            });
            query = {
              ...masterQuery,
              query: { ...query, pm_query_type: masterQuery.pm_query_type },
            };
            break;
          }
        }
        return query;
      });
      const allQueries = await Promise.all(masterQueryPromises);
      Logger.log("info", {
        message: "QueryService:getAllQueries:query",
        params: {
          querysLength: allQueries?.length,
        },
      });
      return allQueries;
    } catch (error) {
      Logger.log("error", {
        message: "QueryService:getAllQueries:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.queryID
   * @param {Boolean|Array<Number>} param0.authorizedQueries
   * @returns {any|null}
   */
  static getQueryByID = async ({ queryID, authorizedQueries }) => {
    Logger.log("info", {
      message: "QueryService:getQueryByID:params",
    });
    try {
      const masterQuery =
        authorizedQueries === true || authorizedQueries.includes(queryID)
          ? await prisma.tbl_pm_master_queries.findUnique({
              where: { pm_master_query_id: queryID },
            })
          : null;
      Logger.log("info", {
        message: "QueryService:getQueryByID:masterQuery",
        params: {
          masterQuery,
          authorizedQueries,
        },
      });
      if (!masterQuery) {
        return null;
      }
      let query;
      switch (masterQuery.pm_query_type) {
        case constants.QUERY_TYPE.POSTGRE_QUERY.value: {
          query = await prisma.tbl_pm_postgres_queries.findUnique({
            where: {
              pm_postgres_query_id: masterQuery.pm_query_id,
            },
          });
          break;
        }

        default: {
          query = await prisma.tbl_pm_postgres_queries.findUnique({
            where: {
              pm_postgres_query_id: masterQuery.pm_query_id,
            },
          });
          break;
        }
      }

      Logger.log("info", {
        message: "QueryService:getQueryByID:query",
        params: {
          masterQuery: { ...masterQuery, query },
        },
      });
      return { ...masterQuery, query };
    } catch (error) {
      Logger.log("error", {
        message: "QueryService:getQueryByID:catch-1",
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
  static runPGQuery = async ({ query }) => {
    Logger.log("info", {
      message: "QueryService:runPGQuery:params",
    });
    try {
      const result = await prisma.$queryRaw`${Prisma.raw(query)}`;

      Logger.log("info", {
        message: "QueryService:runPGQuery:query",
        params: {
          result: Array.isArray(query) ? { resultLength: query.length } : query,
        },
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "QueryService:runPGQuery:catch-1",
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

module.exports = { QueryService };
