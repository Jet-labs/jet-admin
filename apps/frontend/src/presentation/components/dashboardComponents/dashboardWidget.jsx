import React, { useCallback, useMemo, useRef } from "react";

import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { FiActivity, FiClock, FiRefreshCw, FiWifi } from "react-icons/fi";
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
import { Badge, Button } from "@jet-admin/ui";

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

const WORKFLOW_STATUS_META = {
  LOADING: {
    label: "Starting",
    variant: "secondary",
  },
  PENDING: {
    label: "Running",
    variant: "secondary",
  },
  COMPLETED: {
    label: "Ready",
    variant: "success",
  },
  FAILED: {
    label: "Failed",
    variant: "destructive",
  },
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
  const WidgetIcon = widget ? WIDGETS_MAP[widgetRender?.widgetType || widget.widgetType]?.icon : null;
  const workflowStatusMeta = WORKFLOW_STATUS_META[workflowStatus] || null;
  const widgetDescription = widget?.widgetDescription?.trim();
  const refreshLabel =
    widget?.refreshInterval && widget.refreshInterval > 0
      ? `${widget.refreshInterval}s refresh`
      : null;

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-[inherit] bg-transparent"
      style={{
        width,
        height,
      }}
    >
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingWidget || (!!widget && isLoadingWidgetData && !widgetData)}
        isFetching={isLoadingWidget || isLoadingWidgetData}
        error={loadWidgetError || loadWidgetDataError}
        loadingContainerClass="bg-gradient-to-br from-background to-slate-50"
        refetch={() => {
          refetchWidget();
          refetchWidgetData();
        }}
      >
        {widget && (
          <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-background px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              {/* <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  {WidgetIcon ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <WidgetIcon className="text-base" />
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-800">
                      {widget.widgetTitle}
                    </div>
                    <div className="truncate text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      {widgetRender?.widgetType || widget.widgetType}
                    </div>
                  </div>
                </div>
                {widgetDescription ? (
                  <p className="line-clamp-2 text-xs text-slate-500">
                    {widgetDescription}
                  </p>
                ) : null}
              </div> */}

              <div className="flex shrink-0 items-center gap-2">
                {refreshLabel ? (
                  <Badge variant="outline" className="gap-1 border-slate-200 text-[11px] text-slate-500">
                    <FiClock className="text-[11px]" />
                    {refreshLabel}
                  </Badge>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => {
                    refetchWidgetData();
                  }}
                  aria-label="Refresh widget"
                >
                  <FiRefreshCw className={isLoadingWidgetData ? "animate-spin" : ""} />
                </Button>
              </div>
            </div>

            {/* <div className="mt-3 flex flex-wrap items-center gap-2">
              {isLive ? (
                <Badge variant="success" className="gap-1 text-[11px]">
                  <FiWifi className="text-[11px]" />
                  Live
                </Badge>
              ) : null}
              {isWorkflowRunning ? (
                <Badge variant="secondary" className="gap-1 text-[11px] text-blue-700">
                  <FiActivity className="animate-pulse text-[11px]" />
                  Running
                </Badge>
              ) : null}
              {workflowStatusMeta ? (
                <Badge variant={workflowStatusMeta.variant} className="text-[11px]">
                  {workflowStatusMeta.label}
                </Badge>
              ) : null}
            </div> */}
          </div>
        )}

        {widgetRender?.errorMessage ? (
          <div className="flex h-full w-full items-center justify-center p-4">
            <span className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-center text-xs text-red-600">
              {widgetRender.errorMessage}
            </span>
          </div>
        ) : null}

        {RenderedWidgetComponent ? (
          <div className="min-h-0 flex-1 bg-background px-2 pb-2 pt-1">
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
          </div>
        ) : null}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};

