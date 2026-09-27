/**
 * Listener Proxy — sharded ingress node.
 * Run: `npm run dev` (local) or via Dockerfile.listener-proxy (compose).
 *
 * Each proxy registers in the backend-coordinated registry
 * (apps/backend/modules/proxyRegistry, Redis-backed) and subscribes ONLY
 * to its assigned shard — so N proxies share load without duplicate
 * processing. A single proxy owns everything (degenerate case).
 * Publishes raw envelopes to the Redis Stream (`listener:events`); backend
 * pods consume via the pipeline worker. Webhook ingress is stateless, so
 * EVERY proxy serves ALL webhook routes (anycast); only stateful
 * subscriptions (mqtt/ws/sse/…) are sharded.
 *
 * Control plane (Redis pub/sub, best-effort):
 *   global `listener:control`:
 *     LISTENER_RELOAD <id>  — restart if owned (CRUD hot-reload from backend)
 *     LISTENER_REMOVE <id>  — stop if owned (delete / deactivate)
 *     LISTENER_RELOAD_ALL   — full resync (re-list + rebalance + sync)
 *     ASSIGNMENTS_CHANGED   — someone rebalanced: re-fetch shard + sync
 *   targeted `listener:control:<proxyID>` — reserved for direct signals.
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
 * Single mode: standalone (`npm start` / compose) — owns subscriptions +
 * webhooks on its own port, requires REDIS_URL + DATABASE_URL. The backend
 * never subscribes; it only consumes the Stream and notifies this proxy
 * of listener changes via notifyListenerChange (same module, used by the
 * backend's listener.service).
 */

// ─── 1. Environment (must be first — loads .env before backend modules read it) ─
const { environment, requireDatabase, requireRedis } = require('./environment');

// ─── 2. Shared backend modules (resolved via the backend workspace tree) ───
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const Logger = require('../backend/utils/logger');

// Identity of THIS node (fresh uuid per boot; re-registration after a
// restart is a new member — the stale key expires via TTL).
// eslint-disable-next-line global-require
const PROXY_ID = crypto.randomUUID();
let PROXY_VERSION = 'unknown';
try {
  // eslint-disable-next-line global-require
  PROXY_VERSION = require('./package.json').version || 'unknown';
} catch (_) { /* ignore */ }

function getRegistry() {
  // Lazy so requiring this module never pulls the backend tree at load time.
  // eslint-disable-next-line global-require
  return require('../backend/modules/proxyRegistry/proxyRegistry.service');
}

function getEngine() {
  // eslint-disable-next-line global-require
  return require('../backend/modules/listener/listenerEngine/engine').listenerEngine;
}

let httpServer = null;
let shuttingDown = false;
let watchTimer = null;
let lastMembershipFp = null;
// Periodic full pass: rebalances even with no membership/version change so
// load re-evenses after partitions (a returnee's fp matches, but the split
// may be lopsided). Rebalance is read-only when converged — no writes.
const FULL_RESYNC_INTERVAL_MS = 60 * 1000;
// Start at load time (not 0): the boot resync is forced anyway, and this
// keeps unit tests — which run in milliseconds — on the event-driven path.
let lastFullResyncAt = Date.now();

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

/**
 * Membership fingerprint: sorted live IDs joined. Cheap change-detector so
 * the watch loop rebalances only when the proxy set actually changes.
 */
function fingerprintMembership(liveProxies) {
  return (liveProxies || []).map((p) => p.proxyID).sort().join(',');
}

/**
 * Pure diff between live subscriptions and the assigned shard.
 * @returns {{toStop: string[], toStart: string[]}} (sorted, deduped)
 */
function computeSyncActions(activeIDs, shardIDs) {
  const desired = new Set(shardIDs || []);
  const active = new Set(activeIDs || []);
  return {
    toStop: [...active].filter((id) => !desired.has(id)).sort(),
    toStart: [...desired].filter((id) => !active.has(id)).sort(),
  };
}

async function fetchActiveListenerIDs() {
  // eslint-disable-next-line global-require
  const { prisma } = require('../backend/config/prisma.config');
  const rows = await prisma.tblListeners.findMany({
    where: { status: 'active' },
    select: { listenerID: true },
  });
  return (rows || []).map((r) => r.listenerID).filter(Boolean);
}

/**
 * Converge live subscriptions to the assigned shard (stop-before-start:
 * drop what left the shard first, then subscribe to arrivals — never the
 * reverse, so a migrating listener is never double-subscribed HERE).
 * DEFAULT-DENY: empty/unknown shard ⇒ stop everything, subscribe nothing.
 */
async function syncSubscriptions() {
  const registry = getRegistry();
  const listenerEngine = getEngine();
  const shard = await registry.getShard(PROXY_ID);
  const { toStop, toStart } = computeSyncActions(
    Object.keys(listenerEngine.getStatus()),
    shard
  );
  for (const listenerID of toStop) {
    try {
      await listenerEngine.stopOne(listenerID);
    } catch (err) {
      Logger.log('warning', { message: 'proxy:sync:stop:failed', params: { listenerID, error: err.message } });
    }
  }
  for (const listenerID of toStart) {
    try {
      // restartOne re-fetches fresh config from DB (no-op if not active).
      await listenerEngine.restartOne(listenerID);
    } catch (err) {
      Logger.log('warning', { message: 'proxy:sync:start:failed', params: { listenerID, error: err.message } });
    }
  }
  if (toStop.length > 0 || toStart.length > 0) {
    Logger.log('info', { message: 'proxy:sync:done', params: { stopped: toStop.length, started: toStart.length } });
  }
  return { toStop, toStart };
}

/**
 * One coordination pass: heartbeat (re-register if unknown) → detect
 * membership OR version change → rebalance (membership only) + sync local
 * subscriptions. The version poll is the backstop for missed pub/sub and
 * for partitions: a proxy returning from a partition sees the same member
 * set but a newer version, so it still re-syncs and drops stale shards.
 * Best-effort throughout: failures just defer to the next tick, and the
 * HTTP server keeps serving webhooks regardless.
 */
let lastSeenVersion = null;

async function resync(reason) {
  const registry = getRegistry();
  try {
    const hb = await registry.heartbeat(PROXY_ID);
    if (!hb.ok) {
      await registry.registerProxy({
        proxyID: PROXY_ID,
        baseUrl: environment.LISTENER_PROXY_PUBLIC_URL || null,
        weight: Number(environment.LISTENER_PROXY_WEIGHT || 100),
        version: PROXY_VERSION,
      });
    }
    const live = await registry.listLiveProxies();
    const fp = fingerprintMembership(live);
    const version = await registry.getVersion();
    const forced = reason === 'boot' || reason === 'reload-all';
    const membershipChanged = fp !== lastMembershipFp;
    const versionChanged = lastSeenVersion === null || version !== lastSeenVersion;
    const fullDue = Date.now() - lastFullResyncAt > FULL_RESYNC_INTERVAL_MS;
    if (!forced && !membershipChanged && !versionChanged && !fullDue) {
      return { changed: false };
    }
    lastMembershipFp = fp;
    let moved = 0;
    let currentVersion = version;
    if (forced || membershipChanged || fullDue) {
      lastFullResyncAt = Date.now();
      const ids = await fetchActiveListenerIDs();
      const result = await registry.rebalance(ids, live);
      moved = result.moved;
      currentVersion = result.version;
      if (moved > 0) {
        // Nudge peers (fire-and-forget — version polling is the backstop).
        // eslint-disable-next-line global-require
        const { publishControl } = require('../backend/config/listenerBus.config');
        publishControl({ type: 'ASSIGNMENTS_CHANGED', version: currentVersion }).catch((err) => {
          Logger.log('warning', { message: 'proxy:resync:announce:failed', params: { error: err.message } });
        });
      }
    }
    lastSeenVersion = currentVersion;
    const sync = await syncSubscriptions();
    return { changed: true, moved, version: currentVersion, ...sync };
  } catch (err) {
    Logger.log('warning', { message: 'proxy:resync:failed', params: { reason, error: err.message } });
    return { changed: false, error: err.message };
  }
}

async function handleControlMessage(msg) {
  const listenerEngine = getEngine();
  const { type, listenerID } = msg || {};
  Logger.log('info', { message: 'proxy:control:received', params: { type, listenerID } });
  const owned = (id) => Boolean(
    id && Object.prototype.hasOwnProperty.call(listenerEngine.getStatus(), id)
  );
  switch (type) {
    case 'LISTENER_RELOAD':
      // Backend CRUD fan-out reaches every proxy; only the owner acts.
      if (owned(listenerID)) await listenerEngine.restartOne(listenerID);
      break;
    case 'LISTENER_REMOVE':
      if (owned(listenerID)) await listenerEngine.stopOne(listenerID);
      break;
    case 'LISTENER_RELOAD_ALL':
      await resync('reload-all');
      break;
    case 'ASSIGNMENTS_CHANGED':
      // A peer rebalanced (or we missed heartbeats) — re-fetch shard + sync.
      await syncSubscriptions();
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
      const listenerEngine = getEngine();
      // eslint-disable-next-line global-require
      const { isClientReady } = require('../backend/config/redis.config');
      const payload = {
        status: 'ok',
        service: 'listener-proxy',
        proxyID: PROXY_ID,
        activeListeners: Object.keys(listenerEngine.getStatus()).length,
        redis: isClientReady('bus') ? 'ready' : 'not-ready',
        timestamp: new Date(),
      };
      try {
        const registry = getRegistry();
        payload.assignedListeners = (await registry.getShard(PROXY_ID)).length;
        payload.assignmentVersion = await registry.getVersion();
      } catch (_) { /* registry readout is best-effort on /health */ }
      res.status(200).json(payload);
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
  app.use('/webhooks', getWebhookApp());

  return app;
}

/** Shared webhook ingress middleware (datasource subscribe() registers into the same router). */
function getWebhookApp() {
  // eslint-disable-next-line global-require
  return require('@jet-admin/datasources-logic').webhookRouter.getApp();
}

/**
 * Forward a listener change to this proxy (called by the backend's
 * listener.service after CRUD). Best-effort control publish — the proxy
 * reloads the listener config from DB on receipt.
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

  const { subscribeControl, getProxyControlChannel } = require('../backend/config/listenerBus.config');
  try {
    await subscribeControl(handleControlMessage);
    await subscribeControl(handleControlMessage, getProxyControlChannel(PROXY_ID));
  } catch (err) {
    Logger.log('warning', { message: 'proxy:control:subscribe:failed', params: { error: err.message } });
  }

  // Join the registry and take our shard (best-effort at boot — the watch
  // loop converges afterwards; HTTP serves webhooks regardless).
  try {
    await getRegistry().registerProxy({
      proxyID: PROXY_ID,
      baseUrl: environment.LISTENER_PROXY_PUBLIC_URL || null,
      weight: Number(environment.LISTENER_PROXY_WEIGHT || 100),
      version: PROXY_VERSION,
    });
    await resync('boot');
  } catch (err) {
    Logger.log('warning', { message: 'proxy:boot:resync:deferred', params: { error: err.message } });
  }

  // Membership watch: heartbeat + rebalance on proxy-set changes.
  try {
    const { HEARTBEAT_INTERVAL_MS } = getRegistry();
    watchTimer = setInterval(() => {
      resync('interval').catch(() => { /* resync never throws, belt-and-braces */ });
    }, HEARTBEAT_INTERVAL_MS);
    if (typeof watchTimer.unref === 'function') watchTimer.unref();
  } catch (err) {
    Logger.log('warning', { message: 'proxy:watch:disabled', params: { error: err.message } });
  }

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
      if (watchTimer) clearInterval(watchTimer);
    } catch (_) { /* ignore */ }
    try {
      // Leave the registry immediately so peers rebalance now instead of
      // waiting out our key TTL. The shard itself is left for rebalance.
      await getRegistry().deregister(PROXY_ID);
    } catch (_) { /* ignore */ }
    try {
      if (httpServer) {
        await new Promise((resolve) => httpServer.close(resolve));
      }
    } catch (_) { /* ignore */ }
    try {
      const engine = getEngine();
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
  getWebhookApp,
  notifyListenerChange,
  // Shard coordination (exported for tests; runtime uses them internally)
  proxyID: PROXY_ID,
  FULL_RESYNC_INTERVAL_MS,
  fingerprintMembership,
  computeSyncActions,
  syncSubscriptions,
  resync,
};
