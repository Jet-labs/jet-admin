import React, { useEffect, useRef, useState, useMemo } from 'react';
import vegaEmbed from 'vega-embed';
import { attachVegaDrillListeners } from './drillListeners';

/**
 * Vega/Vega-Lite Widget Component
 * Renders Vega and Vega-Lite specifications using vega-embed
 * 
 * Note: Requires vega, vega-lite, and vega-embed packages
 */
export const VegaWidget = ({
  data,              // Processed Vega/Vega-Lite spec from processor
  widgetConfig,      // Widget-level config (showActions, renderer, theme)
  onSignal,          // Callback for selections/interactions
  onMarkClick,       // Drill-down: fired with clicked datum { datum } (page route)
  onBrush,           // Drill-down: fired with interval selection { value } (page route)
  fireWidgetEvent,   // Accepted for embedding compatibility; the page route goes
                     // through onMarkClick/onBrush so one gesture fires exactly once
  onError,           // Error handler
  onWidgetInit,      // Callback when widget initializes
  isLoadingWorkflows // Boolean indicating if a workflow is currently running
}) => {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(!!widgetConfig?.showDataTable);

  const tableRows = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.data?.values)) return data.data.values;
    if (data.datasets && typeof data.datasets === "object") {
      for (const value of Object.values(data.datasets)) {
        if (Array.isArray(value) && value.length && typeof value[0] === "object") return value;
      }
    }
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);
  const tableColumns = useMemo(() => {
    if (!tableRows.length || typeof tableRows[0] !== "object" || !tableRows[0]) return [];
    return Object.keys(tableRows[0]).slice(0, 8);
  }, [tableRows]);
  const annotations = Array.isArray(widgetConfig?.annotations) ? widgetConfig.annotations.filter((item) => item && item.text) : [];
  const annotationTone = {
    info: "border-info/40 bg-info/10 text-info",
    success: "border-success/40 bg-success/10 text-success",
    warning: "border-warning/40 bg-warning/10 text-warning",
    danger: "border-destructive/40 bg-destructive/10 text-destructive",
    neutral: "border-border bg-background/95 text-foreground",
  };

  // Store callbacks in refs to avoid triggering the render effect
  const onSignalRef = useRef(onSignal);
  const onMarkClickRef = useRef(onMarkClick);
  const onBrushRef = useRef(onBrush);
  const fireWidgetEventRef = useRef(fireWidgetEvent);
  const onWidgetInitRef = useRef(onWidgetInit);
  const onErrorRef = useRef(onError);
  useEffect(() => { onSignalRef.current = onSignal; }, [onSignal]);
  useEffect(() => { onMarkClickRef.current = onMarkClick; }, [onMarkClick]);
  useEffect(() => { onBrushRef.current = onBrush; }, [onBrush]);
  useEffect(() => { fireWidgetEventRef.current = fireWidgetEvent; }, [fireWidgetEvent]);
  useEffect(() => { onWidgetInitRef.current = onWidgetInit; }, [onWidgetInit]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  // Serialize spec to a stable string key so the effect only fires
  // when the spec content actually changes, not on every new object ref
  const specKey = useMemo(() => {
    try {
      return data ? JSON.stringify(data) : null;
    } catch {
      return null;
    }
  }, [data]);

  // Serialize widgetConfig options to a stable key
  const configKey = useMemo(() => {
    try {
      return widgetConfig ? JSON.stringify({
        showActions: widgetConfig?.showActions,
        renderer: widgetConfig?.renderer,
        theme: widgetConfig?.theme,
      }) : null;
    } catch {
      return null;
    }
  }, [widgetConfig]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // If workflow is loading, don't attempt to render chart which could throw error
    if (isLoadingWorkflows) {
      setLoading(true);
      setError(null);
      return;
    }

    // If no data/spec provided, show placeholder
    if (!data || !data.$schema) {
      setLoading(false);
      setError('No visualization spec provided');
      return;
    }

    const renderChart = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dispose previous view if exists
        if (viewRef.current) {
          viewRef.current.finalize();
          viewRef.current = null;
        }

        const embedOptions = {
          actions: widgetConfig?.showActions ?? false,
          renderer: widgetConfig?.renderer ?? 'svg',
          theme: widgetConfig?.theme ?? undefined,
          tooltip: { theme: 'dark' },
          config: {
            background: 'transparent',
            view: { stroke: 'transparent' }
          }
        };

        const result = await vegaEmbed(containerRef.current, data, embedOptions);

        viewRef.current = result.view;
        setLoading(false);

        // Call init callback
        onWidgetInitRef.current?.(result.view);

        // Mark-click drill-down + brush signals (works with or without params).
        // Single dispatch route (B04/F02): the renderer notifies ONLY the
        // direct onMarkClick/onBrush callbacks via attachVegaDrillListeners.
        // The page slot wires those to exactly one fireWidgetEvent call each;
        // dispatching page actions here too would execute the action chain
        // twice with differing payloads.
        attachVegaDrillListeners(result.view, data, {
          onMarkClick: (payload) => onMarkClickRef.current?.(payload),
          onBrush: (payload) => onBrushRef.current?.(payload),
          onSignal: (name, value) => onSignalRef.current?.(name, value),
        });
      } catch (err) {
        setError(err.message || 'Visualization error');
        setLoading(false);
        onErrorRef.current?.(err);
      }
    };

    renderChart();

    return () => {
      if (viewRef.current) {
        viewRef.current.finalize();
        viewRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specKey, configKey, isLoadingWorkflows]);

  const isConfigLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";
  const showLoading = loading || isLoadingWorkflows || isConfigLoading;

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative' }}
      role="img"
      aria-label={widgetConfig?.ariaDescription || "Data visualization"}
      className="flex flex-col"
    >
      <div className="relative min-h-0 flex-1">
      {showLoading && !error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}

      {error && !isLoadingWorkflows && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 text-center pointer-events-none">
          <div className="flex max-w-full items-center gap-1.5 rounded bg-muted/30 px-4 py-2 text-xs font-medium text-foreground shadow-sm">
            <span className="text-muted-foreground">⚠</span>
            <span className="text-muted-foreground break-words">{error}</span>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          visibility: (error || isLoadingWorkflows) ? 'hidden' : 'visible'
        }}
      />
      {annotations.map((annotation, index) => (
        <span
          key={`${annotation.text}-${index}`}
          className={`pointer-events-none absolute z-10 max-w-[60%] -translate-x-1/2 -translate-y-1/2 truncate rounded-control border px-1.5 py-0.5 text-[10px] font-medium shadow-sm ${annotationTone[annotation.tone] || annotationTone.info}`}
          style={{
            left: `${Math.min(100, Math.max(0, Number(annotation.x) || 50))}%`,
            top: `${Math.min(100, Math.max(0, Number(annotation.y) || 20))}%`,
          }}
          title={annotation.text}
        >
          {annotation.text}
        </span>
      ))}
      </div>

      {widgetConfig?.showDataTable && tableRows.length > 0 && (
        <div className="shrink-0 border-t border-border bg-background/95">
          <button
            type="button"
            onClick={() => setShowTable((current) => !current)}
            className="flex w-full items-center justify-between px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-expanded={showTable}
          >
            <span>Data table · {tableRows.length} row{tableRows.length === 1 ? "" : "s"}</span>
            <span>{showTable ? "Hide" : "Show"}</span>
          </button>
          {showTable && (
            <div className="max-h-40 overflow-auto px-2 pb-2">
              <table className="w-full border-collapse text-[10px]">
                <thead className="sticky top-0 bg-background">
                  <tr>
                    {tableColumns.map((column) => (
                      <th key={column} className="border-b border-border px-1.5 py-1 text-left font-medium text-muted-foreground">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.slice(0, 100).map((row, index) => (
                    <tr key={index} className="border-b border-border/40 last:border-b-0">
                      {tableColumns.map((column) => (
                        <td key={column} className="max-w-[180px] truncate px-1.5 py-0.5 tabular-nums text-foreground">
                          {row?.[column] === null || row?.[column] === undefined ? "—" : typeof row[column] === "object" ? JSON.stringify(row[column]) : String(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {tableRows.length > 100 && <p className="px-1 pt-1 text-[9px] text-muted-foreground">Showing first 100 rows.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VegaWidget;
