const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
const jsonSchemaGenerator = require("json-schema-generator");
const { postgreSQLParserUtil } = require("../../utils/postgresql.util");
const { generateKafkaJobID } = require("../../utils/crypto.util");
const constants = require("../../constants");
const {
  kafkaDatabaseQueryJobPosterProducer,
  kafkaQueryRunnerJobResultsCache,
} = require("../../config/kafka.config");
const { validationUtils } = require("../../utils/validation.util");
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
 * @param {number} param0.tenantID
 * @param {number} param0.databaseQueryID
 * @param {object} param0.databaseQueryData
 * @returns {Promise<object>}
 */
databaseQueryService.runDatabaseQuery = async ({
  userID,
  tenantID,
  databaseQueryID,
  databaseQueryData,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:runDatabaseQuery:params",
    params: { userID, tenantID, databaseQueryID, databaseQueryData },
  });

  try {
    Logger.log("info", {
      message: "databaseQueryService:runDatabaseQuery:processedQuery",
      params: { userID, tenantID, databaseQueryID, databaseQueryData },
    });
    const databaseQueryRunnerJobID = generateKafkaJobID();
    kafkaDatabaseQueryJobPosterProducer.send({
      topic: constants.KAFKA_TOPIC_NAMES.DATABASE_QUERY_RUNNER_JOBS,
      messages: [
        {
          key: databaseQueryRunnerJobID,
          value: JSON.stringify({
            userID,
            tenantID,
            databaseQueryID,
            databaseQueryData,
            status: constants.BACKEND_JOB_STATUS.PROCESSING,
          }),
        },
      ],
    });

    Logger.log("success", {
      message: "databaseQueryService:runDatabaseQuery:success",
      params: {
        userID,
        tenantID,
        databaseQueryID,
        databaseQueryData,
        databaseQueryRunnerJobID,
      },
    });

    return {
      databaseQueryRunnerJobID,
      databaseQueryRunnerJobStatus: constants.BACKEND_JOB_STATUS.PROCESSING,
    };
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
 * @param {number} param0.tenantID
 * @param {string} param0.databaseQueryRunnerJobID
 * @returns {Promise<object>}
 */
databaseQueryService.getDatabaseQueryJobResult = async ({
  userID,
  tenantID,
  databaseQueryRunnerJobID,
}) => {
  try {
    Logger.log("info", {
      message: "databaseQueryService:getDatabaseQueryJobResult:params",
      params: { userID, tenantID, databaseQueryRunnerJobID },
    });
    if (!kafkaQueryRunnerJobResultsCache) {
      Logger.log("error", {
        message: "databaseQueryService:getDatabaseQueryJobResult:catch-2",
        params: {
          userID,
          error: "kafkaQueryRunnerJobResultsCache is undefined",
        },
      });
      throw new Error("kafkaQueryRunnerJobResultsCache is undefined");
    } else if (!kafkaQueryRunnerJobResultsCache.has(databaseQueryRunnerJobID)) {
      Logger.log("error", {
        message: "databaseQueryService:getDatabaseQueryJobResult:catch-2",
        params: { userID, error: "databaseQueryRunnerJobID is not completed" },
      });
      return {
        databaseQueryRunnerJobStatus: constants.BACKEND_JOB_STATUS.PROCESSING,
      };
    }
    
    const databaseQueryRunnerJobPayload = 
      kafkaQueryRunnerJobResultsCache.get(databaseQueryRunnerJobID)
    ;
    Logger.log("info", {
      message: "databaseQueryService:getDatabaseQueryJobResult:payload",
      params: { userID,tenantID, databaseQueryRunnerJobPayload },
    });
    validationUtils.validateQueryResult(
      databaseQueryRunnerJobPayload.databaseQueryResult
    );
    Logger.log("info", {
      message: "databaseQueryService:getDatabaseQueryJobResult:validated",
      params: { userID,tenantID, databaseQueryRunnerJobPayload },
    });
    kafkaQueryRunnerJobResultsCache.delete(databaseQueryRunnerJobID);
    const databaseQueryResult =
      databaseQueryRunnerJobPayload.databaseQueryResult;

    Logger.log("success", {
      message: "databaseQueryService:getDatabaseQueryJobResult:success",
      params: {
        userID,
        tenantID,
        databaseQueryResult,
      },
    });

    return {
      databaseQueryRunnerJobStatus: constants.BACKEND_JOB_STATUS.COMPLETED,
      databaseQueryResult,
    };
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:getDatabaseQueryJobResult:catch-1",
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
      .filter((q) => !q.databaseQueryData && q.databaseQueryID)
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
            let finalQuery = query.databaseQueryData;
            if (!finalQuery && query.databaseQueryID) {
              const storedQuery = queryMap.get(
                parseInt(query.databaseQueryID, 10)
              );
              if (!storedQuery)
                throw new Error(`Query ${query.databaseQueryID} not found`);
              finalQuery = storedQuery.databaseQueryData;
            }

            if (!finalQuery) throw new Error("Invalid query parameters");

            // Process and execute query
            const {
              databaseQueryString: processedQuery,
              databaseQueryValues: values,
            } = postgreSQLParserUtil.processDatabaseQuery({
              databaseQueryString: finalQuery.databaseQueryString,
              databaseQueryArgValues: query.databaseQueryArgValues,
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
