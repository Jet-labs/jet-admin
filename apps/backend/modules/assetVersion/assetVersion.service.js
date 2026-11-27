const { createHash } = require("crypto");
const { collectPageWidgetIDs } = require("@jet-admin/application-contracts");
const { extractQueryDefinitions } = require("../../utils/input.util");
const { validateExecutableGraph } = require("@jet-admin/workflow-nodes-logic/runtime-contract");
const { applicationError } = require("../application/application.errors");
const { listenerDefinition, listenerDefinitionHash } = require("../listener/listenerDefinition");
const { capturePageTriggerBindings } = require("../appPage/appPage.actions");
const { payloadChildVersionIDs } = require("./assetVersion.references");
const { diffJson, comparablePayload, DIFF_CHANGE_LIMIT } = require("./assetVersion.diff");

// Capturing a version walks the asset's dependency graph: an app page captures
// every data source and widget, and each widget captures its own query/workflow
// dependencies. That is many sequential statements behind a per-asset advisory
// lock, so Prisma's 5s interactive-transaction default expires (P2028) on large
// pages and whenever a concurrent publish holds the same locks. Capture with the
// same budget as a release publish, and retry the transaction errors Prisma
// documents as transient.
const CAPTURE_TRANSACTION_OPTIONS = Object.freeze({ timeout: 180000, maxWait: 20000 });
const CAPTURE_TRANSACTION_ATTEMPTS = 3;
const RETRYABLE_TRANSACTION_CODES = new Set(["P2028", "P2034"]);

const ASSET_TYPES = {
  datasource: { resource: "datasource", table: "tblDatasources", idField: "datasourceID" },
  listener: { resource: "listener", table: "tblListeners", idField: "listenerID" },
  query: { resource: "dataquery", table: "tblDataQueries", idField: "dataQueryID" },
  cronjob: { resource: "cronjob", table: "tblCronJobs", idField: "cronJobID" },
  widget: { resource: "widget", table: "tblWidgets", idField: "widgetID" },
  workflow: { resource: "workflow", table: "tblWorkflows", idField: "workflowID" },
  appPage: { resource: "appPage", table: "tblAppPages", idField: "appPageID" },
};

const stableValue = value => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = stableValue(value[key]);
      return result;
    }, {});
  }
  return value;
};
const stableHash = value => createHash("sha256").update(JSON.stringify(stableValue(value))).digest("hex");
const assetType = type => {
  const config = ASSET_TYPES[type];
  if (!config) throw applicationError("INVALID_ASSET_TYPE", "Unknown asset type.", 400);
  return config;
};
const safeKey = value => typeof value === "string" && /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(value);
const actorFields = ctx => ({
  createdByUserID: ctx?.caller?.type === "user" ? ctx.caller.id : null,
  createdByApiKeyID: ctx?.caller?.type === "apiKey" ? ctx.caller.id : null,
});
const displayTitle = (type, payload) => payload?.appPageTitle || payload?.widgetTitle || payload?.dataQueryTitle
  || payload?.listenerTitle || payload?.cronJobTitle || payload?.datasourceTitle || payload?.title || null;
function createAssetVersionService({ db, enforce }) {
  const SOURCE_VERSION_FIELDS = {
    query: "queryVersionID",
    workflow: "workflowVersionID",
    listener: "listenerVersionID",
  };

  async function checkAccess(ctx, type, assetID, action = "read") {
    const config = assetType(type);
    if (!ctx?.tenantID || !ctx?.caller?.id) throw applicationError("PERMISSION_DENIED", "Asset version access denied.", 403);
    if (!await enforce(ctx.caller.id, ctx.tenantID, `${config.resource}:${assetID}`, action)) {
      throw applicationError("PERMISSION_DENIED", "Asset version access denied.", 403);
    }
  }

  async function loadRow(tx, ctx, type, assetID) {
    const config = assetType(type);
    const where = { tenantID: ctx.tenantID, [config.idField]: assetID };
    let row;
    if (type === "workflow") {
      row = await tx.tblWorkflows.findFirst({
        where,
        include: {
          tblWorkflowNodes: { orderBy: { nodeID: "asc" }, select: { nodeID: true, nodeType: true, nodeConfig: true } },
          tblWorkflowEdge: { orderBy: { edgeID: "asc" }, select: { edgeID: true, upstreamNodeID: true, downstreamNodeID: true, sourceHandle: true, targetHandle: true } },
        },
      });
    } else if (type === "listener") {
      row = await tx.tblListeners.findFirst({
        where,
        include: { tblListenerActions: { where: { isEnabled: true }, orderBy: [{ orderIndex: "asc" }, { actionID: "asc" }] } },
      });
    } else {
      row = await tx[config.table].findFirst({ where });
    }
    if (!row) throw applicationError("ASSET_NOT_FOUND", "The asset no longer exists in this tenant.", 409);
    if ((type === "query" || type === "workflow") && row.isDisabled) {
      throw applicationError("ASSET_DISABLED", "A disabled asset cannot be captured into a version.", 409);
    }
    return row;
  }

  async function captureDeclaredSourceVersion({ ctx, tx, source, sourceType, sourceID, alias, visiting, versionField, changeNote }) {
    const field = versionField || SOURCE_VERSION_FIELDS[sourceType];
    const requestedVersionID = field && typeof source?.[field] === "string" ? source[field].trim() : "";
    const versionMode = source?.versionMode || (requestedVersionID ? "specific" : "latest-at-capture");
    if (!["latest-at-capture", "specific"].includes(versionMode)) {
      throw applicationError(
        "APP_PAGE_SOURCE_VERSION_MODE_INVALID",
        `Data source "${alias}" has an invalid version mode.`,
        400
      );
    }
    if (versionMode === "latest-at-capture") {
      return ensureVersionInTx({
        ctx, tx, assetType: sourceType, assetID: sourceID,
        changeNote: changeNote || `Captured by page data source "${alias}"`, visiting,
      });
    }
    if (!requestedVersionID) {
      throw applicationError(
        "APP_PAGE_SOURCE_VERSION_REQUIRED",
        `Data source "${alias}" is set to a specific version but no version was selected.`,
        400
      );
    }
    await checkAccess(ctx, sourceType, sourceID, "read");
    const version = await tx.tblAssetVersions.findFirst({
      where: {
        tenantID: ctx.tenantID,
        assetVersionID: requestedVersionID,
        assetType: sourceType,
        assetID: sourceID,
        status: "published",
      },
      select: { assetVersionID: true, versionNumber: true, payload: true },
    });
    if (!version) {
      throw applicationError(
        "APP_PAGE_SOURCE_VERSION_NOT_FOUND",
        `Data source "${alias}" selects a version that does not belong to this ${sourceType}.`,
        409
      );
    }
    return version;
  }

  async function buildPayload({ ctx, tx, type, assetID, visiting }) {
    const row = await loadRow(tx, ctx, type, assetID);
    if (type === "datasource") {
      return {
        datasourceID: row.datasourceID, datasourceTitle: row.datasourceTitle,
        datasourceDescription: row.datasourceDescription || null, datasourceType: row.datasourceType,
        datasourceTags: row.datasourceTags || [],
        // Connection options and credentials are environment bindings, not
        // definition payloads. Rotating them must not create a new version.
      };
    }
    if (type === "widget") {
      const widgetConfig = row.widgetConfig || {};
      const queryVersions = {};
      const workflowVersions = {};
      for (const source of Array.isArray(widgetConfig.dataSources) ? widgetConfig.dataSources : []) {
        if (!source || typeof source !== "object") continue;
        if (source.type === "query" && source.queryID) {
          const version = await captureDeclaredSourceVersion({
            ctx, tx, source, sourceType: "query", sourceID: source.queryID,
            alias: source.alias || source.queryID, visiting, versionField: "queryVersionID",
            changeNote: "Captured by widget version",
          });
          queryVersions[source.queryID] = version.assetVersionID;
        } else if (source.type === "workflow" && source.workflowID) {
          const version = await captureDeclaredSourceVersion({
            ctx, tx, source, sourceType: "workflow", sourceID: source.workflowID,
            alias: source.alias || source.workflowID, visiting, versionField: "workflowVersionID",
            changeNote: "Captured by widget version",
          });
          workflowVersions[source.workflowID] = version.assetVersionID;
        }
      }
      return {
        widgetID: row.widgetID, widgetTitle: row.widgetTitle, widgetType: row.widgetType,
        widgetConfig, queryVersions, workflowVersions,
      };
    }
    if (type === "query") {
      const options = row.dataQueryOptions && typeof row.dataQueryOptions === "object" ? row.dataQueryOptions : {};
      const datasourceVersion = row.datasourceID
        ? await captureDeclaredSourceVersion({
          ctx, tx, source: options, sourceType: "datasource", sourceID: row.datasourceID,
          alias: "datasource", visiting, versionField: "datasourceVersionID",
          changeNote: "Captured by query version",
        })
        : null;
      return {
        dataQueryID: row.dataQueryID, dataQueryTitle: row.dataQueryTitle,
        dataQueryDescription: row.dataQueryDescription || null, datasourceID: row.datasourceID || null,
        datasourceType: row.datasourceType, datasourceVersionID: datasourceVersion?.assetVersionID || null,
        dataQueryOptions: row.dataQueryOptions || {}, runOnLoad: Boolean(row.runOnLoad),
        dataQueryResultSchema: row.dataQueryResultSchema || null,
        inputDefinitions: extractQueryDefinitions(row),
      };
    }
    if (type === "workflow") {
      const nodes = row.tblWorkflowNodes.map(node => ({ id: node.nodeID, type: node.nodeType, data: node.nodeConfig || {} }));
      const edges = row.tblWorkflowEdge.map(edge => ({
        id: edge.edgeID, source: edge.upstreamNodeID, target: edge.downstreamNodeID,
        sourceHandle: edge.sourceHandle, targetHandle: edge.targetHandle,
      }));
      try { validateExecutableGraph(nodes, edges); }
      catch (error) { throw applicationError("INVALID_RELEASE_WORKFLOW", `Workflow "${assetID}" is not executable: ${error.message}`, 400); }
      const queryVersions = {};
      const childWorkflowVersions = {};
      for (const node of nodes) {
        if (node.type === "dataQuery" && node.data?.dataQueryID) {
          const version = await captureDeclaredSourceVersion({
            ctx, tx, source: node.data, sourceType: "query", sourceID: node.data.dataQueryID,
            alias: node.id, visiting, versionField: "queryVersionID",
            changeNote: "Captured by workflow version",
          });
          queryVersions[node.data.dataQueryID] = version.assetVersionID;
        }
        if (node.type === "subWorkflow" && node.data?.childWorkflowID) {
          const version = await captureDeclaredSourceVersion({
            ctx, tx, source: node.data, sourceType: "workflow", sourceID: node.data.childWorkflowID,
            alias: node.id, visiting, versionField: "childWorkflowVersionID",
            changeNote: "Captured by parent workflow version",
          });
          childWorkflowVersions[node.data.childWorkflowID] = version.assetVersionID;
        }
      }
      return {
        workflowID: row.workflowID, tenantID: row.tenantID, title: row.title, workflowOptions: row.workflowOptions || {},
        nodes, edges, queryVersions, childWorkflowVersions,
      };
    }
    if (type === "listener") {
      const definition = listenerDefinition(row);
      const listenerConfig = row.listenerConfig && typeof row.listenerConfig === "object" ? row.listenerConfig : {};
      const datasourceVersion = row.datasourceID
        ? await captureDeclaredSourceVersion({
          ctx, tx, source: listenerConfig, sourceType: "datasource", sourceID: row.datasourceID,
          alias: "datasource", visiting, versionField: "datasourceVersionID",
          changeNote: "Captured by listener version",
        })
        : null;
      const workflowVersions = {};
      const queryVersions = {};
      for (const action of definition.actions) {
        if (action.actionType === "trigger_workflow" && action.actionConfig?.workflowID) {
          const version = await captureDeclaredSourceVersion({
            ctx, tx, source: action.actionConfig, sourceType: "workflow", sourceID: action.actionConfig.workflowID,
            alias: action.actionID, visiting, versionField: "workflowVersionID",
            changeNote: "Captured by listener version",
          });
          workflowVersions[action.actionConfig.workflowID] = version.assetVersionID;
        }
        if (action.actionType === "trigger_query" && action.actionConfig?.dataQueryID) {
          const version = await captureDeclaredSourceVersion({
            ctx, tx, source: action.actionConfig, sourceType: "query", sourceID: action.actionConfig.dataQueryID,
            alias: action.actionID, visiting, versionField: "queryVersionID",
            changeNote: "Captured by listener version",
          });
          queryVersions[action.actionConfig.dataQueryID] = version.assetVersionID;
        }
      }
      return {
        listenerID: definition.listenerID, listenerTitle: row.listenerTitle,
        listenerDescription: row.listenerDescription || null, listenerType: row.listenerType,
        datasourceID: row.datasourceID, datasourceVersionID: datasourceVersion?.assetVersionID || null,
        listenerConfig: definition.listenerConfig, actions: definition.actions,
        endpointPath: definition.endpointPath, definitionHash: listenerDefinitionHash(row),
        workflowVersions, queryVersions,
      };
    }
    if (type === "cronjob") {
      const workflowVersion = row.workflowID
        ? await captureDeclaredSourceVersion({
          ctx, tx, source: row.workflowConfig || {}, sourceType: "workflow", sourceID: row.workflowID,
          alias: "scheduled workflow", visiting, versionField: "workflowVersionID",
          changeNote: "Captured by cron job version",
        })
        : null;
      return {
        cronJobID: row.cronJobID, cronJobTitle: row.cronJobTitle,
        cronJobDescription: row.cronJobDescription || null, cronJobSchedule: row.cronJobSchedule,
        workflowID: row.workflowID || null, workflowVersionID: workflowVersion?.assetVersionID || null,
        workflowConfig: row.workflowConfig || {}, timeoutSeconds: row.timeoutSeconds,
        retryAttempts: row.retryAttempts, retryDelaySeconds: row.retryDelaySeconds,
      };
    }
    if (type === "appPage") {
      const pageConfig = row.appPageConfig && typeof row.appPageConfig === "object" ? row.appPageConfig : {};
      const sourceVersions = {};
      const widgetVersions = {};
      for (const source of Array.isArray(pageConfig.dataSources) ? pageConfig.dataSources : []) {
        const alias = typeof source?.alias === "string" ? source.alias.trim() : "";
        if (!alias) throw applicationError("INVALID_DATA_SOURCE_ALIAS", "A page data source has no alias.", 400);
        const sourceType = source.type;
        if (!["query", "workflow", "listener"].includes(sourceType)) {
          throw applicationError("UNSUPPORTED_DATA_SOURCE", `Page data source "${alias}" has an unsupported type.`, 400);
        }
        const sourceID = sourceType === "query" ? source.queryID : sourceType === "workflow" ? source.workflowID : source.listenerID;
        const version = await captureDeclaredSourceVersion({ ctx, tx, source, sourceType, sourceID, alias, visiting });
        sourceVersions[alias] = { assetType: sourceType, assetID: sourceID, assetVersionID: version.assetVersionID };
      }
      const widgetsByID = {};
      for (const widgetID of collectPageWidgetIDs(pageConfig)) {
        const selection = pageConfig.widgetVersionSelections?.[widgetID] || {};
        const version = await captureDeclaredSourceVersion({
          ctx, tx, source: selection, sourceType: "widget", sourceID: widgetID,
          alias: widgetID, visiting, versionField: "widgetVersionID",
          changeNote: `Captured by page "${row.appPageTitle}"`,
        });
        widgetVersions[widgetID] = version.assetVersionID;
        widgetsByID[widgetID] = { widgetID, widgetConfig: version.payload?.widgetConfig || {} };
      }
      const { bindings: triggerBindings } = capturePageTriggerBindings({ pageConfig, widgetsByID });
      const hasTriggerBindings = Object.keys(triggerBindings.query).length > 0 || Object.keys(triggerBindings.workflow).length > 0;
      return {
        appPageID: row.appPageID, appPageTitle: row.appPageTitle,
        appPageDescription: row.appPageDescription || null, appPageConfig: pageConfig,
        sourceVersions, widgetVersions,
        ...(hasTriggerBindings ? { triggerBindings } : {}),
      };
    }
    throw applicationError("INVALID_ASSET_TYPE", "Unknown asset type.", 400);
  }

  async function recordReferences({ tx, tenantID, parentVersionID, type, payload }) {
    const ids = payloadChildVersionIDs(type, payload);
    if (!ids.length) return;
    const data = ids.map(childVersionID => ({
      tenantID, parentType: "assetVersion", parentVersionID, parentReleaseID: null,
      childVersionID, referenceKey: `${parentVersionID}:${childVersionID}`,
    }));
    if (typeof tx.tblAssetVersionReferences?.createMany === "function") {
      await tx.tblAssetVersionReferences.createMany({ data, skipDuplicates: true });
    }
  }

  async function ensureVersionInTx({ ctx, tx, assetType: type, assetID, changeNote, visiting = new Set() }) {
    assetType(type);
    if (typeof assetID !== "string" || !assetID) throw applicationError("ASSET_NOT_FOUND", "An asset version dependency has no ID.", 409);
    const visitKey = `${type}:${assetID}`;
    if (visiting.has(visitKey)) throw applicationError("ASSET_VERSION_CYCLE", "Asset version dependency cycle detected.", 400);
    visiting.add(visitKey);
    try {
      await checkAccess(ctx, type, assetID, "read");
      // Serialize version-number allocation for the same immutable asset.
      if (typeof tx.$executeRaw === "function") {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${ctx.tenantID}:asset-version:${type}:${assetID}`}, 0))`;
      }
      const payload = await buildPayload({ ctx, tx, type, assetID, visiting });
      const contentHash = stableHash(payload);
      const latest = await tx.tblAssetVersions.findFirst({
        where: { tenantID: ctx.tenantID, assetType: type, assetID },
        orderBy: { versionNumber: "desc" },
      });
      if (latest?.contentHash === contentHash && latest.status === "published") {
        await recordReferences({ tx, tenantID: ctx.tenantID, parentVersionID: latest.assetVersionID, type, payload });
        return latest;
      }
      const number = (latest?.versionNumber || 0) + 1;
      const version = await tx.tblAssetVersions.create({
        data: {
          tenantID: ctx.tenantID, assetType: type, assetID, versionNumber: number,
          schemaVersion: 1, contentHash, payload, status: "published",
          changeNote: changeNote || null, ...actorFields(ctx),
        },
      });
      await recordReferences({ tx, tenantID: ctx.tenantID, parentVersionID: version.assetVersionID, type, payload });
      return version;
    } finally {
      visiting.delete(visitKey);
    }
  }

  async function runVersionTransaction(run) {
    for (let attempt = 1; ; attempt += 1) {
      try {
        return await db.$transaction(run, CAPTURE_TRANSACTION_OPTIONS);
      } catch (error) {
        const retryable = RETRYABLE_TRANSACTION_CODES.has(error?.code);
        if (!retryable || attempt >= CAPTURE_TRANSACTION_ATTEMPTS) throw error;
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }
  }

  async function ensureVersion({ ctx, tx, assetType: type, assetID, changeNote }) {
    if (tx) return ensureVersionInTx({ ctx, tx, assetType: type, assetID, changeNote });
    return runVersionTransaction(client => ensureVersionInTx({ ctx, tx: client, assetType: type, assetID, changeNote }));
  }

  async function createVersion({ ctx, assetType: type, assetID, changeNote }) {
    await checkAccess(ctx, type, assetID, "update");
    const latest = await db.tblAssetVersions.findFirst({
      where: { tenantID: ctx.tenantID, assetType: type, assetID },
      orderBy: { versionNumber: "desc" },
    });
    return runVersionTransaction(async tx => {
      const version = await ensureVersionInTx({ ctx, tx, assetType: type, assetID, changeNote });
      return { ...version, reused: version.assetVersionID === latest?.assetVersionID };
    });
  }

  async function listVersions({ ctx, assetType: type, assetID, page = 1, pageSize = 20 }) {
    await checkAccess(ctx, type, assetID, "read");
    const where = { tenantID: ctx.tenantID, assetType: type, assetID };
    const [rows, totalCount] = await Promise.all([
      db.tblAssetVersions.findMany({
        where,
        orderBy: { versionNumber: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          assetVersionID: true, assetType: true, assetID: true, versionNumber: true,
          schemaVersion: true, contentHash: true, status: true, changeNote: true,
          createdAt: true, createdByUserID: true, createdByApiKeyID: true,
        },
      }),
      db.tblAssetVersions.count({ where }),
    ]);
    return { versions: rows, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
  }

  async function getVersion({ ctx, assetType: type, assetID, versionID }) {
    await checkAccess(ctx, type, assetID, "read");
    const version = await db.tblAssetVersions.findFirst({
      where: { tenantID: ctx.tenantID, assetType: type, assetID, assetVersionID: versionID },
    });
    if (!version) throw applicationError("ASSET_VERSION_NOT_FOUND", "Asset version not found.", 404);
    return version;
  }

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const DEPENDENCY_FIELDS = {
    workflow: [["queryVersions", "query"], ["childWorkflowVersions", "workflow"]],
    listener: [["queryVersions", "query"], ["workflowVersions", "workflow"]],
    widget: [["queryVersions", "query"], ["workflowVersions", "workflow"]],
  };
  const TITLE_FIELDS = {
    datasource: ["tblDatasources", "datasourceID", "datasourceTitle"],
    listener: ["tblListeners", "listenerID", "listenerTitle"],
    query: ["tblDataQueries", "dataQueryID", "dataQueryTitle"],
    cronjob: ["tblCronJobs", "cronJobID", "cronJobTitle"],
    widget: ["tblWidgets", "widgetID", "widgetTitle"],
    workflow: ["tblWorkflows", "workflowID", "title"],
    appPage: ["tblAppPages", "appPageID", "appPageTitle"],
  };

  function dependencyVersionRefs(type, payload = {}) {
    const refs = new Map();
    const add = (assetType, assetID, versionID) => {
      if (typeof assetID !== "string" || !assetID || typeof versionID !== "string" || !versionID) return;
      refs.set(`${assetType}:${assetID}`, { assetType, assetID, versionID });
    };
    for (const [field, assetType] of DEPENDENCY_FIELDS[type] || []) {
      for (const [assetID, versionID] of Object.entries(payload[field] || {})) add(assetType, assetID, versionID);
    }
    if (type === "listener" && payload.datasourceID) add("datasource", payload.datasourceID, payload.datasourceVersionID);
    if (type === "query" && payload.datasourceID) add("datasource", payload.datasourceID, payload.datasourceVersionID);
    if (type === "cronjob" && payload.workflowID) add("workflow", payload.workflowID, payload.workflowVersionID);
    if (type === "appPage") {
      for (const ref of Object.values(payload.sourceVersions || {})) add(ref.assetType, ref.assetID, ref.assetVersionID);
      for (const [widgetID, versionID] of Object.entries(payload.widgetVersions || {})) add("widget", widgetID, versionID);
    }
    return refs;
  }

  async function describeDependencyChanges({ ctx, type, beforePayload, afterPayload }) {
    const before = dependencyVersionRefs(type, beforePayload);
    const after = dependencyVersionRefs(type, afterPayload);
    const keys = [...new Set([...before.keys(), ...after.keys()])].sort();
    const changed = [];
    for (const key of keys) {
      const from = before.get(key);
      const to = after.get(key);
      if ((from?.versionID || null) === (to?.versionID || null)) continue;
      const ref = to || from;
      changed.push({
        assetType: ref.assetType,
        assetID: ref.assetID,
        title: null,
        change: !from ? "added" : !to ? "removed" : "updated",
        beforeVersionID: from?.versionID || null,
        afterVersionID: to?.versionID || null,
        beforeVersionNumber: null,
        afterVersionNumber: null,
      });
    }
    if (!changed.length) return [];
    const versionIDs = [...new Set(changed.flatMap(item => [item.beforeVersionID, item.afterVersionID]).filter(Boolean))];
    const versionRows = await db.tblAssetVersions.findMany({
      where: { tenantID: ctx.tenantID, assetVersionID: { in: versionIDs } },
      select: { assetVersionID: true, versionNumber: true },
    });
    const versionNumbers = Object.fromEntries(versionRows.map(row => [row.assetVersionID, row.versionNumber]));
    const titleLookups = {};
    for (const item of changed) {
      const config = TITLE_FIELDS[item.assetType];
      if (!config) continue;
      titleLookups[item.assetType] = titleLookups[item.assetType] || new Set();
      titleLookups[item.assetType].add(item.assetID);
    }
    const titles = {};
    for (const [assetType, ids] of Object.entries(titleLookups)) {
      const [table, idField, titleField] = TITLE_FIELDS[assetType];
      if (typeof db[table]?.findMany !== "function") continue;
      const rows = await db[table].findMany({
        where: { tenantID: ctx.tenantID, [idField]: { in: [...ids] } },
        select: { [idField]: true, [titleField]: true },
      });
      for (const row of rows) titles[`${assetType}:${row[idField]}`] = row[titleField] || null;
    }
    return changed.map(item => ({
      ...item,
      title: titles[`${item.assetType}:${item.assetID}`] || null,
      beforeVersionNumber: item.beforeVersionID ? versionNumbers[item.beforeVersionID] ?? null : null,
      afterVersionNumber: item.afterVersionID ? versionNumbers[item.afterVersionID] ?? null : null,
    }));
  }

  async function loadDraftRow(tx, ctx, type, assetID) {
    const config = assetType(type);
    const where = { tenantID: ctx.tenantID, [config.idField]: assetID };
    let row;
    if (type === "workflow") {
      row = await tx.tblWorkflows.findFirst({
        where,
        include: {
          tblWorkflowNodes: { orderBy: { nodeID: "asc" } },
          tblWorkflowEdge: { orderBy: { edgeID: "asc" } },
        },
      });
    } else if (type === "listener") {
      row = await tx.tblListeners.findFirst({
        where,
        include: { tblListenerActions: { orderBy: [{ orderIndex: "asc" }, { actionID: "asc" }] } },
      });
    } else {
      row = await tx[config.table].findFirst({ where });
    }
    if (!row) throw applicationError("ASSET_NOT_FOUND", "The asset no longer exists in this tenant.", 409);
    return row;
  }

  function draftPayload(type, row) {
    if (type === "datasource") {
      return comparablePayload(type, {
        datasourceTitle: row.datasourceTitle,
        datasourceDescription: row.datasourceDescription || null,
        datasourceTags: row.datasourceTags || [],
      });
    }
    if (type === "widget") {
      return comparablePayload(type, {
        widgetTitle: row.widgetTitle,
        widgetType: row.widgetType,
        widgetConfig: row.widgetConfig || {},
      });
    }
    if (type === "query") {
      return comparablePayload(type, {
        dataQueryTitle: row.dataQueryTitle,
        dataQueryDescription: row.dataQueryDescription || null,
        datasourceID: row.datasourceID || null,
        datasourceType: row.datasourceType,
        dataQueryOptions: row.dataQueryOptions || {},
        runOnLoad: Boolean(row.runOnLoad),
        dataQueryResultSchema: row.dataQueryResultSchema || null,
        inputDefinitions: extractQueryDefinitions(row),
      });
    }
    if (type === "workflow") {
      return comparablePayload(type, {
        title: row.title,
        workflowOptions: row.workflowOptions || {},
        nodes: row.tblWorkflowNodes.map(node => ({
          id: node.nodeID,
          type: node.nodeType,
          data: node.nodeConfig || {},
        })),
        edges: row.tblWorkflowEdge.map(edge => ({
          id: edge.edgeID,
          source: edge.upstreamNodeID,
          target: edge.downstreamNodeID,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
      });
    }
    if (type === "listener") {
      return comparablePayload(type, {
        listenerTitle: row.listenerTitle,
        listenerDescription: row.listenerDescription || null,
        datasourceID: row.datasourceID,
        listenerType: row.listenerType,
        listenerConfig: row.listenerConfig || {},
        endpointPath: row.endpointPath || null,
        actions: (row.tblListenerActions || [])
          .filter(action => action.isEnabled !== false)
          .map(action => ({
            actionID: action.actionID,
            actionType: action.actionType,
            actionConfig: action.actionConfig || {},
            orderIndex: action.orderIndex || 0,
          })),
      });
    }
    if (type === "cronjob") {
      return comparablePayload(type, {
        cronJobTitle: row.cronJobTitle,
        cronJobDescription: row.cronJobDescription || null,
        cronJobSchedule: row.cronJobSchedule,
        workflowID: row.workflowID || null,
        workflowConfig: row.workflowConfig || {},
        timeoutSeconds: row.timeoutSeconds,
        retryAttempts: row.retryAttempts,
        retryDelaySeconds: row.retryDelaySeconds,
      });
    }
    if (type === "appPage") {
      return comparablePayload(type, {
        appPageTitle: row.appPageTitle,
        appPageDescription: row.appPageDescription || null,
        appPageConfig: row.appPageConfig || {},
      });
    }
    throw applicationError("INVALID_ASSET_TYPE", "Unknown asset type.", 400);
  }

  async function inspectVersion({ ctx, tx = db, assetType: type, assetID, version, versionID }) {
    await checkAccess(ctx, type, assetID, "read");
    const resolved = version || await getVersion({ ctx, assetType: type, assetID, versionID });
    const row = await loadDraftRow(tx, ctx, type, assetID);
    const changes = diffJson(
      comparablePayload(type, resolved.payload || {}),
      draftPayload(type, row)
    );
    const staleDependencies = [];
    for (const ref of dependencyVersionRefs(type, resolved.payload || {}).values()) {
      const latest = await tx.tblAssetVersions.findFirst({
        where: { tenantID: ctx.tenantID, assetType: ref.assetType, assetID: ref.assetID },
        orderBy: { versionNumber: "desc" },
        select: { assetVersionID: true, versionNumber: true },
      });
      if (latest && latest.assetVersionID !== ref.versionID) {
        staleDependencies.push({
          ...ref,
          latestVersionID: latest.assetVersionID,
          latestVersionNumber: latest.versionNumber,
        });
      }
    }
    return {
      dirty: changes.length > 0,
      changeCount: changes.length,
      staleDependencies,
    };
  }

  async function getVersionDiff({ ctx, assetType: type, assetID, versionID, againstVersionID }) {
    await checkAccess(ctx, type, assetID, "read");
    const version = await getVersion({ ctx, assetType: type, assetID, versionID });
    let against;
    let currentUpdatedAt = null;
    if (againstVersionID) {
      against = await getVersion({ ctx, assetType: type, assetID, versionID: againstVersionID });
    } else {
      const row = await loadDraftRow(db, ctx, type, assetID);
      against = {
        assetVersionID: null,
        versionNumber: null,
        payload: draftPayload(type, row),
        createdAt: row.updatedAt || null,
      };
      currentUpdatedAt = row.updatedAt || null;
    }
    const before = comparablePayload(type, version.payload || {});
    const after = comparablePayload(type, against.payload || {});
    const changes = diffJson(before, after);
    const dependencyChanges = againstVersionID
      ? await describeDependencyChanges({ ctx, type, beforePayload: version.payload || {}, afterPayload: against.payload || {} })
      : [];
    return {
      version: {
        assetVersionID: version.assetVersionID,
        versionNumber: version.versionNumber,
        contentHash: version.contentHash,
        changeNote: version.changeNote,
        createdAt: version.createdAt,
      },
      against: {
        kind: againstVersionID ? "version" : "draft",
        assetVersionID: against.assetVersionID || null,
        versionNumber: against.versionNumber ?? null,
        createdAt: against.createdAt || null,
      },
      currentUpdatedAt,
      changes,
      dependencyChanges,
      truncated: changes.length >= DIFF_CHANGE_LIMIT,
    };
  }

  async function restoreVersion({ ctx, assetType: type, assetID, versionID, expectedUpdatedAt }) {
    await checkAccess(ctx, type, assetID, "update");
    const version = await getVersion({ ctx, assetType: type, assetID, versionID });
    return runVersionTransaction(async tx => {
      const row = await loadDraftRow(tx, ctx, type, assetID);
      if (expectedUpdatedAt && row.updatedAt) {
        const current = new Date(row.updatedAt).toISOString();
        const expected = new Date(expectedUpdatedAt).toISOString();
        if (current !== expected) {
          throw applicationError("ASSET_VERSION_RESTORE_CONFLICT", "The asset changed after this version was previewed. Reopen the version and try again.", 409);
        }
      }
      const payload = version.payload || {};
      const updatedAt = new Date();
      switch (type) {
        case "datasource":
          await tx.tblDatasources.update({
            where: { datasourceID: assetID },
            data: {
              datasourceTitle: payload.datasourceTitle,
              datasourceDescription: payload.datasourceDescription ?? null,
              datasourceTags: Array.isArray(payload.datasourceTags) ? payload.datasourceTags : [],
              updatedAt,
            },
          });
          break;
        case "widget":
          await tx.tblWidgets.update({
            where: { widgetID: assetID },
            data: {
              widgetTitle: payload.widgetTitle,
              widgetType: payload.widgetType,
              widgetConfig: payload.widgetConfig || {},
              updatedAt,
            },
          });
          break;
        case "query":
          await tx.tblDataQueries.update({
            where: { dataQueryID: assetID },
            data: {
              dataQueryTitle: payload.dataQueryTitle,
              dataQueryDescription: payload.dataQueryDescription ?? null,
              datasourceID: payload.datasourceID || null,
              datasourceType: payload.datasourceType,
              dataQueryOptions: payload.dataQueryOptions || {},
              runOnLoad: Boolean(payload.runOnLoad),
              dataQueryResultSchema: payload.dataQueryResultSchema ?? null,
              updatedAt,
            },
          });
          break;
        case "workflow": {
          const nodes = Array.isArray(payload.nodes) ? payload.nodes : [];
          const edges = Array.isArray(payload.edges) ? payload.edges : [];
          for (const node of nodes) {
            if (!node?.id || !uuidPattern.test(String(node.id))) {
              throw applicationError("ASSET_VERSION_INVALID", "This workflow version cannot be restored because a node ID is missing or invalid.", 409);
            }
          }
          await tx.tblWorkflowEdge.deleteMany({ where: { workflowID: assetID } });
          await tx.tblWorkflowNodes.deleteMany({ where: { workflowID: assetID } });
          await tx.tblWorkflows.update({
            where: { workflowID: assetID },
            data: {
              title: payload.title,
              workflowOptions: payload.workflowOptions || {},
              updatedAt,
            },
          });
          if (nodes.length) {
            await tx.tblWorkflowNodes.createMany({
              data: nodes.map(node => ({
                nodeID: node.id,
                workflowID: assetID,
                nodeType: node.type,
                nodeConfig: node.data || {},
              })),
            });
          }
          if (edges.length) {
            await tx.tblWorkflowEdge.createMany({
              data: edges.map(edge => ({
                workflowID: assetID,
                upstreamNodeID: edge.source,
                downstreamNodeID: edge.target,
                sourceHandle: edge.sourceHandle ?? null,
                targetHandle: edge.targetHandle ?? null,
              })),
            });
          }
          break;
        }
        case "listener": {
          const actions = Array.isArray(payload.actions) ? payload.actions : [];
          await tx.tblListeners.update({
            where: { listenerID: assetID },
            data: {
              datasourceID: payload.datasourceID,
              listenerTitle: payload.listenerTitle,
              listenerDescription: payload.listenerDescription ?? null,
              listenerType: payload.listenerType,
              listenerConfig: payload.listenerConfig || {},
              endpointPath: payload.endpointPath || null,
              updatedAt,
            },
          });
          await tx.tblListenerActions.deleteMany({ where: { listenerID: assetID } });
          if (actions.length) {
            await tx.tblListenerActions.createMany({
              data: actions.map((action, index) => ({
                ...(action.actionID && uuidPattern.test(String(action.actionID)) ? { actionID: action.actionID } : {}),
                listenerID: assetID,
                actionType: action.actionType,
                actionConfig: action.actionConfig || {},
                isEnabled: true,
                orderIndex: Number.isInteger(action.orderIndex) ? action.orderIndex : index,
              })),
            });
          }
          break;
        }
        case "cronjob":
          await tx.tblCronJobs.update({
            where: { cronJobID: assetID },
            data: {
              cronJobTitle: payload.cronJobTitle,
              cronJobDescription: payload.cronJobDescription ?? null,
              cronJobSchedule: payload.cronJobSchedule,
              workflowID: payload.workflowID || null,
              workflowConfig: payload.workflowConfig || {},
              timeoutSeconds: payload.timeoutSeconds ?? null,
              retryAttempts: payload.retryAttempts ?? 0,
              retryDelaySeconds: payload.retryDelaySeconds ?? 60,
              updatedAt,
            },
          });
          break;
        case "appPage":
          await tx.tblAppPages.update({
            where: { appPageID: assetID },
            data: {
              appPageTitle: payload.appPageTitle,
              appPageDescription: payload.appPageDescription ?? null,
              appPageConfig: payload.appPageConfig || {},
              updatedAt,
            },
          });
          break;
        default:
          throw applicationError("INVALID_ASSET_TYPE", "Unknown asset type.", 400);
      }
      return {
        restored: true,
        assetType: type,
        assetID,
        versionNumber: version.versionNumber,
        updatedAt,
      };
    }).catch(error => {
      if (error.code === "P2003" || error.code === "P2014") {
        throw applicationError("ASSET_VERSION_RESTORE_CONFLICT", "This version references an asset that no longer exists.", 409);
      }
      throw error;
    });
  }

  async function recordReleaseReferences({ tx, ctx, releaseID, pageVersionIDs }) {
    const ids = [...new Set(pageVersionIDs.filter(Boolean))];
    if (!ids.length || typeof tx.tblAssetVersionReferences?.createMany !== "function") return;
    await tx.tblAssetVersionReferences.createMany({
      data: ids.map(childVersionID => ({
        tenantID: ctx.tenantID, parentType: "applicationRelease", parentVersionID: null,
        parentReleaseID: releaseID, childVersionID, referenceKey: `release:${releaseID}:${childVersionID}`,
      })),
      skipDuplicates: true,
    });
  }

  async function getImpact({ ctx, assetType: type, assetID, versionID }) {
    await checkAccess(ctx, type, assetID, "read");
    const version = await db.tblAssetVersions.findFirst({ where: { tenantID: ctx.tenantID, assetType: type, assetID, assetVersionID: versionID } });
    if (!version) throw applicationError("ASSET_VERSION_NOT_FOUND", "Asset version not found.", 404);
    const parents = [];
    const releaseIDs = new Set();
    const seenVersions = new Set([versionID]);
    const seenParents = new Set();
    let queue = [versionID];
    for (let depth = 0; queue.length && depth < 20; depth += 1) {
      const refs = await db.tblAssetVersionReferences.findMany({
        where: { tenantID: ctx.tenantID, childVersionID: { in: queue } },
      });
      const parentIDs = [...new Set(refs.filter(ref => ref.parentVersionID && !seenVersions.has(ref.parentVersionID)).map(ref => ref.parentVersionID))];
      for (const ref of refs) if (ref.parentReleaseID) releaseIDs.add(ref.parentReleaseID);
      const rows = parentIDs.length
        ? await db.tblAssetVersions.findMany({ where: { tenantID: ctx.tenantID, assetVersionID: { in: parentIDs } } })
        : [];
      for (const row of rows) {
        if (seenVersions.has(row.assetVersionID) || seenParents.has(row.assetVersionID)) continue;
        seenVersions.add(row.assetVersionID);
        seenParents.add(row.assetVersionID);
        parents.push({
          type: "assetVersion", assetVersionID: row.assetVersionID, assetType: row.assetType,
          assetID: row.assetID, versionNumber: row.versionNumber, contentHash: row.contentHash,
          title: displayTitle(row.assetType, row.payload),
        });
      }
      queue = parentIDs;
    }
    const releases = releaseIDs.size
      ? await db.tblApplicationReleases.findMany({ where: { tenantID: ctx.tenantID, releaseID: { in: [...releaseIDs] } }, select: { releaseID: true, releaseNumber: true, applicationID: true } })
      : [];
    const applicationIDs = [...new Set(releases.map(release => release.applicationID))];
    const applications = applicationIDs.length
      ? await db.tblApplications.findMany({ where: { tenantID: ctx.tenantID, applicationID: { in: applicationIDs } }, select: { applicationID: true, title: true } })
      : [];
    const titles = Object.fromEntries(applications.map(app => [app.applicationID, app.title]));
    const environments = releases.length
      ? await db.tblApplicationEnvironments.findMany({ where: { tenantID: ctx.tenantID, currentReleaseID: { in: releases.map(release => release.releaseID) } }, select: { currentReleaseID: true, name: true } })
      : [];
    const usedBy = [...parents];
    for (const release of releases) {
      if (!await enforce(ctx.caller.id, ctx.tenantID, `application:${release.applicationID}`, "read")) continue;
      usedBy.push({ type: "applicationRelease", releaseID: release.releaseID, releaseNumber: release.releaseNumber,
        applicationID: release.applicationID, applicationTitle: titles[release.applicationID] || release.applicationID,
        environments: environments.filter(env => env.currentReleaseID === release.releaseID).map(env => env.name),
      });
    }
    return { version: { assetVersionID: version.assetVersionID, assetType: version.assetType, assetID: version.assetID,
      versionNumber: version.versionNumber, contentHash: version.contentHash, changeNote: version.changeNote, createdAt: version.createdAt }, usedBy };
  }

  async function getVersionForRuntime({ tenantID, versionID }) {
    const version = await db.tblAssetVersions.findFirst({ where: { tenantID, assetVersionID: versionID } });
    if (!version) throw applicationError("ASSET_VERSION_NOT_FOUND", "A referenced asset version is no longer available.", 409);
    return version;
  }

  async function loadVersions({ tenantID, versionIDs }) {
    if (!versionIDs.length) return {};
    const rows = await db.tblAssetVersions.findMany({ where: { tenantID, assetVersionID: { in: versionIDs } } });
    return Object.fromEntries(rows.map(row => [row.assetVersionID, row]));
  }

  return { ensureVersion, createVersion, listVersions, getVersion, inspectVersion, getVersionDiff, restoreVersion, getImpact, recordReleaseReferences, getVersionForRuntime, loadVersions };
}

const { prisma } = require("../../config/prisma.config");
const { enforce } = require("../../config/casbin.config");
module.exports = { createAssetVersionService, assetVersionService: createAssetVersionService({ db: prisma, enforce }), ASSET_TYPES, payloadChildVersionIDs };
