const { Prisma } = require("@prisma/client");
const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { getQueryObject, getEvaluatedQuery } = require("../../plugins/queries");

class QueryService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.pmQueryTitle
   * @param {String} param0.pmQueryType
   * @param {String} param0.pmQueryDescription
   * @param {JSON} param0.pmQuery
   * @returns {any|null}
   */
  static addQuery = async ({
    pmQueryTitle,
    pmQueryType,
    pmQueryDescription,
    pmQuery,
  }) => {
    Logger.log("info", {
      message: "DashboardService:addQuery:params",
      params: {
        pmQueryTitle,
        pmQueryDescription,
        pmQueryType,
        pmQuery,
      },
    });
    try {
      const newQuery = await prisma.tbl_pm_queries.create({
        data: {
          pm_query_type: pmQueryType,
          pm_query_title: pmQueryTitle,
          pm_query_description: pmQueryDescription,
          pm_query: pmQuery,
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
   * @param {Boolean|Array<Number>} param0.authorizedQueries
   * @returns {any|null}
   */
  static updateQuery = async ({
    pmQueryID,
    pmQueryTitle,
    pmQueryDescription,
    pmQuery,
    authorizedQueries,
  }) => {
    Logger.log("info", {
      message: "DashboardService:updateQuery:params",
      params: {
        pmQueryID,
        pmQueryTitle,
        pmQueryDescription,
        pmQuery,
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
      Logger.log("info", {
        message: "QueryService:getAllQueries:queries",
        params: {
          queries,
          authorizedQueries,
        },
      });

      Logger.log("info", {
        message: "QueryService:getAllQueries:query",
        params: {
          queriesLength: queries?.length,
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
   * @param {JSON} param0.pmQuery
   * @param {String} param0.pmQueryType
   * @returns {any|null}
   */
  static runQuery = async ({ pmQuery, pmQueryType }) => {
    Logger.log("info", {
      message: "QueryService:runQuery:params",
      params: { pmQuery, pmQueryType },
    });
    try {
      const evaluatedQuery = await getEvaluatedQuery({
        pmQueryType,
        pmQuery,
      });
      Logger.log("info", {
        message: "QueryService:runQuery:evaluatedQuery",
        params: {
          evaluatedQuery,
        },
      });

      const queryModel = getQueryObject({
        pmQueryType,
        pmQuery: evaluatedQuery,
      });
      const result = await queryModel.run();

      Logger.log("info", {
        message: "QueryService:runQuery:query",
        params: {
          result: Array.isArray(result)
            ? { resultLength: result.length }
            : result,
        },
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "QueryService:runQuery:catch-1",
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
