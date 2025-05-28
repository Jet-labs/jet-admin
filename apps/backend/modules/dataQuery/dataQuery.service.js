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
const { isUUID } = require("validator");
const dataQueryService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
dataQueryService.getAllDataQueries = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "dataQueryService:getAllDataQueries:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const dataQueries = await prisma.tblDataQueries.findMany({
      where: {
        tenantID: parseInt(tenantID),
      },
      include: {
        _count: {
          select: {
            tblWidgetQueryMappings: true,
          },
        },
      },
    });

    // Transform the result to include counts in a more accessible format
    const transformedQueries = dataQueries.map((query) => ({
      ...query,
      linkedWidgetCount: query._count.tblWidgetQueryMappings,
      _count: undefined, // Remove the _count property
    }));

    Logger.log("success", {
      message: "dataQueryService:getAllDataQueries:success",
      params: {
        userID,
        dataQueriesLength: transformedQueries?.length,
      },
    });
    return transformedQueries;
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryService:getAllDataQueries:failure",
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
 * @param {string} param0.dataQueryTitle
 * @param {JSON} param0.dataQueryOptions
 * @param {string} param0.datasourceID
 * @param {string} param0.datasourceType
 * @param {Boolean} param0.runOnLoad
 * @returns {Promise<boolean>}
 */
dataQueryService.createDataQuery = async ({
  userID,
  tenantID,
  dataQueryTitle = "Untitled",
  dataQueryOptions = null,
  datasourceID = null,
  datasourceType,
  runOnLoad = false,
}) => {
  Logger.log("info", {
    message: "dataQueryService:createDataQuery:params",
    params: {
      userID,
      tenantID,
      dataQueryTitle,
      dataQueryOptions,
      datasourceID,
      datasourceType,
      runOnLoad,
    },
  });

  try {
    await prisma.tblDataQueries.create({
      data: {
        tenantID: parseInt(tenantID),
        dataQueryTitle,
        dataQueryOptions,
        datasourceID: isUUID(datasourceID) ? datasourceID : null,
        datasourceType,
        creatorID: parseInt(userID),
        runOnLoad,
      },
    });
    Logger.log("success", {
      message: "dataQueryService:createDataQuery:success",
      params: {
        userID,
        dataQueryTitle,
        dataQueryOptions,
        datasourceID,
        datasourceType,
        runOnLoad,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryService:createDataQuery:failure",
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
 * @param {Array<object>} param0.dataQueriesData
 * @returns {Promise<boolean>}
 */
dataQueryService.createBulkDataQuery = async ({
  userID,
  tenantID,
  dataQueriesData,
}) => {
  Logger.log("info", {
    message: "dataQueryService:createDataQuery:params",
    params: {
      userID,
      tenantID,
      dataQueriesData,
    },
  });

  try {
    const dataQueries = await prisma.tblDataQueries.createManyAndReturn({
      data: dataQueriesData.map((dataQueryData) => ({
        tenantID: parseInt(tenantID),
        dataQueryTitle: dataQueryData.dataQueryTitle,
        dataQueryOptions: dataQueryData.dataQueryOptions,
        datasourceID: dataQueryData.datasourceID,
        datasourceType: dataQueryData.datasourceType,
        creatorID: parseInt(userID),
        runOnLoad: dataQueryData.runOnLoad,
      })),
    });

    Logger.log("success", {
      message: "dataQueryService:createDataQuery:success",
      params: {
        userID,
        tenantID,
        dataQueriesData,
        dataQueriesLength: dataQueries?.length,
      },
    });
    return dataQueries;
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryService:createDataQuery:failure",
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
dataQueryService.generateAIPromptBasedQuery = async ({
  userID,
  tenantID,
  dbPool,
  aiPrompt,
}) => {
  const entryTime = Date.now();
  Logger.log("info", {
    message: "dataQueryService:generateAIPromptBasedQuery:started",
    params: { userID, tenantID, aiPrompt },
  });

  // --- Get API Key ---
  const apiKey = environmentVariables.GEMINI_API_KEY;
  if (!apiKey) {
    Logger.log("error", {
      message: "dataQueryService:generateAIPromptBasedQuery:failure",
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
    message: "dataQueryService:generateAIPromptBasedQuery:schema_loaded",
    params: {
      userID,
      tenantID,
      aiPrompt,
      databaseSchemaInfoLength: databaseSchemaInfo?.length,
    },
  });

  if (!databaseSchemaInfo) {
    Logger.log("error", {
      message: "dataQueryService:generateAIPromptBasedQuery:failure",
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
    message: "dataQueryService:generateAIPromptBasedQuery:prompt_generated",
    params: {
      userID,
      tenantID,
      aiPrompt,
      fullPromptLength: fullPrompt?.length,
    },
  });

  try {
    const dataQuery = await aiService.generateAIPromptBasedQuery({
      aiPrompt: fullPrompt,
    });

    Logger.log("success", {
      message: "dataQueryService:generateAIPromptBasedQuery:success",
      params: { userID, tenantID, dataQuery },
    });
    return dataQuery;
  } catch (error) {
    // Log API errors or other failures
    Logger.log("error", {
      message: "dataQueryService:generateAIPromptBasedQuery:failure",
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
 * @param {Array<{dataQueryID:number,dataQueryOptions:{dataQueryString:string,dataQueryArgValues:object,dataQueryArgs:object}}>} param0.dataQueries
 * @returns {Promise<Array<object>>}
 */

dataQueryService.runDataQueries = async ({
  userID,
  tenantID,
  dbPool,
  dataQueries,
}) => {
  Logger.log("info", {
    message: "dataQueryService:runDataQueries:start",
    params: {
      userID,
      tenantID,
      dataQueriesCount: dataQueries.length,
    },
  });

  try {
    // Execute with connection pooling
    const dataQueriesResult =
      await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
        dbPool,
        async (client) => {
          const executionPromises = dataQueries.map(
            async (dataQuery, index) => {
              try {
                // Process and execute query
                const { query: processedQuery, values: processedQueryValues } =
                  postgreSQLParserUtil.processDataQuery(
                    dataQuery.dataQueryOptions
                  );

                Logger.log("info", {
                  message:
                    "dataQueryService:runDataQueries:processDataQuery",
                  params: {
                    userID,
                    tenantID,
                    processedQuery,
                    processedQueryValues,
                  },
                });

                const dataQueryResult = await client.query(
                  processedQuery,
                  processedQueryValues
                );

                Logger.log("info", {
                  message:
                    "dataQueryService:runDataQueries:dataQueryResult",
                  params: {
                    userID,
                    tenantID,
                    processedQuery,
                    processedQueryValues,
                    dataQuery,
                  },
                });

                // Update schema if needed
                if (dataQuery.dataQueryID) {
                  const dataQueryResultSchema = jsonSchemaGenerator(
                    JSON.parse(JSON.stringify(dataQueryResult.rows))
                  );
                  await prisma.tblDataQueries.update({
                    where: {
                      dataQueryID: parseInt(dataQuery.dataQueryID),
                    },
                    data: {
                      dataQueryResultSchema: dataQueryResultSchema,
                    },
                  });
                  Logger.log("info", {
                    message:
                      "dataQueryService:runDataQueries:updateDataQueryResultSchema",
                    params: {
                      userID,
                      tenantID,
                      dataQueryID: dataQuery.dataQueryID,
                      dataQueryResultSchema,
                    },
                  });
                }

                return {
                  success: true,
                  queryIndex: index,
                  result: dataQueryResult.rows,
                  dataQueryID: dataQuery.dataQueryID,
                };
              } catch (error) {
                Logger.log("error", {
                  message: "dataQueryService:runDataQueries:catch-2",
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
                  dataQueryID: dataQuery.dataQueryID,
                };
              }
            }
          );

          return Promise.all(executionPromises);
        }
      );
    Logger.log("success", {
      message: "dataQueryService:runDataQueries:success",
      params: {
        userID,
        tenantID,
        dataQueriesCount: dataQueries.length,
        dataQueriesResultCount: dataQueriesResult.length,
      },
    });
    return dataQueriesResult;
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryService:runDataQueries:catch-1",
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
 * @param {number} param0.dataQueryID
 * @returns {Promise<object>}
 */
dataQueryService.getDataQueryByID = async ({
  userID,
  tenantID,
  dataQueryID,
}) => {
  Logger.log("info", {
    message: "dataQueryService:getDataQueryByID:params",
    params: {
      userID,
      tenantID,
      dataQueryID,
    },
  });

  try {
    const dataQuery = await prisma.tblDataQueries.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        dataQueryID: parseInt(dataQueryID),
      },
      include: {
        tblDatasources: true,
        _count: {
          select: {
            tblWidgetQueryMappings: true,
          },
        },
      },
    });

    if (!dataQuery) {
      throw new Error(`Database query with ID ${dataQueryID} not found`);
    }

    // Transform the result to include counts in a more accessible format
    const transformedQuery = {
      ...dataQuery,
      linkedWidgetCount:
        dataQuery._count.tblWidgetQueryMappings,
      _count: undefined, // Remove the _count property
    };

    Logger.log("success", {
      message: "dataQueryService:getDataQueryByID:success",
      params: {
        userID,
        dataQuery: transformedQuery,
      },
    });
    return transformedQuery;
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryService:getDataQueryByID:failure",
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
 * @param {number} param0.dataQueryID
 * @returns {Promise<boolean>}
 */
dataQueryService.cloneDataQueryByID = async ({
  userID,
  tenantID,
  dataQueryID,
}) => {
  Logger.log("info", {
    message: "dataQueryService:cloneDataQueryByID:params",
    params: {
      userID,
      tenantID,
      dataQueryID,
    },
  });

  try {
    const dataQuery = await prisma.tblDataQueries.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        dataQueryID: parseInt(dataQueryID),
      },
    });
    if (!dataQuery) {
      throw new Error("Database query not found");
    }
    const newDataQuery = await prisma.tblDataQueries.create({
      data: {
        tenantID: parseInt(tenantID),
        dataQueryTitle: dataQuery.dataQueryTitle + " (Copy)",
        dataQueryOptions: dataQuery.dataQueryOptions,
        creatorID: parseInt(userID),
        runOnLoad: dataQuery.runOnLoad,
      },
    });
    Logger.log("success", {
      message: "dataQueryService:cloneDataQueryByID:success",
      params: {
        userID,
        dataQueryID,
        newDataQueryID: newDataQuery.dataQueryID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryService:cloneDataQueryByID:failure",
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
 * @param {number} param0.dataQueryID
 * @param {string} param0.dataQueryTitle
 * @param {JSON} param0.dataQueryOptions
 * @param {string} param0.datasourceID
 * @param {string} param0.datasourceType
 * @param {Boolean} param0.runOnLoad
 * @returns {Promise<boolean>}
 */
dataQueryService.updateDataQueryByID = async ({
  userID,
  tenantID,
  dataQueryID,
  dataQueryTitle,
  dataQueryOptions,
  datasourceID,
  datasourceType,
  runOnLoad,
}) => {
  Logger.log("info", {
    message: "dataQueryService:updateDataQueryByID:params",
    params: {
      userID,
      tenantID,
      dataQueryID,
      dataQueryTitle,
      dataQueryOptions,
      datasourceID,
      datasourceType,
      runOnLoad,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblDataQueries.update({
      where: {
        dataQueryID: parseInt(dataQueryID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
      data: {
        dataQueryTitle,
        dataQueryOptions,
        datasourceID: isUUID(datasourceID) ? datasourceID : null,
        datasourceType,
        runOnLoad,
      },
    });

    Logger.log("success", {
      message: "dataQueryService:updateDataQueryByID:success",
      params: {
        userID,
        tenantID,
        dataQueryID,
        dataQueryTitle,
        dataQueryOptions,
        datasourceID,
        datasourceType,
        runOnLoad,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryService:updateDataQueryByID:failure",
      params: {
        userID,
        tenantID,
        dataQueryID,
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
 * @param {number} param0.dataQueryID
 * @returns {Promise<boolean>}
 */
dataQueryService.deleteDataQueryByID = async ({
  userID,
  tenantID,
  dataQueryID,
}) => {
  Logger.log("info", {
    message: "dataQueryService:deleteDataQueryByID:params",
    params: {
      userID,
      tenantID,
      dataQueryID,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblDataQueries.delete({
      where: {
        dataQueryID: parseInt(dataQueryID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
    });

    Logger.log("success", {
      message: "dataQueryService:deleteDataQueryByID:success",
      params: {
        userID,
        tenantID,
        dataQueryID,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryService:deleteDataQueryByID:failure",
      params: {
        userID,
        tenantID,
        dataQueryID,
        error,
      },
    });
    throw error;
  }
};

module.exports = { dataQueryService };
