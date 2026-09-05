
import { useState, useRef, useCallback, useEffect } from "react";
import { CONSTANTS } from "../../../constants";
import { testWorkflowAPI, executeWorkflowAPI, stopTestWorkflowAPI, getWorkflowRunStatusAPI } from "../../../data/apis/workflow";
import { extractError } from "../../../utils/error";
import { submitDataCollectionAPI } from "../../../data/apis/workflow";

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
    const instanceIdRef = useRef(null);
    const isTestRunRef = useRef(false);
    const isStoppingRef = useRef(false); // Guard to prevent race conditions when stopping
    const pollRef = useRef(null); // Polling fallback when socket events are missed
    const [dataCollectionRequest, setDataCollectionRequest] = useState(null);

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

    const disconnectSocket = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        const sock = socketRef.current;
        socketRef.current = null;
        if (sock) {
            // Detach first: intentional teardown must not trip the
            // 'disconnect' warning handler (it would log a spurious
            // "Connection Warning" on every clean completion).
            try {
                sock.off("disconnect");
                sock.off("connect_error");
            } catch (_) {}
            sock.disconnect();
        }
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

            // Helper to get node name (defined before listeners use it)
            const getNodeName = (nodeId) => {
                const node = nodes.find(n => n.id === nodeId);
                return node?.data?.title || node?.type || nodeId;
            };

            // Listen for node updates from backend
            socket.on("workflow_node_update", (data) => {
                try {
                // Ignore events if we're stopping
                if (isStoppingRef.current) return;

                const nodeId = data?.nodeID;
                if (!nodeId || !data?.status) {
                    addLog('node_error', 'Node update', `Malformed update (missing nodeID/status): ${JSON.stringify(data)?.substring(0, 200)}`);
                    return;
                }
                {
                    const nodeName = getNodeName(nodeId);
                    const statusLower = String(data.status).toLowerCase();
                    const isSuccess = statusLower === 'success' || statusLower === 'completed';
                    const isRunning = statusLower === 'running';
                    const isSuspended = statusLower === 'suspended';
                    const status = isSuccess ? 'completed' : isRunning ? 'running' : isSuspended ? 'suspended' : 'failed';

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
                    if (isSuccess) {
                        addLog('node_complete', `Node: ${nodeName}`, 'Completed successfully', {
                            nodeId,
                            output: data.output
                        });
                    } else if (isRunning) {
                        addLog('node_start', `Node: ${nodeName}`, 'Running', {
                            nodeId,
                        });
                    } else if (isSuspended) {
                        addLog('info', `Node: ${nodeName}`, 'Waiting for input', {
                            nodeId,
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
                } catch (handlerErr) {
                    // Never let one bad packet kill the stream — surface it visibly.
                    addLog('node_error', 'Node update', `Handler failed: ${handlerErr?.message}`, {
                        error: String(handlerErr?.stack || handlerErr).substring(0, 500),
                    });
                }
            });

            // Listen for data collection requests
            socket.on("workflow_data_collection_request", (data) => {
                if (isStoppingRef.current) return;
                // data = { instanceID, nodeID, collectionRequestID, collectionType, collectionConfig }
                const nodeName = getNodeName(data.nodeID);
                addLog('info', `Node: ${nodeName}`, 'Waiting for input');
                setDataCollectionRequest(data);
            });

            // Shared completion handler for socket + polling fallback.
            // Polling covers the case where `workflow_status_update` is emitted
            // before join or while the socket is disconnected (roomSize 0).
            const finishFromStatus = (data) => {
                if (isStoppingRef.current) return;
                if (!data || data.status === "RUNNING") return;
                if (data.contextData) {
                    setContext(data.contextData);
                }
                if (data.status === "COMPLETED") {
                    addLog('workflow_complete', 'Workflow Complete', 'All nodes executed successfully');
                } else if (data.status === "FAILED") {
                    addLog('workflow_error', 'Workflow Failed', data.error || data.errorMessage || 'Execution terminated with errors', {
                        ...(data.error ? { error: data.error } : {}),
                    });
                    // Mark the currently-running (or suspended) node as failed
                    // so its animation stops even if its node update was missed.
                    setNodeExecutionStatus(prev => {
                        const next = { ...prev };
                        for (const [k, v] of Object.entries(next)) {
                            if (v === 'running' || v === 'suspended') next[k] = 'failed';
                        }
                        return next;
                    });
                } else if (data.status === "STOPPED" || data.status === "CANCELLED") {
                    addLog('info', 'Workflow Stopped', 'Execution was stopped');
                } else {
                    return;
                }
                setIsRunning(false);
                setResult(data);
                disconnectSocket();
            };

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
                    addLog('workflow_error', 'Workflow Failed', 'Execution terminated with errors', {
                        ...(data.error ? { error: data.error } : {}),
                    });
                    setNodeExecutionStatus(prev => {
                        const next = { ...prev };
                        for (const [k, v] of Object.entries(next)) {
                            if (v === 'running' || v === 'suspended') next[k] = 'failed';
                        }
                        return next;
                    });
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

            // Socket dropped before completion -> don't hang on spinning
            // animation; polling below will resolve the final state.
            socket.on("disconnect", (reason) => {
                if (isStoppingRef.current) return;
                addLog('warning', 'Connection Warning', `Live updates disconnected (${reason}) — polling run status`);
            });
            socket.on("connect_error", (err) => {
                if (isStoppingRef.current) return;
                addLog('warning', 'Connection Warning', `Live updates unavailable (${err?.message || 'connect_error'}) — polling run status`);
            });

            // Join AFTER listeners are registered and the transport is connected,
            // so no event is missed and the join can never sit in a dead buffer.
            await new Promise((resolve) => {
                if (socket.connected) return resolve();
                const timer = setTimeout(() => resolve(), 5000);
                socket.once("connect", () => { clearTimeout(timer); resolve(); });
                socket.once("connect_error", () => { clearTimeout(timer); resolve(); });
            });
            if (!socket.connected) {
                addLog('workflow_error', 'Connection Error', 'Socket did not connect — live node updates will be missing');
            }
            socket.emit("workflow_run_join", { runId: instanceID });
            addLog('info', 'Connected', 'Joined workflow execution room');

            // Polling fallback: backend DB is source of truth. If the single
            // `workflow_status_update` socket event is missed (join race or
            // disconnect at completion time), polling still stops the animation.
            if (pollRef.current) clearInterval(pollRef.current);
            const pollStatus = async () => {
                if (isStoppingRef.current) return;
                try {
                    const res = await getWorkflowRunStatusAPI({ tenantID, instanceID });
                    const statusData = res?.data || res;
                    if (statusData && statusData.status && statusData.status !== "RUNNING") {
                        finishFromStatus(statusData);
                    }
                } catch (_) {
                    // Best-effort only — socket remains primary channel.
                }
            };
            pollRef.current = setInterval(pollStatus, 5000);
            // Immediate check covers fast-failing runs that complete before join.
            setTimeout(pollStatus, 2000);

        } catch (error) {
            addLog('workflow_error', 'Connection Error', error.message);
            setIsRunning(false);
        }
    }, [addLog, tenantID, disconnectSocket]);

    const clearRunState = useCallback(() => {
        disconnectSocket();
        setIsRunning(false);
        setResult(null);
        resetNodeExecutionStatus();
        clearLogs();
        clearContext();
        setDataCollectionRequest(null);
        instanceIdRef.current = null;
        isTestRunRef.current = false;
        isStoppingRef.current = false;
    }, [disconnectSocket, resetNodeExecutionStatus, clearLogs, clearContext]);

    /**
     * Start a Test Run (In-Memory)
     */
    const startTestRun = useCallback(async ({ nodes, edges, inputValues, workflowOptions, workflowID }) => {
        // Reset stopping guard for new run
        isStoppingRef.current = false;
        clearRunState();
        setIsRunning(true);
        isTestRunRef.current = true;

        addLog('start', 'Test Run Started', `Running workflow with ${nodes.length} nodes`);

        try {
            // Start test execution (workflowID attributes the run to a saved
            // workflow for history; omitted for unsaved graphs)
            const result = await testWorkflowAPI({
                tenantID,
                nodes,
                edges,
                inputValues,
                workflowOptions,
                ...(workflowID ? { workflowID } : {}),
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
    const startSavedRun = useCallback(async ({ workflowID, nodes, inputValues }) => {
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
                inputValues,
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

    const submitCollectedData = useCallback(async (submittedData) => {
        if (!dataCollectionRequest) return;
        const { collectionRequestID } = dataCollectionRequest;
        try {
            await submitDataCollectionAPI({ tenantID, collectionRequestID, submittedData });
            addLog('info', 'Data submitted', 'Workflow is resuming');
            setDataCollectionRequest(null);
        } catch (error) {
            addLog('workflow_error', 'Submission failed', error?.message || String(error));
        }
    }, [dataCollectionRequest, tenantID, addLog]);

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
        dataCollectionRequest,
        logs,
        context,
        clearRunState,
        startTestRun,
        startSavedRun,
        stopRun,
        clearLogs,
        submitCollectedData,  
    };
};
