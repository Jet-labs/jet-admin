/**
 * Widget Logic Package
 * 
 * Pure JavaScript functions for transforming workflow context data into widget-compatible formats.
 * No React or UI dependencies - Node.js compatible.
 * 
 * IMPORTANT: Template resolution ({{ctx.*}}) is the backend's responsibility.
 * This package expects widgetConfig (including vegaSpec) to be already resolved before being passed in.
 */

// Import Vega builder
import { buildRenderableSpec } from './vega/builder';

/**
 * Process workflow context data based on widget type.
 * 
 * This is the ONLY function that knows about widget-type-specific config fields.
 * The backend widget module passes widgetConfig as an already-resolved opaque blob —
 * this function extracts what it needs based on widgetType.
 * 
 * Extracts spec from widgetConfig (e.g. widgetConfig.vegaSpec for Vega widgets),
 * which should already be template-resolved by the backend, and builds a renderable spec.
 * 
 * @param {object} params
 * @param {string} params.widgetType - Widget type ('vega-lite', 'vega', or future types)
 * @param {object} [params.widgetConfig] - Already-resolved widget config blob (contains type-specific fields)
 * @returns {object} Processed data ready for widget rendering
 */
export const processWorkflowDataForWidget = ({ widgetType, widgetConfig }) => {
  // Extract widget-type-specific spec from widgetConfig
  // For Vega/Vega-Lite widgets, this is widgetConfig.vegaSpec
  // Future widget types can add their own extraction here
  const vegaSpec = widgetConfig?.vegaSpec;

  if (vegaSpec) {
    return buildRenderableSpec({
      vegaSpec,
      widgetType: widgetType || 'vega-lite',
    });
  }

  return null;
};

// Export the buildRenderableSpec for direct use
export { buildRenderableSpec };

// Export Visual Chart Builder logic
export * from './vega/chartSpecGenerator';
export * from './vega/chartSpecParser';
