/**
 * AppPageWidgetSlot
 *
 * Runtime-aware widget container that renders widgets on App Pages.
 * Integrates with the AppPage runtime context to:
 * - Resolve widget config expressions against the page state tree
 * - Execute widget events through the page-level action chain
 * - Manage widget-local state and method registration
 * - Execute widget-level data sources via the page runtime
 *
 * Fix: Uses parseWidgetKey() utility instead of inline split for reliable ID extraction.
 */

import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppPageMetaContext } from "../../../../logic/appPageRuntime/AppPageRuntimeProvider";
import { Clock, Play, RefreshCw, X } from "lucide-react";
import { useCraftEditorContext } from "../layout/components/CraftEditorContext.js";
import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../../constants";
import { getWidgetByIDAPI } from "../../../../data/apis/widget";
import { ReactQueryLoadingErrorWrapper } from "../../ui/reactQueryLoadingErrorWrapper";
import { Button, Card, ErrorBoundary } from "@jet-admin/ui";
import { resolveWidgetData } from "@jet-admin/widgets-logic";

import {
  useAppPageStateTree,
  useWidgetState,
  useWidgetMethodRegistry,
  useWidgetEventHandlers,
} from "../../../../logic/appPageRuntime";
import { resolveConfig } from "../../../../logic/evaluationEngine";
import {
  buildIterationWidgetsView,
  deriveSlotIdentity,
  groupInstancesByResource,
} from "../../../../logic/appPageRuntime/widgetInstanceIdentity";
import { shapeTableRowSelect } from "../../../../logic/appPageRuntime/useWidgetEventHandlers";
import { getWidgetDisplayName } from "../../../../utils/widgetDisplay";
import { useWidgetDraftStore } from "../../../../logic/stores/widgetDraftStore";
import { useApplicationEventFacade } from "../../../../logic/applicationRuntime/applicationEventBus";
import CompositeWidgetBody from "../layout/components/CompositeWidgetBody.jsx";

const hasStyleValue = (value) => value !== undefined && value !== null && value !== "";

const WidgetContent = ({
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
  resourceID,
  placementKey,
  instanceID,
  emitApplicationEvent,
  subscribeApplicationEvent,
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

  // Drill-down wiring for Vega charts: VegaWidget calls these with { datum } /
  // { value } payloads. Route them through fireWidgetEvent with the same shape
  // so actions can bind {{ event.datum.<field> }} / {{ event.value }}.
  // These override the generic runtimeEventHandlers wrapper (which would nest
  // the payload under { inputs }) for these two event types.
  const drillHandlers = useMemo(() => {
    if (widgetType !== "vega" && widgetType !== "vega-lite") return {};
    return {
      onMarkClick: (payload) => fireWidgetEvent("onMarkClick", payload || {}),
      onBrush: (payload) => fireWidgetEvent("onBrush", payload || {}),
    };
  }, [widgetType, fireWidgetEvent]);

  // Shaped table row-selection route (B04/F02): TableWidget notifies ONLY the
  // direct onRowSelect(row, rowIndex) callback. Shape it here into exactly one
  // flat fireWidgetEvent call ({{ event.row }} / {{ event.rowIndex }}) instead
  // of the generic { inputs } nesting, and instead of a second direct fire.
  const tableHandlers = useMemo(() => {
    if (widgetType !== "table") return {};
    return {
      onRowSelect: shapeTableRowSelect(fireWidgetEvent),
    };
  }, [widgetType, fireWidgetEvent]);

  return (
    <RenderedWidgetComponent
      widgetID={widgetID}
      resourceID={resourceID}
      placementKey={placementKey}
      instanceID={instanceID || widgetID}
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
      emitApplicationEvent={emitApplicationEvent}
      subscribeApplicationEvent={subscribeApplicationEvent}
      {...runtimeEventHandlers}
      {...drillHandlers}
      {...tableHandlers}
    />
  );
};

WidgetContent.propTypes = {
  RenderedWidgetComponent: PropTypes.elementType.isRequired,
  widgetTitle: PropTypes.string,
  widgetType: PropTypes.string.isRequired,
  resolvedConfig: PropTypes.object,
  stateTreeQueries: PropTypes.object,
  handleOnWidgetInit: PropTypes.func,
  refreshInterval: PropTypes.number,
  refetchWidget: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
  runtimeEventHandlers: PropTypes.object,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  resourceID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placementKey: PropTypes.string,
  instanceID: PropTypes.string,
  emitApplicationEvent: PropTypes.func,
  subscribeApplicationEvent: PropTypes.func,
};

const MemoizedWidgetContent = React.memo(WidgetContent);

export const AppPageWidgetSlot = ({
  tenantID,
  widgetKey,
  index,
  handleDelete,
  editable = false,
  scopedStateTree = null,
  repeatPath = [],
  layoutRadius,
}) => {
  // B24 identity split: resourceID (persisted definition) vs instanceID
  // (placement key, repeat-qualified inside repeats). State, methods and
  // events are keyed by instanceID; fetches use resourceID.
  const {
    resourceID,
    placementKey,
    repeatPath: normalizedRepeatPath,
    instanceID,
  } = deriveSlotIdentity(widgetKey, repeatPath);
  const [isMouseHover, setIsMouseHover] = useState(false);
  const [hydrated, setHydrated] = useState(() => !editable);
  const shellRef = useRef(null);
  const onLoadFiredRef = useRef(false);
  const runtimeServices = useContext(AppPageMetaContext)?.runtimeServices;
  const { previewMode } = useCraftEditorContext();
  const shouldHydrateLazily = editable && !previewMode;
  const {
    emitApplicationEvent,
    subscribeApplicationEvent,
  } = useApplicationEventFacade();

  const {
    isLoading: isLoadingWidget,
    data: widget,
    error: loadWidgetError,
    refetch: refetchWidget,
  } = useQuery({
    queryKey: runtimeServices
      ? ["application-widget", tenantID, runtimeServices.identity, resourceID]
      : [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), resourceID],
    queryFn: () => runtimeServices
      ? runtimeServices.resolveWidget(resourceID)
      : getWidgetByIDAPI({ tenantID, widgetID: resourceID }),
    refetchOnWindowFocus: false,
  });
  const draft = useWidgetDraftStore((state) => state.drafts[String(resourceID)]);

  const globalStateTree = useAppPageStateTree();
  const baseStateTree = scopedStateTree || globalStateTree;
  const { widgetState, setWidgetState } = useWidgetState(instanceID);
  const { registerWidgetMethods } = useWidgetMethodRegistry(instanceID);
  const identityMeta = useMemo(
    () => ({
      resourceID,
      placementKey,
      repeatPath: normalizedRepeatPath,
    }),
    [resourceID, placementKey, normalizedRepeatPath]
  );
  const { fireWidgetEvent } = useWidgetEventHandlers(
    instanceID,
    widget?.widgetConfig,
    identityMeta
  );
  // F12: inside a repeat iteration, bare placement/resource refs in this
  // placement's own config resolve to the firing iteration (deterministic per
  // iteration), while global instance keys stay addressable explicitly.
  const stateTree = useMemo(() => {
    if (!baseStateTree || normalizedRepeatPath.length === 0) return baseStateTree;
    const globalWidgets = baseStateTree.widgets || {};
    if (globalWidgets[instanceID] === undefined) return baseStateTree;
    const groups = groupInstancesByResource(Object.keys(globalWidgets));
    const list = groups[resourceID] || [];
    const solePlacement =
      list.length >= 1 &&
      list.every((id) => id === instanceID || id.startsWith(`${placementKey}::`));
    return {
      ...baseStateTree,
      widgets: buildIterationWidgetsView({
        globalWidgets,
        placementKey,
        resourceID,
        instanceID,
        solePlacementForResource: solePlacement,
      }),
    };
  }, [baseStateTree, normalizedRepeatPath, instanceID, placementKey, resourceID]);

  useEffect(() => {
    if (widget && !onLoadFiredRef.current) {
      onLoadFiredRef.current = true;
      if (widget.widgetConfig?.events?.onLoad) {
        fireWidgetEvent("onLoad");
      }
    }
  }, [widget, fireWidgetEvent]);

  // Design-mode hydration: keep heavy widget bodies unmounted until the slot
  // scrolls into view, then hydrate on the next idle frame. Viewer and preview
  // mode render immediately. Users can force a single widget with the button.
  useEffect(() => {
    if (!shouldHydrateLazily || hydrated) return undefined;
    const node = shellRef.current;
    if (!node) return undefined;
    let cancelled = false;
    let idleHandle = null;
    let timer = null;

    const hydrate = () => {
      if (cancelled) return;
      const idle =
        typeof window !== "undefined" && typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback.bind(window)
          : null;
      if (idle) {
        idleHandle = idle(() => {
          if (!cancelled) setHydrated(true);
        }, { timeout: 800 });
      } else {
        timer = window.setTimeout(() => {
          if (!cancelled) setHydrated(true);
        }, 120);
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      hydrate();
      return () => {
        cancelled = true;
        if (idleHandle && window.cancelIdleCallback) window.cancelIdleCallback(idleHandle);
        if (timer) window.clearTimeout(timer);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          hydrate();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (idleHandle && window.cancelIdleCallback) window.cancelIdleCallback(idleHandle);
      if (timer) window.clearTimeout(timer);
    };
  }, [shouldHydrateLazily, hydrated, widgetKey]);

  useEffect(() => {
    setHydrated(!shouldHydrateLazily);
  }, [shouldHydrateLazily, widgetKey]);

  useEffect(() => {
    const hydrateAll = () => setHydrated(true);
    window.addEventListener("craft-hydrate-widgets", hydrateAll);
    return () => window.removeEventListener("craft-hydrate-widgets", hydrateAll);
  }, []);

  const handleOnWidgetInit = useCallback(
    (widgetView) => {
      if (widgetView && typeof widgetView === "object") {
        registerWidgetMethods(widgetView);
      }
    },
    [registerWidgetMethods]
  );

  const resolvedConfigRef = useRef(null);
  const resolvedConfigKeyRef = useRef(null);
  const sourceConfig = draft?.config || widget?.widgetConfig;
  const resolvedConfig = useMemo(() => {
    if (!sourceConfig || !stateTree) return sourceConfig;
    const resolved = (runtimeServices?.resolveConfig || resolveConfig)(sourceConfig, stateTree);
    try {
      const key = JSON.stringify(resolved);
      if (key === resolvedConfigKeyRef.current) {
        return resolvedConfigRef.current;
      }
      resolvedConfigKeyRef.current = key;
      resolvedConfigRef.current = resolved;
    } catch {
      resolvedConfigRef.current = resolved;
    }
    return resolved;
  }, [sourceConfig, stateTree, runtimeServices]);

  const widgetRender = useMemo(() => {
    if (!widget) return null;

    const resolvedType = draft?.widgetType || widget.widgetType || "vega-lite";

    if (resolvedType === "composite") {
      return {
        composite: resolvedConfig?.composite || widget.widgetConfig?.composite || null,
        isComposite: true,
        widgetType: resolvedType,
      };
    }

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
  }, [widget, draft?.widgetType, resolvedConfig]);

  const RenderedWidgetComponent = widgetRender?.Component;
  const refreshLabel =
    widget?.refreshInterval && widget.refreshInterval > 0
      ? `${widget.refreshInterval}s refresh`
      : null;
  const showHeader = resolvedConfig?.properties?.showHeader ?? true;
  const density = resolvedConfig?.properties?.density || "comfortable";
  const ariaLabel = resolvedConfig?.properties?.ariaLabel || undefined;
  const testId = resolvedConfig?.properties?.testId || undefined;
  const isHidden = resolvedConfig?.properties?.hidden === true || resolvedConfig?.properties?.hidden === "true";

  const widgetStyleProps = resolvedConfig?.properties?.style || {};
  const customCSS = widgetStyleProps.customCSS;
  // Style content is per-resource; keep the class resource-keyed so duplicate
  // placements share it (instance keys can carry repeat suffixes that are not
  // valid CSS class names).
  const customCSSClassName = customCSS ? `custom-widget-${resourceID}` : "";
  const containerCss = resolvedConfig?.properties?.containerTailwindCss || "";
  const widgetCss = resolvedConfig?.properties?.widgetTailwindCss || "";

  const widgetInlineStyle = {
    // Layout-level radius from the page layout. A widget's own configured
    // radius below still wins when explicitly set; otherwise the card keeps
    // its normal rounded class/custom CSS.
    ...(hasStyleValue(layoutRadius) && { borderRadius: layoutRadius }),
    ...(hasStyleValue(widgetStyleProps.backgroundColor) && { backgroundColor: widgetStyleProps.backgroundColor }),
    ...(hasStyleValue(widgetStyleProps.textColor) && { color: widgetStyleProps.textColor }),
    ...(hasStyleValue(widgetStyleProps.padding) && { padding: widgetStyleProps.padding }),
    ...(hasStyleValue(widgetStyleProps.borderWidth) && { borderWidth: widgetStyleProps.borderWidth }),
    ...(hasStyleValue(widgetStyleProps.borderColor) && { borderColor: widgetStyleProps.borderColor }),
    ...(hasStyleValue(widgetStyleProps.borderRadius) && { borderRadius: widgetStyleProps.borderRadius }),
    ...(hasStyleValue(widgetStyleProps.boxShadow) && { boxShadow: widgetStyleProps.boxShadow }),
    ...(widgetStyleProps.showBorder === false && { border: "none", boxShadow: "none" }),
  };

  const runtimeEventHandlers = useMemo(() => {
    if (!widget?.widgetConfig?.events) return {};
    const handlers = {};
    for (const eventType of Object.keys(widget.widgetConfig.events)) {
      handlers[eventType] = (...inputs) => fireWidgetEvent(eventType, { inputs });
    }
    return handlers;
  }, [widget?.widgetConfig?.events, fireWidgetEvent]);

  if (isHidden) return null;

  return (
    <>
      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: `.${customCSSClassName} { ${customCSS} }` }} />
      )}
      <Card
        className={`widget-density-${density} relative flex h-full w-full flex-col overflow-hidden rounded bg-card transition-colors duration-150 ${
          widgetStyleProps.showBorder !== false ? "border border-border/70 shadow-[0_1px_2px_rgba(0,0,0,0.05)]" : "border border-transparent"
        } ${editable && isMouseHover ? "border-primary/60" : ""} ${customCSSClassName} ${containerCss}`}
        style={widgetInlineStyle}
        data-density={density}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-busy={isLoadingWidget || undefined}
        onMouseEnter={editable ? () => setIsMouseHover(true) : null}
        onMouseLeave={editable ? () => setIsMouseHover(false) : null}
        onClick={editable ? (e) => e.stopPropagation() : null}
      >
        <ReactQueryLoadingErrorWrapper
          isLoading={isLoadingWidget}
          isFetching={isLoadingWidget}
          error={loadWidgetError}
          loadingContainerClass="bg-muted/30"
          refetch={() => refetchWidget()}
        >
          {widget && showHeader && (
            <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-2 py-1.5">
              <div className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                {getWidgetDisplayName({
                  widgetTitle: draft?.title || widget.widgetTitle,
                  widgetTypeLabel:
                    WIDGETS_MAP[draft?.widgetType || widget.widgetType]?.label || draft?.widgetType || widget.widgetType,
                })}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {refreshLabel ? (
                  <span
                    className="hidden items-center gap-1 text-[11px] tabular-nums text-muted-foreground sm:inline-flex"
                    title={`Auto-refresh every ${widget.refreshInterval}s`}
                  >
                    <Clock className="h-3 w-3" />
                    {refreshLabel}
                  </span>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  square
                  className="h-7 w-7 rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    refetchWidget();
                    fireWidgetEvent("onRefresh");
                  }}
                  aria-label="Refresh widget"
                  title="Refresh widget"
                >
                  <RefreshCw
                    className={
                      isLoadingWidget
                        ? "animate-spin h-3.5 w-3.5"
                        : "h-3.5 w-3.5"
                    }
                  />
                </Button>
                {handleDelete && editable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    square
                    className={`h-7 w-7 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-opacity ${
                      isMouseHover ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    onClick={() => handleDelete(index)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    aria-label="Remove widget"
                    title="Remove widget"
                    tabIndex={isMouseHover ? 0 : -1}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {widgetRender?.errorMessage ? (
            <div className="flex h-full w-full items-center justify-center p-2">
              <span className="rounded border border-destructive/30 bg-destructive/10 p-2 text-center text-xs text-destructive">
                {widgetRender.errorMessage}
              </span>
            </div>
          ) : null}

          {shouldHydrateLazily && !hydrated ? (
            <div
              ref={shellRef}
              className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-2 bg-muted/10 p-3"
              aria-busy="true"
              data-widget-shell="true"
            >
              <div className="flex w-full max-w-[180px] flex-col gap-1.5">
                <span className="h-2 w-2/3 animate-pulse rounded bg-muted-foreground/15" />
                <span className="h-2 w-full animate-pulse rounded bg-muted-foreground/10" />
                <span className="h-2 w-4/5 animate-pulse rounded bg-muted-foreground/10" />
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setHydrated(true);
                }}
                className="flex items-center gap-1 rounded border border-border/60 bg-background px-2 py-1 text-[9px] font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                <Play className="h-2.5 w-2.5" />
                Load widget
              </button>
              <span className="text-[8px] text-muted-foreground/50">
                hydrated when scrolled into view
              </span>
            </div>
          ) : widgetRender?.isComposite ? (
            <div
              ref={shellRef}
              className="flex min-h-[56px] flex-1 flex-col min-w-0 overflow-hidden bg-transparent"
            >
              <CompositeWidgetBody
                composite={widgetRender.composite}
                title={
                  widget
                    ? getWidgetDisplayName({
                        widgetTitle: draft?.title || widget.widgetTitle,
                        widgetTypeLabel:
                          WIDGETS_MAP[draft?.widgetType || widget.widgetType]?.label ||
                          "Composite",
                      })
                    : "Composite widget"
                }
              />
            </div>
          ) : RenderedWidgetComponent
            ? (
              <div
                ref={shellRef}
                className={`flex min-h-[56px] flex-1 flex-col min-w-0 bg-transparent ${widgetCss}`}
              >
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
                    widgetID={instanceID}
                    resourceID={resourceID}
                    placementKey={placementKey}
                    instanceID={instanceID}
                    emitApplicationEvent={emitApplicationEvent}
                    subscribeApplicationEvent={subscribeApplicationEvent}
                  />
                </ErrorBoundary>
              </div>
            )
            : null}
        </ReactQueryLoadingErrorWrapper>
      </Card>
    </>
  );
};

AppPageWidgetSlot.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  widgetKey: PropTypes.string.isRequired,
  index: PropTypes.number,
  handleDelete: PropTypes.func,
  editable: PropTypes.bool,
  sizing: PropTypes.string,
  scopedStateTree: PropTypes.object,
  repeatPath: PropTypes.array,
  layoutRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
