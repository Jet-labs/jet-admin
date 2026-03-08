/**
 * Queue Configuration (In-Memory using fastq)
 * Drop-in replacement for rabbitmq.config.js
 * All queues are in-process — no external broker needed.
 */
const fastq = require('fastq');
const { EventEmitter } = require('events');
const Logger = require('../utils/logger');

// Queue names (kept for compatibility)
const QUEUE_NAMES = {
  TASK: 'workflow.tasks',
  RESULTS: 'workflow.results',
  TASK_DLQ: 'workflow.tasks.dlq',
};

const MONITOR_EXCHANGE = 'monitor.exchange';

// Monitor event bus — replaces RabbitMQ topic exchange
const monitorBus = new EventEmitter();
monitorBus.setMaxListeners(50);

// Worker callbacks registered by taskWorker / orchestrator
let taskWorkerFn = null;
let resultsWorkerFn = null;

// fastq instances
let taskQueue = null;
let resultsQueue = null;

// --- Internal workers that fastq calls ---

async function _processTask(job) {
  if (!taskWorkerFn) {
    Logger.log('warning', { message: 'queue.config:no task worker registered, dropping job' });
    return;
  }
  await taskWorkerFn(job);
}

async function _processResult(result) {
  if (!resultsWorkerFn) {
    Logger.log('warning', { message: 'queue.config:no results worker registered, dropping result' });
    return;
  }
  await resultsWorkerFn(result);
}

// --- Public API (mirrors rabbitmq.config.js exports) ---

function isConnectionHealthy() {
  return taskQueue !== null && resultsQueue !== null;
}

/**
 * Initialize in-memory queues
 */
async function initializeQueue() {
  if (taskQueue && resultsQueue) {
    return;
  }

  Logger.log('info', { message: 'queue.config:initializing in-memory queues' });

  // concurrency of 10 matches the prefetch used in taskWorker
  taskQueue = fastq.promise(_processTask, 10);
  resultsQueue = fastq.promise(_processResult, 10);

  Logger.log('success', { message: 'queue.config:in-memory queues ready' });
}

/**
 * Register the task worker function (called by taskWorker.js)
 * @param {Function} fn - async (jobData) => void
 */
function registerTaskWorker(fn) {
  taskWorkerFn = fn;
  Logger.log('info', { message: 'queue.config:task worker registered' });
}

/**
 * Register the results worker function (called by orchestrator.js)
 * @param {Function} fn - async (result) => void
 */
function registerResultsWorker(fn) {
  resultsWorkerFn = fn;
  Logger.log('info', { message: 'queue.config:results worker registered' });
}

/**
 * Helper to safely publish to monitor bus (replaces AMQP exchange)
 */
function publishToMonitor(routingKey, content) {
  try {
    monitorBus.emit('log', { routingKey, content, timestamp: Date.now() });
  } catch (error) {
    // Monitor failures should not block main flow
    console.error('Failed to publish to monitor bus', error);
  }
}

/**
 * Add a node execution job to the task queue
 * @param {Object} jobData - { instanceID, nodeID, nodeType, nodeConfig, context }
 * @param {Object} options - { delay }
 */
async function addNodeJob(jobData, options = {}) {
  if (!taskQueue) {
    throw new Error('Queue not initialized. Call initializeQueue() first.');
  }

  const message = {
    ...jobData,
    timestamp: Date.now(),
    attempts: jobData.attempts ?? 0,
    maxAttempts: jobData.maxAttempts ?? 3,
  };

  Logger.log('info', {
    message: 'queue.config:addNodeJob',
    params: { nodeType: jobData.nodeType, instanceID: jobData.instanceID, delay: options.delay },
  });

  if (options.delay && options.delay > 0) {
    // Delayed push via setTimeout
    setTimeout(() => {
      taskQueue.push(message).catch((err) => {
        Logger.log('error', { message: 'queue.config:delayed job push failed', params: { error: err.message } });
      });
      publishToMonitor(`${QUEUE_NAMES.TASK}_delayed_${options.delay}`, message);
    }, options.delay);
  } else {
    taskQueue.push(message).catch((err) => {
      Logger.log('error', { message: 'queue.config:job push failed', params: { error: err.message } });
    });
    publishToMonitor(QUEUE_NAMES.TASK, message);
  }
}

/**
 * Add a result to the results queue
 * @param {Object} result - { instanceID, nodeID, status, output, nextHandle, queueDelay }
 */
async function addResult(result) {
  if (!resultsQueue) {
    throw new Error('Queue not initialized. Call initializeQueue() first.');
  }

  resultsQueue.push(result).catch((err) => {
    Logger.log('error', { message: 'queue.config:result push failed', params: { error: err.message } });
  });
  publishToMonitor(QUEUE_NAMES.RESULTS, result);
}

/**
 * Close / drain in-memory queues
 */
async function closeQueue() {
  try {
    if (taskQueue) {
      taskQueue.kill();
    }
    if (resultsQueue) {
      resultsQueue.kill();
    }
    Logger.log('info', { message: 'queue.config:queues closed' });
  } catch (error) {
    Logger.log('error', { message: 'queue.config:error closing queues', params: { error: error.message } });
  } finally {
    taskQueue = null;
    resultsQueue = null;
    taskWorkerFn = null;
    resultsWorkerFn = null;
  }
}

module.exports = {
  initializeQueue,
  closeQueue,
  addNodeJob,
  addResult,
  registerTaskWorker,
  registerResultsWorker,
  isConnectionHealthy,
  publishToMonitor,
  monitorBus,
  QUEUE_NAMES,
  MONITOR_EXCHANGE,
};
