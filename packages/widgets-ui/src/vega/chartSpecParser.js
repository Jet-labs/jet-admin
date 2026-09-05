/**
 * Chart Spec Parser
 * 
 * Reverse-engineers a Vega-Lite spec back into a shelfSpec config.
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
 * Parse a Vega-Lite spec into a shelfSpec config.
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
    // Build a shelfSpec-compatible config (mark/dataSource/encoding/markProps/config)
    // NOTE: legacy parser returned {chartType,data,encoding,style} which ShelfBuilder
    // cannot consume — this now returns the same shape as getDefaultShelfSpec().
    const shelfSpec = {
      mark: 'auto',
      dataSource: '',
      inlineValues: null,
      encoding: {
        x: null, y: null, color: null, size: null, shape: null,
        row: null, column: null, detail: null, text: null,
        opacity: null, strokeDash: null, tooltip: [],
      },
      markProps: {},
      interaction: { pointSelection: false, intervalBrush: false },
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
    };

    // Layered specs (emitted by the visual builder for reference/trend/labels):
    // layer[0] is the base mark+encoding, the rest are chrome overlays.
    // Foreign layered specs still warn but parse the base layer.
    let effectiveSpec = spec;
    let chromeLayers = [];
    let chromeConfig = {};
    let isForeignLayer = false;
    if (Array.isArray(spec.layer) && spec.layer.length > 0) {
      const [base, ...rest] = spec.layer;
      if (base?.mark && base?.encoding) {
        effectiveSpec = { ...spec, mark: base.mark, encoding: base.encoding };
        delete effectiveSpec.layer;
        const parsed = parseChromeLayers(rest);
        chromeLayers = parsed.known;
        if (parsed.unknown > 0 || rest.length === 0) isForeignLayer = true;
        chromeConfig = parsed.config;
      } else {
        isForeignLayer = true;
      }
    }

    // 1. Parse chart type from mark
    const markResult = parseMark(effectiveSpec.mark);
    shelfSpec.mark = markResult.chartType;
    if (markResult.warning) warnings.push(markResult.warning);
    const markPropsResult = parseMarkProps(effectiveSpec.mark);
    if (markPropsResult) shelfSpec.markProps = markPropsResult;

    // 2. Parse data
    const parsedData = parseData(spec.data);
    shelfSpec.dataSource = parsedData.source || '';
    shelfSpec.inlineValues = parsedData.inlineValues || null;

    // 3. Parse encoding (all shelf channels)
    const parsedEncoding = parseEncoding(effectiveSpec.encoding, markResult.chartType);
    Object.assign(shelfSpec.encoding, parsedEncoding);

    // 4. Parse style (top-level title/grid/legend)
    const parsedStyle = parseStyle(spec);
    Object.assign(shelfSpec.config, parsedStyle);
    // 4b. Re-apply chrome overlay flags (parseStyle defaults must not clobber them)
    Object.assign(shelfSpec.config, chromeConfig);

    // 5. Parse interaction params (drill-down selections)
    shelfSpec.interaction = parseInteraction(spec.params);

    // 6. Unsupported features (layer warning only for foreign compositions)
    if (spec.transform) warnings.push('Transforms detected — these are not editable in visual mode');
    if (isForeignLayer) warnings.push('Layer composition detected — only the base layer was parsed');
    if (chromeLayers.length > 0 && !isForeignLayer) {
      // chrome overlays restored silently — no warning needed
    }
    if (spec.concat || spec.hconcat || spec.vconcat) warnings.push('Multi-view composition — not supported in visual mode');
    if (spec.repeat) warnings.push('Repeat encoding — not supported in visual mode');

    return {
      success: true,
      config: shelfSpec,
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
    return { chartType: 'auto', warning: 'No mark found, defaulting to auto' };
  }

  const markType = typeof mark === 'string' ? mark : mark.type;
  let chartType = MARK_TO_CHART_TYPE[markType] || 'auto';

  // Detect donut (arc with innerRadius)
  if (markType === 'arc' && typeof mark === 'object' && mark.innerRadius > 0) {
    chartType = 'donut';
  }

  // Detect histogram (bar with bin encoding — checked in encoding parser)

  if (!MARK_TO_CHART_TYPE[markType]) {
    return { chartType, warning: `Unknown mark type "${markType}", defaulting to auto` };
  }

  return { chartType };
};

/**
 * Parse mark-level props (point overlay, interpolation, cornerRadius, opacity)
 */
const parseMarkProps = (mark) => {
  if (!mark || typeof mark === 'string') return {};
  const out = {};
  if (mark.point !== undefined) out.point = mark.point;
  if (mark.interpolate) out.interpolate = mark.interpolate;
  if (mark.cornerRadius !== undefined) out.cornerRadius = mark.cornerRadius;
  if (mark.opacity !== undefined) out.opacity = mark.opacity;
  if (mark.strokeWidth !== undefined) out.lineWidth = mark.strokeWidth;
  return out;
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
  const empty = {
    x: null, y: null, color: null, size: null, shape: null,
    row: null, column: null, detail: null, text: null,
    opacity: null, strokeDash: null, tooltip: [],
  };
  if (!encoding) return empty;

  const result = { ...empty };

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

  if (encoding.size) result.size = parseChannel(encoding.size);
  if (encoding.shape) result.shape = parseChannel(encoding.shape);
  if (encoding.opacity) result.opacity = parseChannel(encoding.opacity);
  if (encoding.strokeDash) result.strokeDash = parseChannel(encoding.strokeDash);
  if (encoding.detail) result.detail = parseChannel(encoding.detail);
  if (encoding.text) result.text = parseChannel(encoding.text);
  if (encoding.row) result.row = parseChannel(encoding.row);
  if (encoding.column) result.column = parseChannel(encoding.column);

  // Tooltip
  if (encoding.tooltip) {
    if (Array.isArray(encoding.tooltip)) {
      result.tooltip = encoding.tooltip.map(t => ({
        field: t.field,
        type: t.type,
        title: t.title,
      }));
    } else if (encoding.tooltip.field) {
      result.tooltip = [{ field: encoding.tooltip.field, type: encoding.tooltip.type, title: encoding.tooltip.title }];
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
    bin: channel.bin ? (channel.bin === true ? true : (channel.bin.maxbins || true)) : null,
    timeUnit: channel.timeUnit || null,
    format: channel.format || '',
    formatType: channel.formatType || '',
  };
};

/**
 * Parse interaction params back into shelfSpec.interaction flags.
 */
const parseInteraction = (params) => {
  const out = { pointSelection: false, intervalBrush: false };
  if (!Array.isArray(params)) return out;
  for (const p of params) {
    const sel = p?.select;
    if (!sel) continue;
    if (sel.type === 'point') out.pointSelection = true;
    if (sel.type === 'interval') out.intervalBrush = true;
  }
  return out;
};

/**
 * Parse chrome overlay layers (reference rule, regression trend, text labels)
 * emitted by the visual builder. Returns restored config flags plus counts.
 */
const parseChromeLayers = (layers) => {
  const config = {};
  let known = 0;
  let unknown = 0;
  for (const layer of layers || []) {
    const markType = typeof layer?.mark === 'string' ? layer.mark : layer?.mark?.type;
    // Reference rule: { mark: { type: 'rule', ... }, encoding: { x|y: { datum } } }
    if (markType === 'rule' && layer?.encoding && (layer.encoding.y?.datum !== undefined || layer.encoding.x?.datum !== undefined)) {
      const axis = layer.encoding.x?.datum !== undefined ? 'x' : 'y';
      const datum = layer.encoding[axis]?.datum;
      config.referenceLine = {
        value: datum !== undefined && datum !== null ? String(datum) : '',
        label: layer.encoding[axis]?.title || '',
        color: layer.mark?.color || '#ef4444',
        axis,
      };
      known += 1;
      continue;
    }
    // Trend line: regression transform + line mark
    if (markType === 'line' && Array.isArray(layer?.transform) && layer.transform.some(t => t?.regression)) {
      config.trendLine = true;
      known += 1;
      continue;
    }
    // Data labels: text mark layer
    if (markType === 'text') {
      config.showDataLabels = true;
      known += 1;
      continue;
    }
    unknown += 1;
  }
  return { config, known: Array(known).fill('chrome'), unknown };
};

/**
 * Parse style/config from spec
 */
const parseStyle = (spec) => {
  const style = {
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
  };

  // Title (+ subtitle)
  if (spec.title) {
    if (typeof spec.title === 'string') {
      style.title = spec.title;
    } else if (spec.title.text) {
      style.title = spec.title.text;
      if (spec.title.subtitle) style.subtitle = spec.title.subtitle;
    }
  }

  // Dimensions
  if (spec.width) style.width = spec.width;
  if (spec.height) style.height = spec.height;

  // Color scheme (from encoding)
  const encForScheme = spec.encoding || spec.layer?.[0]?.encoding;
  if (encForScheme) {
    const colorScale = encForScheme.color?.scale;
    if (colorScale?.scheme) {
      style.colorScheme = colorScale.scheme;
    }
  }

  // Grid / legend chrome (from top-level config)
  if (spec.config?.axis && typeof spec.config.axis.grid === 'boolean') {
    style.showGrid = spec.config.axis.grid;
  }
  if (spec.config?.legend) {
    if (spec.config.legend.disable === true) style.showLegend = false;
    if (spec.config.legend.orient) style.legendPosition = spec.config.legend.orient;
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
