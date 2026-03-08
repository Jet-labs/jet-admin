/**
 * Vega Spec Interpolator
 * 
 * Deep interpolates {{ctx.*}} expressions in Vega/Vega-Lite specifications.
 * Supports:
 * - String values: "{{ctx.queryResult.rows}}"
 * - Array wildcard: "{{ctx.data[*].name}}"
 * - Nested paths: "{{ctx.workflow.output.data}}"
 * - Mixed content: "Total: {{ctx.count}} items"
 */

import { resolveVariablePath } from './pathResolvers';

/**
 * Regular expression to match {{...}} expressions
 */
const EXPRESSION_REGEX = /\{\{([^}]+)\}\}/g;

/**
 * Check if a string contains template expressions
 * @param {string} str - String to check
 * @returns {boolean}
 */
const hasExpressions = (str) => {
  if (typeof str !== 'string') return false;
  // Use a non-global regex for .test() to avoid lastIndex statefulness bug
  return /\{\{[^}]+\}\}/.test(str);
};

/**
 * Interpolate a single string value
 * @param {string} str - String containing {{...}} expressions
 * @param {object} context - Context object for variable resolution
 * @returns {*} Interpolated value (may be string, array, object, or primitive)
 */
const interpolateString = (str, context) => {
  if (!hasExpressions(str)) {
    return str;
  }

  // Reset regex lastIndex
  EXPRESSION_REGEX.lastIndex = 0;

  // Check if the entire string is a single expression (e.g., "{{ctx.data}}")
  const trimmed = str.trim();
  const singleMatch = trimmed.match(/^\{\{([^}]+)\}\}$/);
  
  if (singleMatch) {
    // Single expression - return the resolved value directly (can be any type)
    const path = singleMatch[1].trim();
    return resolveVariablePath(context, path);
  }

  // Multiple expressions or mixed content - return string with interpolated values
  return str.replace(EXPRESSION_REGEX, (match, path) => {
    const value = resolveVariablePath(context, path.trim());
    
    // Convert non-string values to JSON for mixed content
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  });
};

/**
 * Deep interpolate all {{...}} expressions in a Vega spec
 * Recursively processes objects, arrays, and strings
 * 
 * @param {*} spec - Vega/Vega-Lite specification (or any nested value)
 * @param {object} context - Context object containing workflow data
 * @returns {*} Interpolated spec with all expressions resolved
 * 
 * @example
 * const spec = {
 *   data: { values: "{{ctx.queryResult.rows}}" },
 *   encoding: {
 *     x: { field: "{{ctx.xField}}" }
 *   }
 * };
 * const result = interpolateSpec(spec, { ctx: workflowContext });
 */
export const interpolateSpec = (spec, context) => {
  // Handle null/undefined
  if (spec === null || spec === undefined) {
    return spec;
  }

  // Handle strings - interpolate expressions
  if (typeof spec === 'string') {
    return interpolateString(spec, context);
  }

  // Handle arrays - recursively interpolate each element
  if (Array.isArray(spec)) {
    return spec.map(item => interpolateSpec(item, context));
  }

  // Handle objects - recursively interpolate each property
  if (typeof spec === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(spec)) {
      result[key] = interpolateSpec(value, context);
    }
    return result;
  }

  // Handle primitives (numbers, booleans) - return as-is
  return spec;
};

/**
 * Process a widget's Vega spec with workflow context
 * Main entry point for widget data processing
 * 
 * @param {object} params
 * @param {object} params.vegaSpec - The Vega/Vega-Lite specification
 * @param {object} params.context - Workflow context data
 * @param {object} params.options - Optional processing options
 * @returns {object} Processed Vega spec ready for rendering
 */
export const processWidgetSpec = ({ vegaSpec, context, options = {} }) => {
  if (!vegaSpec) {
    return null;
  }

  // Create the context wrapper expected by expressions
  const contextWrapper = {
    ctx: context,
    ...context, // Also allow direct access to context properties
  };

  // Interpolate the spec
  const processedSpec = interpolateSpec(vegaSpec, contextWrapper);

  // Apply default options if not present
  return {
    ...processedSpec,
    // Ensure width/height are responsive if not specified
    ...(processedSpec.width === undefined && { width: 'container' }),
    ...(processedSpec.height === undefined && { height: 'container' }),
  };
};

export default {
  interpolateSpec,
  processWidgetSpec,
};
