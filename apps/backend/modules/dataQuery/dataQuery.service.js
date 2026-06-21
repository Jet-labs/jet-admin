const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { isUUID } = require("validator");
const { v4: uuid } = require("uuid");
const dataQueryService = {};
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const { authorizedExecuteDataQuery, createQueryEngine, defaultDatasourceFetcher } = require("../../utils/authorizedProxy");
const { grantCreatorAccess, removePoliciesForResource } = require("../../config/casbin.config");

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
dataQueryService.getAllDataQueries = async ({ userID, tenantID, search, page, pageSize }) => {
  Logger.log("info", {
    message: "dataQueryService:getAllDataQueries:params",
    params: {
      userID,
      tenantID,
      search,
      page,
      pageSize,
    },
  });

  try {
    const where = {
      tenantID: tenantID,
    };

    if (search) {
      where.OR = [
        {
          dataQueryTitle: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          dataQueryDescription: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          datasourceType: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const findManyOptions = {
      where,
      orderBy: {
        createdAt: "desc",
      },
    };

    if (page && pageSize) {
      findManyOptions.skip = (page - 1) * pageSize;
      findManyOptions.take = pageSize;
    }

    const [dataQueries, totalCount] = await Promise.all([
      prisma.tblDataQueries.findMany(findManyOptions),
      prisma.tblDataQueries.count({ where }),
    ]);

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
        totalCount,
      },
    });

    return {
      dataQueries: transformedQueries,
      totalCount,
      page: page || 1,
      pageSize: pageSize || transformedQueries.length,
      totalPages: pageSize ? Math.ceil(totalCount / pageSize) : 1,
    };
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
    if (!creatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }
    const createdQuery = await prisma.tblDataQueries.create({
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

    await grantCreatorAccess(tenantID, "dataquery", createdQuery.dataQueryID, authContext, userID);

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
  authContext,
}) => {
  Logger.log("info", {
    message: "dataQueryService:createDataQuery:params",
    params: {
      userID,
      tenantID,
      dataQueriesData,
      authContext,
    },
  });

  try {
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const finalCreatorID = creatorID || userID;
    if (!finalCreatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }

    const dataQueries = await prisma.tblDataQueries.createManyAndReturn({
      data: dataQueriesData.map((dataQueryData) => ({
        tenantID: tenantID,
        dataQueryTitle: dataQueryData.dataQueryTitle,
        dataQueryOptions: dataQueryData.dataQueryOptions,
        datasourceID: dataQueryData.datasourceID,
        datasourceType: dataQueryData.datasourceType,
        creatorID: finalCreatorID,
        createdByApiKeyID: createdByApiKeyID,
        runOnLoad: dataQueryData.runOnLoad,
      })),
    });

    for (const q of dataQueries) {
      await grantCreatorAccess(tenantID, "dataquery", q.dataQueryID, authContext, finalCreatorID);
    }

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
 * @param {object} param0.inputValues
 * @param {object} param0.executionCtx
 * @returns {Promise<object>}
 */
dataQueryService.runDataQueryByID = async ({
  userID,
  tenantID,
  dataQueryID,
  inputValues,
  executionCtx,
}) => {
  Logger.log("info", {
    message: "dataQueryService:runDataQueryByID:params",
    params: {
      userID,
      tenantID,
      dataQueryID,
      inputValues,
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



    const results = await authorizedExecuteDataQuery({
      dataQueryID,
      inputValues, // proxy now handles resolution!
      executionCtx,
    });

    Logger.log("success", {
      message: "dataQueryService:runDataQueryByID:success",
      params: {
        userID,
        tenantID,
        dataQueryID,
        // results,
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
 * @param {object} param0.inputValues
 * @param {object} param0.executionCtx
 * @returns {Promise<object>}
 */
dataQueryService.runDataQueryByData = async ({
  userID,
  tenantID,
  dataQuery,
  inputValues,
  executionCtx,
}) => {
  const tempQueryID = uuid();
  Logger.log("info", {
    message: "dataQueryService:runDataQueryByData:params",
    params: {
      userID,
      tenantID,
      inputValues,
      dataQuery,
      tempQueryID,
    },
  });

  // await new Promise((resolve) => setTimeout(resolve, 100000));

  try {
    const processedDataQuery = {
      ...dataQuery,
      dataQueryID: tempQueryID,
      tenantID: tenantID,
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
      queryFetcher: async () => ({
        ...dataQuery,
        dataQueryID: tempQueryID,
        tblDatasources: null, // we'll use the raw config
      }),
      datasourceFetcher: defaultDatasourceFetcher,
    });

    const results = await authorizedExecuteDataQuery({
      engine: queryRunner,
      dataQueryID: tempQueryID,
      executionInputs: inputValues,
      executionCtx,
    });

    Logger.log("success", {
      message: "dataQueryService:runDataQueryByData:success",
      params: {
        userID,
        tenantID,
        tempQueryID,
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
  authContext,
}) => {
  Logger.log("info", {
    message: "dataQueryService:cloneDataQueryByID:params",
    params: {
      userID,
      tenantID,
      dataQueryID,
      authContext,
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
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const finalCreatorID = creatorID || userID;
    if (!finalCreatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }
    const newDataQuery = await prisma.tblDataQueries.create({
      data: {
        tenantID: tenantID,
        dataQueryTitle: dataQuery.dataQueryTitle + " (Copy)",
        dataQueryOptions: dataQuery.dataQueryOptions,
        creatorID: finalCreatorID,
        createdByApiKeyID,
        runOnLoad: dataQuery.runOnLoad,
        datasourceID: dataQuery.datasourceID,
        datasourceType: dataQuery.datasourceType,
        dataQueryDescription: dataQuery.dataQueryDescription
      },
    });

    await grantCreatorAccess(tenantID, "dataquery", newDataQuery.dataQueryID, authContext, finalCreatorID);

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

    await removePoliciesForResource(tenantID, `dataquery:${dataQueryID}`);

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

module.exports = { 
  dataQueryService, 
};
