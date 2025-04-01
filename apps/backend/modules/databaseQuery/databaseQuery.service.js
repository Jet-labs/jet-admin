const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
const jsonSchemaGenerator = require("json-schema-generator");
const { postgreSQLParserUtil } = require("../../utils/postgresql.util");
const databaseQueryService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
databaseQueryService.getAllDatabaseQueries = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "databaseQueryService:getAllDatabaseQueries:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const databaseQueries = await prisma.tblDatabaseQueries.findMany({
      where: {
        tenantID: parseInt(tenantID),
      },
      include: {
        _count: {
          select: {
            tblDatabaseChartQueryMappings: true,
            tblDatabaseWidgetQueryMappings: true,
          },
        },
      },
    });

    // Transform the result to include counts in a more accessible format
    const transformedQueries = databaseQueries.map((query) => ({
      ...query,
      linkedDatabaseChartCount: query._count.tblDatabaseChartQueryMappings,
      linkedDatabaseWidgetCount: query._count.tblDatabaseWidgetQueryMappings,
      _count: undefined, // Remove the _count property
    }));

    Logger.log("success", {
      message: "databaseQueryService:getAllDatabaseQueries:success",
      params: {
        userID,
        databaseQueries: transformedQueries,
      },
    });
    return transformedQueries;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:getAllDatabaseQueries:failure",
      params: {
        userID,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {string} param0.databaseQueryTitle
 * @param {string} param0.databaseQueryDescription
 * @param {JSON} param0.databaseQuery
 * @param {Boolean} param0.runOnLoad
 * @returns {Promise<boolean>}
 */
databaseQueryService.createDatabaseQuery = async ({
  userID,
  tenantID,
  databaseQueryTitle = "Untitled",
  databaseQueryDescription = null,
  databaseQuery = null,
  runOnLoad = false,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:createDatabaseQuery:params",
    params: {
      userID,
      tenantID,
      databaseQueryTitle,
      databaseQueryDescription,
      databaseQuery,
      runOnLoad,
    },
  });

  try {
    await prisma.tblDatabaseQueries.create({
      data: {
        tenantID: parseInt(tenantID),
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQuery,
        creatorID: parseInt(userID),
        runOnLoad,
      },
    });
    Logger.log("success", {
      message: "databaseQueryService:createDatabaseQuery:success",
      params: {
        userID,
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQuery,
        runOnLoad,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:createDatabaseQuery:failure",
      params: {
        userID,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.databaseQueryID
 * @param {object} param0.dbPool
 * @param {object} param0.databaseQuery
 * @returns {Promise<boolean>}
 */
databaseQueryService.runDatabaseQuery = async ({
  userID,
  dbPool,
  databaseQueryID,
  databaseQuery,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:runDatabaseQuery:params",
    params: { userID, databaseQueryID },
  });

  try {
    let _databaseQuery = databaseQuery;

    if (!databaseQuery && databaseQueryID) {
      _databaseQuery = (
        await prisma.tblDatabaseQueries.findUnique({
          where: { databaseQueryID: parseInt(databaseQueryID) },
        })
      ).databaseQuery;
    }

    Logger.log("info", {
      message: "databaseQueryService:runDatabaseQuery:databaseQuery",
      params: { userID, databaseQuery: _databaseQuery },
    });

    const { query: originalQuery, args } = _databaseQuery;

    const { query: processedQuery, values: queryValues } =
      postgreSQLParserUtil.processDatabaseQuery({
        query: originalQuery,
        args,
      });

    Logger.log("info", {
      message: "databaseQueryService:runDatabaseQuery:processedQuery",
      params: { userID, processedQuery, queryValues },
    });
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => client.query(processedQuery, queryValues)
    );

    const resultSchema = jsonSchemaGenerator(
      JSON.parse(JSON.stringify(result.rows))
    );

    if (databaseQueryID) {
      await prisma.tblDatabaseQueries.update({
        where: { databaseQueryID: parseInt(databaseQueryID) },
        data: { databaseQueryResultSchema: resultSchema },
      });
      Logger.log("info", {
        message:
          "databaseQueryService:runDatabaseQuery:saved-query-result-schema",
        params: { userID, databaseQuery: _databaseQuery },
      });
    }
    Logger.log("success", {
      message: "databaseQueryService:runDatabaseQuery:success",
      params: { userID, databaseQuery: _databaseQuery },
    });

    return result;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:runDatabaseQuery:failure",
      params: { userID, error: error.message },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {Array<object>} param0.queries
 * @returns {Promise<Array<object>>}
 */

databaseQueryService.runMultipleDatabaseQueries = async ({
  userID,
  dbPool,
  queries,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:runMultipleDatabaseQueries:start",
    params: {
      userID,
      queryCount: queries.length,
    },
  });

  try {
    // Prefetch required queries
    const queryIDsToFetch = queries
      .filter((q) => !q.databaseQuery && q.databaseQueryID)
      .map((q) => parseInt(q.databaseQueryID, 10));

    const dbQueries = queryIDsToFetch.length
      ? await prisma.tblDatabaseQueries.findMany({
          where: { databaseQueryID: { in: queryIDsToFetch } },
        })
      : [];

    const queryMap = new Map(dbQueries.map((q) => [q.databaseQueryID, q]));

    // Execute with connection pooling
    return TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        const executionPromises = queries.map(async (query, index) => {
          const context = {
            userID,
            queryIndex: index,
            databaseQueryID: query.databaseQueryID,
          };

          try {
            // Resolve query content
            let finalQuery = query.databaseQuery;
            if (!finalQuery && query.databaseQueryID) {
              const storedQuery = queryMap.get(
                parseInt(query.databaseQueryID, 10)
              );
              if (!storedQuery)
                throw new Error(`Query ${query.databaseQueryID} not found`);
              finalQuery = storedQuery.databaseQuery;
            }

            if (!finalQuery) throw new Error("Invalid query parameters");

            // Process and execute query
            const { query: processedQuery, values } =
              postgreSQLParserUtil.processDatabaseQuery({
                query: finalQuery.query,
                args: query.argsMap,
              });

            Logger.log("info", {
              message:
                "databaseQueryService:runMultipleDatabaseQueries:execute-query",
              params: {
                ...context,
                processedQuery,
                parameters: values,
              },
            });

            const result = await client.query(processedQuery, values);

            // Update schema if needed
            if (query.databaseQueryID) {
              const schema = jsonSchemaGenerator(
                JSON.parse(JSON.stringify(result.rows))
              );
              await prisma.tblDatabaseQueries.update({
                where: { databaseQueryID: parseInt(query.databaseQueryID, 10) },
                data: { databaseQueryResultSchema: schema },
              });
            }

            return {
              success: true,
              queryIndex: index,
              result: result.rows,
              databaseQueryID: query.databaseQueryID,
            };
          } catch (error) {
            Logger.log("error", {
              message:
                "databaseQueryService:runMultipleDatabaseQueries:catch-2",
              params: {
                ...context,
                error: error.message,
              },
            });
            return {
              success: false,
              queryIndex: index,
              error: error.message,
              databaseQueryID: query.databaseQueryID,
            };
          }
        });

        return Promise.all(executionPromises);
      }
    );
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:runMultipleDatabaseQueries:catch-1",
      params: {
        userID,
        error: error.message,
        stack: error.stack,
      },
    });
    throw error;
  }
};

/**
 * Get database query by ID
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.databaseQueryID
 * @returns {Promise<object>}
 */
databaseQueryService.getDatabaseQueryByID = async ({
  userID,
  tenantID,
  databaseQueryID,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:getDatabaseQueryByID:params",
    params: {
      userID,
      tenantID,
      databaseQueryID,
    },
  });

  try {
    const databaseQuery = await prisma.tblDatabaseQueries.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        databaseQueryID: parseInt(databaseQueryID),
      },
      include: {
        _count: {
          select: {
            tblDatabaseChartQueryMappings: true,
            tblDatabaseWidgetQueryMappings: true,
          },
        },
      },
    });

    if (!databaseQuery) {
      throw new Error(`Database query with ID ${databaseQueryID} not found`);
    }

    // Transform the result to include counts in a more accessible format
    const transformedQuery = {
      ...databaseQuery,
      linkedDatabaseChartCount:
        databaseQuery._count.tblDatabaseChartQueryMappings,
      linkedDatabaseWidgetCount:
        databaseQuery._count.tblDatabaseWidgetQueryMappings,
      _count: undefined, // Remove the _count property
    };

    Logger.log("success", {
      message: "databaseQueryService:getDatabaseQueryByID:success",
      params: {
        userID,
        databaseQuery: transformedQuery,
      },
    });
    return transformedQuery;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:getDatabaseQueryByID:failure",
      params: {
        userID,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {string} param0.tenantID
 * @param {number} param0.databaseQueryID
 * @param {string} param0.databaseQueryTitle
 * @param {string} param0.databaseQueryDescription
 * @param {JSON} param0.databaseQuery
 * @param {Boolean} param0.runOnLoad
 * @returns {Promise<boolean>}
 */
databaseQueryService.updateDatabaseQueryByID = async ({
  userID,
  tenantID,
  databaseQueryID,
  databaseQueryTitle,
  databaseQueryDescription,
  databaseQuery,
  runOnLoad,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:updateDatabaseQueryByID:params",
    params: {
      userID,
      tenantID,
      databaseQueryID,
      databaseQueryTitle,
      databaseQueryDescription,
      databaseQuery,
      runOnLoad,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblDatabaseQueries.update({
      where: {
        databaseQueryID: parseInt(databaseQueryID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
      data: {
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQuery,
        runOnLoad,
      },
    });

    Logger.log("success", {
      message: "databaseQueryService:updateDatabaseQueryByID:success",
      params: {
        userID,
        tenantID,
        databaseQueryID,
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQuery,
        runOnLoad,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:updateDatabaseQueryByID:failure",
      params: {
        userID,
        tenantID,
        databaseQueryID,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {string} param0.tenantID
 * @param {number} param0.databaseQueryID
 * @param {string} param0.databaseQueryTitle
 * @param {string} param0.databaseQueryDescription
 * @param {JSON} param0.databaseQuery
 * @param {Boolean} param0.runOnLoad
 * @returns {Promise<boolean>}
 */
databaseQueryService.deleteDatabaseQueryByID = async ({
  userID,
  tenantID,
  databaseQueryID,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:deleteDatabaseQueryByID:params",
    params: {
      userID,
      tenantID,
      databaseQueryID,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblDatabaseQueries.delete({
      where: {
        databaseQueryID: parseInt(databaseQueryID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
    });

    Logger.log("success", {
      message: "databaseQueryService:deleteDatabaseQueryByID:success",
      params: {
        userID,
        tenantID,
        databaseQueryID,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:deleteDatabaseQueryByID:failure",
      params: {
        userID,
        tenantID,
        databaseQueryID,
        error: error.message,
      },
    });
    throw error;
  }
};

module.exports = { databaseQueryService };
