const { prisma } = require("../../db/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { runQuery } = require("./processors/postgresql");

class QueryService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.pmQueryTitle
   * @param {String} param0.pmQueryType
   * @param {String} param0.pmQueryDescription
   * @param {JSON} param0.pmQuery
   * @param {Array} param0.pmQueryArgs
   * @returns {any|null}
   */
  static addQuery = async ({
    pmQueryTitle,
    pmQueryType,
    pmQueryDescription,
    pmQuery,
    pmQueryArgs,
  }) => {
    Logger.log("info", {
      message: "DashboardService:addQuery:params",
      params: {
        pmQueryTitle,
        pmQueryDescription,
        pmQueryType,
        pmQuery,
        pmQueryArgs,
      },
    });
    try {
      const newQuery = await prisma.tbl_pm_queries.create({
        data: {
          pm_query_type: pmQueryType,
          pm_query_title: pmQueryTitle,
          pm_query_description: pmQueryDescription,
          pm_query: pmQuery,
          pm_query_args: pmQueryArgs,
        },
      });

      Logger.log("success", {
        message: "DashboardService:addQuery:newQuery",
        params: {
          newQuery,
        },
      });
      return newQuery;
    } catch (error) {
      Logger.log("error", {
        message: "DashboardService:addQuery:catch-1",
        params: { error },
      });
      throw error;
    }
  };
  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmQueryID
   * @param {String} param0.pmQueryTitle
   * @param {String} param0.pmQueryDescription
   * @param {JSON} param0.pmQuery
   * @param {Array} param0.pmQueryArgs
   * @param {Boolean|Array<Number>} param0.authorizedQueries
   * @returns {any|null}
   */
  static updateQuery = async ({
    pmQueryID,
    pmQueryTitle,
    pmQueryDescription,
    pmQuery,
    pmQueryArgs,
    authorizedQueries,
  }) => {
    Logger.log("info", {
      message: "DashboardService:updateQuery:params",
      params: {
        pmQueryID,
        pmQueryTitle,
        pmQueryDescription,
        pmQuery,
        pmQueryArgs,
      },
    });
    try {
      if (authorizedQueries === true || authorizedQueries.includes(pmQueryID)) {
        const updatedQuery = await prisma.tbl_pm_queries.update({
          where: { pm_query_id: pmQueryID },
          data: {
            pm_query_title: pmQueryTitle,
            pm_query_description: pmQueryDescription,
            pm_query: pmQuery,
            pm_query_args: pmQueryArgs,
          },
        });
        Logger.log("success", {
          message: "DashboardService:updateQuery:updatedQuery",
          params: {
            updatedQuery,
          },
        });
        return updatedQuery;
      } else {
        Logger.log("error", {
          message: "DashboardService:updateQuery:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "DashboardService:updateQuery:catch-1",
        params: { error },
      });
      throw error;
    }
  };

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
      const queries = await prisma.tbl_pm_queries.findMany({
        where:
          authorizedQueries === true
            ? {}
            : {
                pm_query_id: {
                  in: authorizedQueries,
                },
              },
      });
      Logger.log("success", {
        message: "QueryService:getAllQueries:queries",
        params: {
          queriesLength: queries?.length,
          authorizedQueries,
        },
      });
      return queries;
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
   * @param {Number} param0.pmQueryID
   * @param {Boolean|Array<Number>} param0.authorizedQueries
   * @returns {any|null}
   */
  static getQueryByID = async ({ pmQueryID, authorizedQueries }) => {
    Logger.log("info", {
      message: "QueryService:getQueryByID:params",
    });
    try {
      const query =
        authorizedQueries === true || authorizedQueries.includes(pmQueryID)
          ? await prisma.tbl_pm_queries.findUnique({
              where: { pm_query_id: pmQueryID },
            })
          : null;
      Logger.log("info", {
        message: "QueryService:getQueryByID:query",
        params: {
          query,
          authorizedQueries,
        },
      });

      return query;
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
   * @param {Number} param0.pmQueryID
   * @param {JSON} param0.pmQuery
   * @param {String} param0.pmQueryType
   * @returns {any|null}
   */
  static queryRunner = async ({
    pmQueryID,
    pmQuery,
    pmQueryType,
    pmQueryArgValues,
  }) => {
    Logger.log("info", {
      message: "QueryService:queryRunner:params",
      params: { pmQuery, pmQueryType, pmQueryArgValues },
    });
    try {
      const { result } = await runQuery({
        pmQueryID,
        pmQuery,
        pmQueryType,
        pmQueryArgValues,
      });

      Logger.log("info", {
        message: "QueryService:queryRunner:query",
        params: {
          result: Array.isArray(result)
            ? { resultLength: result.length }
            : result,
        },
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "QueryService:queryRunner:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmQueryID
   * @param {Boolean|Array<Number>} param0.authorizedQueries
   * @returns {any|null}
   */
  static deleteQuery = async ({ pmQueryID, authorizedQueries }) => {
    Logger.log("info", {
      message: "DashboardService:deleteQuery:params",
      params: {
        pmQueryID,
      },
    });
    try {
      if (authorizedQueries === true || authorizedQueries.includes(pmQueryID)) {
        const deletedQuery = await prisma.tbl_pm_queries.delete({
          where: { pm_query_id: pmQueryID },
        });

        Logger.log("success", {
          message: "DashboardService:deleteQuery:deletedQuery",
          params: {
            deletedQuery,
          },
        });
        return true;
      } else {
        Logger.log("error", {
          message: "DashboardService:deleteQuery:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "DashboardService:deleteQuery:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmQueryID
   * @returns {any|null}
   */
  static duplicateQuery = async ({ pmQueryID }) => {
    Logger.log("info", {
      message: "DashboardService:duplicateQuery:params",
      params: {
        pmQueryID,
      },
    });
    try {
      const query = await this.getQueryByID({
        pmQueryID,
        authorizedQueries: true,
      });
      return await this.addQuery({
        pmQuery: query.pm_query,
        pmQueryType: query.pm_query_type,
        pmQueryTitle: `${query.pm_query_title} copy`,
        pmQueryDescription: query.pm_query_description,
        pmQueryArgs: query.pm_query_args,
      });
    } catch (error) {
      Logger.log("error", {
        message: "DashboardService:duplicateQuery:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { QueryService };
