import { useEffect } from "react";
import { useRuntimeStore } from "../stores/useRuntimeStore";
import { useDataQueries } from "./useDataQueries";
import { useWidgets } from "./useWidgets";
import { useWorkflows } from "./useWorkflows";
import { useListeners } from "./useListeners";

/**
 * useRuntime Hook
 * 
 * Synchronizes the React Query catalog (dataQueries, workflows, widgets, listeners)
 * into the global Zustand useRuntimeStore, and returns the reactive execution state tree.
 * 
 * @param {string} tenantID 
 */
export const useRuntime = (tenantID) => {
  const { dataQueries } = useDataQueries(tenantID);
  const { widgets } = useWidgets(tenantID);
  const { workflows } = useWorkflows(tenantID);
  const { listeners } = useListeners(tenantID);

  const syncCatalog = useRuntimeStore((state) => state.syncCatalog);

  useEffect(() => {
    if (tenantID) {
      syncCatalog(tenantID, dataQueries, workflows, widgets, listeners);
    }
  }, [tenantID, dataQueries, workflows, widgets, listeners, syncCatalog]);

  return {
    stateTree: useRuntimeStore((state) => state.stateTree),
    resolveWidgetConfig: useRuntimeStore((state) => state.resolveWidgetConfig),
    getDependencies: useRuntimeStore((state) => state.getDependencies),
    setQueryResult: useRuntimeStore((state) => state.setQueryResult),
    setQueryLoading: useRuntimeStore((state) => state.setQueryLoading),
    setWorkflowResult: useRuntimeStore((state) => state.setWorkflowResult),
    setWorkflowLoading: useRuntimeStore((state) => state.setWorkflowLoading),
    setWidgetState: useRuntimeStore((state) => state.setWidgetState),
    setListenerData: useRuntimeStore((state) => state.setListenerData),
  };
};
