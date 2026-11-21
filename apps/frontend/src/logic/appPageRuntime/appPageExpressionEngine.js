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
import { parseResourceID } from "./widgetInstanceIdentity";

/**
 * Build the namespaced state tree from the AppPage reducer state.
 * This is the object that `{{ }}` expressions resolve against.
 *
 * Widget identity (B24): `widgetStates` is keyed by runtime instance ID
 * (placement key, repeat-qualified inside repeats). `widgets` exposes every
 * live instance key verbatim, plus a legacy `resourceID` alias ONLY when that
 * resource has exactly one live instance (deterministic single-placement
 * backward compat). Ambiguous resources are omitted — never silently rerouted
 * — and listed under `widgetDiagnostics.ambiguousWidgetResources` with an
 * explicit-instance migration hint. Prefer
 * `{{ state.widgets.<placementKey>... }}` (see widgetInstanceIdentity.js).
 *
 * Shape:
 * {
 *   queries:    { alias: { data, isLoading, error, lastUpdated } },
 *   widgets:    { instanceID: { ...widgetLocalState }, [resourceID]: alias },
 *   variables:  { key: value },
 *   listeners:  { listenerID: { data, lastUpdated } },
 *   globals:    { tenantID, currentUser, ... },
 *   widgetDiagnostics: { ambiguousWidgetResources: { [resourceID]: string[] } },
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
    listenerResults = {},
    globals = {},
  } = reducerState;

  const queries = {};
  const workflows = { ...workflowResults };
  const listeners = {};

  for (const ds of dataSources) {
    const alias = ds.alias;
    if (!alias) continue;

    if (ds.type === "workflow") {
      workflows[alias] = workflowResults[alias] || {
        data: null,
        error: null,
        isLoading: false,
      };
    } else if (ds.type === "listener") {
      listeners[alias] = listenerResults[alias] || {
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

  // Direct TRIGGER_WORKFLOW actions use a stable `direct_workflow_<id>` alias
  // that may not be declared as a page data source. Expose those results too,
  // so status/result widgets can show loading, errors and the final context.
  for (const [alias, result] of Object.entries(workflowResults)) {
    if (!workflows[alias]) workflows[alias] = result;
  }

  // B24: instance keys are canonical. Legacy resource aliases apply only
  // when unambiguous; ambiguous resources resolve to undefined with
  // diagnostics instead of an arbitrary placement.
  const widgets = { ...widgetStates };
  const ambiguousWidgetResources = {};
  const byResource = {};
  for (const instanceID of Object.keys(widgetStates)) {
    const resource = parseResourceID(instanceID);
    if (!resource) continue;
    if (!byResource[resource]) byResource[resource] = [];
    byResource[resource].push(instanceID);
  }
  for (const [resource, instances] of Object.entries(byResource)) {
    if (instances.length === 1 && widgets[resource] === undefined) {
      widgets[resource] = widgets[instances[0]];
    } else if (instances.length > 1 && widgets[resource] === undefined) {
      ambiguousWidgetResources[resource] = [...instances].sort();
    }
  }

  return {
    queries,
    workflows,
    listeners,
    widgets,
    widgetMethods,
    variables,
    globals,
    widgetDiagnostics: { ambiguousWidgetResources },
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
