const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { dataQueryService } = require("../dataQuery/dataQuery.service");
const {
  processTextWidgetQueryResults,
  processBarChartQueryResults,
  processLineChartQueryResults,
  processPieChartQueryResults,
  processRadarChartQueryResults,
  processPolarAreaChartQueryResults,
  processScatterChartQueryResults,
  processBubbleChartQueryResults,
  processTableWidgetQueryResults,
} = require("@jet-admin/widgets");
const { WIDGET_TYPES } = require("@jet-admin/widget-types");
const widgetService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
widgetService.getAllWidgets = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "widgetService:getAllWidgets:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const widgets = await prisma.tblWidgets.findMany({
      where: {
        tenantID: parseInt(tenantID),
      },
    });
    Logger.log("success", {
      message: "widgetService:getAllWidgets:success",
      params: {
        userID,
        widgets,
      },
    });
    return widgets;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:getAllWidgets:failure",
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
 * @param {string} param0.widgetTitle
 * @param {string} param0.widgetDescription
 * @param {string} param0.widgetType
 * @param {JSON} param0.widgetConfig
 * @param {Array<object>} param0.dataQueries
 * @returns {Promise<boolean>}
 */
widgetService.createWidget = async ({
  userID,
  tenantID,
  widgetTitle,
  widgetDescription,
  widgetType,
  widgetConfig,
  dataQueries,
}) => {
  Logger.log("info", {
    message: "widgetService:createWidget:params",
    params: {
      userID,
      tenantID,
      widgetTitle,
      widgetDescription,
      widgetType,
      widgetConfig,
    },
  });

  try {
    await prisma.$transaction(async (tx) => {
      const widget = await tx.tblWidgets.create({
        data: {
          tenantID: parseInt(tenantID),
          widgetTitle,
          widgetDescription,
          widgetType,
          widgetConfig,
          creatorID: parseInt(userID),
        },
      });
      await tx.tblWidgetQueryMappings.createMany({
        data: dataQueries.map((dataQuery) => {
          return {
            widgetID: widget.widgetID,
            dataQueryID: parseInt(dataQuery.dataQueryID),
            title: dataQuery.title,
            parameters: dataQuery.parameters,
            datasetFields: dataQuery.datasetFields,
            dataQueryArgValues: dataQuery.dataQueryArgValues,
          };
        }),
      });
    });

    Logger.log("success", {
      message: "widgetService:createWidget:success",
      params: {
        userID,
        tenantID: parseInt(tenantID),
        widgetTitle,
        widgetDescription,
        widgetConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:createWidget:failure",
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
 * @param {string} param0.widgetID
 * @returns {Promise<Array<object>>}
 */
widgetService.getWidgetByID = async ({
  userID,
  tenantID,
  widgetID,
}) => {
  Logger.log("info", {
    message: "widgetService:getWidgetByID:params",
    params: {
      userID,
      tenantID,
      widgetID,
    },
  });

  try {
    const widget = await prisma.tblWidgets.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        widgetID: parseInt(widgetID),
      },
      include: {
        tblWidgetQueryMappings: true,
      },
    });
    Logger.log("success", {
      message: "widgetService:getWidgetByID:success",
      params: {
        userID,
        widget,
      },
    });
    return widget;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:getWidgetByID:failure",
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
 * @param {number} param0.widgetID
 * @returns {Promise<boolean>}
 */
widgetService.cloneWidgetByID = async ({
  userID,
  tenantID,
  widgetID,
}) => {
  Logger.log("info", {
    message: "widgetService:cloneWidgetByID:params",
    params: {
      userID,
      tenantID,
      widgetID,
    },
  });

  try {
    const widget = await prisma.tblWidgets.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        widgetID: parseInt(widgetID),
      },
      include: {
        tblWidgetQueryMappings: true,
      },
    });
    if (!widget) {
      throw new Error("Database widget not found");
    }
    await prisma.$transaction(async (tx) => {
      const newWidget = await tx.tblWidgets.create({
        data: {
          tenantID: parseInt(tenantID),
          widgetTitle: widget.widgetTitle + " (Copy)",
          widgetDescription: widget.widgetDescription,
          widgetType: widget.widgetType,
          widgetConfig: widget.widgetConfig,
          creatorID: parseInt(userID),
        },
      });
      await tx.tblWidgetQueryMappings.createMany({
        data: widget.tblWidgetQueryMappings.map(
          (widgetQueryMapping) => {
            return {
              widgetID: newWidget.widgetID,
              dataQueryID: parseInt(widgetQueryMapping.dataQueryID),
              title: widgetQueryMapping.title,
              parameters: widgetQueryMapping.parameters,
              datasetFields: widgetQueryMapping.datasetFields,
              dataQueryArgValues: widgetQueryMapping.dataQueryArgValues,
            };
          }
        ),
      });
    });
    Logger.log("success", {
      message: "widgetService:cloneWidgetByID:success",
      params: {
        userID,
        widgetID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:cloneWidgetByID:failure",
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
 * @param {string} params.widgetID - Database widget ID
 * @returns {Promise<Object>} Processed widget data with metadata
 */
widgetService.getWidgetDataByID = async ({
  userID,
  dbPool,
  tenantID,
  widgetID,
}) => {
  Logger.log("info", {
    message: "widgetService:getWidgetDataByID:params",
    params: {
      userID,
      tenantID,
      widgetID,
    },
  });

  try {
    // 1. Fetch widget configuration with related queries
    let _widget = await prisma.tblWidgets.findUnique({
      where: { widgetID: parseInt(widgetID, 10) },
      include: {
        tblWidgetQueryMappings: {
          include: {
            tblDataQueries: true,
          },
        },
      },
    });

    const widget = {
      ..._widget,
      dataQueries: _widget.tblWidgetQueryMappings.map((t) => t),
    };

    delete widget.tblWidgetQueryMappings;
    Logger.log("info", {
      message: "widgetService:getWidgetDataByID:widget",
      params: {
        userID,
        tenantID,
        widget,
      },
    });

    if (!widget) {
      Logger.log("error", {
        message: "widgetService:getWidgetDataByID:catch-2",
        params: {
          widgetID,
          userID,
        },
      });
      throw new Error(`Widget ${widgetID} not found`);
    }

    const dataQueriesResult = await Promise.all(
      widget.dataQueries.map((dataQuery) => {
        const argValues = dataQuery.dataQueryArgValues;
        return dataQueryService.runDataQueryByID({
          userID,
          tenantID,
          dataQueryID: dataQuery.tblDataQueries?.dataQueryID,
          argValues: argValues,
        });
      })
    );

    Logger.log("info", {
      message: "widgetService:getWidgetDataByID:dataQueriesResult",
      params: {
        userID,
        tenantID,
        widgetID,
        dataQueriesResult,
        dataQueriesResultCount: dataQueriesResult?.length,
      },
    });

    let processedData;
    // 4. Process results into widget format
    switch (widget.widgetType) {
      case WIDGET_TYPES.TEXT_WIDGET.value:
        processedData = processTextWidgetQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.BAR_CHART.value:
        processedData = processBarChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.LINE_CHART.value:
        processedData = processLineChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.PIE_CHART.value:
        processedData = processPieChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.RADAR_CHART.value:
        processedData = processRadarChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.POLAR_AREA.value:
        processedData = processPolarAreaChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.SCATTER_CHART.value:
        processedData = processScatterChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.BUBBLE_CHART.value:
        processedData = processBubbleChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.TABLE_WIDGET.value:
        processedData = processTableWidgetQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      default:
        processedData = processTextWidgetQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
    }

    Logger.log("success", {
      message: "widgetService:getWidgetDataByID:processedData",
      params: {
        userID,
        tenantID,
        widgetID,
        processedData,
      },
    });

    return {
      widgetID: widget.widgetID,
      widgetTitle: widget.widgetTitle,
      lastUpdated: widget.updatedAt,
      data: processedData,
    };
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:getWidgetDataByID:catch-1",
      params: {
        error,
        widgetID,
        userID,
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
 * @param {object} params.widget - Database widget ID
 * @returns {Promise<Object>} Processed widget data with metadata
 */
widgetService.getWidgetDataUsingWidget = async ({
  userID,
  dbPool,
  tenantID,
  widget,
}) => {
  Logger.log("info", {
    message:
      "widgetService:getWidgetDataUsingWidget:params",
    params: {
      userID,
      tenantID,
      widget,
    },
  });

  try {
    const dataQueries = await prisma.tblDataQueries.findMany({
      where: {
        dataQueryID: {
          in: Array.from(widget.dataQueries).map((t) =>
            parseInt(t.dataQueryID)
          ),
        },
      },
    });

    Logger.log("info", {
      message:
        "widgetService:getWidgetDataUsingWidget:dataQueries",
      params: {
        userID,
        tenantID,
        dataQueries,
      },
    });

    const dataQueryIDMap = {};
    dataQueries.forEach((t) => {
      dataQueryIDMap[t.dataQueryID] = t;
    });

    // 2. Prepare queries for execution
    const dataQueriesToExecute = widget.dataQueries.map(
      (dataQuery) => ({
        dataQueryID: dataQuery.dataQueryID,
        dataQueryOptions: {
          ...dataQueryIDMap[dataQuery.dataQueryID].dataQueryOptions,
          dataQueryArgValues: dataQuery.dataQueryArgValues,
        },
      })
    );

    Logger.log("info", {
      message:
        "widgetService:getWidgetDataUsingWidget:queries-prepared",
      params: {
        dataQueriesToExecuteCount: dataQueriesToExecute.length,
      },
    });

    // 3. Execute all queries
    const dataQueriesResult = await dataQueryService.runDataQueries({
      userID,
      tenantID,
      dbPool,
      dataQueries: dataQueriesToExecute,
    });

    Logger.log("info", {
      message:
        "widgetService:getWidgetDataUsingWidget:dataQueriesResult",
      params: {
        dataQueriesResultCount: dataQueriesResult?.length,
      },
    });

    let processedData;
    // 4. Process results into widget format
    switch (widget.widgetType) {
      case WIDGET_TYPES.TEXT_WIDGET.value:
        processedData = processTextWidgetQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.BAR_CHART.value:
        processedData = processBarChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.LINE_CHART.value:
        processedData = processLineChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.PIE_CHART.value:
        processedData = processPieChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.RADAR_CHART.value:
        processedData = processRadarChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.POLAR_AREA.value:
        processedData = processPolarAreaChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.SCATTER_CHART.value:
        processedData = processScatterChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.BUBBLE_CHART.value:
        processedData = processBubbleChartQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
      case WIDGET_TYPES.TABLE_WIDGET.value:
        processedData = processTableWidgetQueryResults({
          widget,
          dataQueriesResult,
        });
        break;

      default:
        processedData = processTextWidgetQueryResults({
          widget,
          dataQueriesResult,
        });
        break;
    }

    return {
      widgetTitle: widget.widgetTitle,
      lastUpdated: widget.updatedAt,
      data: processedData,
    };
  } catch (error) {
    Logger.log("error", {
      message:
        "widgetService:getWidgetDataUsingWidget:catch-1",
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
 * @param {number} params.widgetID - ID of the widget to update (REQUIRED)
 * @param {number} [params.userID] - ID of the user performing the update
 * @param {number} [params.tenantID] - Tenant ID associated with the widget
 * @param {string} [params.widgetTitle] - New widget name
 * @param {string} [params.widgetDescription] - New widget description
 * @param {string} [params.widgetType] - Widget type identifier
 * @param {JSON} [params.widgetConfig] - Widget configuration data
 * @param {Array<Object>} [params.dataQueries] - Array of query mappings to replace existing ones
 * @param {number} params.dataQueries[].dataQueryID - ID of the associated query
 * @param {string} [params.dataQueries[].title] - Query mapping title
 * @param {JSON} [params.dataQueries[].parameters] - Query parameters
 * @param {number} [params.dataQueries[].executionOrder] - Execution order of queries
 * @param {JSON} [params.dataQueries[].datasetFields] - Dataset field definitions
 * @param {JSON} [params.dataQueries[].dataQueryArgValues] - Argument mappings
 *
 * @returns {Promise<boolean>} True if update succeeded
 * @throws {Error} If database operation fails
 */
widgetService.updateWidgetByID = async ({
  widgetID,
  userID,
  tenantID,
  widgetTitle,
  widgetDescription,
  widgetType,
  widgetConfig,
  dataQueries,
}) => {
  Logger.log("info", {
    message: "widgetService:updateWidgetByID:params",
    params: {
      widgetID,
      userID,
      tenantID,
      widgetTitle,
      widgetDescription,
      widgetType,
      widgetConfig,
      dataQueries,
    },
  });

  try {
    // Fetch existing widget and verify ownership
    const existingWidget = await prisma.tblWidgets.findFirst({
      where: {
        widgetID: parseInt(widgetID),
        tenantID: parseInt(tenantID),
      },
    });

    if (!existingWidget) {
      throw new Error("Widget not found");
    }
    await prisma.$transaction(async (tx) => {
      // Update main widget data
      const updatedWidget = await tx.tblWidgets.update({
        where: { widgetID: parseInt(widgetID) },
        data: {
          ...(widgetTitle != undefined && { widgetTitle }),
          ...(widgetDescription != undefined && {
            widgetDescription,
          }),
          ...(widgetType != undefined && { widgetType }),
          ...(widgetConfig != undefined && { widgetConfig }),
        },
      });

      // Update associated queries if provided
      if (dataQueries) {
        // Delete existing mappings
        await tx.tblWidgetQueryMappings.deleteMany({
          where: { widgetID: parseInt(widgetID) },
        });

        // Create new mappings
        await tx.tblWidgetQueryMappings.createMany({
          data: dataQueries.map((q) => ({
            widgetID: parseInt(widgetID),
            dataQueryID: parseInt(q.dataQueryID),
            title: q.title,
            parameters: q.parameters,
            executionOrder: q.executionOrder,
            datasetFields: q.datasetFields,
            dataQueryArgValues: q.dataQueryArgValues,
          })),
        });
      }
    });

    Logger.log("success", {
      message: "widgetService:updateWidgetByID:success",
      params: {
        widgetID,
        userID,
        tenantID,
        widgetTitle,
        widgetDescription,
        widgetType,
        widgetConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:updateWidgetByID:catch-1",
      params: {
        widgetID,
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
 * @param {number} param0.widgetID
 * @returns {Promise<boolean>}
 */
widgetService.deleteWidgetByID = async ({
  userID,
  tenantID,
  widgetID,
}) => {
  Logger.log("info", {
    message: "widgetService:deleteWidgetByID:params",
    params: {
      userID,
      tenantID,
      widgetID,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblWidgets.delete({
      where: {
        widgetID: parseInt(widgetID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
    });

    Logger.log("success", {
      message: "widgetService:deleteWidgetByID:success",
      params: {
        userID,
        tenantID,
        widgetID,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:deleteWidgetByID:failure",
      params: {
        userID,
        tenantID,
        widgetID,
        error,
      },
    });
    throw error;
  }
};

module.exports = { widgetService };
