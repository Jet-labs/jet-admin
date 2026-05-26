/**
 * AppPage Expression Engine
 *
 * Re-exports the core evaluation engine functions and adds
 * AppPage-specific utilities for state tree construction
 * and dependency change detection.
 */

// Re-export core engine functions — single source of truth
export {
  resolvePath,
  containsExpression,
  evaluateExpression,
  resolveValue,
  resolveConfig,
  extractDependencies,
} from "../evaluationEngine";

/**
 * Build the namespaced state tree from the AppPage reducer state.
 * This is the object that `{{ }}` expressions resolve against.
 *
 * Shape:
 * {
 *   queries:    { alias: { data, isLoading, error, lastUpdated } },
 *   widgets:    { widgetID: { ...widgetLocalState } },
 *   variables:  { key: value },
 *   listeners:  { listenerID: { data, lastUpdated } },
 *   globals:    { tenantID, currentUser, ... },
 * }
 *
 * @param {object} reducerState - The raw state from appPageReducer
 * @returns {object} The namespaced state tree for expression resolution
 */
export const buildAppPageStateTree = (reducerState, dataSources = []) => {
  const {
    queryResults = {},
    workflowResults = {},
    widgetStates = {},
    widgetMethods = {},
    variables = {},
    listenerData = {},
    globals = {},
  } = reducerState;

  const queries = {};
  const workflows = {};

  for (const ds of dataSources) {
    const alias = ds.alias;
    if (!alias) continue;

    if (ds.type === "workflow") {
      workflows[alias] = workflowResults[alias] || {
        data: null,
        error: null,
        isLoading: false,
      };
    } else {
      queries[alias] = queryResults[alias] || {
        data: null,
        error: null,
        isLoading: false,
      };
    }
  }

  return {
    queries,
    workflows,
    widgets: widgetStates,
    widgetMethods,
    variables,
    listeners: listenerData,
    globals,
  };
};

/**
 * Compare two state trees and return which top-level paths changed.
 * Used by the data source manager to know when to re-fire reactive queries.
 *
 * @param {object} prevTree - Previous state tree
 * @param {object} nextTree - Next state tree
 * @returns {string[]} Changed top-level paths, e.g. ["variables.selectedUserID", "queries.users"]
 */
export const getChangedPaths = (prevTree, nextTree) => {
  const changed = [];

  const namespaces = ["queries", "workflows", "widgets", "variables", "listeners", "globals"];

  for (const ns of namespaces) {
    const prevNs = prevTree[ns] || {};
    const nextNs = nextTree[ns] || {};

    // Check for changed or added keys
    for (const key of Object.keys(nextNs)) {
      if (prevNs[key] !== nextNs[key]) {
        changed.push(`${ns}.${key}`);
      }
    }

    // Check for removed keys
    for (const key of Object.keys(prevNs)) {
      if (!(key in nextNs)) {
        changed.push(`${ns}.${key}`);
      }
    }
  }

  return changed;
};

/**
 * Given a list of changed paths and a map of widget dependencies,
 * return which widget IDs need re-evaluation.
 *
 * @param {string[]} changedPaths - e.g. ["variables.selectedUserID"]
 * @param {object} widgetDependencyMap - { widgetID: ["variables.selectedUserID", "queries.users"] }
 * @returns {string[]} Array of widgetIDs that depend on changed paths
 */
export const getAffectedWidgets = (changedPaths, widgetDependencyMap) => {
  const affected = new Set();
  const changedSet = new Set(changedPaths);

  for (const [widgetID, deps] of Object.entries(widgetDependencyMap)) {
    for (const dep of deps) {
      if (changedSet.has(dep)) {
        affected.add(widgetID);
        break;
      }
    }
  }

  return [...affected];
};
