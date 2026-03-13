import { BaseWidgetBuilder } from '../core/baseWidgetBuilder';

/**
 * Vega/Vega-Lite Spec Builder
 * 
 * Takes an already-resolved Vega/Vega-Lite specification and wraps it with
 * standard defaults ($schema, autosize, dimensions) to produce a fully
 * renderable spec for vega-embed.
 */
export class VegaWidgetBuilder extends BaseWidgetBuilder {
  /**
   * Build a complete, renderable Vega/Vega-Lite spec from widgetConfig.
   * 
   * @param {object} params
   * @param {string} params.widgetType - Widget type ('vega-lite' or 'vega')
   * @param {object} params.widgetConfig - The widget config containing vegaSpec
   * @returns {object} Complete Vega spec ready for vega-embed
   */
  buildRender({ widgetType = 'vega-lite', widgetConfig }) {
    const vegaSpec = widgetConfig?.vegaSpec;
    if (!vegaSpec) return null;

    const isVegaLite = widgetType !== 'vega';
    const schemaUrl = isVegaLite
      ? 'https://vega.github.io/schema/vega-lite/v5.json'
      : 'https://vega.github.io/schema/vega/v5.json';

    // Wrap the resolved spec with standard Vega defaults
    const spec = {
      $schema: schemaUrl,
      width: 'container',
      height: 'container',
      autosize: { type: 'fit', contains: 'padding' },
      ...vegaSpec,
    };

    return spec;
  }
}
