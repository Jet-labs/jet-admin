
import { useState, useRef, useCallback, useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import { testWorkflowAPI, executeWorkflowAPI, stopTestWorkflowAPI } from "../../../data/apis/workflow";
import { extractError } from "../../../utils/error";

/**
 * Custom hook to handle workflow execution (both test and saved runs).
 * Manages socket subscription, state updates, and execution lifecycle.
 */
export const useWorkflowRun = ({ tenantID }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [nodeExecutionStatus, setNodeExecutionStatus] = useState({}); // Map of nodeId -> status
    const [logs, setLogs] = useState([]);
    const [context, setContext] = useState({});
    
    // Refs for cleanup and internal state
    const socketRef = useRef(null);
    const timeoutRef = useRef(null);
    const instanceIdRef = useRef(null);
    const isTestRunRef = useRef(false);
    const isStoppingRef = useRef(false); // Guard to prevent race conditions when stopping

    // Helper to add log entry
    const addLog = useCallback((type, label, message, extra = {}) => {
        setLogs(prev => [...prev, {
            type,
            label,
            message,
            timestamp: Date.now(),
            ...extra,
        }]);
    }, []);

    // Clear logs
    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    // Clear context
    const clearContext = useCallback(() => {
        setContext({});
    }, []);

    // Reset node execution status
    const resetNodeExecutionStatus = useCallback(() => {
        setNodeExecutionStatus({});
    }, []);

    /**
     * Subscribe to a workflow instance via Socket.IO
     * Shared logic for both test and saved runs
     */
    const subscribeToInstance = useCallback(async (instanceID, nodes = []) => {
        try {
             // Get socket from context (we need to access it directly)
            // Note: In a real app we might use a SocketContext, but here we import dynamically to match existing pattern
            const socketModule = await import("socket.io-client");
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

            // Helper to get node name
            const getNodeName = (nodeId) => {
                const node = nodes.find(n => n.id === nodeId);
                return node?.data?.title || node?.type || nodeId;
            };

            // Listen for node updates from backend
            socket.on("workflow_node_update", (data) => {
                // Ignore events if we're stopping
                if (isStoppingRef.current) return;

                const nodeId = data.nodeID;
                if (nodeId && data.status) {
                    const nodeName = getNodeName(nodeId);
                    const status = data.status === 'success' ? 'completed' : 'failed';

                    setNodeExecutionStatus(prev => ({
                        ...prev,
                        [nodeId]: status,
                    }));

                    // Update workflow context with assembled context from orchestrator
                    // This gives a flat, consistent shape: { input: {}, queryResult: [...], ... }
                    if (data.contextData) {
                        setContext(data.contextData);
                    }

                    // Log the node update
                    if (data.status === 'success') {
                        addLog('node_complete', `Node: ${nodeName}`, 'Completed successfully', {
                            nodeId,
                            output: data.output
                        });
                    } else {
                        addLog('node_error', `Node: ${nodeName}`, 'Execution failed', {
                            nodeId,
                            error: data.error
                        });
                    }

                    // Mark next nodes as running (visual feedback)
                    // Note: This matches the old logic but relies on passed 'nodes' and edges would need to be passed too for full accuracy.
                    // For now, we rely on the backend events mostly, but the old code had edge logic here.
                    // Simplification: We will just update status based on events. 
                }
            });

            // Listen for workflow status update (completion/failure/stopped)
            socket.on("workflow_status_update", (data) => {
                // Ignore events if we're stopping
                if (isStoppingRef.current) return;

                // Update context with full contextData from completion
                if (data.contextData) {
                    setContext(data.contextData);
                }

                if (data.status === "COMPLETED") {
                    addLog('workflow_complete', 'Workflow Complete', 'All nodes executed successfully');
                    setIsRunning(false);
                    setResult(data);
                    disconnectSocket();
                } else if (data.status === "FAILED") {
                    addLog('workflow_error', 'Workflow Failed', 'Execution terminated with errors');
                    setIsRunning(false);
                    setResult(data);
                    disconnectSocket();
                } else if (data.status === "STOPPED" || data.status === "CANCELLED") {
                    addLog('info', 'Workflow Stopped', 'Execution was stopped');
                    setIsRunning(false);
                    setResult(data);
                    disconnectSocket();
                }
            });

            // Timeout after 2 minutes
            timeoutRef.current = setTimeout(() => {
                addLog('info', 'Timeout', 'Workflow execution timed out after 2 minutes');
                setIsRunning(false);
                disconnectSocket();
            }, 120000);

            // Cleanup on disconnect
            socket.on("disconnect", () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            });

        } catch (error) {
            addLog('workflow_error', 'Connection Error', error.message);
            setIsRunning(false);
        }
    }, [addLog]);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const clearRunState = useCallback(() => {
        disconnectSocket();
        setIsRunning(false);
        setResult(null);
        resetNodeExecutionStatus();
        clearLogs();
        clearContext();
        instanceIdRef.current = null;
        isTestRunRef.current = false;
        isStoppingRef.current = false;
    }, [disconnectSocket, resetNodeExecutionStatus, clearLogs, clearContext]);

    /**
     * Start a Test Run (In-Memory)
     */
    const startTestRun = useCallback(async ({ nodes, edges, inputArgs }) => {
        // Reset stopping guard for new run
        isStoppingRef.current = false;
        clearRunState();
        setIsRunning(true);
        isTestRunRef.current = true;

        addLog('start', 'Test Run Started', `Running workflow with ${nodes.length} nodes`);

        try {
            // Start test execution
            const result = await testWorkflowAPI({
                tenantID,
                nodes,
                edges,
                inputArgs,
            });

            const instanceID = result.instanceID;
            instanceIdRef.current = instanceID;
            addLog('info', 'Instance Created', `Instance ID: ${instanceID.substring(0, 8)}...`);

            // Mark start node as running
            const startNode = nodes.find(n => n.type === 'start');
            if (startNode) {
                setNodeExecutionStatus(prev => ({
                    ...prev,
                    [startNode.id]: 'running',
                }));
                addLog('node_start', 'Node: Start', startNode.data?.title || 'Start', { nodeId: startNode.id });
            }

            // Subscribe
            await subscribeToInstance(instanceID, nodes);

        } catch (error) {
            addLog('workflow_error', 'Error', extractError(error) || error?.message || String(error));
            setIsRunning(false);
            resetNodeExecutionStatus();
        }
    }, [tenantID, clearRunState, resetNodeExecutionStatus, addLog, subscribeToInstance]);

    /**
     * Start a Saved Run (Database)
     */
    const startSavedRun = useCallback(async ({ workflowID, nodes, inputArgs }) => {
        // Reset stopping guard for new run
        isStoppingRef.current = false;
        clearRunState();
        setIsRunning(true);
        isTestRunRef.current = false;

        addLog('start', 'Run Started', `Executing saved workflow ${workflowID}`);

        try {
            // Start execution
            const result = await executeWorkflowAPI({
                tenantID,
                workflowID,
                inputArgs,
            });

            const instanceID = result.instanceID;
            instanceIdRef.current = instanceID;
             addLog('info', 'Instance Created', `Instance ID: ${instanceID.substring(0, 8)}...`);

            // Subscribe
            await subscribeToInstance(instanceID, nodes);

        } catch (error) {
             addLog('workflow_error', 'Error', error.message);
            setIsRunning(false);
            resetNodeExecutionStatus();
        }
    }, [tenantID, clearRunState, resetNodeExecutionStatus, addLog, subscribeToInstance]);

    /**
     * Stop the current run
     */
    const stopRun = useCallback(async () => {
        // Set stopping guard immediately to prevent race conditions
        isStoppingRef.current = true;

        const currentInstanceId = instanceIdRef.current;
        const isTest = isTestRunRef.current;

        // Disconnect socket first to stop receiving events
        disconnectSocket();
        
        // Update UI state immediately
        addLog('info', 'Stopped', 'Workflow run was manually stopped');
        setIsRunning(false);

        // For test runs, we need to clean up
        if (currentInstanceId && isTest) {
            try {
                await stopTestWorkflowAPI({ tenantID, instanceID: currentInstanceId });
                addLog('info', 'Cleanup', 'Test instance deleted from database');
            } catch (error) {
                addLog('warning', 'Cleanup Warning', `Failed to delete test instance: ${error.message}`);
            }
        }
        
        instanceIdRef.current = null;
        isStoppingRef.current = false; // Reset for next run
    }, [addLog, tenantID, disconnectSocket]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnectSocket();
        };
    }, [disconnectSocket]);

    return {
        isRunning,
        result,
        nodeExecutionStatus,
        logs,
        context,
        startTestRun,
        startSavedRun,
        stopRun,
        clearLogs,
        clearRunState
    };
};
