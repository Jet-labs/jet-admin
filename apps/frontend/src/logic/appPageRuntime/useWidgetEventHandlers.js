/**
 * useWidgetEventHandlers
 *
 * Reads widget event config and returns a `fireWidgetEvent` function.
 * When called, it executes the configured action chain sequentially:
 * SET_VARIABLE, EXECUTE_QUERY, CALL_WIDGET_METHOD, SHOW_TOAST, etc.
 */

import { useCallback, useContext } from "react";
import { useAppPageStateTree } from "./useAppPageStateTree";
import { useAppPageDispatch } from "./useAppPageDispatch";
import { AppPageMetaContext } from "./AppPageRuntimeProvider";
import { appPageActions } from "./appPageActions";
import { resolveConfig } from "../evaluationEngine";
import { testDataQueryByIDAPI } from "../../data/apis/dataQuery";
import { executeWorkflowAPI } from "../../data/apis/workflow";
import { displaySuccess, displayError } from "../../utils/notification";

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
        dispatch(appPageActions.setQueryLoading(alias));
        if (dataSource.type === "workflow") {
          const result = await executeWorkflowAPI({
            tenantID: meta.tenantID,
            workflowID: dataSource.workflowID,
            inputArgs: { ...dataSource.inputArgs, ...config.inputArgs },
          });
          dispatch(appPageActions.setQueryResult(alias, result));
          return result;
        } else {
          const result = await testDataQueryByIDAPI({
            tenantID: meta.tenantID,
            dataQueryID: dataSource.queryID,
            inputArgs: { ...dataSource.inputArgs, ...config.inputArgs },
          });
          dispatch(appPageActions.setQueryResult(alias, result));
          return result;
        }
      } catch (error) {
        dispatch(appPageActions.setQueryResult(alias, null, error));
        console.error(`[AppPageEvents] EXECUTE_QUERY "${alias}" failed:`, error);
        throw error;
      }
    }

    case "CALL_WIDGET_METHOD": {
      const { targetWidgetID, methodName, args = [] } = config || {};
      if (!targetWidgetID || !methodName) {
        console.warn("[AppPageEvents] CALL_WIDGET_METHOD missing target or method");
        return null;
      }
      // Widget methods are stored in the reducer state, not the state tree
      // We access them via a ref in the provider — for now, log a warning
      // This will be wired up when we integrate with the AppPageWidgetSlot
      console.warn(
        `[AppPageEvents] CALL_WIDGET_METHOD: ${targetWidgetID}.${methodName}() — command bus integration pending`
      );
      return null;
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

  const fireWidgetEvent = useCallback(
    async (eventType, eventArgs = {}) => {
      const events = widgetConfig?.events || {};
      const actions = events[eventType];

      if (!actions || !Array.isArray(actions) || actions.length === 0) {
        return [];
      }

      // Augment state tree with event context
      const eventStateTree = {
        ...stateTree,
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
            meta
          );
          results.push({ actionType: action.actionType, success: true, result });
        } catch (error) {
          results.push({ actionType: action.actionType, success: false, error });
        }
      }

      return results;
    },
    [widgetConfig, stateTree, dispatch, meta, widgetID]
  );

  return { fireWidgetEvent };
};
