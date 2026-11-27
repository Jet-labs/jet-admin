/**
 * useWidgetEventHandlers
 *
 * Reads widget event config and returns a `fireWidgetEvent` function.
 * When called, it executes the configured action chain sequentially:
 * SET_VARIABLE, EXECUTE_QUERY, CALL_WIDGET_METHOD, SHOW_TOAST, etc.
 *
 * Event/method contract (F02):
 * - Sources: user gestures (click/type/select), programmatic widget methods
 *   (e.g. table.setSelectedRow, button.click), and lifecycle (onLoad/onRefresh).
 * - Exactly-once dispatch: each gesture or method call executes the
 *   configured action chain ONCE. Renderers notify exactly one route —
 *   either fireWidgetEvent with the documented flat payload (table row
 *   selection, bulk actions) or the direct onX callback the page slot shapes
 *   into one chain (chart mark/brush) — never both.
 * - Programmatic methods that change selection/value emit the same event a
 *   gesture would (e.g. setSelectedRow fires onRowSelect once).
 * - fireWidgetEvent resolves to an array of per-action structured results
 *   ({ actionType, success, result } or { actionType, success:false, error })
 *   so callers awaiting success/failure can branch on outcomes.
 */

import { useCallback, useContext, useRef, useEffect, useMemo } from "react";
import { useAppPageStateTree } from "./useAppPageStateTree";
import { useAppPageDispatch } from "./useAppPageDispatch";
import { AppPageMetaContext } from "./AppPageRuntimeProvider";
import { getQueryCoordinator } from './queryCoordinator';
import { executeWorkflowWithStreaming } from './executeWorkflowWithStreaming';
import { appPageActions } from "./appPageActions";
import { resolveConfig } from "../evaluationEngine";
import {
  buildIterationWidgetsView,
  getPlacementInstanceID,
  groupInstancesByResource,
  normalizeRepeatPath,
  resolveLegacyWidgetReference,
} from "./widgetInstanceIdentity";

/**
 * Shape a table row-selection callback into exactly one flat page event.
 * Pure + unit-tested: one call -> one fireWidgetEvent("onRowSelect",
 * { row, rowIndex }) — never the generic { inputs } nesting, never a second
 * direct fire (B04/F02 exactly-once policy). Used by AppPageWidgetSlot.
 */
export const shapeTableRowSelect = (fireWidgetEvent) => (row, rowIndex) =>
  fireWidgetEvent("onRowSelect", { row, rowIndex });
// I/O modules (data APIs, workflow streaming, toasts) load lazily inside the
// actions that need them: keeps this hook import-light for tests and keeps
// Firebase/socket/toast side effects out of module evaluation. Behavior at
// action time is unchanged (dynamic imports cache after first use).

/**
 * Execute a single action within the AppPage context.
 *
 * @param {object} workflowRegistry - Per-page-instance map of alias →
 *   disconnector for active workflow streams. Scoped to one provider so two
 *   open pages (or editor + viewer) never clobber each other's streams.
 */
/**
 * Normalize legacy `state.event.*` references to the runtime `event.*` form.
 *
 * The evaluator exposes the event payload as a TOP-LEVEL `event` identifier
 * (see wrapStateContext in evaluationEngine.js), so `{{ state.event.x }}`
 * always resolves to undefined while `{{ event.x }}` works. The older
 * `state.event.*` spelling still appears in saved pages (and was previously
 * suggested by editor placeholders), where it silently produced undefined —
 * stuck pagination, empty detail panels, failed row-saves. Rewriting the
 * prefix makes both spellings behave identically.
 */
const normalizeEventRefs = (value) => {
  if (typeof value === "string") {
    return value.includes("state.event.") ? value.split("state.event.").join("event.") : value;
  }
  if (Array.isArray(value)) return value.map(normalizeEventRefs);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalizeEventRefs(v);
    return out;
  }
  return value;
};

const showAppPageToast = async (message, variant = "success") => {
  if (!message) return;
  const { displaySuccess, displayError } = await import("../../utils/notification");
  if (variant === "error") {
    displayError(message);
  } else {
    displaySuccess(message);
  }
};

const RUNTIME_ACTION_TYPES = new Set([
  "SET_VARIABLE",
  "SET_APPLICATION_VARIABLE",
  "RESET_APPLICATION_STATE",
  "EMIT_APPLICATION_EVENT",
  "NAVIGATE",
  "SHOW_TOAST",
  "CALL_WIDGET_METHOD",
  "EXECUTE_QUERY",
]);

const executeAppPageAction = async (action, stateTree, dispatch, meta, workflowRegistry, isActive = () => true) => {
  const { actionType, config: rawConfigOrig } = action;
  const rawConfig = normalizeEventRefs(rawConfigOrig);

  // Resolve {{ }} expressions in action config against current state + event input
  const config = resolveConfig(rawConfig, stateTree);

  // A deployed runtime admits only local UI actions and pinned page data
  // sources. Direct query/workflow/listener IDs never execute even if a
  // malformed manifest contains them.
  if (meta.runtimeServices) {
    if (!RUNTIME_ACTION_TYPES.has(actionType)) {
      throw Object.assign(
        new Error(`Action type "${actionType}" is not available in this runtime release.`),
        { code: "ACTION_NOT_AVAILABLE" }
      );
    }
  }

  switch (actionType) {
    case "SET_VARIABLE": {
      // Use rawConfig instead of config.key because resolveConfig evaluates {{ ... }} expressions
      // If the user entered {{ state.variables.myVar }}, config.key would evaluate to its current value.
      const rawKey = rawConfig?.key || "";
      if (!rawKey) {
        console.warn("[AppPageEvents] SET_VARIABLE missing key");
        return null;
      }

      // If the key is wrapped in {{ }}, extract the inside string
      let variableKey = rawKey;
      const match = rawKey.match(/^{{\s*(.*?)\s*}}$/);
      if (match) {
        variableKey = match[1];
      }

      // Strip state.variables. prefix — configs are saved with the full path
      // (e.g. "state.variables.selectedUserId") but the reducer expects the bare key.
      variableKey = variableKey.replace(/^state\.variables\./, "");

      dispatch(appPageActions.setVariable(variableKey, config.value));
      return { key: variableKey, value: config.value };
    }

    case "SET_APPLICATION_VARIABLE": {
      const key =
        typeof config.key === "string"
          ? config.key
              .trim()
              .replace(/^state\.application\.variables\./, "")
              .replace(/^application\.variables\./, "")
          : "";
      if (!key) {
        throw Object.assign(
          new Error("SET_APPLICATION_VARIABLE requires a declared application variable key."),
          { code: "INVALID_APPLICATION_VARIABLE" }
        );
      }
      if (typeof meta.setApplicationVariable !== "function") {
        throw Object.assign(
          new Error("Application state is unavailable in this runtime."),
          { code: "APPLICATION_STATE_UNAVAILABLE" }
        );
      }
      meta.setApplicationVariable(key, config.value);
      return { scope: "application", key, value: config.value };
    }

    case "RESET_APPLICATION_STATE": {
      if (typeof meta.resetApplicationState !== "function") {
        throw Object.assign(
          new Error("Application state is unavailable in this runtime."),
          { code: "APPLICATION_STATE_UNAVAILABLE" }
        );
      }
      meta.resetApplicationState();
      return { scope: "application", reset: true };
    }

    case "EMIT_APPLICATION_EVENT": {
      const name = typeof config.name === "string" ? config.name.trim() : "";
      if (!/^[A-Za-z][A-Za-z0-9_.:-]{0,63}$/.test(name)) {
        throw Object.assign(
          new Error("EMIT_APPLICATION_EVENT requires a valid event name."),
          { code: "INVALID_APPLICATION_EVENT" }
        );
      }
      if (typeof meta.emitApplicationEvent !== "function") {
        throw Object.assign(
          new Error("Application events are unavailable in this runtime."),
          { code: "APPLICATION_EVENTS_UNAVAILABLE" }
        );
      }
      meta.emitApplicationEvent(name, config.payload ?? null);
      return { scope: "application", event: name };
    }

    case "NAVIGATE": {
      const routeID = typeof config.routeID === "string" ? config.routeID.trim() : "";
      if (!routeID) {
        throw Object.assign(
          new Error("NAVIGATE requires an application route ID."),
          { code: "INVALID_NAVIGATION_TARGET" }
        );
      }
      if (typeof meta.navigateToRoute !== "function") {
        throw Object.assign(
          new Error("Application navigation is unavailable in this runtime."),
          { code: "APPLICATION_NAVIGATION_UNAVAILABLE" }
        );
      }
      const target = meta.navigateToRoute({
        routeID,
        params: config.params || {},
        query: config.query || {},
        replace: config.replace === true,
      });
      return { scope: "navigation", routeID, path: target?.path || null };
    }

    case "EXECUTE_QUERY": {
      let rawAlias = rawConfig?.alias || "";
      let alias = rawAlias;
      const match = rawAlias.match(/^{{\s*(.*?)\s*}}$/);
      if (match) alias = match[1];
      alias = alias.replace(/^(state\.queries\.|state\.workflows\.)/, "");

      if (!alias) {
        console.warn("[AppPageEvents] EXECUTE_QUERY missing alias");
        return null;
      }
      // Find the data source definition by alias
      const dataSource = meta.dataSources.find((ds) => ds.alias === alias);
      if (!dataSource) {
        console.warn(`[AppPageEvents] Data source "${alias}" not found`);
        return null;
      }
      try {
        // Merge inputs: dataSource defaults → action config → event-level overrides.
        // Templates are resolved against the live tree (which already includes
        // SET_VARIABLE mutations from earlier chain steps). Without this, raw
        // "{{ state.variables.x }}" strings reach the backend: string inputs
        // silently become literals (wrong SQL, empty grids) and number inputs
        // fail validation (400, query never runs).
        const eventInputValues = stateTree.event?.inputValues || {};
        const mergedInputValues = resolveConfig(
          { ...dataSource.inputValues, ...config.inputValues, ...eventInputValues },
          stateTree
        );

        const isWorkflow = dataSource.type === "workflow";
        if (isWorkflow) {
          if (meta.runtimeServices && typeof meta.runtimeServices.startWorkflow !== "function") {
            throw new Error("Workflow execution is unavailable in this runtime");
          }
          if (typeof workflowRegistry[alias] === "function") {
            workflowRegistry[alias]();
          }
          delete workflowRegistry[alias];

          if (!isActive()) return null;
          const successToast = config?.successToast || dataSource.successToast;
          const errorToast = config?.errorToast || dataSource.errorToast;
          const { disconnect } = executeWorkflowWithStreaming({
            tenantID: meta.tenantID,
            workflowID: dataSource.workflowID,
            inputValues: mergedInputValues,
            alias,
            dispatch,
            runtimeServices: meta.runtimeServices || undefined,
            onComplete: () => {
              if (isActive()) showAppPageToast(successToast, "success");
            },
            onError: () => {
              if (isActive()) showAppPageToast(errorToast, "error");
            },
          });

          workflowRegistry[alias] = disconnect;
          return null;
        }

        if (dataSource.type === "listener" && meta.runtimeServices) {
          if (!meta.runtimeServices.subscribeListener) throw new Error("Listener observation is unavailable in this runtime");
          workflowRegistry[alias]?.();
          const { disconnect } = meta.runtimeServices.subscribeListener({ alias,
            onEvent: event => { if (isActive()) dispatch(appPageActions.setListenerResult(alias, event.data, null, event.mode, event.limit)); },
            onError: error => { if (isActive()) dispatch(appPageActions.setListenerResult(alias, null, error)); },
          });
          workflowRegistry[alias] = disconnect;
          return null;
        }

        let execute = meta.runtimeServices?.runQuery
          ? ({ inputValues, signal }) =>
              meta.runtimeServices.runQuery({ alias, inputValues, signal })
          : null;
        if (!execute) {
          const { runDataQueryByIDAPI } = await import("../../data/apis/dataQuery");
          execute = runDataQueryByIDAPI;
        }
        if (!isActive()) return null;
        const result = await getQueryCoordinator(dispatch).run({
          alias,
          tenantID: meta.tenantID,
          queryID: dataSource.queryID,
          inputValues: mergedInputValues,
          execute,
        });
        if (isActive()) {
          void showAppPageToast(config?.successToast || dataSource.successToast, "success");
        }
        return result;
      } catch (error) {
        if (dataSource.type === "workflow") {
          dispatch(appPageActions.setWorkflowResult(alias, null, error));
          if (typeof workflowRegistry[alias] === "function") {
            workflowRegistry[alias]();
          }
          delete workflowRegistry[alias];
        }
        if (isActive() && dataSource.type !== "workflow") {
          void showAppPageToast(config?.errorToast || dataSource.errorToast, "error");
        }
        console.error(`[AppPageEvents] EXECUTE_QUERY "${alias}" failed:`, error);
        throw error;
      }
    }

    case "TRIGGER_QUERY": {
      const queryID = config.queryID;
      if (!queryID) {
        console.warn("[AppPageEvents] TRIGGER_QUERY missing queryID");
        return null;
      }
      try {
        const eventInputValues = stateTree.event?.inputValues || {};
        const mergedInputValues = resolveConfig(
          { ...config.inputValues, ...eventInputValues },
          stateTree
        );

        const { runDataQueryByIDAPI } = await import("../../data/apis/dataQuery");
        if (!isActive()) return null;
        const result = await runDataQueryByIDAPI({
          tenantID: meta.tenantID,
          dataQueryID: queryID,
          inputValues: mergedInputValues,
        });
        return result;
      } catch (error) {
        console.error(`[AppPageEvents] TRIGGER_QUERY "${queryID}" failed:`, error);
        throw error;
      }
    }

    case "TRIGGER_WORKFLOW": {
      const workflowID = config.workflowID;
      if (!workflowID) {
        console.warn("[AppPageEvents] TRIGGER_WORKFLOW missing workflowID");
        return null;
      }
      try {
        const eventInputValues = stateTree.event?.inputValues || {};
        const mergedInputValues = resolveConfig(
          { ...config.inputValues, ...eventInputValues },
          stateTree
        );

        // Stable alias per target workflow: re-triggering replaces the active
        // stream instead of accumulating new reducer entries/disconnectors
        // (the old Date.now()-suffixed aliases leaked both).
        if (!isActive()) return null;
        const temporaryAlias = `direct_workflow_${workflowID}`;
        if (typeof workflowRegistry[temporaryAlias] === "function") {
          workflowRegistry[temporaryAlias]();
        }

        const successToast = config?.successToast;
        const errorToast = config?.errorToast;
        const { disconnect } = executeWorkflowWithStreaming({
          tenantID: meta.tenantID,
          workflowID: workflowID,
          inputValues: mergedInputValues,
          alias: temporaryAlias,
          dispatch,
          onComplete: () => {
            if (isActive()) showAppPageToast(successToast, "success");
          },
          onError: () => {
            if (isActive()) showAppPageToast(errorToast, "error");
          },
        });

        workflowRegistry[temporaryAlias] = disconnect;
        return null;
      } catch (error) {
        console.error(`[AppPageEvents] TRIGGER_WORKFLOW "${workflowID}" failed:`, error);
        throw error;
      }
    }

    case "CALL_WIDGET_METHOD": {
      let rawTargetWidgetID = rawConfig?.targetWidgetID || "";
      let targetWidgetID = rawTargetWidgetID;
      const targetMatch = rawTargetWidgetID.match(/^{{\s*(.*?)\s*}}$/);
      if (targetMatch) targetWidgetID = targetMatch[1];
      targetWidgetID = targetWidgetID.replace(/^state\.widgets\./, "");

      const { methodName, inputs = [] } = config || {};
      if (!targetWidgetID || !methodName) {
        console.warn("[AppPageEvents] CALL_WIDGET_METHOD missing target or method");
        return null;
      }
      // B24: instance-aware target resolution. Exact instance keys always win.
      // Inside a repeat iteration, a bare placement key first tries the same
      // iteration; legacy resource IDs resolve only when unambiguous — never
      // silently rerouted to an arbitrary placement.
      const liveMethods = stateTree.widgetMethods || {};
      const liveInstances = Object.keys(liveMethods);
      let resolvedTarget = targetWidgetID;
      const repeatPath = normalizeRepeatPath(stateTree.__firingRepeatPath);
      if (
        repeatPath.length > 0 &&
        !targetWidgetID.includes("::") &&
        liveMethods[getPlacementInstanceID(targetWidgetID, repeatPath)]
      ) {
        resolvedTarget = getPlacementInstanceID(targetWidgetID, repeatPath);
      } else {
        const resolution = resolveLegacyWidgetReference(targetWidgetID, liveInstances);
        if (resolution.kind === "ambiguous") {
          console.warn(
            `[AppPageEvents] CALL_WIDGET_METHOD: ambiguous target "${targetWidgetID}" matches ${resolution.candidates.length} placements (${resolution.candidates.join(", ")}). Use an explicit instance key; skipping call to ${methodName} so no arbitrary placement is triggered.`
          );
          return null;
        }
        if (resolution.kind === "missing") {
          console.warn(`[AppPageEvents] CALL_WIDGET_METHOD: widget ${targetWidgetID} not found or has no registered methods`);
          return null;
        }
        resolvedTarget = resolution.instanceID;
      }
      const widgetMethods = liveMethods[resolvedTarget];
      if (!widgetMethods) {
        console.warn(`[AppPageEvents] CALL_WIDGET_METHOD: widget ${targetWidgetID} not found or has no registered methods`);
        return null;
      }
      const method = widgetMethods[methodName];
      if (typeof method !== "function") {
        console.warn(`[AppPageEvents] CALL_WIDGET_METHOD: method ${methodName} on widget ${resolvedTarget} is not a function`, widgetMethods);
        return null;
      }
      try {
        return method(...inputs);
      } catch (error) {
        console.error(`[AppPageEvents] CALL_WIDGET_METHOD: Failed to execute ${resolvedTarget}.${methodName}():`, error);
        throw error;
      }
    }

    case "SHOW_TOAST": {
      const message = config?.message || "Action completed";
      const variant = config?.variant || "success";
      await showAppPageToast(message, variant);
      return null;
    }

    default:
      console.warn(`[AppPageEvents] Unknown action type: ${actionType}`);
      return null;
  }
};

export const useWidgetEventHandlers = (instanceID, widgetConfig, identityMeta) => {
  const widgetID = instanceID;
  const stateTree = useAppPageStateTree();
  const dispatch = useAppPageDispatch();
  const meta = useContext(AppPageMetaContext);
  const identityRef = useRef(identityMeta || null);
  const lifetime = useMemo(() => ({ active: true }), [instanceID]);

  const stateTreeRef = useRef(stateTree);
  const widgetConfigRef = useRef(widgetConfig);
  const metaRef = useRef(meta);

  useEffect(() => {
    stateTreeRef.current = stateTree;
    widgetConfigRef.current = widgetConfig;
    metaRef.current = meta;
    identityRef.current = identityMeta || null;
  });

  // Active workflow streams started by THIS page instance. Disconnected when
  // the provider subtree unmounts so nothing leaks across pages.
  const workflowRegistryRef = useRef({});

  useEffect(() => {
    lifetime.active = true;
    const registry = workflowRegistryRef.current;
    return () => {
      lifetime.active = false;
      for (const alias of Object.keys(registry)) {
        if (typeof registry[alias] === "function") {
          registry[alias]();
        }
      }
      workflowRegistryRef.current = {};
    };
  }, [lifetime]);

  const fireWidgetEvent = useCallback(
    async (eventType, eventInputs = {}) => {
      const currentWidgetConfig = widgetConfigRef.current;
      const currentMeta = metaRef.current;
      if (currentMeta?.runtimeServices?.executionEnabled === false) {
        return [{ success: false, status: "skipped", error: { code: "COMPOSITION_ONLY", message: "Actions are disabled in composition preview." } }];
      }
      if (currentMeta?.runtimeServices?.actionsEnabled === false) {
        return [{ success: false, status: "skipped", error: { code: "ACTIONS_DISABLED", message: "Actions are not enabled in this runtime release." } }];
      }

      const events = currentWidgetConfig?.events || {};
      const actions = events[eventType];

      if (!actions || !Array.isArray(actions) || actions.length === 0) {
        return [];
      }

      const results = [];
      // Session-state mutations are applied synchronously to subsequent
      // action contexts. dispatch/store updates alone only land after a
      // re-render, so sequential chains would otherwise read stale values.
      const pendingMutations = {};
      const pendingApplicationMutations = {};
      for (const action of actions) {
        if (!lifetime.active) break;
        // Re-read the latest tree before each action so sequential chains see
        // mutations from earlier steps whenever a re-render has committed.
        const latestStateTree = stateTreeRef.current;
        // B24/F12: iteration-scoped widgets view so a firing repeat iteration
        // resolves its own bare placement/resource refs deterministically.
        const identity = identityRef.current;
        let actionWidgets = latestStateTree.widgets;
        let firingRepeatPath = [];
        if (identity) {
          firingRepeatPath = normalizeRepeatPath(identity.repeatPath);
          const currentState = latestStateTree.widgets?.[widgetID];
          if (currentState !== undefined) {
            const solePlacement = (() => {
              const groups = groupInstancesByResource(Object.keys(latestStateTree.widgets || {}));
              const list = groups[identity.resourceID] || [];
              return (
                list.length >= 1 &&
                list.every((id) => id === widgetID || id.startsWith(`${identity.placementKey}::`))
              );
            })();
            actionWidgets = buildIterationWidgetsView({
              globalWidgets: latestStateTree.widgets || {},
              placementKey: identity.placementKey,
              resourceID: identity.resourceID,
              instanceID: widgetID,
              solePlacementForResource: solePlacement,
            });
          }
        }
        const dynamicEventStateTree = {
          ...latestStateTree,
          widgets: actionWidgets,
          __firingRepeatPath: firingRepeatPath,
          variables: {
            ...latestStateTree.variables,
            ...pendingMutations,
          },
          application: {
            ...(latestStateTree.application || {}),
            variables: {
              ...(latestStateTree.application?.variables || {}),
              ...pendingApplicationMutations,
            },
          },
          event: {
            type: eventType,
            widgetID,
            instanceID: widgetID,
            resourceID: identity?.resourceID,
            placementKey: identity?.placementKey,
            repeatPath: firingRepeatPath,
            ...eventInputs,
          },
        };

        try {
          const result = await executeAppPageAction(
            action,
            dynamicEventStateTree,
            dispatch,
            currentMeta,
            workflowRegistryRef.current,
            () => lifetime.active
          );
          if (action.actionType === "SET_VARIABLE" && result?.key !== undefined) {
            pendingMutations[result.key] = result.value;
          }
          if (
            action.actionType === "SET_APPLICATION_VARIABLE" &&
            result?.scope === "application"
          ) {
            pendingApplicationMutations[result.key] = result.value;
          }
          results.push({ actionType: action.actionType, success: true, result });
          // A navigation action ends this page instance's chain. Any later
          // actions belong to the page being left, not the destination.
          if (action.actionType === "NAVIGATE" && result?.path) break;
        } catch (error) {
          results.push({ actionType: action.actionType, success: false, error });
        }
      }

      return results;
    },
    [dispatch, widgetID, lifetime]
  );

  return { fireWidgetEvent };
};
