/**
 * Action Dispatcher
 *
 * Executes actions configured on widget events.
 * Each action type maps to an existing backend API.
 *
 * Supported action types:
 * - EXECUTE_QUERY  → calls testDataQueryByIDAPI
 * - TRIGGER_WORKFLOW → calls executeWorkflowAPI
 * - SHOW_TOAST → calls displaySuccess/displayError
 */

import { testDataQueryByIDAPI } from "../data/apis/dataQuery";
import { executeWorkflowAPI } from "../data/apis/workflow";
import { displaySuccess, displayError } from "../utils/notification";
import { resolveConfig } from "./evaluationEngine";
import { executionStreamService } from "./executionStreamService";

/**
 * Execute a single action.
 *
 * @param {object} action - { actionType, config }
 * @param {object} context - { tenantID, stateTree, onQueryResult, onWorkflowResult }
 * @returns {Promise<*>} The result of the action
 */
const executeAction = async (action, context) => {
  const { actionType, config: rawConfig } = action;
  const { tenantID, stateTree } = context;

  // Resolve any {{ }} expressions in the action config
  const config = resolveConfig(rawConfig, stateTree);

  switch (actionType) {
    case "EXECUTE_QUERY": {
      if (!config?.queryID) {
        console.warn("[ActionDispatcher] EXECUTE_QUERY missing queryID");
        return null;
      }
      try {
        const result = await testDataQueryByIDAPI({
          tenantID,
          dataQueryID: config.queryID,
          inputArgs: config.inputArgs || {},
        });
        // Notify the state tree to update query results
        if (context.onQueryResult) {
          context.onQueryResult(config.queryID, result);
        }
        return result;
      } catch (error) {
        console.error("[ActionDispatcher] EXECUTE_QUERY failed:", error);
        displayError(error);
        throw error;
      }
    }

    case "TRIGGER_WORKFLOW": {
      if (!config?.workflowID) {
        console.warn("[ActionDispatcher] TRIGGER_WORKFLOW missing workflowID");
        return null;
      }
      try {
        const result = await executeWorkflowAPI({
          tenantID,
          workflowID: config.workflowID,
          inputArgs: config.inputArgs || {},
        });
        
        // Let the store know we got an instance ID
        if (context.onWorkflowResult) {
          context.onWorkflowResult(config.workflowID, result);
        }
        
        // Start headless streaming in the background!
        if (result && result.instanceID) {
          executionStreamService.subscribe(result.instanceID, config.workflowID);
        }
        
        return result;
      } catch (error) {
        console.error("[ActionDispatcher] TRIGGER_WORKFLOW failed:", error);
        displayError(error);
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
      console.warn(`[ActionDispatcher] Unknown action type: ${actionType}`);
      return null;
  }
};

/**
 * Dispatch all actions for a given event type.
 * Actions are executed sequentially so that one can depend on the result of a previous one.
 *
 * @param {string} eventType - e.g. "onClick", "onSubmit", "onLoad"
 * @param {object} widgetConfig - The widget's widgetConfig object
 * @param {object} context - { tenantID, stateTree, onQueryResult, onWorkflowResult }
 * @returns {Promise<Array>} Array of results from each action
 */
export const dispatchEvent = async (eventType, widgetConfig, context) => {
  const events = widgetConfig?.events || {};
  const actions = events[eventType];

  if (!actions || !Array.isArray(actions) || actions.length === 0) {
    return [];
  }

  const results = [];
  for (const action of actions) {
    try {
      const result = await executeAction(action, context);
      results.push({ actionType: action.actionType, success: true, result });
    } catch (error) {
      results.push({ actionType: action.actionType, success: false, error });
    }
  }

  return results;
};

/**
 * Create a bound dispatcher for a specific widget.
 * Returns event handler functions that can be passed directly to widget components.
 *
 * @param {object} widgetConfig - The widget's widgetConfig
 * @param {object} context - { tenantID, stateTree, onQueryResult, onWorkflowResult }
 * @returns {object} Map of event handlers, e.g. { onClick: fn, onSubmit: fn }
 */
export const createEventHandlers = (widgetConfig, context) => {
  const events = widgetConfig?.events || {};
  const handlers = {};

  for (const eventType of Object.keys(events)) {
    handlers[eventType] = (...args) => {
      return dispatchEvent(eventType, widgetConfig, {
        ...context,
        // Pass event arguments into the state tree so expressions can reference them
        stateTree: {
          ...context.stateTree,
          event: {
            type: eventType,
            args,
          },
        },
      });
    };
  }

  return handlers;
};
