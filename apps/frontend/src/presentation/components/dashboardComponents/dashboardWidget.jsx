import React, { useState, useCallback, useMemo } from "react";

import { WIDGETS_MAP } from "@jet-admin/widgets";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import {
  getWidgetByIDAPI,
  getWidgetDataByIDAPI,
} from "../../../data/apis/widget";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { useWidgetWorkflowData } from "../../../logic/hooks/useWidgetWorkflowData";

export const DashboardWidget = ({ tenantID, widgetID, width, height }) => {
  DashboardWidget.propTypes = {
    tenantID: PropTypes.number.isRequired,
    widgetID: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };

  const [mergedWorkflowData, setMergedWorkflowData] = useState({});

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

  const {
    isLoading: isLoadingWidgetData,
    data: widgetData,
    error: loadWidgetDataError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), widgetID, "data"],
    queryFn: () => getWidgetDataByIDAPI({ tenantID, widgetID }),
    refetchOnWindowFocus: false,
  });

  // Handle workflow data completion
  const handleWorkflowComplete = useCallback((title, data) => {
    setMergedWorkflowData((prev) => ({
      ...prev,
      [title]: data,
    }));
  }, []);

  // Use the workflow data hook
  const {
    workflowData,
    isLoadingWorkflows,
    workflowErrors,
    pendingCount,
  } = useWidgetWorkflowData({
    tenantID,
    widgetID,
    workflowInstances: widgetData?.workflowInstances || [],
    onWorkflowComplete: handleWorkflowComplete,
  });

  // Determine if we have any pending workflow data
  const hasWorkflowInstances = (widgetData?.workflowInstances || []).length > 0;
  const isWorkflowsComplete = pendingCount === 0;

  // Combine query data with workflow data for display
  const combinedData = useMemo(() => {
    if (!widgetData?.data) return null;

    // If there are no workflow instances, just return query data
    if (!hasWorkflowInstances) {
      return widgetData.data;
    }

    // Merge workflow data into the result
    // The structure depends on the widget type, but we'll add workflow results
    const workflowResults = Object.entries(workflowData).reduce((acc, [title, wfData]) => {
      if (wfData.data) {
        acc[title] = wfData.data;
      }
      return acc;
    }, {});

    // If the original data is an object, merge workflow data
    if (typeof widgetData.data === 'object' && !Array.isArray(widgetData.data)) {
      return {
        ...widgetData.data,
        workflowData: workflowResults,
      };
    }

    // For array data, append workflow results as additional data source
    return {
      queryData: widgetData.data,
      workflowData: workflowResults,
    };
  }, [widgetData, workflowData, hasWorkflowInstances]);

  // Show loading state for workflows
  const showWorkflowLoading = hasWorkflowInstances && isLoadingWorkflows && pendingCount > 0;

  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden relative"
      style={{
        width: width,
        height: height,
      }}
    >
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingWidget || isLoadingWidgetData}
        isFetching={isLoadingWidget || isLoadingWidgetData}
        error={loadWidgetError || loadWidgetDataError}
        refetch={refetchWidget}
      >
        {/* Workflow loading indicator */}
        {showWorkflowLoading && (
          <div className="absolute top-1 right-1 z-10 flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
            <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span>{pendingCount} workflow{pendingCount > 1 ? 's' : ''} running</span>
          </div>
        )}

        {/* Workflow errors indicator */}
        {Object.keys(workflowErrors).length > 0 && (
          <div className="absolute top-1 left-1 z-10 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">
            {Object.keys(workflowErrors).length} workflow error{Object.keys(workflowErrors).length > 1 ? 's' : ''}
          </div>
        )}

        {widget &&
          WIDGETS_MAP[widget.widgetType]?.component({
            widgetTitle: widget.widgetTitle,
            widgetConfig: widget.widgetConfig,
            data: combinedData || widgetData?.data,
            refetchInterval: widget.widgetConfig?.refetchInterval,
            // Pass workflow-specific data for advanced widgets
            workflowData: workflowData,
            isLoadingWorkflows: isLoadingWorkflows,
          })}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
