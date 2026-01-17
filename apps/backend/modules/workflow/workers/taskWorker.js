/**
 * Task Worker
 * Main worker that processes all node types using RabbitMQ
 */
const { getChannel, addResult, QUEUE_NAMES } = require('../../../config/rabbitmq.config');
const { getHandler } = require('./handlers');
const { resolveFromContext, resolveStringWithContext } = require('./workerSDK');
const Logger = require('../../../utils/logger');

/**
 * Start the main task worker that handles all node types
 */
async function startTaskWorker() {
  const channel = await getChannel();
  
  // Set prefetch to limit concurrent processing
  await channel.prefetch(10);
  
  Logger.log('info', { message: 'taskWorker:starting consumer' });
  
  channel.consume(QUEUE_NAMES.TASK, async (msg) => {
    if (!msg) return;
    
    let jobData;
    try {
      jobData = JSON.parse(msg.content.toString());
    } catch (parseError) {
      Logger.log('error', { message: 'taskWorker:invalidMessage', params: { error: parseError.message } });
      channel.nack(msg, false, false); // Don't requeue invalid messages
      return;
    }
    
    const { instanceID, nodeID, nodeType, nodeConfig, context, workflowID, attempts = 0, maxAttempts = 3 } = jobData;
    
    Logger.log('info', {
      message: 'taskWorker:processing',
      params: { instanceID, nodeID, nodeType, attempt: attempts + 1 },
    });
    
    try {
      // Get handler for this node type
      const handler = getHandler(nodeType);
      
      // Execute handler
      const result = await handler.execute(nodeConfig, context, {
        instanceID,
        nodeID,
        workflowID,
        resolveFromContext: (path) => resolveFromContext(context, path),
        resolveStringWithContext: (str) => resolveStringWithContext(context, str),
      });
      
      // Send result to orchestrator
      // Include outputVariable so orchestrator can store by friendly name instead of UUID
      await addResult({
        instanceID,
        nodeID,
        nodeType,
        outputVariable: nodeConfig?.outputVariable, // For friendly context key
        status: 'success',
        output: result.output,
        nextHandle: result.nextHandle || 'output',
        queueDelay: result.queueDelay || 0,
      });
      
      Logger.log('success', {
        message: 'taskWorker:completed',
        params: { instanceID, nodeID, nodeType },
      });
      
      // Acknowledge the message
      channel.ack(msg);
      
    } catch (error) {
      Logger.log('error', {
        message: 'taskWorker:failed',
        params: { instanceID, nodeID, nodeType, error: error.message, attempt: attempts + 1 },
      });
      
      // Check if we should retry
      if (attempts + 1 < maxAttempts) {
        // Requeue with incremented attempts
        const retryData = { ...jobData, attempts: attempts + 1 };
        
        // Calculate exponential backoff delay
        const delay = Math.pow(2, attempts) * 1000;
        
        // Create delayed queue for retry
        const delayedQueue = `${QUEUE_NAMES.TASK}_delayed_${delay}`;
        await channel.assertQueue(delayedQueue, {
          durable: true,
          arguments: {
            'x-message-ttl': delay,
            'x-dead-letter-exchange': '',
            'x-dead-letter-routing-key': QUEUE_NAMES.TASK,
          },
        });
        
        channel.sendToQueue(delayedQueue, Buffer.from(JSON.stringify(retryData)), {
          persistent: true,
        });
        
        Logger.log('info', {
          message: 'taskWorker:retrying',
          params: { instanceID, nodeID, delay, nextAttempt: attempts + 2 },
        });
        
        // Acknowledge original message (we've handled it by requeuing)
        channel.ack(msg);
      } else {
        // Max retries exceeded, send error result
        await addResult({
          instanceID,
          nodeID,
          status: 'error',
          output: null,
          nextHandle: 'error',
          error: error.message,
        });
        
        // Reject without requeue (goes to DLQ)
        channel.nack(msg, false, false);
      }
    }
  }, {
    noAck: false, // We will manually acknowledge
  });
  
  Logger.log('info', { message: 'taskWorker:started' });
  
  return { channel };
}

module.exports = { startTaskWorker };
