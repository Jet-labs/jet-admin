const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const {
  databaseQueryService,
} = require("../databaseQuery/databaseQuery.service");
const { databaseWidgetProcessor } = require("./databaseWidget.processor");
const constants = require("../../constants");
const databaseWidgetService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
databaseWidgetService.getAllDatabaseWidgets = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "databaseWidgetService:getAllDatabaseWidgets:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const databaseWidgets = await prisma.tblDatabaseWidgets.findMany({
      where: {
        tenantID: parseInt(tenantID),
      },
    });
    Logger.log("success", {
      message: "databaseWidgetService:getAllDatabaseWidgets:success",
      params: {
        userID,
        databaseWidgets,
      },
    });
    return databaseWidgets;
  } catch (error) {
    Logger.log("error", {
      message: "databaseWidgetService:getAllDatabaseWidgets:failure",
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
 * @param {string} param0.databaseWidgetName
 * @param {string} param0.databaseWidgetDescription
 * @param {string} param0.databaseWidgetType
 * @param {JSON} param0.databaseWidgetConfig
 * @param {Array<object>} param0.databaseQueries
 * @returns {Promise<boolean>}
 */
databaseWidgetService.createDatabaseWidget = async ({
  userID,
  tenantID,
  databaseWidgetName,
  databaseWidgetDescription,
  databaseWidgetType,
  databaseWidgetConfig,
  databaseQueries,
}) => {
  Logger.log("info", {
    message: "databaseWidgetService:createDatabaseWidget:params",
    params: {
      userID,
      tenantID,
      databaseWidgetName,
      databaseWidgetDescription,
      databaseWidgetType,
      databaseWidgetConfig,
    },
  });

  try {
    await prisma.$transaction(async (tx) => {
      const databaseWidget = await tx.tblDatabaseWidgets.create({
        data: {
          tenantID: parseInt(tenantID),
          databaseWidgetName,
          databaseWidgetDescription,
          databaseWidgetType,
          databaseWidgetConfig,
          creatorID: parseInt(userID),
        },
      });
      await tx.tblDatabaseWidgetQueryMappings.createMany({
        data: databaseQueries.map((databaseQuery) => {
          return {
            databaseWidgetID: databaseWidget.databaseWidgetID,
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
      message: "databaseWidgetService:createDatabaseWidget:success",
      params: {
        userID,
        tenantID: parseInt(tenantID),
        databaseWidgetName,
        databaseWidgetDescription,
        databaseWidgetConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseWidgetService:createDatabaseWidget:failure",
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
 * @param {string} param0.databaseWidgetID
 * @returns {Promise<Array<object>>}
 */
databaseWidgetService.getDatabaseWidgetByID = async ({
  userID,
  tenantID,
  databaseWidgetID,
}) => {
  Logger.log("info", {
    message: "databaseWidgetService:getDatabaseWidgetByID:params",
    params: {
      userID,
      tenantID,
      databaseWidgetID,
    },
  });

  try {
    const databaseWidget = await prisma.tblDatabaseWidgets.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        databaseWidgetID: parseInt(databaseWidgetID),
      },
      include: {
        tblDatabaseWidgetQueryMappings: true,
      },
    });
    Logger.log("success", {
      message: "databaseWidgetService:getDatabaseWidgetByID:success",
      params: {
        userID,
        databaseWidget,
      },
    });
    return databaseWidget;
  } catch (error) {
    Logger.log("error", {
      message: "databaseWidgetService:getDatabaseWidgetByID:failure",
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
 * @param {number} param0.databaseWidgetID
 * @returns {Promise<boolean>}
 */
databaseWidgetService.cloneDatabaseWidgetByID = async ({
  userID,
  tenantID,
  databaseWidgetID,
}) => {
  Logger.log("info", {
    message: "databaseWidgetService:cloneDatabaseWidgetByID:params",
    params: {
      userID,
      tenantID,
      databaseWidgetID,
    },
  });

  try {
    const databaseWidget = await prisma.tblDatabaseWidgets.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        databaseWidgetID: parseInt(databaseWidgetID),
      },
      include: {
        tblDatabaseWidgetQueryMappings: true,
      },
    });
    if (!databaseWidget) {
      throw new Error("Database widget not found");
    }
    await prisma.$transaction(async (tx) => {
      const newDatabaseWidget = await tx.tblDatabaseWidgets.create({
        data: {
          tenantID: parseInt(tenantID),
          databaseWidgetName: databaseWidget.databaseWidgetName + " (Copy)",
          databaseWidgetDescription: databaseWidget.databaseWidgetDescription,
          databaseWidgetType: databaseWidget.databaseWidgetType,
          databaseWidgetConfig: databaseWidget.databaseWidgetConfig,
          creatorID: parseInt(userID),
        },
      });
      await tx.tblDatabaseWidgetQueryMappings.createMany({
        data: databaseWidget.tblDatabaseWidgetQueryMappings.map(
          (databaseWidgetQueryMapping) => {
            return {
              databaseWidgetID: newDatabaseWidget.databaseWidgetID,
              databaseQueryID: parseInt(databaseWidgetQueryMapping.databaseQueryID),
              title: databaseWidgetQueryMapping.title,
              parameters: databaseWidgetQueryMapping.parameters,
              datasetFields: databaseWidgetQueryMapping.datasetFields,
              databaseQueryArgValues: databaseWidgetQueryMapping.databaseQueryArgValues,
            };
          }
        ),
      });
    });
    Logger.log("success", {
      message: "databaseWidgetService:cloneDatabaseWidgetByID:success",
      params: {
        userID,
        databaseWidgetID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseWidgetService:cloneDatabaseWidgetByID:failure",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};


/**
 * Service function to retrieve and process database widget data.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.dbPool - Database connection pool
 * @param {string} params.tenantID - Tenant ID
 * @param {string} params.databaseWidgetID - Database widget ID
 * @returns {Promise<Object>} Processed widget data with metadata
 */
databaseWidgetService.getDatabaseWidgetDataByID = async ({
  userID,
  dbPool,
  tenantID,
  databaseWidgetID,
}) => {
  Logger.log("info", "databaseWidgetService:getDatabaseWidgetDataByID:params", {
    userID,
    tenantID,
    databaseWidgetID,
  });

  try {
    // 1. Fetch widget configuration with related queries
    let _databaseWidget = await prisma.tblDatabaseWidgets.findUnique({
      where: { databaseWidgetID: parseInt(databaseWidgetID, 10) },
      include: {
        tblDatabaseWidgetQueryMappings: {
          include: {
            tblDatabaseQueries: true,
          },
        },
      },
    });

    const databaseWidget = {
      ..._databaseWidget,
      databaseQueries: _databaseWidget.tblDatabaseWidgetQueryMappings.map(
        (t) => t
      ),
    };

    if (!databaseWidget) {
      Logger.log(
        "warn",
        "databaseWidgetService:getDatabaseWidgetDataByID:not-found",
        {
          databaseWidgetID,
          userID,
        }
      );
      throw new Error(`Widget ${databaseWidgetID} not found`);
    }

    // 2. Prepare queries for execution
    const databaseQueriesToExecute =
      databaseWidget.tblDatabaseWidgetQueryMappings.map((mapping) => ({
        databaseQueryID: mapping.databaseQueryID,
        databaseQueryData: {
          ...mapping.tblDatabaseQueries.databaseQueryData,
          databaseQueryArgValues: mapping.databaseQueryArgValues,
        },
      }));

    Logger.log(
      "info",
      "databaseWidgetService:getDatabaseWidgetDataByID:queries-prepared",
      {
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
        "databaseWidgetService:getDatabaseWidgetDataByID:databaseQueriesResult",
      params: {
        databaseQueriesResultCount: databaseQueriesResult?.length,
      },
    });

    let processedData;
    // 4. Process results into widget format
    switch (databaseWidget.databaseWidgetType) {
      case constants.DATABASE_WIDGET_TYPES.TEXT_WIDGET.value:
        processedData = databaseWidgetProcessor.processTextWidgetQueryResults({
          databaseWidget,
          databaseQueriesResult,
        });
        break;
      default:
        processedData = databaseWidgetProcessor.processTextWidgetQueryResults({
          databaseWidget,
          databaseQueriesResult,
        });
        break;
    }

    return {
      databaseWidgetID: databaseWidget.databaseWidgetID,
      databaseWidgetName: databaseWidget.databaseWidgetName,
      lastUpdated: databaseWidget.updatedAt,
      data: processedData,
    };
  } catch (error) {
    Logger.log(
      "error",
      "databaseWidgetService:getDatabaseWidgetDataByID:error",
      {
        error,
        databaseWidgetID,
        userID,
      }
    );
    throw error;
  }
};

/**
 * Service function to retrieve and process database widget data.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {Object} params.dbPool - Database connection pool
 * @param {string} params.tenantID - Tenant ID
 * @param {object} params.databaseWidget - Database widget ID
 * @returns {Promise<Object>} Processed widget data with metadata
 */
databaseWidgetService.getDatabaseWidgetDataUsingDatabaseWidget = async ({
  userID,
  dbPool,
  tenantID,
  databaseWidget,
}) => {
  Logger.log("info", {
    message:
      "databaseWidgetService:getDatabaseWidgetDataUsingDatabaseWidget:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const databaseQueries = await prisma.tblDatabaseQueries.findMany({
      where: {
        databaseQueryID: {
          in: Array.from(databaseWidget.databaseQueries).map((t) =>
            parseInt(t.databaseQueryID)
          ),
        },
      },
    });

    Logger.log("info", {
      message:
        "databaseWidgetService:getDatabaseWidgetDataUsingDatabaseWidget:databaseQueries",
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
    const databaseQueriesToExecute = databaseWidget.databaseQueries.map(
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
        "databaseWidgetService:getDatabaseWidgetDataUsingDatabaseWidget:queries-prepared",
      params: {
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
        "databaseWidgetService:getDatabaseWidgetDataUsingDatabaseWidget:databaseQueriesResult",
      params: {
        databaseQueriesResultCount: databaseQueriesResult?.length,
      },
    });

    let processedData;
    // 4. Process results into widget format
    switch (databaseWidget.databaseWidgetType) {
      case constants.DATABASE_WIDGET_TYPES.TEXT_WIDGET.value:
        processedData = databaseWidgetProcessor.processTextWidgetQueryResults({
          databaseWidget,
          databaseQueriesResult,
        });
        break;
      default:
        processedData = databaseWidgetProcessor.processTextWidgetQueryResults({
          databaseWidget,
          databaseQueriesResult,
        });
        break;
    }

    return {
      databaseWidgetName: databaseWidget.databaseWidgetName,
      lastUpdated: databaseWidget.updatedAt,
      data: processedData,
    };
  } catch (error) {
    Logger.log("error", {
      message:
        "databaseWidgetService:getDatabaseWidgetDataUsingDatabaseWidget:catch-1",
      params: {
        error,
        userID,
      },
    });
    throw error;
  }
};

/**
 * Updates an existing database widget and its associated query mappings.
 *
 * @param {Object} params - Update parameters
 * @param {number} params.databaseWidgetID - ID of the widget to update (REQUIRED)
 * @param {number} [params.userID] - ID of the user performing the update
 * @param {number} [params.tenantID] - Tenant ID associated with the widget
 * @param {string} [params.databaseWidgetName] - New widget name
 * @param {string} [params.databaseWidgetDescription] - New widget description
 * @param {string} [params.databaseWidgetType] - Widget type identifier
 * @param {JSON} [params.databaseWidgetConfig] - Widget configuration data
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
databaseWidgetService.updateDatabaseWidgetByID = async ({
  databaseWidgetID,
  userID,
  tenantID,
  databaseWidgetName,
  databaseWidgetDescription,
  databaseWidgetType,
  databaseWidgetConfig,
  databaseQueries,
}) => {
  Logger.log("info", {
    message: "databaseWidgetService:updateDatabaseWidgetByID:params",
    params: {
      databaseWidgetID,
      userID,
      tenantID,
      databaseWidgetName,
      databaseWidgetDescription,
      databaseWidgetType,
      databaseWidgetConfig,
      databaseQueries,
    },
  });

  try {
    // Fetch existing widget and verify ownership
    const existingWidget = await prisma.tblDatabaseWidgets.findFirst({
      where: {
        databaseWidgetID: parseInt(databaseWidgetID),
        tenantID: parseInt(tenantID),
      },
    });

    if (!existingWidget) {
      throw new Error("Widget not found");
    }
    await prisma.$transaction(async (tx) => {
      // Update main widget data
      const updatedWidget = await tx.tblDatabaseWidgets.update({
        where: { databaseWidgetID: parseInt(databaseWidgetID) },
        data: {
          ...(databaseWidgetName != undefined && { databaseWidgetName }),
          ...(databaseWidgetDescription != undefined && {
            databaseWidgetDescription,
          }),
          ...(databaseWidgetType != undefined && { databaseWidgetType }),
          ...(databaseWidgetConfig != undefined && { databaseWidgetConfig }),
        },
      });

      // Update associated queries if provided
      if (databaseQueries) {
        // Delete existing mappings
        await tx.tblDatabaseWidgetQueryMappings.deleteMany({
          where: { databaseWidgetID: parseInt(databaseWidgetID) },
        });

        // Create new mappings
        await tx.tblDatabaseWidgetQueryMappings.createMany({
          data: databaseQueries.map((q) => ({
            databaseWidgetID: parseInt(databaseWidgetID),
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
      message: "databaseWidgetService:updateDatabaseWidgetByID:success",
      params: {
        databaseWidgetID,
        userID,
        tenantID,
        databaseWidgetName,
        databaseWidgetDescription,
        databaseWidgetType,
        databaseWidgetConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseWidgetService:updateDatabaseWidgetByID:catch-1",
      params: {
        databaseWidgetID,
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
 * @param {number} param0.databaseWidgetID
 * @returns {Promise<boolean>}
 */
databaseWidgetService.deleteDatabaseWidgetByID = async ({
  userID,
  tenantID,
  databaseWidgetID,
}) => {
  Logger.log("info", {
    message: "databaseWidgetService:deleteDatabaseWidgetByID:params",
    params: {
      userID,
      tenantID,
      databaseWidgetID,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblDatabaseWidgets.delete({
      where: {
        databaseWidgetID: parseInt(databaseWidgetID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
    });

    Logger.log("success", {
      message: "databaseWidgetService:deleteDatabaseWidgetByID:success",
      params: {
        userID,
        tenantID,
        databaseWidgetID,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseWidgetService:deleteDatabaseWidgetByID:failure",
      params: {
        userID,
        tenantID,
        databaseWidgetID,
        error,
      },
    });
    throw error;
  }
};

module.exports = { databaseWidgetService };
