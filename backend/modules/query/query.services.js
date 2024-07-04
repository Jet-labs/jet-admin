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
          pm_postgres_query: String(query.pm_postgres_query),
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

  /**
   *
   * @param {object} param0
   * @param {String} param0.queryTitle
   * @param {String} param0.queryType
   * @param {String} param0.queryDescription
   * @param {any} param0.query
   * @returns {any|null}
   */
  static addQuery = async ({
    queryTitle,
    queryType,
    queryDescription,
    query,
  }) => {
    Logger.log("info", {
      message: "DashboardService:addQuery:params",
      params: {
        queryTitle,
        queryDescription,
        queryType,
        query,
      },
    });
    try {
      let newPGSQLQuery = null;
      let newMasterQuery = null;
      switch (queryType) {
        case constants.QUERY_TYPE.POSTGRE_QUERY.value: {
          newPGSQLQuery = await prisma.tbl_pm_postgres_queries.create({
            data: {
              pm_postgres_query: String(query.pm_postgres_query),
            },
          });
          newMasterQuery = await prisma.tbl_pm_master_queries.create({
            data: {
              pm_query_id: newPGSQLQuery.pm_postgres_query_id,
              pm_query_type: constants.QUERY_TYPE.POSTGRE_QUERY.value,
              pm_master_query_title: queryTitle,
              pm_master_query_description: queryDescription,
            },
          });
          break;
        }
        default: {
          newPGSQLQuery = await prisma.tbl_pm_postgres_queries.create({
            data: {
              pm_postgres_query: String(query.pm_postgres_query),
            },
          });
          newMasterQuery = await prisma.tbl_pm_master_queries.create({
            data: {
              pm_query_id: newPGSQLQuery.pm_postgres_query_id,
              pm_query_type: constants.QUERY_TYPE.POSTGRE_QUERY.value,
              pm_master_query_title: queryTitle,
              pm_master_query_description: queryDescription,
            },
          });
          break;
        }
      }

      Logger.log("success", {
        message: "DashboardService:addQuery:newMasterQuery",
        params: {
          newPGSQLQuery,
          newMasterQuery,
        },
      });
      return newMasterQuery;
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
   * @param {Number} param0.queryID
   * @param {String} param0.queryTitle
   * @param {String} param0.queryDescription
   * @param {any} param0.query
   * @param {Boolean|Array<Number>} param0.authorizedQueries
   * @returns {any|null}
   */
  static updatePGQuery = async ({
    queryID,
    queryTitle,
    queryDescription,
    query,
    authorizedQueries,
  }) => {
    Logger.log("info", {
      message: "DashboardService:updatePGQuery:params",
      params: {
        queryID,
        queryTitle,
        queryDescription,
        query,
      },
    });
    try {
      if (authorizedQueries === true || authorizedQueries.includes(queryID)) {
        const updatedMasterQuery = await prisma.tbl_pm_master_queries.update({
          where: { pm_master_query_id: queryID },
          data: {
            pm_master_query_title: queryTitle,
            pm_master_query_description: queryDescription,
          },
        });
        const updatedPGSQLQuery = await prisma.tbl_pm_postgres_queries.update({
          where: { pm_postgres_query_id: updatedMasterQuery.pm_query_id },
          data: {
            pm_postgres_query: String(query.pm_postgres_query),
          },
        });

        Logger.log("success", {
          message: "DashboardService:updatePGQuery:newMasterQuery",
          params: {
            updatedMasterQuery,
            updatedPGSQLQuery,
          },
        });
        return updatedMasterQuery;
      } else {
        Logger.log("error", {
          message: "DashboardService:updatePGQuery:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "DashboardService:updatePGQuery:catch-1",
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

  /**
   *
   * @param {object} param0
   * @param {Number} param0.queryID
   * @param {Boolean|Array<Number>} param0.authorizedQueries
   * @returns {any|null}
   */
  static deleteQuery = async ({ queryID, authorizedQueries }) => {
    Logger.log("info", {
      message: "DashboardService:deleteQuery:params",
      params: {
        queryID,
      },
    });
    try {
      if (authorizedQueries === true || authorizedQueries.includes(queryID)) {
        const deletedMasterQuery = await prisma.tbl_pm_master_queries.delete({
          where: { pm_master_query_id: queryID },
        });
        let deleteChildQuery = null;
        switch (deletedMasterQuery.pm_query_type) {
          case constants.QUERY_TYPE.POSTGRE_QUERY.value: {
            const deleteChildQuery =
              await prisma.tbl_pm_postgres_queries.delete({
                where: { pm_postgres_query_id: deletedMasterQuery.pm_query_id },
              });
            break;
          }
          default: {
            const deleteChildQuery =
              await prisma.tbl_pm_postgres_queries.delete({
                where: { pm_postgres_query_id: deletedMasterQuery.pm_query_id },
              });
            break;
          }
        }

        Logger.log("success", {
          message: "DashboardService:deleteQuery:newMasterQuery",
          params: {
            deletedMasterQuery,
            deleteChildQuery,
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
   * @param {Number} param0.queryID
   * @returns {any|null}
   */
  static duplicateQuery = async ({ queryID }) => {
    Logger.log("info", {
      message: "DashboardService:duplicateQuery:params",
      params: {
        queryID,
      },
    });
    try {
      const masterQuery = await this.getQueryByID({
        queryID,
        authorizedQueries: true,
      });
      return await this.addQuery({
        query: masterQuery.query,
        queryType: masterQuery.pm_query_type,
        queryTitle: `${masterQuery.pm_master_query_title} copy`,
        queryDescription: masterQuery.pm_master_query_description,
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
