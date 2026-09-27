/**
 * Listener Bus — Redis Streams transport for listener events.
 *
 * Topology (single Redis instance, separate keyspaces):
 *   STREAM   `listener:events`      — raw envelopes published by the
 *                                     standalone ingress proxy
 *   GROUP    `listener-workers`     — backend consumer group (competing
 *                                     consumers across replicas)
 *   DLQ      `listener:events:dlq`  — poison / infra-failed envelopes (manual replay)
 *   CONTROL  `listener:control`     — pub/sub reload signals
 *                                     backend CRUD → ingress proxy
 *
 * Envelope (single `data` field, JSON):
 *   { eventID, listenerID, tenantID, rawEvent, enqueuedAt }
 * `actions` are intentionally NOT embedded: the backend consumer resolves
 * fresh enabled actions from DB (short TTL cache), so action CRUD never goes
 * stale for in-flight messages.
 *
 * Control messages (pub/sub, JSON):
 *   { type: 'LISTENER_RELOAD' | 'LISTENER_REMOVE' | 'LISTENER_RELOAD_ALL',
 *     listenerID?, at }
 */
const { v4: uuidv4 } = require('uuid');
const Logger = require('../utils/logger');
const environmentVariables = require('../environment');

function getBusConfig() {
  return {
    stream: environmentVariables.LISTENER_STREAM || 'listener:events',
    group: environmentVariables.LISTENER_GROUP || 'listener-workers',
    dlqStream: environmentVariables.LISTENER_DLQ_STREAM || 'listener:events:dlq',
    controlChannel: environmentVariables.LISTENER_CONTROL_CHANNEL || 'listener:control',
    prefetch: Number(environmentVariables.LISTENER_PREFETCH || 20),
    maxLen: Number(environmentVariables.LISTENER_STREAM_MAXLEN || 10000),
  };
}

function buildEnvelope({ listenerID, tenantID, rawEvent, eventID, enqueuedAt }) {
  return {
    eventID: eventID || uuidv4(),
    listenerID,
    tenantID,
    rawEvent,
    enqueuedAt: enqueuedAt || Date.now(),
  };
}

/**
 * Publish a raw listener event to the stream (durable, persistent).
 */
async function publishListenerEvent({ listenerID, tenantID, rawEvent, eventID }) {
  const { getRedisClient } = require('./redis.config');
  const { stream, maxLen } = getBusConfig();
  const envelope = buildEnvelope({ listenerID, tenantID, rawEvent, eventID });
  const client = getRedisClient('bus');
  await client.xadd(stream, 'MAXLEN', '~', String(maxLen), '*', 'data', JSON.stringify(envelope));
  return envelope;
}

/**
 * Idempotent consumer-group creation (ignores BUSYGROUP).
 */
async function ensureConsumerGroup(client) {
  const { stream, group } = getBusConfig();
  try {
    await client.xgroup('CREATE', stream, group, '$', 'MKSTREAM');
    Logger.log('success', { message: 'listenerBus:group:created', params: { stream, group } });
  } catch (err) {
    if (!/BUSYGROUP/i.test(err.message)) throw err;
  }
}

/**
 * Move a failed envelope to the DLQ stream (best-effort, never throws).
 */
async function moveToDlq(client, envelope, error) {
  const { dlqStream, maxLen } = getBusConfig();
  try {
    await client.xadd(
      dlqStream, 'MAXLEN', '~', String(maxLen), '*',
      'data', JSON.stringify({ ...envelope, failedAt: Date.now(), error: error?.message || String(error) })
    );
  } catch (dlqErr) {
    Logger.log('error', { message: 'listenerBus:dlq:failed', params: { error: dlqErr.message } });
  }
}

/**
 * Parse an XREADGROUP message into { id, envelope }.
 * ioredis returns fields as [key, value, key, value, ...].
 */
function parseStreamMessage(msgId, fields) {
  let data = null;
  for (let i = 0; i < fields.length; i += 2) {
    if (fields[i] === 'data') { data = fields[i + 1]; break; }
  }
  if (!data) throw new Error('stream message missing data field');
  const envelope = JSON.parse(data);
  if (!envelope || !envelope.listenerID) throw new Error('stream envelope missing listenerID');
  return { id: msgId, envelope };
}

/**
 * Publish a control signal for the ingress proxy (best-effort).
 */
async function publishControl(message) {
  const { getRedisClient } = require('./redis.config');
  const { controlChannel } = getBusConfig();
  const client = getRedisClient('bus');
  await client.publish(controlChannel, JSON.stringify({ ...message, at: Date.now() }));
}

/**
 * Per-proxy targeted control channel: `listener:control:<proxyID>`.
 * Used for assignment/shard signals meant for exactly one proxy node.
 */
function getProxyControlChannel(proxyID) {
  return `${getBusConfig().controlChannel}:${proxyID}`;
}

/**
 * Subscribe to a control channel (global by default, or a proxy-targeted
 * one). Returns the subscriber client. ioredis auto-resubscribes on
 * reconnect. The same shared client may back several subscriptions — each
 * handler filters on its own channel.
 */
async function subscribeControl(onMessage, channel) {
  const { getRedisClient } = require('./redis.config');
  const target = channel || getBusConfig().controlChannel;
  const sub = getRedisClient('control-sub');
  await sub.subscribe(target);
  sub.on('message', (received, raw) => {
    if (received !== target) return;
    try {
      const msg = JSON.parse(raw);
      Promise.resolve(onMessage(msg)).catch((err) => {
        Logger.log('error', { message: 'listenerBus:control:handler:error', params: { error: err.message } });
      });
    } catch (err) {
      Logger.log('warning', { message: 'listenerBus:control:badMessage', params: { error: err.message } });
    }
  });
  Logger.log('info', { message: 'listenerBus:control:subscribed', params: { channel: target } });
  return sub;
}

module.exports = {
  getBusConfig,
  getProxyControlChannel,
  buildEnvelope,
  publishListenerEvent,
  ensureConsumerGroup,
  moveToDlq,
  parseStreamMessage,
  publishControl,
  subscribeControl,
};
