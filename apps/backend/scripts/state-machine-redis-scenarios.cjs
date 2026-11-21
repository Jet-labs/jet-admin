/** Real Redis Lua/concurrency tests. Requires a NEW EMPTY disposable Redis.
 * Never selects a target from REDIS_URL or flushes a database; refuses a nonempty target.
 * Example: node scripts/state-machine-redis-scenarios.cjs redis://127.0.0.1:57820
 */
const assert = require('node:assert/strict');
const Redis = require('ioredis');
const registry = require('../modules/proxyRegistry/proxyRegistry.service');

async function main() {
  const url = process.argv[2];
  if (!/^redis:\/\/127\.0\.0\.1:\d+\/?$/.test(url || '')) throw new Error('Pass the random localhost URL of a NEW disposable Redis container');
  const clients = [];
  const open = async () => {
    const client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1, enableOfflineQueue: false });
    clients.push(client);
    await client.connect();
    return client;
  };
  const client = await open();
  try {
    if (await client.dbsize() !== 0) throw new Error('Refusing nonempty Redis: create a fresh disposable container');
    const peer = await open();
    const p1 = { proxyID: 'isolated-proxy-a' }, p2 = { proxyID: 'isolated-proxy-b' };
    await registry.registerProxy(p1, { client });
    await registry.registerProxy(p2, { client });
    const ids = Array.from({ length: 20 }, (_, index) => `isolated-listener-${index}`);
    const scenarios = [];

    // Hold both APPLY calls until each replica has read the same version and
    // assignments; Redis, not the harness, decides the atomic CAS winner.
    const waiting = [];
    const barrier = connection => new Proxy(connection, {
      get(target, key) {
        if (key === 'eval') return (...args) => {
          if (!args[0].includes('local moves =')) return target.eval(...args);
          return new Promise((resolve, reject) => {
            waiting.push({ target, args, resolve, reject });
            if (waiting.length === 2) for (const call of waiting) call.target.eval(...call.args).then(call.resolve, call.reject);
          });
        };
        const value = target[key];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    const raced = await Promise.all([
      registry.rebalance(ids, [p1], { client: barrier(client) }),
      registry.rebalance(ids, [p2], { client: barrier(peer) }),
    ]);
    assert.equal(raced.filter(result => result.conflict).length, 1);
    for (const id of ids) {
      const membershipCount = await client.sismember(registry.keyShard(p1.proxyID), id) + await client.sismember(registry.keyShard(p2.proxyID), id);
      assert.equal(membershipCount, 1);
    }
    scenarios.push('concurrent stale snapshots: one CAS winner, one conflict, exactly one shard per listener');

    const first = await registry.getAssignment(ids[0], { client });
    const owner = first.proxyID === p1.proxyID ? p1 : p2;
    const other = owner === p1 ? p2 : p1;
    await client.sadd(registry.keyShard(other.proxyID), ids[0]); // deliberate legacy corruption in this empty sandbox
    const repaired = await registry.rebalance(ids, [owner], { client });
    assert.equal(repaired.moved, 1);
    assert.equal(await client.sismember(registry.keyShard(other.proxyID), ids[0]), 0);
    scenarios.push('reconciliation removes a stray shard even when the assignment key already looks correct');

    const token = await registry.getAssignment(ids[0], { client });
    const publish = (proxy, assignmentToken, eventID) => registry.publishOwnedListenerEvent({
      proxyID: proxy.proxyID, assignmentToken, listenerID: ids[0], tenantID: 'isolated-tenant', eventID, rawEvent: { fixture: true },
    }, { client });
    await publish(owner, token.token, 'before-handoff');
    await registry.rebalance(ids, [other], { client });
    await assert.rejects(publish(owner, token.token, 'stale-owner'), /fence rejected/);
    const transferred = await registry.getAssignment(ids[0], { client });
    await publish(other, transferred.token, 'after-handoff');
    scenarios.push('handoff fences old-owner publication atomically with durable stream acceptance');

    await client.del(registry.keyNode(other.proxyID)); // simulate lease expiry on this disposable server
    await assert.rejects(publish(other, transferred.token, 'expired-lease'), /fence rejected/);
    await registry.registerProxy(other, { client });
    scenarios.push('an expired proxy lease rejects ingress even if its old assignment key still exists');

    let release, reached;
    const paused = new Promise(resolve => { reached = resolve; });
    const pauseClient = new Proxy(peer, { get(target, key) {
      if (key === 'eval') return (...args) => {
        if (!args[0].includes('local moves =')) return target.eval(...args);
        return new Promise((resolve, reject) => { release = () => target.eval(...args).then(resolve, reject); reached(); });
      };
      const value = target[key]; return typeof value === 'function' ? value.bind(target) : value;
    } });
    const stale = registry.rebalance(ids, [owner], { client: pauseClient });
    await paused;
    await registry.removeListener(ids[0], { client });
    release();
    assert.equal((await stale).conflict, true);
    assert.equal(await registry.getAssignment(ids[0], { client }), null);
    scenarios.push('atomic removal/version bump prevents a stale rebalance from resurrecting a removed listener');

    const orphan = 'deleted-listener-fixture';
    await client.sadd(registry.keyShard(other.proxyID), orphan);
    await client.set(registry.keyAssign(orphan), JSON.stringify({ proxyID: other.proxyID }));
    await registry.rebalance(ids.slice(1), [other], { client });
    assert.equal(await client.get(registry.keyAssign(orphan)), null);
    assert.equal(await client.sismember(registry.keyShard(other.proxyID), orphan), 0);
    scenarios.push('orphan shard membership and placement are cleaned when a listener is absent from the active set');

    console.log(JSON.stringify({ scope: 'Real isolated Redis; independent replica connections; no application data', passed: scenarios.length, scenarios }, null, 2));
  } finally {
    await Promise.allSettled(clients.map(connection => connection.quit()));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
