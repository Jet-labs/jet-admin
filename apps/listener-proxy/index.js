/**
 * Listener Proxy — stateless ingress app.
 * Run: `npm run dev` (local) or via Dockerfile.listener-proxy (compose).
 *
 * Owns ALL datasource subscriptions + webhook ingress. Publishes raw
 * envelopes to the Redis Stream (`listener:events`); backend pods consume
 * via the pipeline worker. No local truth beyond the live subscription
 * handles: config is (re)loaded from DB on boot + on control signals.
 *
 * Control plane (Redis pub/sub `listener:control`, best-effort):
 *   LISTENER_RELOAD <listenerID> — restartOne (CRUD hot-reload from backend)
 *   LISTENER_REMOVE <listenerID> — stopOne (delete / deactivate)
 *   LISTENER_RELOAD_ALL          — stopAll + startAll
 *
 * HTTP:
 *   /health                                   — liveness (active count, redis)
 *   /webhooks/*                               — datasource webhook ingress
 *   POST /internal/listeners/reload/:listenerID — HTTP fallback for control
 *     (cluster-internal; requires PROXY_CONTROL_TOKEN when set)
 *
 * Shared code (listenerEngine, queue, listenerBus, redis, prisma, vault,
 * datasources-logic) is reused from apps/backend + packages/ — this app
 * only owns the ingress wiring + lifecycle. Keep backend as the source of
 * truth for engine/queue/bus logic.
 *
 * Two modes:
 *   standalone (main) — `npm start` / compose: owns subscriptions + webhooks
 *     on its own port, requires REDIS_URL + DATABASE_URL.
 *   embedded (startEmbedded) — the backend calls this in-process for local
 *     dev: subscriptions run inside the backend process on the memory queue,
 *     no Redis, no extra port. The backend mounts getWebhookApp() itself.
 */

// ─── 1. Environment (must be first — loads .env before backend modules read it) ─
const { environment, isProxyMode, requireDatabase, requireRedis } = require('./environment');

// ─── 2. Shared backend modules (resolved via the backend workspace tree) ───
const express = require('express');
const cors = require('cors');
const Logger = require('../backend/utils/logger');

let httpServer = null;
let shuttingDown = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRedis() {
  const { getRedisClient } = require('../backend/config/redis.config');
  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      const client = getRedisClient('bus');
      await client.ping();
      Logger.log('success', { message: 'proxy:redis:connected', params: { attempt } });
      return;
    } catch (err) {
      if (shuttingDown) throw err;
      const delay = Math.min(30000, 1000 * 2 ** Math.min(attempt, 5));
      Logger.log('warning', {
        message: 'proxy:redis:waiting',
        params: { error: err.message, attempt, retryInMs: delay },
      });
      await sleep(delay);
    }
  }
}

async function handleControlMessage(msg) {
  const { listenerEngine } = require('../backend/modules/listener/listenerEngine/engine');
  const { type, listenerID } = msg || {};
  Logger.log('info', { message: 'proxy:control:received', params: { type, listenerID } });
  switch (type) {
    case 'LISTENER_RELOAD':
      if (listenerID) await listenerEngine.restartOne(listenerID);
      break;
    case 'LISTENER_REMOVE':
      if (listenerID) await listenerEngine.stopOne(listenerID);
      break;
    case 'LISTENER_RELOAD_ALL':
      await listenerEngine.stopAll();
      await listenerEngine.startAll();
      break;
    default:
      Logger.log('warning', { message: 'proxy:control:unknown', params: { type } });
  }
}

function buildApp() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: environment.EXPRESS_REQUEST_SIZE_LIMIT || '5mb' }));
  app.use(express.urlencoded({ extended: false, limit: environment.EXPRESS_REQUEST_SIZE_LIMIT || '5mb' }));

  app.get('/health', async (req, res) => {
    try {
      const { listenerEngine } = require('../backend/modules/listener/listenerEngine/engine');
      const { isClientReady } = require('../backend/config/redis.config');
      res.status(200).json({
        status: 'ok',
        service: 'listener-proxy',
        activeListeners: Object.keys(listenerEngine.getStatus()).length,
        redis: isClientReady('bus') ? 'ready' : 'not-ready',
        timestamp: new Date(),
      });
    } catch (err) {
      res.status(500).json({ status: 'error', error: err.message });
    }
  });

  // HTTP fallback for control signals (Redis pub/sub is primary).
  app.post('/internal/listeners/reload/:listenerID', async (req, res) => {
    if (environment.PROXY_CONTROL_TOKEN) {
      const token = req.headers['x-proxy-token'];
      if (token !== environment.PROXY_CONTROL_TOKEN) {
        return res.status(401).json({ success: false, error: 'Invalid proxy token' });
      }
    }
    try {
      await handleControlMessage({ type: 'LISTENER_RELOAD', listenerID: req.params.listenerID });
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Webhook ingress — same shared router the datasource subscribe() registers.
  // eslint-disable-next-line global-require
  const { webhookRouter } = require('@jet-admin/datasources-logic');
  app.use('/webhooks', webhookRouter.getApp());

  return app;
}

// ─── Embedded ingress API (used in-process by the backend in dev) ──────────
// All engine requires are lazy so requiring this module never pulls the
// backend tree at load time (avoids backend ↔ proxy require cycles).

function getEngine() {
  // eslint-disable-next-line global-require
  return require('../backend/modules/listener/listenerEngine/engine').listenerEngine;
}

/** Shared webhook ingress middleware (datasource subscribe() registers into the same router). */
function getWebhookApp() {
  // eslint-disable-next-line global-require
  return require('@jet-admin/datasources-logic').webhookRouter.getApp();
}

/**
 * Start subscriptions in-process (dev embedded mode: memory queue, no Redis,
 * no extra HTTP server). The host process mounts getWebhookApp() itself and
 * owns queue init + the pipeline consumer.
 */
async function startEmbedded() {
  requireDatabase();
  Logger.log('info', { message: 'proxy:embedded:start:init' });
  await getEngine().startAll();
  Logger.log('success', { message: 'proxy:embedded:started' });
}

async function stopEmbedded() {
  Logger.log('info', { message: 'proxy:embedded:stop:init' });
  await getEngine().stopAll();
}

/** Direct engine lifecycle (embedded only — proxy mode uses notifyListenerChange). */
async function startOne(listener) {
  await getEngine().startOne(listener);
}

async function restartOne(listenerID) {
  await getEngine().restartOne(listenerID);
}

async function stopOne(listenerID) {
  await getEngine().stopOne(listenerID);
}

async function startAll() {
  await getEngine().startAll();
}

async function stopAll() {
  await getEngine().stopAll();
}

function getStatus() {
  return getEngine().getStatus();
}

/**
 * Notify the standalone proxy about a listener change (proxy mode only).
 * Best-effort control publish — the proxy reloads config from DB.
 */
async function notifyListenerChange(action, listenerID) {
  try {
    // eslint-disable-next-line global-require
    const { publishControl } = require('../backend/config/listenerBus.config');
    await publishControl({ type: action, listenerID });
    Logger.log('info', { message: 'proxy:ingress:notified', params: { action, listenerID } });
  } catch (err) {
    Logger.log('warning', { message: 'proxy:ingress:notify:failed', params: { action, listenerID, error: err.message } });
  }
}

async function main() {
  Logger.log('info', { message: 'proxy:boot:init' });

  // Standalone proxy requires both: DB for listener configs, Redis for the bus.
  requireDatabase();
  requireRedis();

  await waitForRedis();

  const { initializeQueue, closeQueue } = require('../backend/config/queue.config');
  await initializeQueue();

  const { subscribeControl } = require('../backend/config/listenerBus.config');
  try {
    await subscribeControl(handleControlMessage);
  } catch (err) {
    Logger.log('warning', { message: 'proxy:control:subscribe:failed', params: { error: err.message } });
  }

  const { listenerEngine } = require('../backend/modules/listener/listenerEngine/engine');
  await listenerEngine.startAll();

  const app = buildApp();
  const port = Number(environment.LISTENER_PROXY_PORT || environment.PORT || 8095);
  await new Promise((resolve) => {
    httpServer = app.listen(port, () => {
      Logger.log('success', { message: 'proxy:listening', params: { port } });
      resolve();
    });
  });

  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    Logger.log('info', { message: `proxy:shutdown (${signal})` });
    try {
      if (httpServer) {
        await new Promise((resolve) => httpServer.close(resolve));
      }
    } catch (_) { /* ignore */ }
    try {
      const { listenerEngine: engine } = require('../backend/modules/listener/listenerEngine/engine');
      await engine.stopAll();
    } catch (_) { /* ignore */ }
    try {
      await closeQueue();
    } catch (_) { /* ignore */ }
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
  main().catch((err) => {
    Logger.log('error', { message: 'proxy:boot:failed', params: { error: err.message } });
    process.exit(1);
  });
}

module.exports = {
  main,
  handleControlMessage,
  buildApp,
  // Embedded ingress API (backend dev uses these in-process)
  isProxyMode,
  startEmbedded,
  stopEmbedded,
  startOne,
  restartOne,
  stopOne,
  startAll,
  stopAll,
  getStatus,
  getWebhookApp,
  notifyListenerChange,
};
