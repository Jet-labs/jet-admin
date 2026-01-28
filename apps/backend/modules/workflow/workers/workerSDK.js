/**
 * Worker SDK
 * Abstraction layer for dumb workers - handles queue connection and result publishing
 */
const { getChannel, addResult, QUEUE_NAMES } = require('../../../config/rabbitmq.config');
const Logger = require('../../../utils/logger');

/**
 * Context resolver - resolves paths like "ctx.abc123.result" or "ctx[\"abc123\"].result"
 * Supports both dot notation and bracket notation
 * @param {Object} ctx - The context object
 * @param {string} path - Path like "ctx.abc123.result" or "ctx[\"uuid\"].prop"
 */
function resolveFromContext(ctx, path) {
  if (!path) return undefined;

  Logger.log('info', { message: 'resolveFromContext', params: { path } });

  // Remove "ctx." or "ctx" prefix if present at the start
  let cleanPath = path;
  if (cleanPath.startsWith('ctx.')) {
    cleanPath = cleanPath.slice(4);
  } else if (cleanPath.startsWith('ctx[')) {
    cleanPath = cleanPath.slice(3); // Remove "ctx" but keep the bracket
  }

  Logger.log('info', { message: 'resolveFromContext:cleanPath', params: { cleanPath } });

  // Parse the path into segments, handling both dot and bracket notation
  // This regex matches:
  // - Bracket notation with double quotes: ["..."]
  // - Bracket notation with single quotes: ['...']
  // - Dot notation: .propertyName or just propertyName at start
  const parts = [];
  const regex = /\[["']([^"']+)["']\]|\.?([^.\[\]]+)/g;
  let match;
  
  while ((match = regex.exec(cleanPath)) !== null) {
    // match[1] is bracket notation content, match[2] is dot notation content
    const part = match[1] || match[2];
    if (part) {
      parts.push(part);
    }
  }

  Logger.log('info', { message: 'resolveFromContext:parts', params: { parts } });

  let current = ctx;
  
  for (const part of parts) {
    Logger.log('info', { message: 'resolveFromContext:traversing', params: { part, currentKeys: current ? Object.keys(current) : null } });
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  
  Logger.log('info', { message: 'resolveFromContext:resolved', params: { path, } });

  return current;
}

/**
 * Resolve context variables within a string using mustache syntax {{...}}
 * 
 * This is the PRIMARY method for resolving variables in workflow node configs.
 * 
 * Type Behavior:
 * - Single variable "{{ctx.input.id}}" -> preserves the original type (number, object, array, etc.)
 * - String interpolation "id_{{ctx.input.id}}" -> always returns a string
 * - Literal value "hardcoded" -> returns as-is
 * 
 * Examples:
 * - "{{ctx.input.userId}}"           -> number (if userId is a number)
 * - "{{ctx.previousNode.data}}"      -> object/array (preserves type)
 * - "prefix_{{ctx.input.id}}_suffix" -> string
 * - "plain text"                     -> string (no modification)
 * 
 * @param {Object} ctx - The workflow context object
 * @param {string} str - The string containing mustache templates to resolve
 * @returns {*} Resolved value - type depends on the pattern (see above)
 */
function resolveStringWithContext(ctx, str) {
  if (typeof str !== 'string') return str;

  // Case 1: Single variable substitution - preserve type
  // Matches typical pattern like "{{ctx.variable}}" with optional whitespace
  if (/^\{\{([^}]+)\}\}$/.test(str)) {
    const path = str.replace(/^\{\{|\}\}$/g, '').trim();
    return resolveFromContext(ctx, path);
  }

  // Case 2: String interpolation - return string
  // Matches "prefix {{ctx.a}} suffix"
  return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const val = resolveFromContext(ctx, path.trim());
    return val !== undefined && val !== null ? val : '';
  });
}

/**
 * Create a worker for a specific node type using RabbitMQ
 * @param {string} nodeType - The node type this worker handles
 * @param {Function} handler - async (nodeConfig, context) => { output, nextHandle, queueDelay }
 */
async function createWorker(nodeType, handler) {
  const channel = await getChannel();
  
  // Set prefetch to limit concurrent processing
  await channel.prefetch(5);
  
  Logger.log('info', { message: `worker:${nodeType}:starting consumer` });
  
  channel.consume(QUEUE_NAMES.TASK, async (msg) => {
    if (!msg) return;
    
    let jobData;
    try {
      jobData = JSON.parse(msg.content.toString());
    } catch (parseError) {
      Logger.log('error', { message: `worker:${nodeType}:invalidMessage`, params: { error: parseError.message } });
      channel.nack(msg, false, false);
      return;
    }
    
    const { instanceID, nodeID, nodeConfig, context, workflowID } = jobData;
    
    // Only process jobs for this node type
    if (jobData.nodeType !== nodeType) {
      // Reject and requeue - not for this worker
      channel.nack(msg, false, true);
      return;
    }
    
    Logger.log('info', {
      message: `worker:${nodeType}:processing`,
      params: { instanceID, nodeID },
    });
    
    try {
      // Execute handler (PURE FUNCTION - no DB access!)
      const result = await handler(nodeConfig, context, {
        instanceID,
        nodeID,
        workflowID,
        resolveFromContext: (path) => resolveFromContext(context, path),
      });
      
      // Send result to orchestrator
      await addResult({
        instanceID,
        nodeID,
        status: 'success',
        output: result.output,
        nextHandle: result.nextHandle || 'output',
        queueDelay: result.queueDelay || 0,
      });
      
      Logger.log('success', {
        message: `worker:${nodeType}:completed`,
        params: { instanceID, nodeID },
      });
      
      // Acknowledge the message
      channel.ack(msg);
      
    } catch (error) {
      Logger.log('error', {
        message: `worker:${nodeType}:failed`,
        params: { instanceID, nodeID, error: error.message },
      });
      
      // Send error result
      await addResult({
        instanceID,
        nodeID,
        status: 'error',
        output: null,
        nextHandle: 'error',
        error: error.message,
      });
      
      // Reject without requeue (error result already sent)
      channel.nack(msg, false, false);
    }
  }, {
    noAck: false,
  });
  
  Logger.log('info', { message: `worker:${nodeType}:started` });
  
  return { channel };
}

/**
 * Navigate context using enhanced path notation
 * Supports:
 * - Wildcards: ctx.data.rows[*].value (returns array of values)
 * - Null-safe: ctx.data?.nested?.value (returns undefined if path doesn't exist)
 * - Array indices: ctx.data[0].value
 * 
 * @param {Object} ctx - The context object
 * @param {string} path - Enhanced path notation
 * @returns {*} Resolved value
 */
function navigatePathEnhanced(ctx, path) {
  if (!path) return undefined;

  // Remove ctx. prefix if present
  let cleanPath = path;
  if (cleanPath.startsWith('ctx.')) {
    cleanPath = cleanPath.slice(4);
  } else if (cleanPath.startsWith('ctx?.')) {
    cleanPath = cleanPath.slice(5);
  }

  // Check if path contains wildcard
  if (cleanPath.includes('[*]')) {
    return resolveWildcardPath(ctx, cleanPath);
  }

  // Handle null-safe navigation (?.)
  const isNullSafe = cleanPath.includes('?.');
  const parts = cleanPath.split(/\??\./).filter(p => p);

  let current = ctx;

  for (const part of parts) {
    if (current === undefined || current === null) {
      return isNullSafe ? undefined : null;
    }

    // Handle array index notation [n]
    const indexMatch = part.match(/^(.+?)\[(\d+)\]$/);
    if (indexMatch) {
      const [, prop, index] = indexMatch;
      current = current[prop];
      if (Array.isArray(current)) {
        current = current[parseInt(index, 10)];
      } else {
        current = undefined;
      }
    } else {
      current = current[part];
    }
  }

  return current;
}

/**
 * Resolve wildcard paths like ctx.data.rows[*].value
 * Returns an array of all matching values
 * 
 * @param {Object} ctx - The context object
 * @param {string} path - Path with [*] wildcard
 * @returns {Array} Array of resolved values
 */
function resolveWildcardPath(ctx, path) {
  const wildcardIndex = path.indexOf('[*]');
  const beforeWildcard = path.slice(0, wildcardIndex);
  const afterWildcard = path.slice(wildcardIndex + 3);

  // Get the array at the wildcard position
  const array = navigatePathEnhanced(ctx, beforeWildcard);
  if (!Array.isArray(array)) {
    return [];
  }

  // If no path after wildcard, return the array
  if (!afterWildcard || afterWildcard === '') {
    return array;
  }

  // Map over array applying the rest of the path
  const subPath = afterWildcard.startsWith('.') ? afterWildcard.slice(1) : afterWildcard;
  return array.map(item => {
    if (subPath.includes('[*]')) {
      // Nested wildcard - recursive call
      return resolveWildcardPath(item, subPath);
    }
    return navigatePathEnhanced(item, subPath);
  }).flat();
}

/**
 * Apply transformation to resolved value
 * 
 * @param {*} value - The resolved value
 * @param {object} transform - Transform configuration
 * @param {string} transform.type - Transform type: 'map', 'filter', 'reduce', 'format', 'custom'
 * @param {string} [transform.mapPath] - Path for map transform
 * @param {string} [transform.filterCondition] - Condition for filter transform
 * @param {string} [transform.formatType] - Format type (date:short, number:currency, etc.)
 * @param {string} [transform.expression] - Custom expression for advanced transforms
 * @returns {*} Transformed value
 */
function applyTransform(value, transform) {
  if (!transform || !transform.type) {
    return value;
  }

  switch (transform.type) {
    case 'map': {
      if (!Array.isArray(value)) return value;
      if (!transform.mapPath) return value;
      return value.map(item => navigatePathEnhanced(item, transform.mapPath));
    }

    case 'filter': {
      if (!Array.isArray(value)) return value;
      if (!transform.filterCondition) return value;
      try {
        // Use Function constructor for safe evaluation
        const filterFn = new Function('item', 'index', `return ${transform.filterCondition}`);
        return value.filter((item, index) => filterFn(item, index));
      } catch (e) {
        Logger.log('error', { message: 'applyTransform:filter:error', params: { error: e.message } });
        return value;
      }
    }

    case 'format': {
      return formatValue(value, transform.formatType);
    }

    case 'slice': {
      if (!Array.isArray(value)) return value;
      const start = transform.start || 0;
      const end = transform.end !== undefined ? transform.end : value.length;
      return value.slice(start, end);
    }

    case 'sort': {
      if (!Array.isArray(value)) return value;
      const sorted = [...value];
      if (transform.sortPath) {
        sorted.sort((a, b) => {
          const aVal = navigatePathEnhanced(a, transform.sortPath);
          const bVal = navigatePathEnhanced(b, transform.sortPath);
          if (aVal < bVal) return transform.ascending ? -1 : 1;
          if (aVal > bVal) return transform.ascending ? 1 : -1;
          return 0;
        });
      }
      return sorted;
    }

    case 'aggregate': {
      if (!Array.isArray(value)) return value;
      switch (transform.aggregation) {
        case 'sum':
          return value.reduce((acc, item) => {
            const val = transform.path ? navigatePathEnhanced(item, transform.path) : item;
            return acc + (Number(val) || 0);
          }, 0);
        case 'avg':
          const sum = value.reduce((acc, item) => {
            const val = transform.path ? navigatePathEnhanced(item, transform.path) : item;
            return acc + (Number(val) || 0);
          }, 0);
          return value.length > 0 ? sum / value.length : 0;
        case 'count':
          return value.length;
        case 'min':
          return Math.min(...value.map(item => {
            const val = transform.path ? navigatePathEnhanced(item, transform.path) : item;
            return Number(val) || 0;
          }));
        case 'max':
          return Math.max(...value.map(item => {
            const val = transform.path ? navigatePathEnhanced(item, transform.path) : item;
            return Number(val) || 0;
          }));
        default:
          return value;
      }
    }

    default:
      return value;
  }
}

/**
 * Format value based on format type
 * 
 * @param {*} value - Value to format
 * @param {string} formatType - Format type (e.g., 'date:short', 'number:currency')
 * @returns {string} Formatted value
 */
function formatValue(value, formatType) {
  if (value === null || value === undefined) return '';

  if (!formatType) return String(value);

  const [type, subtype] = formatType.split(':');

  switch (type) {
    case 'date': {
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);

      switch (subtype) {
        case 'short':
          return date.toLocaleDateString();
        case 'long':
          return date.toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          });
        case 'time':
          return date.toLocaleTimeString();
        case 'datetime':
          return date.toLocaleString();
        case 'iso':
          return date.toISOString();
        default:
          return date.toLocaleDateString();
      }
    }

    case 'number': {
      const num = Number(value);
      if (isNaN(num)) return String(value);

      switch (subtype) {
        case 'currency':
          return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
        case 'percent':
          return (num * 100).toFixed(2) + '%';
        case 'decimal':
          return num.toFixed(2);
        case 'integer':
          return Math.round(num).toString();
        case 'compact':
          return Intl.NumberFormat(undefined, { notation: 'compact' }).format(num);
        default:
          return num.toLocaleString();
      }
    }

    case 'string': {
      const str = String(value);
      switch (subtype) {
        case 'uppercase':
          return str.toUpperCase();
        case 'lowercase':
          return str.toLowerCase();
        case 'capitalize':
          return str.charAt(0).toUpperCase() + str.slice(1);
        case 'truncate':
          return str.length > 50 ? str.slice(0, 50) + '...' : str;
        default:
          return str;
      }
    }

    default:
      return String(value);
  }
}

/**
 * Resolve widget variable binding from workflow context
 * Enhanced version for widget consumption
 * 
 * @param {Object} context - The workflow context object
 * @param {object} bindingConfig - Widget binding configuration
 * @param {string} bindingConfig.variablePath - Path to resolve (e.g., 'ctx.data.rows[*].value')
 * @param {object} [bindingConfig.transform] - Optional transform configuration
 * @param {*} [bindingConfig.fallback] - Fallback value if path not found
 * @returns {*} Resolved and optionally transformed value
 */
function resolveWidgetVariable(context, bindingConfig) {
  if (!bindingConfig) return undefined;

  const { variablePath, transform, fallback } = typeof bindingConfig === 'string'
    ? { variablePath: bindingConfig }
    : bindingConfig;

  // Resolve the path
  let value = navigatePathEnhanced(context, variablePath);

  // Apply fallback if needed
  if ((value === undefined || value === null) && fallback !== undefined) {
    return fallback;
  }

  // Apply transform if specified
  if (transform && value !== undefined && value !== null) {
    value = applyTransform(value, transform);
  }

  return value;
}

/**
 * Resolve all widget dataset field bindings
 * 
 * @param {Object} context - The workflow context
 * @param {Object} datasetFields - Map of field names to binding configs
 * @returns {Object} Map of field names to resolved values
 */
function resolveWidgetDatasetFields(context, datasetFields) {
  if (!datasetFields || typeof datasetFields !== 'object') {
    return {};
  }

  const resolved = {};

  for (const [field, binding] of Object.entries(datasetFields)) {
    resolved[field] = resolveWidgetVariable(context, binding);
  }

  return resolved;
}

module.exports = {
  createWorker,
  resolveFromContext,
  resolveStringWithContext,
  // New widget-specific exports
  navigatePathEnhanced,
  resolveWildcardPath,
  applyTransform,
  formatValue,
  resolveWidgetVariable,
  resolveWidgetDatasetFields,
};
