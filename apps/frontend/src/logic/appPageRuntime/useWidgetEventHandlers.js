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

  // Resolve {{ }} expressions in action config against current state + event args
  const config = resolveConfig(rawConfig, stateTree);

  switch (actionType) {
    case "SET_VARIABLE": {
      if (!config?.key) {
        console.warn("[AppPageEvents] SET_VARIABLE missing key");
        return null;
      }
      dispatch(appPageActions.setVariable(config.key, config.value));
      return { key: config.key, value: config.value };
    }

    case "EXECUTE_QUERY": {
      const alias = config?.alias;
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
        // Merge input args: dataSource defaults → action config → event-level overrides
        const eventInputArgs = stateTree.event?.inputArgs || {};
        const mergedInputArgs = { ...dataSource.inputArgs, ...config.inputArgs, ...eventInputArgs };

        const isWorkflow = dataSource.type === "workflow";
        if (isWorkflow) {
          disconnectWorkflowStream(alias);

          const { disconnect } = executeWorkflowWithStreaming({
            tenantID: meta.tenantID,
            workflowID: dataSource.workflowID,
            inputArgs: mergedInputArgs,
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
            inputArgs: mergedInputArgs,
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
      const { targetWidgetID, methodName, args = [] } = config || {};
      console.log(`[AppPageEvents] CALL_WIDGET_METHOD resolved config:`, { targetWidgetID, methodName, args });
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
        return method(...args);
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

    // Passthrough to the existing action dispatcher for backwards compat
    case "EXECUTE_QUERY_LEGACY":
    case "TRIGGER_WORKFLOW": {
      // Delegate to existing actionDispatcher
      const { dispatchEvent } = await import("../actionDispatcher");
      return dispatchEvent(actionType, { events: { [actionType]: [action] } }, {
        tenantID: meta.tenantID,
        stateTree,
      });
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
    async (eventType, eventArgs = {}) => {
      const currentWidgetConfig = widgetConfigRef.current;
      const currentStateTree = stateTreeRef.current;
      const currentMeta = metaRef.current;

      const events = currentWidgetConfig?.events || {};
      const actions = events[eventType];
      console.log(`[AppPageEvents] fireWidgetEvent triggered for widget "${widgetID}", eventType: "${eventType}"`, { actions, eventArgs });

      if (!actions || !Array.isArray(actions) || actions.length === 0) {
        return [];
      }

      // Augment state tree with event context
      const eventStateTree = {
        ...currentStateTree,
        event: {
          type: eventType,
          widgetID,
          ...eventArgs,
        },
      };

      const results = [];
      for (const action of actions) {
        try {
          const result = await executeAppPageAction(
            action,
            eventStateTree,
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
