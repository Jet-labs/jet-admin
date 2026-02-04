var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  processWorkflowDataForWidget: () => processWorkflowDataForWidget
});
module.exports = __toCommonJS(index_exports);

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
var generateChartColors = (count) => {
  const baseColors = [
    "rgba(100, 108, 255, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)",
    "rgba(199, 199, 199, 0.6)"
  ];
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

// src/bar/processors.js
var processBarChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  const params = parameters || {};
  const resolved = resolveDatasetFields(context, datasetFields);
  const labels = resolved.xAxis || [];
  const data = resolved.yAxis || [];
  if (!Array.isArray(labels) || !Array.isArray(data)) {
    return { labels: [], datasets: [] };
  }
  return {
    labels,
    datasets: [{
      label: params.label || "Data",
      data,
      backgroundColor: params.backgroundColor || "rgba(100, 108, 255, 0.6)",
      borderColor: params.borderColor || "rgba(100, 108, 255, 1)",
      borderWidth: params.borderWidth || 1
    }]
  };
};

// src/line/processors.js
var processLineChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  const params = parameters || {};
  const resolved = resolveDatasetFields(context, datasetFields);
  const labels = resolved.xAxis || [];
  const data = resolved.yAxis || [];
  if (!Array.isArray(labels) || !Array.isArray(data)) {
    return { labels: [], datasets: [] };
  }
  return {
    labels,
    datasets: [{
      label: params.label || "Data",
      data,
      fill: params.fill !== void 0 ? params.fill : false,
      backgroundColor: params.backgroundColor || "rgba(100, 108, 255, 0.6)",
      borderColor: params.borderColor || "rgba(100, 108, 255, 1)",
      borderWidth: params.borderWidth || 2,
      tension: params.tension || 0.1
    }]
  };
};

// src/pie/processors.js
var processPieChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  const params = parameters || {};
  const resolved = resolveDatasetFields(context, datasetFields);
  const labels = resolved.label || [];
  const data = resolved.value || [];
  if (!Array.isArray(labels) || !Array.isArray(data)) {
    return { labels: [], datasets: [] };
  }
  const colors = params.backgroundColor || generateChartColors(data.length);
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderColor: params.borderColor || colors.map((c) => c.replace("0.6", "1")),
      borderWidth: params.borderWidth || 1
    }]
  };
};

// src/radar/processors.js
var processRadarChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  const params = parameters || {};
  const resolved = resolveDatasetFields(context, datasetFields);
  const labels = resolved.label || [];
  const data = resolved.value || [];
  if (!Array.isArray(labels) || !Array.isArray(data)) {
    return { labels: [], datasets: [] };
  }
  const colors = params.backgroundColor || generateChartColors(data.length);
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderColor: params.borderColor || colors.map((c) => c.replace("0.6", "1")),
      borderWidth: params.borderWidth || 1
    }]
  };
};

// src/polarArea/processors.js
var processPolarAreaChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  const params = parameters || {};
  const resolved = resolveDatasetFields(context, datasetFields);
  const labels = resolved.label || [];
  const data = resolved.value || [];
  if (!Array.isArray(labels) || !Array.isArray(data)) {
    return { labels: [], datasets: [] };
  }
  const colors = params.backgroundColor || generateChartColors(data.length);
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderColor: params.borderColor || colors.map((c) => c.replace("0.6", "1")),
      borderWidth: params.borderWidth || 1
    }]
  };
};

// src/scatter/processors.js
var processScatterChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  const params = parameters || {};
  const resolved = resolveDatasetFields(context, datasetFields);
  const xData = resolved.xAxis || [];
  const yData = resolved.yAxis || [];
  if (!Array.isArray(xData) || !Array.isArray(yData)) {
    return { datasets: [] };
  }
  const dataPoints = xData.map((x, i) => ({ x, y: yData[i] }));
  return {
    datasets: [{
      label: params.label || "Data",
      data: dataPoints,
      backgroundColor: params.backgroundColor || "rgba(100, 108, 255, 0.6)"
    }]
  };
};

// src/bubble/processors.js
var processBubbleChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  const params = parameters || {};
  const resolved = resolveDatasetFields(context, datasetFields);
  const xData = resolved.xAxis || [];
  const yData = resolved.yAxis || [];
  const rData = resolved.radius || [];
  if (!Array.isArray(xData) || !Array.isArray(yData)) {
    return { datasets: [] };
  }
  const dataPoints = xData.map((x, i) => ({
    x,
    y: yData[i],
    r: rData[i] || 5
  }));
  return {
    datasets: [{
      label: params.label || "Data",
      data: dataPoints,
      backgroundColor: params.backgroundColor || "rgba(100, 108, 255, 0.6)"
    }]
  };
};

// src/text/processors.js
var processTextWidgetWorkflowData = ({ context, datasetFields }) => {
  const resolved = resolveDatasetFields(context, datasetFields);
  return { text: resolved.text || "" };
};

// src/table/processors.js
var processTableWidgetWorkflowData = ({ context, datasetFields }) => {
  const resolved = resolveDatasetFields(context, datasetFields);
  return resolved.data || [];
};

// src/iframe/processors.js
var processIframeWidgetWorkflowData = ({ context, datasetFields }) => {
  const resolved = resolveDatasetFields(context, datasetFields);
  return { url: resolved.url || "" };
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

// src/index.js
var WIDGET_PROCESSORS = {
  bar: processBarChartWorkflowData,
  line: processLineChartWorkflowData,
  pie: processPieChartWorkflowData,
  radar: processRadarChartWorkflowData,
  polarArea: processPolarAreaChartWorkflowData,
  scatter: processScatterChartWorkflowData,
  bubble: processBubbleChartWorkflowData,
  text: processTextWidgetWorkflowData,
  table: processTableWidgetWorkflowData,
  iframe: processIframeWidgetWorkflowData,
  "vega-lite": processVegaLiteWorkflowData
};
var processWorkflowDataForWidget = ({ widgetType, context, datasetFields, parameters, workflowConfig }) => {
  const processor = WIDGET_PROCESSORS[widgetType];
  if (!processor) {
    return resolveDatasetFields(context, datasetFields);
  }
  if (widgetType === "vega-lite") {
    return processor({ context, workflowConfig });
  }
  return processor({ context, datasetFields, parameters });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  processWorkflowDataForWidget
});
//# sourceMappingURL=index.cjs.map
