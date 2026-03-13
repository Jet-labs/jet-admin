/**
 * Widget Logic Package
 * 
 * Pure JavaScript functions and classes for transforming workflow context data into widget-compatible formats.
 * No React or UI dependencies - Node.js compatible.
 */

import { WIDGET_TYPES } from '@jet-admin/widget-types';
import { VegaWidgetBuilder } from './vega/builder';

export { BaseWidgetBuilder } from './core/baseWidgetBuilder';
export { VegaWidgetBuilder } from './vega/builder';

/**
 * Registry mapping widget types to their builder instances.
 * Future widget types should register their builder here.
 */
export const WIDGET_PROCESSORS_MAP = {
  [WIDGET_TYPES.VEGA_LITE.value]: new VegaWidgetBuilder(),
  [WIDGET_TYPES.VEGA.value]: new VegaWidgetBuilder()
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

// Export Visual Chart Builder logic is now in @jet-admin/widgets-ui
