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
  
  Logger.log('info', { message: 'resolveFromContext:resolved', params: { path, value: current } });

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

module.exports = {
  createWorker,
  resolveFromContext,
  resolveStringWithContext,
};
