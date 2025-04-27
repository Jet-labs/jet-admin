const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
const jsonSchemaGenerator = require("json-schema-generator");
const { postgreSQLParserUtil } = require("../../utils/postgresql.util");
const environmentVariables = require("../../environment");
const { databaseService } = require("../database/database.service");
const { aiUtil } = require("../../utils/aiprompt.util");
const { aiService } = require("../ai/ai.service");
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
        databaseQueriesLength: transformedQueries?.length,
      },
    });
    return transformedQueries;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:getAllDatabaseQueries:failure",
      params: {
        userID,
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
 * @param {number} param0.tenantID
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
 * @param {number} param0.tenantID
 * @param {Array<object>} param0.databaseQueriesData
 * @returns {Promise<boolean>}
 */
databaseQueryService.createBulkDatabaseQuery = async ({
  userID,
  tenantID,
  databaseQueriesData,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:createDatabaseQuery:params",
    params: {
      userID,
      tenantID,
      databaseQueriesData,
    },
  });

  try {
    const databaseQueries = await prisma.tblDatabaseQueries.createManyAndReturn({
      data: databaseQueriesData.map((databaseQueryData) => ({
        tenantID: parseInt(tenantID),
        databaseQueryTitle: databaseQueryData.databaseQueryTitle,
        databaseQueryDescription: databaseQueryData.databaseQueryDescription,
        databaseQueryData: databaseQueryData.databaseQueryData,
        creatorID: parseInt(userID),
        runOnLoad: databaseQueryData.runOnLoad,
      })),
    });
    
    Logger.log("success", {
      message: "databaseQueryService:createDatabaseQuery:success",
      params: {
        userID,
        tenantID,
        databaseQueriesData,
        databaseQueriesLength: databaseQueries?.length,
      },
    });
    return databaseQueries;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:createDatabaseQuery:failure",
      params: {
        userID,
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
 * @param {number} param0.tenantID
 * @param {string} param0.aiPrompt
 * @returns
 */
databaseQueryService.generateAIPromptBasedQuery = async ({
  userID,
  tenantID,
  dbPool,
  aiPrompt,
}) => {
  const entryTime = Date.now();
  Logger.log("info", {
    message: "databaseQueryService:generateAIPromptBasedQuery:started",
    params: { userID, tenantID, aiPrompt },
  });

  // --- Get API Key ---
  const apiKey = environmentVariables.GEMINI_API_KEY;
  if (!apiKey) {
    Logger.log("error", {
      message: "databaseQueryService:generateAIPromptBasedQuery:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        error: "GEMINI_API_KEY environment variable not set.",
      },
    });
    throw new Error("Server configuration error: Missing Gemini API Key.");
  }

  const databaseSchemaInfo = await databaseService.getDatabaseSchemaForAI({
    userID,
    tenantID,
    dbPool,
  });

  Logger.log("info", {
    message: "databaseQueryService:generateAIPromptBasedQuery:schema_loaded",
    params: {
      userID,
      tenantID,
      aiPrompt,
      databaseSchemaInfoLength: databaseSchemaInfo?.length,
    },
  });

  if (!databaseSchemaInfo) {
    Logger.log("error", {
      message: "databaseQueryService:generateAIPromptBasedQuery:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        error: "Database schema information is missing.",
      },
    });
    throw new Error("Database schema information is missing.");
  }

  const fullPrompt = await aiUtil.generateAIPromptForQueryGeneration({
    databaseSchemaInfo,
    aiPrompt,
  });

  Logger.log("info", {
    message: "databaseQueryService:generateAIPromptBasedQuery:prompt_generated",
    params: {
      userID,
      tenantID,
      aiPrompt,
      fullPromptLength: fullPrompt?.length,
    },
  });

  try {
    const databaseQuery = await aiService.generateAIPromptBasedQuery({
      aiPrompt: fullPrompt,
    });

    Logger.log("success", {
      message: "databaseQueryService:generateAIPromptBasedQuery:success",
      params: { userID, tenantID, databaseQuery },
    });
    return databaseQuery;
  } catch (error) {
    // Log API errors or other failures
    Logger.log("error", {
      message: "databaseQueryService:generateAIPromptBasedQuery:failure",
      params: {
        userID,
        tenantID,
        aiPrompt,
        error,
      },
    });
    // Re-throw the original error or a more user-friendly one
    throw new Error(
      `Failed to generate database query using AI: ${error.message}`
    );
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {Array<{databaseQueryID:number,databaseQueryData:{databaseQueryString:string,databaseQueryArgValues:object,databaseQueryArgs:object}}>} param0.databaseQueries
 * @returns {Promise<Array<object>>}
 */

databaseQueryService.runDatabaseQueries = async ({
  userID,
  tenantID,
  dbPool,
  databaseQueries,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:runDatabaseQueries:start",
    params: {
      userID,
      tenantID,
      databaseQueriesCount: databaseQueries.length,
    },
  });

  try {
    // Execute with connection pooling
    const databaseQueriesResult =
      await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
        dbPool,
        async (client) => {
          const executionPromises = databaseQueries.map(
            async (databaseQuery, index) => {
              try {
                // Process and execute query
                const { query: processedQuery, values: processedQueryValues } =
                  postgreSQLParserUtil.processDatabaseQuery(
                    databaseQuery.databaseQueryData
                  );

                Logger.log("info", {
                  message:
                    "databaseQueryService:runDatabaseQueries:processDatabaseQuery",
                  params: {
                    userID,
                    tenantID,
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
                    "databaseQueryService:runDatabaseQueries:databaseQueryResult",
                  params: {
                    userID,
                    tenantID,
                    processedQuery,
                    processedQueryValues,
                    databaseQuery,
                  },
                });

                // Update schema if needed
                if (databaseQuery.databaseQueryID) {
                  const databaseQueryResultSchema = jsonSchemaGenerator(
                    JSON.parse(JSON.stringify(databaseQueryResult.rows))
                  );
                  await prisma.tblDatabaseQueries.update({
                    where: {
                      databaseQueryID: parseInt(databaseQuery.databaseQueryID),
                    },
                    data: {
                      databaseQueryResultSchema: databaseQueryResultSchema,
                    },
                  });
                  Logger.log("info", {
                    message:
                      "databaseQueryService:runDatabaseQueries:updateDatabaseQueryResultSchema",
                    params: {
                      userID,
                      tenantID,
                      databaseQueryID: databaseQuery.databaseQueryID,
                      databaseQueryResultSchema,
                    },
                  });
                }

                return {
                  success: true,
                  queryIndex: index,
                  result: databaseQueryResult.rows,
                  databaseQueryID: databaseQuery.databaseQueryID,
                };
              } catch (error) {
                Logger.log("error", {
                  message: "databaseQueryService:runDatabaseQueries:catch-2",
                  params: {
                    userID,
                    tenantID,
                    queryIndex: index,
                    error,
                  },
                });
                return {
                  success: false,
                  queryIndex: index,
                  error,
                  databaseQueryID: databaseQuery.databaseQueryID,
                };
              }
            }
          );

          return Promise.all(executionPromises);
        }
      );
    Logger.log("success", {
      message: "databaseQueryService:runDatabaseQueries:success",
      params: {
        userID,
        tenantID,
        databaseQueriesCount: databaseQueries.length,
        databaseQueriesResultCount: databaseQueriesResult.length,
      },
    });
    return databaseQueriesResult;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:runDatabaseQueries:catch-1",
      params: {
        userID,
        tenantID,
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
 * @param {number} param0.tenantID
 * @param {number} param0.databaseQueryID
 * @returns {Promise<boolean>}
 */
databaseQueryService.cloneDatabaseQueryByID = async ({
  userID,
  tenantID,
  databaseQueryID,
}) => {
  Logger.log("info", {
    message: "databaseQueryService:cloneDatabaseQueryByID:params",
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
    });
    if (!databaseQuery) {
      throw new Error("Database query not found");
    }
    const newDatabaseQuery = await prisma.tblDatabaseQueries.create({
      data: {
        tenantID: parseInt(tenantID),
        databaseQueryTitle: databaseQuery.databaseQueryTitle + " (Copy)",
        databaseQueryDescription: databaseQuery.databaseQueryDescription,
        databaseQueryData: databaseQuery.databaseQueryData,
        creatorID: parseInt(userID),
        runOnLoad: databaseQuery.runOnLoad,
      },
    });
    Logger.log("success", {
      message: "databaseQueryService:cloneDatabaseQueryByID:success",
      params: {
        userID,
        databaseQueryID,
        newDatabaseQueryID: newDatabaseQuery.databaseQueryID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryService:cloneDatabaseQueryByID:failure",
      params: {
        userID,
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
        error,
      },
    });
    throw error;
  }
};

module.exports = { databaseQueryService };
