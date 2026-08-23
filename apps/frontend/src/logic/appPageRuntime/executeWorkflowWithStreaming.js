/**
 * executeWorkflowWithStreaming
 *
 * Shared fire-and-forget utility for executing a workflow and subscribing
 * to its real-time socket updates. Context data streams into the AppPage
 * state tree via dispatches as each node completes — the caller does NOT
 * need to await completion (workflows can be long-running or never finish).
 *
 * Used by:
 * - useAppPageDataSourceManager (auto/reactive data sources)
 * - useWidgetEventHandlers (EXECUTE_QUERY actions on workflow sources)
 * - appPageDataSourcesEditor (editor "Play" button)
 *
 * Returns: { disconnect: Function }
 *   - disconnect: tears down socket listeners (call on cleanup or re-run)
 */

import { executeWorkflowAPI } from "../../data/apis/workflow";
import { useSocketStore } from "../stores/useSocketStore";
import { appPageActions } from "./appPageActions";

/**
 * @param {object} params
 * @param {string} params.tenantID
 * @param {string} params.workflowID
 * @param {object} params.inputValues        - Resolved input values
 * @param {string} params.alias            - Data source alias for state storage
 * @param {Function} params.dispatch       - AppPage dispatch function
 * @param {Function} [params.isStale]      - Optional guard: returns true if this request
 *                                           has been superseded (for deduplication)
 * @param {Function} [params.onError]      - Optional error callback
 * @returns {{ disconnect: Function }}
 */
export const executeWorkflowWithStreaming = ({
  tenantID,
  workflowID,
  inputValues,
  alias,
  dispatch,
  isStale = () => false,
  onError,
}) => {
  // Track listeners so we can tear them down
  let nodeUpdateListener = null;
  let statusUpdateListener = null;

  // Set by disconnect(). Guards against the race where a fast re-trigger or
  // unmount tears this stream down BEFORE the async body below registers its
  // socket listeners — without it those late-registered listeners would leak
  // forever (nothing would ever call .off on them).
  let disposed = false;

  const disconnect = () => {
    if (disposed) return;
    disposed = true;
    const socket = useSocketStore.getState().socket;
    if (socket) {
      if (nodeUpdateListener) socket.off("workflow_node_update", nodeUpdateListener);
      if (statusUpdateListener) socket.off("workflow_status_update", statusUpdateListener);
    }
    nodeUpdateListener = null;
    statusUpdateListener = null;
  };

  // Fire-and-forget: kick off the API call + socket subscription
  (async () => {
    try {
      // 1. Mark as loading
      dispatch(appPageActions.setWorkflowLoading(alias));

      // 2. Execute the workflow API call
      const runRes = await executeWorkflowAPI({
        tenantID,
        workflowID,
        inputValues,
      });

      const instanceID = runRes.instanceID;
      if (!instanceID) {
        throw new Error("No instanceID returned from workflow execution");
      }

      // 3. Store initial result (still loading — streaming will update it)
      if (!isStale() && !disposed) {
        dispatch(appPageActions.setWorkflowResult(alias, runRes, null, true, instanceID));
      }

      // 4. Get the shared socket and subscribe to updates
      const socket = useSocketStore.getState().socket;
      if (!socket) {
        console.warn(`[WorkflowStream] Shared socket not connected for "${alias}"`);
        // No socket — mark as done with just the API response
        if (!isStale() && !disposed) {
          dispatch(appPageActions.setWorkflowResult(alias, runRes, null, false, instanceID));
        }
        return;
      }

      // The stream may have been disconnected while awaiting the API call.
      if (disposed) return;

      // Join the room for this workflow run
      socket.emit("workflow_run_join", { runId: instanceID });

      // --- Node-level context updates (streaming) ---
      nodeUpdateListener = (data) => {
        if (data.instanceID !== instanceID) return;
        if (isStale()) return;
        if (data.contextData) {
          dispatch(
            appPageActions.setWorkflowResult(alias, data.contextData, null, true, instanceID)
          );
        }
      };

      // --- Terminal status updates ---
      statusUpdateListener = (data) => {
        if (data.instanceID !== instanceID) return;
        if (isStale()) {
          disconnect();
          return;
        }

        const finalData = data.contextData || data;

        if (data.status === "COMPLETED") {
          dispatch(
            appPageActions.setWorkflowResult(alias, finalData, null, false, instanceID)
          );
          disconnect();
        } else if (data.status === "FAILED") {
          dispatch(
            appPageActions.setWorkflowResult(
              alias,
              finalData,
              data.error || "Workflow execution failed",
              false,
              instanceID
            )
          );
          disconnect();
        } else if (data.status === "STOPPED" || data.status === "CANCELLED") {
          dispatch(
            appPageActions.setWorkflowResult(
              alias,
              finalData,
              "Workflow execution was stopped",
              false,
              instanceID
            )
          );
          disconnect();
        }
      };

      // Register only if still connected — disconnect() may have been called
      // while the listeners were being defined above.
      if (disposed) return;
      socket.on("workflow_node_update", nodeUpdateListener);
      socket.on("workflow_status_update", statusUpdateListener);
    } catch (error) {
      if (!isStale() && !disposed) {
        dispatch(appPageActions.setWorkflowResult(alias, null, error));
      }
      console.error(`[WorkflowStream] Failed to execute "${alias}":`, error);
      if (onError) onError(error);
    }
  })();

  return { disconnect };
};
