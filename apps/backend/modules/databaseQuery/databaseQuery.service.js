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
 * @param {JSON} param0.databaseQueryData
 * @param {Boolean} param0.runOnLoad
 * @returns {Promise<boolean>}
 */
databaseQueryService.createDatabaseQuery = async ({
  userID,
  tenantID,
  databaseQueryTitle = "Untitled",
  databaseQueryDescription = null,
  databaseQueryData = null,
  runOnLoad = false,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:createDatabaseQuery:params",
    params: {
      userID,
      tenantID,
      databaseQueryTitle,
      databaseQueryDescription,
      databaseQueryData,
      runOnLoad,
    },
  });

  try {
    await prisma.tblDatabaseQueries.create({
      data: {
        tenantID: parseInt(tenantID),
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQueryData,
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
        databaseQueryData,
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
 * @param {object} param0.databaseQueryData
 * @returns {Promise<boolean>}
 */
databaseQueryService.runDatabaseQuery = async ({
  userID,
  dbPool,
  databaseQueryID,
  databaseQueryData,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:runDatabaseQuery:params",
    params: { userID, databaseQueryID, databaseQueryData },
  });

  try {
    let _databaseQueryData = databaseQueryData;

    if (!databaseQueryData && databaseQueryID) {
      _databaseQueryData = (
        await prisma.tblDatabaseQueries.findUnique({
          where: { databaseQueryID: parseInt(databaseQueryID) },
        })
      ).databaseQueryData;
    }

    Logger.log("info", {
      message: "databaseQueryService:runDatabaseQuery:databaseQueryData",
      params: {
        userID,
        databaseQueryID,
        databaseQueryData: _databaseQueryData,
      },
    });

    const { databaseQueryString, databaseQueryArgValues } = _databaseQueryData;

    const { query: processedQuery, values: processedQueryValues } =
      postgreSQLParserUtil.processDatabaseQuery({
        databaseQueryString,
        databaseQueryArgValues,
      });

    Logger.log("info", {
      message: "databaseQueryService:runDatabaseQuery:processedQuery",
      params: {
        userID,
        databaseQueryID,
        databaseQueryData: _databaseQueryData,
        processedQuery,
        processedQueryValues,
      },
    });
    const databaseQueryResult =
      await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
        dbPool,
        async (client) => client.query(processedQuery, processedQueryValues)
      );

    Logger.log("info", {
      message: "databaseQueryService:runDatabaseQuery:databaseQueryResult",
      params: {
        userID,
        databaseQueryID,
        databaseQueryData: _databaseQueryData,
        processedQuery,
        processedQueryValues,
        databaseQueryResult,
      },
    });

    const databaseQueryResultSchema = jsonSchemaGenerator(
      JSON.parse(JSON.stringify(databaseQueryResult.rows))
    );

    if (databaseQueryID) {
      await prisma.tblDatabaseQueries.update({
        where: { databaseQueryID: parseInt(databaseQueryID) },
        data: { databaseQueryResultSchema: databaseQueryResultSchema },
      });
      Logger.log("info", {
        message:
          "databaseQueryService:runDatabaseQuery:databaseQueryResultSchema:saved",
        params: {
          userID,
          databaseQueryID,
          databaseQueryData: _databaseQueryData,
          processedQuery,
          processedQueryValues,
          databaseQueryResult,
        },
      });
    }
    Logger.log("success", {
      message: "databaseQueryService:runDatabaseQuery:success",
      params: {
        userID,
        databaseQueryID,
        databaseQueryData: _databaseQueryData,
        processedQuery,
        processedQueryValues,
        databaseQueryResult,
      },
    });

    return databaseQueryResult;
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
 * @param {Array<{databaseQueryID:number,databaseQueryString:string,databaseQueryArgValues:object}>} param0.databaseQueriesData
 * @returns {Promise<Array<object>>}
 */

databaseQueryService.runMultipleDatabaseQueries = async ({
  userID,
  dbPool,
  databaseQueriesData,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:runMultipleDatabaseQueries:start",
    params: {
      userID,
      databaseQueriesDataCount: databaseQueriesData.length,
    },
  });

  try {
    // Execute with connection pooling
    return TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        const executionPromises = databaseQueriesData.map(
          async (databaseQueryData, index) => {
            try {
              // Process and execute query
              const { query: processedQuery, values: processedQueryValues } =
                postgreSQLParserUtil.processDatabaseQuery(databaseQueryData);

              Logger.log("info", {
                message:
                  "databaseQueryService:runMultipleDatabaseQueries:processDatabaseQuery",
                params: {
                  userID,
                  processedQuery,
                  processedQueryValues,
                },
              });

              const databaseQueryResult = await client.query(
                processedQuery,
                processedQueryValues
              );

              Logger.log("info", {
                message:
                  "databaseQueryService:runMultipleDatabaseQueries:databaseQueryResult",
                params: {
                  userID,
                  processedQuery,
                  processedQueryValues,
                  databaseQueryResult,
                },
              });

              // Update schema if needed
              if (databaseQueryData.databaseQueryID) {
                const databaseQueryResultSchema = jsonSchemaGenerator(
                  JSON.parse(JSON.stringify(databaseQueryResult.rows))
                );
                await prisma.tblDatabaseQueries.update({
                  where: {
                    databaseQueryID: parseInt(
                      databaseQueryData.databaseQueryID
                    ),
                  },
                  data: {
                    databaseQueryResultSchema: databaseQueryResultSchema,
                  },
                });
              }

              return {
                success: true,
                queryIndex: index,
                result: databaseQueryResult.rows,
                databaseQueryID: databaseQueryData.databaseQueryID,
              };
            } catch (error) {
              Logger.log("error", {
                message:
                  "databaseQueryService:runMultipleDatabaseQueries:catch-2",
                params: {
                  userID,
                  queryIndex: index,
                  error,
                },
              });
              return {
                success: false,
                queryIndex: index,
                error,
                databaseQueryID: query.databaseQueryID,
              };
            }
          }
        );

        return Promise.all(executionPromises);
      }
    );
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:runMultipleDatabaseQueries:catch-1",
      params: {
        userID,
        error,
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
 * @param {JSON} param0.databaseQueryData
 * @param {Boolean} param0.runOnLoad
 * @returns {Promise<boolean>}
 */
databaseQueryService.updateDatabaseQueryByID = async ({
  userID,
  tenantID,
  databaseQueryID,
  databaseQueryTitle,
  databaseQueryDescription,
  databaseQueryData,
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
      databaseQueryData,
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
        databaseQueryData,
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
        databaseQueryData,
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
        error,
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
