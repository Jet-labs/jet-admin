const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { isUUID } = require("validator");
const { v4: uuid } = require("uuid");
const dataQueryService = {};
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const { resolveInputs } = require("../../utils/inputArgs.util");
const { extractQueryDefinitions } = require("../../utils/definitionProvider.util");

dataQueryService.getDataQueriesWithDatasource = async ({
  userID,
  tenantID,
}) => {
  Logger.log("info", {
    message: "dataQueryService:getDataQueriesWithDatasource:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const dataQueries = await prisma.tblDataQueries.findMany({
      where: {
        tenantID: tenantID,
      },
      include: {
        tblDatasources: true,
      },
    });

    Logger.log("success", {
      message: "dataQueryService:getDataQueriesWithDatasource:success",
      params: {
        userID,
        dataQueriesLength: dataQueries?.length,
      },
    });

    return dataQueries;
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryService:getDataQueriesWithDatasource:failure",
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
        tenantID: tenantID,
      },
    });

    // Transform the result to include counts in a more accessible format
    const transformedQueries = dataQueries.map((query) => ({
      ...query,
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
  authContext,
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
      authContext,
    },
  });

  try {
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    await prisma.tblDataQueries.create({
      data: {
        tenantID: tenantID,
        dataQueryTitle,
        dataQueryOptions,
        datasourceID: isUUID(datasourceID) ? datasourceID : null,
        datasourceType,
        creatorID,
        createdByApiKeyID,
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
        tenantID: tenantID,
        dataQueryTitle: dataQueryData.dataQueryTitle,
        dataQueryOptions: dataQueryData.dataQueryOptions,
        datasourceID: dataQueryData.datasourceID,
        datasourceType: dataQueryData.datasourceType,
        creatorID: userID,
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
 * @param {string} param0.tenantID
 * @param {number} param0.dataQueryID
 * @param {object} param0.inputArgs
 * @returns {Promise<object>}
 */
dataQueryService.runDataQueryByID = async ({
  userID,
  tenantID,
  dataQueryID,
  inputArgs,
}) => {
  Logger.log("info", {
    message: "dataQueryService:runDataQueryByID:params",
    params: {
      userID,
      tenantID,
      dataQueryID,
      inputArgs,
    },
  });

  try {
    const dataQuery = await prisma.tblDataQueries.findFirst({
      where: {
        tenantID: tenantID,
        dataQueryID: dataQueryID,
      },
      include: {
        tblDatasources: true,
      },
    });

    if (!dataQuery) {
      Logger.log("error", {
        message: "dataQueryService:runDataQueryByID:catch-2",
        params: {
          userID,
          tenantID,
          dataQueryID,
          error: "Database query not found",
        },
      });
      throw new Error(`Database query with ID ${dataQueryID} not found`);
    }

    // Resolve & validate inputs through the unified pipeline
    const definitions = extractQueryDefinitions(dataQuery);
    const { resolved, errors, valid } = await resolveInputs({
      type: 'query',
      definitions,
      runtimeValues: inputArgs || {},
    });

    if (!valid) {
      Logger.log("error", {
        message: "dataQueryService:runDataQueryByID:inputValidationFailed",
        params: { dataQueryID, errors },
      });
      throw new Error(`Query input validation failed: ${JSON.stringify(errors)}`);
    }

    const queryRunner = createQueryEngine();

    Logger.log("info", {
      message: "dataQueryService:runDataQueryByID:queryRunner.run",
      params: {
        userID,
        tenantID,
        dataQueryID,
        inputArgs,
        args: dataQuery.dataQueryOptions?.args,
        resolvedInputs: resolved,
      },
    });

    const results = await executeDataQuery({
      engine: queryRunner,
      dataQueryID,
      executionArgs: resolved,
    });

    Logger.log("success", {
      message: "dataQueryService:runDataQueryByID:success",
      params: {
        userID,
        tenantID,
        dataQueryID,
        results,
      },
    });
    return results;
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryService:runDataQueryByID:failure",
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
 * @param {object} param0.inputArgs
 * @returns {Promise<object>}
 */
dataQueryService.runDataQueryByData = async ({
  userID,
  tenantID,
  dataQuery,
  inputArgs,
}) => {
  const tempQueryID = uuid();
  Logger.log("info", {
    message: "dataQueryService:runDataQueryByData:params",
    params: {
      userID,
      tenantID,
      inputArgs,
      dataQuery,
      tempQueryID,
    },
  });

  // await new Promise((resolve) => setTimeout(resolve, 100000));

  try {
    const processedDataQuery = {
      ...dataQuery,
      dataQueryID: tempQueryID,
    };

    Logger.log("info", {
      message: "dataQueryService:runDataQueryByData:processedDataQuery",
      params: {
        userID,
        tenantID,
        tempQueryID,
        processedDataQuery,
      },
    });

    const queryRunner = createQueryEngine({
      queryFetcher: async (queryId) => {
        if (queryId == tempQueryID) {
          return processedDataQuery;
        }

        return prisma.tblDataQueries.findFirst({
          where: {
            dataQueryID: queryId,
          },
        });
      },
      datasourceFetcher: defaultDatasourceFetcher,
    });

    // Resolve & validate inputs through the unified pipeline
    const definitions = extractQueryDefinitions(processedDataQuery);
    const { resolved, errors, valid } = await resolveInputs({
      type: 'query',
      definitions,
      runtimeValues: inputArgs || {},
    });

    if (!valid) {
      Logger.log("error", {
        message: "dataQueryService:runDataQueryByData:inputValidationFailed",
        params: { tempQueryID, errors },
      });
      throw new Error(`Query input validation failed: ${JSON.stringify(errors)}`);
    }

    Logger.log("info", {
      message: "dataQueryService:runDataQueryByData:queryRunner.run",
      params: {
        userID,
        tenantID,
        tempQueryID,
        inputArgs,
        args: processedDataQuery.dataQueryOptions?.args,
        resolvedInputs: resolved,
      },
    });

    const results = await executeDataQuery({
      engine: queryRunner,
      dataQueryID: tempQueryID,
      executionArgs: resolved,
    });

    Logger.log("success", {
      message: "dataQueryService:runDataQueryByData:success",
      params: {
        userID,
        tenantID,
        tempQueryID,
        results,
      },
    });
    return results;
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryService:runDataQueryByData:failure",
      params: {
        userID,
        tenantID,
        tempQueryID,
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
        tenantID: tenantID,
        dataQueryID: dataQueryID,
      },
      include: {
        tblDatasources: true,
      },
    });

    if (!dataQuery) {
      throw new Error(`Database query with ID ${dataQueryID} not found`);
    }

    // Transform the result to include counts in a more accessible format
    const transformedQuery = {
      ...dataQuery,
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
        tenantID: tenantID,
        dataQueryID: dataQueryID,
      },
    });
    if (!dataQuery) {
      throw new Error("Database query not found");
    }
    const newDataQuery = await prisma.tblDataQueries.create({
      data: {
        tenantID: tenantID,
        dataQueryTitle: dataQuery.dataQueryTitle + " (Copy)",
        dataQueryOptions: dataQuery.dataQueryOptions,
        creatorID: userID,
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
        dataQueryID: dataQueryID, // Assuming `id` is the primary key for the query
        tenantID: tenantID, // Ensure tenantID matches for security
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
        dataQueryID: dataQueryID, // Assuming `id` is the primary key for the query
        tenantID: tenantID, // Ensure tenantID matches for security
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

// --- Execution Adapter Logic ---
const { keyValueTypeArrayToObject } = require("../../utils/json.util");
const { QueryEngine } = require("./queryEngine/engine");

async function defaultQueryFetcher(queryID) {
  return prisma.tblDataQueries.findFirst({
    where: { dataQueryID: queryID },
  });
}

async function defaultDatasourceFetcher(datasourceID) {
  return prisma.tblDatasources.findFirst({
    where: { datasourceID },
  });
}

function createQueryEngine({
  queryFetcher = defaultQueryFetcher,
  datasourceFetcher = defaultDatasourceFetcher,
} = {}) {
  return new QueryEngine(queryFetcher, datasourceFetcher);
}

function buildDataQueryExecutionArgs(argDefinitions = [], inputArgs = {}) {
  const normalizedArgDefinitions = Array.isArray(argDefinitions)
    ? argDefinitions
    : [];

  const mappedArgsToValues = normalizedArgDefinitions.map((arg) => ({
    ...arg,
    value: inputArgs?.[arg.key],
  }));

  return {
    mappedArgsToValues,
    kvtObject: keyValueTypeArrayToObject(mappedArgsToValues),
  };
}

async function executeDataQuery({
  engine,
  dataQueryID,
  argDefinitions = [],
  inputArgs = {},
  executionArgs,
}) {
  const activeEngine = engine || createQueryEngine();
  const runtimeArgs =
    executionArgs ?? buildDataQueryExecutionArgs(argDefinitions, inputArgs).kvtObject;

  return activeEngine.executeQuery(dataQueryID, runtimeArgs);
}

// Assign execution methods to service to simplify imports across codebase
dataQueryService.createQueryEngine = createQueryEngine;
dataQueryService.buildDataQueryExecutionArgs = buildDataQueryExecutionArgs;
dataQueryService.executeDataQuery = executeDataQuery;

module.exports = { 
  dataQueryService, 
  createQueryEngine, 
  buildDataQueryExecutionArgs, 
  executeDataQuery,
  defaultQueryFetcher,
  defaultDatasourceFetcher
};
