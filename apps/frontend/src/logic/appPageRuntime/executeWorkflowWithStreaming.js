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

import { executeWorkflowAPI, cancelWorkflowAPI } from "../../data/apis/workflow";
import { observeWorkflowRun } from './observeWorkflowRun';
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
  onComplete,
  onError,
  onCancelError,
  runtimeServices,
  resume = false,
}) => {
  // Track listeners so we can tear them down
  let observer = null;
  let currentInstanceID = null;
  let cancelRequested = false;
  const cancelRun = instanceID => runtimeServices
    ? runtimeServices.cancelWorkflow({ alias, instanceID })
    : cancelWorkflowAPI({ tenantID, instanceID });
  const cancel = async () => {
    cancelRequested = true;
    if (currentInstanceID) return cancelRun(currentInstanceID);
    return { queued: true };
  };

  // Set by disconnect(). Guards against the race where a fast re-trigger or
  // unmount tears this stream down BEFORE the async body below registers its
  // socket listeners — without it those late-registered listeners would leak
  // forever (nothing would ever call .off on them).
  let disposed = false;

  const disconnect = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
  };

  // Fire-and-forget: kick off the API call + socket subscription
  Promise.resolve().then(async () => {
    if (disposed || isStale()) return;
    try {
      // 1. Mark as loading
      dispatch(appPageActions.setWorkflowLoading(alias));

      // 2. Execute the workflow API call
      const runRes = runtimeServices ? await runtimeServices.startWorkflow({ alias, inputValues, resume }) : await executeWorkflowAPI({
        tenantID,
        workflowID,
        inputValues,
      });

      const instanceID = runRes.instanceID;
      currentInstanceID = instanceID;
      if (!instanceID) {
        throw new Error("No instanceID returned from workflow execution");
      }

      // 3. Store initial result (still loading — streaming will update it)
      if (!isStale() && !disposed) {
        dispatch(appPageActions.setWorkflowResult(alias, runRes, null, true, instanceID));
      }

      if (disposed || isStale()) {
        if (cancelRequested) await cancelRun(instanceID).catch(() => {});
        return;
      }
      const onUpdate = (data) => {
        if (disposed || isStale()) return;
        if (Array.isArray(data.pendingDataCollectionRequests)) dispatch(appPageActions.setWorkflowRequests(alias, data.pendingDataCollectionRequests, instanceID));
        if (data.contextData) {
          dispatch(
            appPageActions.setWorkflowResult(alias, data.contextData, null, true, instanceID)
          );
        }
      };

      // --- Terminal status updates ---
      const onTerminal = (data) => {
        if (disposed || isStale()) {
          disconnect();
          return;
        }

        const finalData = data.contextData || data;

        if (data.status === "COMPLETED") {
          dispatch(
            appPageActions.setWorkflowResult(alias, finalData, null, false, instanceID)
          );
          if (typeof onComplete === "function") {
            onComplete(finalData, instanceID);
          }
          disconnect();
        } else if (data.status === "FAILED") {
          const message = data.error || "Workflow execution failed";
          dispatch(
            appPageActions.setWorkflowResult(
              alias,
              finalData,
              message,
              false,
              instanceID
            )
          );
          if (typeof onError === "function") {
            onError(message, finalData, instanceID);
          }
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
          if (typeof onError === "function") {
            onError("Workflow execution was stopped", finalData, instanceID);
          }
          disconnect();
        }
      };

      observer = observeWorkflowRun({ tenantID, instanceID, onUpdate, onTerminal,
        ...(runtimeServices ? { useSockets: false, getStatus: () => runtimeServices.getWorkflowStatus({ alias, instanceID }),
          onObservationError: error => {
            if (!disposed && !isStale() && [400, 401, 403, 404, 409].includes(error.status)) {
              disconnect();
              dispatch(appPageActions.setWorkflowResult(alias, null, error, false, instanceID));
              onError?.(error);
            }
          },
        } : {}),
        onRequest: request => {
          if (!disposed && !isStale()) dispatch(appPageActions.setWorkflowRequests(alias, [request], instanceID));
        },
      });
      if (cancelRequested) {
        try { await cancelRun(instanceID); }
        catch (error) { if (!disposed && !isStale()) onCancelError?.(error); }
      }
    } catch (error) {
      if (!isStale() && !disposed) {
        dispatch(appPageActions.setWorkflowResult(alias, null, error));
      }
      console.error(`[WorkflowStream] Failed to execute "${alias}":`, error);
      if (!disposed && !isStale() && typeof onError === "function") onError(error);
    }
  });

  return { disconnect, cancel };
};
