import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Vega-Lite Widget Component
 * Renders Vega-Lite specifications using vega-embed
 * 
 * Note: Requires vega, vega-lite, and vega-embed packages
 */
export const VegaLiteWidget = ({ 
  data,              // Processed Vega-Lite spec from processor
  widgetConfig,      // Widget-level config (showActions, renderer, theme)
  onSignal,          // Callback for selections/interactions
  onError,           // Error handler
  onWidgetInit       // Callback when widget initializes
}) => {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleError = useCallback((err) => {
    setError(err.message || 'Visualization error');
    setLoading(false);
    onError?.(err);
  }, [onError]);

  useEffect(() => {
    if (!containerRef.current) return;
    
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

        // Dynamically import vega-embed (lazy loading)
        const vegaEmbed = await import('vega-embed');
        const embed = vegaEmbed.default;

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

        const result = await embed(containerRef.current, data, embedOptions);
        viewRef.current = result.view;
        setLoading(false);

        // Call init callback
        onWidgetInit?.(result.view);

        // Setup signal listeners for interactivity
        if (onSignal && data.params) {
          for (const param of data.params) {
            if (param.name) {
              result.view.addSignalListener(param.name, (name, value) => {
                onSignal(name, value);
              });
            }
          }
        }
      } catch (err) {
        handleError(err);
      }
    };

    renderChart();

    return () => {
      if (viewRef.current) {
        viewRef.current.finalize();
        viewRef.current = null;
      }
    };
  }, [data, widgetConfig, onSignal, onWidgetInit, handleError]);

  // Loading state
  if (loading && !error) {
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#888',
          fontSize: '14px'
        }}
      >
        Loading visualization...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#ef4444',
          fontSize: '14px',
          padding: '16px',
          textAlign: 'center'
        }}
      >
        <span>Visualization Error: {error}</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }} 
    />
  );
};

export default VegaLiteWidget;
