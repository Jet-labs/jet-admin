/**
 * Queue Configuration — listener events only.
 * (The old workflow task/result queues were removed: workflows execute on
 * Temporal — see modules/workflow/temporal. The monitor bus was a no-op.)
 *
 *   QUEUE_DRIVER=memory (default) — in-process fastq, single-node dev.
 *   QUEUE_DRIVER=redis (+ REDIS_URL) — Redis Streams (`listener:events`,
 *     consumer group `listener-workers`, DLQ `listener:events:dlq`).
 *     Published by the ingress proxy (or embedded engine), consumed by
 *     backend pipeline workers across replicas.
 */
const fastq = require('fastq');
const { v4: uuidv4 } = require('uuid');
const Logger = require('../utils/logger');
const environmentVariables = require('../environment');

// Registered listener-event worker (pipelineWorker._processEvent)
let listenerEventWorkerFn = null;

// fastq instance (memory driver)
let listenerEventQueue = null;

// Redis consumer loop state (redis driver)
let redisConsumerRunning = false;
let redisConsumerStarted = false;

function isRedisDriver() {
  return (environmentVariables.QUEUE_DRIVER || 'memory') === 'redis'
    && !!environmentVariables.REDIS_URL;
}

function getConsumerName() {
  return `${environmentVariables.NODE_ID || 'node'}-${process.pid}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function _processListenerEvent(job) {
  if (!listenerEventWorkerFn) {
    Logger.log('warning', { message: 'queue.config:no listener event worker registered, dropping event' });
    return;
  }
  await listenerEventWorkerFn(job);
}

function isConnectionHealthy() {
  if (isRedisDriver()) {
    try {
      const { isClientReady } = require('./redis.config');
      return isClientReady('bus') || isClientReady('consumer');
    } catch (_) {
      return false;
    }
  }
  return listenerEventQueue !== null;
}

/**
 * Initialize queues.
 * Memory driver: in-process fastq. Redis driver: ensure the consumer group
 * (non-fatal — the consumer loop retries in the background so the API stays
 * up when Redis boots later).
 */
async function initializeQueue() {
  if (isRedisDriver()) {
    Logger.log('info', { message: 'queue.config:initializing redis bus' });
    try {
      const { getRedisClient } = require('./redis.config');
      const { ensureConsumerGroup } = require('./listenerBus.config');
      await ensureConsumerGroup(getRedisClient('bus'));
      Logger.log('success', { message: 'queue.config:redis bus ready' });
    } catch (err) {
      Logger.log('warning', {
        message: 'queue.config:redis:deferred',
        params: { error: err.message, hint: 'Redis not reachable yet — consumer retries in background' },
      });
    }
    return;
  }

  if (listenerEventQueue) {
    return;
  }

  Logger.log('info', { message: 'queue.config:initializing in-memory listener queue' });

  listenerEventQueue = fastq.promise(_processListenerEvent, 20);

  Logger.log('success', { message: 'queue.config:in-memory listener queue ready' });
}

/**
 * Register the listener event worker function.
 * Memory driver: called inline by fastq. Redis driver: starts the
 * Streams consumer-group loop (single loop per process) that invokes fn
 * per envelope and ACKs; unexpected throws go to the DLQ stream.
 * @param {Function} fn - async (eventJob) => void
 */
function registerListenerEventWorker(fn) {
  listenerEventWorkerFn = fn;
  Logger.log('info', { message: 'queue.config:listener event worker registered' });
  if (isRedisDriver()) {
    startRedisConsumerLoop().catch((err) => {
      Logger.log('error', { message: 'queue.config:redis:loop:failed', params: { error: err.message } });
    });
  }
}

/**
 * Background competing-consumer loop over the Redis Stream.
 * Retries forever on connection errors (shared-Redis outage must not kill
 * the process); each message is ACKed exactly once — business outcomes
 * (transform error / filtered) are success, unexpected throws land in DLQ.
 */
async function startRedisConsumerLoop() {
  if (redisConsumerStarted) return;
  redisConsumerStarted = true;
  redisConsumerRunning = true;

  const { getRedisClient } = require('./redis.config');
  const bus = require('./listenerBus.config');
  const consumerName = getConsumerName();

  Logger.log('info', {
    message: 'queue.config:redis:consumer:starting',
    params: { group: bus.getBusConfig().group, consumer: consumerName },
  });

  while (redisConsumerRunning) {
    try {
      const client = getRedisClient('consumer');
      await bus.ensureConsumerGroup(client);
      const { stream, group, prefetch } = bus.getBusConfig();
      const count = Number.isFinite(prefetch) && prefetch > 0 ? prefetch : 20;

      const res = await client.xreadgroup(
        'GROUP', group, consumerName,
        'COUNT', count,
        'BLOCK', 5000,
        'STREAMS', stream, '>'
      );
      if (!res) continue;

      const messages = (res[0] && res[0][1]) || [];
      await Promise.all(messages.map(([msgId, fields]) => handleRedisMessage(client, bus, msgId, fields)));
    } catch (err) {
      Logger.log('warning', { message: 'queue.config:redis:consumer:error', params: { error: err.message } });
      await sleep(2000);
    }
  }
}

async function handleRedisMessage(client, bus, msgId, fields) {
  const { stream, group } = bus.getBusConfig();
  let envelope = null;
  try {
    ({ envelope } = bus.parseStreamMessage(msgId, fields));
  } catch (parseErr) {
    Logger.log('error', { message: 'queue.config:redis:badEnvelope', params: { error: parseErr.message } });
    try { await client.xack(stream, group, msgId); } catch (_) { /* ignore */ }
    return;
  }

  if (!listenerEventWorkerFn) {
    Logger.log('warning', { message: 'queue.config:no listener event worker registered, dropping event' });
    try { await client.xack(stream, group, msgId); } catch (_) { /* ignore */ }
    return;
  }

  try {
    // __viaRedis marks proxy envelopes: actions are resolved fresh downstream
    // and hard failures must propagate so they land in the DLQ (not vanish).
    await listenerEventWorkerFn({ ...envelope, __viaRedis: true });
    await client.xack(stream, group, msgId);
  } catch (err) {
    Logger.log('error', { message: 'queue.config:redis:process:failed', params: { listenerID: envelope.listenerID, error: err.message } });
    await bus.moveToDlq(client, envelope, err);
    try { await client.xack(stream, group, msgId); } catch (_) { /* ignore */ }
  }
}

/**
 * Add a listener event to the processing queue.
 * Redis driver publishes a durable envelope (actions intentionally omitted —
 * the consumer resolves fresh enabled actions from DB).
 * @param {Object} eventJob - { listenerID, tenantID, rawEvent, actions?, eventID? }
 */
async function addListenerEvent(eventJob) {
  if (isRedisDriver()) {
    const { publishListenerEvent } = require('./listenerBus.config');
    await publishListenerEvent({
      listenerID: eventJob.listenerID,
      tenantID: eventJob.tenantID,
      rawEvent: eventJob.rawEvent,
      eventID: eventJob.eventID || uuidv4(),
    });
    return;
  }

  if (!listenerEventQueue) {
    throw new Error('Queue not initialized. Call initializeQueue() first.');
  }

  listenerEventQueue.push(eventJob).catch((err) => {
    Logger.log('error', { message: 'queue.config:listener event push failed', params: { error: err.message } });
  });
}

/**
 * Close / drain queues (memory fastq + redis consumer loop + clients)
 */
async function closeQueue() {
  redisConsumerRunning = false;
  redisConsumerStarted = false;
  try {
    if (listenerEventQueue) {
      listenerEventQueue.kill();
    }
    Logger.log('info', { message: 'queue.config:queues closed' });
  } catch (error) {
    Logger.log('error', { message: 'queue.config:error closing queues', params: { error: error.message } });
  } finally {
    listenerEventQueue = null;
    listenerEventWorkerFn = null;
  }
  try {
    const { closeRedis } = require('./redis.config');
    await closeRedis();
  } catch (_) { /* ignore — redis optional */ }
}

module.exports = {
  initializeQueue,
  closeQueue,
  addListenerEvent,
  registerListenerEventWorker,
  isConnectionHealthy,
};
