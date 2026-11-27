/**
 * Page-owned widget trigger bindings.
 *
 * Widgets are shared assets, so a direct TRIGGER_QUERY / TRIGGER_WORKFLOW
 * action only has meaning relative to a page's data sources. The page version
 * captures the asset-ID -> alias mapping; the Application compiler never sees
 * raw query or workflow IDs.
 */

const TRIGGER_SOURCE = {
  TRIGGER_QUERY: "query",
  TRIGGER_WORKFLOW: "workflow",
};

const SOURCE_ID_FIELD = {
  query: "queryID",
  workflow: "workflowID",
};

const sourceAssetID = (source, type) => {
  const field = SOURCE_ID_FIELD[type];
  const value = field ? source?.[field] : null;
  return typeof value === "string" ? value.trim() : "";
};

const sourceAlias = (source) =>
  typeof source?.alias === "string" ? source.alias.trim() : "";

/**
 * Build the page-owned mapping from a direct trigger target to the page data
 * source alias that captures the same asset.
 */
function capturePageTriggerBindings({ pageConfig, widgetsByID = {} }) {
  const aliases = { query: new Map(), workflow: new Map() };
  const ambiguousTargets = { query: new Set(), workflow: new Set() };
  for (const source of Array.isArray(pageConfig?.dataSources) ? pageConfig.dataSources : []) {
    if (!source || typeof source !== "object") continue;
    const type = source.type;
    if (!aliases[type]) continue;
    const assetID = sourceAssetID(source, type);
    const alias = sourceAlias(source);
    if (!assetID || !alias) continue;
    const existing = aliases[type].get(assetID);
    if (existing && existing !== alias) {
      ambiguousTargets[type].add(assetID);
      aliases[type].delete(assetID);
    } else if (!existing && !ambiguousTargets[type].has(assetID)) {
      aliases[type].set(assetID, alias);
    }
  }

  const bindings = { query: {}, workflow: {} };
  const ambiguous = [];
  for (const type of Object.keys(aliases)) {
    for (const [assetID, alias] of aliases[type]) bindings[type][assetID] = alias;
    for (const assetID of ambiguousTargets[type]) ambiguous.push({ type, assetID });
  }

  const unresolved = [];
  for (const [widgetID, widget] of Object.entries(widgetsByID)) {
    const events = widget?.widgetConfig?.events;
    if (!events || typeof events !== "object" || Array.isArray(events)) continue;
    for (const [eventName, actions] of Object.entries(events)) {
      if (!Array.isArray(actions)) continue;
      actions.forEach((action, index) => {
        const type = TRIGGER_SOURCE[action?.actionType];
        if (!type) return;
        const targetID = sourceAssetID(action.config, type);
        if (!targetID || !bindings[type][targetID]) {
          unresolved.push({
            widgetID,
            eventName,
            index,
            actionType: action.actionType,
            targetID,
          });
        }
      });
    }
  }

  return { bindings, unresolved, ambiguous };
}

function normalizedTriggerAction(action, alias) {
  const inputValues = action.config?.inputValues;
  return {
    actionType: "EXECUTE_QUERY",
    config: {
      alias,
      ...(inputValues && typeof inputValues === "object" && !Array.isArray(inputValues)
        ? { inputValues }
        : {}),
      ...(typeof action.config?.successToast === "string"
        ? { successToast: action.config.successToast }
        : {}),
      ...(typeof action.config?.errorToast === "string"
        ? { errorToast: action.config.errorToast }
        : {}),
    },
  };
}

/**
 * Rewrite direct trigger actions into page data-source aliases and drop targets
 * that the page does not capture. Returns copied widget objects; the shared
 * widget definition is never mutated.
 */
function normalizePageWidgetActions({
  pageAssetKey,
  pageConfig,
  widgetsByID = {},
  triggerBindings = null,
  diagnostics = [],
}) {
  const captured = triggerBindings || capturePageTriggerBindings({ pageConfig, widgetsByID }).bindings;
  const normalized = {};
  for (const [widgetID, widget] of Object.entries(widgetsByID)) {
    const events = widget?.widgetConfig?.events;
    if (!events || typeof events !== "object" || Array.isArray(events)) {
      normalized[widgetID] = widget;
      continue;
    }
    const nextEvents = {};
    for (const [eventName, actions] of Object.entries(events)) {
      if (!Array.isArray(actions)) {
        nextEvents[eventName] = actions;
        continue;
      }
      const kept = [];
      actions.forEach((action, index) => {
        const type = TRIGGER_SOURCE[action?.actionType];
        if (!type) {
          kept.push(action);
          return;
        }
        const targetID = sourceAssetID(action.config, type);
        const alias = targetID ? captured?.[type]?.[targetID] : "";
        if (!alias) {
          diagnostics.push({
            severity: "warning",
            code: "ACTION_TARGET_NOT_ALIASED",
            path: `pages.${pageAssetKey}.widgets.${widgetID}.events.${eventName}.${index}`,
            message: `The ${type} is not a data source on this page; the direct trigger was removed. Use a page data-source alias instead.`,
          });
          return;
        }
        kept.push(normalizedTriggerAction(action, alias));
      });
      if (kept.length > 0) nextEvents[eventName] = kept;
    }
    normalized[widgetID] = {
      ...widget,
      widgetConfig: { ...(widget.widgetConfig || {}), events: nextEvents },
    };
  }
  return normalized;
}

module.exports = {
  capturePageTriggerBindings,
  normalizePageWidgetActions,
};
