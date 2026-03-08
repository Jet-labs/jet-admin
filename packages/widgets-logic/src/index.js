/**
 * Widget Logic Package
 * 
 * Pure JavaScript functions for transforming workflow context data into widget-compatible formats.
 * No React or UI dependencies - Node.js compatible.
 */

import { resolveDatasetFields } from './utils/pathResolvers';

// Import Vega processors only
import { processVegaLiteWorkflowData, processVegaWorkflowData } from './vega/processors';

// Import universal spec interpolator
import { processWidgetSpec, interpolateSpec } from './utils/specInterpolator';

/**
 * Map of widget type to processor function
 * Only Vega and Vega-Lite are supported
 */
const WIDGET_PROCESSORS = {
  'vega-lite': processVegaLiteWorkflowData,
  'vega': processVegaWorkflowData,
};

/**
 * Process workflow context data based on widget type
 * 
 * @param {object} params
 * @param {string} params.widgetType - Widget type (vega-lite, vega)
 * @param {object} params.context - Workflow context data
 * @param {object} params.datasetFields - Field mappings from workflowConfig
 * @param {object} params.parameters - Additional chart parameters
 * @param {object} params.workflowConfig - Full workflow config
 * @returns {object} Processed data ready for widget rendering
 */
export const processWorkflowDataForWidget = ({ widgetType, context, datasetFields, parameters, workflowConfig }) => {
  // If vegaSpec is provided directly in workflowConfig, use the universal processor
  if (workflowConfig?.vegaSpec) {
    return processWidgetSpec({
      vegaSpec: workflowConfig.vegaSpec,
      context,
      options: workflowConfig.options
    });
  }

  // Use type-specific processors for Vega/Vega-Lite
  const processor = WIDGET_PROCESSORS[widgetType];
  
  if (!processor) {
    // Unknown widget type, return resolved fields as-is
    return resolveDatasetFields(context, datasetFields);
  }

  // Vega-Lite and Vega use workflowConfig directly
  return processor({ context, workflowConfig });
};

// Export universal processor for direct use
export { processWidgetSpec, interpolateSpec };

// Export Visual Chart Builder logic
export * from './vega/chartSpecGenerator';
export * from './vega/chartSpecParser';

// Export utilities
export { resolveDatasetFields };
