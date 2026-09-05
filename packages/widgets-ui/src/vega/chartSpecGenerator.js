/**
 * Chart Spec Generator (Shelf-Based)
 * 
 * Converts a shelfSpec config into a valid Vega-Lite JSON spec.
 * Core engine for the Tableau-style visual widget builder.
 * 
 * @module chartSpecGenerator
 */

// ============================================================
// Mark type → Vega-Lite mark mapping
// ============================================================

export const MARK_TYPES = {
  bar:     { type: 'bar',   tooltip: true },
  line:    { type: 'line',  tooltip: true, point: true },
  area:    { type: 'area',  tooltip: true, line: true, opacity: 0.7 },
  point:   { type: 'point', tooltip: true, filled: true, opacity: 0.7 },
  circle:  { type: 'circle', tooltip: true, opacity: 0.7 },
  square:  { type: 'square', tooltip: true },
  arc:     { type: 'arc',   tooltip: true },
  rect:    { type: 'rect',  tooltip: true },
  tick:    { type: 'tick',  tooltip: true },
  text:    { type: 'text' },
};

// Friendly aliases that map to MARK_TYPES keys
export const MARK_ALIASES = {
  scatter: 'point',
  pie: 'arc',
  donut: 'arc',
  heatmap: 'rect',
  histogram: 'bar',
};

// ============================================================
// Encoding channels supported by the shelf system
// ============================================================

export const POSITIONAL_CHANNELS = ['x', 'y', 'row', 'column'];
export const RETINAL_CHANNELS = ['color', 'size', 'shape', 'opacity', 'strokeDash', 'detail'];
export const TEXT_CHANNELS = ['text', 'tooltip'];
export const ALL_CHANNELS = [...POSITIONAL_CHANNELS, ...RETINAL_CHANNELS, ...TEXT_CHANNELS];

// ============================================================
// Field data types
// ============================================================

export const FIELD_TYPES = ['nominal', 'ordinal', 'quantitative', 'temporal'];

export const AGGREGATE_TYPES = [
  'count', 'sum', 'mean', 'median', 'min', 'max',
  'variance', 'stdev', 'distinct', 'valid', 'missing',
];

export const TIME_UNITS = [
  'year', 'quarter', 'month', 'week', 'day', 'dayofyear',
  'date', 'hours', 'minutes', 'seconds', 'milliseconds',
  'yearmonth', 'yearmonthdate', 'yearmonthdatehours',
  'monthdate', 'hoursminutes', 'utcmonth', 'utcyearmonth',
];

export const INTERPOLATE_TYPES = [
  'linear', 'monotone', 'step', 'step-before', 'step-after',
  'basis', 'cardinal', 'catmull-rom',
];

export const COLOR_SCHEMES = [
  'tableau10', 'category10', 'category20', 'accent', 'dark2',
  'paired', 'set1', 'set2', 'set3', 'pastel1', 'pastel2',
  'blues', 'greens', 'oranges', 'reds', 'purples', 'greys',
  'viridis', 'magma', 'inferno', 'plasma', 'spectral',
];

// ============================================================
// Auto-mark inference
// ============================================================

/**
 * Infer the best mark type from the encoding configuration.
 * Uses the same heuristics as Voyager/CompassQL.
 * 
 * @param {object} encoding - Encoding channels object
 * @returns {string} Recommended mark type key
 */
export const inferMarkType = (encoding) => {
  const xType = encoding?.x?.type;
  const yType = encoding?.y?.type;
  const hasX = !!encoding?.x?.field;
  const hasY = !!encoding?.y?.field;
  const hasColor = !!encoding?.color?.field;
  const hasSize = !!encoding?.size?.field;

  // No fields at all
  if (!hasX && !hasY) return 'bar';

  // Only one dimension
  if (hasX && !hasY) {
    if (xType === 'quantitative') return 'bar'; // histogram-like
    return 'bar';
  }
  if (!hasX && hasY) {
    if (yType === 'quantitative') return 'bar';
    return 'bar';
  }

  // Both X and Y present
  const isXCat = xType === 'nominal' || xType === 'ordinal';
  const isYCat = yType === 'nominal' || yType === 'ordinal';
  const isXQuant = xType === 'quantitative';
  const isYQuant = yType === 'quantitative';
  const isXTemp = xType === 'temporal';
  const isYTemp = yType === 'temporal';

  // Temporal × Quantitative → line
  if ((isXTemp && isYQuant) || (isYTemp && isXQuant)) return 'line';

  // Categorical × Quantitative → bar
  if ((isXCat && isYQuant) || (isYCat && isXQuant)) return 'bar';

  // Quantitative × Quantitative → point (scatter)
  if (isXQuant && isYQuant) return 'point';

  // Categorical × Categorical → rect (heatmap-like, needs color)
  if (isXCat && isYCat && hasColor) return 'rect';

  // Fallback
  return 'bar';
};

// ============================================================
// Main generator
// ============================================================

/**
 * Generate a Vega-Lite spec from a shelfSpec configuration.
 *
 * @param {object} shelfSpec - The shelf specification
 * @param {string} shelfSpec.mark - Mark type or 'auto'
 * @param {string} shelfSpec.dataSource - Workflow variable path
 * @param {object} shelfSpec.encoding - Encoding channels
 * @param {object} [shelfSpec.config] - Style configuration
 * @returns {object} Valid Vega-Lite JSON spec
 */
export const generateVegaLiteSpec = (shelfSpec) => {
  if (!shelfSpec) return getEmptySpec();

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  };

  const encoding = shelfSpec.encoding || {};
  const config = shelfSpec.config || {};

  // Title (+ optional subtitle)
  if (config.title || config.subtitle) {
    spec.title = {
      text: config.title || config.subtitle,
      anchor: 'start',
      fontSize: 14,
      fontWeight: 600,
      offset: 12,
      ...(config.subtitle && config.title ? { subtitle: config.subtitle } : {}),
    };
  }

  // Dimensions
  spec.width = config.width === 'container' ? 'container' : (config.width || 'container');
  spec.height = config.height || 300;
  spec.autosize = { type: 'fit', contains: 'padding' };

  // Data
  spec.data = buildDataSection(shelfSpec.dataSource, shelfSpec.inlineValues);

  // Mark — auto-infer or explicit
  const resolvedMark = shelfSpec.mark === 'auto' || !shelfSpec.mark
    ? inferMarkType(encoding)
    : (MARK_ALIASES[shelfSpec.mark] || shelfSpec.mark);

  const markDef = MARK_TYPES[resolvedMark] || MARK_TYPES.bar;

  // Merge user mark props (point overlay, interpolation, cornerRadius, opacity)
  const markProps = shelfSpec.markProps || {};
  const mergedMarkDef = { ...markDef };
  if (markProps.point !== undefined) mergedMarkDef.point = markProps.point;
  if (markProps.interpolate) mergedMarkDef.interpolate = markProps.interpolate;
  if (markProps.cornerRadius !== undefined && markProps.cornerRadius !== '' && mergedMarkDef.type === 'bar') {
    const cr = Number(markProps.cornerRadius);
    if (!Number.isNaN(cr)) mergedMarkDef.cornerRadius = cr;
  }
  if (markProps.opacity !== undefined && markProps.opacity !== '' && !encoding.opacity?.field) {
    const op = Number(markProps.opacity);
    if (!Number.isNaN(op)) mergedMarkDef.opacity = Math.min(1, Math.max(0, op));
  }
  if (markProps.lineWidth !== undefined && markProps.lineWidth !== '') {
    const lw = Number(markProps.lineWidth);
    if (!Number.isNaN(lw)) mergedMarkDef.strokeWidth = lw;
  }

  // Special handling for donut
  if (shelfSpec.mark === 'donut') {
    mergedMarkDef.innerRadius = 50;
  }

  // Base encoding (single-view shape; may move into layer[0] below)
  const baseEncoding = buildEncoding(encoding, resolvedMark, config);
  if (config.showLegend === false) {
    for (const ch of Object.values(baseEncoding)) {
      if (ch && typeof ch === 'object' && !Array.isArray(ch)) ch.legend = null;
    }
  }

  // Chrome overlays that require layered specs: reference line, trend line,
  // data labels. When none are active the spec stays single-view so raw-mode
  // round-trips and downstream consumers are unaffected.
  const extraLayers = buildChromeLayers({ encoding, resolvedMark, mark: shelfSpec.mark, config });

  if (extraLayers.length > 0) {
    spec.layer = [{ mark: { ...mergedMarkDef }, encoding: baseEncoding }, ...extraLayers];
  } else {
    spec.mark = { ...mergedMarkDef };
    spec.encoding = baseEncoding;
  }

  // Interaction params for drill-down (point click select + interval brush).
  // Emitted only when enabled so existing charts keep identical behavior.
  const interaction = shelfSpec.interaction || {};
  const params = [];
  if (interaction.pointSelection) {
    params.push({ name: 'pts_click', select: { type: 'point', on: 'click' } });
  }
  if (interaction.intervalBrush) {
    params.push({ name: 'brush', select: { type: 'interval' } });
  }
  if (params.length > 0) spec.params = params;

  // Theme config
  spec.config = buildThemeConfig(config);

  return spec;
};

// ============================================================
// Section builders
// ============================================================

// ============================================================
// Chart-chrome overlays (reference line, trend line, data labels)
// Each returns a Vega-Lite layer definition. Values may be raw numbers or
// "{{ state.* }}" template strings — runtime resolveConfig evaluates them
// before the spec reaches vega-embed, so templates are preserved as-is here.
// ============================================================

const coerceDatumValue = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    // Preserve live bindings for runtime resolution
    if (trimmed.includes('{{')) return trimmed;
    const num = Number(trimmed);
    return Number.isNaN(num) ? trimmed : num;
  }
  return value ?? null;
};

const buildChromeLayers = ({ encoding, resolvedMark, mark, config }) => {
  const layers = [];
  const isArc = resolvedMark === 'arc';
  const hasX = !!encoding?.x?.field;
  const hasY = !!encoding?.y?.field;

  // 1. Reference line (horizontal y=val or vertical x=val rule)
  const ref = config?.referenceLine;
  const refValue = coerceDatumValue(ref?.value);
  if (ref && refValue !== null && refValue !== '') {
    const axis = ref.axis === 'x' ? 'x' : 'y';
    layers.push({
      mark: {
        type: 'rule',
        color: ref.color || '#ef4444',
        strokeWidth: 1.5,
        strokeDash: [4, 4],
        ...(ref.label ? { tooltip: true } : {}),
      },
      encoding: {
        [axis]: { datum: refValue, ...(ref.label ? { title: ref.label } : {}) },
        ...(ref.label ? { tooltip: { datum: ref.label } } : {}),
      },
    });
  }

  // 2. Trend (regression) line — needs x + y fields on a non-arc mark
  if (config?.trendLine && !isArc && hasX && hasY) {
    const xField = encoding.x.field;
    const yField = encoding.y.field;
    layers.push({
      transform: [{ regression: yField, on: xField }],
      mark: { type: 'line', color: '#f43f5e', strokeWidth: 2 },
      encoding: {
        x: { field: xField, type: encoding.x.type || 'quantitative' },
        y: { field: yField, type: 'quantitative' },
      },
    });
  }

  // 3. Data labels — text layer reusing positional channels + y measure
  if (config?.showDataLabels && !isArc && hasX && hasY) {
    const yCh = encoding.y;
    layers.push({
      mark: {
        type: 'text',
        align: 'center',
        baseline: (mark === 'bar' || resolvedMark === 'bar') ? 'bottom' : 'middle',
        dy: (mark === 'bar' || resolvedMark === 'bar') ? -6 : 0,
      },
      encoding: {
        x: buildChannel(encoding.x),
        y: buildChannel(encoding.y),
        text: {
          field: yCh.field,
          type: yCh.type || 'quantitative',
          ...(yCh.aggregate && yCh.aggregate !== 'none' ? { aggregate: yCh.aggregate } : {}),
          ...(yCh.format ? { format: yCh.format } : {}),
        },
      },
    });
  }

  return layers;
};

const buildDataSection = (dataSource, inlineValues) => {
  if (inlineValues && Array.isArray(inlineValues) && inlineValues.length > 0) {
    return { values: inlineValues };
  }
  if (dataSource) {
    if (Array.isArray(dataSource)) {
      return { values: dataSource };
    }
    // Prevent Vega compiler from crashing on massive complex objects
    if (typeof dataSource === 'object' && dataSource !== null) {
      if (Array.isArray(dataSource.data)) {
        return { values: dataSource.data };
      }
      return { values: [dataSource] };
    }
    // Strings/numbers fallback
    return { values: [dataSource] };
  }
  return { values: [] };
};

const buildEncoding = (encoding, markType, config) => {
  const enc = {};
  const isArc = markType === 'arc';

  // Positional channels
  if (isArc) {
    // Arc charts: x → color (slice category), y → theta (size)
    if (encoding.y?.field) {
      enc.theta = buildChannel(encoding.y);
    }
    if (encoding.x?.field) {
      enc.color = buildChannel(encoding.x, config?.colorScheme);
    }
  } else {
    // Standard positional
    if (encoding.x?.field) enc.x = buildChannel(encoding.x);
    if (encoding.y?.field) enc.y = buildChannel(encoding.y);
  }

  // Faceting
  if (encoding.row?.field) enc.row = buildChannel(encoding.row);
  if (encoding.column?.field) enc.column = buildChannel(encoding.column);

  // Retinal channels
  if (!isArc && encoding.color?.field) enc.color = buildChannel(encoding.color, config?.colorScheme);
  if (encoding.size?.field) enc.size = buildChannel(encoding.size);
  if (encoding.shape?.field) enc.shape = buildChannel(encoding.shape);
  if (encoding.opacity?.field) enc.opacity = buildChannel(encoding.opacity);
  if (encoding.strokeDash?.field) enc.strokeDash = buildChannel(encoding.strokeDash);
  if (encoding.detail?.field) enc.detail = buildChannel(encoding.detail);

  // Text channel
  if (encoding.text?.field) enc.text = buildChannel(encoding.text);

  // Tooltip — array or single
  if (encoding.tooltip) {
    if (Array.isArray(encoding.tooltip)) {
      const tooltips = encoding.tooltip.filter(t => t?.field);
      if (tooltips.length > 0) {
        enc.tooltip = tooltips.map(t => ({
          field: t.field,
          ...(t.type && { type: t.type }),
          ...(t.title && { title: t.title }),
        }));
      }
    } else if (encoding.tooltip?.field) {
      enc.tooltip = { field: encoding.tooltip.field, type: encoding.tooltip.type };
    }
  }

  return enc;
};

/**
 * Build a single channel encoding object
 */
const buildChannel = (channel, colorScheme) => {
  if (!channel || !channel.field) return undefined;

  const enc = {
    field: channel.field,
    type: channel.type || 'nominal',
  };

  if (channel.title) enc.title = channel.title;
  if (channel.aggregate && channel.aggregate !== 'none') enc.aggregate = channel.aggregate;
  if (channel.sort) enc.sort = channel.sort;
  if (channel.bin) enc.bin = channel.bin === true ? true : { maxbins: channel.bin };
  if (channel.timeUnit) enc.timeUnit = channel.timeUnit;
  if (channel.format) enc.format = channel.format;
  if (channel.formatType) enc.formatType = channel.formatType;
  if (channel.axis !== undefined) enc.axis = channel.axis;
  if (colorScheme) enc.scale = { scheme: colorScheme };

  return enc;
};

const buildThemeConfig = (config) => {
  const showGrid = config?.showGrid !== false;
  const showLegend = config?.showLegend !== false;
  return {
    background: 'transparent',
    view: { stroke: 'transparent' },
    axis: {
      labelFontSize: 11,
      titleFontSize: 12,
      titlePadding: 8,
      grid: showGrid,
      gridOpacity: 0.15,
    },
    legend: {
      labelFontSize: 11,
      titleFontSize: 12,
      ...(showLegend ? {} : { disable: true }),
      ...(config?.legendPosition ? { orient: config.legendPosition } : {}),
    },
  };
};

export const getEmptySpec = () => ({
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  description: 'Drag fields onto encoding shelves to build a chart',
  data: { values: [] },
  mark: 'bar',
  encoding: {},
  width: 'container',
  height: 300,
});

// ============================================================
// Default shelf spec
// ============================================================

/**
 * Get a default (empty) shelfSpec
 */
export const getDefaultShelfSpec = () => ({
  mark: 'auto',
  dataSource: '',
  inlineValues: null,
  encoding: {
    x: null,
    y: null,
    color: null,
    size: null,
    shape: null,
    row: null,
    column: null,
    detail: null,
    text: null,
    opacity: null,
    strokeDash: null,
    tooltip: [],
  },
  markProps: {
    point: undefined,
    interpolate: undefined,
    cornerRadius: undefined,
    opacity: undefined,
    lineWidth: undefined,
  },
  interaction: {
    pointSelection: false,
    intervalBrush: false,
  },
  config: {
    title: '',
    subtitle: '',
    colorScheme: 'tableau10',
    width: 'container',
    height: 300,
    showGrid: true,
    showLegend: true,
    legendPosition: 'right',
    showDataLabels: false,
    trendLine: false,
    referenceLine: null,
  },
});

// ============================================================
// Field type inference from data
// ============================================================

/**
 * Recursively flatten nested objects/arrays into dot-notation field paths.
 * Follows Vega's field access conventions:
 *   - Object keys: parent.child
 *   - Array indices: parent.0.child (uses first element as representative)
 * 
 * @param {*} value - The value to explore
 * @param {string} prefix - Current dot-notation path prefix
 * @param {Set} visited - Circular reference guard
 * @param {number} maxDepth - Maximum nesting depth to prevent runaway recursion
 * @returns {Array<{name: string, type: string, icon: string}>}
 */
const flattenFieldsRecursive = (value, prefix = '', visited = new WeakSet(), maxDepth = 5, results = []) => {
  if (maxDepth <= 0) return results;
  if (results.length > 500) return results; // Prevent runaway recursion and UI freeze

  if (value === null || value === undefined) return results;

  // Circular reference guard for objects
  if (typeof value === 'object') {
    if (visited.has(value)) return results;
    visited.add(value);
  }

  if (Array.isArray(value)) {
    // Add the array field itself as nominal (the raw array)
    if (prefix) {
      results.push({
        name: prefix,
        type: 'nominal',
        icon: '[]',
      });
    }
    // Recurse into first element with index 0
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      flattenFieldsRecursive(value[0], prefix ? `${prefix}.0` : '0', visited, maxDepth - 1, results);
    }
    return results;
  }

  if (typeof value === 'object') {
    // Add the object field itself as nominal
    if (prefix) {
      results.push({
        name: prefix,
        type: 'nominal',
        icon: '{}',
      });
    }
    // Recurse into each key
    for (const key of Object.keys(value)) {
      if (results.length > 500) return results; // Stop if we hit the limit
      const childPath = prefix ? `${prefix}.${key}` : key;
      const childVal = value[key];

      if (childVal === null || childVal === undefined) {
        results.push({ name: childPath, type: 'nominal', icon: getFieldTypeIcon('nominal') });
      } else if (Array.isArray(childVal) || (typeof childVal === 'object')) {
        // Recurse deeper
        flattenFieldsRecursive(childVal, childPath, visited, maxDepth - 1, results);
      } else {
        // Leaf primitive
        const type = inferFieldType(childVal, key, []);
        results.push({ name: childPath, type, icon: getFieldTypeIcon(type) });
      }
    }
    return results;
  }

  // Leaf primitive with prefix
  if (prefix) {
    const type = inferFieldType(value, prefix, []);
    results.push({ name: prefix, type, icon: getFieldTypeIcon(type) });
  }

  return results;
};

/**
 * Infer field types from sample data, including nested dot-notation paths.
 * Returns an array of { name, type, icon } objects.
 */
export const inferFieldsFromData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];

  const sample = data[0];
  if (typeof sample !== 'object' || sample === null) return [];

  // Use multiple sample rows (up to 5) to handle nulls in first row
  const sampleRows = data.slice(0, 5);
  const mergedSample = {};
  for (const row of sampleRows) {
    if (row && typeof row === 'object') {
      for (const key of Object.keys(row)) {
        if (mergedSample[key] === undefined || mergedSample[key] === null) {
          mergedSample[key] = row[key];
        }
      }
    }
  }

  return flattenFieldsRecursive(mergedSample);
};

/**
 * Infer the Vega-Lite type from a JS value
 */
const inferFieldType = (value, key, data) => {
  if (value === null || value === undefined) {
    // Check other rows
    for (const row of data.slice(1, 10)) {
      if (row[key] !== null && row[key] !== undefined) {
        return inferFieldType(row[key], key, []);
      }
    }
    return 'nominal';
  }

  if (typeof value === 'number') return 'quantitative';

  if (typeof value === 'string') {
    // Check if it looks like a date
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value) || !isNaN(Date.parse(value))) {
      return 'temporal';
    }
    // Check if it's a number string
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return 'quantitative';
    }
    return 'nominal';
  }

  if (value instanceof Date) return 'temporal';
  if (typeof value === 'boolean') return 'nominal';

  return 'nominal';
};

/**
 * Get display icon for a field type
 */
export const getFieldTypeIcon = (type) => {
  switch (type) {
    case 'quantitative': return '#';
    case 'temporal': return 'T';
    case 'ordinal': return '↕';
    case 'nominal':
    default: return 'Abc';
  }
};

/**
 * Get display color for a field type
 */
export const getFieldTypeColor = (type) => {
  switch (type) {
    case 'quantitative': return { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' }; // blue
    case 'temporal':     return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }; // amber
    case 'ordinal':      return { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' }; // violet
    case 'nominal':
    default:             return { bg: '#dcfce7', text: '#166534', border: '#86efac' }; // green
  }
};

// Keep backward compat aliases
export const getDefaultChartConfig = getDefaultShelfSpec;
