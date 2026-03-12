/**
 * Vega/Vega-Lite Spec Builder
 * 
 * Takes an already-resolved Vega/Vega-Lite specification and wraps it with
 * standard defaults ($schema, autosize, dimensions) to produce a fully
 * renderable spec for vega-embed.
 * 
 * All template resolution and data injection is handled by the backend's
 * template engine BEFORE this function is called. The vegaSpec passed here
 * already contains the resolved data values.
 */

/**
 * Build a complete, renderable Vega/Vega-Lite spec from an already-resolved vegaSpec.
 * 
 * @param {object} params
 * @param {object} params.vegaSpec - Already template-resolved Vega spec (data values included)
 * @param {string} params.widgetType - Widget type ('vega-lite' or 'vega')
 * @returns {object} Complete Vega spec ready for vega-embed
 */
export const buildRenderableSpec = ({ vegaSpec, widgetType = 'vega-lite' }) => {
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
};
