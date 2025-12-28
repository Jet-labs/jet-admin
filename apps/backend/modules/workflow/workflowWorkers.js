/**
 * Workflow Workers Startup
 * Initialize all workflow workers and the orchestrator
 */
const { initializeRabbitMQ, closeRabbitMQ } = require('./queue/queueConfig');
const { startResultsConsumer } = require('./orchestrator/orchestrator');
const { startTaskWorker } = require('./workers/taskWorker');
const Logger = require('../../utils/logger');

let orchestratorWorker = null;
let taskWorker = null;

/**
 * Start all workflow workers
 */
async function startWorkflowWorkers() {
  Logger.log('info', { message: 'workflowWorkers:starting' });
  
  try {
    // Initialize RabbitMQ connection first
    await initializeRabbitMQ();
    
    // Start the orchestrator (results consumer)
    orchestratorWorker = await startResultsConsumer();
    
    // Start the task worker (processes node jobs)
    taskWorker = await startTaskWorker();
    
    Logger.log('success', { message: 'workflowWorkers:started' });
    
    return { orchestratorWorker, taskWorker };
  } catch (error) {
    Logger.log('error', { message: 'workflowWorkers:failed', params: { error: error.message } });
    throw error;
  }
}

/**
 * Stop all workflow workers
 */
async function stopWorkflowWorkers() {
  Logger.log('info', { message: 'workflowWorkers:stopping' });
  
  // Close RabbitMQ connection (this will cancel all consumers)
  await closeRabbitMQ();
  
  orchestratorWorker = null;
  taskWorker = null;
  
  Logger.log('success', { message: 'workflowWorkers:stopped' });
}

module.exports = {
  startWorkflowWorkers,
  stopWorkflowWorkers,
};
