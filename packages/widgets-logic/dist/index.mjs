// src/utils/pathResolvers.js
var resolveVariablePath = (context, pathExpr, fallback = void 0) => {
  if (!pathExpr || !context) return fallback;
  let cleanPath = pathExpr;
  const mustacheMatch = pathExpr.match(/^\{\{(.+?)\}\}$/);
  if (mustacheMatch) {
    cleanPath = mustacheMatch[1];
  }
  if (cleanPath.startsWith("ctx.")) {
    cleanPath = cleanPath.slice(4);
  }
  if (cleanPath.includes("[*]")) {
    return resolveWildcardPath(context, cleanPath, fallback);
  }
  const parts = cleanPath.split(".");
  let current = context;
  for (const part of parts) {
    if (current === void 0 || current === null) {
      return fallback;
    }
    const indexMatch = part.match(/^(.+?)\[(\d+)\]$/);
    if (indexMatch) {
      const [, prop, index] = indexMatch;
      current = current[prop];
      if (Array.isArray(current)) {
        current = current[parseInt(index, 10)];
      } else {
        return fallback;
      }
    } else {
      current = current[part];
    }
  }
  return current !== void 0 ? current : fallback;
};
var resolveWildcardPath = (context, path, fallback) => {
  const wildcardIndex = path.indexOf("[*]");
  if (wildcardIndex === -1) return fallback;
  const beforeWildcard = path.slice(0, wildcardIndex);
  const afterWildcard = path.slice(wildcardIndex + 3);
  let current = context;
  if (beforeWildcard) {
    const parts = beforeWildcard.split(".");
    for (const part of parts) {
      if (current === void 0 || current === null) return fallback;
      current = current[part];
    }
  }
  if (!Array.isArray(current)) return fallback;
  if (!afterWildcard || afterWildcard === ".") {
    return current;
  }
  const fieldPath = afterWildcard.startsWith(".") ? afterWildcard.slice(1) : afterWildcard;
  const results = [];
  for (const item of current) {
    if (item === null || item === void 0) {
      results.push(void 0);
      continue;
    }
    let value = item;
    const fieldParts = fieldPath.split(".");
    for (const part of fieldParts) {
      if (value === void 0 || value === null) {
        value = void 0;
        break;
      }
      value = value[part];
    }
    results.push(value);
  }
  return results.length > 0 ? results : fallback;
};
var resolveDatasetFields = (context, datasetFields) => {
  if (!context || !datasetFields) return {};
  const resolved = {};
  for (const [field, binding] of Object.entries(datasetFields)) {
    if (typeof binding === "string") {
      resolved[field] = resolveVariablePath(context, binding);
    } else if (binding?.variablePath) {
      resolved[field] = resolveVariablePath(context, binding.variablePath, binding.fallback);
    }
  }
  return resolved;
};

// src/vega/processors.js
var applyTransforms = (data, transforms) => {
  if (!transforms || !Array.isArray(transforms) || !Array.isArray(data)) {
    return data;
  }
  let result = [...data];
  for (const transform of transforms) {
    try {
      switch (transform.type) {
        case "filter":
          if (transform.field && transform.value !== void 0) {
            result = result.filter((row) => row[transform.field] === transform.value);
          } else if (transform.field && transform.gte !== void 0) {
            result = result.filter((row) => row[transform.field] >= transform.gte);
          } else if (transform.field && transform.lte !== void 0) {
            result = result.filter((row) => row[transform.field] <= transform.lte);
          }
          break;
        case "calculate":
          if (transform.field && transform.as) {
            result = result.map((row) => ({
              ...row,
              [transform.as]: row[transform.field]
            }));
          }
          break;
        case "sort":
          if (transform.field) {
            result.sort((a, b) => {
              const valA = a[transform.field];
              const valB = b[transform.field];
              const comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
              return transform.order === "descending" ? -comparison : comparison;
            });
          }
          break;
      }
    } catch (err) {
      console.error("Transform error:", err);
    }
  }
  return result;
};
var processVegaLiteWorkflowData = ({ context, workflowConfig }) => {
  const {
    vegaSpec,
    dataSource,
    dataSources,
    transforms,
    width,
    height
  } = workflowConfig || {};
  if (!vegaSpec) {
    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "No specification provided",
      data: { values: [] },
      mark: "point"
    };
  }
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: width || "container",
    height: height || "container",
    autosize: { type: "fit", contains: "padding" },
    ...vegaSpec
  };
  if (dataSource) {
    const rawData = resolveVariablePath(context, dataSource, []);
    const data = applyTransforms(rawData, transforms);
    spec.data = { values: Array.isArray(data) ? data : [] };
  }
  if (dataSources && typeof dataSources === "object") {
    spec.datasets = {};
    for (const [name, path] of Object.entries(dataSources)) {
      const resolved = resolveVariablePath(context, path, []);
      spec.datasets[name] = Array.isArray(resolved) ? resolved : [];
    }
  }
  return spec;
};
var processVegaWorkflowData = ({ context, workflowConfig }) => {
  const {
    vegaSpec,
    dataSource,
    dataSources,
    transforms,
    width,
    height
  } = workflowConfig || {};
  if (!vegaSpec) {
    return {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      description: "No specification provided",
      data: [],
      marks: []
    };
  }
  const spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: width || "container",
    height: height || "container",
    autosize: { type: "fit", contains: "padding" },
    ...vegaSpec
  };
  if (dataSource) {
    const rawData = resolveVariablePath(context, dataSource, []);
    const data = applyTransforms(rawData, transforms);
    if (!spec.data) spec.data = [];
    const dataName = "source";
    const existingDataIndex = spec.data.findIndex((d) => d.name === dataName);
    if (existingDataIndex >= 0) {
      spec.data[existingDataIndex].values = Array.isArray(data) ? data : [];
    } else {
      spec.data.push({
        name: dataName,
        values: Array.isArray(data) ? data : []
      });
    }
  }
  if (dataSources && typeof dataSources === "object") {
    if (!spec.data) spec.data = [];
    for (const [name, path] of Object.entries(dataSources)) {
      const resolved = resolveVariablePath(context, path, []);
      const values = Array.isArray(resolved) ? resolved : [];
      const existingDataIndex = spec.data.findIndex((d) => d.name === name);
      if (existingDataIndex >= 0) {
        spec.data[existingDataIndex].values = values;
      } else {
        spec.data.push({
          name,
          values
        });
      }
    }
  }
  return spec;
};

// src/utils/specInterpolator.js
var EXPRESSION_REGEX = /\{\{([^}]+)\}\}/g;
var hasExpressions = (str) => {
  if (typeof str !== "string") return false;
  return /\{\{[^}]+\}\}/.test(str);
};
var interpolateString = (str, context) => {
  if (!hasExpressions(str)) {
    return str;
  }
  EXPRESSION_REGEX.lastIndex = 0;
  const trimmed = str.trim();
  const singleMatch = trimmed.match(/^\{\{([^}]+)\}\}$/);
  if (singleMatch) {
    const path = singleMatch[1].trim();
    return resolveVariablePath(context, path);
  }
  return str.replace(EXPRESSION_REGEX, (match, path) => {
    const value = resolveVariablePath(context, path.trim());
    if (value === null || value === void 0) {
      return "";
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  });
};
var interpolateSpec = (spec, context) => {
  if (spec === null || spec === void 0) {
    return spec;
  }
  if (typeof spec === "string") {
    return interpolateString(spec, context);
  }
  if (Array.isArray(spec)) {
    return spec.map((item) => interpolateSpec(item, context));
  }
  if (typeof spec === "object") {
    const result = {};
    for (const [key, value] of Object.entries(spec)) {
      result[key] = interpolateSpec(value, context);
    }
    return result;
  }
  return spec;
};
var processWidgetSpec = ({ vegaSpec, context, options = {} }) => {
  if (!vegaSpec) {
    return null;
  }
  const contextWrapper = {
    ctx: context,
    ...context
    // Also allow direct access to context properties
  };
  const processedSpec = interpolateSpec(vegaSpec, contextWrapper);
  return {
    ...processedSpec,
    // Ensure width/height are responsive if not specified
    ...processedSpec.width === void 0 && { width: "container" },
    ...processedSpec.height === void 0 && { height: "container" }
  };
};

// src/vega/chartSpecGenerator.js
var MARK_TYPES = {
  bar: { type: "bar", tooltip: true },
  line: { type: "line", tooltip: true, point: true },
  area: { type: "area", tooltip: true, line: true, opacity: 0.7 },
  point: { type: "point", tooltip: true, filled: true, opacity: 0.7 },
  circle: { type: "circle", tooltip: true, opacity: 0.7 },
  square: { type: "square", tooltip: true },
  arc: { type: "arc", tooltip: true },
  rect: { type: "rect", tooltip: true },
  tick: { type: "tick", tooltip: true },
  text: { type: "text" }
};
var MARK_ALIASES = {
  scatter: "point",
  pie: "arc",
  donut: "arc",
  heatmap: "rect",
  histogram: "bar"
};
var POSITIONAL_CHANNELS = ["x", "y", "row", "column"];
var RETINAL_CHANNELS = ["color", "size", "shape", "opacity", "strokeDash", "detail"];
var TEXT_CHANNELS = ["text", "tooltip"];
var ALL_CHANNELS = [...POSITIONAL_CHANNELS, ...RETINAL_CHANNELS, ...TEXT_CHANNELS];
var FIELD_TYPES = ["nominal", "ordinal", "quantitative", "temporal"];
var AGGREGATE_TYPES = [
  "count",
  "sum",
  "mean",
  "median",
  "min",
  "max",
  "variance",
  "stdev",
  "distinct",
  "valid",
  "missing"
];
var COLOR_SCHEMES = [
  "tableau10",
  "category10",
  "category20",
  "accent",
  "dark2",
  "paired",
  "set1",
  "set2",
  "set3",
  "pastel1",
  "pastel2",
  "blues",
  "greens",
  "oranges",
  "reds",
  "purples",
  "greys",
  "viridis",
  "magma",
  "inferno",
  "plasma",
  "spectral"
];
var inferMarkType = (encoding) => {
  const xType = encoding?.x?.type;
  const yType = encoding?.y?.type;
  const hasX = !!encoding?.x?.field;
  const hasY = !!encoding?.y?.field;
  const hasColor = !!encoding?.color?.field;
  const hasSize = !!encoding?.size?.field;
  if (!hasX && !hasY) return "bar";
  if (hasX && !hasY) {
    if (xType === "quantitative") return "bar";
    return "bar";
  }
  if (!hasX && hasY) {
    if (yType === "quantitative") return "bar";
    return "bar";
  }
  const isXCat = xType === "nominal" || xType === "ordinal";
  const isYCat = yType === "nominal" || yType === "ordinal";
  const isXQuant = xType === "quantitative";
  const isYQuant = yType === "quantitative";
  const isXTemp = xType === "temporal";
  const isYTemp = yType === "temporal";
  if (isXTemp && isYQuant || isYTemp && isXQuant) return "line";
  if (isXCat && isYQuant || isYCat && isXQuant) return "bar";
  if (isXQuant && isYQuant) return "point";
  if (isXCat && isYCat && hasColor) return "rect";
  return "bar";
};
var generateVegaLiteSpec = (shelfSpec) => {
  if (!shelfSpec) return getEmptySpec();
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json"
  };
  const encoding = shelfSpec.encoding || {};
  const config = shelfSpec.config || {};
  if (config.title) {
    spec.title = {
      text: config.title,
      anchor: "start",
      fontSize: 14,
      fontWeight: 600,
      offset: 12
    };
  }
  spec.width = config.width === "container" ? "container" : config.width || "container";
  spec.height = config.height || 300;
  spec.autosize = { type: "fit", contains: "padding" };
  spec.data = buildDataSection(shelfSpec.dataSource, shelfSpec.inlineValues);
  const resolvedMark = shelfSpec.mark === "auto" || !shelfSpec.mark ? inferMarkType(encoding) : MARK_ALIASES[shelfSpec.mark] || shelfSpec.mark;
  const markDef = MARK_TYPES[resolvedMark] || MARK_TYPES.bar;
  if (shelfSpec.mark === "donut") {
    spec.mark = { ...markDef, innerRadius: 50 };
  } else {
    spec.mark = { ...markDef };
  }
  spec.encoding = buildEncoding(encoding, resolvedMark, config);
  spec.config = buildThemeConfig(config);
  return spec;
};
var buildDataSection = (dataSource, inlineValues) => {
  if (inlineValues && Array.isArray(inlineValues) && inlineValues.length > 0) {
    return { values: inlineValues };
  }
  if (dataSource) {
    return { values: dataSource };
  }
  return { values: [] };
};
var buildEncoding = (encoding, markType, config) => {
  const enc = {};
  const isArc = markType === "arc";
  if (isArc) {
    if (encoding.y?.field) {
      enc.theta = buildChannel(encoding.y);
    }
    if (encoding.x?.field) {
      enc.color = buildChannel(encoding.x, config?.colorScheme);
    }
  } else {
    if (encoding.x?.field) enc.x = buildChannel(encoding.x);
    if (encoding.y?.field) enc.y = buildChannel(encoding.y);
  }
  if (encoding.row?.field) enc.row = buildChannel(encoding.row);
  if (encoding.column?.field) enc.column = buildChannel(encoding.column);
  if (!isArc && encoding.color?.field) enc.color = buildChannel(encoding.color, config?.colorScheme);
  if (encoding.size?.field) enc.size = buildChannel(encoding.size);
  if (encoding.shape?.field) enc.shape = buildChannel(encoding.shape);
  if (encoding.opacity?.field) enc.opacity = buildChannel(encoding.opacity);
  if (encoding.strokeDash?.field) enc.strokeDash = buildChannel(encoding.strokeDash);
  if (encoding.detail?.field) enc.detail = buildChannel(encoding.detail);
  if (encoding.text?.field) enc.text = buildChannel(encoding.text);
  if (encoding.tooltip) {
    if (Array.isArray(encoding.tooltip)) {
      const tooltips = encoding.tooltip.filter((t) => t?.field);
      if (tooltips.length > 0) {
        enc.tooltip = tooltips.map((t) => ({
          field: t.field,
          ...t.type && { type: t.type },
          ...t.title && { title: t.title }
        }));
      }
    } else if (encoding.tooltip?.field) {
      enc.tooltip = { field: encoding.tooltip.field, type: encoding.tooltip.type };
    }
  }
  return enc;
};
var buildChannel = (channel, colorScheme) => {
  if (!channel || !channel.field) return void 0;
  const enc = {
    field: channel.field,
    type: channel.type || "nominal"
  };
  if (channel.title) enc.title = channel.title;
  if (channel.aggregate && channel.aggregate !== "none") enc.aggregate = channel.aggregate;
  if (channel.sort) enc.sort = channel.sort;
  if (channel.bin) enc.bin = channel.bin === true ? true : { maxbins: channel.bin };
  if (channel.timeUnit) enc.timeUnit = channel.timeUnit;
  if (channel.axis !== void 0) enc.axis = channel.axis;
  if (colorScheme) enc.scale = { scheme: colorScheme };
  return enc;
};
var buildThemeConfig = (config) => ({
  background: "transparent",
  view: { stroke: "transparent" },
  axis: {
    labelFontSize: 11,
    titleFontSize: 12,
    titlePadding: 8,
    grid: true,
    gridOpacity: 0.15
  },
  legend: {
    labelFontSize: 11,
    titleFontSize: 12
  }
});
var getEmptySpec = () => ({
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  description: "Drag fields onto encoding shelves to build a chart",
  data: { values: [] },
  mark: "bar",
  encoding: {},
  width: "container",
  height: 300
});
var getDefaultShelfSpec = () => ({
  mark: "auto",
  dataSource: "",
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
    tooltip: []
  },
  config: {
    title: "",
    colorScheme: "tableau10",
    width: "container",
    height: 300
  }
});
var inferFieldsFromData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const sample = data[0];
  if (typeof sample !== "object" || sample === null) return [];
  return Object.keys(sample).map((key) => {
    const value = sample[key];
    const type = inferFieldType(value, key, data);
    return {
      name: key,
      type,
      icon: getFieldTypeIcon(type)
    };
  });
};
var inferFieldType = (value, key, data) => {
  if (value === null || value === void 0) {
    for (const row of data.slice(1, 10)) {
      if (row[key] !== null && row[key] !== void 0) {
        return inferFieldType(row[key], key, []);
      }
    }
    return "nominal";
  }
  if (typeof value === "number") return "quantitative";
  if (typeof value === "string") {
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value) || !isNaN(Date.parse(value))) {
      return "temporal";
    }
    if (!isNaN(Number(value)) && value.trim() !== "") {
      return "quantitative";
    }
    return "nominal";
  }
  if (value instanceof Date) return "temporal";
  if (typeof value === "boolean") return "nominal";
  return "nominal";
};
var getFieldTypeIcon = (type) => {
  switch (type) {
    case "quantitative":
      return "#";
    case "temporal":
      return "T";
    case "ordinal":
      return "\u2195";
    case "nominal":
    default:
      return "Abc";
  }
};
var getFieldTypeColor = (type) => {
  switch (type) {
    case "quantitative":
      return { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" };
    // blue
    case "temporal":
      return { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" };
    // amber
    case "ordinal":
      return { bg: "#ede9fe", text: "#6d28d9", border: "#c4b5fd" };
    // violet
    case "nominal":
    default:
      return { bg: "#dcfce7", text: "#166534", border: "#86efac" };
  }
};
var getDefaultChartConfig = getDefaultShelfSpec;

// src/vega/chartSpecParser.js
var MARK_TO_CHART_TYPE = {
  bar: "bar",
  line: "line",
  area: "area",
  arc: "pie",
  // refined by innerRadius check
  point: "scatter",
  rect: "heatmap",
  boxplot: "boxplot",
  tick: "tick"
};
var parseVegaLiteSpec = (spec) => {
  const warnings = [];
  if (!spec || !spec.$schema) {
    return {
      success: false,
      config: null,
      warnings: ["Not a valid Vega-Lite spec (missing $schema)"]
    };
  }
  if (spec.$schema.includes("/vega/") && !spec.$schema.includes("/vega-lite/")) {
    return {
      success: false,
      config: null,
      warnings: ["This is a full Vega spec, not Vega-Lite. Visual builder only supports Vega-Lite."]
    };
  }
  try {
    const config = {};
    const markResult = parseMark(spec.mark);
    config.chartType = markResult.chartType;
    if (markResult.warning) warnings.push(markResult.warning);
    config.data = parseData(spec.data);
    config.encoding = parseEncoding(spec.encoding, config.chartType);
    config.style = parseStyle(spec);
    if (spec.transform) warnings.push("Transforms detected \u2014 these are not editable in visual mode");
    if (spec.layer) warnings.push("Layer composition detected \u2014 not supported in visual mode");
    if (spec.concat || spec.hconcat || spec.vconcat) warnings.push("Multi-view composition \u2014 not supported in visual mode");
    if (spec.selection || spec.params) warnings.push("Interactive selections \u2014 preserved but not editable in visual mode");
    if (spec.repeat) warnings.push("Repeat encoding \u2014 not supported in visual mode");
    return {
      success: true,
      config,
      warnings
    };
  } catch (err) {
    return {
      success: false,
      config: null,
      warnings: [`Parse error: ${err.message}`]
    };
  }
};
var parseMark = (mark) => {
  if (!mark) {
    return { chartType: "bar", warning: "No mark found, defaulting to bar" };
  }
  const markType = typeof mark === "string" ? mark : mark.type;
  let chartType = MARK_TO_CHART_TYPE[markType] || "bar";
  if (markType === "arc" && typeof mark === "object" && mark.innerRadius > 0) {
    chartType = "donut";
  }
  if (!MARK_TO_CHART_TYPE[markType]) {
    return { chartType, warning: `Unknown mark type "${markType}", defaulting to bar` };
  }
  return { chartType };
};
var parseData = (data) => {
  if (!data) {
    return { source: "", inlineValues: null };
  }
  if (data.values) {
    if (typeof data.values === "string") {
      return { source: data.values, inlineValues: null };
    }
    if (Array.isArray(data.values)) {
      return { source: "", inlineValues: data.values };
    }
  }
  if (data.url) {
    return { source: data.url, inlineValues: null };
  }
  return { source: "", inlineValues: null };
};
var parseEncoding = (encoding, chartType) => {
  if (!encoding) {
    return { x: null, y: null, color: null, size: null, tooltip: [] };
  }
  const result = {
    x: null,
    y: null,
    color: null,
    size: null,
    tooltip: []
  };
  if (chartType === "pie" || chartType === "donut") {
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
  if (encoding.tooltip) {
    if (Array.isArray(encoding.tooltip)) {
      result.tooltip = encoding.tooltip.map((t) => ({
        field: t.field,
        type: t.type,
        title: t.title
      }));
    } else if (encoding.tooltip.field) {
      result.tooltip = [{ field: encoding.tooltip.field, type: encoding.tooltip.type }];
    }
  }
  return result;
};
var parseChannel = (channel) => {
  if (!channel) return null;
  return {
    field: channel.field || "",
    type: channel.type || "nominal",
    title: channel.title || "",
    aggregate: channel.aggregate || "none",
    sort: channel.sort || null,
    bin: channel.bin || null,
    timeUnit: channel.timeUnit || null
  };
};
var parseStyle = (spec) => {
  const style = {
    title: "",
    colorScheme: "tableau10",
    width: "container",
    height: 300
  };
  if (spec.title) {
    if (typeof spec.title === "string") {
      style.title = spec.title;
    } else if (spec.title.text) {
      style.title = spec.title.text;
    }
  }
  if (spec.width) style.width = spec.width;
  if (spec.height) style.height = spec.height;
  if (spec.encoding) {
    const colorScale = spec.encoding.color?.scale;
    if (colorScale?.scheme) {
      style.colorScheme = colorScale.scheme;
    }
  }
  return style;
};
var isSpecParseable = (spec) => {
  if (!spec || !spec.$schema) return false;
  if (spec.$schema.includes("/vega/") && !spec.$schema.includes("/vega-lite/")) return false;
  if (spec.layer || spec.concat || spec.hconcat || spec.vconcat) return false;
  if (spec.repeat) return false;
  return true;
};

// src/index.js
var WIDGET_PROCESSORS = {
  "vega-lite": processVegaLiteWorkflowData,
  "vega": processVegaWorkflowData
};
var processWorkflowDataForWidget = ({ widgetType, context, datasetFields, parameters, workflowConfig }) => {
  if (workflowConfig?.vegaSpec) {
    return processWidgetSpec({
      vegaSpec: workflowConfig.vegaSpec,
      context,
      options: workflowConfig.options
    });
  }
  const processor = WIDGET_PROCESSORS[widgetType];
  if (!processor) {
    return resolveDatasetFields(context, datasetFields);
  }
  return processor({ context, workflowConfig });
};
export {
  AGGREGATE_TYPES,
  ALL_CHANNELS,
  COLOR_SCHEMES,
  FIELD_TYPES,
  MARK_ALIASES,
  MARK_TYPES,
  POSITIONAL_CHANNELS,
  RETINAL_CHANNELS,
  TEXT_CHANNELS,
  generateVegaLiteSpec,
  getDefaultChartConfig,
  getDefaultShelfSpec,
  getEmptySpec,
  getFieldTypeColor,
  getFieldTypeIcon,
  inferFieldsFromData,
  inferMarkType,
  interpolateSpec,
  isSpecParseable,
  parseVegaLiteSpec,
  processWidgetSpec,
  processWorkflowDataForWidget,
  resolveDatasetFields
};
//# sourceMappingURL=index.mjs.map
