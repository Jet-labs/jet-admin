import React, { useEffect, useRef, useState, useMemo } from 'react';
import vegaEmbed from 'vega-embed';

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
  onMarkClick,       // Drill-down: fired with clicked datum { datum, event }
  onBrush,           // Drill-down: fired with interval selection value
  fireWidgetEvent,   // AppPage runtime event dispatcher (preferred for drill chains)
  onError,           // Error handler
  onWidgetInit,      // Callback when widget initializes
  isLoadingWorkflows // Boolean indicating if a workflow is currently running
}) => {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

        // Mark-click drill-down: Vega view click → datum (works with or without params)
        try {
          result.view.addEventListener('click', (event, item) => {
            const datum = item?.datum;
            if (datum) {
              const payload = { datum };
              try { fireWidgetEventRef.current?.("onMarkClick", payload); } catch { /* ignore */ }
              onMarkClickRef.current?.(payload);
            }
          });
        } catch { /* older vega versions may not support addEventListener */ }

        // Setup signal listeners for interactivity
        if (data.params) {
          for (const param of data.params) {
            if (param.name) {
              result.view.addSignalListener(param.name, (name, value) => {
                onSignalRef.current?.(name, value);
                // Interval brush selection → onBrush for drill/filter chains
                if (name === 'brush') {
                  const payload = { value };
                  try { fireWidgetEventRef.current?.("onBrush", payload); } catch { /* ignore */ }
                  onBrushRef.current?.(payload);
                }
              });
            }
          }
        }
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
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
          <div className="flex items-center gap-1.5 rounded  bg-muted/30 px-4 py-2 text-xs font-medium text-foreground shadow-sm">
            <span className="text-muted-foreground">⚠</span>
            <span className="text-muted-foreground">{error}</span>
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
    </div>
  );
};

export default VegaWidget;
