/**
 * AppPage Action Types & Creators
 *
 * Defines all actions that can mutate the AppPage runtime state.
 * Each page instance gets its own reducer, so actions are scoped to that page.
 */

// ============================================================
// Action Types
// ============================================================

export const APP_PAGE_ACTIONS = {
  /** Initialize page state with variable definitions and globals */
  INIT: "APP_PAGE_INIT",

  /** Set a page-level variable: { key, value } */
  SET_VARIABLE: "APP_PAGE_SET_VARIABLE",

  /** Merge updates into a widget's local state: { widgetID, state } */
  SET_WIDGET_STATE: "APP_PAGE_SET_WIDGET_STATE",

  /** Store a query/workflow result: { alias, data, error, isLoading } */
  SET_QUERY_RESULT: "APP_PAGE_SET_QUERY_RESULT",

  /** Mark a data source as loading: { alias } */
  SET_QUERY_LOADING: "APP_PAGE_SET_QUERY_LOADING",

  /** Register methods a widget exposes: { widgetID, methods } */
  REGISTER_WIDGET_METHODS: "APP_PAGE_REGISTER_WIDGET_METHODS",

  /** Unregister a widget on unmount: { widgetID } */
  UNREGISTER_WIDGET: "APP_PAGE_UNREGISTER_WIDGET",

  /** Store listener event data: { listenerID, data } */
  SET_LISTENER_DATA: "APP_PAGE_SET_LISTENER_DATA",
};

// ============================================================
// Action Creators
// ============================================================

export const appPageActions = {
  init: (variableDefinitions, globals) => ({
    type: APP_PAGE_ACTIONS.INIT,
    payload: { variableDefinitions, globals },
  }),

  setVariable: (key, value) => ({
    type: APP_PAGE_ACTIONS.SET_VARIABLE,
    payload: { key, value },
  }),

  setWidgetState: (widgetID, state) => ({
    type: APP_PAGE_ACTIONS.SET_WIDGET_STATE,
    payload: { widgetID, state },
  }),

  setQueryResult: (alias, data, error = null) => ({
    type: APP_PAGE_ACTIONS.SET_QUERY_RESULT,
    payload: { alias, data, error, isLoading: false },
  }),

  setQueryLoading: (alias) => ({
    type: APP_PAGE_ACTIONS.SET_QUERY_LOADING,
    payload: { alias },
  }),

  registerWidgetMethods: (widgetID, methods) => ({
    type: APP_PAGE_ACTIONS.REGISTER_WIDGET_METHODS,
    payload: { widgetID, methods },
  }),

  unregisterWidget: (widgetID) => ({
    type: APP_PAGE_ACTIONS.UNREGISTER_WIDGET,
    payload: { widgetID },
  }),

  setListenerData: (listenerID, data) => ({
    type: APP_PAGE_ACTIONS.SET_LISTENER_DATA,
    payload: { listenerID, data },
  }),
};
