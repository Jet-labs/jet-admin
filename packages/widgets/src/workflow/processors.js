/**
 * Workflow Data Processors
 * 
 * These functions transform workflow context data into Chart.js compatible formats
 * based on the configured datasetFields mappings.
 */

/**
 * Resolve a mustache-formatted variable path from context
 * Supports: {{ctx.variableName}}, {{ctx.data.rows[*].field}}, {{ctx.data.rows[0].field}}
 * 
 * @param {object} context - The workflow context object
 * @param {string} pathExpr - The path expression (with or without {{}} wrapper)
 * @param {*} fallback - Fallback value if path not found
 * @returns {*} Resolved value
 */
const resolveVariablePath = (context, pathExpr, fallback = undefined) => {
  if (!pathExpr || !context) return fallback;

  // Extract path from mustache format if present
  let cleanPath = pathExpr;
  const mustacheMatch = pathExpr.match(/^\{\{(.+?)\}\}$/);
  if (mustacheMatch) {
    cleanPath = mustacheMatch[1];
  }

  // Remove ctx. prefix if present
  if (cleanPath.startsWith('ctx.')) {
    cleanPath = cleanPath.slice(4);
  }

  // Handle wildcard notation: path[*].field
  if (cleanPath.includes('[*]')) {
    return resolveWildcardPath(context, cleanPath, fallback);
  }

  // Simple path resolution
  const parts = cleanPath.split('.');
  let current = context;

  for (const part of parts) {
    if (current === undefined || current === null) {
      return fallback;
    }

    // Handle array index notation: field[0]
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

  return current !== undefined ? current : fallback;
};

/**
 * Resolve wildcard path: extracts array of values
 * e.g., "queryResult.rows[*].name" -> ["name1", "name2", ...]
 */
const resolveWildcardPath = (context, path, fallback) => {
  const wildcardIndex = path.indexOf('[*]');
  if (wildcardIndex === -1) return fallback;

  // Split path at wildcard
  const beforeWildcard = path.slice(0, wildcardIndex);
  const afterWildcard = path.slice(wildcardIndex + 3); // Skip '[*]'

  // Get array from before wildcard
  let current = context;
  if (beforeWildcard) {
    const parts = beforeWildcard.split('.');
    for (const part of parts) {
      if (current === undefined || current === null) return fallback;
      current = current[part];
    }
  }

  // Must be an array
  if (!Array.isArray(current)) return fallback;

  // If no after path, return the array itself
  if (!afterWildcard || afterWildcard === '.') {
    return current;
  }

  // Extract field from each item
  const fieldPath = afterWildcard.startsWith('.') ? afterWildcard.slice(1) : afterWildcard;
  const results = [];

  for (const item of current) {
    if (item === null || item === undefined) {
      results.push(undefined);
      continue;
    }

    // Navigate nested path in item
    let value = item;
    const fieldParts = fieldPath.split('.');
    for (const part of fieldParts) {
      if (value === undefined || value === null) {
        value = undefined;
        break;
      }
      value = value[part];
    }
    results.push(value);
  }

  return results.length > 0 ? results : fallback;
};

/**
 * Resolve all dataset fields from workflow context
 * 
 * @param {object} context - Workflow context data
 * @param {object} datasetFields - Field mappings { xAxis: "{{ctx.data.rows[*].date}}", yAxis: "..." }
 * @returns {object} Resolved fields { xAxis: [...], yAxis: [...] }
 */
export const resolveDatasetFields = (context, datasetFields) => {
  if (!context || !datasetFields) return {};

  const resolved = {};

  for (const [field, binding] of Object.entries(datasetFields)) {
    if (typeof binding === 'string') {
      resolved[field] = resolveVariablePath(context, binding);
    } else if (binding?.variablePath) {
      resolved[field] = resolveVariablePath(context, binding.variablePath, binding.fallback);
    }
  }

  return resolved;
};

/**
 * Generate chart colors for pie/polar charts
 */
const generateChartColors = (count) => {
  const baseColors = [
    'rgba(100, 108, 255, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(199, 199, 199, 0.6)',
  ];

  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

/**
 * Process workflow context data for Bar Chart
 * 
 * @param {object} params
 * @param {object} params.context - Workflow context data
 * @param {object} params.datasetFields - { xAxis: "{{ctx.data[*].date}}", yAxis: "{{ctx.data[*].value}}" }
 * @param {object} params.parameters - Additional chart parameters (colors, labels, etc.)
 * @returns {object} Chart.js compatible data { labels: [], datasets: [{ data: [] }] }
 */
export const processBarChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
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
      label: params.label || 'Data',
      data,
      backgroundColor: params.backgroundColor || 'rgba(100, 108, 255, 0.6)',
      borderColor: params.borderColor || 'rgba(100, 108, 255, 1)',
      borderWidth: params.borderWidth || 1,
    }],
  };
};

/**
 * Process workflow context data for Line Chart
 */
export const processLineChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
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
      label: params.label || 'Data',
      data,
      fill: params.fill !== undefined ? params.fill : false,
      backgroundColor: params.backgroundColor || 'rgba(100, 108, 255, 0.6)',
      borderColor: params.borderColor || 'rgba(100, 108, 255, 1)',
      borderWidth: params.borderWidth || 2,
      tension: params.tension || 0.1,
    }],
  };
};

/**
 * Process workflow context data for Pie Chart
 */
export const processPieChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
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
      borderColor: params.borderColor || colors.map(c => c.replace('0.6', '1')),
      borderWidth: params.borderWidth || 1,
    }],
  };
};

/**
 * Process workflow context data for Radar Chart
 */
export const processRadarChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  return processPieChartWorkflowData({ context, datasetFields, parameters });
};

/**
 * Process workflow context data for Polar Area Chart
 */
export const processPolarAreaChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
  return processPieChartWorkflowData({ context, datasetFields, parameters });
};

/**
 * Process workflow context data for Scatter Chart
 */
export const processScatterChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
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
      label: params.label || 'Data',
      data: dataPoints,
      backgroundColor: params.backgroundColor || 'rgba(100, 108, 255, 0.6)',
    }],
  };
};

/**
 * Process workflow context data for Bubble Chart
 */
export const processBubbleChartWorkflowData = ({ context, datasetFields, parameters = {} }) => {
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
      label: params.label || 'Data',
      data: dataPoints,
      backgroundColor: params.backgroundColor || 'rgba(100, 108, 255, 0.6)',
    }],
  };
};

/**
 * Process workflow context data for Text Widget
 */
export const processTextWidgetWorkflowData = ({ context, datasetFields }) => {
  const resolved = resolveDatasetFields(context, datasetFields);
  return { text: resolved.text || '' };
};

/**
 * Process workflow context data for Table Widget
 */
export const processTableWidgetWorkflowData = ({ context, datasetFields }) => {
  const resolved = resolveDatasetFields(context, datasetFields);
  return resolved.data || [];
};

/**
 * Process workflow context data for IFrame Widget
 */
export const processIframeWidgetWorkflowData = ({ context, datasetFields }) => {
  const resolved = resolveDatasetFields(context, datasetFields);
  return { url: resolved.url || '' };
};

/**
 * Map of widget type to processor function
 */
export const WORKFLOW_DATA_PROCESSORS = {
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
};

/**
 * Process workflow context data based on widget type
 * 
 * @param {object} params
 * @param {string} params.widgetType - Widget type (bar, line, pie, etc.)
 * @param {object} params.context - Workflow context data
 * @param {object} params.datasetFields - Field mappings from workflowConfig
 * @param {object} params.parameters - Additional chart parameters
 * @returns {object} Processed data ready for widget rendering
 */
export const processWorkflowDataForWidget = ({ widgetType, context, datasetFields, parameters }) => {
  const processor = WORKFLOW_DATA_PROCESSORS[widgetType];
  
  if (!processor) {
    // Unknown widget type, return resolved fields as-is
    return resolveDatasetFields(context, datasetFields);
  }

  return processor({ context, datasetFields, parameters });
};
