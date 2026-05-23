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
import { testDataQueryByIDAPI } from "../../data/apis/dataQuery";
import { executeWorkflowAPI } from "../../data/apis/workflow";
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
  // Track whether initial auto-fetch has been done
  const initialFetchDoneRef = useRef(false);

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

      dispatch(appPageActions.setQueryLoading(alias));

      try {
        let result;
        if (type === "workflow") {
          result = await executeWorkflowAPI({
            tenantID,
            workflowID,
            inputArgs: resolvedInputArgs,
          });
        } else {
          result = await testDataQueryByIDAPI({
            tenantID,
            dataQueryID: queryID,
            inputArgs: resolvedInputArgs,
          });
        }

        // Only store if this is still the latest request for this alias
        if (requestCounterRef.current[alias] === requestID) {
          dispatch(appPageActions.setQueryResult(alias, result));
        }
        return result;
      } catch (error) {
        if (requestCounterRef.current[alias] === requestID) {
          dispatch(appPageActions.setQueryResult(alias, null, error));
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
  // Auto-fetch on mount
  // ============================================================
  useEffect(() => {
    if (initialFetchDoneRef.current) return;
    if (dataSources.length === 0) return;

    initialFetchDoneRef.current = true;

    const autoSources = dataSources.filter(
      (ds) => ds.triggerMode === "auto" || ds.triggerMode === "reactive"
    );

    for (const ds of autoSources) {
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
