/**
 * Task Worker
 * Main worker that processes all node types using in-memory queue
 */
const { registerTaskWorker, addResult, addNodeJob, QUEUE_NAMES } = require('../../../config/queue.config');
const { getHandler } = require('./handlers');
const { resolveTemplate: sharedResolveTemplate } = require('../../../utils/templateEngine');
const Logger = require('../../../utils/logger');
const WORKFLOW_TEMPLATE_OPTIONS = {
  allowedRoots: ['ctx'],
  preserveSingleExpressionType: true,
};


/**
 * Start the main task worker that handles all node types
 */
async function startTaskWorker() {
  Logger.log('info', { message: 'taskWorker:starting consumer' });

  registerTaskWorker(async (jobData) => {
    const { instanceID, nodeID, nodeType, nodeConfig, context, workflowID, attempts = 0, maxAttempts = 3, isTestRun = false } = jobData;

    Logger.log('info', {
      message: 'taskWorker:processing',
      params: { instanceID, nodeID, nodeType, attempt: attempts + 1 },
    });

    try {
      // DATA RELIABILITY: For non-test runs, fetch the absolute latest context from the database.
      // This ensures that parallel upstream data is ALWAYS visible, even if the job was queued
      // slightly before a concurrent write finished, or if this is a retry.
      let currentContext = context;
      if (!isTestRun && instanceID) {
        const { stateManager } = require('../orchestrator/stateManager');
        const freshInstance = await stateManager.getInstance(instanceID);
        if (freshInstance) {
          currentContext = freshInstance.contextData;
        }
      }

      // Get handler for this node type
      const handler = getHandler(nodeType);

      // Execute handler with the latest context
      const result = await handler.execute(nodeConfig, currentContext, {
        instanceID,
        nodeID,
        workflowID,
        resolveTemplate: (template, meta = {}) => sharedResolveTemplate(
          template,
          currentContext,
          WORKFLOW_TEMPLATE_OPTIONS,
          { module: 'workflow', instanceID, workflowID, nodeID, ...meta }
        ),
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
