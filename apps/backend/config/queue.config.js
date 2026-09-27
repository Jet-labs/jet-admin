/**
 * Queue Configuration — listener events over Redis Streams.
 * (The old workflow task/result queues were removed: workflows execute on
 * Temporal — see modules/workflow/temporal. The monitor bus was a no-op.)
 *
 * Single mode: Redis Streams (`listener:events`, consumer group
 * `listener-workers`, DLQ `listener:events:dlq`). The standalone
 * listener-proxy publishes raw envelopes; backend pipeline workers consume
 * them across replicas as competing consumers. REDIS_URL is required.
 */
const { v4: uuidv4 } = require('uuid');
const Logger = require('../utils/logger');
const environmentVariables = require('../environment');

// Registered listener-event worker (pipelineWorker._processEvent)
let listenerEventWorkerFn = null;

// Redis consumer loop state
let redisConsumerRunning = false;
let redisConsumerStarted = false;

function requireRedisUrl() {
  if (!environmentVariables.REDIS_URL) {
    throw new Error('REDIS_URL is required for the listener pipeline (standalone listener-proxy + Redis Streams).');
  }
}

function getConsumerName() {
  return `${environmentVariables.NODE_ID || 'node'}-${process.pid}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isConnectionHealthy() {
  try {
    const { isClientReady } = require('./redis.config');
    return isClientReady('bus') || isClientReady('consumer');
  } catch (_) {
    return false;
  }
}

/**
 * Initialize the queue.
 * Ensures the consumer group (non-fatal — the consumer loop retries in the
 * background so the API stays up when Redis boots later). Throws when
 * REDIS_URL is missing (misconfiguration must fail fast, not silently
 * fall back to a mode that no longer exists).
 */
async function initializeQueue() {
  requireRedisUrl();
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
}

/**
 * Register the listener event worker function and start the Streams
 * consumer-group loop (single loop per process). Each envelope is ACKed
 * exactly once — business outcomes (transform error / filtered) are
 * success; unexpected throws go to the DLQ stream.
 * @param {Function} fn - async (eventJob) => void
 */
function registerListenerEventWorker(fn) {
  requireRedisUrl();
  listenerEventWorkerFn = fn;
  Logger.log('info', { message: 'queue.config:listener event worker registered' });
  startRedisConsumerLoop().catch((err) => {
    Logger.log('error', { message: 'queue.config:redis:loop:failed', params: { error: err.message } });
  });
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
    // Envelopes carry raw events only: actions are resolved fresh downstream
    // and hard failures must propagate so they land in the DLQ (not vanish).
    await listenerEventWorkerFn({ ...envelope });
    await client.xack(stream, group, msgId);
  } catch (err) {
    Logger.log('error', { message: 'queue.config:redis:process:failed', params: { listenerID: envelope.listenerID, error: err.message } });
    await bus.moveToDlq(client, envelope, err);
    try { await client.xack(stream, group, msgId); } catch (_) { /* ignore */ }
  }
}

/**
 * Publish a listener event for pipeline processing.
 * Publishes a durable envelope (actions intentionally omitted — the
 * consumer resolves fresh enabled actions from DB).
 * @param {Object} eventJob - { listenerID, tenantID, rawEvent, eventID? }
 */
async function addListenerEvent(eventJob) {
  requireRedisUrl();
  const { publishListenerEvent } = require('./listenerBus.config');
  await publishListenerEvent({
    listenerID: eventJob.listenerID,
    tenantID: eventJob.tenantID,
    rawEvent: eventJob.rawEvent,
    eventID: eventJob.eventID || uuidv4(),
  });
}

/**
 * Stop the consumer loop and close Redis clients.
 */
async function closeQueue() {
  redisConsumerRunning = false;
  redisConsumerStarted = false;
  try {
    const { closeRedis } = require('./redis.config');
    await closeRedis();
  } catch (_) { /* ignore */ }
  listenerEventWorkerFn = null;
  Logger.log('info', { message: 'queue.config:queues closed' });
}

module.exports = {
  initializeQueue,
  closeQueue,
  addListenerEvent,
  registerListenerEventWorker,
  isConnectionHealthy,
};
