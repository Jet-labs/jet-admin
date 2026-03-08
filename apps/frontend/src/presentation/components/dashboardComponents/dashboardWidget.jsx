import React, { useCallback, useMemo, useRef } from "react";

import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import {
  getWidgetByIDAPI,
  getWidgetDataByIDAPI,
} from "../../../data/apis/widget";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import {
  useWidgetRun,
  WIDGET_EXECUTION_MODES,
} from "../widgetComponents/useWidgetRun";

const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;

  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }

  return current;
};

const extractWidgetData = (rawData) => {
  if (Array.isArray(rawData)) return rawData;

  if (rawData && typeof rawData === "object") {
    if (rawData.$schema) return rawData;
    if (Array.isArray(rawData.data)) return rawData.data;
    if (Array.isArray(rawData.rows)) return rawData.rows;
    if (Array.isArray(rawData.items)) return rawData.items;
    if (Array.isArray(rawData.values)) return rawData.values;
  }

  return undefined;
};

const getChartData = (data) => {
  if (data?.workflowInstances?.data) return data.workflowInstances.data;
  if (data?.data) return data.data;
  return data;
};

export const DashboardWidget = ({ tenantID, widgetID, width, height }) => {
  DashboardWidget.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };

  const widgetRef = useRef(null);

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

  const executionMode = useMemo(() => {
    if (widget?.workflowConfig?.mode === "polling") {
      return WIDGET_EXECUTION_MODES.SYNC;
    }

    return WIDGET_EXECUTION_MODES.ASYNC;
  }, [widget]);

  const {
    isLoading: isLoadingWidgetData,
    data: widgetData,
    error: loadWidgetDataError,
    refetch: refetchWidgetData,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
      widgetID,
      "data",
      executionMode,
    ],
    queryFn: () => getWidgetDataByIDAPI({ tenantID, widgetID, executionMode }),
    refetchOnWindowFocus: false,
    enabled: !!widget,
  });

  const {
    data: finalData,
    isRunning: isWorkflowRunning,
    isLive,
    workflowStatus,
    resolveVariable,
    context: workflowContext,
  } = useWidgetRun({
    tenantID,
    widgetID,
    widgetFetchedData: widgetData,
    executionMode,
    workflowID: widget?.workflowID,
    widgetType: widget?.widgetType,
    datasetFields: widget?.workflowConfig?.datasetFields,
    parameters: widget?.workflowConfig?.parameters,
  });

  const handleOnWidgetInit = useCallback((widgetView) => {
    widgetRef.current = widgetView;
  }, []);

  const widgetRender = useMemo(() => {
    if (!widget) {
      return null;
    }

    if (widget.widgetConfig?.vegaSpec) {
      const WidgetComponent = WIDGETS_MAP["vega-lite"]?.component;

      if (!WidgetComponent) {
        return { errorMessage: "VegaWidget not available" };
      }

      let specToRender = {};

      try {
        specToRender =
          typeof widget.widgetConfig.vegaSpec === "string"
            ? JSON.parse(widget.widgetConfig.vegaSpec)
            : JSON.parse(JSON.stringify(widget.widgetConfig.vegaSpec));
      } catch {
        return { errorMessage: "Invalid Vega Spec JSON" };
      }

      let vegaData = [];
      let dataResolved = false;

      if (
        specToRender?.data &&
        typeof specToRender.data.values === "string"
      ) {
        const ctxMatch = specToRender.data.values.match(/\{\{ctx\.([^}]+)\}\}/);

        if (ctxMatch && workflowContext) {
          const extractedData = extractWidgetData(
            resolvePath(workflowContext, ctxMatch[1])
          );

          if (extractedData !== undefined) {
            vegaData = extractedData;
            dataResolved = true;
          } else {
            dataResolved = true;
          }
        }
      }

      if (!dataResolved) {
        const extractedData = extractWidgetData(getChartData(finalData));

        if (extractedData !== undefined) {
          vegaData = extractedData;
        }
      }

      if (vegaData && vegaData.$schema) {
        specToRender = vegaData;
      } else {
        specToRender.data = {
          ...(specToRender.data || {}),
          values: Array.isArray(vegaData) ? vegaData : [],
        };
      }

      return {
        Component: WidgetComponent,
        data: JSON.parse(JSON.stringify(specToRender)),
        widgetType: "vega-lite",
      };
    }

    const WidgetComponent = WIDGETS_MAP[widget.widgetType]?.component;

    if (!WidgetComponent) {
      return {
        errorMessage: CONSTANTS.STRINGS.WIDGET_TYPE_INVALID_ERROR,
      };
    }

    return {
      Component: WidgetComponent,
      data: getChartData(finalData),
      widgetType: widget.widgetType,
    };
  }, [finalData, widget, workflowContext]);

  const RenderedWidgetComponent = widgetRender?.Component;

  return (
    <div
      className="flex flex-col items-center justify-center overflow-hidden relative"
      style={{
        width,
        height,
      }}
    >
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingWidget || (!!widget && isLoadingWidgetData && !widgetData)}
        isFetching={isLoadingWidget || isLoadingWidgetData}
        error={loadWidgetError || loadWidgetDataError}
        refetch={() => {
          refetchWidget();
          refetchWidgetData();
        }}
      >
        {isLive && (
          <div
            className="absolute top-1 left-1 z-10 w-2 h-2 rounded-full bg-green-500"
            title="Live Connection"
          />
        )}

        {isWorkflowRunning && (
          <div className="absolute top-1 right-1 z-10 flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
            <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span>Running...</span>
          </div>
        )}

        {widgetRender?.errorMessage ? (
          <div className="h-full w-full p-3 flex justify-center items-center">
            <span style={{ color: "#dc2626", fontSize: "12px" }}>
              {widgetRender.errorMessage}
            </span>
          </div>
        ) : null}

        {RenderedWidgetComponent ? (
          <RenderedWidgetComponent
            widgetTitle={widget.widgetTitle}
            widgetType={widgetRender.widgetType}
            widgetConfig={widget.widgetConfig}
            data={widgetRender.data}
            onWidgetInit={handleOnWidgetInit}
            refetchInterval={widget.refreshInterval}
            refreshData={refetchWidgetData}
            isLoadingWorkflows={isWorkflowRunning}
            isConnected={isLive}
            workflowStatus={workflowStatus}
            resolveVariable={resolveVariable}
          />
        ) : null}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};

