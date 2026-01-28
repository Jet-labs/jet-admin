import { useState, useEffect, useCallback, useRef } from "react";
import { useSocketState } from "../contexts/socketContext";
import { getWorkflowRunStatusAPI, getWorkflowRunStatusForWidgetAPI } from "../../data/apis/workflow";

/**
 * Hook to manage asynchronous workflow data for widgets.
 * Polls for workflow completion and listens for socket events.
 * 
 * @param {object} params
 * @param {string} params.tenantID - Tenant ID
 * @param {string} params.widgetID - Widget ID
 * @param {string} params.widgetType - Widget type (bar, line, pie, etc.) for data processing
 * @param {object} params.datasetFields - Field mappings for data processing
 * @param {object} params.parameters - Additional chart parameters
 * @param {Array} params.workflowInstances - Array of workflow instances from getWidgetDataByIDAPI
 * @param {function} params.onWorkflowComplete - Callback when a workflow completes with its data
 * @returns {object} - { workflowData, isLoadingWorkflows, workflowErrors }
 */
export const useWidgetWorkflowData = ({
  tenantID,
  widgetID,
  widgetType,
  datasetFields,
  parameters,
  workflowInstances = [],
  onWorkflowComplete,
}) => {
  const { socket } = useSocketState();
  const [workflowData, setWorkflowData] = useState({});
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [workflowErrors, setWorkflowErrors] = useState({});
  const pollingIntervalsRef = useRef({});
  const mountedRef = useRef(true);

  // Determine pending workflows
  const pendingWorkflows = workflowInstances.filter(
    (wf) => wf.status === 'PENDING' && wf.instanceID
  );

  /**
   * Poll for a specific workflow instance status
   * Uses the widget-specific API to get processed data from backend
   */
  const pollWorkflowStatus = useCallback(async (instance) => {
    if (!mountedRef.current) return;

    try {
      // Use the widget-specific API if widgetType and datasetFields are provided
      // Otherwise fall back to the regular status API
      const useWidgetAPI = widgetType && datasetFields && Object.keys(datasetFields).length > 0;

      const result = useWidgetAPI
        ? await getWorkflowRunStatusForWidgetAPI({
          tenantID,
          instanceID: instance.instanceID,
          widgetType,
          datasetFields: instance.datasetFields || datasetFields,
          parameters: instance.parameters || parameters,
        })
        : await getWorkflowRunStatusAPI({
          tenantID,
          instanceID: instance.instanceID,
        });

      if (!mountedRef.current) return;

      if (result.status === 'COMPLETED') {
        // Use processed data if available, otherwise extract from contextData
        const outputData = result.data || result.contextData;

        setWorkflowData((prev) => ({
          ...prev,
          [instance.title]: {
            data: outputData,
            status: 'COMPLETED',
            instanceID: instance.instanceID,
            workflowTitle: instance.workflowTitle,
          },
        }));

        // Clear polling for this instance
        if (pollingIntervalsRef.current[instance.instanceID]) {
          clearInterval(pollingIntervalsRef.current[instance.instanceID]);
          delete pollingIntervalsRef.current[instance.instanceID];
        }

        // Notify parent
        if (onWorkflowComplete) {
          onWorkflowComplete(instance.title, outputData);
        }
      } else if (result.status === 'FAILED') {
        setWorkflowErrors((prev) => ({
          ...prev,
          [instance.title]: result.error || 'Workflow execution failed',
        }));

        // Clear polling for this instance
        if (pollingIntervalsRef.current[instance.instanceID]) {
          clearInterval(pollingIntervalsRef.current[instance.instanceID]);
          delete pollingIntervalsRef.current[instance.instanceID];
        }
      }
      // If still PENDING, continue polling
    } catch (error) {
      console.error('Error polling workflow status:', error);
      setWorkflowErrors((prev) => ({
        ...prev,
        [instance.title]: error.message || 'Failed to fetch workflow status',
      }));
    }
  }, [tenantID, widgetType, datasetFields, parameters, onWorkflowComplete]);

  /**
   * Start polling for pending workflows
   */
  const startPolling = useCallback(() => {
    if (pendingWorkflows.length === 0) {
      setIsLoadingWorkflows(false);
      return;
    }

    setIsLoadingWorkflows(true);

    pendingWorkflows.forEach((instance) => {
      // Avoid duplicate polling
      if (pollingIntervalsRef.current[instance.instanceID]) {
        return;
      }

      // Initial poll
      pollWorkflowStatus(instance);

      // Set up interval polling (every 2 seconds)
      pollingIntervalsRef.current[instance.instanceID] = setInterval(() => {
        pollWorkflowStatus(instance);
      }, 2000);
    });
  }, [pendingWorkflows, pollWorkflowStatus]);

  /**
   * Handle socket events for workflow completion
   */
  useEffect(() => {
    if (!socket) return;

    const handleWorkflowComplete = (data) => {
      // Check if this event is for one of our pending workflows
      const matchingInstance = workflowInstances.find(
        (wf) => wf.instanceID === data.instanceID
      );

      if (matchingInstance) {
        const outputKey = matchingInstance.outputVarMapping || 'result';
        const outputData = data.contextData?.[outputKey] || data.contextData;

        setWorkflowData((prev) => ({
          ...prev,
          [matchingInstance.title]: {
            data: outputData,
            status: 'COMPLETED',
            instanceID: matchingInstance.instanceID,
            workflowTitle: matchingInstance.workflowTitle,
          },
        }));

        // Clear polling for this instance
        if (pollingIntervalsRef.current[matchingInstance.instanceID]) {
          clearInterval(pollingIntervalsRef.current[matchingInstance.instanceID]);
          delete pollingIntervalsRef.current[matchingInstance.instanceID];
        }

        // Notify parent
        if (onWorkflowComplete) {
          onWorkflowComplete(matchingInstance.title, outputData);
        }
      }
    };

    socket.on('workflow_completed', handleWorkflowComplete);
    socket.on('widget_workflow_complete', handleWorkflowComplete);

    return () => {
      socket.off('workflow_completed', handleWorkflowComplete);
      socket.off('widget_workflow_complete', handleWorkflowComplete);
    };
  }, [socket, workflowInstances, onWorkflowComplete]);

  /**
   * Start polling when workflow instances change
   */
  useEffect(() => {
    startPolling();
  }, [workflowInstances]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      // Clear all polling intervals
      Object.values(pollingIntervalsRef.current).forEach(clearInterval);
      pollingIntervalsRef.current = {};
    };
  }, []);

  /**
   * Update loading state when all workflows complete
   */
  useEffect(() => {
    const completedCount = Object.keys(workflowData).length;
    const errorCount = Object.keys(workflowErrors).length;
    const totalPending = pendingWorkflows.length;

    if (totalPending > 0 && completedCount + errorCount >= totalPending) {
      setIsLoadingWorkflows(false);
    }
  }, [workflowData, workflowErrors, pendingWorkflows.length]);

  return {
    workflowData,
    isLoadingWorkflows: isLoadingWorkflows && pendingWorkflows.length > 0,
    workflowErrors,
    pendingCount: pendingWorkflows.length - Object.keys(workflowData).length - Object.keys(workflowErrors).length,
  };
};
