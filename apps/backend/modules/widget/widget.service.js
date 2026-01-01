const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { dataQueryService } = require("../dataQuery/dataQuery.service");
const { workflowService } = require("../workflow/workflow.service");
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
  processIframeWidgetQueryResults,
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
        tenantID: tenantID,
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
  workflowSources,
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
          tenantID: tenantID,
          widgetTitle,
          widgetDescription,
          widgetType,
          widgetConfig,
          creatorID: userID,
        },
      });
      await tx.tblWidgetQueryMappings.createMany({
        data: dataQueries.map((dataQuery) => {
          return {
            widgetID: widget.widgetID,
            dataQueryID: dataQuery.dataQueryID,
            title: dataQuery.title,
            parameters: dataQuery.parameters,
            datasetFields: dataQuery.datasetFields,
            dataQueryArgValues: dataQuery.dataQueryArgValues,
          };
        }),
      });
      // Create workflow source mappings if provided
      if (workflowSources && workflowSources.length > 0) {
        await tx.tblWidgetWorkflowMappings.createMany({
          data: workflowSources.map((wfSource) => {
            return {
              widgetID: widget.widgetID,
              workflowID: wfSource.workflowID,
              title: wfSource.title,
              parameters: wfSource.parameters,
              datasetFields: wfSource.datasetFields,
              workflowArgValues: wfSource.workflowArgValues,
              outputVarMapping: wfSource.outputVarMapping,
            };
          }),
        });
      }
    });

    Logger.log("success", {
      message: "widgetService:createWidget:success",
      params: {
        userID,
        tenantID: tenantID,
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
widgetService.getWidgetByID = async ({ userID, tenantID, widgetID }) => {
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
        tenantID: tenantID,
        widgetID: widgetID,
      },
      include: {
        tblWidgetQueryMappings: true,
        tblWidgetWorkflowMappings: true,
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
widgetService.cloneWidgetByID = async ({ userID, tenantID, widgetID }) => {
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
        tenantID: tenantID,
        widgetID: widgetID,
      },
      include: {
        tblWidgetQueryMappings: true,
        tblWidgetWorkflowMappings: true,
      },
    });
    if (!widget) {
      throw new Error("Database widget not found");
    }
    await prisma.$transaction(async (tx) => {
      const newWidget = await tx.tblWidgets.create({
        data: {
          tenantID: tenantID,
          widgetTitle: widget.widgetTitle + " (Copy)",
          widgetDescription: widget.widgetDescription,
          widgetType: widget.widgetType,
          widgetConfig: widget.widgetConfig,
          creatorID: userID,
        },
      });
      await tx.tblWidgetQueryMappings.createMany({
        data: widget.tblWidgetQueryMappings.map((widgetQueryMapping) => {
          return {
            widgetID: newWidget.widgetID,
            dataQueryID: widgetQueryMapping.dataQueryID,
            title: widgetQueryMapping.title,
            parameters: widgetQueryMapping.parameters,
            datasetFields: widgetQueryMapping.datasetFields,
            dataQueryArgValues: widgetQueryMapping.dataQueryArgValues,
          };
        }),
      });
      // Clone workflow mappings if any exist
      if (widget.tblWidgetWorkflowMappings && widget.tblWidgetWorkflowMappings.length > 0) {
        await tx.tblWidgetWorkflowMappings.createMany({
          data: widget.tblWidgetWorkflowMappings.map((wfMapping) => {
            return {
              widgetID: newWidget.widgetID,
              workflowID: wfMapping.workflowID,
              title: wfMapping.title,
              parameters: wfMapping.parameters,
              datasetFields: wfMapping.datasetFields,
              workflowArgValues: wfMapping.workflowArgValues,
              outputVarMapping: wfMapping.outputVarMapping,
            };
          }),
        });
      }
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
 * Helper function to process widget data based on type
 */
const _processWidgetData = (widget, dataQueriesResult) => {
  switch (widget.widgetType) {
    case WIDGET_TYPES.TEXT_WIDGET.value:
      return processTextWidgetQueryResults({ widget, dataQueriesResult });
    case WIDGET_TYPES.BAR_CHART.value:
      return processBarChartQueryResults({ widget, dataQueriesResult });
    case WIDGET_TYPES.LINE_CHART.value:
      return processLineChartQueryResults({ widget, dataQueriesResult });
    case WIDGET_TYPES.PIE_CHART.value:
      return processPieChartQueryResults({ widget, dataQueriesResult });
    case WIDGET_TYPES.RADAR_CHART.value:
      return processRadarChartQueryResults({ widget, dataQueriesResult });
    case WIDGET_TYPES.POLAR_AREA.value:
      return processPolarAreaChartQueryResults({ widget, dataQueriesResult });
    case WIDGET_TYPES.SCATTER_CHART.value:
      return processScatterChartQueryResults({ widget, dataQueriesResult });
    case WIDGET_TYPES.BUBBLE_CHART.value:
      return processBubbleChartQueryResults({ widget, dataQueriesResult });
    case WIDGET_TYPES.TABLE_WIDGET.value:
      return processTableWidgetQueryResults({ widget, dataQueriesResult });
    case WIDGET_TYPES.IFRAME_WIDGET.value:
      return processIframeWidgetQueryResults({ widget, dataQueriesResult });
    default:
      return processTextWidgetQueryResults({ widget, dataQueriesResult });
  }
};

/**
 * Service function to retrieve and process database widget data.
 * @param {Object} params
 * @param {number} params.userID - ID of the requesting user
 * @param {string} params.tenantID - Tenant ID
 * @param {string} params.widgetID - Database widget ID
 * @returns {Promise<Object>} Processed widget data with metadata and workflow instances
 */
widgetService.getWidgetDataByID = async ({
  userID,
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
    // 1. Fetch widget configuration with related queries and workflows
    let _widget = await prisma.tblWidgets.findUnique({
      where: { widgetID: widgetID },
      include: {
        tblWidgetQueryMappings: {
          include: {
            tblDataQueries: true,
          },
        },
        tblWidgetWorkflowMappings: {
          include: {
            tblWorkflows: true,
          },
        },
      },
    });

    if (!_widget) {
      Logger.log("error", {
        message: "widgetService:getWidgetDataByID:widget-not-found",
        params: {
          widgetID,
          userID,
        },
      });
      throw new Error(`Widget ${widgetID} not found`);
    }

    const widget = {
      ..._widget,
      dataQueries: _widget.tblWidgetQueryMappings.map((t) => t),
      workflowSources: _widget.tblWidgetWorkflowMappings.map((t) => t),
    };

    delete widget.tblWidgetQueryMappings;
    delete widget.tblWidgetWorkflowMappings;

    Logger.log("info", {
      message: "widgetService:getWidgetDataByID:widget",
      params: {
        userID,
        tenantID,
        widgetID,
        dataQueriesCount: widget.dataQueries?.length,
        workflowSourcesCount: widget.workflowSources?.length,
      },
    });

    // 2. Execute data queries immediately
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
        dataQueriesResultCount: dataQueriesResult?.length,
      },
    });

    // 3. Process query data immediately
    const processedData = _processWidgetData(widget, dataQueriesResult);

    // 4. Start workflow executions asynchronously (if any workflow sources exist)
    let workflowInstances = [];
    if (widget.workflowSources && widget.workflowSources.length > 0) {
      workflowInstances = await Promise.all(
        widget.workflowSources.map(async (wfSource) => {
          try {
            const { instanceID } = await workflowService.executeWorkflow({
              workflowID: wfSource.workflowID,
              tenantID,
              inputParams: wfSource.workflowArgValues || {},
            });
            return {
              title: wfSource.title,
              instanceID,
              workflowID: wfSource.workflowID,
              workflowTitle: wfSource.tblWorkflows?.title,
              outputVarMapping: wfSource.outputVarMapping,
              datasetFields: wfSource.datasetFields,
              parameters: wfSource.parameters,
              status: 'PENDING',
            };
          } catch (error) {
            Logger.log("error", {
              message: "widgetService:getWidgetDataByID:workflow-start-error",
              params: { workflowID: wfSource.workflowID, error: error.message },
            });
            return {
              title: wfSource.title,
              workflowID: wfSource.workflowID,
              workflowTitle: wfSource.tblWorkflows?.title,
              outputVarMapping: wfSource.outputVarMapping,
              datasetFields: wfSource.datasetFields,
              parameters: wfSource.parameters,
              status: 'ERROR',
              error: error.message,
            };
          }
        })
      );

      Logger.log("info", {
        message: "widgetService:getWidgetDataByID:workflowInstances",
        params: {
          userID,
          tenantID,
          widgetID,
          workflowInstancesCount: workflowInstances.length,
        },
      });
    }

    Logger.log("success", {
      message: "widgetService:getWidgetDataByID:processedData",
      params: {
        userID,
        tenantID,
        widgetID,
      },
    });

    return {
      widgetID: widget.widgetID,
      widgetTitle: widget.widgetTitle,
      lastUpdated: widget.updatedAt,
      data: processedData,
      workflowInstances, // Frontend will poll/socket for these
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
 * @param {string} params.tenantID - Tenant ID
 * @param {object} params.widget - Database widget ID
 * @returns {Promise<Object>} Processed widget data with metadata
 */
widgetService.getWidgetDataUsingWidget = async ({
  userID,
  tenantID,
  widget,
}) => {
  Logger.log("info", {
    message: "widgetService:getWidgetDataUsingWidget:params",
    params: {
      userID,
      tenantID,
      widget,
    },
  });

  try {
    const dataQueriesResult = await Promise.all(
      widget.dataQueries.map((dataQuery) => {
        const argValues = dataQuery.dataQueryArgValues;
        return dataQueryService.runDataQueryByID({
          userID,
          tenantID,
          dataQueryID: dataQuery.dataQueryID,
          argValues: argValues,
        });
      })
    );

    Logger.log("info", {
      message: "widgetService:getWidgetDataUsingWidget:dataQueriesResult",
      params: {
        dataQueriesResultCount: dataQueriesResult?.length,
      },
    });

    const processedData = _processWidgetData(widget, dataQueriesResult);

    return {
      widgetTitle: widget.widgetTitle,
      lastUpdated: widget.updatedAt,
      data: processedData,
    };
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:getWidgetDataUsingWidget:catch-1",
      params: {
        error,
        userID,
      },
    });
    throw error;
  }
};

/**
 * Updates an existing database widget and its associated query and workflow mappings.
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
 * @param {Array<Object>} [params.workflowSources] - Array of workflow mappings to replace existing ones
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
  workflowSources,
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
      dataQueriesCount: dataQueries?.length,
      workflowSourcesCount: workflowSources?.length,
    },
  });

  try {
    // Fetch existing widget and verify ownership
    const existingWidget = await prisma.tblWidgets.findFirst({
      where: {
        widgetID: widgetID,
        tenantID: tenantID,
      },
    });

    if (!existingWidget) {
      throw new Error("Widget not found");
    }
    await prisma.$transaction(async (tx) => {
      // Update main widget data
      const updatedWidget = await tx.tblWidgets.update({
        where: { widgetID: widgetID },
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
        // Delete existing query mappings
        await tx.tblWidgetQueryMappings.deleteMany({
          where: { widgetID: widgetID },
        });

        // Create new query mappings (only for items with dataQueryID)
        const queryMappings = dataQueries.filter(q => q.dataQueryID);
        if (queryMappings.length > 0) {
          await tx.tblWidgetQueryMappings.createMany({
            data: queryMappings.map((q) => ({
              widgetID: widgetID,
              dataQueryID: q.dataQueryID,
              title: q.title,
              parameters: q.parameters,
              executionOrder: q.executionOrder,
              datasetFields: q.datasetFields,
              dataQueryArgValues: q.dataQueryArgValues,
            })),
          });
        }
      }

      // Update associated workflow sources if provided
      if (workflowSources) {
        // Delete existing workflow mappings
        await tx.tblWidgetWorkflowMappings.deleteMany({
          where: { widgetID: widgetID },
        });

        // Create new workflow mappings (only for items with workflowID)
        const workflowMappings = workflowSources.filter(wf => wf.workflowID);
        if (workflowMappings.length > 0) {
          await tx.tblWidgetWorkflowMappings.createMany({
            data: workflowMappings.map((wf) => ({
              widgetID: widgetID,
              workflowID: wf.workflowID,
              title: wf.title,
              parameters: wf.parameters,
              executionOrder: wf.executionOrder,
              datasetFields: wf.datasetFields,
              workflowArgValues: wf.workflowArgValues,
              outputVarMapping: wf.outputVarMapping,
            })),
          });
        }
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
widgetService.deleteWidgetByID = async ({ userID, tenantID, widgetID }) => {
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
        widgetID: widgetID, // Assuming `id` is the primary key for the query
        tenantID: tenantID, // Ensure tenantID matches for security
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
