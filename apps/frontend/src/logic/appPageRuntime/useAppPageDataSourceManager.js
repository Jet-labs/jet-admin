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

/** State-tree namespace each data source type writes its results to. */
const getOutputNamespace = (type) =>
  type === "workflow" ? "workflows" : type === "listener" ? "listeners" : "queries";

export const useAppPageDataSourceManager = () => {
  const meta = useContext(AppPageMetaContext);
  const stateTree = useAppPageStateTree();
  const dispatch = useAppPageDispatch();

  const { dataSources = [], tenantID, pageID } = meta;

  // Latest state tree for the executor. Kept in a ref (not a closure) so
  // executeDataSource stays referentially stable across renders.
  const stateTreeRef = useRef(stateTree);
  // Previous state tree used exclusively by the reactive-diff effect below.
  const prevStateTreeRef = useRef(null);

  // Track in-flight request IDs to deduplicate
  const requestCounterRef = useRef({});
  // Track in-flight query requests per alias (prevents overlapping polls)
  const inFlightQueriesRef = useRef({});
  // Track polling intervals for cleanup
  const pollIntervalsRef = useRef({});
  // Track which data source aliases have been auto-fetched
  const fetchedAliasesRef = useRef(new Set());
  // Track active workflow/listener stream disconnectors for cleanup
  const activeDisconnectorsRef = useRef({});
  // Track socket rooms joined for page listeners
  const joinedListenerRoomsRef = useRef(new Set());

  // Keep the latest state tree accessible to the stable executor
  useEffect(() => {
    stateTreeRef.current = stateTree;
  }, [stateTree]);

  // Full teardown on unmount
  useEffect(() => {
    return () => {
      for (const alias of Object.keys(activeDisconnectorsRef.current)) {
        const disconnect = activeDisconnectorsRef.current[alias];
        if (typeof disconnect === "function") {
          disconnect();
        }
      }
      activeDisconnectorsRef.current = {};

      const socket = useSocketStore.getState().socket;
      if (socket) {
        for (const room of joinedListenerRoomsRef.current) {
          socket.emit("leave_room", room);
        }
      }
      joinedListenerRoomsRef.current.clear();

      for (const intervalID of Object.values(pollIntervalsRef.current)) {
        clearInterval(intervalID);
      }
      pollIntervalsRef.current = {};
    };
  }, []);

  /**
   * Disconnect any active stream/listener registered for an alias.
   */
  const disconnectAlias = useCallback((alias) => {
    if (typeof activeDisconnectorsRef.current[alias] === "function") {
      activeDisconnectorsRef.current[alias]();
    }
    delete activeDisconnectorsRef.current[alias];
  }, []);

  /**
   * Execute a single data source and store the result.
   */
  const executeDataSource = useCallback(
    async (dataSource, overrideInputs = {}) => {
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
          disconnectAlias(alias);

          const { disconnect } = executeWorkflowWithStreaming({
            tenantID,
            workflowID,
            inputValues: resolvedInputValues,
            alias,
            dispatch,
            isStale: () => requestCounterRef.current[alias] !== requestID,
          });

          // Store disconnector for cleanup
          activeDisconnectorsRef.current[alias] = disconnect;

          return null;
        } else if (isListener) {
          // Disconnect any existing listener stream for this alias
          disconnectAlias(alias);

          const socket = useSocketStore.getState().socket;
          if (!socket) {
            console.warn(`[ListenerStream] Shared socket not connected for "${alias}"`);
            dispatch(appPageActions.setListenerResult(alias, null));
            return null;
          }

          if (pageID) {
            const room = `listener:app_page:${pageID}`;
            if (!joinedListenerRoomsRef.current.has(room)) {
              socket.emit("join_room", room);
              joinedListenerRoomsRef.current.add(room);
            }
          }

          const handleListenerEvent = (payload) => {
            if (
              payload.channelName === `listener:${listenerID}` ||
              payload.channelName === channelName
            ) {
              dispatch(appPageActions.setListenerResult(alias, payload.data, null, payload.mode, payload.limit));
            }
          };

          socket.on("listener_event", handleListenerEvent);

          const disconnect = () => {
            socket.off("listener_event", handleListenerEvent);
          };

          activeDisconnectorsRef.current[alias] = disconnect;
          dispatch(appPageActions.setListenerResult(alias, null));

          return null;
        } else {
          // Skip this tick if a previous request for this alias is still
          // running (e.g. slow query with a short refetchInterval).
          if (inFlightQueriesRef.current[alias]) {
            return null;
          }

          dispatch(appPageActions.setQueryLoading(alias));

          inFlightQueriesRef.current[alias] = true;
          try {
            const result = await runDataQueryByIDAPI({
              tenantID,
              dataQueryID: queryID,
              inputValues: resolvedInputValues,
            });

            // Only store if this is still the latest request for this alias
            if (requestCounterRef.current[alias] === requestID) {
              dispatch(appPageActions.setQueryResult(alias, result));
            }
            return result;
          } finally {
            inFlightQueriesRef.current[alias] = false;
          }
        }
      } catch (error) {
        // Allow auto-fetch retries after a failure (the auto-fetch effect
        // only re-runs when the dataSources list changes, so no hot loop).
        fetchedAliasesRef.current.delete(alias);
        if (requestCounterRef.current[alias] === requestID) {
          if (isWorkflow) {
            dispatch(appPageActions.setWorkflowResult(alias, null, error));
            disconnectAlias(alias);
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
    [tenantID, pageID, dispatch, disconnectAlias]
  );

  // ============================================================
  // Teardown for sources removed/renamed while editing
  // ============================================================
  useEffect(() => {
    const activeAliases = new Set(
      dataSources.map((ds) => ds.alias).filter(Boolean)
    );

    for (const alias of Object.keys(activeDisconnectorsRef.current)) {
      if (!activeAliases.has(alias)) {
        disconnectAlias(alias);
      }
    }
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
        (ds.queryID || ds.workflowID || ds.listenerID) &&
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
    prevStateTreeRef.current = stateTree;
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
        if (!changedPaths.includes(path)) return false;
        // Ignore the source's own output — writing results back must not
        // re-trigger the same source (infinite refresh loop guard).
        return !(path === ownOutput || path.startsWith(`${ownOutput}.`));
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
      (ds) => ds.refetchInterval && ds.refetchInterval > 0 && ds.alias
    );

    for (const ds of pollingSources) {
      const intervalID = setInterval(() => {
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
