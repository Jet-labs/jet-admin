/**
 * Task Worker
 * Main worker that processes all node types using in-memory queue
 */
const { registerTaskWorker, addResult, addNodeJob, QUEUE_NAMES } = require('../../../config/queue.config');
const { getHandler } = require('./handlers');
const { resolveFromContext, resolveStringWithContext } = require('./workerSDK');
const Logger = require('../../../utils/logger');

/**
 * Start the main task worker that handles all node types
 */
async function startTaskWorker() {
  Logger.log('info', { message: 'taskWorker:starting consumer' });

  registerTaskWorker(async (jobData) => {
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
      await addResult({
        instanceID,
        nodeID,
        nodeType,
        outputVariable: nodeConfig?.outputVariable,
        status: 'success',
        output: result.output,
        nextHandle: result.nextHandle || 'output',
        queueDelay: result.queueDelay || 0,
      });

      Logger.log('success', {
        message: 'taskWorker:completed',
        params: { instanceID, nodeID, nodeType },
      });

    } catch (error) {
      Logger.log('error', {
        message: 'taskWorker:failed',
        params: { instanceID, nodeID, nodeType, error: error.message, attempt: attempts + 1 },
      });

      // Check if we should retry
      if (attempts + 1 < maxAttempts) {
        const retryData = { ...jobData, attempts: attempts + 1 };

        // Exponential backoff delay
        const delay = Math.pow(2, attempts) * 1000;

        Logger.log('info', {
          message: 'taskWorker:retrying',
          params: { instanceID, nodeID, delay, nextAttempt: attempts + 2 },
        });

        // Re-push with delay
        await addNodeJob(retryData, { delay });
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
      }
    }
  });

  Logger.log('info', { message: 'taskWorker:started' });
}

module.exports = { startTaskWorker };
