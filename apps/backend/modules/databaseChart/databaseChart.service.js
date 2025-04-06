const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const {
  databaseQueryService,
} = require("../databaseQuery/databaseQuery.service");
const { databaseChartProcessor } = require("./databaseChart.processor");
const constants = require("../../constants");
const databaseChartService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
databaseChartService.getAllDatabaseCharts = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "databaseChartService:getAllDatabaseCharts:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const databaseCharts = await prisma.tblDatabaseCharts.findMany({
      where: {
        tenantID: parseInt(tenantID),
      },
    });
    Logger.log("success", {
      message: "databaseChartService:getAllDatabaseCharts:success",
      params: {
        userID,
        databaseCharts,
      },
    });
    return databaseCharts;
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartService:getAllDatabaseCharts:failure",
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
 * @param {string} param0.databaseChartName
 * @param {string} param0.databaseChartDescription
 * @param {string} param0.databaseChartType
 * @param {JSON} param0.databaseChartConfig
 * @param {Array<object>} param0.databaseQueries
 * @returns {Promise<boolean>}
 */
databaseChartService.createDatabaseChart = async ({
  userID,
  tenantID,
  databaseChartName,
  databaseChartDescription,
  databaseChartType,
  databaseChartConfig,
  databaseQueries,
}) => {
  Logger.log("info", {
    message: "databaseChartService:createDatabaseChart:params",
    params: {
      userID,
      tenantID,
      databaseChartName,
      databaseChartDescription,
      databaseChartType,
      databaseChartConfig,
    },
  });

  try {
    await prisma.$transaction(async (tx) => {
      const databaseChart = await tx.tblDatabaseCharts.create({
        data: {
          tenantID: parseInt(tenantID),
          databaseChartName,
          databaseChartDescription,
          databaseChartType,
          databaseChartConfig,
          creatorID: parseInt(userID),
        },
      });
      await tx.tblDatabaseChartQueryMappings.createMany({
        data: databaseQueries.map((databaseQuery) => {
          return {
            databaseChartID: databaseChart.databaseChartID,
            databaseQueryID: parseInt(databaseQuery.databaseQueryID),
            title: databaseQuery.title,
            parameters: databaseQuery.parameters,
            datasetFields: databaseQuery.datasetFields,
            databaseQueryArgValues: databaseQuery.databaseQueryArgValues,
          };
        }),
      });
    });

    Logger.log("success", {
      message: "databaseChartService:createDatabaseChart:success",
      params: {
        userID,
        tenantID: parseInt(tenantID),
        databaseChartName,
        databaseChartDescription,
        databaseChartConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartService:createDatabaseChart:failure",
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
 * @param {string} param0.databaseChartID
 * @returns {Promise<Array<object>>}
 */
databaseChartService.getDatabaseChartByID = async ({
  userID,
  tenantID,
  databaseChartID,
}) => {
  Logger.log("info", {
    message: "databaseChartService:getDatabaseChartByID:params",
    params: {
      userID,
      tenantID,
      databaseChartID,
    },
  });

  try {
    const databaseChart = await prisma.tblDatabaseCharts.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        databaseChartID: parseInt(databaseChartID),
      },
      include: {
        tblDatabaseChartQueryMappings: true,
      },
    });
    Logger.log("success", {
      message: "databaseChartService:getDatabaseChartByID:success",
      params: {
        userID,
        databaseChart,
      },
    });
    return databaseChart;
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartService:getDatabaseChartByID:failure",
      params: {
        userID,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Service function to retrieve and process database chart data.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.dbPool - Database connection pool
 * @param {string} params.tenantID - Tenant ID
 * @param {string} params.databaseChartID - Database chart ID
 * @returns {Promise<Object>} Processed chart data with metadata
 */
databaseChartService.getDatabaseChartDataByID = async ({
  userID,
  dbPool,
  tenantID,
  databaseChartID,
}) => {
  Logger.log("info", "databaseChartService:getDatabaseChartDataByID:params", {
    userID,
    tenantID,
    databaseChartID,
  });

  try {
    // 1. Fetch chart configuration with related queries
    let _databaseChart = await prisma.tblDatabaseCharts.findUnique({
      where: { databaseChartID: parseInt(databaseChartID, 10) },
      include: {
        tblDatabaseChartQueryMappings: {
          include: {
            tblDatabaseQueries: true,
          },
        },
      },
    });

    const databaseChart = {
      ..._databaseChart,
      databaseQueries: _databaseChart.tblDatabaseChartQueryMappings.map(
        (t) => t
      ),
    };

    if (!databaseChart) {
      Logger.log(
        "warn",
        "databaseChartService:getDatabaseChartDataByID:not-found",
        {
          databaseChartID,
          userID,
          tenantID,
        }
      );
      throw new Error(`Chart ${databaseChartID} not found`);
    }

    // 2. Prepare queries for execution
    const databaseQueriesToExecute =
      databaseChart.tblDatabaseChartQueryMappings.map((mapping) => ({
        databaseQueryID: mapping.databaseQueryID,
        databaseQueryData: {
          ...mapping.tblDatabaseQueries.databaseQueryData,
          databaseQueryArgValues: mapping.databaseQueryArgValues,
        },
      }));

    Logger.log(
      "info",
      "databaseChartService:getDatabaseChartDataByID:queries-prepared",
      {
        userID,
        databaseChartID,
        tenantID,
        databaseQueriesToExecuteCount: databaseQueriesToExecute.length,
      }
    );

    // 3. Execute all queries
    const databaseQueriesResult = await databaseQueryService.runDatabaseQueries(
      {
        userID,
        tenantID,
        dbPool,
        databaseQueries: databaseQueriesToExecute,
      }
    );

    Logger.log("info", {
      message:
        "databaseChartService:getDatabaseChartDataByID:databaseQueriesResult",
      params: {
        userID,
        tenantID,
        databaseChartID,
        databaseQueriesResultCount: databaseQueriesResult?.length,
      },
    });

    let processedData;
    // 4. Process results into chart format
    switch (databaseChart.databaseChartType) {
      case constants.DATABASE_CHART_TYPES.BAR_CHART.value:
        processedData = databaseChartProcessor.processBarChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.LINE_CHART.value:
        processedData = databaseChartProcessor.processLineChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;

      case constants.DATABASE_CHART_TYPES.PIE_CHART.value:
        processedData = databaseChartProcessor.processPieChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.RADAR_CHART.value:
        processedData = databaseChartProcessor.processRadarChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.RADIAL_CHART.value:
        processedData = databaseChartProcessor.processRadialChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.SCATTER_CHART.value:
        processedData = databaseChartProcessor.processScatterChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.BUBBLE_CHART.value:
        processedData = databaseChartProcessor.processBubbleChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      default:
        processedData = databaseChartProcessor.processBarChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
    }

    return {
      databaseChartID: databaseChart.databaseChartID,
      databaseChartName: databaseChart.databaseChartName,
      lastUpdated: databaseChart.updatedAt,
      data: processedData,
    };
  } catch (error) {
    Logger.log("error", "databaseChartService:getDatabaseChartDataByID:error", {
      error: error.message,
      databaseChartID,
      userID,
    });
    throw error;
  }
};

/**
 * Service function to retrieve and process database chart data.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.dbPool - Database connection pool
 * @param {string} params.tenantID - Tenant ID
 * @param {object} params.databaseChart - Database chart ID
 * @returns {Promise<Object>} Processed chart data with metadata
 */
databaseChartService.getDatabaseChartDataUsingDatabaseChart = async ({
  userID,
  dbPool,
  tenantID,
  databaseChart,
}) => {
  Logger.log("info", {
    message:
      "databaseChartService:getDatabaseChartDataUsingDatabaseChart:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const databaseQueries = await prisma.tblDatabaseQueries.findMany({
      where: {
        databaseQueryID: {
          in: Array.from(databaseChart.databaseQueries).map((t) =>
            parseInt(t.databaseQueryID)
          ),
        },
      },
    });

    Logger.log("info", {
      message:
        "databaseChartService:getDatabaseChartDataUsingDatabaseChart:databaseQueries",
      params: {
        userID,
        tenantID,
        databaseQueries,
      },
    });

    const databaseQueryIDMap = {};
    databaseQueries.forEach((t) => {
      databaseQueryIDMap[t.databaseQueryID] = t;
    });

    // 2. Prepare queries for execution
    const databaseQueriesToExecute = databaseChart.databaseQueries.map(
      (databaseQuery) => ({
        databaseQueryID: databaseQuery.databaseQueryID,
        databaseQueryData: {
          ...databaseQueryIDMap[databaseQuery.databaseQueryID]
            .databaseQueryData,
          databaseQueryArgValues: databaseQuery.databaseQueryArgValues,
        },
      })
    );

    Logger.log("info", {
      message:
        "databaseChartService:getDatabaseChartDataUsingDatabaseChart:queries-prepared",
      params: {
        userID,
        tenantID,
        databaseQueriesToExecuteCount: databaseQueriesToExecute.length,
      },
    });

    // 3. Execute all queries
    const databaseQueriesResult = await databaseQueryService.runDatabaseQueries(
      {
        userID,
        tenantID,
        dbPool,
        databaseQueries: databaseQueriesToExecute,
      }
    );

    Logger.log("info", {
      message:
        "databaseChartService:getDatabaseChartDataUsingDatabaseChart:databaseQueriesResult",
      params: {
        userID,
        tenantID,
        databaseQueriesResultCount: databaseQueriesResult?.length,
      },
    });

    let processedData;
    // 4. Process results into chart format
    switch (databaseChart.databaseChartType) {
      case constants.DATABASE_CHART_TYPES.BAR_CHART.value:
        processedData = databaseChartProcessor.processBarChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.LINE_CHART.value:
        processedData = databaseChartProcessor.processLineChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.PIE_CHART.value:
        processedData = databaseChartProcessor.processPieChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.RADAR_CHART.value:
        processedData = databaseChartProcessor.processRadarChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.RADIAL_CHART.value:
        processedData = databaseChartProcessor.processRadialChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.SCATTER_CHART.value:
        processedData = databaseChartProcessor.processScatterChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      case constants.DATABASE_CHART_TYPES.BUBBLE_CHART.value:
        processedData = databaseChartProcessor.processBubbleChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
      default:
        processedData = databaseChartProcessor.processBarChartQueryResults({
          databaseChart,
          databaseQueriesResult,
        });
        break;
    }

    return {
      databaseChartName: databaseChart.databaseChartName,
      lastUpdated: databaseChart.updatedAt,
      data: processedData,
    };
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseChartService:getDatabaseChartDataUsingDatabaseChart:catch-1",
      params: {
        error: error.message,
        userID,
      },
    });
    throw error;
  }
};

/**
 * Updates an existing database chart and its associated query mappings.
 *
 * @param {Object} params - Update parameters
 * @param {number} params.databaseChartID - ID of the chart to update (REQUIRED)
 * @param {number} [params.userID] - ID of the user performing the update
 * @param {number} [params.tenantID] - Tenant ID associated with the chart
 * @param {string} [params.databaseChartName] - New chart name
 * @param {string} [params.databaseChartDescription] - New chart description
 * @param {string} [params.databaseChartType] - Chart type identifier
 * @param {JSON} [params.databaseChartConfig] - Chart configuration data
 * @param {Array<Object>} [params.databaseQueries] - Array of query mappings to replace existing ones
 * @param {number} params.databaseQueries[].databaseQueryID - ID of the associated query
 * @param {string} [params.databaseQueries[].title] - Query mapping title
 * @param {JSON} [params.databaseQueries[].parameters] - Query parameters
 * @param {number} [params.databaseQueries[].executionOrder] - Execution order of queries
 * @param {JSON} [params.databaseQueries[].datasetFields] - Dataset field definitions
 * @param {JSON} [params.databaseQueries[].databaseQueryArgValues] - Argument mappings
 *
 * @returns {Promise<boolean>} True if update succeeded
 * @throws {Error} If database operation fails
 */
databaseChartService.updateDatabaseChartByID = async ({
  databaseChartID,
  userID,
  tenantID,
  databaseChartName,
  databaseChartDescription,
  databaseChartType,
  databaseChartConfig,
  databaseQueries,
}) => {
  Logger.log("info", {
    message: "databaseChartService:updateDatabaseChartByID:params",
    params: {
      databaseChartID,
      userID,
      tenantID,
      databaseChartName,
      databaseChartDescription,
      databaseChartType,
      databaseChartConfig,
      databaseQueries,
    },
  });

  try {
    // Fetch existing chart and verify ownership
    const existingChart = await prisma.tblDatabaseCharts.findFirst({
      where: {
        databaseChartID: parseInt(databaseChartID),
        tenantID: parseInt(tenantID),
      },
    });

    if (!existingChart) {
      throw new Error("Chart not found");
    }
    await prisma.$transaction(async (tx) => {
      // Update main chart data
      const updatedChart = await tx.tblDatabaseCharts.update({
        where: { databaseChartID: parseInt(databaseChartID) },
        data: {
          ...(databaseChartName != undefined && { databaseChartName }),
          ...(databaseChartDescription != undefined && {
            databaseChartDescription,
          }),
          ...(databaseChartType != undefined && { databaseChartType }),
          ...(databaseChartConfig != undefined && { databaseChartConfig }),
        },
      });

      // Update associated queries if provided
      if (databaseQueries) {
        // Delete existing mappings
        await tx.tblDatabaseChartQueryMappings.deleteMany({
          where: { databaseChartID: parseInt(databaseChartID) },
        });

        // Create new mappings
        await tx.tblDatabaseChartQueryMappings.createMany({
          data: databaseQueries.map((q) => ({
            databaseChartID: parseInt(databaseChartID),
            databaseQueryID: parseInt(q.databaseQueryID),
            title: q.title,
            parameters: q.parameters,
            executionOrder: q.executionOrder,
            datasetFields: q.datasetFields,
            databaseQueryArgValues: q.databaseQueryArgValues,
          })),
        });
      }
    });

    Logger.log("success", {
      message: "databaseChartService:updateDatabaseChartByID:success",
      params: {
        databaseChartID,
        userID,
        tenantID,
        databaseChartName,
        databaseChartDescription,
        databaseChartType,
        databaseChartConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartService:updateDatabaseChartByID:catch-1",
      params: {
        databaseChartID,
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
 * @param {number} param0.databaseChartID
 * @returns {Promise<boolean>}
 */
databaseChartService.deleteDatabaseChartByID = async ({
  userID,
  tenantID,
  databaseChartID,
  
}) => {
  Logger.log("info", {
    message: "databaseChartService:deleteDatabaseChartByID:params",
    params: {
      userID,
      tenantID,
      databaseChartID,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblDatabaseCharts.delete({
      where: {
        databaseChartID: parseInt(databaseChartID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
    });

    Logger.log("success", {
      message: "databaseChartService:deleteDatabaseChartByID:success",
      params: {
        userID,
        tenantID,
        databaseChartID,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseChartService:deleteDatabaseChartByID:failure",
      params: {
        userID,
        tenantID,
        databaseChartID,
        error: error.message,
      },
    });
    throw error;
  }
};

module.exports = { databaseChartService };
