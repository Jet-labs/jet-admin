/**
 * environment.js — single source of truth for env vars in apps/listener-proxy.
 *
 * Follows the same convention as apps/backend/environment.js and
 * apps/mcp-server/environment.js: this is the FIRST module loaded by
 * index.js, so dotenv values are set before any backend module
 * (which reads process.env via apps/backend/environment.js) is required.
 *
 * NOTE: backend modules required by the proxy (listenerEngine, queue,
 * listenerBus, redis, prisma, vault) read apps/backend/environment.js
 * internally. That module calls dotenv.config() without override, so
 * values set here / in this app's .env / in the container environment
 * always win. Keep the two in sync via compose (same DATABASE_URL,
 * REDIS_URL, VAULT_ENCRYPTION_KEY as the backend).
 */

const dotenv = require('dotenv');
const path = require('path');

// Load apps/listener-proxy/.env first (no override of real env).
dotenv.config({ path: path.resolve(__dirname, '.env') });

function requiredValue(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(
      `[listener-proxy] Missing required environment variable: ${name}\n` +
      `  Copy .env.example to .env and fill in the required values.`
    );
  }
  return String(value).trim();
}

function optionalEnv(name, defaultValue = null) {
  const value = process.env[name];
  if (value === undefined || value === null || !String(value).trim()) return defaultValue;
  return String(value).trim();
}

function optionalInt(name, defaultValue) {
  const raw = optionalEnv(name, null);
  if (raw === null || raw === undefined || raw === '') return defaultValue;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

const environment = {
  NODE_ENV: optionalEnv('NODE_ENV', 'production'),

  /** Port this proxy listens on (webhooks + /health + control fallback). */
  PORT: optionalInt('PORT', null) || optionalInt('LISTENER_PROXY_PORT', 8095),
  LISTENER_PROXY_PORT: optionalInt('LISTENER_PROXY_PORT', 8095),

  /** App Postgres — the proxy (re)loads listener configs from DB on boot + control signals. */
  DATABASE_URL: optionalEnv('DATABASE_URL', ''),

  /** Redis — the proxy publishes raw envelopes to the `listener:events` Stream. */
  REDIS_URL: optionalEnv('REDIS_URL', ''),

  /** Queue tuning (mirrors apps/backend/environment.js defaults). */
  QUEUE_DRIVER: optionalEnv('QUEUE_DRIVER', 'redis'),
  LISTENER_STREAM: optionalEnv('LISTENER_STREAM', 'listener:events'),
  LISTENER_GROUP: optionalEnv('LISTENER_GROUP', 'listener-workers'),
  LISTENER_DLQ_STREAM: optionalEnv('LISTENER_DLQ_STREAM', 'listener:events:dlq'),
  LISTENER_CONTROL_CHANNEL: optionalEnv('LISTENER_CONTROL_CHANNEL', 'listener:control'),
  LISTENER_PREFETCH: optionalInt('LISTENER_PREFETCH', 20),
  LISTENER_STREAM_MAXLEN: optionalInt('LISTENER_STREAM_MAXLEN', 10000),

  /** Shared secret for the cluster-internal control fallback endpoint (optional). */
  PROXY_CONTROL_TOKEN: optionalEnv('PROXY_CONTROL_TOKEN', null),

  EXPRESS_REQUEST_SIZE_LIMIT: optionalEnv('EXPRESS_REQUEST_SIZE_LIMIT', '5mb'),
  LOG_LEVEL: optionalEnv('LOG_LEVEL', 'info'),
};

/**
 * Proxy mode = a dedicated node owns subscriptions + webhook ingress and the
 * backend only consumes the Redis Stream. Single source of truth for the
 * mode check — the backend routes all ingress decisions through this.
 * (Reads the backend environment module per the repo convention that only
 * environment.js modules touch process.env.)
 */
function isProxyMode() {
  // eslint-disable-next-line global-require
  const backendEnv = require('../backend/environment');
  return backendEnv.LISTENER_INGRESS === 'proxy' && !!backendEnv.REDIS_URL;
}

function requireDatabase() {
  return requiredValue('DATABASE_URL');
}

function requireRedis() {
  return requiredValue('REDIS_URL');
}

module.exports = { environment, isProxyMode, requireDatabase, requireRedis };
