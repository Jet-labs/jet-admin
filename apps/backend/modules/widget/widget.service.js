const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
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
}) => {
  Logger.log("info", {
    message: "widgetService:createWidget:params",
    params: {
      authContext,
      tenantID,
      widgetTitle,
      widgetDescription,
      widgetType,
      widgetConfig,
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
 * Updates an existing database widget.
 *
 * @param {Object} params - Update parameters
 * @param {number} params.widgetID - ID of the widget to update (REQUIRED)
 * @param {object} [params.authContext] - ID of the user performing the update
 * @param {number} [params.tenantID] - Tenant ID associated with the widget
 * @param {string} [params.widgetTitle] - New widget name
 * @param {string} [params.widgetDescription] - New widget description
 * @param {string} [params.widgetType] - Widget type identifier
 * @param {JSON} [params.widgetConfig] - Widget configuration data
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
}) => {
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
