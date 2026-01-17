/**
 * RabbitMQ Configuration
 * Provides connection and channel for use throughout the backend
 */
const amqp = require('amqplib');
const Logger = require('../utils/logger');
const constants = require('../constants');

// Queue names
const QUEUE_NAMES = {
  TASK: 'workflow.tasks',
  RESULTS: 'workflow.results',
  TASK_DLQ: 'workflow.tasks.dlq',
};

const MONITOR_EXCHANGE = 'monitor.exchange';

// Connection state
let connection = null;
let channel = null;
let reconnectInterval = null;

/**
 * Get RabbitMQ connection URL from environment
 */
function getRabbitMQUrl() {
  return process.env.RABBITMQ_URL || 'amqp://localhost';
}

/**
 * Check if RabbitMQ connection is healthy
 */
function isConnectionHealthy() {
  return connection !== null && channel !== null;
}

/**
 * Initialize RabbitMQ connection and channel
 */
async function initializeRabbitMQ() {
  if (connection && channel) {
    return { connection, channel };
  }

  try {
    Logger.log('info', { message: 'rabbitmq.config:connecting to RabbitMQ' });
    
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

    // Create Monitor Exchange (Non-durable, auto-delete not needed but transient is fine)
    await channel.assertExchange(MONITOR_EXCHANGE, 'topic', { durable: false });

    // Handle connection close
    connection.on('close', () => {
      Logger.log('warning', { message: 'rabbitmq.config:connection closed' });
      connection = null;
      channel = null;
    });
    
    connection.on('error', (err) => {
      Logger.log('error', { message: 'rabbitmq.config:connection error', params: { error: err.message } });
    });
    
    Logger.log('success', { message: 'rabbitmq.config:RabbitMQ connected' });
    
    // Start reconnection checker
    startReconnectionChecker();
    
    return { connection, channel };
  } catch (error) {
    Logger.log('error', { message: 'rabbitmq.config:failed to connect', params: { error: error.message } });
    throw error;
  }
}

/**
 * Start the periodic reconnection checker
 * Checks connection health every RABBITMQ_RECONNECT_INTERVAL_MS and reconnects if needed
 */
function startReconnectionChecker() {
  // Clear any existing interval
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
  }
  
  reconnectInterval = setInterval(async () => {
    if (!isConnectionHealthy()) {
      Logger.log('info', { message: 'rabbitmq.config:reconnection checker detected unhealthy connection, attempting reconnect' });
      try {
        await initializeRabbitMQ();
      } catch (error) {
        Logger.log('error', { message: 'rabbitmq.config:reconnection attempt failed', params: { error: error.message } });
      }
    } else {
      Logger.log('info', { message: 'rabbitmq.config:connection health check passed' });
    }
  }, constants.RABBITMQ_RECONNECT_INTERVAL_MS);
}

/**
 * Stop the reconnection checker
 */
function stopReconnectionChecker() {
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
}

/**
 * Get the current connection
 */
function getConnection() {
  return connection;
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
 * Helper to safely publish to monitor exchange
 */
function publishToMonitor(routingKey, content) {
  if (channel) {
    try {
      channel.publish(MONITOR_EXCHANGE, routingKey, Buffer.from(JSON.stringify(content)));
    } catch (error) {
      // Monitor failures should not block main flow
      console.error('Failed to publish to monitor exchange', error);
    }
  }
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
    maxAttempts: 1,
  };
  
  Logger.log('info', {
    message: 'rabbitmq.config:addNodeJob',
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
    // Publish to monitor with special key indicating delay
    publishToMonitor(delayedQueue, message);

  } else {
    ch.sendToQueue(QUEUE_NAMES.TASK, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    publishToMonitor(QUEUE_NAMES.TASK, message);
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
  publishToMonitor(QUEUE_NAMES.RESULTS, result);
}

/**
 * Close RabbitMQ connection
 */
async function closeRabbitMQ() {
  try {
    // Stop reconnection checker first
    stopReconnectionChecker();
    
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    Logger.log('info', { message: 'rabbitmq.config:RabbitMQ connection closed' });
  } catch (error) {
    Logger.log('error', { message: 'rabbitmq.config:error closing connection', params: { error: error.message } });
  } finally {
    channel = null;
    connection = null;
  }
}

module.exports = {
  initializeRabbitMQ,
  getConnection,
  getChannel,
  closeRabbitMQ,
  addNodeJob,
  addResult,
  QUEUE_NAMES,
  MONITOR_EXCHANGE,
  isConnectionHealthy,
};
