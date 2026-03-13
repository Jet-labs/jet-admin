/**
 * Chart Spec Parser
 * 
 * Reverse-engineers a Vega-Lite spec back into a chartBuilderSpec config.
 * Used when switching from Raw mode → Visual mode.
 * 
 * Best-effort: complex specs or custom Vega features may not parse fully.
 * 
 * @module chartSpecParser
 */

// ============================================================
// Mark → chart type mapping (reverse of chartSpecGenerator)
// ============================================================

const MARK_TO_CHART_TYPE = {
  bar: 'bar',
  line: 'line',
  area: 'area',
  arc: 'pie', // refined by innerRadius check
  point: 'scatter',
  rect: 'heatmap',
  boxplot: 'boxplot',
  tick: 'tick',
};

// ============================================================
// Main parser
// ============================================================

/**
 * Parse a Vega-Lite spec into a chartBuilderSpec config.
 * 
 * @param {object} spec - Vega-Lite JSON spec
 * @returns {{ success: boolean, config: object, warnings: string[] }}
 */
export const parseVegaLiteSpec = (spec) => {
  const warnings = [];

  if (!spec || !spec.$schema) {
    return {
      success: false,
      config: null,
      warnings: ['Not a valid Vega-Lite spec (missing $schema)'],
    };
  }

  // Check for Vega (not Vega-Lite) — can't parse
  if (spec.$schema.includes('/vega/') && !spec.$schema.includes('/vega-lite/')) {
    return {
      success: false,
      config: null,
      warnings: ['This is a full Vega spec, not Vega-Lite. Visual builder only supports Vega-Lite.'],
    };
  }

  try {
    const config = {};

    // 1. Parse chart type from mark
    const markResult = parseMark(spec.mark);
    config.chartType = markResult.chartType;
    if (markResult.warning) warnings.push(markResult.warning);

    // 2. Parse data
    config.data = parseData(spec.data);

    // 3. Parse encoding
    config.encoding = parseEncoding(spec.encoding, config.chartType);

    // 4. Parse style
    config.style = parseStyle(spec);

    // 5. Check for unsupported features
    if (spec.transform) warnings.push('Transforms detected — these are not editable in visual mode');
    if (spec.layer) warnings.push('Layer composition detected — not supported in visual mode');
    if (spec.concat || spec.hconcat || spec.vconcat) warnings.push('Multi-view composition — not supported in visual mode');
    if (spec.selection || spec.params) warnings.push('Interactive selections — preserved but not editable in visual mode');
    if (spec.repeat) warnings.push('Repeat encoding — not supported in visual mode');

    return {
      success: true,
      config,
      warnings,
    };
  } catch (err) {
    return {
      success: false,
      config: null,
      warnings: [`Parse error: ${err.message}`],
    };
  }
};

// ============================================================
// Section parsers
// ============================================================

/**
 * Parse mark specification
 */
const parseMark = (mark) => {
  if (!mark) {
    return { chartType: 'bar', warning: 'No mark found, defaulting to bar' };
  }

  const markType = typeof mark === 'string' ? mark : mark.type;
  let chartType = MARK_TO_CHART_TYPE[markType] || 'bar';

  // Detect donut (arc with innerRadius)
  if (markType === 'arc' && typeof mark === 'object' && mark.innerRadius > 0) {
    chartType = 'donut';
  }

  // Detect histogram (bar with bin encoding — checked in encoding parser)

  if (!MARK_TO_CHART_TYPE[markType]) {
    return { chartType, warning: `Unknown mark type "${markType}", defaulting to bar` };
  }

  return { chartType };
};

/**
 * Parse data section
 */
const parseData = (data) => {
  if (!data) {
    return { source: '', inlineValues: null };
  }

  // Inline values
  if (data.values) {
    if (typeof data.values === 'string') {
      // Workflow variable reference
      return { source: data.values, inlineValues: null };
    }
    if (Array.isArray(data.values)) {
      return { source: '', inlineValues: data.values };
    }
  }

  // URL data source
  if (data.url) {
    return { source: data.url, inlineValues: null };
  }

  return { source: '', inlineValues: null };
};

/**
 * Parse encoding section
 */
const parseEncoding = (encoding, chartType) => {
  if (!encoding) {
    return { x: null, y: null, color: null, size: null, tooltip: [] };
  }

  const result = {
    x: null,
    y: null,
    color: null,
    size: null,
    tooltip: [],
  };

  // Pie/donut: theta → y, color → x
  if (chartType === 'pie' || chartType === 'donut') {
    if (encoding.theta) {
      result.y = parseChannel(encoding.theta);
    }
    if (encoding.color) {
      result.x = parseChannel(encoding.color);
    }
  } else {
    if (encoding.x) {
      result.x = parseChannel(encoding.x);
    }
    if (encoding.y) {
      result.y = parseChannel(encoding.y);
    }
    if (encoding.color) {
      result.color = parseChannel(encoding.color);
    }
  }

  if (encoding.size) {
    result.size = parseChannel(encoding.size);
  }

  // Tooltip
  if (encoding.tooltip) {
    if (Array.isArray(encoding.tooltip)) {
      result.tooltip = encoding.tooltip.map(t => ({
        field: t.field,
        type: t.type,
        title: t.title,
      }));
    } else if (encoding.tooltip.field) {
      result.tooltip = [{ field: encoding.tooltip.field, type: encoding.tooltip.type }];
    }
  }

  return result;
};

/**
 * Parse a single encoding channel
 */
const parseChannel = (channel) => {
  if (!channel) return null;

  return {
    field: channel.field || '',
    type: channel.type || 'nominal',
    title: channel.title || '',
    aggregate: channel.aggregate || 'none',
    sort: channel.sort || null,
    bin: channel.bin || null,
    timeUnit: channel.timeUnit || null,
  };
};

/**
 * Parse style/config from spec
 */
const parseStyle = (spec) => {
  const style = {
    title: '',
    colorScheme: 'tableau10',
    width: 'container',
    height: 300,
  };

  // Title
  if (spec.title) {
    if (typeof spec.title === 'string') {
      style.title = spec.title;
    } else if (spec.title.text) {
      style.title = spec.title.text;
    }
  }

  // Dimensions
  if (spec.width) style.width = spec.width;
  if (spec.height) style.height = spec.height;

  // Color scheme (from encoding)
  if (spec.encoding) {
    const colorScale = spec.encoding.color?.scale;
    if (colorScale?.scheme) {
      style.colorScheme = colorScale.scheme;
    }
  }

  return style;
};

// ============================================================
// Utility: Check if a spec can be parsed
// ============================================================

/**
 * Quick check if a spec is parseable by the visual builder.
 * Returns true if the spec structure is simple enough.
 */
export const isSpecParseable = (spec) => {
  if (!spec || !spec.$schema) return false;
  if (spec.$schema.includes('/vega/') && !spec.$schema.includes('/vega-lite/')) return false;
  if (spec.layer || spec.concat || spec.hconcat || spec.vconcat) return false;
  if (spec.repeat) return false;
  return true;
};

// ============================================================
// Exports handled explicitly above
// ============================================================
