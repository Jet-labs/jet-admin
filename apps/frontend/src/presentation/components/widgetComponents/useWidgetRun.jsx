
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { getWidgetDataUsingWidgetAPI, getWidgetDataByIDAPI } from "../../../data/apis/widget";
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
  datasetFields = null,
  parameters = null,
}) => {
  // --- Local State ---
  const [localData, setLocalData] = useState(null);
  const [instanceID, setInstanceID] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // --- Socket State ---
  const { socket, isConnected: isSocketConnected } = useSocketState();
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [socketError, setSocketError] = useState(null);
  const [wsProcessedData, setWsProcessedData] = useState(null);
  const [wsContext, setWsContext] = useState({});

  // Refs for callbacks
  const mountedRef = useRef(true);

  // --- Helpers ---
  const addLog = useCallback((type, title, message) => {
    setLogs(prev => [...prev, { type, title, message, timestamp: Date.now() }]);
  }, []);

  // --- 1. API Execution (Start Workflow / Fetch Data) ---
  const { isPending: isFetching, mutate: fetchWidgetData } = useMutation({
    mutationFn: (config) => {
      // If widgetID is present and we're just "running" existing, we might use ID API
      // But for "Preview" or "Run with new config", we use the Config API.
      // We'll stick to Config API for consistency in this hook for now, or assume config passed in.
       return getWidgetDataUsingWidgetAPI({
        tenantID,
        widgetData: config,
        executionMode, 
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
           setWsProcessedData(instance.data); // Treat as processed data
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

  useEffect(() => {
    console.log("useWidgetRun: {instanceID, workflowStatus }", { instanceID, workflowStatus });
  }, [instanceID, workflowStatus]);

  // --- 2. Socket Connection Logic ---
  console.log('[useWidgetRun] shouldConnect?', {
    hasInstanceID: !!instanceID,
    isAsync: executionMode === WIDGET_EXECUTION_MODES.ASYNC,
    isSocketConnected,
    workflowStatus,
  });
  // Connect if:
  // 1. We have an instanceID
  // 2. We are in ASYNC mode
  // 3. Workflow is not yet complete/failed (or we want to replay)
  // 4. Socket is available
  // Determine connection need
  const shouldConnect = !!instanceID && 
            executionMode === WIDGET_EXECUTION_MODES.ASYNC && 
    socket &&
            workflowStatus !== 'COMPLETED' && 
            workflowStatus !== 'FAILED';
  console.log('[useWidgetRun] shouldConnect?', shouldConnect);

  // Connect Effect
  useEffect(() => {
    console.log('[useWidgetRun] useEffect: shouldConnect?', shouldConnect);
    if (!shouldConnect || !socket) return;
    console.log('[useWidgetRun] useEffect: connecting to workflow via socket');

    const targetWidgetID = widgetID ? String(widgetID) : `preview_${tenantID}_${Date.now()}`;
    
    // Connect Payload
    const payload = {
      widgetID: targetWidgetID,
      workflowID: workflowID, // Might be null if just subscribing to known instance, but bridge handles it?
      tenantID,
      mode: 'subscribe', // We usually subscribe to the instance we just started
      instanceID: instanceID,
      widgetType,
      datasetFields,
      parameters
    };

    setConnectionState(CONNECTION_STATES.CONNECTING);
    console.log('[useWidgetRun] connecting to workflow via socket', payload);
    socket.emit('widget_workflow_connect', payload);

    // Handlers
    const handleConnected = (data) => {
      console.log('[useWidgetRun] handleConnected', data);
       if (data.widgetID !== targetWidgetID) return;
      console.log('[useWidgetRun] connected to workflow via socket', data);
       setConnectionState(CONNECTION_STATES.CONNECTED);
       if (data.initialContext) setWsContext(data.initialContext);
       if (data.workflowStatus) setWorkflowStatus(data.workflowStatus);
    };

    const handleContextUpdate = (data) => {
      console.log('[useWidgetRun] handleContextUpdate received', {
        dataWidgetID: data.widgetID,
        targetWidgetID,
        matches: data.widgetID === targetWidgetID
      });
       if (data.widgetID !== targetWidgetID) return;
      console.log('[useWidgetRun] context update via socket (MATCHED)', data);
       const { update } = data;
       
       if (update.processedData) {
         console.log(`[useWidgetRun] SETTING wsProcessedData for widgetID=${widgetID} targetWidgetID=${targetWidgetID}`, update.processedData);
         setWsProcessedData(update.processedData);
       } else {
         console.log('[useWidgetRun] handleContextUpdate: NO processedData in update', update);
       }
       if (update.contextSnapshot) {
         console.log('[useWidgetRun] handleContextUpdate: contextSnapshot', update.contextSnapshot);
         setWsContext(update.contextSnapshot);
       }
    };

    const handleStatus = (data) => {
      console.log('[useWidgetRun] handleStatus', data);
       if (data.widgetID !== targetWidgetID) return;
      console.log('[useWidgetRun] status update via socket', data);
       setWorkflowStatus(data.status);
       if (data.processedData) setWsProcessedData(data.processedData);
       if (data.finalContext) setWsContext(data.finalContext);
       
       if (data.status === 'COMPLETED') {
          addLog('success', 'Workflow Completed', 'Real-time execution finished');
       }
    };

    const handleError = (data) => {
      console.log('[useWidgetRun] handleError', data);
       if (data.widgetID !== targetWidgetID) return;
      console.log('[useWidgetRun] error via socket', data);
       setConnectionState(CONNECTION_STATES.ERROR);
       setSocketError(data.error);
       addLog('error', 'Socket Error', data.error);
    };

    const handleDisconnect = (data) => {
      console.log('[useWidgetRun] handleDisconnect', data);
        if (data.widgetID !== targetWidgetID) return;
      console.log('[useWidgetRun] disconnected from workflow via socket', data);
        setConnectionState(CONNECTION_STATES.DISCONNECTED);
    };

    // Attach
    socket.on('widget_workflow_connected', handleConnected);
    socket.on('widget_context_update', handleContextUpdate);
    socket.on('widget_workflow_status', handleStatus);
    socket.on('widget_workflow_error', handleError);
    socket.on('widget_workflow_disconnected', handleDisconnect);

    // Cleanup
    return () => {
      socket.off('widget_workflow_connected', handleConnected);
      socket.off('widget_context_update', handleContextUpdate);
      socket.off('widget_workflow_status', handleStatus);
      socket.off('widget_workflow_error', handleError);
      socket.off('widget_workflow_disconnected', handleDisconnect);
      
      socket.emit('widget_workflow_disconnect', { widgetID: targetWidgetID });
    };

  }, [shouldConnect, socket, instanceID, tenantID, widgetID, workflowID, widgetType, datasetFields, parameters]);


  const finalData = wsProcessedData ? {
    ...localData,
    workflowInstances: {
      ...localData?.workflowInstances,
      data: wsProcessedData,
      status: workflowStatus
    }
  } : localData || widgetFetchedData;

  // // --- 3. Data Resolution ---
  // const finalData = useMemo(() => {
  //   console.log('[useWidgetRun] finalData useMemo recalculating', {
  //     wsProcessedData,
  //     localData,
  //     widgetFetchedData,
  //     workflowStatus,
  //     widgetID
  //   });
  //   // Priority: Live Socket Data > Local Sync Data > Initial/Fetched Data
  //   if (wsProcessedData) {
  //      // Merge into widget structure expectations
  //     const result = {
  //        ...localData,
  //        workflowInstances: {
  //          ...localData?.workflowInstances,
  //          data: wsProcessedData,
  //          status: workflowStatus
  //        }
  //      };
  //     console.log('[useWidgetRun] finalData with wsProcessedData:', result);
  //     return result;
  //   }
  //   const fallback = localData || widgetFetchedData;
  //   console.log('[useWidgetRun] finalData fallback:', fallback);
  //   return fallback;
  // }, [wsProcessedData, localData, widgetFetchedData, workflowStatus]);

  // --- 4. Actions ---
  const runWidget = useCallback((formValues) => {
    setLogs([]);
    setLocalData(null);
    setWsProcessedData(null);
    setInstanceID(null);
    setWorkflowStatus('LOADING');
    fetchWidgetData(formValues);
  }, [fetchWidgetData]);

  useEffect(() => {
    console.log('[useWidgetRun] useEffect: processedData:', wsProcessedData);
  }, [wsProcessedData]);

  // Resolve Variable (from useWidgetWorkflowConnection)
  const resolveVariable = useCallback((path, fallback) => {
      // Simple resolution logic for context
      if (!path) return fallback;
      const cleanPath = path.replace('ctx.', '');
      
      // Basic dot notation support
      const parts = cleanPath.split('.');
      let current = wsContext;
      for (const part of parts) {
         if (current === undefined || current === null) return fallback;
         current = current[part];
      }
      return current !== undefined ? current : fallback;
  }, [wsContext]);


  // --- 5. Return ---
  // Only show loading for initial API fetch, NOT during real-time socket streaming
  // This allows the chart to render and update in real-time during workflow execution
  const isLoading = isFetching && !wsProcessedData;

  return {
    // Data
    data: finalData,
    processedData: wsProcessedData, // Direct access if needed
    context: wsContext,
    
    // Status
    isLoading,
    isLive: connectionState === CONNECTION_STATES.CONNECTED,
    workflowStatus,
    connectionState,
    logs,
    
    // Actions
    runWidget,
    resolveVariable,
  };
};
