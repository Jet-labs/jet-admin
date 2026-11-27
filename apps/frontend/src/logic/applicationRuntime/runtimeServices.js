import {
  resolveConfig,
  resolveValue,
  evaluateVisibilityCondition,
} from "../evaluationEngine";
import { observeApplicationListener } from "./observeListener";
import {
  strictEvaluateVisibility,
  strictResolveConfig,
  strictResolveValue,
} from "./applicationStrictExpressions";

const stableInputs = value => JSON.stringify(value, (_key, item) => item && typeof item === "object" && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);

/**
 * Runtime services for a deployed Application release.
 *
 * The client resolves pinned pages/widgets and executes release-scoped query
 * aliases. Query definitions, not page metadata, determine connector behavior.
 * It never receives a query ID or datasource ID.
 */
export function createRuntimeServices({
  manifest,
  pageAssetKey,
  routeID = null,
  executeQuery,
  getWorkflowStatus,
  cancelWorkflow,
  submitWorkflowInput,
  readListenerEvents,
  workflowRuns = new Map(),
}) {
  if (manifest?.mode !== "runtime" || manifest.executionEnabled !== true) {
    throw new Error("Unsupported application runtime manifest");
  }
  const page = manifest.pages?.[pageAssetKey];
  const strictExpressions = manifest.definition?.expressionMode === "safe-path";
  const routeReference = routeID ? { routeID } : {};
  const sources = page?.appPageConfig?.dataSources || [];
  const queryAliases = new Set(
    sources
      .filter((source) => source.type === "query")
      .map((source) => source.alias)
  );
  const workflowAliases = new Set(sources.filter(source => source.type === "workflow").map(source => source.alias));
  const listenerAliases = new Set(sources.filter(source => source.type === "listener").map(source => source.alias));
  const requireWorkflow = alias => {
    if (!workflowAliases.has(alias)) throw new Error("Data source is not a captured workflow in this release");
  };
  return {
    identity: `${manifest.runtime.releaseID}:${pageAssetKey}`,
    executionEnabled: true,
    actionsEnabled: manifest.actionsEnabled !== false,
    resolveWidget: async (resourceID) => {
      if (!Object.prototype.hasOwnProperty.call(manifest.widgets, resourceID)) {
        throw new Error("Widget is not part of this release");
      }
      return manifest.widgets[resourceID];
    },
    resolveConfig: strictExpressions ? strictResolveConfig : resolveConfig,
    resolveValue: strictExpressions ? strictResolveValue : resolveValue,
    evaluateVisibility: strictExpressions
      ? strictEvaluateVisibility
      : (condition, state) => evaluateVisibilityCondition(condition, state),
    runQuery: ({ alias, inputValues, signal }) => {
      if (!queryAliases.has(alias) || typeof executeQuery !== "function") {
        return Promise.reject(new Error("Data source is not a pinned query in this release"));
      }
      return executeQuery({ pageAssetKey, ...routeReference, alias, inputValues, signal });
    },
    startWorkflow: async ({ alias, inputValues, resume = false }) => {
      requireWorkflow(alias);
      const key = `${pageAssetKey}:${alias}`;
      const signature = stableInputs(inputValues || {});
      const previous = workflowRuns.get(key);
      if (resume && previous?.signature === signature) return previous.promise;
      const promise = Promise.resolve().then(() => executeQuery({ pageAssetKey, ...routeReference, alias, inputValues })).catch(error => {
        if (error.code === "APPLICATION_WORKFLOW_START_UNKNOWN" && error.details?.instanceID) return { instanceID: error.details.instanceID, startUncertain: true };
        if (workflowRuns.get(key)?.promise === promise) workflowRuns.delete(key);
        throw error;
      });
      workflowRuns.set(key, { signature, promise });
      return promise;
    },
    getWorkflowStatus: ({ alias, instanceID }) => {
      requireWorkflow(alias);
      if (typeof getWorkflowStatus !== "function") return Promise.reject(new Error("Workflow observation is unavailable in this runtime"));
      return getWorkflowStatus({ pageAssetKey, ...routeReference, alias, instanceID });
    },
    cancelWorkflow: ({ alias, instanceID }) => {
      requireWorkflow(alias);
      if (typeof cancelWorkflow !== "function") return Promise.reject(new Error("Workflow cancellation is unavailable in this runtime"));
      return cancelWorkflow({ pageAssetKey, ...routeReference, alias, instanceID });
    },
    submitWorkflowInput: ({ alias, instanceID, collectionRequestID, submittedData }) => {
      requireWorkflow(alias);
      if (typeof submitWorkflowInput !== "function") return Promise.reject(new Error("Workflow input is unavailable in this runtime"));
      return submitWorkflowInput({ pageAssetKey, ...routeReference, alias, instanceID, collectionRequestID, submittedData });
    },
    subscribeListener: ({ alias, onEvent, onError }) => {
      if (!listenerAliases.has(alias)) throw new Error("Data source is not a captured listener in this release");
      if (typeof readListenerEvents !== "function") throw new Error("Listener observation is unavailable in this runtime");
      return observeApplicationListener({ readEvents: ({ cursor, signal }) => readListenerEvents({ pageAssetKey, ...routeReference, alias, cursor, signal }), onEvent, onError });
    },
  };
}
