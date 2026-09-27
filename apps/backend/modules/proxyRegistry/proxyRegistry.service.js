/**
 * Proxy Registry — backend-coordinated ownership of listener subscriptions.
 *
 * Why Redis (not Postgres): proxy membership is ephemeral, heartbeats map
 * to key TTLs (expiry IS the failure detector), and the registry fate-shares
 * with the event bus it coordinates — if Redis is down the pipeline is halted
 * anyway, so no second system must be up for coordination to work.
 *
 * Key layout:
 *   proxy:node:<proxyID>      JSON {baseUrl, weight, version, status, lastHeartbeatAt}, EX = TTL
 *                              — refreshed on every heartbeat; disappearance = death
 *   proxy:shard:<proxyID>      SET of listenerIDs owned by this proxy (what a proxy subscribes)
 *   proxy:assign:<listenerID>  JSON {proxyID, version} — per-listener placement
 *   proxy:version              INT global assignment version (INCR per rebalance)
 *
 * Assignment is a pure deterministic function (consistent-hash ring over live
 * proxies), so every backend replica computes the identical result with no
 * leader election. Membership changes are the only rebalance trigger.
 *
 * Safety rules (enforced by consumers of this module, documented here):
 *   1. DEFAULT-DENY: no assignment = subscribe to nothing. A proxy that
 *      cannot fetch its shard (or finds it empty) must stay idle — never
 *      fall back to "all active listeners", or a Redis wipe causes mass
 *      duplicate subscriptions.
 *   2. STOP-BEFORE-START: when a rebalance moves a listener, the old owner
 *      stops before the new owner subscribes (version-gated control).
 *
 * Phase 1: registry + assignment + rebalance primitives + tests.
 * No caller yet — wiring (proxy register/heartbeat loop, sweeper, targeted
 * control, placement status) lands in later phases with zero behavior change
 * until then.
 */
const crypto = require('crypto');
const Logger = require('../../utils/logger');

// ─── Tuning (exported so proxy/sweeper phases share the same constants) ─────
const HEARTBEAT_INTERVAL_MS = 10 * 1000;
const NODE_TTL_SEC = 30;
const SCAN_COUNT = 100;
const MAX_RING_POINTS_PER_PROXY = 1000;

// ─── Keys ───────────────────────────────────────────────────────────────────
const keyNode = (proxyID) => `proxy:node:${proxyID}`;
const keyShard = (proxyID) => `proxy:shard:${proxyID}`;
const keyAssign = (listenerID) => `proxy:assign:${listenerID}`;
const KEY_VERSION = 'proxy:version';
const KEY_NODE_PATTERN = 'proxy:node:*';

function getClient() {
  // eslint-disable-next-line global-require
  const { getRedisClient } = require('../../config/redis.config');
  return getRedisClient('registry');
}

// ─── Hashing (deterministic across processes) ───────────────────────────────
function hash32(str) {
  return parseInt(
    crypto.createHash('sha1').update(String(str), 'utf8').digest('hex').slice(0, 8),
    16
  );
}

function normalizeProxies(proxies) {
  const seen = new Map();
  for (const p of proxies || []) {
    if (!p || !p.proxyID || seen.has(p.proxyID)) continue;
    const weight = Number(p.weight);
    seen.set(p.proxyID, {
      proxyID: p.proxyID,
      weight: Number.isFinite(weight) && weight > 0 ? weight : 100,
    });
  }
  // Sorted by ID: identical input set ⇒ identical ring on every replica.
  return [...seen.values()].sort((a, b) => (a.proxyID < b.proxyID ? -1 : 1));
}

function buildRing(proxies) {
  const ring = [];
  for (const proxy of normalizeProxies(proxies)) {
    const points = Math.min(
      MAX_RING_POINTS_PER_PROXY,
      Math.max(1, Math.round(proxy.weight))
    );
    for (let n = 0; n < points; n += 1) {
      ring.push({ hash: hash32(`${proxy.proxyID}#${n}`), proxyID: proxy.proxyID });
    }
  }
  ring.sort((a, b) => a.hash - b.hash);
  return ring;
}

/**
 * Deterministic shard: listenerID → proxyID.
 * Empty proxy set ⇒ {} (DEFAULT-DENY: nobody owns anything).
 */
function assignListeners(listenerIDs, proxies) {
  const ring = buildRing(proxies);
  const result = {};
  if (ring.length === 0) return result;
  const ids = [...new Set((listenerIDs || []).filter(Boolean))].sort();
  for (const listenerID of ids) {
    const h = hash32(`listener:${listenerID}`);
    // First ring node clockwise (wrap around).
    let owner = ring[0];
    for (let i = 0; i < ring.length; i += 1) {
      if (ring[i].hash >= h) { owner = ring[i]; break; }
    }
    result[listenerID] = owner.proxyID;
  }
  return result;
}

// ─── Registration + liveness ────────────────────────────────────────────────
async function registerProxy({ proxyID, baseUrl = null, weight = 100, version = null } = {}, opts = {}) {
  if (!proxyID || typeof proxyID !== 'string') {
    throw new Error('proxyRegistry.registerProxy: proxyID is required');
  }
  const client = opts.client || getClient();
  const ttl = opts.nodeTtlSec || NODE_TTL_SEC;
  const node = {
    baseUrl: baseUrl || null,
    weight,
    version: version || null,
    status: 'active',
    lastHeartbeatAt: new Date().toISOString(),
  };
  await client.set(keyNode(proxyID), JSON.stringify(node), 'EX', ttl);
  Logger.log('info', { message: 'proxyRegistry:registered', params: { proxyID } });
  return node;
}

async function heartbeat(proxyID, opts = {}) {
  if (!proxyID) throw new Error('proxyRegistry.heartbeat: proxyID is required');
  const client = opts.client || getClient();
  const ttl = opts.nodeTtlSec || NODE_TTL_SEC;
  const raw = await client.get(keyNode(proxyID));
  if (!raw) {
    // Unknown (expired/evicted/never registered) → caller must re-register.
    // Never auto-create here: an explicit register keeps intent clear.
    return { ok: false, known: false };
  }
  let node;
  try {
    node = JSON.parse(raw);
  } catch (_) {
    return { ok: false, known: false, corrupt: true };
  }
  node.lastHeartbeatAt = new Date().toISOString();
  await client.set(keyNode(proxyID), JSON.stringify(node), 'EX', ttl);
  return { ok: true, known: true };
}

async function deregister(proxyID, opts = {}) {
  if (!proxyID || typeof proxyID !== 'string') {
    throw new Error('proxyRegistry.deregister: proxyID is required');
  }
  const client = opts.client || getClient();
  // Remove liveness only — the shard is left for the next rebalance to
  // migrate (moves are computed from stored assignments, not from shards).
  await client.del(keyNode(proxyID));
  Logger.log('info', { message: 'proxyRegistry:deregistered', params: { proxyID } });
}

async function listLiveProxies(opts = {}) {
  const client = opts.client || getClient();
  const count = opts.scanCount || SCAN_COUNT;
  let cursor = '0';
  const keys = [];
  do {
    // eslint-disable-next-line no-await-in-loop
    const [next, batch] = await client.scan(cursor, 'MATCH', KEY_NODE_PATTERN, 'COUNT', count);
    cursor = String(next);
    keys.push(...(batch || []));
  } while (cursor !== '0');
  if (keys.length === 0) return [];
  const raws = await client.mget(...keys);
  const live = [];
  for (let i = 0; i < keys.length; i += 1) {
    try {
      const node = JSON.parse(raws[i]);
      if (node && typeof node === 'object') {
        live.push({ proxyID: keys[i].slice('proxy:node:'.length), ...node });
      }
    } catch (_) { /* corrupt entry — treated as not-live */ }
  }
  return live;
}

// ─── Shard + version reads ──────────────────────────────────────────────────
async function getShard(proxyID, opts = {}) {
  const client = opts.client || getClient();
  const members = await client.smembers(keyShard(proxyID));
  return [...new Set(members || [])].sort();
}

async function getVersion(opts = {}) {
  const client = opts.client || getClient();
  const raw = await client.get(KEY_VERSION);
  const version = parseInt(raw, 10);
  return Number.isFinite(version) ? version : 0;
}

async function readAssignments(listenerIDs, opts = {}) {
  const client = opts.client || getClient();
  const ids = [...new Set((listenerIDs || []).filter(Boolean))].sort();
  if (ids.length === 0) return {};
  const raws = await client.mget(...ids.map(keyAssign));
  const current = {};
  for (let i = 0; i < ids.length; i += 1) {
    try {
      const parsed = raws[i] ? JSON.parse(raws[i]) : null;
      current[ids[i]] = parsed && parsed.proxyID ? parsed.proxyID : null;
    } catch (_) {
      current[ids[i]] = null;
    }
  }
  return current;
}

// ─── Atomic apply (Lua: shard sets + per-listener keys + version bump) ──────
// ARGV[1] = JSON [{listenerID, from?, to?}] (absent keys decode to Lua nil;
// nulls are stripped in JS because cjson.null is truthy and would create
// literal "null" keys). Returns the new global version. Single script ⇒
// no torn shards.
const APPLY_LUA = `
local moves = cjson.decode(ARGV[1])
for _, m in ipairs(moves) do
  if m.from then
    redis.call('SREM', 'proxy:shard:' .. m.from, m.listenerID)
    if redis.call('SCARD', 'proxy:shard:' .. m.from) == 0 then
      redis.call('DEL', 'proxy:shard:' .. m.from)
    end
  end
  if m.to then
    redis.call('SADD', 'proxy:shard:' .. m.to, m.listenerID)
    redis.call('SET', 'proxy:assign:' .. m.listenerID, cjson.encode({proxyID = m.to}))
  else
    redis.call('DEL', 'proxy:assign:' .. m.listenerID)
  end
end
return redis.call('INCR', 'proxy:version')
`;

/**
 * Reconcile desired vs stored placement; apply only the delta.
 * @returns {{moved: number, moves: Array, version: number}}
 */
async function rebalance(listenerIDs, proxies, opts = {}) {
  const client = opts.client || getClient();
  const desired = assignListeners(listenerIDs, proxies);
  const ids = [...new Set((listenerIDs || []).filter(Boolean))].sort();
  const current = await readAssignments(ids, { ...opts, client });
  const moves = [];
  for (const listenerID of ids) {
    const from = current[listenerID] || null;
    const to = desired[listenerID] || null;
    if (from !== to) {
      moves.push({
        listenerID,
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      });
    }
  }
  if (moves.length === 0) {
    return { moved: 0, moves, version: await getVersion({ ...opts, client }) };
  }
  const newVersion = await client.eval(APPLY_LUA, 0, JSON.stringify(moves));
  Logger.log('info', {
    message: 'proxyRegistry:rebalanced',
    params: { moved: moves.length, version: Number(newVersion) },
  });
  return { moved: moves.length, moves, version: Number(newVersion) };
}

/**
 * Full reconcile pass: list live proxies + fetch active listener IDs,
 * rebalance on drift, and announce moves. Idempotent — a converged state
 * performs reads only (no writes, no version bump). Safe to run from CRUD
 * paths, interval sweepers, and any number of backend replicas concurrently
 * (deterministic function + atomic Lua apply).
 *
 * @param {object} args
 * @param {() => Promise<string[]>} args.fetchActiveIDs - active listener IDs
 * @param {(info: {moved: number, version: number}) => void} [args.onMoves] - announce hook
 * @returns {Promise<{moved: number, version: number, proxies: number}>}
 */
async function reconcile({ fetchActiveIDs, onMoves } = {}, opts = {}) {
  if (typeof fetchActiveIDs !== 'function') {
    throw new Error('proxyRegistry.reconcile: fetchActiveIDs is required');
  }
  const client = opts.client || getClient();
  const live = await listLiveProxies({ ...opts, client });
  const ids = await fetchActiveIDs();
  const { moved, version } = await rebalance(ids, live, { ...opts, client });
  if (moved > 0 && typeof onMoves === 'function') {
    await onMoves({ moved, version });
  }
  return { moved, version, proxies: live.length };
}

/**
 * Reconcile + best-effort ASSIGNMENTS_CHANGED announce on the global
 * control channel (fire-and-forget: version polling is the backstop, so a
 * slow/dead Redis must never block the caller).
 */
async function reconcileAndAnnounce({ fetchActiveIDs } = {}, opts = {}) {
  const publish = async ({ moved, version }) => {
    try {
      // eslint-disable-next-line global-require
      const { publishControl } = require('../../config/listenerBus.config');
      publishControl({ type: 'ASSIGNMENTS_CHANGED', version }).catch((err) => {
        Logger.log('warning', { message: 'proxyRegistry:announce:failed', params: { error: err.message } });
      });
    } catch (err) {
      Logger.log('warning', { message: 'proxyRegistry:announce:failed', params: { error: err.message } });
    }
  };
  return reconcile({ fetchActiveIDs, onMoves: publish }, opts);
}

module.exports = {
  // tuning (shared with proxy/sweeper phases)
  HEARTBEAT_INTERVAL_MS,
  NODE_TTL_SEC,
  SCAN_COUNT,
  // keys (shared with proxy/sweeper phases + tests)
  keyNode,
  keyShard,
  keyAssign,
  KEY_VERSION,
  // pure + IO
  hash32,
  buildRing,
  assignListeners,
  registerProxy,
  heartbeat,
  deregister,
  listLiveProxies,
  getShard,
  getVersion,
  readAssignments,
  rebalance,
  reconcile,
  reconcileAndAnnounce,
};
