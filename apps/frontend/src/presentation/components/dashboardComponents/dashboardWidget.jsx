import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { FiClock, FiRefreshCw } from "react-icons/fi";
import { CONSTANTS } from "../../../constants";
import {
  getWidgetByIDAPI,
} from "../../../data/apis/widget";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { Badge, Button } from "@jet-admin/ui";
import { resolveConfig } from "../../../logic/evaluationEngine";
import { dispatchEvent, createEventHandlers } from "../../../logic/actionDispatcher";
import { testDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { executeWorkflowAPI } from "../../../data/apis/workflow";
import { resolveWidgetData } from "@jet-admin/widgets-logic";

export const DashboardWidget = ({ tenantID, widgetID, width, height, stateTree, onQueryResult }) => {
  DashboardWidget.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    stateTree: PropTypes.object,
    onQueryResult: PropTypes.func,
  };

  const widgetRef = useRef(null);
  const onLoadFiredRef = useRef(false);

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

  const handleOnWidgetInit = useCallback((widgetView) => {
    widgetRef.current = widgetView;
  }, []);

  // Dispatch context for event handlers
  const dispatchContext = useMemo(() => ({
    tenantID,
    stateTree: stateTree || {},
    onQueryResult: onQueryResult || (() => {}),
  }), [tenantID, stateTree, onQueryResult]);

  // Create event handlers from widget config
  const eventHandlers = useMemo(() => {
    if (!widget?.widgetConfig) return {};
    return createEventHandlers(widget.widgetConfig, dispatchContext);
  }, [widget?.widgetConfig, dispatchContext]);

  // Fire onLoad event once when widget is loaded
  useEffect(() => {
    if (widget && !onLoadFiredRef.current) {
      onLoadFiredRef.current = true;
      if (widget.widgetConfig?.events?.onLoad) {
        dispatchEvent("onLoad", widget.widgetConfig, dispatchContext);
      }
    }
  }, [widget, dispatchContext]);

  // ── Data Source Execution Pipeline ──
  // Execute bound data sources when widget loads (new path)
  const [dataSourceResults, setDataSourceResults] = useState(null);

  useEffect(() => {
    if (!widget?.widgetConfig?.dataSources?.length) return;

    let cancelled = false;
    const executeSources = async () => {
      const results = {};
      for (const source of widget.widgetConfig.dataSources) {
        if (!source.alias) continue;
        if (source.type === "query" && source.queryID) {
          try {
            const result = await testDataQueryByIDAPI({
              tenantID,
              dataQueryID: source.queryID,
              inputArgs: source.inputArgValues || {},
            });
            results[source.alias] = result;
          } catch (err) {
            results[source.alias] = { error: err.message || String(err) };
          }
        }
        if (source.type === "workflow" && source.workflowID) {
          try {
            const result = await executeWorkflowAPI({
              tenantID,
              workflowID: source.workflowID,
              inputArgs: source.inputArgValues || {},
            });
            results[source.alias] = result.context || result;
          } catch (err) {
            results[source.alias] = { error: err.message || String(err) };
          }
        }
      }
      if (!cancelled) setDataSourceResults(results);
    };

    executeSources();
    return () => { cancelled = true; };
  }, [widget?.widgetConfig?.dataSources, tenantID]);

  // Enrich stateTree with data source results so template expressions can resolve
  const enrichedStateTree = useMemo(() => ({
    ...stateTree,
    ...(dataSourceResults || {}),
  }), [stateTree, dataSourceResults]);

  // Resolve widget config expressions against enriched state tree
  const resolvedConfig = useMemo(() => {
    if (!widget?.widgetConfig || !enrichedStateTree) return widget?.widgetConfig;
    return resolveConfig(widget.widgetConfig, enrichedStateTree);
  }, [widget?.widgetConfig, enrichedStateTree]);

  const widgetRender = useMemo(() => {
    if (!widget) {
      return null;
    }

    const resolvedType = widget.widgetType || 'vega-lite';
    const WidgetComponent = WIDGETS_MAP[resolvedType]?.component;

    if (!WidgetComponent) {
      return {
        errorMessage: CONSTANTS.STRINGS.WIDGET_TYPE_INVALID_ERROR,
      };
    }

    return {
      Component: WidgetComponent,
      widgetType: resolvedType,
    };
  }, [widget]);

  const RenderedWidgetComponent = widgetRender?.Component;
  const refreshLabel =
    widget?.refreshInterval && widget.refreshInterval > 0
      ? `${widget.refreshInterval}s refresh`
      : null;
  const showHeader = resolvedConfig?.properties?.showHeader ?? true;

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden bg-transparent"
      style={{
        width,
        height,
      }}
    >
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingWidget}
        isFetching={isLoadingWidget}
        error={loadWidgetError}
        loadingContainerClass="bg-gradient-to-br from-background to-slate-50"
        refetch={() => {
          refetchWidget();
        }}
      >
        {widget && showHeader && (
          <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-background px-3 py-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-[#1c1c1e]">
                      {widget.widgetTitle}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {refreshLabel ? (
                  <Badge variant="outline" className="gap-1 border-slate-200 text-[11px] text-[#1c1c1e]">
                    <FiClock className="text-[11px]" />
                    {refreshLabel}
                  </Badge>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  square
                  className="h-6 w-6 text-[#1c1c1e] hover:bg-slate-100 hover:text-[#1c1c1e]"
                  onClick={() => {
                    refetchWidget();
                  }}
                  aria-label="Refresh widget"
                >
                  <FiRefreshCw className={isLoadingWidget ? "animate-spin h-3.5 w-3.5" : " h-3.5 w-3.5"} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {widgetRender?.errorMessage ? (
          <div className="flex h-full w-full items-center justify-center p-4">
            <span className="rounded border border-red-100 bg-red-50 px-3 py-2 text-center text-xs text-red-600">
              {widgetRender.errorMessage}
            </span>
          </div>
        ) : null}

        {RenderedWidgetComponent ? (() => {
          // Resolve widget data via the standardized builder pipeline
          const widgetData = resolveWidgetData({
            widgetType: widgetRender.widgetType,
            widgetConfig: resolvedConfig,
            queryResults: dataSourceResults,
          });

          return (
            <div className="min-h-0 flex-1 bg-white px-2 pb-2 pt-1">
              <RenderedWidgetComponent
                widgetTitle={widget.widgetTitle}
                widgetType={widgetRender.widgetType}
                widgetConfig={resolvedConfig}
                data={widgetData}
                onWidgetInit={handleOnWidgetInit}
                refetchInterval={widget.refreshInterval}
                refreshData={refetchWidget}
                {...eventHandlers}
              />
            </div>
          );
        })() : null}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
