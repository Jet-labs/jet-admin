const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const { grantCreatorAccess, removePoliciesForResource } = require("../../config/casbin.config");
const widgetService = {};
/**
 *
 * @param {object} param0
 * @param {object} param0.authContext
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
widgetService.getAllWidgets = async ({ authContext, tenantID, search, page, pageSize }) => {
  Logger.log("info", {
    message: "widgetService:getAllWidgets:params",
    params: {
      authContext,
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
          widgetTitle: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          widgetDescription: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          widgetType: {
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

    const [widgets, totalCount] = await Promise.all([
      prisma.tblWidgets.findMany(findManyOptions),
      prisma.tblWidgets.count({ where }),
    ]);

    Logger.log("success", {
      message: "widgetService:getAllWidgets:success",
      params: {
        authContext,
        widgetsLength: widgets.length,
        totalCount,
      },
    });

    return {
      widgets,
      totalCount,
      page: page || 1,
      pageSize: pageSize || widgets.length,
      totalPages: pageSize ? Math.ceil(totalCount / pageSize) : 1,
    };
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
    if (!creatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }
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

    await grantCreatorAccess(tenantID, "widget", widget.widgetID, authContext, creatorID);

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
    if (!creatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }
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

    await grantCreatorAccess(tenantID, "widget", newWidget.widgetID, authContext, creatorID);

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

    await removePoliciesForResource(tenantID, `widget:${widgetID}`);

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

// ─── Schema Introspection ────────────────────────────────────────────────────

/** @type {Record<string, object>|null} — in-process singleton */
let _widgetConfigSchemas = null;

/**
 * Lazy-loads WIDGET_CONFIG_SCHEMAS from the ESM package @jet-admin/widget-types.
 * After the first call the result is cached in-process for the lifetime of the server.
 *
 * @returns {Promise<Record<string, object>>}
 */
async function loadWidgetConfigSchemas() {
  if (_widgetConfigSchemas) return _widgetConfigSchemas;
  const mod = await import('@jet-admin/widget-types');
  _widgetConfigSchemas = mod.WIDGET_CONFIG_SCHEMAS;
  return _widgetConfigSchemas;
}

/**
 * Returns widget config schema descriptors.
 * If widgetType is supplied, returns only the schema for that type.
 * If widgetType is omitted, returns all schemas.
 *
 * @param {object} param0
 * @param {string|undefined} param0.widgetType
 * @returns {Promise<Record<string, object>|object>}
 */
widgetService.getWidgetSchemas = async ({ widgetType } = {}) => {
  Logger.log('info', {
    message: 'widgetService:getWidgetSchemas:params',
    params: { widgetType },
  });

  const all = await loadWidgetConfigSchemas();

  if (widgetType) {
    const schema = all[widgetType];
    if (!schema) {
      throw Object.assign(new Error(`No schema found for widgetType: '${widgetType}'`), { code: 'SCHEMA_NOT_FOUND' });
    }
    return { [widgetType]: schema };
  }

  return all;
};

module.exports = { widgetService };
