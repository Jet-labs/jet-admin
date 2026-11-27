const { createHash } = require("crypto");
const { validateApplicationDefinition, collectPageWidgetIDs, isSafeApplicationJSON } = require("@jet-admin/application-contracts");
const { extractQueryDefinitions, extractWorkflowDefinitions } = require("../../utils/input.util");
const { applicationError } = require("./application.errors");

// Runtime widgets are still an allowlist. Rich HTML/iframe/custom-code
// widgets stay out until a sandboxed rendering boundary exists.
const RUNTIME_WIDGET_TYPES = new Set([
  "text", "stat", "alert", "badge", "progress", "divider", "button",
  "table", "key-value", "json-viewer", "list", "text-input", "search-input",
  "select", "multi-select", "checkbox", "radio-group", "switch", "slider",
  "date-picker", "date-range-picker", "form", "tabs", "vega", "vega-lite",
  "composite",
  "code-block", "calendar", "context", "file-upload", "image", "kanban",
  "timeline", "video",
]);

// Only local UI actions and captured page data-source execution survive into a
// release. The page layer resolves direct query/workflow triggers to page
// data-source aliases before compilation; the compiler never interprets raw
// query or workflow IDs.
const RUNTIME_ACTION_TYPES = new Set([
  "SET_VARIABLE", "SET_APPLICATION_VARIABLE", "RESET_APPLICATION_STATE", "EMIT_APPLICATION_EVENT",
  "NAVIGATE", "SHOW_TOAST", "CALL_WIDGET_METHOD", "EXECUTE_QUERY",
]);
const APPLICATION_EVENT_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_.:-]{0,63}$/;
const APPLICATION_EVENT_MAX_PAYLOAD_BYTES = 64 * 1024;

const SAFE_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
const RESERVED_KEYS = new Set(["__proto__", "prototype", "constructor"]);


const requireObject = (value, message) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw applicationError("INVALID_RELEASE_SOURCE", message, 400);
  }
  return value;
};

const warning = (diagnostics, code, path, message) => {
  diagnostics.push({ severity: "warning", code, path, message });
};

const normalizeAlias = (value) => {
  if (typeof value !== "string") return "";
  let alias = value;
  const match = alias.match(/^{{\s*(.*?)\s*}}$/);
  if (match) alias = match[1];
  return alias.replace(/^(state\.queries\.|state\.workflows\.)/, "");
};

function buildRuntimePage(assetKey, page, queriesByID, workflowsByID, listenersByID) {
  const pageConfig = requireObject(page.appPageConfig || {}, `Page ${assetKey} has no valid configuration.`);
  const dataSources = Array.isArray(pageConfig.dataSources) ? pageConfig.dataSources : [];
  const runtimeSources = [];
  const serverSources = {};
  for (const source of dataSources) {
    requireObject(source, `Page ${assetKey} has an invalid data source.`);
    const alias = typeof source.alias === "string" ? source.alias.trim() : "";
    if (!alias) {
      throw applicationError("INVALID_DATA_SOURCE_ALIAS", `Page ${assetKey} has a data source without an alias.`, 400);
    }
    if (serverSources[alias]) {
      throw applicationError("DUPLICATE_DATA_SOURCE_ALIAS", `Page ${assetKey} has more than one data source named "${alias}".`, 400);
    }
    if (!["query", "workflow", "listener"].includes(source.type)) {
      throw applicationError(
        "UNSUPPORTED_DATA_SOURCE",
        `Page ${assetKey} uses an unsupported ${source.type || "unknown"} data source.`,
        400
      );
    }
    const resource = source.type === "query" ? queriesByID[source.queryID]
      : source.type === "workflow" ? workflowsByID[source.workflowID] : listenersByID[source.listenerID];
    if (!resource) {
      throw applicationError("APPLICATION_ASSET_NOT_FOUND", `Data source "${alias}" on page ${assetKey} no longer exists.`, 409);
    }
    const inputDefinitions = source.type === "query" ? extractQueryDefinitions(resource)
      : source.type === "workflow" ? extractWorkflowDefinitions(resource) : [];
    const triggerMode = ["auto", "reactive", "manual"].includes(source.triggerMode) ? source.triggerMode : "manual";
    runtimeSources.push({
      alias,
      type: source.type,
      triggerMode,
      refreshOn: Array.isArray(source.refreshOn) ? source.refreshOn : [],
      refetchInterval: Number.isFinite(source.refetchInterval) ? source.refetchInterval : 0,
      inputValues: source.inputValues && typeof source.inputValues === "object" ? source.inputValues : {},
    });
    if (source.type === "query") serverSources[alias] = { type: "query", ...resource, inputDefinitions };
    else if (source.type === "workflow") serverSources[alias] = { type: "workflow", workflowID: resource.workflowID, workflowVersionID: resource.assetVersionID, inputDefinitions };
    else {
      const bufferName = source.bufferName || "default";
      const buffer = resource.actions.find(action => action.actionType === "save_to_buffer" && (action.actionConfig.bufferName || "default") === bufferName);
      if (!buffer) throw applicationError("APPLICATION_LISTENER_BUFFER_REQUIRED", `Listener "${alias}" needs an enabled Save to buffer action named "${bufferName}" for durable observation.`, 400);
      const push = resource.actions.find(action => action.actionType === "push_to_app_page" && action.actionConfig.appPageID === page.appPageID && (!source.channelName || (action.actionConfig.channelName || `listener:${resource.listenerID}`) === source.channelName));
      serverSources[alias] = { type: "listener", listenerID: resource.listenerID, listenerVersionID: resource.assetVersionID, bufferName, definitionHash: resource.definitionHash,
        mode: push?.actionConfig.mode || "replace", limit: Math.min(1000, Math.max(1, Number(push?.actionConfig.maxArrayLength) || 1000)) };
    }
  }
  return {
    clientPage: {
      appPageID: page.appPageID,
      appPageTitle: page.appPageTitle,
      appPageConfig: { ...pageConfig, dataSources: runtimeSources },
    },
    serverSources,
  };
}

function buildRuntimeActions(widget, pageAssetKeys, pageSources, diagnostics, definition) {
  const events = widget.widgetConfig?.events;
  if (!events || typeof events !== "object" || Array.isArray(events)) return {};
  const applicationVariableKeys = new Set(Object.keys(definition?.state?.application || {}));
  const routeIDs = new Set((definition?.routes || []).map(route => route.id));
  const runtimeEvents = {};

  for (const [eventName, actions] of Object.entries(events)) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(eventName) || !Array.isArray(actions)) {
      warning(
        diagnostics,
        "INVALID_WIDGET_EVENT",
        `widgets.${widget.widgetID}.events.${eventName}`,
        "The event is not a recognized action list and was removed from the release."
      );
      continue;
    }
    const kept = [];
    actions.forEach((action, index) => {
      const path = `widgets.${widget.widgetID}.events.${eventName}.${index}`;
      if (!action || typeof action !== "object" || Array.isArray(action)) {
        warning(diagnostics, "INVALID_ACTION", path, "The action is not an object and was removed from the release.");
        return;
      }

      // Direct asset triggers belong to the page layer. If one reaches the
      // compiler it was not captured by a page data source and must not be
      // turned into runtime behavior here.
      if (action.actionType === "TRIGGER_QUERY" || action.actionType === "TRIGGER_WORKFLOW") {
        warning(
          diagnostics,
          "ACTION_TARGET_NOT_ALIASED",
          path,
          "Direct query/workflow triggers must be bound to a page data source before publishing; the action was removed."
        );
        return;
      }

      if (!RUNTIME_ACTION_TYPES.has(action.actionType)) {
        warning(
          diagnostics,
          "ACTION_TYPE_UNAVAILABLE",
          path,
          `Action type "${action.actionType || "unknown"}" is not available in the deployed runtime.`
        );
        return;
      }

      if (action.actionType === "SET_VARIABLE") {
        const rawKey = typeof action.config?.key === "string" ? action.config.key : "";
        const match = rawKey.match(/^{{\s*(.*?)\s*}}$/);
        const variableKey = (match ? match[1] : rawKey).replace(/^state\.variables\./, "");
        if (!SAFE_KEY_PATTERN.test(variableKey) || RESERVED_KEYS.has(variableKey)) {
          warning(
            diagnostics,
            "ACTION_VARIABLE_INVALID",
            path,
            "Set-variable action has an invalid variable key and was removed."
          );
          return;
        }
        kept.push(action);
        return;
      }

      if (action.actionType === "SET_APPLICATION_VARIABLE") {
        const rawKey = typeof action.config?.key === "string" ? action.config.key : "";
        const match = rawKey.match(/^{{\s*(.*?)\s*}}$/);
        const variableKey = (match ? match[1] : rawKey)
          .replace(/^state\.application\.variables\./, "")
          .replace(/^application\.variables\./, "");
        if (!SAFE_KEY_PATTERN.test(variableKey) || RESERVED_KEYS.has(variableKey) || !applicationVariableKeys.has(variableKey)) {
          warning(
            diagnostics,
            "ACTION_APPLICATION_VARIABLE_INVALID",
            path,
            "Set-application-variable action targets an undeclared or invalid application variable and was removed."
          );
          return;
        }
        kept.push({
          actionType: "SET_APPLICATION_VARIABLE",
          config: { key: variableKey, value: action.config?.value },
        });
        return;
      }

      if (action.actionType === "RESET_APPLICATION_STATE") {
        kept.push({ actionType: "RESET_APPLICATION_STATE", config: {} });
        return;
      }

      if (action.actionType === "EMIT_APPLICATION_EVENT") {
        const name = typeof action.config?.name === "string" ? action.config.name.trim() : "";
        const payload = action.config?.payload === undefined ? null : action.config.payload;
        const payloadBytes = isSafeApplicationJSON(payload)
          ? Buffer.byteLength(JSON.stringify(payload), "utf8")
          : Infinity;
        if (!APPLICATION_EVENT_NAME_PATTERN.test(name) || payloadBytes > APPLICATION_EVENT_MAX_PAYLOAD_BYTES) {
          warning(
            diagnostics,
            "ACTION_EVENT_INVALID",
            path,
            "Application events need a valid name and a safe JSON payload under 64 KiB; the action was removed."
          );
          return;
        }
        kept.push({
          actionType: "EMIT_APPLICATION_EVENT",
          config: { name, ...(payload !== null ? { payload } : {}) },
        });
        return;
      }

      if (action.actionType === "NAVIGATE") {
        const routeID = typeof action.config?.routeID === "string" ? action.config.routeID.trim() : "";
        if (!SAFE_KEY_PATTERN.test(routeID) || !routeIDs.has(routeID)) {
          warning(
            diagnostics,
            "ACTION_ROUTE_NOT_FOUND",
            path,
            "Navigate action targets a route that is not part of this application and was removed."
          );
          return;
        }
        kept.push({
          actionType: "NAVIGATE",
          config: {
            routeID,
            ...(action.config?.params && typeof action.config.params === "object" && !Array.isArray(action.config.params)
              ? { params: action.config.params }
              : {}),
            ...(action.config?.query && typeof action.config.query === "object" && !Array.isArray(action.config.query)
              ? { query: action.config.query }
              : {}),
            ...(action.config?.replace === true ? { replace: true } : {}),
          },
        });
        return;
      }

      if (action.actionType !== "EXECUTE_QUERY") {
        kept.push(action);
        return;
      }
      const alias = normalizeAlias(action.config?.alias);
      if (!alias) {
        warning(diagnostics, "ACTION_TARGET_MISSING", path, "The action has no page data-source alias and was removed.");
        return;
      }
      const missingPage = pageAssetKeys.find((assetKey) => !pageSources[assetKey]?.[alias]);
      if (missingPage) {
        warning(
          diagnostics,
          "ACTION_TARGET_NOT_FOUND",
          path,
          `Data source "${alias}" does not exist on page ${missingPage}; the action was removed.`
        );
        return;
      }
      const inputValues = action.config?.inputValues;
      kept.push({
        actionType: "EXECUTE_QUERY",
        config: {
          alias,
          ...(inputValues && typeof inputValues === "object" && !Array.isArray(inputValues) ? { inputValues } : {}),
          ...(typeof action.config?.successToast === "string" ? { successToast: action.config.successToast } : {}),
          ...(typeof action.config?.errorToast === "string" ? { errorToast: action.config.errorToast } : {}),
        },
      });
    });
    if (kept.length > 0) runtimeEvents[eventName] = kept;
  }
  return runtimeEvents;
}

function normalizeCompositeLayout(node, pageAssetKeys, pageSources, diagnostics, definition) {
  if (!node || typeof node !== "object") return node;
  if (node.type === "inline-widget" && node.inlineWidget) {
    const inline = node.inlineWidget;
    if (!RUNTIME_WIDGET_TYPES.has(inline.widgetType)) {
      warning(
        diagnostics,
        "COMPOSITE_WIDGET_UNAVAILABLE",
        "composite.layout",
        `Inline widget type "${inline.widgetType || "unknown"}" is not available in the deployed runtime and was removed.`
      );
      return null;
    }
    return {
      ...node,
      inlineWidget: {
        ...inline,
        widgetConfig: {
          ...(inline.widgetConfig || {}),
          events: buildRuntimeActions(
            { widgetConfig: inline.widgetConfig || {} },
            pageAssetKeys,
            pageSources,
            diagnostics,
            definition
          ),
        },
      },
    };
  }
  if (Array.isArray(node.children)) {
    return {
      ...node,
      children: node.children
        .map((child) =>
          normalizeCompositeLayout(child, pageAssetKeys, pageSources, diagnostics, definition)
        )
        .filter(Boolean),
    };
  }
  if (node.children && typeof node.children === "object") {
    return {
      ...node,
      children: normalizeCompositeLayout(
        node.children,
        pageAssetKeys,
        pageSources,
        diagnostics,
        definition
      ),
    };
  }
  return node;
}

function buildWidgets(widgetID, widgetsByID, pageAssetKeys, pageSources, diagnostics, definition) {
  const widget = widgetsByID[widgetID];
  if (!widget) throw applicationError("APPLICATION_ASSET_NOT_FOUND", "A page references a widget that no longer exists.", 409);
  if (!isSafeApplicationJSON(widget.widgetConfig)) throw applicationError("INVALID_WIDGET_CONFIG", "A widget contains unsupported JSON.", 400);
  if (!RUNTIME_WIDGET_TYPES.has(widget.widgetType)) {
    throw applicationError("UNSUPPORTED_WIDGET_TYPE", `Widget type "${widget.widgetType}" is not supported by the runtime yet.`, 400);
  }
  // Page data sources are the execution boundary in an Application. Widget-level
  // standalone data sources are captured in the widget version for authoring but
  // never sent to the deployed client.
  const { dataSources: _standaloneDataSources, ...widgetConfig } = widget.widgetConfig || {};
  return {
    [widgetID]: {
      widgetID: widget.widgetID,
      widgetTitle: widget.widgetTitle,
      widgetType: widget.widgetType,
      widgetConfig: {
        ...widgetConfig,
        ...(widget.widgetType === "composite" && widgetConfig.composite
          ? {
              composite: {
                ...widgetConfig.composite,
                layout: normalizeCompositeLayout(
                  widgetConfig.composite.layout,
                  pageAssetKeys,
                  pageSources,
                  diagnostics,
                  definition
                ),
              },
            }
          : {}),
        events: buildRuntimeActions(widget, pageAssetKeys, pageSources, diagnostics, definition),
      },
    },
  };
}

/**
 * Pure release compiler. It only receives tenant-scoped source rows that the
 * service already validated; it never fetches or embeds datasource secrets.
 */
function compileApplicationRelease({ application, definition, pagesByAsset, widgetsByID, queriesByID, workflowsByID = {}, listenersByID = {} , assets: assetsOverride = null }) {
  const assets = assetsOverride || Object.entries(pagesByAsset).map(([assetKey, page]) => ({
    assetKey,
    assetType: "appPage",
    appPageID: page.appPageID,
  }));
  const validation = validateApplicationDefinition(definition, assets);
  if (!validation.valid) {
    throw applicationError("INVALID_APPLICATION_DEFINITION", "Fix the draft validation errors before publishing.", 400, {
      diagnostics: validation.diagnostics,
    });
  }

  const diagnostics = [];
  const pages = {};
  const serverPages = {};
  const pageSources = {};
  const pageWidgetIDs = {};
  const widgetPages = {};
  for (const [assetKey, page] of Object.entries(pagesByAsset)) {
    const built = buildRuntimePage(assetKey, page, queriesByID, workflowsByID, listenersByID);
    const widgetIDs = collectPageWidgetIDs(page.appPageConfig || {});
    pageSources[assetKey] = built.serverSources;
    pageWidgetIDs[assetKey] = widgetIDs;
    for (const widgetID of widgetIDs) {
      widgetPages[widgetID] = widgetPages[widgetID] || [];
      widgetPages[widgetID].push(assetKey);
    }
    pages[assetKey] = built.clientPage;
    serverPages[assetKey] = built.serverSources;
  }

  const widgets = {};
  for (const widgetID of Object.keys(widgetPages).sort()) {
    Object.assign(
      widgets,
      buildWidgets(widgetID, widgetsByID, widgetPages[widgetID], pageSources, diagnostics, validation.definition)
    );
  }

  diagnostics.sort((a, b) => `${a.path}:${a.code}`.localeCompare(`${b.path}:${b.code}`));

  const clientManifest = {
    schemaVersion: 1,
    mode: "runtime",
    executionEnabled: true,
    actionsEnabled: true,
    applicationID: application.applicationID,
    applicationTitle: application.title,
    applicationSlug: application.slug,
    tenantID: application.tenantID,
    definition: validation.definition,
    pages,
    widgets,
    diagnostics,
  };
  const serverManifest = {
    schemaVersion: 1,
    applicationID: application.applicationID,
    tenantID: application.tenantID,
    pages: serverPages,
    queries: queriesByID,
    workflows: workflowsByID,
    listeners: listenersByID,
  };
  const contentHash = createHash("sha256")
    .update(JSON.stringify({ definition: validation.definition, pages, widgets, serverManifest, diagnostics }))
    .digest("hex");
  return { clientManifest, serverManifest, contentHash };
}

module.exports = { compileApplicationRelease, RUNTIME_WIDGET_TYPES, RUNTIME_ACTION_TYPES };
