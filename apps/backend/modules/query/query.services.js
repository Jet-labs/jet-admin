const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { runQuery } = require("./processors/postgresql");
const { sqlite_db } = require("../../db/sqlite");
const { queryQueryUtils } = require("../../utils/postgres-utils/query-queries");

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
      const addQueryQuery = sqlite_db.prepare(queryQueryUtils.addQuery());

      // Execute the insert
      addQueryQuery.run(
        pmQueryType,
        pmQueryTitle,
        pmQueryDescription,
        JSON.stringify(pmQuery), // Store JSON as TEXT
        JSON.stringify(pmQueryArgs) // Store JSON as TEXT
      );

      Logger.log("success", {
        message: "DashboardService:addQuery:success",
      });
      return true;
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
   * @param {Object} param0.pmQueryMetadata
   * @param {Boolean|Array<Number>} param0.authorizedQueries
   * @returns {any|null}
   */
  static updateQuery = async ({
    pmQueryID,
    pmQueryTitle,
    pmQueryDescription,
    pmQuery,
    pmQueryArgs,
    pmQueryMetadata,
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
        pmQueryMetadata,
      },
    });
    try {
      if (authorizedQueries === true || authorizedQueries.includes(pmQueryID)) {
        const updatedQueryQuery = sqlite_db.prepare(
          queryQueryUtils.updateQuery()
        );
        // Execute the update
        updatedQueryQuery.run(
          pmQueryTitle,
          pmQueryDescription,
          JSON.stringify(pmQuery), // Store JSON as TEXT
          JSON.stringify(pmQueryArgs), // Store JSON as TEXT
          JSON.stringify(pmQueryMetadata), // Store JSON as TEXT
          pmQueryID
        );
        Logger.log("success", {
          message: "DashboardService:updateQuery:success",
        });
        return true;
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
      let queries;
      if (authorizedQueries === true) {
        // Fetch all queries if authorizedQueries is true
        const getAllQueriesQuery = sqlite_db.prepare(
          queryQueryUtils.getAllQueries()
        );
        queries = getAllQueriesQuery.all();
      } else {
        // Fetch queries where pm_query_id is in the authorizedQueries array
        const getAllQueriesQuery = sqlite_db.prepare(
          queryQueryUtils.getAllQueries(authorizedQueries)
        );
        queries = getAllQueriesQuery.all(...authorizedQueries);
      }
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
      if (authorizedQueries === true || authorizedQueries.includes(pmQueryID)) {
        const getQueryByIDQuery = sqlite_db.prepare(
          queryQueryUtils.getQueryByID()
        );
        const query = getQueryByIDQuery.get(pmQueryID);
        Logger.log("info", {
          message: "QueryService:getQueryByID:query",
          params: {
            query,
          },
        });
        return query;
      } else {
        Logger.log("error", {
          message: "QueryService:getQueryByID:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
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
        const deleteQueryQuery = sqlite_db.prepare(
          queryQueryUtils.deleteQuery()
        );
        // Execute the delete
        deleteQueryQuery.run(pmQueryID);

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
