import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSocketState } from "../contexts/socketContext";

/**
 * Connection modes for widget-workflow integration
 */
export const WIDGET_WORKFLOW_MODES = {
  EXECUTE: 'execute',      // Start new workflow execution
  SUBSCRIBE: 'subscribe',  // Subscribe to existing instance
  REPLAY: 'replay',        // Get completed instance data (no live updates)
};

/**
 * Connection states
 */
export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
};

/**
 * Hook to manage WebSocket connection between a widget and its workflow
 * Provides real-time context updates and bidirectional communication
 * 
 * @param {object} params
 * @param {string} params.widgetID - Widget ID
 * @param {string} params.workflowID - Workflow ID
 * @param {string} params.tenantID - Tenant ID
 * @param {string} params.mode - Connection mode (execute, subscribe, replay)
 * @param {object} params.inputParams - Input parameters for workflow execution
 * @param {string} params.instanceID - Instance ID (for subscribe/replay modes)
 * @param {boolean} params.autoConnect - Whether to connect automatically on mount
 * @param {string} params.widgetType - Widget type for real-time data processing (bar, line, pie, etc.)
 * @param {object} params.datasetFields - Field mappings for real-time data processing
 * @param {object} params.parameters - Additional chart parameters
 * @param {function} params.onContextUpdate - Callback when context updates
 * @param {function} params.onWorkflowComplete - Callback when workflow completes
 * @param {function} params.onError - Callback when error occurs
 * @returns {object} Connection state and controls
 */
export const useWidgetWorkflowConnection = ({
  widgetID,
  workflowID,
  tenantID,
  mode = WIDGET_WORKFLOW_MODES.EXECUTE,
  inputParams = {},
  instanceID = null,
  autoConnect = true,
  // Widget configuration for real-time data processing
  widgetType,
  datasetFields,
  parameters,
  // Callbacks
  onContextUpdate,
  onWorkflowComplete,
  onError,
}) => {
  const { socket, isConnected: isSocketConnected } = useSocketState();
  
  // Connection state
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
  const [currentInstanceID, setCurrentInstanceID] = useState(instanceID);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // Workflow context state
  const [context, setContext] = useState({});
  const [nodeStatuses, setNodeStatuses] = useState({});
  // Processed chart-ready data from backend (real-time updates)
  const [processedData, setProcessedData] = useState(null);
  
  // Refs for callbacks to avoid stale closures
  const onContextUpdateRef = useRef(onContextUpdate);
  const onWorkflowCompleteRef = useRef(onWorkflowComplete);
  const onErrorRef = useRef(onError);
  
  // Update refs when callbacks change
  useEffect(() => {
    onContextUpdateRef.current = onContextUpdate;
    onWorkflowCompleteRef.current = onWorkflowComplete;
    onErrorRef.current = onError;
  }, [onContextUpdate, onWorkflowComplete, onError]);
  
  // Mount tracking
  const mountedRef = useRef(true);
  
  /**
   * Connect to workflow
   */
  const connect = useCallback(() => {
    console.log('[useWidgetWorkflowConnection] connect called', {
      hasSocket: !!socket,
      isSocketConnected,
      widgetID,
      workflowID,
      tenantID,
      mode,
    });

    if (!socket || !isSocketConnected) {
      console.warn('[useWidgetWorkflowConnection] Socket not connected, cannot connect to workflow');
      return;
    }
    
    if (!widgetID) {
      console.warn('[useWidgetWorkflowConnection] widgetID is required');
      return;
    }
    
    if (mode === WIDGET_WORKFLOW_MODES.EXECUTE && !workflowID) {
      console.warn('[useWidgetWorkflowConnection] workflowID is required for execute mode');
      return;
    }
    
    if ((mode === WIDGET_WORKFLOW_MODES.SUBSCRIBE || mode === WIDGET_WORKFLOW_MODES.REPLAY) && !instanceID) {
      console.warn('[useWidgetWorkflowConnection] instanceID is required for subscribe/replay mode');
      return;
    }
    
    setConnectionState(CONNECTION_STATES.CONNECTING);
    setError(null);
    setProcessedData(null); // Reset processed data
    
    const payload = {
      widgetID,
      workflowID,
      tenantID,
      mode,
      inputParams,
      instanceID,
      // Widget configuration for real-time data processing
      widgetType,
      datasetFields,
      parameters,
    };
    
    console.log('[useWidgetWorkflowConnection] emitting widget_workflow_connect', payload);
    socket.emit('widget_workflow_connect', payload);
  }, [socket, isSocketConnected, widgetID, workflowID, tenantID, mode, inputParams, instanceID, widgetType, datasetFields, parameters]);
  
  /**
   * Disconnect from workflow
   */
  const disconnect = useCallback(() => {
    if (!socket || !widgetID) return;
    
    socket.emit('widget_workflow_disconnect', {
      widgetID,
    });
    
    setConnectionState(CONNECTION_STATES.DISCONNECTED);
    setCurrentInstanceID(null);
  }, [socket, widgetID]);
  
  /**
   * Send interactive input to workflow
   */
  const sendInput = useCallback((inputType, data) => {
    if (!socket || connectionState !== CONNECTION_STATES.CONNECTED) {
      console.warn('Cannot send input: not connected');
      return;
    }
    
    socket.emit('widget_send_input', {
      widgetID,
      instanceID: currentInstanceID,
      inputType,
      data,
    });
  }, [socket, widgetID, currentInstanceID, connectionState]);
  
  /**
   * Refresh (re-execute) workflow
   */
  const refresh = useCallback((newInputParams = null) => {
    if (!socket || !widgetID) return;
    
    socket.emit('widget_refresh', {
      widgetID,
      inputParams: newInputParams || inputParams,
      tenantID,
    });
    
    setConnectionState(CONNECTION_STATES.CONNECTING);
    setContext({});
    setNodeStatuses({});
  }, [socket, widgetID, inputParams, tenantID]);
  
  /**
   * Set up socket event listeners
   */
  useEffect(() => {
    if (!socket) return;
    
    // Connection established
    const handleConnected = (data) => {
      if (data.widgetID !== widgetID) return;
      if (!mountedRef.current) return;
      
      setConnectionState(CONNECTION_STATES.CONNECTED);
      setCurrentInstanceID(data.instanceID);
      
      if (data.initialContext) {
        setContext(data.initialContext);
      }
      
      if (data.workflowStatus) {
        setWorkflowStatus(data.workflowStatus);
      }
    };
    
    // Context update - receives real-time processed data from backend
    const handleContextUpdate = (data) => {
      if (data.widgetID !== widgetID) return;
      if (!mountedRef.current) return;
      
      const { update } = data;
      
      // Update context with new values
      if (update.contextSnapshot) {
        setContext(update.contextSnapshot);
      } else if (update.value !== undefined && update.outputVariable) {
        setContext(prev => ({
          ...prev,
          [update.outputVariable]: update.value,
        }));
      }
      
      // Update processed chart-ready data if available (real-time from backend)
      if (update.processedData) {
        setProcessedData(update.processedData);
      }
      
      // Update node status
      if (update.nodeID) {
        setNodeStatuses(prev => ({
          ...prev,
          [update.nodeID]: {
            status: update.status,
            outputVariable: update.outputVariable,
            updatedAt: data.timestamp,
          },
        }));
      }
      
      // Call callback
      if (onContextUpdateRef.current) {
        onContextUpdateRef.current(update, data);
      }
    };
    
    // Workflow status change - receives final processed data from backend
    const handleWorkflowStatus = (data) => {
      if (data.widgetID !== widgetID) return;
      if (!mountedRef.current) return;
      
      setWorkflowStatus(data.status);
      
      if (data.finalContext) {
        setContext(data.finalContext);
      }
      
      // Update processed chart-ready data if available
      if (data.processedData) {
        setProcessedData(data.processedData);
      }
      
      if (data.status === 'COMPLETED' && onWorkflowCompleteRef.current) {
        onWorkflowCompleteRef.current(data.finalContext, data);
      }
    };
    
    // Error
    const handleError = (data) => {
      if (data.widgetID !== widgetID) return;
      if (!mountedRef.current) return;
      
      setConnectionState(CONNECTION_STATES.ERROR);
      setError(data.error);
      
      if (onErrorRef.current) {
        onErrorRef.current(data.error, data);
      }
    };
    
    // Disconnected
    const handleDisconnected = (data) => {
      if (data.widgetID !== widgetID) return;
      if (!mountedRef.current) return;
      
      setConnectionState(CONNECTION_STATES.DISCONNECTED);
    };
    
    // Input received acknowledgment
    const handleInputReceived = (data) => {
      if (data.widgetID !== widgetID) return;
      // Could add callback here if needed
    };
    
    // Register listeners
    socket.on('widget_workflow_connected', handleConnected);
    socket.on('widget_context_update', handleContextUpdate);
    socket.on('widget_workflow_status', handleWorkflowStatus);
    socket.on('widget_workflow_error', handleError);
    socket.on('widget_workflow_disconnected', handleDisconnected);
    socket.on('widget_input_received', handleInputReceived);
    
    // Cleanup
    return () => {
      socket.off('widget_workflow_connected', handleConnected);
      socket.off('widget_context_update', handleContextUpdate);
      socket.off('widget_workflow_status', handleWorkflowStatus);
      socket.off('widget_workflow_error', handleError);
      socket.off('widget_workflow_disconnected', handleDisconnected);
      socket.off('widget_input_received', handleInputReceived);
    };
  }, [socket, widgetID]);
  
  /**
   * Auto-connect on mount
   */
  useEffect(() => {
    console.log('[useWidgetWorkflowConnection] auto-connect check', {
      autoConnect,
      isSocketConnected,
      widgetID,
      workflowID,
      shouldConnect: autoConnect && isSocketConnected && widgetID,
    });
    
    if (autoConnect && isSocketConnected && widgetID) {
      connect();
    }
    
    return () => {
      mountedRef.current = false;
      // Disconnect on unmount
      if (socket && widgetID) {
        socket.emit('widget_workflow_disconnect', { widgetID });
      }
    };
  }, [autoConnect, isSocketConnected, widgetID]); // eslint-disable-line react-hooks/exhaustive-deps
  
  /**
   * Computed values
   */
  const isConnected = connectionState === CONNECTION_STATES.CONNECTED;
  const isConnecting = connectionState === CONNECTION_STATES.CONNECTING;
  const isError = connectionState === CONNECTION_STATES.ERROR;
  const isWorkflowRunning = workflowStatus === 'RUNNING';
  const isWorkflowComplete = workflowStatus === 'COMPLETED';
  const isWorkflowFailed = workflowStatus === 'FAILED';
  
  /**
   * Resolve variable from context
   * Supports mustache format {{ctx.path}} and wildcards [*]
   */
  const resolveVariable = useCallback((path, fallback = undefined) => {
    if (!path) return fallback;
    
    // Extract path from mustache format if present
    let cleanPath = path;
    
    // Handle mustache format: {{ctx.variableName}} or {{ctx.variableName.property}}
    const mustacheMatch = path.match(/^\{\{(.+?)\}\}$/);
    if (mustacheMatch) {
      cleanPath = mustacheMatch[1];
    }
    
    // Remove ctx. prefix if present
    if (cleanPath.startsWith('ctx.')) {
      cleanPath = cleanPath.slice(4);
    }
    
    // Handle wildcard notation: path[*].field
    if (cleanPath.includes('[*]')) {
      return resolveWildcardPath(context, cleanPath, fallback);
    }
    
    // Simple path resolution
    const parts = cleanPath.split('.');
    let current = context;
    
    for (const part of parts) {
      if (current === undefined || current === null) {
        return fallback;
      }
      
      // Handle array index notation: field[0]
      const indexMatch = part.match(/^(.+?)\[(\d+)\]$/);
      if (indexMatch) {
        const [, prop, index] = indexMatch;
        current = current[prop];
        if (Array.isArray(current)) {
          current = current[parseInt(index, 10)];
        } else {
          return fallback;
        }
      } else {
        current = current[part];
      }
    }
    
    return current !== undefined ? current : fallback;
  }, [context]);
  
  /**
   * Resolve wildcard path: extracts array of values
   * e.g., "queryResult.rows[*].name" -> ["name1", "name2", ...]
   */
  const resolveWildcardPath = (ctx, path, fallback) => {
    const wildcardIndex = path.indexOf('[*]');
    if (wildcardIndex === -1) return fallback;
    
    // Split path at wildcard
    const beforeWildcard = path.slice(0, wildcardIndex);
    const afterWildcard = path.slice(wildcardIndex + 3); // Skip '[*]'
    
    // Get array from before wildcard
    let current = ctx;
    if (beforeWildcard) {
      const parts = beforeWildcard.split('.');
      for (const part of parts) {
        if (current === undefined || current === null) return fallback;
        current = current[part];
      }
    }
    
    // Must be an array
    if (!Array.isArray(current)) return fallback;
    
    // If no after path, return the array itself
    if (!afterWildcard || afterWildcard === '.') {
      return current;
    }
    
    // Extract field from each item
    const fieldPath = afterWildcard.startsWith('.') ? afterWildcard.slice(1) : afterWildcard;
    const results = [];
    
    for (const item of current) {
      if (item === null || item === undefined) {
        results.push(undefined);
        continue;
      }
      
      // Navigate nested path in item
      let value = item;
      const fieldParts = fieldPath.split('.');
      for (const part of fieldParts) {
        if (value === undefined || value === null) {
          value = undefined;
          break;
        }
        value = value[part];
      }
      results.push(value);
    }
    
    return results.length > 0 ? results : fallback;
  };
  
  /**
   * Get available variables for binding UI
   */
  const availableVariables = useMemo(() => {
    const variables = [];
    
    const extractVariables = (obj, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;
      
      for (const [key, value] of Object.entries(obj)) {
        // Skip internal keys
        if (key.startsWith('__')) continue;
        
        const path = prefix ? `${prefix}.${key}` : key;
        
        if (value === null || value === undefined) {
          variables.push({ path, type: 'null', value: null });
        } else if (Array.isArray(value)) {
          variables.push({ path, type: 'array', length: value.length });
          // Add first item's structure if array of objects
          if (value.length > 0 && typeof value[0] === 'object') {
            extractVariables(value[0], `${path}[0]`);
          }
        } else if (typeof value === 'object') {
          variables.push({ path, type: 'object', keys: Object.keys(value) });
          extractVariables(value, path);
        } else {
          variables.push({ path, type: typeof value, value });
        }
      }
    };
    
    extractVariables(context);
    return variables;
  }, [context]);
  
  return {
    // Connection state
    connectionState,
    isConnected,
    isConnecting,
    isError,
    error,
    
    // Workflow state
    instanceID: currentInstanceID,
    workflowStatus,
    isWorkflowRunning,
    isWorkflowComplete,
    isWorkflowFailed,
    
    // Context data
    context,
    nodeStatuses,
    // Processed chart-ready data (real-time from backend)
    processedData,
    
    // Actions
    connect,
    disconnect,
    sendInput,
    refresh,
    
    // Utilities
    resolveVariable,
    availableVariables,
  };
};

export default useWidgetWorkflowConnection;
