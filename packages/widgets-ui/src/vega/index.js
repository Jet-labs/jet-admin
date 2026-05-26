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
  const onWidgetInitRef = useRef(onWidgetInit);
  const onErrorRef = useRef(onError);
  useEffect(() => { onSignalRef.current = onSignal; }, [onSignal]);
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

        // Setup signal listeners for interactivity
        if (onSignalRef.current && data.params) {
          for (const param of data.params) {
            if (param.name) {
              result.view.addSignalListener(param.name, (name, value) => {
                onSignalRef.current?.(name, value);
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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {(loading || isLoadingWorkflows) && !error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            color: '#94a3b8',
            fontSize: '13px',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'rgba(241, 245, 249, 0.9)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading visualization…
          </div>
        </div>
      )}

      {error && !isLoadingWorkflows && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            textAlign: 'center',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'rgba(254, 242, 242, 0.95)',
            color: '#dc2626',
            fontSize: '13px',
            border: '1px solid rgba(220, 38, 38, 0.2)',
          }}>
            <span>⚠</span>
            <span>{error}</span>
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
