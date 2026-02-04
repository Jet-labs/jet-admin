/**
 * Widget Logic Package
 * 
 * Pure JavaScript functions for transforming workflow context data into widget-compatible formats.
 * No React or UI dependencies - Node.js compatible.
 */

import { resolveDatasetFields } from './utils/pathResolvers';

// Import widget-specific processors
import { processBarChartWorkflowData } from './bar/processors';
import { processLineChartWorkflowData } from './line/processors';
import { processPieChartWorkflowData } from './pie/processors';
import { processRadarChartWorkflowData } from './radar/processors';
import { processPolarAreaChartWorkflowData } from './polarArea/processors';
import { processScatterChartWorkflowData } from './scatter/processors';
import { processBubbleChartWorkflowData } from './bubble/processors';
import { processTextWidgetWorkflowData } from './text/processors';
import { processTableWidgetWorkflowData } from './table/processors';
import { processIframeWidgetWorkflowData } from './iframe/processors';
import { processVegaLiteWorkflowData } from './vega/processors';

/**
 * Map of widget type to processor function
 */
const WIDGET_PROCESSORS = {
  bar: processBarChartWorkflowData,
  line: processLineChartWorkflowData,
  pie: processPieChartWorkflowData,
  radar: processRadarChartWorkflowData,
  polarArea: processPolarAreaChartWorkflowData,
  scatter: processScatterChartWorkflowData,
  bubble: processBubbleChartWorkflowData,
  text: processTextWidgetWorkflowData,
  table: processTableWidgetWorkflowData,
  iframe: processIframeWidgetWorkflowData,
  'vega-lite': processVegaLiteWorkflowData,
};

/**
 * Process workflow context data based on widget type
 * 
 * @param {object} params
 * @param {string} params.widgetType - Widget type (bar, line, pie, vega-lite, etc.)
 * @param {object} params.context - Workflow context data
 * @param {object} params.datasetFields - Field mappings from workflowConfig
 * @param {object} params.parameters - Additional chart parameters
 * @param {object} params.workflowConfig - Full workflow config (for vega-lite)
 * @returns {object} Processed data ready for widget rendering
 */
export const processWorkflowDataForWidget = ({ widgetType, context, datasetFields, parameters, workflowConfig }) => {
  const processor = WIDGET_PROCESSORS[widgetType];
  
  if (!processor) {
    // Unknown widget type, return resolved fields as-is
    return resolveDatasetFields(context, datasetFields);
  }

  // Vega-Lite uses workflowConfig directly
  if (widgetType === 'vega-lite') {
    return processor({ context, workflowConfig });
  }

  return processor({ context, datasetFields, parameters });
};
