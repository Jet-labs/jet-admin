/**
 * AppPageWidgetSlot
 *
 * Runtime-aware widget container that renders widgets on App Pages.
 * Integrates with the AppPage runtime context to:
 * - Resolve widget config expressions against the page state tree
 * - Execute widget events through the page-level action chain
 * - Manage widget-local state and method registration
 * - Execute widget-level data sources via the page runtime
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock, RefreshCw, X } from "lucide-react";
import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import { getWidgetByIDAPI } from "../../../data/apis/widget";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { Badge, Button, Card, ErrorBoundary } from "@jet-admin/ui";
import { resolveWidgetData } from "@jet-admin/widgets-logic";
import { useComponentSize } from "../../../logic/hooks/useComponentSize";

// AppPage runtime hooks
import {
  useAppPageStateTree,
  useWidgetState,
  useWidgetMethodRegistry,
  useWidgetEventHandlers,
} from "../../../logic/appPageRuntime";
import { resolveConfig } from "../../../logic/evaluationEngine";

/**
 * Memoized wrapper that stabilizes the data prop for widget components.
 * Prevents infinite re-render loops caused by resolveWidgetData() creating
 * new object references (via JSON.parse/stringify) on every render.
 */
const MemoizedWidgetContent = React.memo(({
  RenderedWidgetComponent,
  widgetTitle,
  widgetType,
  resolvedConfig,
  stateTreeQueries,
  handleOnWidgetInit,
  refreshInterval,
  refetchWidget,
  fireWidgetEvent,
  runtimeEventHandlers,
  widgetState,
  setWidgetState,
  widgetID,
}) => {
  const widgetData = useMemo(() => {
    return resolveWidgetData({
      widgetType,
      widgetConfig: resolvedConfig,
      dataSourceResults: stateTreeQueries,
    });
  }, [widgetType, resolvedConfig, stateTreeQueries]);

  const refreshData = useCallback(() => {
    refetchWidget();
    fireWidgetEvent("onRefresh");
  }, [refetchWidget, fireWidgetEvent]);

  return (
    <RenderedWidgetComponent
      widgetID={widgetID}
      widgetTitle={widgetTitle}
      widgetType={widgetType}
      widgetConfig={resolvedConfig}
      data={widgetData}
      onWidgetInit={handleOnWidgetInit}
      refetchInterval={refreshInterval}
      refreshData={refreshData}
      fireWidgetEvent={fireWidgetEvent}
      widgetState={widgetState}
      setWidgetState={setWidgetState}
      {...runtimeEventHandlers}
    />
  );
});

export const AppPageWidgetSlot = ({
  tenantID,
  widgetKey,
  index,
  handleDelete,
  editable = false,
  sizing,
}) => {
  AppPageWidgetSlot.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    widgetKey: PropTypes.string.isRequired,
    index: PropTypes.number,
    handleDelete: PropTypes.func,
    editable: PropTypes.bool,
    sizing: PropTypes.string,
  };

  // Extract widgetID from the key format "widget_<uuid>"
  const widgetID = String(widgetKey).split("_")[1];
  const [ref, size] = useComponentSize();
  const [isMouseHover, setIsMouseHover] = useState(false);
  const onLoadFiredRef = useRef(false);

  // ── Fetch widget definition from API ──
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

  // ── AppPage Runtime Integration ──
  const stateTree = useAppPageStateTree();
  const { widgetState, setWidgetState } = useWidgetState(widgetID);
  const { registerWidgetMethods } = useWidgetMethodRegistry(widgetID);
  const { fireWidgetEvent } = useWidgetEventHandlers(
    widgetID,
    widget?.widgetConfig
  );

  // Fire onLoad event once when widget is loaded
  useEffect(() => {
    if (widget && !onLoadFiredRef.current) {
      onLoadFiredRef.current = true;
      if (widget.widgetConfig?.events?.onLoad) {
        fireWidgetEvent("onLoad");
      }
    }
  }, [widget, fireWidgetEvent]);

  // Register widget methods (e.g., for table: refresh, setSelectedRow)
  const handleOnWidgetInit = useCallback(
    (widgetView) => {
      if (widgetView && typeof widgetView === "object") {
        registerWidgetMethods(widgetView);
      }
    },
    [registerWidgetMethods]
  );

  // ── Config Resolution ──
  // Resolve {{ }} expressions in widget config against the page state tree.
  // We structurally compare via JSON to return a stable reference when content
  // hasn't changed — this prevents React.memo bypass on child widgets when
  // unrelated parts of stateTree update (e.g., widgetMethods registration).
  const resolvedConfigRef = useRef(null);
  const resolvedConfigKeyRef = useRef(null);
  const resolvedConfig = useMemo(() => {
    if (!widget?.widgetConfig || !stateTree) return widget?.widgetConfig;
    const resolved = resolveConfig(widget.widgetConfig, stateTree);
    try {
      const key = JSON.stringify(resolved);
      if (key === resolvedConfigKeyRef.current) {
        return resolvedConfigRef.current; // Same content → same reference
      }
      resolvedConfigKeyRef.current = key;
      resolvedConfigRef.current = resolved;
    } catch {
      resolvedConfigRef.current = resolved;
    }
    return resolved;
  }, [widget?.widgetConfig, stateTree]);

  // ── Widget Type Resolution ──
  const widgetRender = useMemo(() => {
    if (!widget) return null;

    const resolvedType = widget.widgetType || "vega-lite";
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
  
  const widgetStyleProps = resolvedConfig?.properties?.style || {};
  const customCSS = widgetStyleProps.customCSS;
  const customCSSClassName = customCSS ? `custom-widget-${widgetID}` : "";

  const widgetInlineStyle = {
    ...(widgetStyleProps.backgroundColor && { backgroundColor: widgetStyleProps.backgroundColor }),
    ...(widgetStyleProps.textColor && { color: widgetStyleProps.textColor }),
    ...(widgetStyleProps.padding && { padding: widgetStyleProps.padding }),
    ...(widgetStyleProps.borderWidth && { borderWidth: widgetStyleProps.borderWidth }),
    ...(widgetStyleProps.borderColor && { borderColor: widgetStyleProps.borderColor }),
    ...(widgetStyleProps.borderRadius && { borderRadius: widgetStyleProps.borderRadius }),
    ...(widgetStyleProps.showBorder === false && { border: "none", boxShadow: "none" }),
  };

  // ── Create event handlers that bridge widget events to the runtime ──
  const runtimeEventHandlers = useMemo(() => {
    if (!widget?.widgetConfig?.events) return {};
    const handlers = {};
    for (const eventType of Object.keys(widget.widgetConfig.events)) {
      handlers[eventType] = (...inputs) => fireWidgetEvent(eventType, { inputs });
    }
    return handlers;
  }, [widget?.widgetConfig?.events, fireWidgetEvent]);

  return (
    <>
      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: `.${customCSSClassName} { ${customCSS} }` }} />
      )}
      <Card
        className={`!h-full !w-full flex-grow relative rounded-none overflow-hidden bg-background/95 transition-all duration-200 ${
          widgetStyleProps.showBorder !== false ? "border shadow-sm" : ""
        } ${isMouseHover ? "border-primary" : "border-border/80"} ${customCSSClassName}`}
        style={widgetInlineStyle}
        onMouseEnter={editable ? () => setIsMouseHover(true) : null}
        onMouseLeave={editable ? () => setIsMouseHover(false) : null}
        onClick={editable ? (e) => e.stopPropagation() : null}
      >
        {/* Delete button (editor mode only) */}
      {handleDelete && isMouseHover && editable && (
        <div className="absolute right-0 top-0 z-50">
          <Button
            onClick={() => handleDelete(index)}
            variant="destructive-ghost"
            size="sm"
            square
            className="rounded-none p-0 bg-primary/10 text-primary h-6 w-6"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label="Remove widget"
          >
            <X className="!text-[10px]" />
          </Button>
        </div>
      )}

      <div
        className="!flex-row justify-center !items-center !w-full !h-full"
        ref={!sizing ? ref : null}
      >
        <div
          className="relative flex h-full flex-col overflow-hidden bg-transparent w-full"
          style={!sizing ? { width: size.width, height: size.height } : { width: "100%", height: "100%" }}
        >
          <ReactQueryLoadingErrorWrapper
            isLoading={isLoadingWidget}
            isFetching={isLoadingWidget}
            error={loadWidgetError}
            loadingContainerClass="bg-gradient-to-br from-background to-muted/50"
            refetch={() => refetchWidget()}
          >
            {/* Widget Header */}
            {widget && showHeader && (
              <div className="border-b border-border/80 bg-gradient-to-r from-muted/50 to-background px-3 py-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-foreground">
                          {widget.widgetTitle}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {refreshLabel ? (
                      <Badge
                        variant="outline"
                        className="gap-1 border-border text-[11px] text-foreground"
                      >
                        <Clock className="text-[11px]" />
                        {refreshLabel}
                      </Badge>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      square
                      className="h-6 w-6 text-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => {
                        refetchWidget();
                        fireWidgetEvent("onRefresh");
                      }}
                      aria-label="Refresh widget"
                    >
                      <RefreshCw
                        className={
                          isLoadingWidget
                            ? "animate-spin h-3.5 w-3.5"
                            : "h-3.5 w-3.5"
                        }
                      />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {widgetRender?.errorMessage ? (
              <div className="flex h-full w-full items-center justify-center p-4">
                <span className="rounded-sm border border-red-100 bg-red-950/40 px-3 py-2 text-center text-xs text-red-600">
                  {widgetRender.errorMessage}
                </span>
              </div>
            ) : null}

            {/* Widget Content */}
            {RenderedWidgetComponent
              ? (
                <div className="min-h-0 flex-1 bg-background">
                  <ErrorBoundary title="Widget Render Error">
                    <MemoizedWidgetContent
                      RenderedWidgetComponent={RenderedWidgetComponent}
                      widgetTitle={widget.widgetTitle}
                      widgetType={widgetRender.widgetType}
                      resolvedConfig={resolvedConfig}
                      stateTreeQueries={stateTree.queries}
                      handleOnWidgetInit={handleOnWidgetInit}
                      refreshInterval={widget.refreshInterval}
                      refetchWidget={refetchWidget}
                      fireWidgetEvent={fireWidgetEvent}
                      runtimeEventHandlers={runtimeEventHandlers}
                      widgetState={widgetState}
                      setWidgetState={setWidgetState}
                      widgetID={widgetID}
                    />
                  </ErrorBoundary>
                </div>
              )
              : null}
          </ReactQueryLoadingErrorWrapper>
        </div>
      </div>
    </Card>
    </>
  );
};
