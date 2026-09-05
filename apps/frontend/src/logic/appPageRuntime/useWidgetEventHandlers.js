/**
 * useWidgetEventHandlers
 *
 * Reads widget event config and returns a `fireWidgetEvent` function.
 * When called, it executes the configured action chain sequentially:
 * SET_VARIABLE, EXECUTE_QUERY, CALL_WIDGET_METHOD, SHOW_TOAST, etc.
 */

import { useCallback, useContext, useRef, useEffect } from "react";
import { useAppPageStateTree } from "./useAppPageStateTree";
import { useAppPageDispatch } from "./useAppPageDispatch";
import { AppPageMetaContext } from "./AppPageRuntimeProvider";
import { appPageActions } from "./appPageActions";
import { resolveConfig } from "../evaluationEngine";
import { runDataQueryByIDAPI } from "../../data/apis/dataQuery";
import { executeWorkflowWithStreaming } from "./executeWorkflowWithStreaming";
import { displaySuccess, displayError } from "../../utils/notification";

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

const executeAppPageAction = async (action, stateTree, dispatch, meta, workflowRegistry) => {
  const { actionType, config: rawConfigOrig } = action;
  const rawConfig = normalizeEventRefs(rawConfigOrig);

  // Resolve {{ }} expressions in action config against current state + event input
  const config = resolveConfig(rawConfig, stateTree);

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
          if (typeof workflowRegistry[alias] === "function") {
            workflowRegistry[alias]();
          }
          delete workflowRegistry[alias];

          const { disconnect } = executeWorkflowWithStreaming({
            tenantID: meta.tenantID,
            workflowID: dataSource.workflowID,
            inputValues: mergedInputValues,
            alias,
            dispatch,
          });

          workflowRegistry[alias] = disconnect;
          return null;
        } else {
          dispatch(appPageActions.setQueryLoading(alias));
          const result = await runDataQueryByIDAPI({
            tenantID: meta.tenantID,
            dataQueryID: dataSource.queryID,
            inputValues: mergedInputValues,
          });
          dispatch(appPageActions.setQueryResult(alias, result));
          return result;
        }
      } catch (error) {
        if (dataSource.type === "workflow") {
          dispatch(appPageActions.setWorkflowResult(alias, null, error));
          if (typeof workflowRegistry[alias] === "function") {
            workflowRegistry[alias]();
          }
          delete workflowRegistry[alias];
        } else {
          dispatch(appPageActions.setQueryResult(alias, null, error));
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
        const temporaryAlias = `direct_workflow_${workflowID}`;
        if (typeof workflowRegistry[temporaryAlias] === "function") {
          workflowRegistry[temporaryAlias]();
        }

        const { disconnect } = executeWorkflowWithStreaming({
          tenantID: meta.tenantID,
          workflowID: workflowID,
          inputValues: mergedInputValues,
          alias: temporaryAlias,
          dispatch,
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
      const widgetMethods = stateTree.widgetMethods?.[targetWidgetID];
      if (!widgetMethods) {
        console.warn(`[AppPageEvents] CALL_WIDGET_METHOD: widget ${targetWidgetID} not found or has no registered methods`);
        return null;
      }
      const method = widgetMethods[methodName];
      if (typeof method !== "function") {
        console.warn(`[AppPageEvents] CALL_WIDGET_METHOD: method ${methodName} on widget ${targetWidgetID} is not a function`, widgetMethods);
        return null;
      }
      try {
        return method(...inputs);
      } catch (error) {
        console.error(`[AppPageEvents] CALL_WIDGET_METHOD: Failed to execute ${targetWidgetID}.${methodName}():`, error);
        throw error;
      }
    }

    case "SHOW_TOAST": {
      const message = config?.message || "Action completed";
      const variant = config?.variant || "success";
      if (variant === "error") {
        displayError(message);
      } else {
        displaySuccess(message);
      }
      return null;
    }

    default:
      console.warn(`[AppPageEvents] Unknown action type: ${actionType}`);
      return null;
  }
};

export const useWidgetEventHandlers = (widgetID, widgetConfig) => {
  const stateTree = useAppPageStateTree();
  const dispatch = useAppPageDispatch();
  const meta = useContext(AppPageMetaContext);

  const stateTreeRef = useRef(stateTree);
  const widgetConfigRef = useRef(widgetConfig);
  const metaRef = useRef(meta);

  useEffect(() => {
    stateTreeRef.current = stateTree;
    widgetConfigRef.current = widgetConfig;
    metaRef.current = meta;
  });

  // Active workflow streams started by THIS page instance. Disconnected when
  // the provider subtree unmounts so nothing leaks across pages.
  const workflowRegistryRef = useRef({});

  useEffect(() => {
    const registry = workflowRegistryRef.current;
    return () => {
      for (const alias of Object.keys(registry)) {
        if (typeof registry[alias] === "function") {
          registry[alias]();
        }
      }
      workflowRegistryRef.current = {};
    };
  }, []);

  const fireWidgetEvent = useCallback(
    async (eventType, eventInputs = {}) => {
      const currentWidgetConfig = widgetConfigRef.current;
      const currentMeta = metaRef.current;

      const events = currentWidgetConfig?.events || {};
      const actions = events[eventType];

      if (!actions || !Array.isArray(actions) || actions.length === 0) {
        return [];
      }

      const results = [];
      // SET_VARIABLE results applied synchronously to subsequent action
      // contexts — dispatch alone only updates the tree after a re-render,
      // so sequential chains would otherwise read stale values.
      const pendingMutations = {};
      for (const action of actions) {
        // Re-read the latest tree before each action so sequential chains see
        // mutations from earlier steps whenever a re-render has committed.
        const latestStateTree = stateTreeRef.current;
        const dynamicEventStateTree = {
          ...latestStateTree,
          variables: {
            ...latestStateTree.variables,
            ...pendingMutations,
          },
          event: {
            type: eventType,
            widgetID,
            ...eventInputs,
          },
        };

        try {
          const result = await executeAppPageAction(
            action,
            dynamicEventStateTree,
            dispatch,
            currentMeta,
            workflowRegistryRef.current
          );
          if (action.actionType === "SET_VARIABLE" && result?.key !== undefined) {
            pendingMutations[result.key] = result.value;
          }
          results.push({ actionType: action.actionType, success: true, result });
        } catch (error) {
          results.push({ actionType: action.actionType, success: false, error });
        }
      }

      return results;
    },
    [dispatch, widgetID]
  );

  return { fireWidgetEvent };
};
