/**
 * Widget Logic Package
 * 
 * Pure JavaScript functions and classes for transforming workflow context data into widget-compatible formats.
 * No React or UI dependencies - Node.js compatible.
 */

import { WIDGET_TYPES } from '@jet-admin/widget-types';
import { VegaWidgetBuilder } from './vega/builder';
import { TableWidgetBuilder } from './table/builder';

export { BaseWidgetBuilder } from './core/baseWidgetBuilder';
export { VegaWidgetBuilder } from './vega/builder';
export { TableWidgetBuilder } from './table/builder';
export { getByPath } from './core/utils';

/**
 * Registry mapping widget types to their builder instances.
 * Future widget types should register their builder here.
 */
export const WIDGET_PROCESSORS_MAP = {
  [WIDGET_TYPES.VEGA_LITE.value]: new VegaWidgetBuilder(),
  [WIDGET_TYPES.VEGA.value]: new VegaWidgetBuilder(),
  [WIDGET_TYPES.TABLE.value]: new TableWidgetBuilder(),
};

/**
 * Register a builder instance for a new widget type.
 * @param {string} widgetType - The unique identifier for the widget type
 * @param {BaseWidgetBuilder} builderInstance - An instance of a class extending BaseWidgetBuilder
 */
export const registerWidgetProcessor = (widgetType, builderInstance) => {
  WIDGET_PROCESSORS_MAP[widgetType] = builderInstance;
};

/**
 * Process workflow context data based on widget type utilizing the registered builder.
 * 
 * @param {object} params
 * @param {string} params.widgetType - Widget type identifier
 * @param {object} [params.widgetConfig] - Already-resolved widget config blob
 * @returns {object} Processed data ready for widget rendering
 */
export const processWorkflowDataForWidget = ({ widgetType, widgetConfig }) => {
  const processor = WIDGET_PROCESSORS_MAP[widgetType];
  
  if (processor && typeof processor.buildRender === 'function') {
    return processor.buildRender({ widgetType, widgetConfig });
  }

  // Return the raw widgetConfig if no specific processor is matched
  return widgetConfig || null;
};

/**
 * Resolve the data prop for a widget component from widgetConfig + queryResults.
 * 
 * This is the STANDARD entry point for all rendering layers (WidgetPreview,
 * DashboardWidget). It delegates to the widget type's builder.resolveData()
 * method, so no widget-type-specific conditionals are needed in the UI layer.
 *
 * @param {object} params
 * @param {string} params.widgetType - Widget type identifier
 * @param {object} params.widgetConfig - The full widget configuration
 * @param {object|null} params.queryResults - Executed query/workflow results
 * @returns {any} Data ready for the widget component's `data` prop, or null
 */
export const resolveWidgetData = ({ widgetType, widgetConfig, queryResults }) => {
  if (!queryResults || !widgetConfig) return null;

  const processor = WIDGET_PROCESSORS_MAP[widgetType];
  if (processor && typeof processor.resolveData === 'function') {
    return processor.resolveData(widgetConfig, queryResults);
  }

  return null;
};
