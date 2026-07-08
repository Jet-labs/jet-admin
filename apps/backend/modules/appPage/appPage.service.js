const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const { grantCreatorAccess, removePoliciesForResource } = require("../../config/casbin.config");
const appPageService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
appPageService.getAllAppPages = async ({ userID, tenantID, search, page, pageSize }) => {
  Logger.log("info", {
    message: "appPageService:getAllAppPages:params",
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
          appPageTitle: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          appPageDescription: {
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

    const [appPages, totalCount] = await Promise.all([
      prisma.tblAppPages.findMany(findManyOptions),
      prisma.tblAppPages.count({ where }),
    ]);

    Logger.log("success", {
      message: "appPageService:getAllAppPages:success",
      params: {
        userID,
        appPagesLength: appPages.length,
        totalCount,
      },
    });

    return {
      appPages,
      totalCount,
      page: page || 1,
      pageSize: pageSize || appPages.length,
      totalPages: pageSize ? Math.ceil(totalCount / pageSize) : 1,
    };
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:getAllAppPages:failure",
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
 * @param {string} param0.appPageTitle
 * @param {string} param0.appPageDescription
 * @param {JSON} param0.appPageConfig
 * @returns {Promise<boolean>}
 */
appPageService.createAppPage = async ({
  userID,
  tenantID,
  appPageTitle,
  appPageDescription,
  appPageConfig,
  authContext,
}) => {
  Logger.log("info", {
    message: "appPageService:createAppPage:params",
    params: {
      userID,
      tenantID,
      appPageTitle,
      appPageDescription,
      appPageConfig,
      authContext,
    },
  });

  try {
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    if (!creatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }
    const appPage = await prisma.$transaction(async (tx) => {
      const page = await tx.tblAppPages.create({
        data: {
          tenantID: tenantID,
          appPageTitle,
          appPageDescription,
          appPageConfig,
          creatorID,
          createdByApiKeyID,
        },
      });
      return page;
    });

    await grantCreatorAccess(tenantID, "appPage", appPage.appPageID, authContext, userID);

    Logger.log("success", {
      message: "appPageService:createAppPage:success",
      params: {
        userID,
        tenantID: tenantID,
        appPageTitle,
        appPageDescription,
      },
    });
    return appPage;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:createAppPage:failure",
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
 * @param {string} param0.appPageID
 * @returns {Promise<Array<object>>}
 */
appPageService.getAppPageByID = async ({
  userID,
  tenantID,
  appPageID,
}) => {
  Logger.log("info", {
    message: "appPageService:getAppPageByID:params",
    params: {
      userID,
      tenantID,
      appPageID,
    },
  });

  try {
    const appPage = await prisma.tblAppPages.findFirst({
      where: {
        tenantID: tenantID,
        appPageID: appPageID,
      },
    });
    Logger.log("success", {
      message: "appPageService:getAppPageByID:success",
      params: {
        userID,
        appPage,
      },
    });
    return appPage;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:getAppPageByID:failure",
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
 * @param {number} param0.appPageID
 * @returns {Promise<boolean>}
 */
appPageService.cloneAppPageByID = async ({
  userID,
  tenantID,
  appPageID,
  authContext,
}) => {
  Logger.log("info", {
    message: "appPageService:cloneAppPageByID:params",
    params: {
      userID,
      tenantID,
      appPageID,
      authContext,
    },
  });

  try {
    const appPage = await prisma.tblAppPages.findFirst({
      where: {
        tenantID: tenantID,
        appPageID: appPageID,
      },
    });
    if (!appPage) {
      throw new Error("App page not found");
    }
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const finalCreatorID = creatorID || userID;
    if (!finalCreatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }
    const newAppPage = await prisma.$transaction(async (tx) => {
      const page = await tx.tblAppPages.create({
        data: {
          tenantID: tenantID,
          appPageTitle: appPage.appPageTitle + " (Copy)",
          appPageDescription: appPage.appPageDescription,
          appPageConfig: appPage.appPageConfig,
          creatorID: finalCreatorID,
          createdByApiKeyID,
        },
      });
      return page;
    });

    await grantCreatorAccess(tenantID, "appPage", newAppPage.appPageID, authContext, finalCreatorID);

    Logger.log("success", {
      message: "appPageService:cloneAppPageByID:success",
      params: {
        userID,
      },
    });
    return newAppPage;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:cloneAppPageByID:failure",
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
 * @param {Object} params
 * @param {number} params.appPageID
 * @param {number} [params.userID]
 * @param {number} [params.tenantID]
 * @param {string} [params.appPageTitle]
 * @param {string} [params.appPageDescription]
 * @param {JSON} [params.appPageConfig]
 *
 * @returns {Promise<boolean>} True if update succeeded
 * @throws {Error} If database operation fails
 */
appPageService.updateAppPageByID = async ({
  appPageID,
  userID,
  tenantID,
  appPageTitle,
  appPageDescription,
  appPageConfig,
}) => {
  Logger.log("info", {
    message: "appPageService:updateAppPageByID:params",
    params: {
      appPageID,
      userID,
      tenantID,
      appPageTitle,
      appPageDescription,
      appPageConfig,
    },
  });

  try {
    const existingAppPage = await prisma.tblAppPages.findFirst({
      where: {
        appPageID: appPageID,
        tenantID: tenantID,
      },
    });

    if (!existingAppPage) {
      throw new Error("App page not found");
    }
    await prisma.$transaction(async (tx) => {
      const updatedAppPage = await tx.tblAppPages.update({
        where: { appPageID: appPageID },
        data: {
          ...(appPageTitle != undefined && { appPageTitle }),
          ...(appPageDescription != undefined && {
            appPageDescription,
          }),
          ...(appPageConfig != undefined && {
            appPageConfig,
          }),
        },
      });
    });

    Logger.log("success", {
      message: "appPageService:updateAppPageByID:success",
      params: {
        appPageID,
        userID,
        tenantID,
        appPageTitle,
        appPageDescription,
        appPageConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:updateAppPageByID:catch-1",
      params: {
        appPageID,
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
 * @param {number} param0.appPageID
 * @returns {Promise<boolean>}
 */
appPageService.deleteAppPageByID = async ({
  userID,
  tenantID,
  appPageID,
}) => {
  Logger.log("info", {
    message: "appPageService:deleteAppPageByID:params",
    params: {
      userID,
      tenantID,
      appPageID,
    },
  });

  try {
    await prisma.tblAppPages.delete({
      where: {
        appPageID: appPageID,
        tenantID: tenantID,
      },
    });

    await removePoliciesForResource(tenantID, `appPage:${appPageID}`);

    Logger.log("success", {
      message: "appPageService:deleteAppPageByID:success",
      params: {
        userID,
        tenantID,
        appPageID,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:deleteAppPageByID:failure",
      params: {
        userID,
        tenantID,
        appPageID,
        error,
      },
    });
    throw error;
  }
};

// ─── Schema Introspection ────────────────────────────────────────────────────

/**
 * Static JSON schema describing the structure of appPageConfig.
 * App pages do not have subtypes, so this returns a single fixed schema.
 * Kept here (instead of a separate package) because app pages are
 * purely a backend concept with no shared frontend type package yet.
 */
const APP_PAGE_CONFIG_SCHEMA = {
  assetType: 'appPage',
  description: 'App page configuration schema. An app page is a canvas that contains widget instances arranged in layouts, reactive page-level data sources, and state variables.',
  schema: {
    type: 'object',
    properties: {
      widgets: {
        type: 'array',
        description: 'List of widget instance keys placed on this page. Keys are formatted as widget_<widgetID>_<index>.',
        items: { type: 'string' }
      },
      layouts: {
        type: 'object',
        description: 'Grid layout configurations indexed by viewport breakpoint (lg, md, sm, xs, xxs)',
        properties: {
          lg: { type: 'array', items: { $ref: '#/definitions/layoutItem' } },
          md: { type: 'array', items: { $ref: '#/definitions/layoutItem' } },
          sm: { type: 'array', items: { $ref: '#/definitions/layoutItem' } },
          xs: { type: 'array', items: { $ref: '#/definitions/layoutItem' } },
          xxs: { type: 'array', items: { $ref: '#/definitions/layoutItem' } }
        }
      },
      layoutVersion: {
        type: 'integer',
        description: 'Optional layout system version (e.g. 2 for flexbox-based layout)',
      },
      layout: {
        type: 'object',
        description: 'Optional layout structure object (used when layoutVersion is 2)'
      },
      dataSources: {
        type: 'array',
        description: 'Page-level reactive data sources supplying data to widgets from queries, workflows, or event listeners.',
        items: {
          type: 'object',
          properties: {
            alias: { type: 'string', description: 'Unique reference name used to access this source in expressions, e.g. state.queries.<alias>.data or state.workflows.<alias>.data' },
            type: { type: 'string', enum: ['query', 'workflow', 'listener'], description: 'The type of reactive data source' },
            queryID: { type: 'string', description: 'UUID of the saved data query (required if type is "query")' },
            workflowID: { type: 'string', description: 'UUID of the workflow (required if type is "workflow")' },
            listenerID: { type: 'string', description: 'UUID of the event listener (required if type is "listener")' },
            channelName: { type: 'string', description: 'Optional channel name for listener sources' },
            inputValues: {
              type: 'object',
              description: 'Key-value map of template parameter values or expressions (e.g. {{ state.variables.userId }}) supplied to the query or workflow'
            },
            triggerMode: { type: 'string', enum: ['auto', 'reactive', 'manual'], description: 'Specifies when this source is fetched: auto (on load), reactive (when dependent variables change), or manual (on-demand only)' },
            refreshOn: {
              type: 'array',
              description: 'List of state paths that trigger a refetch of this source when modified (e.g., variables.selectedUserId)',
              items: { type: 'string' }
            },
            refetchInterval: { type: ['integer', 'null'], description: 'Optional refetch polling interval in milliseconds' }
          },
          required: ['alias', 'type']
        }
      },
      variables: {
        type: 'array',
        description: 'Page-level state variables forming the reactive local state of the canvas.',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'The unique variable key used to read/write state (e.g. selectedRow)' },
            type: { type: 'string', enum: ['string', 'number', 'boolean', 'object', 'array'], description: 'The data type of the variable' },
            defaultValue: { type: ['string', 'number', 'boolean', 'object', 'array', 'null'], description: 'The initial default value' },
            description: { type: 'string', description: 'Optional documentation about what this variable stores' }
          },
          required: ['key', 'type']
        }
      }
    },
    definitions: {
      layoutItem: {
        type: 'object',
        properties: {
          i: { type: 'string', description: 'The widgetInstance key (matches an item in the widgets array)' },
          x: { type: 'integer', description: 'Grid column coordinate (x-axis)' },
          y: { type: 'integer', description: 'Grid row coordinate (y-axis)' },
          w: { type: 'integer', description: 'Width of widget in columns' },
          h: { type: 'integer', description: 'Height of widget in rows' }
        },
        required: ['i', 'x', 'y', 'w', 'h']
      }
    }
  }
};

/**
 * Returns the static app page config schema.
 * Always returns the same object — there are no appPage subtypes.
 *
 * @returns {Promise<object>}
 */
appPageService.getAppPageSchema = async () => {
  Logger.log('info', { message: 'appPageService:getAppPageSchema:params' });
  return APP_PAGE_CONFIG_SCHEMA;
};

module.exports = { appPageService };
