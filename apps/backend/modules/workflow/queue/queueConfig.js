/**
 * Queue Configuration
 * RabbitMQ setup for workflow execution
 */
const amqp = require('amqplib');
const Logger = require('../../../utils/logger');

// Queue names
const QUEUE_NAMES = {
  TASK: 'workflow.tasks',
  RESULTS: 'workflow.results',
  TASK_DLQ: 'workflow.tasks.dlq',
};

// Connection state
let connection = null;
let channel = null;

/**
 * Get RabbitMQ connection URL from environment
 */
function getRabbitMQUrl() {
  return process.env.RABBITMQ_URL || 'amqp://localhost';
}

/**
 * Initialize RabbitMQ connection and channel
 */
async function initializeRabbitMQ() {
  if (connection && channel) {
    return { connection, channel };
  }

  try {
    Logger.log('info', { message: 'queueConfig:connecting to RabbitMQ' });
    
    connection = await amqp.connect(getRabbitMQUrl());
    channel = await connection.createChannel();
    
    // Setup queues with durability
    await channel.assertQueue(QUEUE_NAMES.TASK, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': QUEUE_NAMES.TASK_DLQ,
      },
    });
    
    await channel.assertQueue(QUEUE_NAMES.RESULTS, {
      durable: true,
    });
    
    // Create dead letter queue for failed messages
    await channel.assertQueue(QUEUE_NAMES.TASK_DLQ, {
      durable: true,
    });
    
    // Handle connection close
    connection.on('close', () => {
      Logger.log('warning', { message: 'queueConfig:connection closed' });
      connection = null;
      channel = null;
    });
    
    connection.on('error', (err) => {
      Logger.log('error', { message: 'queueConfig:connection error', params: { error: err.message } });
    });
    
    Logger.log('success', { message: 'queueConfig:RabbitMQ connected' });
    
    return { connection, channel };
  } catch (error) {
    Logger.log('error', { message: 'queueConfig:failed to connect', params: { error: error.message } });
    throw error;
  }
}

/**
 * Get the current channel (ensures connection is initialized)
 */
async function getChannel() {
  if (!channel) {
    await initializeRabbitMQ();
  }
  return channel;
}

/**
 * Add a node execution job to the queue
 * @param {Object} jobData - { instanceID, nodeID, nodeType, nodeConfig, context }
 * @param {Object} options - { delay }
 */
async function addNodeJob(jobData, options = {}) {
  const ch = await getChannel();
  
  const message = {
    ...jobData,
    timestamp: Date.now(),
    attempts: 0,
    maxAttempts: 3,
  };
  
  Logger.log('info', {
    message: 'queueConfig:addNodeJob',
    params: { nodeType: jobData.nodeType, instanceID: jobData.instanceID, delay: options.delay },
  });
  
  if (options.delay && options.delay > 0) {
    // For delayed messages, use a separate delayed queue with TTL
    const delayedQueue = `${QUEUE_NAMES.TASK}_delayed_${options.delay}`;
    await ch.assertQueue(delayedQueue, {
      durable: true,
      arguments: {
        'x-message-ttl': options.delay,
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': QUEUE_NAMES.TASK,
      },
    });
    
    ch.sendToQueue(delayedQueue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  } else {
    ch.sendToQueue(QUEUE_NAMES.TASK, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  }
}

/**
 * Add a result to the results queue
 * @param {Object} result - { instanceID, nodeID, status, output, nextHandle, queueDelay }
 */
async function addResult(result) {
  const ch = await getChannel();
  
  ch.sendToQueue(QUEUE_NAMES.RESULTS, Buffer.from(JSON.stringify(result)), {
    persistent: true,
  });
}

/**
 * Close RabbitMQ connection
 */
async function closeRabbitMQ() {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    Logger.log('info', { message: 'queueConfig:RabbitMQ connection closed' });
  } catch (error) {
    Logger.log('error', { message: 'queueConfig:error closing connection', params: { error: error.message } });
  } finally {
    channel = null;
    connection = null;
  }
}

module.exports = {
  initializeRabbitMQ,
  getChannel,
  closeRabbitMQ,
  addNodeJob,
  addResult,
  QUEUE_NAMES,
};
