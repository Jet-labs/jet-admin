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
   * Map normalized query results to vega-ready named data sources.
   * @param {object} queryResults - { alias: resultData }
   * @param {object} mappingConfig - { dataSources: { vegaName: "alias.path" } }
   * @returns {object} { vegaData: { name: [...] } }
   */
  mapQueryResults(queryResults, mappingConfig) {
    if (!mappingConfig?.dataSources) return { vegaData: {} };
    const vegaData = {};
    for (const [vegaName, path] of Object.entries(mappingConfig.dataSources)) {
      vegaData[vegaName] = getByPath(queryResults, path) || [];
    }
    return { vegaData };
  }

  /**
   * Resolve the data prop for VegaWidget from widgetConfig + queryResults.
   * Clones the vegaSpec and resolves {{template}} expressions in data.values.
   *
   * @param {object} widgetConfig - The full widget configuration
   * @param {object|null} queryResults - Executed query/workflow results
   * @returns {object|null} Complete Vega spec with resolved data, or null
   */
  resolveData(widgetConfig, queryResults) {
    if (!widgetConfig?.vegaSpec) return null;

    // Clone spec to avoid mutating form/config state
    const spec = JSON.parse(JSON.stringify(widgetConfig.vegaSpec));

    // Resolve template expressions in data.values (e.g. "{{alias}}" or "{{alias.data}}")
    if (spec.data?.values && typeof spec.data.values === 'string' && spec.data.values.includes('{{')) {
      const templateMatch = spec.data.values.match(/\{\{([^}]+)\}\}/);
      if (templateMatch && queryResults) {
        const resolved = getByPath(queryResults, templateMatch[1]);
        if (Array.isArray(resolved)) {
          spec.data = { values: resolved };
        } else if (resolved && typeof resolved === 'object' && Array.isArray(resolved.data)) {
          spec.data = { values: resolved.data };
        } else {
          spec.data = { values: [] };
        }
      } else {
        spec.data = { values: [] };
      }
    }

    return spec;
  }
}
