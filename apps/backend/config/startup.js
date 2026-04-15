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
    const { startResultsConsumer } = require('../modules/workflow/workflowEngine/engine');
    await startResultsConsumer();

    // 4. Subscription listener (bootstraps active subscription consumers)
    const { startSubscriptionListener } = require('../modules/subscription/listeners/subscriptionListener');
    await startSubscriptionListener();

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
    const { stopSubscriptionListener } = require('../modules/subscription/listeners/subscriptionListener');
    await stopSubscriptionListener();
  } catch (e) { /* ignore */ }

  await closeQueue();

  Logger.log('success', { message: 'startup:stopAllListeners:done' });
}

module.exports = { startAllListeners, stopAllListeners };
