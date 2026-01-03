import { IoClose } from "react-icons/io5";
import { useParams } from "react-router-dom";
import React, { useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useMutation } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { executeWorkflowAPI } from "../../../data/apis/workflow";
import { displayError, displaySuccess } from "../../../utils/notification";
import { WorkflowConsole } from "./workflowConsole";

export const WorkflowTestingPanel = ({
  selectedWorkflowForTesting,
  setSelectedWorkflowForTesting,
}) => {
  WorkflowTestingPanel.propTypes = {
    selectedWorkflowForTesting: PropTypes.object,
    setSelectedWorkflowForTesting: PropTypes.func.isRequired,
  };

  const { tenantID } = useParams();
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const socketRef = useRef(null);

  const isOpen = selectedWorkflowForTesting ? true : false;

  const _handleClose = () => {
    // Disconnect socket if open
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSelectedWorkflowForTesting(null);
    setLogs([]);
    setIsRunning(false);
  };

  const _handleClearLogs = () => {
    setLogs([]);
  };

  // Add a log entry
  const addLog = useCallback((type, label, message, extra = {}) => {
    setLogs((prev) => [...prev, { type, label, message, timestamp: Date.now(), ...extra }]);
  }, []);

  // Execute workflow mutation
  const { isPending: isExecuting, mutate: executeWorkflow } = useMutation({
    mutationFn: ({ inputParams }) => {
      return executeWorkflowAPI({
        tenantID,
        workflowID: selectedWorkflowForTesting.workflowID,
        inputParams,
      });
    },
    retry: false,
    onSuccess: async (data) => {
      const instanceID = data.instanceID;
      addLog('start', 'Workflow started', `Instance ID: ${instanceID.substring(0, 8)}...`);

      try {
        // Import socket.io and connect
        const socketModule = await import("socket.io-client");
        const { CONSTANTS } = await import("../../../constants");
        const { firebaseAuth } = await import("../../../config/firebase");

        const bearerToken = await firebaseAuth.currentUser?.getIdToken();
        const socket = socketModule.io(CONSTANTS.SOCKET_HOST, {
          auth: { token: bearerToken }
        });

        // Store socket reference for cleanup
        socketRef.current = socket;

        // Join the workflow run room
        socket.emit("workflow_run_join", { runId: instanceID });
        addLog('info', 'Connected', 'Joined workflow execution room');

        // Listen for node updates from backend
        socket.on("workflow_node_update", (nodeData) => {
          const nodeId = nodeData.nodeID;
          if (nodeId && nodeData.status) {
            if (nodeData.status === 'success') {
              addLog('node_complete', `Node completed`, nodeData.nodeType || 'Node', {
                nodeId,
                output: nodeData.output
              });
            } else if (nodeData.status === 'error' || nodeData.status === 'failed') {
              addLog('node_error', `Node failed`, nodeData.nodeType || 'Node', {
                nodeId,
                error: nodeData.error
              });
            } else if (nodeData.status === 'running' || nodeData.status === 'started') {
              addLog('node_start', `Node started`, nodeData.nodeType || 'Node', { nodeId });
            }
          }
        });

        // Listen for workflow status update (completion/failure)
        socket.on("workflow_status_update", (statusData) => {
          if (statusData.status === "COMPLETED") {
            addLog('workflow_complete', 'Workflow completed', 'All nodes executed successfully', {
              output: statusData.contextData
            });
            setIsRunning(false);
            displaySuccess("Workflow executed successfully!");
            socket.disconnect();
            socketRef.current = null;
          } else if (statusData.status === "FAILED") {
            addLog('workflow_error', 'Workflow failed', 'Execution terminated with errors', {
              error: statusData.error
            });
            setIsRunning(false);
            socket.disconnect();
            socketRef.current = null;
          }
        });

        // Timeout after 2 minutes
        const timeout = setTimeout(() => {
          addLog('info', 'Timeout', 'Workflow execution timed out after 2 minutes');
          setIsRunning(false);
          if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
          }
        }, 120000);

        // Cleanup on disconnect
        socket.on("disconnect", () => {
          clearTimeout(timeout);
        });

      } catch (socketError) {
        addLog('workflow_error', 'Connection error', socketError.message || String(socketError));
        setIsRunning(false);
      }
    },
    onError: (error) => {
      addLog('workflow_error', 'Failed to start workflow', error.message || String(error));
      setIsRunning(false);
      displayError(error);
    },
  });

  const _handleTestWorkflow = () => {
    // Disconnect any existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setLogs([]);
    setIsRunning(true);
    
    // For now, start with empty params - you could add a dialog for args similar to DataQueryArgsForm
    const inputParams = {};
    executeWorkflow({ inputParams });
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out ${
          isOpen
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={_handleClose}
        style={{
          zIndex: 1000,
        }}
      ></div>
      <div
        className={`fixed right-0 top-0 h-full w-1/3 bg-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          zIndex: 1100,
        }}
      >
        <div className="p-2 h-full flex flex-col">
          <div className="flex flex-row justify-between items-center mb-2">
            <button
              type="button"
              onClick={_handleClose}
              className="focus:outline-none text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-1 rounded border border-slate-300 transition-colors w-fit"
            >
              <IoClose className="text-base text-slate-700" />
            </button>
            
            {selectedWorkflowForTesting && (
              <button
                onClick={_handleTestWorkflow}
                disabled={isExecuting || isRunning}
                type="button"
                className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-xs text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isExecuting || isRunning) && (
                  <CircularProgress className="!mr-2" size={14} color="inherit" />
                )}
                {isExecuting ? "Starting..." : isRunning ? "Running..." : "Test Workflow"}
              </button>
            )}
          </div>
          
          {selectedWorkflowForTesting && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="mb-2 p-2 bg-slate-50 rounded border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700">
                  {selectedWorkflowForTesting.title}
                </h3>
                {selectedWorkflowForTesting.workflowOptions?.args?.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Has {selectedWorkflowForTesting.workflowOptions.args.length} input parameter(s)
                  </p>
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <WorkflowConsole
                  logs={logs}
                  isRunning={isRunning}
                  onClear={_handleClearLogs}
                  className="h-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
