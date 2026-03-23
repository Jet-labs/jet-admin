
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { getWidgetDataUsingWidgetAPI } from "../../../data/apis/widget";
import { displayError } from "../../../utils/notification";
import { useSocketState } from "../../../logic/contexts/socketContext";

/**
 * Modes for widget execution
 */
export const WIDGET_EXECUTION_MODES = {
  ASYNC: 'ASYNC', // Real-time/Live (via Socket)
  SYNC: 'SYNC',   // On-completion (via HTTP wait)
};

export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
};

/**
 * Hook to manage widget execution, data preview, and real-time connections.
 * Merges functionality of useWidgetWorkflowConnection and useWidgetWorkflowData.
 */
export const useWidgetRun = ({
  tenantID,
  widgetID = null,
  widgetFetchedData = null, // Initial/Parent data
  executionMode = WIDGET_EXECUTION_MODES.ASYNC,
  // Socket/Workflow specific params
  workflowID = null,
  widgetType = null,
  widgetConfig = null,
  workflowConfig = null,
}) => {
  // --- Local State ---
  const [localData, setLocalData] = useState(null);
  const [instanceID, setInstanceID] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // --- Socket State ---
  const { socket } = useSocketState();
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [wsProcessedData, setWsProcessedData] = useState(null);
  const [wsContext, setWsContext] = useState({});

  // Refs for callbacks
  const hydratedInstanceRef = useRef(null);

  // --- Helpers ---
  const addLog = useCallback((type, label, message, extra = {}) => {
    setLogs(prev => [...prev, { type, label, message, timestamp: Date.now(), ...extra }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    const fetchedInstance = widgetFetchedData?.workflowInstances;

    if (!fetchedInstance?.instanceID) {
      return;
    }

    if (hydratedInstanceRef.current === fetchedInstance.instanceID) {
      return;
    }

    hydratedInstanceRef.current = fetchedInstance.instanceID;
    setLocalData(widgetFetchedData);
    setInstanceID(fetchedInstance.instanceID);
    setWorkflowStatus(
      fetchedInstance.status || (fetchedInstance.data ? 'COMPLETED' : 'PENDING')
    );

    if (fetchedInstance.data) {
      console.log("fetchedInstance.data", fetchedInstance.data);
      setWsProcessedData(fetchedInstance.data);
    }
  }, [widgetFetchedData]);

  const [currentInputParams, setCurrentInputParams] = useState({});

  // --- 1. API Execution (Start Workflow / Fetch Data) ---
  const { isPending: isFetching, mutate: fetchWidgetData } = useMutation({
    mutationFn: (config) => {
       return getWidgetDataUsingWidgetAPI({
        tenantID,
        widgetData: config,
         executionMode,
         inputArgs: config.inputArgs || {},
      });
    },
    onSuccess: (response) => {
      const data = response;
      
      // Case A: Workflow Mode (returns instance info)
      if (data.workflowInstances) {
        const instance = data.workflowInstances;
        setInstanceID(instance.instanceID);
        
        // SYNC Mode or Immediate Result
        if (instance.data) {
           setLocalData(data);
           setWorkflowStatus(instance.status);
          console.log("fetchWidgetData:instance.data", instance.data);
          setWsProcessedData(instance.data);
           addLog('success', 'Execution Completed', `Workflow finished with status: ${instance.status}`);
        } else {
           // ASYNC Mode -> Wait for Socket
           setWorkflowStatus(instance.status || 'PENDING');
           addLog('info', 'Execution Started', `Workflow started. Instance ID: ${instance.instanceID}`);
        }
      } 
      // Case B: Standard Query Mode
      else {
        setLocalData(data);
        setInstanceID(null);
        setWorkflowStatus('COMPLETED');
        addLog('success', 'Data Fetched', 'Widget data retrieved successfully');
      }
    },
    onError: (error) => {
      displayError(error);
      addLog('error', 'Execution Error', error.message);
      setWorkflowStatus('ERROR');
    },
  });

  // --- 2. Socket Connection Logic ---
  // Connect if:
  // 1. We have an instanceID
  // 2. We are in ASYNC mode
  // 3. Workflow is not yet complete/failed
  // 4. Socket is available
  const shouldConnect = !!instanceID && 
            executionMode === WIDGET_EXECUTION_MODES.ASYNC && 
    socket &&
            workflowStatus !== 'COMPLETED' && 
    workflowStatus !== 'FAILED';

  // Connect Effect
  useEffect(() => {
    if (!shouldConnect || !socket) return;

    const targetWidgetID = widgetID ? String(widgetID) : `preview_${tenantID}_${Date.now()}`;
    
    // === 1. Widget-specific channel (for processed data + context updates) ===
    const payload = {
      widgetID: targetWidgetID,
      workflowID,
      tenantID,
      mode: 'subscribe',
      instanceID,
      widgetType,
      widgetConfig,
      workflowConfig,
      inputArgs: currentInputParams,
    };

    setConnectionState(CONNECTION_STATES.CONNECTING);
    socket.emit('widget_workflow_connect', payload);

    // Widget-specific handlers
    const handleConnected = (data) => {
      if (data.widgetID !== targetWidgetID) return;
       setConnectionState(CONNECTION_STATES.CONNECTED);
       if (data.initialContext) setWsContext(data.initialContext);
       if (data.workflowStatus) setWorkflowStatus(data.workflowStatus);
      addLog('info', 'Connected', 'Joined workflow execution room');
    };

    const handleContextUpdate = (data) => {
      if (data.widgetID !== targetWidgetID) return;
       const { update } = data;
       
      if (update.processedData) {
        console.log("handleContextUpdate:update.processedData", update.processedData);
        setWsProcessedData(update.processedData);
       }
      if (update.contextSnapshot) {
         setWsContext(update.contextSnapshot);
       }
    };

    const handleWidgetStatus = (data) => {
      if (data.widgetID !== targetWidgetID) return;
       setWorkflowStatus(data.status);
      console.log("handleWidgetStatus:data.processedData", data?.processedData);
       if (data.processedData) setWsProcessedData(data.processedData);
       if (data.finalContext) setWsContext(data.finalContext);
       
       if (data.status === 'COMPLETED') {
          addLog('success', 'Workflow Completed', 'Real-time execution finished');
       }
    };

    const handleError = (data) => {
      if (data.widgetID !== targetWidgetID) return;
      setConnectionState(CONNECTION_STATES.ERROR);
       addLog('error', 'Socket Error', data.error);
    };

    const handleDisconnect = (data) => {
      if (data.widgetID !== targetWidgetID) return;
        setConnectionState(CONNECTION_STATES.DISCONNECTED);
    };

    // === 2. Workflow execution channel (for per-node logs) ===
    socket.emit('workflow_run_join', { runId: instanceID });

    const handleNodeUpdate = (nodeData) => {
      // Filter by instanceID to avoid cross-talk on multi-widget dashboards
      if (nodeData.instanceID !== instanceID) return;

      // Update context with real-time assembled context from orchestrator
      if (nodeData.contextData) {
        setWsContext(nodeData.contextData);
      }

      const nodeId = nodeData.nodeID;
      if (nodeId && nodeData.status) {
        const nodeName = nodeData.nodeType || nodeId;

        if (nodeData.status === 'success') {
          addLog('node_complete', `Node: ${nodeName}`, 'Completed successfully', {
            nodeId,
            output: nodeData.output
          });
        } else if (nodeData.status === 'error' || nodeData.status === 'failed') {
          addLog('node_error', `Node: ${nodeName}`, 'Execution failed', {
            nodeId,
            error: nodeData.error
          });
        } else if (nodeData.status === 'running' || nodeData.status === 'started') {
          addLog('node_start', `Node: ${nodeName}`, 'Started execution', {
            nodeId
          });
        }
      }
    };

    const handleWorkflowStatus = (statusData) => {
      // Filter by instanceID to avoid cross-talk on multi-widget dashboards
      if (statusData.instanceID !== instanceID) return;

      // Update context with full contextData from completion
      if (statusData.contextData) {
        setWsContext(statusData.contextData);
      }

      if (statusData.status === 'COMPLETED') {
        setWorkflowStatus('COMPLETED');
        addLog('workflow_complete', 'Workflow Complete', 'All nodes executed successfully');
      } else if (statusData.status === 'FAILED') {
        setWorkflowStatus('FAILED');
        addLog('workflow_error', 'Workflow Failed', 'Execution terminated with errors');
      } else if (statusData.status === 'STOPPED' || statusData.status === 'CANCELLED') {
        setWorkflowStatus('FAILED');
        addLog('info', 'Workflow Stopped', 'Execution was stopped');
      }
    };

    // Attach all listeners
    socket.on('widget_workflow_connected', handleConnected);
    socket.on('widget_context_update', handleContextUpdate);
    socket.on('widget_workflow_status', handleWidgetStatus);
    socket.on('widget_workflow_error', handleError);
    socket.on('widget_workflow_disconnected', handleDisconnect);
    socket.on('workflow_node_update', handleNodeUpdate);
    socket.on('workflow_status_update', handleWorkflowStatus);

    // Cleanup
    return () => {
      socket.off('widget_workflow_connected', handleConnected);
      socket.off('widget_context_update', handleContextUpdate);
      socket.off('widget_workflow_status', handleWidgetStatus);
      socket.off('widget_workflow_error', handleError);
      socket.off('widget_workflow_disconnected', handleDisconnect);
      socket.off('workflow_node_update', handleNodeUpdate);
      socket.off('workflow_status_update', handleWorkflowStatus);
      
      socket.emit('widget_workflow_disconnect', { widgetID: targetWidgetID });
    };

  }, [shouldConnect, socket, instanceID, tenantID, widgetID, workflowID, widgetType, widgetConfig, workflowConfig]);

  // --- 3. Data Resolution ---
  const finalData = useMemo(() => {
    // Priority: Live Socket Data > Local Sync Data > Initial/Fetched Data
    if (wsProcessedData) {
      return {
        ...localData,
        workflowInstances: {
          ...localData?.workflowInstances,
          data: wsProcessedData,
          status: workflowStatus
        }
      };
    }
    return localData || widgetFetchedData;
  }, [wsProcessedData, localData, widgetFetchedData, workflowStatus]);

  // --- 4. Actions ---
  const runWidget = useCallback((formValues, opts = {}) => {
    setLogs([]);
    setLocalData(null);
    setWsProcessedData(null);
    setInstanceID(null);
    setWorkflowStatus('LOADING');
    const params = opts.inputArgs || {};
    setCurrentInputParams(params);
    fetchWidgetData({ ...formValues, inputArgs: params });
  }, [fetchWidgetData]);


  // --- 5. Return ---
  // Only show loading for initial API fetch, NOT during real-time socket streaming
  const isLoading = isFetching && !wsProcessedData;
  const isRunning = isFetching || (workflowStatus === 'LOADING') || (workflowStatus === 'PENDING');

  return {
    // Data
    data: finalData,
    processedData: wsProcessedData,
    context: wsContext,
    
    // Status
    isLoading,
    isRunning,
    isLive: connectionState === CONNECTION_STATES.CONNECTED,
    workflowStatus,
    connectionState,
    logs,
    
    // Actions
    runWidget,
    clearLogs,
  };
};

