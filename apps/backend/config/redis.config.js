/**
 * Redis Configuration — shared ioredis clients.
 *
 * One Redis instance serves two purposes (separate keyspaces / connections):
 *   1. Listener event bus — Streams (`listener:events` + DLQ, see
 *      ./listenerBus.config.js). Durable, competing-consumer safe.
 *   2. Socket.IO adapter — pub/sub fan-out so `push_to_app_page` emits from
 *      any backend replica reach the replica holding the browser socket.
 *
 * All clients are lazy singletons keyed by purpose. ioredis auto-reconnects
 * in the background; callers must tolerate transient disconnects.
 * `maxRetriesPerRequest: null` is required for BLOCKING reads (XREADGROUP).
 */
const Logger = require('../utils/logger');
const environmentVariables = require('../environment');

const clients = {};

function isRedisEnabled() {
  return !!environmentVariables.REDIS_URL;
}

function getRedisClient(name = 'default') {
  if (clients[name]) return clients[name];
  if (!environmentVariables.REDIS_URL) {
    throw new Error('REDIS_URL is not set. Set REDIS_URL or use QUEUE_DRIVER=memory.');
  }
  // Lazy-require so unit tests / memory-mode boots never touch ioredis.
  let Redis;
  try {
    Redis = require('ioredis');
  } catch (err) {
    throw new Error(`ioredis is not installed: ${err.message}`);
  }
  const client = new Redis(environmentVariables.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy: (times) => Math.min(times * 200, 5000),
  });
  client.on('error', (err) => {
    Logger.log('warning', {
      message: 'redis:client:error',
      params: { client: name, error: err.message },
    });
  });
  clients[name] = client;
  return client;
}

function isClientReady(name = 'default') {
  const client = clients[name];
  return !!client && client.status === 'ready';
}

async function closeRedis() {
  const names = Object.keys(clients);
  await Promise.all(
    names.map(async (name) => {
      const client = clients[name];
      delete clients[name];
      try {
        await client.quit();
      } catch (e) {
        try { client.disconnect(); } catch (_) { /* ignore */ }
      }
    })
  );
  if (names.length > 0) {
    Logger.log('info', { message: 'redis:clients:closed', params: { count: names.length } });
  }
}

module.exports = { isRedisEnabled, getRedisClient, isClientReady, closeRedis };
