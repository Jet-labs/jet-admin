import { BaseWidgetBuilder } from '../core/baseWidgetBuilder';
import { getByPath } from '../core/utils';

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

  static get dataManifest() {
    return {
      supportsMultipleQueries: true,
      dynamicInputs: true,
      inputs: [
        { name: 'default', type: 'array', required: true, description: 'Primary data source' },
      ],
    };
  }

  /**
   * Map normalized data source results to vega-ready named data sources.
   * @param {object} dataSourceResults - { alias: resultData }
   * @param {object} mappingConfig - { dataSources: { vegaName: "alias.path" } }
   * @returns {object} { vegaData: { name: [...] } }
   */
  mapQueryResults(dataSourceResults, mappingConfig) {
    if (!mappingConfig?.dataSources) return { vegaData: {} };
    const vegaData = {};
    for (const [vegaName, path] of Object.entries(mappingConfig.dataSources)) {
      vegaData[vegaName] = getByPath(dataSourceResults, path) || [];
    }
    return { vegaData };
  }

  /**
   * Resolve the data prop for VegaWidget from widgetConfig + dataSourceResults.
   * Expects that all template expressions have already been resolved by the
   * frontend evaluationEngine before reaching this method.
   *
   * @param {object} widgetConfig - The full widget configuration (already resolved)
   * @param {object|null} dataSourceResults - Executed data source results
   * @returns {object|null} Complete Vega spec with data, or null
   */
  resolveData(widgetConfig, dataSourceResults) {
    if (!widgetConfig?.vegaSpec) return null;

    // Clone spec to avoid mutating form/config state
    const spec = JSON.parse(JSON.stringify(widgetConfig.vegaSpec));

    // If data.values is already a resolved array, use it directly
    // (evaluationEngine has already replaced "{{alias}}" with actual data)
    if (spec.data?.values && !Array.isArray(spec.data.values)) {
      // If it's still a string after resolution, it wasn't a valid template — clear it
      if (typeof spec.data.values === 'string') {
        spec.data = { values: [] };
      }
    }

    return spec;
  }
}

