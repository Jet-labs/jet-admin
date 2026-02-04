/**
 * Path Resolution Utilities
 * 
 * Shared utility functions for resolving mustache-formatted variable paths
 * from workflow context data.
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
export const resolveVariablePath = (context, pathExpr, fallback = undefined) => {
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
export const generateChartColors = (count) => {
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
