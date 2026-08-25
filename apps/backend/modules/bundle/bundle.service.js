/**
 * Bundle Service — Export/Import of dependency-aware entity bundles (v1).
 *
 * A bundle is a self-describing, sanitized snapshot of an entity plus its
 * transitive dependency closure:
 *
 * {
 *   bundleVersion: 1,
 *   generator: "jet-admin",
 *   exportedAt: ISO-string,
 *   sourceTenant: uuid,
 *   items: [{ type, id, payload, dependencies: [{ type, id, name, bundled }] }]
 * }
 *
 * Rules:
 *  - Item IDs are reference keys only. Import always creates fresh IDs and
 *    rewrites every internal reference through an idMap.
 *  - Secrets NEVER leave the tenant: datasource options are decrypted
 *    server-side, stripped of credential-like fields, and marked
 *    "requiresReconnect". Import strips again (never trust input files).
 *  - Audit-ish fields (createdAt/updatedAt/creator flags/status timestamps)
 *    are never exported.
 */
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { isUUID } = require("validator");
const crypto = require("crypto");
const { SENSITIVE_KEY_PATTERNS } = require("../../utils/sensitive");
const { grantCreatorAccess } = require("../../config/casbin.config");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const { decryptOptions, encryptOptions } = require("../datasource/datasource.service");

const BUNDLE_VERSION = 1;

const ITEM_TYPES = {
  APP_PAGE: "appPage",
  WIDGET: "widget",
  WORKFLOW: "workflow",
  DATA_QUERY: "dataQuery",
  DATASOURCE: "datasource",
  LISTENER: "listener",
};

const MODEL_BY_TYPE = {
  appPage: "tblAppPages",
  widget: "tblWidgets",
  workflow: "tblWorkflows",
  dataQuery: "tblDataQueries",
  datasource: "tblDatasources",
  listener: "tblListeners",
};

const TITLE_FIELD_BY_TYPE = {
  appPage: "appPageTitle",
  widget: "widgetTitle",
  workflow: "title",
  dataQuery: "dataQueryTitle",
  datasource: "datasourceTitle",
  listener: "listenerTitle",
};

const ID_FIELD_BY_TYPE = {
  appPage: "appPageID",
  widget: "widgetID",
  workflow: "workflowID",
  dataQuery: "dataQueryID",
  datasource: "datasourceID",
  listener: "listenerID",
};

// Casbin resource names used by grantCreatorAccess across services.
const RESOURCE_BY_TYPE = {
  appPage: "appPage",
  widget: "widget",
  workflow: "workflow",
  dataQuery: "dataquery",
  datasource: "datasource",
  listener: "listener",
};

// Reference keys scanned inside config payloads -> bundle item types.
const REF_KEY_TO_TYPE = {
  queryID: "dataQuery",
  dataQueryID: "dataQuery",
  workflowID: "workflow",
  listenerID: "listener",
  datasourceID: "datasource",
};

// Extra explicit strips beyond SENSITIVE_KEY_PATTERNS.
const EXTRA_SENSITIVE_KEYS = ["vaultcredentialid", "webhooktoken", "webhooksecret"];

// ─── Generic helpers ─────────────────────────────────────────────────────

function deepClone(value) {
  return value === undefined || value === null ? value : JSON.parse(JSON.stringify(value));
}

/**
 * Deep-collect cross-entity reference IDs from a config value.
 * Matches exact key names in REF_KEY_TO_TYPE holding UUID strings.
 */
function collectRefs(value, refs = [], depth = 0) {
  if (!value || typeof value !== "object" || depth > 20) return refs;
  if (Array.isArray(value)) {
    for (const v of value) collectRefs(v, refs, depth + 1);
    return refs;
  }
  for (const [key, v] of Object.entries(value)) {
    if (REF_KEY_TO_TYPE[key] && typeof v === "string" && isUUID(v)) {
      refs.push({ type: REF_KEY_TO_TYPE[key], id: v });
    } else {
      collectRefs(v, refs, depth + 1);
    }
  }
  return refs;
}

function dedupeRefs(refs) {
  const map = new Map();
  for (const r of refs) map.set(`${r.type}:${r.id}`, r);
  return Array.from(map.values());
}

/** Widget instance keys ("widget_<widgetID>_<suffix>") inside an app page config. */
function extractAppPageWidgetRefs(config) {
  const refs = [];
  const widgets = config && Array.isArray(config.widgets) ? config.widgets : [];
  for (const wKey of widgets) {
    if (typeof wKey === "string" && wKey.startsWith("widget_")) {
      const parts = wKey.split("_");
      if (parts[1]) refs.push({ type: ITEM_TYPES.WIDGET, id: parts[1] });
    }
  }
  return refs;
}

/**
 * Extract dependency refs for an entity row (structural + deep-scan).
 */
function extractRowDeps(type, entity) {
  const refs = [];
  if (type === ITEM_TYPES.APP_PAGE && entity.appPageConfig) {
    collectRefs(entity.appPageConfig, refs);
    refs.push(...extractAppPageWidgetRefs(entity.appPageConfig));
  } else if (type === ITEM_TYPES.WIDGET) {
    collectRefs(entity.widgetConfig, refs);
  } else if (type === ITEM_TYPES.WORKFLOW) {
    for (const node of entity.tblWorkflowNodes || []) collectRefs(node.nodeConfig, refs);
  } else if (type === ITEM_TYPES.LISTENER) {
    for (const action of entity.tblListenerActions || []) collectRefs(action.actionConfig, refs);
    if (entity.datasourceID) refs.push({ type: ITEM_TYPES.DATASOURCE, id: entity.datasourceID });
  } else if (type === ITEM_TYPES.DATA_QUERY) {
    if (entity.datasourceID) refs.push({ type: ITEM_TYPES.DATASOURCE, id: entity.datasourceID });
  }
  return dedupeRefs(refs);
}

function extractItemDeps(item) {
  const refs = collectRefs(item.payload || {});
  if (item.type === ITEM_TYPES.APP_PAGE) {
    refs.push(...extractAppPageWidgetRefs((item.payload || {}).appPageConfig));
  }
  return dedupeRefs(refs);
}

/**
 * Recursively REMOVE keys matching sensitive patterns. Unlike mask(), values
 * are dropped entirely — exports must not carry credential material at all.
 * Uses the broad SENSITIVE_KEY_PATTERNS list (substring match) plus explicit
 * vault/webhook keys. Over-stripping is acceptable; leaking is not.
 */
function stripSensitiveDeep(value, depth = 0) {
  if (!value || typeof value !== "object") return value;
  if (depth > 10) return undefined;
  if (Array.isArray(value)) {
    return value.map((v) => stripSensitiveDeep(v, depth + 1)).filter((v) => v !== undefined);
  }
  const result = {};
  for (const [key, v] of Object.entries(value)) {
    const lk = key.toLowerCase().replace(/_/g, "");
    const isSensitive =
      EXTRA_SENSITIVE_KEYS.includes(lk) ||
      SENSITIVE_KEY_PATTERNS.some((pattern) => lk.includes(pattern.replace(/_/g, "")));
    if (isSensitive) continue;
    result[key] = stripSensitiveDeep(v, depth + 1);
  }
  return result;
}

/**
 * Pure rewrite of reference-key values through idMap. Unknown IDs are left
 * untouched (preview has already warned about them).
 */
function remapRefValues(value, idMap, depth = 0) {
  if (!value || typeof value !== "object") return value;
  if (depth > 20) return value;
  if (Array.isArray(value)) {
    return value.map((v) => remapRefValues(v, idMap, depth + 1));
  }
  const result = {};
  for (const [key, v] of Object.entries(value)) {
    const refType = REF_KEY_TO_TYPE[key];
    if (refType && typeof v === "string" && idMap[`${refType}:${v}`]) {
      result[key] = idMap[`${refType}:${v}`];
    } else {
      result[key] = remapRefValues(v, idMap, depth + 1);
    }
  }
  return result;
}

/** Rewrite a single "widget_<oldID>_<suffix>" instance key. */
function remapWidgetInstanceKey(wKey, resolveWidgetID) {
  if (typeof wKey !== "string") return wKey;
  const parts = wKey.split("_");
  if (parts[0] === "widget" && parts[1]) {
    const newID = resolveWidgetID(parts[1]);
    if (newID) return ["widget", newID, ...parts.slice(2)].join("_");
  }
  return wKey;
}

/** Rewrite widget instance keys anywhere in an app page config (pure). */
function remapAppPageWidgetKeys(config, resolveWidgetID, depth = 0) {
  if (!config || typeof config !== "object" || depth > 20) return config;
  if (Array.isArray(config)) return config.map((v) => remapAppPageWidgetKeys(v, resolveWidgetID, depth + 1));
  const result = {};
  for (const [key, v] of Object.entries(config)) {
    if (key === "widgets" && Array.isArray(v)) {
      result[key] = v.map((wKey) => remapWidgetInstanceKey(wKey, resolveWidgetID));
    } else if (key === "widgetKey" && typeof v === "string") {
      result[key] = remapWidgetInstanceKey(v, resolveWidgetID);
    } else {
      result[key] = remapAppPageWidgetKeys(v, resolveWidgetID, depth + 1);
    }
  }
  return result;
}

function getTitle(entity, type) {
  return entity[TITLE_FIELD_BY_TYPE[type]] || "(untitled)";
}

// ─── Payload builders (sanitized) ────────────────────────────────────────

function buildPayload(type, entity) {
  switch (type) {
    case ITEM_TYPES.APP_PAGE:
      return {
        appPageTitle: entity.appPageTitle,
        appPageDescription: entity.appPageDescription ?? null,
        appPageConfig: deepClone(entity.appPageConfig) ?? {},
      };
    case ITEM_TYPES.WIDGET:
      return {
        widgetTitle: entity.widgetTitle,
        widgetDescription: entity.widgetDescription ?? null,
        widgetType: entity.widgetType,
        widgetConfig: deepClone(entity.widgetConfig) ?? {},
        refreshInterval: entity.refreshInterval ?? null,
      };
    case ITEM_TYPES.WORKFLOW:
      return {
        title: entity.title,
        workflowOptions: deepClone(entity.workflowOptions) ?? {},
        nodes: (entity.tblWorkflowNodes || []).map((n) => ({
          nodeID: n.nodeID,
          nodeType: n.nodeType,
          timeoutSeconds: n.timeoutSeconds,
          retryLimit: n.retryLimit,
          nodeConfig: deepClone(n.nodeConfig) ?? {},
        })),
        edges: (entity.tblWorkflowEdge || []).map((e) => ({
          upstreamNodeID: e.upstreamNodeID,
          downstreamNodeID: e.downstreamNodeID,
          sourceHandle: e.sourceHandle ?? null,
          targetHandle: e.targetHandle ?? null,
          edgeType: e.edgeType ?? null,
          edgeConfig: deepClone(e.edgeConfig) ?? null,
        })),
      };
    case ITEM_TYPES.DATA_QUERY:
      return {
        dataQueryTitle: entity.dataQueryTitle,
        dataQueryDescription: entity.dataQueryDescription ?? null,
        dataQueryOptions: deepClone(entity.dataQueryOptions) ?? null,
        runOnLoad: !!entity.runOnLoad,
        datasourceType: entity.datasourceType,
      };
    case ITEM_TYPES.DATASOURCE: {
      // Decrypt server-side, then strip ALL credential-like material. The
      // payload is a structural template only — targets must reconnect.
      const decrypted = decryptOptions(deepClone(entity.datasourceOptions)) || {};
      delete decrypted.__encrypted;
      return {
        datasourceTitle: entity.datasourceTitle,
        datasourceType: entity.datasourceType,
        datasourceDescription: entity.datasourceDescription ?? null,
        datasourceTags: Array.isArray(entity.datasourceTags) ? [...entity.datasourceTags] : [],
        datasourceOptions: stripSensitiveDeep(decrypted),
        requiresReconnect: true,
      };
    }
    case ITEM_TYPES.LISTENER:
      return {
        listenerTitle: entity.listenerTitle,
        listenerDescription: entity.listenerDescription ?? null,
        listenerType: entity.listenerType,
        listenerConfig: stripSensitiveDeep(deepClone(entity.listenerConfig) ?? {}),
        endpointPath: entity.endpointPath ?? null,
        status: "inactive",
        actions: (entity.tblListenerActions || []).map((a) => ({
          actionType: a.actionType,
          actionConfig: deepClone(a.actionConfig) ?? {},
          isEnabled: a.isEnabled !== false,
          orderIndex: a.orderIndex ?? 0,
        })),
      };
    default:
      throw new Error(`Unknown bundle item type: ${type}`);
  }
}

// ─── Entity loading ──────────────────────────────────────────────────────

async function loadEntity({ tenantID, type, id }) {
  switch (type) {
    case ITEM_TYPES.APP_PAGE:
      return prisma.tblAppPages.findFirst({ where: { appPageID: id, tenantID } });
    case ITEM_TYPES.WIDGET:
      return prisma.tblWidgets.findFirst({ where: { widgetID: id, tenantID } });
    case ITEM_TYPES.WORKFLOW:
      return prisma.tblWorkflows.findFirst({
        where: { workflowID: id, tenantID },
        include: { tblWorkflowNodes: true, tblWorkflowEdge: true },
      });
    case ITEM_TYPES.DATA_QUERY:
      return prisma.tblDataQueries.findFirst({ where: { dataQueryID: id, tenantID } });
    case ITEM_TYPES.DATASOURCE:
      return prisma.tblDatasources.findFirst({ where: { datasourceID: id, tenantID } });
    case ITEM_TYPES.LISTENER:
      return prisma.tblListeners.findFirst({
        where: { listenerID: id, tenantID },
        include: { tblListenerActions: { orderBy: { orderIndex: "asc" } } },
      });
    default:
      throw new Error(`Unknown bundle item type: ${type}`);
  }
}

// ─── Graph helpers ───────────────────────────────────────────────────────

/**
 * Stable topological sort (dependencies first). Falls back to the original
 * order if a cycle exists (should never happen between these entity types).
 */
function orderItemsTopologically(items) {
  const bundleKeys = new Set(items.map((it) => `${it.type}:${it.id}`));
  const dependents = new Map();
  const inDegree = new Map();
  for (const item of items) {
    const key = `${item.type}:${item.id}`;
    // Union of deep-scanned refs and explicitly declared dependencies —
    // some edges (e.g. dataQuery/listener -> datasource) exist ONLY in
    // dependencies[] because the raw column value is never exported.
    const declared = (Array.isArray(item.dependencies) ? item.dependencies : [])
      .filter((d) => d && d.type && d.id)
      .map((d) => ({ type: d.type, id: d.id }));
    const deps = dedupeRefs([...extractItemDeps(item), ...declared])
      .map((r) => `${r.type}:${r.id}`)
      .filter((k) => bundleKeys.has(k) && k !== key);
    inDegree.set(key, deps.size);
    for (const dep of deps) {
      if (!dependents.has(dep)) dependents.set(dep, []);
      dependents.get(dep).push(key);
    }
  }
  const positionByKey = new Map(items.map((it, i) => [`${it.type}:${it.id}`, i]));
  const queue = items
    .filter((it) => inDegree.get(`${it.type}:${it.id}`) === 0)
    .sort((a, b) => positionByKey.get(`${a.type}:${a.id}`) - positionByKey.get(`${b.type}:${b.id}`))
    .map((it) => `${it.type}:${it.id}`);
  const orderedKeys = [];
  while (queue.length) {
    const key = queue.shift();
    orderedKeys.push(key);
    for (const dependent of dependents.get(key) || []) {
      const next = inDegree.get(dependent) - 1;
      inDegree.set(dependent, next);
      if (next === 0) queue.push(dependent);
    }
  }
  if (orderedKeys.length !== items.length) return items;
  const orderPosition = new Map(orderedKeys.map((k, i) => [k, i]));
  return [...items].sort(
    (a, b) =>
      orderPosition.get(`${a.type}:${a.id}`) - orderPosition.get(`${b.type}:${b.id}`)
  );
}

// ─── Export ──────────────────────────────────────────────────────────────

/**
 * Walk the dependency closure of a root entity and produce a bundle.
 * Items are emitted dependencies-first.
 */
async function buildBundleFromRoot({ tenantID, type, id }) {
  const rootEntity = await loadEntity({ tenantID, type, id });
  if (!rootEntity) {
    throw new Error(`${type} not found`);
  }

  const loaded = new Map(); // key -> { type, entity }
  const attempted = new Set(); // keys whose DB load was already tried

  const queue = [{ type, id, key: `${type}:${id}`, parentKey: null }];
  while (queue.length) {
    const cursor = queue.shift();
    if (attempted.has(cursor.key)) continue;
    attempted.add(cursor.key);

    const entity =
      cursor.parentKey === null ? rootEntity : await loadEntity({ tenantID, type: cursor.type, id: cursor.id });
    if (!entity) continue; // recorded as bundled:false on the parent below

    loaded.set(cursor.key, { type: cursor.type, entity });

    for (const dep of extractRowDeps(cursor.type, entity)) {
      const depKey = `${dep.type}:${dep.id}`;
      if (depKey === cursor.key) continue;
      if (!attempted.has(depKey)) {
        queue.push({ ...dep, key: depKey, parentKey: cursor.key });
      }
    }
  }

  const items = [];
  for (const [key, { type: itemType, entity }] of loaded) {
    const dependencies = extractRowDeps(itemType, entity).map((dep) => {
      const depEntry = loaded.get(`${dep.type}:${dep.id}`);
      return {
        type: dep.type,
        id: dep.id,
        name: depEntry ? getTitle(depEntry.entity, dep.type) : undefined,
        bundled: !!depEntry,
      };
    });
    items.push({
      type: itemType,
      id: entity[ID_FIELD_BY_TYPE[itemType]],
      payload: buildPayload(itemType, entity),
      dependencies,
    });
  }

  const orderedItems = orderItemsTopologically(items);

  return {
    bundleVersion: BUNDLE_VERSION,
    generator: "jet-admin",
    exportedAt: new Date().toISOString(),
    sourceTenant: tenantID,
    items: orderedItems,
  };
}

const bundleService = {};

bundleService.exportAppPage = ({ tenantID, appPageID }) =>
  buildBundleFromRoot({ tenantID, type: ITEM_TYPES.APP_PAGE, id: appPageID });

bundleService.exportWorkflow = ({ tenantID, workflowID }) =>
  buildBundleFromRoot({ tenantID, type: ITEM_TYPES.WORKFLOW, id: workflowID });

bundleService.exportDataQuery = ({ tenantID, dataQueryID }) =>
  buildBundleFromRoot({ tenantID, type: ITEM_TYPES.DATA_QUERY, id: dataQueryID });

bundleService.exportWidget = ({ tenantID, widgetID }) =>
  buildBundleFromRoot({ tenantID, type: ITEM_TYPES.WIDGET, id: widgetID });

bundleService.exportListener = ({ tenantID, listenerID }) =>
  buildBundleFromRoot({ tenantID, type: ITEM_TYPES.LISTENER, id: listenerID });

// ─── Shared import validation ────────────────────────────────────────────

/**
 * Structural validation shared by preview and execute. Throws on hard errors.
 * Returns nothing; callers proceed to their own logic afterwards.
 */
function assertImportableBundle(bundle) {
  if (!bundle || bundle.bundleVersion !== BUNDLE_VERSION) {
    throw new Error(`Unsupported bundleVersion. Expected ${BUNDLE_VERSION}.`);
  }
  if (!Array.isArray(bundle.items) || bundle.items.length === 0) {
    throw new Error("Bundle must contain at least one item.");
  }
  const seen = new Set();
  for (const item of bundle.items) {
    const key = `${item.type}:${item.id}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate bundle item: ${key}`);
    }
    seen.add(key);
    if (!item.payload || typeof item.payload !== "object") {
      throw new Error(`Bundle item ${key} has no payload.`);
    }
    const requiredField = TITLE_FIELD_BY_TYPE[item.type];
    if (!requiredField || !item.payload[requiredField]) {
      throw new Error(`Bundle item ${key} is missing required field "${requiredField}".`);
    }
  }
  // Workflow edges must reference nodes within their own item.
  for (const item of bundle.items) {
    if (item.type !== ITEM_TYPES.WORKFLOW) continue;
    const nodeIDs = new Set((item.payload.nodes || []).map((n) => n.nodeID));
    for (const edge of item.payload.edges || []) {
      if (!nodeIDs.has(edge.upstreamNodeID) || !nodeIDs.has(edge.downstreamNodeID)) {
        throw new Error(`Workflow "${item.payload.title}" has an edge referencing an unknown node.`);
      }
    }
  }
  // Listeners are hard-bound to a datasource; the link travels only in
  // dependencies[] (the column value is never exported), so it is required.
  for (const item of bundle.items) {
    if (item.type !== ITEM_TYPES.LISTENER) continue;
    const hasDatasourceDep = (item.dependencies || []).some((d) => d.type === ITEM_TYPES.DATASOURCE);
    if (!hasDatasourceDep) {
      throw new Error(
        `Listener "${item.payload.listenerTitle}" is missing its datasource dependency entry.`
      );
    }
  }
}

// ─── Preview ─────────────────────────────────────────────────────────────

bundleService.previewImport = async ({ tenantID, bundle }) => {
  Logger.log("info", { message: "bundleService:previewImport:params", params: { tenantID } });
  try {
    assertImportableBundle(bundle);

    const items = bundle.items;
    const bundleKeys = new Set(items.map((it) => `${it.type}:${it.id}`));

    // Batch-fetch existing titles / endpoint paths in the target tenant for
    // collision warnings.
    const existingTitlesByType = new Map();
    const existingEndpointPaths = new Set();
    for (const type of Object.keys(MODEL_BY_TYPE)) {
      const typedItems = items.filter((it) => it.type === type);
      if (!typedItems.length) continue;
      const titleField = TITLE_FIELD_BY_TYPE[type];
      const titles = Array.from(new Set(typedItems.map((it) => it.payload[titleField])));
      const rows = await prisma[MODEL_BY_TYPE[type]].findMany({
        where: { tenantID, [titleField]: { in: titles } },
        select: { [titleField]: true },
      });
      existingTitlesByType.set(type, new Set(rows.map((r) => r[titleField])));

      if (type === ITEM_TYPES.LISTENER) {
        const paths = typedItems
          .map((it) => it.payload.endpointPath)
          .filter(Boolean);
        if (paths.length) {
          const listenerRows = await prisma.tblListeners.findMany({
            where: { tenantID, endpointPath: { in: paths } },
            select: { endpointPath: true },
          });
          for (const row of listenerRows) existingEndpointPaths.add(row.endpointPath);
        }
      }
    }

    const planItems = [];
    let warningCount = 0;

    for (const item of items) {
      const key = `${item.type}:${item.id}`;
      const title = item.payload[TITLE_FIELD_BY_TYPE[item.type]];
      const warnings = [];
      const missingDependencies = [];

      // References outside the bundle can never be remapped by the importer.
      // Union of deep-scanned refs + explicitly declared bundled:false deps.
      const externalRefs = dedupeRefs([
        ...extractItemDeps(item).filter((r) => !bundleKeys.has(`${r.type}:${r.id}`)),
        ...(item.dependencies || [])
          .filter((d) => d.bundled === false && !bundleKeys.has(`${d.type}:${d.id}`))
          .map((d) => ({ type: d.type, id: d.id })),
      ]);

      for (const ref of externalRefs) {
        missingDependencies.push({ type: ref.type, id: ref.id });
        warnings.push(
          `Referenced ${ref.type} will be missing after import (its ID cannot be remapped).`
        );
      }

      if (existingTitlesByType.get(item.type)?.has(title)) {
        warnings.push(`A ${item.type} named "${title}" already exists in this tenant.`);
      }

      if (item.type === ITEM_TYPES.DATASOURCE && item.payload.requiresReconnect) {
        warnings.push("Credentials were stripped during export — reconnect this datasource after import.");
      }

      if (item.type === ITEM_TYPES.LISTENER) {
        if (existingEndpointPaths.has(item.payload.endpointPath)) {
          warnings.push(`Endpoint path "/${item.payload.endpointPath}" is already in use — a suffixed path will be assigned.`);
        }
        if (!bundleKeys.has(`datasource:${(item.dependencies || []).find((d) => d.type === "datasource")?.id}`)) {
          warnings.push("Listener requires a datasource that is not included in this bundle — it will be skipped during import.");
        }
      }

      warningCount += warnings.length;
      planItems.push({
        type: item.type,
        id: item.id,
        title,
        action: "create",
        warnings,
        missingDependencies,
      });
    }

    const summary = {
      createCount: planItems.length,
      warningCount,
      missingDependencyCount: planItems.reduce((acc, p) => acc + p.missingDependencies.length, 0),
    };

    Logger.log("success", {
      message: "bundleService:previewImport:success",
      params: { tenantID, summary },
    });
    return { valid: true, summary, items: planItems };
  } catch (error) {
    Logger.log("error", {
      message: "bundleService:previewImport:failure",
      params: { tenantID, error },
    });
    throw error;
  }
};

// ─── Execute ─────────────────────────────────────────────────────────────

async function uniqueEndpointPathInTx(tx, tenantID, basePath, takenPaths) {
  if (!basePath) return basePath;
  let candidate = basePath;
  let counter = 2;
  while (takenPaths.has(candidate)) {
    candidate = `${basePath}-${counter}`;
    counter += 1;
  }
  const clash = await tx.tblListeners.findFirst({
    where: { tenantID, endpointPath: candidate },
    select: { endpointPath: true },
  });
  if (clash) {
    takenPaths.add(candidate);
    return uniqueEndpointPathInTx(tx, tenantID, basePath, takenPaths);
  }
  takenPaths.add(candidate);
  return candidate;
}

bundleService.executeImport = async ({ tenantID, userID, authContext, bundle }) => {
  Logger.log("info", { message: "bundleService:executeImport:params", params: { tenantID, userID } });
  try {
    assertImportableBundle(bundle);

    const orderedItems = orderItemsTopologically(bundle.items);
    const idMap = {}; // "<type>:<oldID>" -> "<newID>"
    const results = [];
    const createdResources = [];
    const skippedResults = [];
    const importWarnings = [];

    await prisma.$transaction(async (tx) => {
      const takenEndpointPaths = new Set();

      for (const item of orderedItems) {
        const p = item.payload;

        switch (item.type) {
          case ITEM_TYPES.DATASOURCE: {
            // Defensive re-strip: imported files are untrusted input.
            const options = stripSensitiveDeep(deepClone(p.datasourceOptions || {}));
            delete options.__encrypted;
            delete options.requiresReconnect;
            const row = await tx.tblDatasources.create({
              data: {
                tenantID,
                datasourceTitle: p.datasourceTitle,
                datasourceType: p.datasourceType,
                datasourceDescription: p.datasourceDescription ?? null,
                datasourceTags: Array.isArray(p.datasourceTags) ? p.datasourceTags : [],
                datasourceOptions: encryptOptions(options),
              },
            });
            idMap[`datasource:${item.id}`] = row.datasourceID;
            results.push({ type: item.type, originalID: item.id, newID: row.datasourceID });
            createdResources.push({ type: item.type, id: row.datasourceID });
            break;
          }

          case ITEM_TYPES.DATA_QUERY: {
            const dsDep = (item.dependencies || []).find((d) => d.type === ITEM_TYPES.DATASOURCE);
            const resolvedDatasourceID = dsDep ? idMap[`datasource:${dsDep.id}`] : undefined;
            if (dsDep && !resolvedDatasourceID) {
              importWarnings.push(
                `Query "${p.dataQueryTitle}" references a datasource outside the bundle — reselect it manually.`
              );
            }
            const row = await tx.tblDataQueries.create({
              data: {
                tenantID,
                dataQueryTitle: p.dataQueryTitle,
                dataQueryDescription: p.dataQueryDescription ?? null,
                dataQueryOptions: remapRefValues(deepClone(p.dataQueryOptions) ?? {}, idMap),
                runOnLoad: !!p.runOnLoad,
                datasourceType: p.datasourceType || "postgresql",
                ...(resolvedDatasourceID ? { datasourceID: resolvedDatasourceID } : {}),
              },
            });
            idMap[`dataQuery:${item.id}`] = row.dataQueryID;
            results.push({ type: item.type, originalID: item.id, newID: row.dataQueryID });
            createdResources.push({ type: item.type, id: row.dataQueryID });
            break;
          }

          case ITEM_TYPES.WORKFLOW: {
            const wf = await tx.tblWorkflows.create({
              data: {
                tenantID,
                title: p.title,
                workflowOptions: remapRefValues(deepClone(p.workflowOptions) ?? {}, idMap),
                isDisabled: false,
              },
            });
            const nodeMap = {};
            const nodeData = (p.nodes || []).map((n) => {
              const newNodeID = crypto.randomUUID();
              nodeMap[n.nodeID] = newNodeID;
              return {
                nodeID: newNodeID,
                workflowID: wf.workflowID,
                nodeType: n.nodeType,
                timeoutSeconds: n.timeoutSeconds ?? 300,
                retryLimit: n.retryLimit ?? 3,
                nodeConfig: remapRefValues(deepClone(n.nodeConfig) ?? {}, idMap),
              };
            });
            const edgeData = (p.edges || []).map((e) => ({
              workflowID: wf.workflowID,
              upstreamNodeID: nodeMap[e.upstreamNodeID],
              downstreamNodeID: nodeMap[e.downstreamNodeID],
              sourceHandle: e.sourceHandle ?? null,
              targetHandle: e.targetHandle ?? null,
              edgeType: e.edgeType ?? null,
              edgeConfig: e.edgeConfig ?? null,
            }));
            if (nodeData.length) await tx.tblWorkflowNodes.createMany({ data: nodeData });
            if (edgeData.length) await tx.tblWorkflowEdge.createMany({ data: edgeData });
            idMap[`workflow:${item.id}`] = wf.workflowID;
            results.push({ type: item.type, originalID: item.id, newID: wf.workflowID });
            createdResources.push({ type: item.type, id: wf.workflowID });
            break;
          }

          case ITEM_TYPES.WIDGET: {
            const row = await tx.tblWidgets.create({
              data: {
                tenantID,
                widgetTitle: p.widgetTitle,
                widgetDescription: p.widgetDescription ?? null,
                widgetType: p.widgetType,
                widgetConfig: remapRefValues(deepClone(p.widgetConfig) ?? {}, idMap),
                refreshInterval: p.refreshInterval ?? null,
              },
            });
            idMap[`widget:${item.id}`] = row.widgetID;
            results.push({ type: item.type, originalID: item.id, newID: row.widgetID });
            createdResources.push({ type: item.type, id: row.widgetID });
            break;
          }

          case ITEM_TYPES.LISTENER: {
            const dsDep = (item.dependencies || []).find((d) => d.type === ITEM_TYPES.DATASOURCE);
            const resolvedDatasourceID = dsDep ? idMap[`datasource:${dsDep.id}`] : undefined;
            if (!resolvedDatasourceID) {
              skippedResults.push({
                type: item.type,
                originalID: item.id,
                reason: "Listener requires a datasource that could not be imported.",
              });
              importWarnings.push(
                `Listener "${p.listenerTitle}" was skipped: its datasource is not part of this bundle.`
              );
              break;
            }
            const endpointPath = p.endpointPath
              ? await uniqueEndpointPathInTx(tx, tenantID, p.endpointPath, takenEndpointPaths)
              : null;
            const row = await tx.tblListeners.create({
              data: {
                tenantID,
                datasourceID: resolvedDatasourceID,
                listenerTitle: p.listenerTitle,
                listenerDescription: p.listenerDescription ?? null,
                listenerType: p.listenerType,
                listenerConfig: stripSensitiveDeep(remapRefValues(deepClone(p.listenerConfig) ?? {}, idMap)),
                status: "inactive",
                endpointPath,
              },
            });
            const actionData = (p.actions || [])
              .filter((a) => a && a.actionType)
              .map((a, idx) => ({
                listenerID: row.listenerID,
                actionType: a.actionType,
                actionConfig: remapRefValues(deepClone(a.actionConfig) ?? {}, idMap),
                isEnabled: a.isEnabled !== false,
                orderIndex: typeof a.orderIndex === "number" ? a.orderIndex : idx,
              }));
            if (actionData.length) await tx.tblListenerActions.createMany({ data: actionData });
            idMap[`listener:${item.id}`] = row.listenerID;
            results.push({ type: item.type, originalID: item.id, newID: row.listenerID });
            createdResources.push({ type: item.type, id: row.listenerID });
            break;
          }

          case ITEM_TYPES.APP_PAGE: {
            let config = deepClone(p.appPageConfig) ?? {};
            config = remapAppPageWidgetKeys(config, (oldWidgetID) => idMap[`widget:${oldWidgetID}`]);
            config = remapRefValues(config, idMap);
            const row = await tx.tblAppPages.create({
              data: {
                tenantID,
                appPageTitle: p.appPageTitle,
                appPageDescription: p.appPageDescription ?? null,
                appPageConfig: config,
              },
            });
            idMap[`appPage:${item.id}`] = row.appPageID;
            results.push({ type: item.type, originalID: item.id, newID: row.appPageID });
            createdResources.push({ type: item.type, id: row.appPageID });
            break;
          }

          default:
            throw new Error(`Unknown bundle item type: ${item.type}`);
        }
      }
    });

    // Grant creator access outside the transaction, matching other services.
    const { creatorID } = getCreationContextFromAuthContext(authContext);
    const finalCreatorID = creatorID || userID;
    for (const resource of createdResources) {
      await grantCreatorAccess(tenantID, RESOURCE_BY_TYPE[resource.type], resource.id, authContext, finalCreatorID);
    }

    Logger.log("success", {
      message: "bundleService:executeImport:success",
      params: { tenantID, created: results.length, skipped: skippedResults.length },
    });
    return { results, skipped: skippedResults, warnings: importWarnings };
  } catch (error) {
    Logger.log("error", {
      message: "bundleService:executeImport:failure",
      params: { tenantID, error },
    });
    throw error;
  }
};

module.exports = { bundleService, BUNDLE_VERSION, assertImportableBundle };
