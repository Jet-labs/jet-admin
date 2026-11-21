const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const { grantCreatorAccess, removePoliciesForResource } = require("../../config/casbin.config");
const {
  normalizeWidgetConfig,
  validateWidgetConfig,
  getWidgetDescriptor,
} = require("@jet-admin/widget-types");
const { assertTenantReferences } = require("../../utils/tenantReference.util");
const widgetService = {};

/**
 * Widget event actions can target a query/workflow by ID. Those IDs live in
 * JSON, so validate tenant ownership whenever a widget config is written.
 */
async function validateWidgetEventReferences({ tenantID, widgetConfig }) {
  const events = widgetConfig?.events;
  if (!events || typeof events !== "object") return;

  const dataQueryIDs = [];
  const workflowIDs = [];

  for (const actions of Object.values(events)) {
    if (!Array.isArray(actions)) continue;
    for (const action of actions) {
      if (action?.actionType === "TRIGGER_QUERY" && action.config?.queryID) {
        dataQueryIDs.push(action.config.queryID);
      }
      if (action?.actionType === "TRIGGER_WORKFLOW" && action.config?.workflowID) {
        workflowIDs.push(action.config.workflowID);
      }
    }
  }

  await assertTenantReferences({ tenantID, dataQueryIDs, workflowIDs });
}

/**
 * Canonical contract enforcement for writes (F04/B08/F15).
 * Normalizes legacy aliases to the canonical shape, then validates.
 * Unknown config keys and unsupported-but-declared events pass through
 * (preserved, never dropped). Throws a 400-mapped contract error.
 */
const applyWidgetContract = (widgetType, widgetConfig) => {
  if (!getWidgetDescriptor(widgetType)) {
    throw Object.assign(
      new Error(`Unknown widgetType '${widgetType}'. Use the 32 registered types.`),
      { code: "WIDGET_TYPE_UNKNOWN", details: [{ code: "unknown-type", field: "widgetType" }] }
    );
  }
  const { config } = normalizeWidgetConfig(widgetType, widgetConfig || {});
  const result = validateWidgetConfig(widgetType, config, { mode: "authoring" });
  if (!result.valid) {
    throw Object.assign(
      new Error(`Invalid widgetConfig: ${result.errors.map((e) => e.message).join("; ")}`),
      { code: "WIDGET_CONFIG_INVALID", details: result.errors }
    );
  }
  return config;
};
/**
 *
 * @param {object} param0
 * @param {object} param0.authContext
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
widgetService.getAllWidgets = async ({ authContext, tenantID, search, page, pageSize, folderID }) => {
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

    if (folderID) {
      where.folderID = folderID;
    }

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
    // Persist the canonical contract shape (legacy aliases migrated).
    const canonicalConfig = applyWidgetContract(widgetType, widgetConfig);
    await validateWidgetEventReferences({ tenantID, widgetConfig: canonicalConfig });

    const widget = await prisma.tblWidgets.create({
      data: {
        tenantID: tenantID,
        widgetTitle,
        widgetDescription,
        widgetType,
        widgetConfig: canonicalConfig,
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
    if (!widget) {
      Logger.log("error", {
        message: "widgetService:getWidgetByID:widget-not-found",
        params: {
          tenantID,
          widgetID,
        },
      });
      throw new Error("Database widget not found");
    }
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

    // Full-replace semantics for widgetConfig (callers send the complete
    // object). Persist the canonical contract shape against the effective
    // type (incoming type or, when absent, the stored row's type).
    const effectiveType = widgetType != undefined ? widgetType : existingWidget.widgetType;
    const canonicalConfig =
      widgetConfig != undefined ? applyWidgetContract(effectiveType, widgetConfig) : undefined;

    if (canonicalConfig != undefined) {
      await validateWidgetEventReferences({ tenantID, widgetConfig: canonicalConfig });
    }

    // Update main widget data
    const updatedWidget = await prisma.tblWidgets.update({
      where: { widgetID: widgetID },
      data: {
        ...(widgetTitle != undefined && { widgetTitle }),
        ...(widgetDescription != undefined && { widgetDescription }),
        ...(widgetType != undefined && { widgetType }),
        ...(canonicalConfig != undefined && { widgetConfig: canonicalConfig }),
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
    // Widget placements live inside appPageConfig.widgets as
    // `widget_<resourceID>_<placement>`. Block deletion while any page still
    // references this widget so the page does not render a broken slot.
    const appPages = await prisma.tblAppPages.findMany({
      where: { tenantID },
      select: { appPageID: true, appPageTitle: true, appPageConfig: true },
    });

    const referencingPages = appPages.filter((page) => {
      const placements = Array.isArray(page.appPageConfig?.widgets)
        ? page.appPageConfig.widgets
        : [];
      return placements.some((placement) => {
        if (typeof placement !== "string") return false;
        return (
          placement === `widget_${widgetID}` ||
          placement.startsWith(`widget_${widgetID}_`)
        );
      });
    });

    if (referencingPages.length > 0) {
      const error = new Error(
        "Widget is still placed on one or more app pages. Remove it from those pages before deleting it."
      );
      error.name = "WidgetInUseError";
      error.code = "WIDGET_IN_USE";
      error.statusCode = 409;
      error.details = {
        appPages: referencingPages.map((page) => ({
          appPageID: page.appPageID,
          appPageTitle: page.appPageTitle,
        })),
      };
      throw error;
    }

    // Delete the widget
    await prisma.tblWidgets.delete({
      where: {
        widgetID: widgetID,
        tenantID: tenantID,
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

/** @type {{ schemas: Record<string, object>, descriptors: Record<string, object> }|null} — in-process singleton */
let _widgetContractDocs = null;

/**
 * Lazy-loads canonical contract docs from @jet-admin/widget-types:
 * JSON config schemas plus versioned descriptors (aliases, defaults,
 * examples, supported events/methods, categories). Cached in-process.
 *
 * @returns {Promise<{ schemas: Record<string, object>, descriptors: Record<string, object> }>}
 */
async function loadWidgetContractDocs() {
  if (_widgetContractDocs) return _widgetContractDocs;
  const mod = await import('@jet-admin/widget-types');
  const descriptors = {};
  for (const [type, descriptor] of Object.entries(mod.WIDGET_DESCRIPTORS || {})) {
    descriptors[type] = {
      ...descriptor,
      supportedEvents: mod.getSupportedEvents(type).map((e) => e.value),
      supportedMethods: mod.getSupportedMethods(type).map((m) => m.name),
    };
  }
  _widgetContractDocs = { schemas: mod.WIDGET_CONFIG_SCHEMAS, descriptors };
  return _widgetContractDocs;
}

/**
 * Returns widget config schema descriptors.
 * If widgetType is supplied, returns only the schema for that type.
 * If widgetType is omitted, returns all schemas.
 * Each entry carries its JSON `schema` plus a canonical `descriptor`
 * (aliases, defaults, example, supported events/methods) from the same
 * versioned source that API validation enforces.
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

  const { schemas, descriptors } = await loadWidgetContractDocs();
  const withDescriptors = (entry, type) => ({ ...entry, descriptor: descriptors[type] });

  if (widgetType) {
    const schema = schemas[widgetType];
    if (!schema) {
      throw Object.assign(new Error(`No schema found for widgetType: '${widgetType}'`), { code: 'SCHEMA_NOT_FOUND' });
    }
    return { [widgetType]: withDescriptors(schema, widgetType) };
  }

  return Object.fromEntries(
    Object.entries(schemas).map(([type, schema]) => [type, withDescriptors(schema, type)])
  );
};

module.exports = { widgetService };
