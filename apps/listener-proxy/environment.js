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

  /** Shared secret for the cluster-internal control fallback endpoint (optional). */
  PROXY_CONTROL_TOKEN: optionalEnv('PROXY_CONTROL_TOKEN', null),

  /**
   * Public base URL of THIS proxy node, advertised at registry registration
   * (status/observability only — envelope routing never uses it), e.g.
   * https://hooks-1.example.com. Empty = unadvertised (fine for dev).
   */
  LISTENER_PROXY_PUBLIC_URL: optionalEnv('LISTENER_PROXY_PUBLIC_URL', ''),

  /** Registry weight for shard assignment (higher = larger share). */
  LISTENER_PROXY_WEIGHT: optionalInt('LISTENER_PROXY_WEIGHT', 100),

  EXPRESS_REQUEST_SIZE_LIMIT: optionalEnv('EXPRESS_REQUEST_SIZE_LIMIT', '5mb'),
  LOG_LEVEL: optionalEnv('LOG_LEVEL', 'info'),
};

function requireDatabase() {
  return requiredValue('DATABASE_URL');
}

function requireRedis() {
  return requiredValue('REDIS_URL');
}

module.exports = { environment, requireDatabase, requireRedis };
