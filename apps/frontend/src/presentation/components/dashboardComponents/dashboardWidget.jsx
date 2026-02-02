import React, { useState, useCallback, useMemo, useEffect } from "react";

import { WIDGETS_MAP } from "@jet-admin/widgets";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import {
  getWidgetByIDAPI,
  getWidgetDataByIDAPI,
} from "../../../data/apis/widget";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
// Use the merged hook
import { useWidgetRun, WIDGET_EXECUTION_MODES } from "../widgetComponents/useWidgetRun";

export const DashboardWidget = ({ tenantID, widgetID, width, height }) => {
  DashboardWidget.propTypes = {
    tenantID: PropTypes.number.isRequired,
    widgetID: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };

  // Fetch widget configuration
  const {
    isLoading: isLoadingWidget,
    data: widget,
    error: loadWidgetError,
    refetch: refetchWidget,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), widgetID],
    queryFn: () => getWidgetByIDAPI({ tenantID, widgetID }),
    refetchOnWindowFocus: false,
  });

  // Fetch widget data (triggers workflow execution for workflow mode)
  const {
    isLoading: isLoadingWidgetData,
    data: widgetData,
    error: loadWidgetDataError,
    refetch: refetchWidgetData,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), widgetID, "data"],
    queryFn: () => getWidgetDataByIDAPI({ tenantID, widgetID }),
    refetchOnWindowFocus: false,
    // Disable automatic refetch if we are going to use the hook to manage it?
    // Actually, stick to React Query for initial load, passthrough to hook as 'initialData'
  });

  // Determine Execution Mode (Default to ASYNC/Live for workflows)
  const executionMode = useMemo(() => {
    if (widget?.workflowConfig?.mode === 'polling') return WIDGET_EXECUTION_MODES.SYNC; // Or legacy polling
    return WIDGET_EXECUTION_MODES.ASYNC;
  }, [widget]);

  // Use the merged hook for execution management (Socket + Data merging)
  const {
    data: finalData,
    isLoading: isWorkflowRunning,
    isLive,
    workflowStatus,
    resolveVariable,
    // On Dashboard, we might assume the "Initial Fetch" above triggered the execution
    // So we pass the `widgetData` result (which contains instanceID) to the hook
  } = useWidgetRun({
    tenantID,
    widgetID,
    widgetFetchedData: widgetData, // Pass the Initial Data
    executionMode,
    // Workflow Params for Socket
    workflowID: widget?.workflowID,
    widgetType: widget?.widgetType,
    datasetFields: widget?.workflowConfig?.datasetFields,
    parameters: widget?.workflowConfig?.parameters,
  });

  // Debug: Log immediately on every render to see if component renders at all
  console.log(`[DashboardWidget RENDER] widgetID=${widgetID}`, { finalData, wsProcessedData: finalData?.workflowInstances?.data });

  useEffect(() => {
    console.log(`[DashboardWidget useEffect] widgetID=${widgetID}`, finalData, isWorkflowRunning, isLive, workflowStatus);
  }, [finalData, isWorkflowRunning, isLive, workflowStatus, widgetID]);


  // Extract data for display
  const displayData = useMemo(() => {
    // If hook gives us data (merged or socket), use it
    if (finalData?.workflowInstances?.data) return finalData.workflowInstances.data;
    if (finalData?.data) return finalData.data;

    // Fallback to query data directly if hook hasn't processed it yet
    return widgetData?.data;
  }, [finalData, widgetData]);


  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden relative"
      style={{
        width: width,
        height: height,
      }}
    >
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingWidget || (isLoadingWidgetData && !widgetData)}
        isFetching={isLoadingWidget || isLoadingWidgetData}
        error={loadWidgetError || loadWidgetDataError}
        refetch={() => { refetchWidget(); refetchWidgetData(); }}
      >
        {/* WebSocket connection indicator */}
        {isLive && (
          <div className={`absolute top-1 left-1 z-10 w-2 h-2 rounded-full bg-green-500`}
            title="Live Connection" />
        )}

        {/* Workflow loading indicator */}
        {isWorkflowRunning && (
          <div className="absolute top-1 right-1 z-10 flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
            <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span>Running...</span>
          </div>
        )}

        {widget &&
          WIDGETS_MAP[widget.widgetType]?.component({
            widgetTitle: widget.widgetTitle,
            widgetConfig: widget.widgetConfig,
            data: displayData,
            refetchInterval: widget.widgetConfig?.refetchInterval,
            // Pass advanced props
            isLoadingWorkflows: isWorkflowRunning,
            isConnected: isLive,
            workflowStatus: workflowStatus,
            resolveVariable: resolveVariable,
          })}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};

