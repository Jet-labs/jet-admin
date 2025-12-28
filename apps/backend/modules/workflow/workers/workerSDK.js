/**
 * Worker SDK
 * Abstraction layer for dumb workers - handles queue connection and result publishing
 */
const { getChannel, addResult, QUEUE_NAMES } = require('../queue/queueConfig');
const Logger = require('../../../utils/logger');

/**
 * Context resolver - resolves paths like "ctx.abc123.result"
 * @param {Object} ctx - The context object
 * @param {string} path - Path like "ctx.abc123.result" or just "abc123.result"
 */
function resolveFromContext(ctx, path) {
  if (!path) return undefined;
  
  // Remove "ctx." prefix if present
  const cleanPath = path.startsWith('ctx.') ? path.slice(4) : path;
  
  // Split and traverse
  const parts = cleanPath.split('.');
  let current = ctx;
  
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  
  return current;
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
};
