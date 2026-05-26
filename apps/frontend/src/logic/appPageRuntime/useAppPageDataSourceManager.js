/**
 * useAppPageDataSourceManager
 *
 * Manages page-level data sources — handles auto-fetch on mount,
 * reactive re-fetch when dependencies change, polling intervals,
 * and manual trigger support.
 *
 * This replaces the old widget-level data fetching with unified
 * page-level data orchestration.
 */

import { useEffect, useRef, useCallback, useContext } from "react";
import { AppPageMetaContext } from "./AppPageRuntimeProvider";
import { useAppPageStateTree } from "./useAppPageStateTree";
import { useAppPageDispatch } from "./useAppPageDispatch";
import { appPageActions } from "./appPageActions";
import { getChangedPaths } from "./appPageExpressionEngine";
import { runDataQueryByIDAPI } from "../../data/apis/dataQuery";
import { executeWorkflowWithStreaming } from "./executeWorkflowWithStreaming";
import { resolveConfig } from "../evaluationEngine";

export const useAppPageDataSourceManager = () => {
  const meta = useContext(AppPageMetaContext);
  const stateTree = useAppPageStateTree();
  const dispatch = useAppPageDispatch();

  const { dataSources = [], tenantID } = meta;

  // Track previous state tree for reactive change detection
  const prevStateTreeRef = useRef(stateTree);
  // Track in-flight request IDs to deduplicate
  const requestCounterRef = useRef({});
  // Track polling intervals for cleanup
  const pollIntervalsRef = useRef({});
  // Track which data source aliases have been auto-fetched
  const fetchedAliasesRef = useRef(new Set());
  // Track active workflow streaming disconnectors for cleanup
  const activeDisconnectorsRef = useRef({});

  // Cleanup active workflow streams on unmount
  useEffect(() => {
    return () => {
      for (const alias of Object.keys(activeDisconnectorsRef.current)) {
        if (typeof activeDisconnectorsRef.current[alias] === "function") {
          activeDisconnectorsRef.current[alias]();
        }
      }
      activeDisconnectorsRef.current = {};
    };
  }, []);

  /**
   * Execute a single data source and store the result.
   */
  const executeDataSource = useCallback(
    async (dataSource, overrideArgs = {}) => {
      const { alias, type, queryID, workflowID, inputArgs = {} } = dataSource;

      // Increment request counter for deduplication
      const requestID = (requestCounterRef.current[alias] || 0) + 1;
      requestCounterRef.current[alias] = requestID;

      // Resolve any {{ }} expressions in inputArgs against current state
      const resolvedInputArgs = resolveConfig(
        { ...inputArgs, ...overrideArgs },
        stateTree
      );

      // If any inputArg template resolved to undefined/null, it means a
      // referenced variable/path doesn't exist yet (e.g. {{variables.skip}}
      // before the table widget sets initial pagination variables).
      // Skip execution — the reactive system will re-trigger once the
      // variables are set, avoiding SQL errors like "OFFSET  LIMIT".
      const hasUnresolvedArgs = Object.keys(inputArgs).length > 0 &&
        Object.entries(resolvedInputArgs).some(
          ([, val]) => val === undefined || val === null
        );
      if (hasUnresolvedArgs) {
        console.log(
          `[DataSourceManager] Skipping "${alias}" — has unresolved template args`,
          resolvedInputArgs
        );
        return null;
      }

      const isWorkflow = type === "workflow";

      try {
        if (isWorkflow) {
          // Disconnect any existing stream for this alias
          if (typeof activeDisconnectorsRef.current[alias] === "function") {
            activeDisconnectorsRef.current[alias]();
          }

          const { disconnect } = executeWorkflowWithStreaming({
            tenantID,
            workflowID,
            inputArgs: resolvedInputArgs,
            alias,
            dispatch,
            isStale: () => requestCounterRef.current[alias] !== requestID,
          });

          // Store disconnector for cleanup
          activeDisconnectorsRef.current[alias] = disconnect;

          return null;
        } else {
          dispatch(appPageActions.setQueryLoading(alias));

          const result = await runDataQueryByIDAPI({
            tenantID,
            dataQueryID: queryID,
            inputArgs: resolvedInputArgs,
          });

          // Only store if this is still the latest request for this alias
          if (requestCounterRef.current[alias] === requestID) {
            dispatch(appPageActions.setQueryResult(alias, result));
          }
          return result;
        }
      } catch (error) {
        if (requestCounterRef.current[alias] === requestID) {
          if (isWorkflow) {
            dispatch(appPageActions.setWorkflowResult(alias, null, error));
            if (typeof activeDisconnectorsRef.current[alias] === "function") {
              activeDisconnectorsRef.current[alias]();
            }
          } else {
            dispatch(appPageActions.setQueryResult(alias, null, error));
          }
        }
        console.error(
          `[DataSourceManager] Failed to execute "${alias}":`,
          error
        );
        return null;
      }
    },
    [tenantID, stateTree, dispatch]
  );

  // ============================================================
  // Auto-fetch on mount & when new sources are added
  // ============================================================
  useEffect(() => {
    // Keep fetchedAliasesRef in sync with current dataSources to allow re-fetching if a deleted alias is re-added
    const currentAliases = new Set(dataSources.map((ds) => ds.alias).filter(Boolean));
    for (const alias of fetchedAliasesRef.current) {
      if (!currentAliases.has(alias)) {
        fetchedAliasesRef.current.delete(alias);
      }
    }

    if (dataSources.length === 0) return;

    const autoSources = dataSources.filter(
      (ds) =>
        (ds.triggerMode === "auto" || ds.triggerMode === "reactive") &&
        (ds.queryID || ds.workflowID) &&
        ds.alias &&
        !fetchedAliasesRef.current.has(ds.alias)
    );

    if (autoSources.length === 0) return;

    for (const ds of autoSources) {
      fetchedAliasesRef.current.add(ds.alias);
      executeDataSource(ds);
    }
  }, [dataSources, executeDataSource]);

  // ============================================================
  // Reactive re-fetch when dependencies change
  // ============================================================
  useEffect(() => {
    const prevTree = prevStateTreeRef.current;
    if (!prevTree || prevTree === stateTree) return;

    const changedPaths = getChangedPaths(prevTree, stateTree);
    if (changedPaths.length === 0) return;

    const reactiveSources = dataSources.filter(
      (ds) =>
        ds.triggerMode === "reactive" &&
        Array.isArray(ds.refreshOn) &&
        ds.refreshOn.length > 0
    );

    for (const ds of reactiveSources) {
      const shouldRefresh = ds.refreshOn.some((path) =>
        changedPaths.includes(path)
      );
      if (shouldRefresh) {
        executeDataSource(ds);
      }
    }

    prevStateTreeRef.current = stateTree;
  }, [stateTree, dataSources, executeDataSource]);

  // ============================================================
  // Polling intervals
  // ============================================================
  useEffect(() => {
    // Clear existing intervals
    for (const intervalID of Object.values(pollIntervalsRef.current)) {
      clearInterval(intervalID);
    }
    pollIntervalsRef.current = {};

    const pollingSources = dataSources.filter(
      (ds) => ds.refetchInterval && ds.refetchInterval > 0
    );

    for (const ds of pollingSources) {
      const intervalID = setInterval(() => {
        executeDataSource(ds);
      }, ds.refetchInterval);
      pollIntervalsRef.current[ds.alias] = intervalID;
    }

    // Cleanup on unmount
    return () => {
      for (const intervalID of Object.values(pollIntervalsRef.current)) {
        clearInterval(intervalID);
      }
      pollIntervalsRef.current = {};
    };
  }, [dataSources, executeDataSource]);

  return { executeDataSource };
};
