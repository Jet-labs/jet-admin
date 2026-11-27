/**
 * useAppPageDataSourceManager
 *
 * Manages page-level data sources — handles auto-fetch on mount,
 * reactive re-fetch when dependencies change, polling intervals,
 * and manual trigger support.
 *
 * This replaces the old widget-level data fetching with unified
 * page-level data orchestration.
 *
 * Stability notes:
 * - executeDataSource is kept referentially stable (state tree is read
 *   through a ref) so polling intervals are NOT torn down/recreated on
 *   every state change.
 * - Streams/listeners whose data source was removed while editing are
 *   disconnected immediately, not just on unmount.
 * - Reactive refreshes ignore a source's own output namespace so a source
 *   configured with its own alias in refreshOn cannot loop forever.
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
import { useSocketStore } from "../stores/useSocketStore";
import { getQueryCoordinator } from './queryCoordinator';
import { retainSocketRoom } from './socketRoomLease';

/** State-tree namespace each data source type writes its results to. */
const getOutputNamespace = (type) =>
  type === "workflow" ? "workflows" : type === "listener" ? "listeners" : "queries";

export const useAppPageDataSourceManager = () => {
  const meta = useContext(AppPageMetaContext);
  const stateTree = useAppPageStateTree();
  const dispatch = useAppPageDispatch();

  const { dataSources = [], tenantID, pageID, runtimeServices } = meta;

  // Latest state tree for the executor. Kept in a ref (not a closure) so
  // executeDataSource stays referentially stable across renders.
  const stateTreeRef = useRef(stateTree);
  // Previous state tree used exclusively by the reactive-diff effect below.
  const prevStateTreeRef = useRef(null);

  // Track in-flight request IDs to deduplicate
  const requestCounterRef = useRef({});
  // Track in-flight query requests per alias (prevents overlapping polls)
  const queryCoordinator = getQueryCoordinator(dispatch);
  const sourceSignaturesRef = useRef({});
  // Track polling intervals for cleanup
  const pollIntervalsRef = useRef({});
  // Track which data source aliases have been auto-fetched
  const fetchedAliasesRef = useRef(new Set());
  // Track active workflow/listener stream disconnectors for cleanup
  const activeDisconnectorsRef = useRef({});
  // Bounded auto-fetch retry state (transient backend/network failures).
  const retryTimersRef = useRef({});
  const retryAttemptsRef = useRef({});
  const isMountedRef = useRef(true);
  const executeDataSourceRef = useRef(null);

  // Keep the latest state tree accessible to the stable executor
  useEffect(() => {
    stateTreeRef.current = stateTree;
  }, [stateTree]);

  // Full teardown on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      fetchedAliasesRef.current.clear();
      queryCoordinator.retireAll();
      for (const alias of Object.keys(requestCounterRef.current)) requestCounterRef.current[alias] += 1;

      for (const timer of Object.values(retryTimersRef.current)) {
        clearTimeout(timer);
      }
      retryTimersRef.current = {};

      for (const alias of Object.keys(activeDisconnectorsRef.current)) {
        const disconnect = activeDisconnectorsRef.current[alias];
        if (typeof disconnect === "function") {
          disconnect();
        }
      }
      activeDisconnectorsRef.current = {};

      for (const intervalID of Object.values(pollIntervalsRef.current)) {
        clearInterval(intervalID);
      }
      pollIntervalsRef.current = {};
    };
  }, [queryCoordinator]);

  /**
   * Disconnect any active stream/listener registered for an alias.
   */
  const disconnectAlias = useCallback((alias, invalidate = true) => {
    queryCoordinator.retire(alias);
    if (invalidate) requestCounterRef.current[alias] = (requestCounterRef.current[alias] || 0) + 1;
    if (typeof activeDisconnectorsRef.current[alias] === "function") {
      activeDisconnectorsRef.current[alias]();
    }
    delete activeDisconnectorsRef.current[alias];

    if (retryTimersRef.current[alias]) {
      clearTimeout(retryTimersRef.current[alias]);
      delete retryTimersRef.current[alias];
    }
    delete retryAttemptsRef.current[alias];
  }, [queryCoordinator]);

  /**
   * Execute a single data source and store the result.
   */
  const executeDataSource = useCallback(
    async (dataSource, overrideInputs = {}, opts = {}) => {
      if (!isMountedRef.current) return null;
      const { alias, type, queryID, workflowID, listenerID, channelName, inputValues = {} } = dataSource;

      // Increment request counter for deduplication
      const requestID = (requestCounterRef.current[alias] || 0) + 1;
      requestCounterRef.current[alias] = requestID;

      // Resolve any {{ }} expressions in inputValues against current state
      const resolvedInputValues = resolveConfig(
        { ...inputValues, ...overrideInputs },
        stateTreeRef.current
      );

      // Skip execution only when an inputValue template resolved to
      // UNDEFINED — i.e. the referenced path doesn't exist yet (e.g.
      // {{variables.skip}} before the table widget sets initial pagination).
      // The reactive system will re-trigger once it appears, avoiding SQL
      // errors like "OFFSET  LIMIT".
      // null is NOT treated as unresolved: variables without a default are
      // initialised to null, and that is a legitimate value (e.g. an empty
      // search filter) — treating it as missing used to block reactive
      // auto-fetch forever.
      const hasUnresolvedInputs = Object.keys(inputValues).length > 0 &&
        Object.entries(resolvedInputValues).some(
          ([, val]) => val === undefined
        );
      if (hasUnresolvedInputs) {
        // Release the alias so a later auto-fetch attempt can retry once
        // the missing variable appears (e.g. set by a widget after mount).
        fetchedAliasesRef.current.delete(alias);
        return null;
      }

      const isWorkflow = type === "workflow";
      const isListener = type === "listener";

      try {
        if (isWorkflow) {
          // Disconnect any existing stream for this alias
          disconnectAlias(alias, false);
          if (runtimeServices && typeof runtimeServices.startWorkflow !== "function") {
            throw new Error("Workflow execution is unavailable in this runtime");
          }

          const { disconnect } = executeWorkflowWithStreaming({
            tenantID,
            workflowID,
            inputValues: resolvedInputValues,
            alias,
            dispatch,
            runtimeServices: runtimeServices || undefined,
            resume: true,
            isStale: () => requestCounterRef.current[alias] !== requestID,
          });

          // Store disconnector for cleanup
          activeDisconnectorsRef.current[alias] = disconnect;

          return null;
        } else if (isListener) {
          // Disconnect any existing listener stream for this alias
          disconnectAlias(alias, false);

          if (runtimeServices) {
            if (!runtimeServices.subscribeListener) throw new Error("Listener observation is unavailable in this runtime");
            const { disconnect } = runtimeServices.subscribeListener({ alias,
              onEvent: event => {
                if (isMountedRef.current && requestCounterRef.current[alias] === requestID) dispatch(appPageActions.setListenerResult(alias, event.data, null, event.mode, event.limit));
              },
              onError: error => {
                if (isMountedRef.current && requestCounterRef.current[alias] === requestID) dispatch(appPageActions.setListenerResult(alias, null, error));
              },
            });
            activeDisconnectorsRef.current[alias] = disconnect;
            return null;
          }

          const handleListenerEvent = (payload) => {
            if (!isMountedRef.current || requestCounterRef.current[alias] !== requestID) return;
            if (
              payload.channelName === `listener:${listenerID}` ||
              payload.channelName === channelName
            ) {
              dispatch(appPageActions.setListenerResult(alias, payload.data, null, payload.mode, payload.limit));
            }
          };

          let boundSocket = null;
          let releaseRoom = () => {};
          const bind = socket => {
            if (socket === boundSocket) return;
            boundSocket?.off('listener_event', handleListenerEvent);
            releaseRoom();
            boundSocket = socket;
            releaseRoom = () => {};
            if (!socket) return;
            socket.on('listener_event', handleListenerEvent);
            if (pageID) releaseRoom = retainSocketRoom(socket, `listener:app_page:${pageID}`);
          };
          const unsubscribe = useSocketStore.subscribe?.(state => bind(state.socket));
          bind(useSocketStore.getState().socket);
          activeDisconnectorsRef.current[alias] = () => {
            unsubscribe?.();
            boundSocket?.off('listener_event', handleListenerEvent);
            releaseRoom();
          };
          dispatch(appPageActions.setListenerResult(alias, null));

          return null;
        } else {
          const runtimeQuery = runtimeServices?.runQuery;
          const result = await queryCoordinator.run({
            alias, tenantID, queryID, inputValues: resolvedInputValues,
            execute: runtimeQuery
              ? ({ inputValues, signal }) =>
                  runtimeQuery({ alias, inputValues, signal })
              : runDataQueryByIDAPI,
          });

          // A successful auto-fetch resets the retry backoff.
          delete retryAttemptsRef.current[alias];
          if (retryTimersRef.current[alias]) {
            clearTimeout(retryTimersRef.current[alias]);
            delete retryTimersRef.current[alias];
          }

          return result;
        }
      } catch (error) {
        const isCanceled =
          error?.code === "ERR_CANCELED" ||
          error?.name === "CanceledError" ||
          error?.name === "AbortError";
        if (isCanceled) return null;

        // Allow auto-fetch retries after a failure (the auto-fetch effect
        // only re-runs when the dataSources list changes, so no hot loop).
        fetchedAliasesRef.current.delete(alias);
        if (requestCounterRef.current[alias] === requestID) {
          if (isWorkflow) {
            dispatch(appPageActions.setWorkflowResult(alias, null, error));
            disconnectAlias(alias);
          }
        }

        // Bounded retry with exponential backoff for transient failures.
        // Only auto-fetches retry; manual/polling calls try again on their
        // own cadence.
        if (opts.auto && !isWorkflow && !isListener && isMountedRef.current) {
          const attempts = (retryAttemptsRef.current[alias] || 0) + 1;
          retryAttemptsRef.current[alias] = attempts;
          if (attempts <= 3) {
            const delay = Math.min(30000, 5000 * (2 ** (attempts - 1)));
            if (retryTimersRef.current[alias]) {
              clearTimeout(retryTimersRef.current[alias]);
            }
            retryTimersRef.current[alias] = setTimeout(() => {
              if (isMountedRef.current) {
                executeDataSourceRef.current?.(dataSource, {}, { auto: true });
              }
            }, delay);
          }
        }

        console.error(
          `[DataSourceManager] Failed to execute "${alias}":`,
          error
        );
        return null;
      }
    },
    [tenantID, pageID, dispatch, disconnectAlias, queryCoordinator, runtimeServices]
  );

  useEffect(() => {
    executeDataSourceRef.current = executeDataSource;
  }, [executeDataSource]);

  // ============================================================
  // Teardown for sources removed/renamed while editing
  // ============================================================
  useEffect(() => {
    const activeAliases = new Set(
      dataSources.map((ds) => ds.alias).filter(Boolean)
    );

    const trackedAliases = new Set([
      ...Object.keys(sourceSignaturesRef.current),
      ...Object.keys(activeDisconnectorsRef.current),
      ...Object.keys(retryTimersRef.current),
    ]);

    for (const alias of trackedAliases) {
      const source = dataSources.find(ds => ds.alias === alias);
      const signature = source ? JSON.stringify(source) : null;
      if (!activeAliases.has(alias) || sourceSignaturesRef.current[alias] !== signature) {
        disconnectAlias(alias);
        fetchedAliasesRef.current.delete(alias);
      }
    }
    sourceSignaturesRef.current = Object.fromEntries(dataSources.map(ds => [ds.alias, JSON.stringify(ds)]));
  }, [dataSources, disconnectAlias]);

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
        (ds.queryID || ds.workflowID || ds.listenerID ||
          (runtimeServices && ((ds.type === "query" && runtimeServices.runQuery) ||
            (ds.type === "workflow" && runtimeServices.startWorkflow) ||
            (ds.type === "listener" && runtimeServices.subscribeListener)))) &&
        ds.alias &&
        !fetchedAliasesRef.current.has(ds.alias)
    );

    if (autoSources.length === 0) return;

    for (const ds of autoSources) {
      fetchedAliasesRef.current.add(ds.alias);
      executeDataSource(ds, {}, { auto: true });
    }
  }, [dataSources, executeDataSource]);

  // ============================================================
  // Reactive re-fetch when dependencies change
  // ============================================================
  useEffect(() => {
    const prevTree = prevStateTreeRef.current;
    prevStateTreeRef.current = stateTree;
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
      const ownOutput = `${getOutputNamespace(ds.type)}.${ds.alias}`;
      const shouldRefresh = ds.refreshOn.some((path) => {
        path = path.replace(/^state\./, '').replace(/\[['"]?([^\]'"\s]+)['"]?\]/g, '.$1');
        // Ignore the source's own output — writing results back must not
        // re-trigger the same source (infinite refresh loop guard).
        return changedPaths.some(changed => {
          if (changed === ownOutput || changed.startsWith(`${ownOutput}.`)) return false;
          return changed === path || changed.startsWith(`${path}.`) || path.startsWith(`${changed}.`);
        });
      });
      if (shouldRefresh) {
        executeDataSource(ds);
      }
    }
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
      (ds) => ds.type !== "listener" && ds.refetchInterval && ds.refetchInterval > 0 && ds.alias
    );

    for (const ds of pollingSources) {
      const intervalID = setInterval(() => {
        // Hidden tabs must not keep hammering the backend. The next visible
        // tick picks up naturally; no catch-up burst is triggered.
        if (typeof document !== "undefined" && document.visibilityState === "hidden") {
          return;
        }
        executeDataSource(ds);
      }, ds.refetchInterval);
      pollIntervalsRef.current[ds.alias] = intervalID;
    }

    // Cleanup on unmount / when sources change
    return () => {
      for (const intervalID of Object.values(pollIntervalsRef.current)) {
        clearInterval(intervalID);
      }
      pollIntervalsRef.current = {};
    };
  }, [dataSources, executeDataSource]);

  return { executeDataSource };
};
