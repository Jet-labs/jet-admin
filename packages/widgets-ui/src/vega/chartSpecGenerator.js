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

  // Title
  if (config.title) {
    spec.title = {
      text: config.title,
      anchor: 'start',
      fontSize: 14,
      fontWeight: 600,
      offset: 12,
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

  // Special handling for donut
  if (shelfSpec.mark === 'donut') {
    spec.mark = { ...markDef, innerRadius: 50 };
  } else {
    spec.mark = { ...markDef };
  }

  // Encoding
  spec.encoding = buildEncoding(encoding, resolvedMark, config);

  // Theme config
  spec.config = buildThemeConfig(config);

  return spec;
};

// ============================================================
// Section builders
// ============================================================

const buildDataSection = (dataSource, inlineValues) => {
  if (inlineValues && Array.isArray(inlineValues) && inlineValues.length > 0) {
    return { values: inlineValues };
  }
  if (dataSource) {
    return { values: dataSource }; // mustache template resolved at runtime
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
  if (channel.axis !== undefined) enc.axis = channel.axis;
  if (colorScheme) enc.scale = { scheme: colorScheme };

  return enc;
};

const buildThemeConfig = (config) => ({
  background: 'transparent',
  view: { stroke: 'transparent' },
  axis: {
    labelFontSize: 11,
    titleFontSize: 12,
    titlePadding: 8,
    grid: true,
    gridOpacity: 0.15,
  },
  legend: {
    labelFontSize: 11,
    titleFontSize: 12,
  },
});

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
  config: {
    title: '',
    colorScheme: 'tableau10',
    width: 'container',
    height: 300,
  },
});

// ============================================================
// Field type inference from data
// ============================================================

/**
 * Infer field types from a sample data row.
 * Returns an array of { name, type, icon } objects.
 */
export const inferFieldsFromData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];

  const sample = data[0];
  if (typeof sample !== 'object' || sample === null) return [];

  return Object.keys(sample).map(key => {
    const value = sample[key];
    const type = inferFieldType(value, key, data);
    return {
      name: key,
      type,
      icon: getFieldTypeIcon(type),
    };
  });
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
