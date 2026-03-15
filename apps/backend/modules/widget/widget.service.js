const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { dataQueryService } = require("../dataQuery/dataQuery.service");
const { workflowService } = require("../workflow/workflow.service");
const { WIDGET_TYPES } = require("@jet-admin/widget-types");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const widgetService = {};

/**
 *
 * @param {object} param0
 * @param {object} param0.authContext
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
widgetService.getAllWidgets = async ({ authContext, tenantID }) => {
  Logger.log("info", {
    message: "widgetService:getAllWidgets:params",
    params: {
      authContext,
      tenantID,
    },
  });

  try {
    const widgets = await prisma.tblWidgets.findMany({
      where: {
        tenantID: tenantID,
      },
      include: {
        tblWorkflows: true,
      },
    });
    Logger.log("success", {
      message: "widgetService:getAllWidgets:success",
      params: {
        authContext,
        widgets,
      },
    });
    return widgets;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:getAllWidgets:failure",
      params: {
        authContext,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {object} param0.authContext
 * @param {string} param0.widgetTitle
 * @param {string} param0.widgetDescription
 * @param {string} param0.widgetType
 * @param {JSON} param0.widgetConfig
 * @param {Array<object>} param0.dataQueries
 * @returns {Promise<boolean>}
 */
widgetService.createWidget = async ({
  authContext,
  tenantID,
  widgetTitle,
  widgetDescription,
  widgetType,
  widgetConfig,
  workflowID,
  workflowConfig,
}) => {
  // Determine mode: workflow mode if workflowSources provided, otherwise query mode

  Logger.log("info", {
    message: "widgetService:createWidget:params",
    params: {
      authContext,
      tenantID,
      widgetTitle,
      widgetDescription,
      widgetType,
      widgetConfig,
      workflowID,
      workflowConfig,
    },
  });

  try {
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const widget = await prisma.tblWidgets.create({
      data: {
        tenantID: tenantID,
        widgetTitle,
        widgetDescription,
        widgetType,
        widgetConfig,
        creatorID,
        createdByApiKeyID,
        workflowID,
        workflowConfig,
      },
    });

    Logger.log("success", {
      message: "widgetService:createWidget:success",
      params: {
        authContext,
        tenantID: tenantID,
        widgetTitle,
        widgetDescription,
        widgetConfig,
        workflowID,
        workflowConfig,
      },
    });
    return widget;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:createWidget:failure",
      params: {
        authContext,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {object} param0.authContext
 * @param {number} param0.tenantID
 * @param {string} param0.widgetID
 * @returns {Promise<Array<object>>}
 */
widgetService.getWidgetByID = async ({ authContext, tenantID, widgetID }) => {
  Logger.log("info", {
    message: "widgetService:getWidgetByID:params",
    params: {
      authContext,
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
        tblWorkflows: true,
      }
    });
    Logger.log("success", {
      message: "widgetService:getWidgetByID:success",
      params: {
        authContext,
        widget,
      },
    });
    return widget;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:getWidgetByID:failure",
      params: {
        authContext,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {object} param0.authContext
 * @param {string} param0.tenantID
 * @param {number} param0.widgetID
 * @returns {Promise<boolean>}
 */
widgetService.cloneWidgetByID = async ({ authContext, tenantID, widgetID, }) => {
  Logger.log("info", {
    message: "widgetService:cloneWidgetByID:params",
    params: {
      authContext,
      tenantID,
      widgetID,
    },
  });

  try {
    const widget = await prisma.tblWidgets.findFirst({
      where: {
        tenantID: tenantID,
        widgetID: widgetID,
      }
    });
    if (!widget) {
      Logger.log("error", {
        message: "widgetService:cloneWidgetByID:widget-not-found",
        params: {
          authContext,
          widgetID,
        },
      });
      throw new Error("Database widget not found");
    }
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const newWidget = await prisma.tblWidgets.create({
      data: {
        tenantID: tenantID,
        widgetTitle: widget.widgetTitle + " (Copy)",
        widgetDescription: widget.widgetDescription,
        widgetType: widget.widgetType,
        widgetConfig: widget.widgetConfig,
        creatorID: creatorID,
        createdByApiKeyID: createdByApiKeyID,
        workflowID: widget.workflowID,
        workflowConfig: widget.workflowConfig,
      },
    });
    Logger.log("success", {
      message: "widgetService:cloneWidgetByID:success",
      params: {
        authContext,
        widgetID,
        newWidgetID: newWidget.widgetID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:cloneWidgetByID:failure",
      params: {
        authContext,
        error,
      },
    });
    throw error;
  }
};

/**
 * Helper to wait for workflow completion (polling)
 * @param {string} instanceID
 * @param {number} timeoutMs
 * @returns {Promise<string>} Final status
 */
const _waitForWorkflowCompletion = async (instanceID, timeoutMs = 30000) => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const status = await workflowService.getRunStatus(instanceID);
    if (!status) throw new Error("Instance not found");

    if (status.status === 'COMPLETED' || status.status === 'FAILED') {
      return status.status;
    }

    // Wait 500ms
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error("Workflow execution timed out");
};

/**
 * Execute workflow for Workflow Mode widgets (non-persisted/preview widgets)
 * @param {object} params
 * @param {object} params.widget - Widget config with workflowSource object
 * @param {object} params.authContext - User ID
 * @param {string} params.tenantID - Tenant ID
 * @param {string} params.executionMode - 'ASYNC' (default) or 'SYNC'
 * @returns {Promise<object>} Workflow instance info or full data
 */
const _executeWorkflowMode = async ({ widget, tenantID, executionMode = 'ASYNC', inputParams = {} }) => {
  const workflowConfig = widget.workflowConfig;

  try {
    const finalInputParams = {
      ...(workflowConfig.workflowArgValues || {}),
      ...inputParams,
    };

    const { instanceID } = await workflowService.executeWorkflow({
      workflowID: widget.workflowID,
      tenantID,
      inputParams: finalInputParams,
    });

    Logger.log("info", {
      message: "widgetService:_executeWorkflowMode:started",
      params: {
        workflowID: widget.workflowID,
        instanceID,
        executionMode,
      },
    });

    // Handle SYNC execution mode
    if (executionMode === 'SYNC') {
      try {
        await _waitForWorkflowCompletion(instanceID);

        // Fetch processed data
        const result = await workflowService.getRunStatusForWidget({
          instanceID,
          widgetType: widget.widgetType,
          workflowConfig: workflowConfig,
          widgetConfig: widget.widgetConfig,
        });

        return {
          title: workflowConfig.title,
          instanceID,
          workflowID: widget.workflowID,
          status: result?.status || 'UNKNOWN',
          // Return the full processed data
          data: result?.data,
          message: "Workflow execution completed synchronously",
        };
      } catch (waitError) {
        Logger.log("error", {
          message: "widgetService:_executeWorkflowMode:sync-timeout",
          params: { instanceID, error: waitError.message },
        });
        // Fallback to returning instanceID with error/timeout status (or let it fail)
        throw waitError;
      }
    }

    // Default ASYNC: Return ID immediately
    return {
      title: workflowConfig.title,
      instanceID,
      workflowID: widget.workflowID,
      status: "PENDING",
    };
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:_executeWorkflowMode:error",
      params: { workflowID: widget.workflowID, error: error.message },
    });

    return {
      title: workflowConfig.title,
      workflowID: widget.workflowID,
      status: "ERROR",
      error: error.message,
    };
  }
};

/**
 * Service function to retrieve and process database widget data.
 * Routes to Query Mode or Workflow Mode based on widget configuration.
 * @param {Object} params
 * @param {object} params.authContext - ID of the requesting user
 * @param {string} params.tenantID - Tenant ID
 * @param {string} params.widgetID - Database widget ID
 * @returns {Promise<Object>} Processed widget data with metadata and workflow instances
 */
widgetService.getWidgetDataByID = async ({
  authContext,
  tenantID,
  widgetID,
  executionMode = 'ASYNC',
  inputParams = {},
}) => {
  Logger.log("info", {
    message: "widgetService:getWidgetDataByID:params",
    params: {
      authContext,
      tenantID,
      widgetID,
      inputParams,
    },
  });

  try {
    // 1. Fetch widget configuration with related queries and workflows
    let widget = await prisma.tblWidgets.findUnique({
      where: { widgetID: widgetID },
      include: {
        tblWorkflows: true,
      },
    });

    if (!widget) {
      Logger.log("error", {
        message: "widgetService:getWidgetDataByID:widget-not-found",
        params: {
          widgetID,
          authContext,
        },
      });
      throw new Error(`Widget ${widgetID} not found`);
    }

    Logger.log("info", {
      message: "widgetService:getWidgetDataByID:widget",
      params: {
        authContext,
        tenantID,
        widgetID,
        dataQueriesCount: widget.dataQueries?.length,
        workflowSourcesCount: widget.workflowSources?.length,
      },
    });

    const workflowInstance = await _executeWorkflowMode({ widget, authContext, tenantID, executionMode, inputParams });

    Logger.log("success", {
      message: "widgetService:getWidgetDataByID:workflowMode:success",
      params: { authContext, tenantID, widgetID },
    });

    return {
      widgetID: widget.widgetID,
      widgetTitle: widget.widgetTitle,
      lastUpdated: widget.updatedAt,
      workflowInstances: workflowInstance,
    };

  } catch (error) {
    Logger.log("error", {
      message: "widgetService:getWidgetDataByID:catch-1",
      params: {
        error,
        widgetID,
        authContext,
      },
    });
    throw error;
  }
};

/**
 * Service function to preview widget data using widget config (non-persisted).
 * Routes to Query Mode or Workflow Mode based on widget configuration.
 * @param {Object} params
 * @param {object} params.authContext - ID of the requesting user
 * @param {string} params.tenantID - Tenant ID
 * @param {object} params.widget - Widget configuration object
 * @returns {Promise<Object>} Processed widget data with metadata
 */
widgetService.getWidgetDataUsingWidget = async ({
  authContext,
  tenantID,
  widget,
  executionMode = 'ASYNC',
  inputParams = {},
}) => {
  Logger.log("info", {
    message: "widgetService:getWidgetDataUsingWidget:params",
    params: {
      authContext,
      tenantID,
      widget,
      inputParams,
    },
  });

  try {
    // Workflow Mode: Execute single workflow
    const workflowInstance = await _executeWorkflowMode({
      widget, authContext, tenantID, executionMode, inputParams
    });

    return {
      widgetTitle: widget.widgetTitle,
      lastUpdated: widget.updatedAt,
      workflowInstances: workflowInstance,
    };
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:getWidgetDataUsingWidget:catch-1",
      params: {
        error,
        authContext,
      },
    });
    throw error;
  }
};

/**
 * Updates an existing database widget and its associated query and workflow mappings.
 * Enforces mutual exclusivity: either query mappings OR workflow mapping, not both.
 *
 * @param {Object} params - Update parameters
 * @param {number} params.widgetID - ID of the widget to update (REQUIRED)
 * @param {object} [params.authContext] - ID of the user performing the update
 * @param {number} [params.tenantID] - Tenant ID associated with the widget
 * @param {string} [params.widgetTitle] - New widget name
 * @param {string} [params.widgetDescription] - New widget description
 * @param {string} [params.widgetType] - Widget type identifier
 * @param {JSON} [params.widgetConfig] - Widget configuration data
 * @param {Array<Object>} [params.dataQueries] - Array of query mappings (Query Mode)
 * @param {Array<Object>} [params.workflowSources] - Array with single workflow mapping (Workflow Mode)
 *
 * @returns {Promise<boolean>} True if update succeeded
 * @throws {Error} If database operation fails
 */
widgetService.updateWidgetByID = async ({
  widgetID,
  authContext,
  tenantID,
  widgetTitle,
  widgetDescription,
  widgetType,
  widgetConfig,
  workflowID,
  workflowConfig,
}) => {
  // Determine mode: workflow mode if workflowSources provided, otherwise query mode


  Logger.log("info", {
    message: "widgetService:updateWidgetByID:params",
    params: {
      widgetID,
      authContext,
      tenantID,
      widgetTitle,
      widgetDescription,
      widgetType,
      widgetConfig,
      workflowID,
      workflowConfig,
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
      Logger.log("error", {
        message: "widgetService:updateWidgetByID:widget-not-found",
        params: {
          widgetID,
          authContext,
        },
      });
      throw new Error("Widget not found");
    }

    // Update main widget data
    const updatedWidget = await prisma.tblWidgets.update({
      where: { widgetID: widgetID },
      data: {
        ...(widgetTitle != undefined && { widgetTitle }),
        ...(widgetDescription != undefined && { widgetDescription }),
        ...(widgetType != undefined && { widgetType }),
        ...(widgetConfig != undefined && { widgetConfig }),
        ...(workflowConfig != undefined && { workflowConfig }),
        ...(workflowID != undefined && {
          tblWorkflows: {
            connect: { workflowID },
          },
        }),
      },
    });

    Logger.log("success", {
      message: "widgetService:updateWidgetByID:success",
      params: {
        widgetID,
        authContext,
        tenantID,
        widgetTitle,
        widgetDescription,
        widgetType,
        widgetConfig,
        workflowID,
        workflowConfig,
      },
    });
    return updatedWidget;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:updateWidgetByID:catch-1",
      params: {
        widgetID,
        authContext,
        error,
      },
    });
    throw error;
  }
}

/**
 *
 * @param {object} param0
 * @param {number} param0.authContext
 * @param {string} param0.tenantID
 * @param {number} param0.widgetID
 * @returns {Promise<boolean>}
 */
widgetService.deleteWidgetByID = async ({ authContext, tenantID, widgetID }) => {
  Logger.log("info", {
    message: "widgetService:deleteWidgetByID:params",
    params: {
      authContext,
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
        authContext,
        tenantID,
        widgetID,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "widgetService:deleteWidgetByID:failure",
      params: {
        authContext,
        tenantID,
        widgetID,
        error,
      },
    });
    throw error;
  }
};

module.exports = { widgetService };
