import { io } from "socket.io-client";
import { CONSTANTS } from "../constants";
import { firebaseAuth } from "../config/firebase";
import { useRuntimeStore } from "./stores/useRuntimeStore";

class ExecutionStreamService {
  constructor() {
    this.activeSockets = {};
  }

  async subscribe(instanceID, workflowID) {
    if (this.activeSockets[instanceID]) {
      return; // Already subscribed
    }

    try {
      const bearerToken = await firebaseAuth.currentUser?.getIdToken();
      const socket = io(CONSTANTS.SOCKET_HOST, {
        auth: { token: bearerToken },
      });

      this.activeSockets[instanceID] = socket;

      const store = useRuntimeStore.getState();

      // Initialize the execution state
      store.updateWorkflowExecution(instanceID, {
        status: 'RUNNING',
        logs: [
          { type: 'start', timestamp: Date.now(), label: 'Workflow Dispatched', message: `Instance ID: ${instanceID}` }
        ]
      });

      socket.emit("workflow_run_join", { runId: instanceID });
      store.updateWorkflowExecution(instanceID, {
        newLog: { type: 'info', label: 'Connected', message: 'Joined workflow execution room', timestamp: Date.now() }
      });

      socket.on("workflow_node_update", (data) => {
        const statusLower = String(data.status || '').toLowerCase();
        const isSuccess = statusLower === 'success' || statusLower === 'completed';
        const isRunning = statusLower === 'running';
        store.updateWorkflowExecution(instanceID, {
          newLog: {
            type: isSuccess ? 'node_complete' : isRunning ? 'node_start' : 'node_error',
            label: `Node: ${data.nodeID}`,
            message: isSuccess ? 'Completed successfully' : isRunning ? 'Running' : 'Execution failed',
            output: isSuccess ? data.output : undefined,
            error: !isSuccess && !isRunning ? data.error : undefined,
            timestamp: Date.now()
          }
        });
      });

      socket.on("workflow_status_update", (data) => {
        const isCompleted = data.status === "COMPLETED";
        
        store.updateWorkflowExecution(instanceID, {
          status: data.status,
          context: data.contextData || {},
          newLog: {
            type: isCompleted ? 'workflow_complete' : 'workflow_error',
            label: isCompleted ? 'Workflow Complete' : 'Workflow Failed',
            message: isCompleted ? 'All nodes executed successfully' : 'Execution terminated',
            timestamp: Date.now()
          }
        });

        // If completed, we must inject the final context data back into the workflowResult tree!
        if (isCompleted && workflowID) {
          // The widget engine uses workflowResults[workflowID].data to render the widget
          // The structure of workflow output usually comes from the final state or context
          useRuntimeStore.getState().setWorkflowResult(workflowID, data.contextData || data);
        } else if (data.status === "FAILED" && workflowID) {
          useRuntimeStore.getState().setWorkflowResult(workflowID, null, "Workflow Execution Failed");
        }

        // Cleanup
        socket.disconnect();
        delete this.activeSockets[instanceID];
      });

      socket.on("disconnect", () => {
        delete this.activeSockets[instanceID];
      });

    } catch (error) {
      console.error("[ExecutionStreamService] Subscription error:", error);
    }
  }

  unsubscribe(instanceID) {
    if (this.activeSockets[instanceID]) {
      this.activeSockets[instanceID].disconnect();
      delete this.activeSockets[instanceID];
    }
  }
}

export const executionStreamService = new ExecutionStreamService();
