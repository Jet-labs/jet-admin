/**
 * AppPage Reducer
 *
 * Pure reducer managing per-page-instance runtime state.
 * Each user session gets its own reducer instance — no cross-user leakage.
 */

import { APP_PAGE_ACTIONS } from "./appPageActions";

// ============================================================
// Initial State
// ============================================================

export const createAppPageInitialState = () => ({
  /** Query results keyed by data source alias */
  queryResults: {},

  /** Workflow results keyed by data source alias */
  workflowResults: {},

  /** Widget-local UI state keyed by widgetID */
  widgetStates: {},

  /** Widget-exposed methods keyed by widgetID */
  widgetMethods: {},

  /** Page-level scratch variables keyed by variable key */
  variables: {},

  /** Variable definitions from appPageConfig (for type info & defaults) */
  variableDefinitions: [],

  /** Listener results keyed by alias */
  listenerResults: {},

  /** Global context (currentUser, tenantID, etc.) */
  globals: {},
});

// ============================================================
// Reducer
// ============================================================

export const appPageReducer = (state, action) => {
  switch (action.type) {
    case APP_PAGE_ACTIONS.INIT: {
      const { variableDefinitions = [], globals = {}, initialValues = {} } = action.payload;
      const variables = {};
      for (const def of variableDefinitions) {
        // Explicit overrides (e.g. seeded from URL params) win over defaults
        if (initialValues[def.key] !== undefined) {
          variables[def.key] = initialValues[def.key];
          continue;
        }
        variables[def.key] = def.defaultValue !== undefined
          ? def.defaultValue
          : null;
      }
      return {
        ...state,
        variableDefinitions,
        variables,
        globals,
      };
    }

    case APP_PAGE_ACTIONS.SET_VARIABLE: {
      const { key, value } = action.payload;
      return {
        ...state,
        variables: {
          ...state.variables,
          [key]: value,
        },
      };
    }

    case APP_PAGE_ACTIONS.SET_WIDGET_STATE: {
      const { widgetID, state: widgetState } = action.payload;
      return {
        ...state,
        widgetStates: {
          ...state.widgetStates,
          [widgetID]: {
            ...state.widgetStates[widgetID],
            ...widgetState,
          },
        },
      };
    }

    case APP_PAGE_ACTIONS.SET_QUERY_RESULT: {
      const { alias, data, error, isLoading } = action.payload;
      return {
        ...state,
        queryResults: {
          ...state.queryResults,
          [alias]: {
            data,
            error,
            isLoading,
            lastUpdated: Date.now(),
          },
        },
      };
    }

    case APP_PAGE_ACTIONS.SET_QUERY_LOADING: {
      const { alias } = action.payload;
      return {
        ...state,
        queryResults: {
          ...state.queryResults,
          [alias]: {
            ...state.queryResults[alias],
            isLoading: true,
            error: null,
          },
        },
      };
    }

    case APP_PAGE_ACTIONS.SET_WORKFLOW_RESULT: {
      const { alias, data, error, isLoading, instanceID } = action.payload;
      return {
        ...state,
        workflowResults: {
          ...state.workflowResults,
          [alias]: {
            data,
            error,
            isLoading,
            instanceID: instanceID !== null ? instanceID : (state.workflowResults[alias]?.instanceID || null),
            lastUpdated: Date.now(),
          },
        },
      };
    }

    case APP_PAGE_ACTIONS.SET_WORKFLOW_LOADING: {
      const { alias } = action.payload;
      return {
        ...state,
        workflowResults: {
          ...state.workflowResults,
          [alias]: {
            ...state.workflowResults[alias],
            isLoading: true,
            error: null,
            instanceID: null,
          },
        },
      };
    }

    case APP_PAGE_ACTIONS.REGISTER_WIDGET_METHODS: {
      const { widgetID, methods } = action.payload;
      return {
        ...state,
        widgetMethods: {
          ...state.widgetMethods,
          [widgetID]: methods,
        },
      };
    }

    case APP_PAGE_ACTIONS.UNREGISTER_WIDGET: {
      const { widgetID } = action.payload;
      const remainingMethods = { ...state.widgetMethods };
      delete remainingMethods[widgetID];
      const remainingStates = { ...state.widgetStates };
      delete remainingStates[widgetID];
      return {
        ...state,
        widgetMethods: remainingMethods,
        widgetStates: remainingStates,
      };
    }

    case APP_PAGE_ACTIONS.SET_LISTENER_RESULT: {
      const { alias, data, error, mode = "replace", limit = 1000 } = action.payload;
      let newData = data;
      
      if (mode === "append" || mode === "prepend") {
        const currentData = state.listenerResults[alias]?.data || [];
        const currentArray = Array.isArray(currentData) ? currentData : [];
        if (mode === "append") {
          newData = [...currentArray, data];
        } else {
          newData = [data, ...currentArray];
        }
        
        if (newData.length > limit) {
          if (mode === "append") {
            newData = newData.slice(newData.length - limit);
          } else {
            newData = newData.slice(0, limit);
          }
        }
      }

      return {
        ...state,
        listenerResults: {
          ...state.listenerResults,
          [alias]: { 
            data: newData, 
            error,
            lastUpdated: Date.now() 
          },
        },
      };
    }

    default:
      return state;
  }
};
