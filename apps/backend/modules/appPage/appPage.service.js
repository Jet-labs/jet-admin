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
appPageService.getAllAppPages = async ({ userID, tenantID, search, page, pageSize, folderID }) => {
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

    if (folderID) {
      where.folderID = folderID;
    }

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
  changeNote,
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

    // Snapshot the pre-update state so every save is restorable.
    // Fire-and-forget w.r.t. the update itself: a version failure must
    // never fail the save. changeNote rides the update body (passthrough).
    try {
      await snapshotAppPageVersion({
        tenantID,
        appPageID,
        appPageTitle: existingAppPage.appPageTitle,
        appPageDescription: existingAppPage.appPageDescription,
        appPageConfig: existingAppPage.appPageConfig,
        changeNote: changeNote || null,
        creatorID: userID || null,
        createdByApiKeyID: null,
      });
    } catch (versionError) {
      Logger.log("error", {
        message: "appPageService:updateAppPageByID:version-snapshot-failed",
        params: { appPageID, tenantID, error: versionError?.message },
      });
    }

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

    // Versions are not FK-cascaded by design — clean them explicitly.
    await prisma.tblAppPageVersions.deleteMany({
      where: { appPageID, tenantID },
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
 *
 * Updated based on real DB data analysis and frontend source review.
 */
const APP_PAGE_CONFIG_SCHEMA = {
  assetType: 'appPage',
  description: 'App page configuration schema. An app page is a canvas that contains widget instances arranged in a tree-based V2 layout, reactive page-level data sources, and state variables.',
  schema: {
    type: 'object',
    properties: {
      layoutVersion: {
        type: 'integer',
        description: 'Layout system version. Always 2 for new pages. V2 uses a tree-based layout (the "layout" field). V1 used a flat grid (the "layouts" field) and is auto-migrated to V2 on load.',
      },
      layout: {
        type: 'object',
        description: 'Root of the V2 layout tree. The root is always a "column" node whose children are rows, stacks, z-stacks, or containers. Each leaf "widget" node references a widgetKey from the "widgets" array.',
        properties: {
          id: { type: 'string', description: 'Unique node ID (e.g. "ROOT" or a short random string like "col_abc123")' },
          type: { type: 'string', enum: ['column'], description: 'The root node is always "column"' },
          children: { type: 'array', items: { '$ref': '#/definitions/layoutNode' } }
        },
        required: ['id', 'type', 'children']
      },
      widgets: {
        type: 'array',
        description: 'Registry of all widget instance keys placed on this page. Format: "widget_<widgetID>_<instanceSuffix>". The instanceSuffix must be unique per page (use an incrementing integer like 1, 2, 3 or a timestamp). The same widgetID CAN appear multiple times with different suffixes if the same widget is placed at multiple positions.',
        items: { type: 'string' }
      },
      dataSources: {
        type: 'array',
        description: 'Page-level reactive data sources that supply data to widgets. Queries accessible via {{ state.queries.<alias>.data }}, workflows via {{ state.workflows.<alias>.data }}, listeners via {{ state.listeners.<alias>.data }}. The ".isLoading" and ".error" sub-keys are also available (e.g. {{ state.queries.users.isLoading }}).',
        items: {
          type: 'object',
          properties: {
            alias: { type: 'string', description: 'Unique camelCase or snake_case identifier for expressions. Only alphanumeric + underscore. E.g. "users_list", "workflow_1", "query_1".' },
            type: { type: 'string', enum: ['query', 'workflow', 'listener'], description: 'Type of reactive data source' },
            queryID: { type: 'string', description: 'UUID of the saved DataQuery (required if type="query"). Set to "" for other types.' },
            workflowID: { type: 'string', description: 'UUID of the Workflow (required if type="workflow"). Set to "" for other types.' },
            listenerID: { type: 'string', description: 'UUID of the Listener (required if type="listener"). Set to "" for other types.' },
            channelName: { type: 'string', description: 'Optional custom socket channel name for listener sources. Defaults to "listener:<listenerID>". Set to "" unless custom channel is needed.' },
            inputValues: {
              type: 'object',
              description: 'Key-value map of arguments supplied to the query or workflow. Values support template expressions, e.g. "{{state.variables.startDate}}" or "{{ state.variables.userId }}".'
            },
            triggerMode: { type: 'string', enum: ['auto', 'reactive', 'manual'], description: '"auto": fetched immediately on page load. "reactive": refetched when any variable in "refreshOn" changes. "manual": only triggered by widget event actions (EXECUTE_QUERY).' },
            refreshOn: {
              type: 'array',
              description: 'Variable paths that trigger a refetch when changed. Only relevant when triggerMode="reactive". Format: "variables.<variableKey>", e.g. ["variables.startDate", "variables.endDate"].',
              items: { type: 'string' }
            },
            refetchInterval: { type: ['integer', 'null'], description: 'Optional polling interval in milliseconds (e.g. 5000). null = no polling.' }
          },
          required: ['alias', 'type']
        }
      },
      variables: {
        type: 'array',
        description: 'Page-level reactive state variables. Accessible in widget expressions via {{ state.variables.<key> }}. Modified by widget event actions (SET_VARIABLE). Use for: selected rows, filter values, date range inputs, toggle state, pagination offsets, etc.',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'Unique variable key. Only alphanumeric + underscore. E.g. "selectedRow", "startDate", "filterStatus", "currentPage".' },
            type: { type: 'string', enum: ['string', 'number', 'boolean', 'object', 'array'], description: 'Data type of the variable' },
            defaultValue: { description: 'Initial value. Must match the declared type: "" for string, 0 for number, false for boolean, {} for object, [] for array.' },
            description: { type: 'string', description: 'Optional documentation about what this variable stores' }
          },
          required: ['key', 'type']
        }
      },
      layouts: {
        type: 'object',
        description: 'LEGACY V1 field. Always empty ({}) on new V2 pages. Do NOT populate this when creating or updating pages.'
      },
      _legacyLayouts: {
        type: 'object',
        description: 'Internal field preserved after V1→V2 migration. Do NOT set or modify this field.'
      }
    },
    definitions: {
      layoutNode: {
        description: 'One of the 6 supported layout node types: column, row, widget, container, stack, z-stack.',
        oneOf: [
          { '$ref': '#/definitions/columnNode' },
          { '$ref': '#/definitions/rowNode' },
          { '$ref': '#/definitions/widgetNode' },
          { '$ref': '#/definitions/containerNode' },
          { '$ref': '#/definitions/stackNode' },
          { '$ref': '#/definitions/zStackNode' }
        ]
      },
      columnNode: {
        type: 'object',
        description: 'Vertical column container. Children stack top-to-bottom. The root layout node is always a column.',
        properties: {
          id: { type: 'string', description: 'Unique node ID' },
          type: { type: 'string', enum: ['column'] },
          children: { type: 'array', items: { '$ref': '#/definitions/layoutNode' } },
          condition: { type: 'string', description: 'Optional mustache expression. Node renders only when truthy.' },
          style: { type: 'object', description: 'Optional inline CSS styles.' }
        },
        required: ['id', 'type', 'children']
      },
      rowNode: {
        type: 'object',
        description: 'Horizontal row. Children (widget/container/stack nodes) are laid out side by side. Each child has a "span" (1–12) for relative width. Total spans of all children should sum to 12 for a full-width row.',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['row'] },
          children: { type: 'array', items: { '$ref': '#/definitions/layoutNode' } },
          sizing: { type: 'string', enum: ['auto', 'fixed'], description: '"auto" = height fits content. "fixed" = use fixedHeight.' },
          fixedHeight: { type: 'integer', description: 'Row height in pixels when sizing="fixed". E.g. 400.' },
          gap: { type: 'integer', description: 'Gap in pixels between child nodes.' },
          condition: { type: 'string' },
          style: { type: 'object' }
        },
        required: ['id', 'type', 'children']
      },
      widgetNode: {
        type: 'object',
        description: 'Leaf node that renders one placed widget instance. The widgetKey MUST exist in the page "widgets" array. The referenced widget (by widgetID extracted from the key) must be created via create_widget before placing it here.',
        properties: {
          id: { type: 'string', description: 'Unique node ID' },
          type: { type: 'string', enum: ['widget'] },
          widgetKey: { type: 'string', description: 'Widget instance key from the page "widgets" array. Format: "widget_<widgetID>_<suffix>".' },
          span: { type: 'integer', minimum: 1, maximum: 12, description: 'Width fraction within the parent 12-column row/stack.' },
          sizing: { type: 'string', enum: ['auto', 'fill', 'fixed'], description: '"auto" = natural height. "fill" = stretch to parent. "fixed" = explicit fixedHeight.' },
          fixedHeight: { type: 'integer', description: 'Height in pixels when sizing="fixed".' },
          width: { description: 'Optional width override: pixel integer or "grow".' },
          height: { description: 'Optional height override: pixel integer.' },
          minHeight: { type: 'integer' },
          maxHeight: { type: 'integer' },
          style: { type: 'object' },
          condition: { type: 'string' }
        },
        required: ['id', 'type', 'widgetKey', 'span', 'sizing']
      },
      containerNode: {
        type: 'object',
        description: 'A wrapper that nests a column layout within a row slot. Use when you need a column of widgets inside a row cell.',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['container'] },
          span: { type: 'integer', minimum: 1, maximum: 12 },
          sizing: { type: 'string', enum: ['auto', 'fill', 'fixed'] },
          children: { type: 'array', items: { '$ref': '#/definitions/columnNode' } },
          style: { type: 'object' },
          condition: { type: 'string' }
        },
        required: ['id', 'type', 'span', 'sizing', 'children']
      },
      stackNode: {
        type: 'object',
        description: 'A flexbox stack. Use for flexible horizontal or vertical flows with wrapping and alignment control. For example: a header bar with a logo and a date picker side by side (direction="horizontal", align="flex-end").',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['stack'] },
          direction: { type: 'string', enum: ['horizontal', 'vertical'], description: 'Flexbox main axis.' },
          span: { type: 'integer', minimum: 1, maximum: 12 },
          sizing: { type: 'string', enum: ['auto', 'fill', 'fixed'] },
          wrap: { type: 'boolean', description: 'Whether children wrap to next line.' },
          gap: { type: 'integer', description: 'Pixel gap between children.' },
          align: { type: 'string', description: 'CSS align-items value: "flex-start", "flex-end", "center", "stretch".' },
          children: { type: 'array', items: { '$ref': '#/definitions/layoutNode' } },
          style: { type: 'object' },
          condition: { type: 'string' }
        },
        required: ['id', 'type', 'direction', 'span', 'sizing', 'children']
      },
      zStackNode: {
        type: 'object',
        description: 'Layers children on top of each other (like z-index stacking). Each child layer is absolutely positioned. Use for overlays, glassmorphism backgrounds, or layered chart panels. Each child\'s opacity is controlled by the matching entry in "layerOpacities".',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['z-stack'] },
          span: { type: 'integer', minimum: 1, maximum: 12 },
          sizing: { type: 'string', enum: ['auto', 'fill', 'fixed'] },
          children: { type: 'array', items: { '$ref': '#/definitions/layoutNode' } },
          layerOpacities: { type: 'array', items: { type: 'number', minimum: 0, maximum: 1 }, description: 'Opacity for each child layer in order. E.g. [1, 0.8, 1].' },
          style: { type: 'object' },
          condition: { type: 'string' }
        },
        required: ['id', 'type', 'span', 'sizing', 'children']
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

// ─── Version History ─────────────────────────────────────────────────────────

/** Maximum snapshots retained per page. Oldest beyond the cap are pruned. */
const MAX_VERSIONS_PER_PAGE = 50;

/**
 * Persists an immutable snapshot of a page revision. Internal helper —
 * callers pass the state to preserve (pre-update on save, current on
 * restore, explicit on demand).
 */
async function snapshotAppPageVersion({
  tenantID,
  appPageID,
  appPageTitle,
  appPageDescription,
  appPageConfig,
  changeNote,
  creatorID,
  createdByApiKeyID,
}) {
  return prisma.$transaction(async (tx) => {
    const latest = await tx.tblAppPageVersions.findFirst({
      where: { tenantID, appPageID },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });
    const versionNumber = (latest?.versionNumber || 0) + 1;
    const version = await tx.tblAppPageVersions.create({
      data: {
        tenantID,
        appPageID,
        versionNumber,
        appPageTitle: appPageTitle ?? null,
        appPageDescription: appPageDescription ?? null,
        appPageConfig: appPageConfig ?? null,
        changeNote: changeNote ?? null,
        creatorID: creatorID ?? null,
        createdByApiKeyID: createdByApiKeyID ?? null,
      },
    });
    // Prune oldest beyond the cap, keeping versionNumber monotonic.
    const overflow = await tx.tblAppPageVersions.count({ where: { tenantID, appPageID } });
    if (overflow > MAX_VERSIONS_PER_PAGE) {
      const stale = await tx.tblAppPageVersions.findMany({
        where: { tenantID, appPageID },
        orderBy: { versionNumber: "asc" },
        take: overflow - MAX_VERSIONS_PER_PAGE,
        select: { appPageVersionID: true },
      });
      await tx.tblAppPageVersions.deleteMany({
        where: { appPageVersionID: { in: stale.map((s) => s.appPageVersionID) } },
      });
    }
    return version;
  });
}

appPageService.getAppPageVersions = async ({ userID, tenantID, appPageID, page, pageSize }) => {
  Logger.log("info", {
    message: "appPageService:getAppPageVersions:params",
    params: { userID, tenantID, appPageID, page, pageSize },
  });
  try {
    const where = { tenantID, appPageID };
    const findManyOptions = {
      where,
      orderBy: { versionNumber: "desc" },
      select: {
        appPageVersionID: true,
        versionNumber: true,
        appPageTitle: true,
        changeNote: true,
        creatorID: true,
        createdByApiKeyID: true,
        createdAt: true,
      },
    };
    if (page && pageSize) {
      findManyOptions.skip = (page - 1) * pageSize;
      findManyOptions.take = pageSize;
    }
    const [versions, totalCount] = await Promise.all([
      prisma.tblAppPageVersions.findMany(findManyOptions),
      prisma.tblAppPageVersions.count({ where }),
    ]);
    return {
      versions,
      totalCount,
      page: page || 1,
      pageSize: pageSize || versions.length,
      totalPages: pageSize ? Math.ceil(totalCount / pageSize) : 1,
    };
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:getAppPageVersions:failure",
      params: { userID, error },
    });
    throw error;
  }
};

appPageService.getAppPageVersionByID = async ({ userID, tenantID, appPageID, versionID }) => {
  Logger.log("info", {
    message: "appPageService:getAppPageVersionByID:params",
    params: { userID, tenantID, appPageID, versionID },
  });
  try {
    const version = await prisma.tblAppPageVersions.findFirst({
      where: { tenantID, appPageID, appPageVersionID: versionID },
    });
    if (!version) throw new Error("App page version not found");
    return version;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:getAppPageVersionByID:failure",
      params: { userID, error },
    });
    throw error;
  }
};

appPageService.restoreAppPageVersion = async ({ userID, tenantID, appPageID, versionID, authContext }) => {
  Logger.log("info", {
    message: "appPageService:restoreAppPageVersion:params",
    params: { userID, tenantID, appPageID, versionID },
  });
  try {
    const [page, version] = await Promise.all([
      prisma.tblAppPages.findFirst({ where: { tenantID, appPageID } }),
      prisma.tblAppPageVersions.findFirst({ where: { tenantID, appPageID, appPageVersionID: versionID } }),
    ]);
    if (!page) throw new Error("App page not found");
    if (!version) throw new Error("App page version not found");

    const { creatorID, createdByApiKeyID } = authContext
      ? getCreationContextFromAuthContext(authContext)
      : { creatorID: userID, createdByApiKeyID: null };

    // Snapshot current state first so the restore itself is undoable.
    await snapshotAppPageVersion({
      tenantID,
      appPageID,
      appPageTitle: page.appPageTitle,
      appPageDescription: page.appPageDescription,
      appPageConfig: page.appPageConfig,
      changeNote: `Before restore to v${version.versionNumber}`,
      creatorID: creatorID || userID || null,
      createdByApiKeyID: createdByApiKeyID || null,
    });

    await prisma.tblAppPages.update({
      where: { appPageID },
      data: {
        appPageTitle: version.appPageTitle ?? page.appPageTitle,
        appPageDescription: version.appPageDescription,
        appPageConfig: version.appPageConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:restoreAppPageVersion:failure",
      params: { userID, error },
    });
    throw error;
  }
};

module.exports = { appPageService };
