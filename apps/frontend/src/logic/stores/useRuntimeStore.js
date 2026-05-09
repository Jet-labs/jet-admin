import { create } from "zustand";
import { resolveConfig, extractDependencies } from "../evaluationEngine";
import { createEventHandlers } from "../actionDispatcher";

function buildStateTree(state) {
  const {
    dataQueries = [],
    widgets = [],
    listeners = [],
    queryResults = {},
    workflowResults = {},
    widgetStates = {},
    listenerData = {},
    tenantID = null,
  } = state;

  const queriesNamespace = {};
  for (const query of dataQueries) {
    const key = query.dataQueryTitle || `query_${query.dataQueryID}`;
    queriesNamespace[key] = {
      queryID: query.dataQueryID,
      title: query.dataQueryTitle,
      data: queryResults[query.dataQueryID]?.data || null,
      isLoading: queryResults[query.dataQueryID]?.isLoading || false,
      error: queryResults[query.dataQueryID]?.error || null,
      lastUpdated: queryResults[query.dataQueryID]?.lastUpdated || null,
    };
  }

  const workflowsNamespace = {};
  for (const workflow of workflows) {
    const key = workflow.title || `workflow_${workflow.workflowID}`;
    workflowsNamespace[key] = {
      workflowID: workflow.workflowID,
      title: workflow.title,
      data: workflowResults[workflow.workflowID]?.data || null,
      isLoading: workflowResults[workflow.workflowID]?.isLoading || false,
      error: workflowResults[workflow.workflowID]?.error || null,
      lastUpdated: workflowResults[workflow.workflowID]?.lastUpdated || null,
    };
  }

  const widgetsNamespace = {};
  for (const widget of widgets) {
    const key = widget.widgetTitle || `widget_${widget.widgetID}`;
    widgetsNamespace[key] = {
      widgetID: widget.widgetID,
      title: widget.widgetTitle,
      type: widget.widgetType,
      ...widgetStates[widget.widgetID],
    };
  }

  const listenersNamespace = {};
  for (const listener of listeners) {
    const key = listener.listenerTitle || `listener_${listener.listenerID}`;
    listenersNamespace[key] = {
      listenerID: listener.listenerID,
      title: listener.listenerTitle,
      data: listenerData[listener.listenerID]?.data || null,
      lastUpdated: listenerData[listener.listenerID]?.lastUpdated || null,
    };
  }

  return {
    queries: queriesNamespace,
    workflows: workflowsNamespace,
    widgets: widgetsNamespace,
    listeners: listenersNamespace,
    globals: {
      tenantID,
    },
  };
}

export const useRuntimeStore = create((set, get) => ({
  // Core state
  queryResults: {},
  workflowResults: {},
  widgetStates: {},
  workflowExecutions: {}, // Keyed by instanceID
  listenerData: {}, // Keyed by listenerID

  // Catalogs
  dataQueries: [],
  workflows: [],
  widgets: [],
  listeners: [],
  tenantID: null,

  // Derived state tree
  stateTree: {
    queries: {},
    workflows: {},
    widgets: {},
    listeners: {},
    globals: {},
  },

  // Actions
  updateWorkflowExecution: (instanceID, updates) => {
    set((state) => {
      const currentExecution = state.workflowExecutions[instanceID] || { logs: [], context: {}, status: 'PENDING' };
      
      let newLogs = currentExecution.logs;
      if (updates.newLog) {
        newLogs = [...currentExecution.logs, updates.newLog];
      } else if (updates.logs) {
        newLogs = updates.logs;
      }
      
      // Don't spread newLog back into the object itself
      const { newLog, ...cleanUpdates } = updates;
      
      return {
        workflowExecutions: {
          ...state.workflowExecutions,
          [instanceID]: {
            ...currentExecution,
            ...cleanUpdates,
            logs: newLogs,
          }
        }
      };
    });
  },

  syncCatalog: (tenantID, dataQueries, workflows, widgets, listeners) => {
    set((state) => {
      const nextState = {
        ...state,
        tenantID,
        dataQueries: dataQueries || [],
        workflows: workflows || [],
        widgets: widgets || [],
        listeners: listeners || [],
      };
      return {
        ...nextState,
        stateTree: buildStateTree(nextState),
      };
    });
  },

  setListenerData: (listenerID, data) => {
    set((state) => {
      const nextListenerData = {
        ...state.listenerData,
        [listenerID]: { data, lastUpdated: Date.now() },
      };
      const nextState = { ...state, listenerData: nextListenerData };
      return {
        listenerData: nextListenerData,
        stateTree: buildStateTree(nextState),
      };
    });
  },

  setQueryResult: (queryID, data, error = null) => {
    set((state) => {
      const nextQueryResults = {
        ...state.queryResults,
        [queryID]: { data, isLoading: false, error, lastUpdated: Date.now() },
      };
      const nextState = { ...state, queryResults: nextQueryResults };
      return {
        queryResults: nextQueryResults,
        stateTree: buildStateTree(nextState),
      };
    });
  },

  setQueryLoading: (queryID) => {
    set((state) => {
      const nextQueryResults = {
        ...state.queryResults,
        [queryID]: { ...state.queryResults[queryID], isLoading: true, error: null },
      };
      const nextState = { ...state, queryResults: nextQueryResults };
      return {
        queryResults: nextQueryResults,
        stateTree: buildStateTree(nextState),
      };
    });
  },

  setWorkflowResult: (workflowID, data, error = null) => {
    set((state) => {
      const nextWorkflowResults = {
        ...state.workflowResults,
        [workflowID]: { data, isLoading: false, error, lastUpdated: Date.now() },
      };
      const nextState = { ...state, workflowResults: nextWorkflowResults };
      return {
        workflowResults: nextWorkflowResults,
        stateTree: buildStateTree(nextState),
      };
    });
  },

  setWorkflowLoading: (workflowID) => {
    set((state) => {
      const nextWorkflowResults = {
        ...state.workflowResults,
        [workflowID]: { ...state.workflowResults[workflowID], isLoading: true, error: null },
      };
      const nextState = { ...state, workflowResults: nextWorkflowResults };
      return {
        workflowResults: nextWorkflowResults,
        stateTree: buildStateTree(nextState),
      };
    });
  },

  setWidgetState: (widgetID, widgetState) => {
    set((state) => {
      const nextWidgetStates = {
        ...state.widgetStates,
        [widgetID]: { ...state.widgetStates[widgetID], ...widgetState },
      };
      const nextState = { ...state, widgetStates: nextWidgetStates };
      return {
        widgetStates: nextWidgetStates,
        stateTree: buildStateTree(nextState),
      };
    });
  },

  // Utilities
  resolveWidgetConfig: (widgetConfig) => {
    return resolveConfig(widgetConfig, get().stateTree);
  },

  getEventHandlers: (widgetConfig) => {
    const state = get();
    return createEventHandlers(widgetConfig, {
      tenantID: state.tenantID,
      stateTree: state.stateTree,
      onQueryResult: (queryID, result) => state.setQueryResult(queryID, result),
      onWorkflowResult: (workflowID, result) => state.setWorkflowResult(workflowID, result),
    });
  },

  getDependencies: (widgetConfig) => {
    return extractDependencies(widgetConfig);
  },
}));
