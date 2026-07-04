/**
 * Application Startup — Listener Bootstrap
 * Initializes all long-running listeners across modules.
 * Called once from index.js on server start.
 */
const { initializeQueue, closeQueue } = require('./queue.config');
const Logger = require('../utils/logger');

/**
 * Start all application listeners
 */
async function startAllListeners() {
  Logger.log('info', { message: 'startup:startAllListeners:init' });

  try {
    // 1. Initialize in-memory queues (shared infrastructure)
    await initializeQueue();

    // 2. Workflow task listener (consumes node execution jobs from queue)
    const { startTaskListener } = require('../modules/workflow/listeners/taskListener');
    await startTaskListener();

    // 3. Workflow results listener (orchestrator — consumes results, advances DAG)
    const { startResultsConsumer, recoverStuckWorkflows } = require('../modules/workflow/workflowEngine/engine');
    await startResultsConsumer();
    await recoverStuckWorkflows().catch(err => {
      Logger.log('warning', { message: 'Failed to recover stuck workflows', params: { error: err.message } });
    });

    // 4. Listener pipeline worker (processes listener events from queue)
    const { startPipelineWorker } = require('../modules/listener/listenerEngine/pipelineWorker');
    await startPipelineWorker();

    // 5. Listener engine (bootstraps all active listeners & shared webhook ingress server)
    const { listenerEngine } = require('../modules/listener/listenerEngine/engine');
    await listenerEngine.startAll();

    // 6. Audit log flusher (buffers and batch-saves audit logs)
    const { auditService } = require('../modules/audit/audit.service');
    auditService.startFlusher();

    Logger.log('success', { message: 'startup:startAllListeners:done' });
  } catch (error) {
    Logger.log('error', { message: 'startup:startAllListeners:failed', params: { error: error.message } });
    throw error;
  }
}

/**
 * Stop all application listeners (graceful shutdown)
 */
async function stopAllListeners() {
  Logger.log('info', { message: 'startup:stopAllListeners:init' });

  try {
    const { listenerEngine } = require('../modules/listener/listenerEngine/engine');
    await listenerEngine.stopAll();
  } catch (e) { /* ignore */ }

  try {
    const { auditService } = require('../modules/audit/audit.service');
    await auditService.stopFlusher();
  } catch (e) { /* ignore */ }

  await closeQueue();

  Logger.log('success', { message: 'startup:stopAllListeners:done' });
}

module.exports = { startAllListeners, stopAllListeners };
