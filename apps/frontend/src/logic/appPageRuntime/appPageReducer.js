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
  /** Query/workflow results keyed by data source alias */
  queryResults: {},

  /** Widget-local UI state keyed by widgetID */
  widgetStates: {},

  /** Widget-exposed methods keyed by widgetID */
  widgetMethods: {},

  /** Page-level scratch variables keyed by variable key */
  variables: {},

  /** Variable definitions from appPageConfig (for type info & defaults) */
  variableDefinitions: [],

  /** Listener event data keyed by listenerID */
  listenerData: {},

  /** Global context (currentUser, tenantID, etc.) */
  globals: {},
});

// ============================================================
// Reducer
// ============================================================

export const appPageReducer = (state, action) => {
  switch (action.type) {
    case APP_PAGE_ACTIONS.INIT: {
      const { variableDefinitions = [], globals = {} } = action.payload;
      const variables = {};
      for (const def of variableDefinitions) {
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
      const { [widgetID]: _removedMethods, ...remainingMethods } = state.widgetMethods;
      const { [widgetID]: _removedState, ...remainingStates } = state.widgetStates;
      return {
        ...state,
        widgetMethods: remainingMethods,
        widgetStates: remainingStates,
      };
    }

    case APP_PAGE_ACTIONS.SET_LISTENER_DATA: {
      const { listenerID, data } = action.payload;
      return {
        ...state,
        listenerData: {
          ...state.listenerData,
          [listenerID]: { data, lastUpdated: Date.now() },
        },
      };
    }

    default:
      return state;
  }
};
