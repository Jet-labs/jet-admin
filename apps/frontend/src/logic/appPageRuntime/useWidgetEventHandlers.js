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

// Module-level dictionary to track active workflow stream disconnectors
const activeWorkflowDisconnectors = {};

const disconnectWorkflowStream = (alias) => {
  if (typeof activeWorkflowDisconnectors[alias] === "function") {
    activeWorkflowDisconnectors[alias]();
  }
  delete activeWorkflowDisconnectors[alias];
};

/**
 * Execute a single action within the AppPage context.
 */
const executeAppPageAction = async (action, stateTree, dispatch, meta) => {
  const { actionType, config: rawConfig } = action;

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
        // Merge inputs: dataSource defaults → action config → event-level overrides
        const eventInputValues = stateTree.event?.inputValues || {};
        const mergedInputValues = { ...dataSource.inputValues, ...config.inputValues, ...eventInputValues };

        const isWorkflow = dataSource.type === "workflow";
        if (isWorkflow) {
          disconnectWorkflowStream(alias);

          const { disconnect } = executeWorkflowWithStreaming({
            tenantID: meta.tenantID,
            workflowID: dataSource.workflowID,
            inputValues: mergedInputValues,
            alias,
            dispatch,
          });

          activeWorkflowDisconnectors[alias] = disconnect;
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
          disconnectWorkflowStream(alias);
        } else {
          dispatch(appPageActions.setQueryResult(alias, null, error));
        }
        console.error(`[AppPageEvents] EXECUTE_QUERY "${alias}" failed:`, error);
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
      console.log(`[AppPageEvents] CALL_WIDGET_METHOD resolved config:`, { targetWidgetID, methodName, inputs });
      if (!targetWidgetID || !methodName) {
        console.warn("[AppPageEvents] CALL_WIDGET_METHOD missing target or method");
        return null;
      }
      console.log(`[AppPageEvents] Available widgetMethods in stateTree:`, stateTree.widgetMethods);
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
        console.log(`[AppPageEvents] CALL_WIDGET_METHOD: Executing ${targetWidgetID}.${methodName}()`);
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

  const fireWidgetEvent = useCallback(
    async (eventType, eventInputs = {}) => {
      const currentWidgetConfig = widgetConfigRef.current;
      const currentStateTree = stateTreeRef.current;
      const currentMeta = metaRef.current;

      const events = currentWidgetConfig?.events || {};
      const actions = events[eventType];
      console.log(`[AppPageEvents] fireWidgetEvent triggered for widget "${widgetID}", eventType: "${eventType}"`, { actions, eventInputs });

      if (!actions || !Array.isArray(actions) || actions.length === 0) {
        return [];
      }

      const results = [];
      for (const action of actions) {
        // Dynamically rebuild the state tree with the latest global state
        // to ensure sequential actions see previous mutations (e.g., SET_VARIABLE)
        const currentLiveStateTree = stateTreeRef.current;
        const dynamicEventStateTree = {
          ...currentLiveStateTree,
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
            currentMeta
          );
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
