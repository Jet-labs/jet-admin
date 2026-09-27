/**
 * ProxyRegistry Service Unit Tests
 * Phase 1: Redis-backed proxy membership + deterministic shard assignment.
 * Redis is mocked — no live Redis needed.
 */

const mockRedisClient = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  mget: jest.fn().mockResolvedValue([]),
  smembers: jest.fn().mockResolvedValue([]),
  eval: jest.fn().mockResolvedValue(1),
  scan: jest.fn().mockResolvedValue(['0', []]),
};

jest.mock('../../../config/redis.config', () => ({
  getRedisClient: jest.fn(() => mockRedisClient),
  isClientReady: jest.fn(() => true),
  closeRedis: jest.fn().mockResolvedValue(undefined),
}));

const mockPublishControl = jest.fn().mockResolvedValue(1);
jest.mock('../../../config/listenerBus.config', () => ({
  publishControl: (...args) => mockPublishControl(...args),
}));

const registry = require('../../../modules/proxyRegistry/proxyRegistry.service');

const proxies3 = [{ proxyID: 'p-a' }, { proxyID: 'p-b' }, { proxyID: 'p-c' }];
const listeners = (n, prefix = 'lst') =>
  Array.from({ length: n }, (_, i) => `${prefix}-${String(i).padStart(3, '0')}`);

describe('proxyRegistry assignment (pure, deterministic)', () => {
  test('single proxy owns everything', () => {
    const ids = listeners(10);
    const assigned = registry.assignListeners(ids, [{ proxyID: 'only' }]);
    expect(Object.keys(assigned)).toHaveLength(10);
    expect(new Set(Object.values(assigned))).toEqual(new Set(['only']));
  });

  test('empty proxy set assigns nothing (default-deny)', () => {
    expect(registry.assignListeners(listeners(10), [])).toEqual({});
    expect(registry.assignListeners(listeners(10), null)).toEqual({});
    expect(registry.assignListeners([], proxies3)).toEqual({});
  });

  test('deterministic across runs and replicas', () => {
    const ids = listeners(200);
    const first = registry.assignListeners(ids, proxies3);
    const second = registry.assignListeners(
      [...ids].reverse(),
      [...proxies3].reverse()
    );
    expect(second).toEqual(first);
  });

  test('covers every listener exactly once across proxies', () => {
    const ids = listeners(300);
    const assigned = registry.assignListeners(ids, proxies3);
    expect(Object.keys(assigned).sort()).toEqual([...ids].sort());
    const owners = new Set(Object.values(assigned));
    expect(owners).toEqual(new Set(['p-a', 'p-b', 'p-c']));
  });

  test('membership change moves only ~1/k of listeners (stability)', () => {
    const ids = listeners(300);
    const before = registry.assignListeners(ids, proxies3);
    const after = registry.assignListeners(ids, [{ proxyID: 'p-a' }, { proxyID: 'p-b' }]);
    const moved = ids.filter((id) => before[id] !== after[id]).length;
    const fraction = moved / ids.length;
    expect(fraction).toBeGreaterThan(0.15);
    expect(fraction).toBeLessThan(0.55);
  });

  test('weight skews share toward heavier proxy', () => {
    const ids = listeners(500);
    const assigned = registry.assignListeners(ids, [
      { proxyID: 'light', weight: 100 },
      { proxyID: 'heavy', weight: 300 },
    ]);
    const heavy = ids.filter((id) => assigned[id] === 'heavy').length;
    const light = ids.filter((id) => assigned[id] === 'light').length;
    expect(heavy).toBeGreaterThan(light);
  });

  test('duplicate proxyIDs and listenerIDs are deduped', () => {
    const assigned = registry.assignListeners(
      ['l-1', 'l-1', 'l-2'],
      [{ proxyID: 'p' }, { proxyID: 'p' }]
    );
    expect(assigned).toEqual({ 'l-1': 'p', 'l-2': 'p' });
  });
});

describe('proxyRegistry redis interactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registerProxy validates proxyID and sets node key with TTL', async () => {
    await expect(registry.registerProxy({})).rejects.toThrow('proxyID is required');
    await registry.registerProxy(
      { proxyID: 'p-1', baseUrl: 'https://hooks.example.com', weight: 150, version: '1.2.3' },
      { nodeTtlSec: 45 }
    );
    expect(mockRedisClient.set).toHaveBeenCalledTimes(1);
    const [key, raw, mode, ttl] = mockRedisClient.set.mock.calls[0];
    expect(key).toBe('proxy:node:p-1');
    expect(mode).toBe('EX');
    expect(ttl).toBe(45);
    expect(JSON.parse(raw)).toMatchObject({
      baseUrl: 'https://hooks.example.com',
      weight: 150,
      version: '1.2.3',
      status: 'active',
    });
  });

  test('deregister removes the liveness key (shard left for rebalance)', async () => {
    mockRedisClient.del = jest.fn().mockResolvedValue(1);
    await expect(registry.deregister()).rejects.toThrow('proxyID is required');
    await registry.deregister('p-1');
    expect(mockRedisClient.del).toHaveBeenCalledWith('proxy:node:p-1');
  });

  test('heartbeat on unknown node asks caller to re-register (no auto-create)', async () => {
    mockRedisClient.get.mockResolvedValue(null);
    const res = await registry.heartbeat('ghost');
    expect(res).toEqual({ ok: false, known: false });
    expect(mockRedisClient.set).not.toHaveBeenCalled();
  });

  test('heartbeat on known node refreshes TTL', async () => {
    mockRedisClient.get.mockResolvedValue(
      JSON.stringify({ baseUrl: null, weight: 100, status: 'active', lastHeartbeatAt: 'old' })
    );
    const res = await registry.heartbeat('p-1', { nodeTtlSec: 45 });
    expect(res).toEqual({ ok: true, known: true });
    const [key, raw, mode, ttl] = mockRedisClient.set.mock.calls[0];
    expect(key).toBe('proxy:node:p-1');
    expect(mode).toBe('EX');
    expect(ttl).toBe(45);
    expect(JSON.parse(raw).lastHeartbeatAt).not.toBe('old');
  });

  test('listLiveProxies scans, parses, and skips corrupt entries', async () => {
    mockRedisClient.scan.mockResolvedValue([
      '0',
      ['proxy:node:p-1', 'proxy:node:p-2', 'proxy:node:p-3'],
    ]);
    mockRedisClient.mget.mockResolvedValue([
      JSON.stringify({ status: 'active' }),
      'not-json{{{',
      null,
    ]);
    const live = await registry.listLiveProxies();
    expect(mockRedisClient.scan).toHaveBeenCalledWith(
      '0',
      'MATCH',
      'proxy:node:*',
      'COUNT',
      expect.any(Number)
    );
    expect(live).toEqual([{ proxyID: 'p-1', status: 'active' }]);
  });

  test('getShard returns sorted unique members; getVersion defaults to 0', async () => {
    mockRedisClient.smembers.mockResolvedValue(['l-2', 'l-1', 'l-1']);
    await expect(registry.getShard('p-1')).resolves.toEqual(['l-1', 'l-2']);
    mockRedisClient.get.mockResolvedValue('7');
    await expect(registry.getVersion()).resolves.toBe(7);
    mockRedisClient.get.mockResolvedValue(null);
    await expect(registry.getVersion()).resolves.toBe(0);
  });

  test('rebalance with no drift does not touch Redis writes', async () => {
    const ids = ['l-1', 'l-2'];
    const desired = registry.assignListeners(ids, [{ proxyID: 'p-1' }]);
    mockRedisClient.mget.mockImplementation(async (...keys) =>
      keys.map((k) => {
        const id = k.replace('proxy:assign:', '');
        return JSON.stringify({ proxyID: desired[id] });
      })
    );
    mockRedisClient.get.mockResolvedValue('4');
    const res = await registry.rebalance(ids, [{ proxyID: 'p-1' }]);
    expect(res).toEqual({ moved: 0, moves: [], version: 4 });
    expect(mockRedisClient.eval).not.toHaveBeenCalled();
  });

  test('rebalance applies only the delta atomically via Lua', async () => {
    mockRedisClient.mget.mockResolvedValue([null, null]); // nothing assigned yet
    mockRedisClient.eval.mockResolvedValue(9);
    const res = await registry.rebalance(['l-1', 'l-2'], [{ proxyID: 'p-1' }]);
    expect(res.moved).toBe(2);
    expect(res.version).toBe(9);
    expect(mockRedisClient.eval).toHaveBeenCalledTimes(1);
    const [script, nkeys, payload] = mockRedisClient.eval.mock.calls[0];
    expect(typeof script).toBe('string');
    expect(script).toMatch('proxy:shard:');
    expect(nkeys).toBe(0);
    const moves = JSON.parse(payload);
    expect(moves).toHaveLength(2);
    for (const m of moves) {
      expect(m.to).toBe('p-1');
      expect(m).not.toHaveProperty('from'); // nulls stripped (cjson.null is truthy!)
    }
  });

  test('reconcile assigns drift and announces moves', async () => {
    mockRedisClient.scan.mockResolvedValue([
      '0',
      ['proxy:node:p-a', 'proxy:node:p-b'],
    ]);
    mockRedisClient.mget
      .mockResolvedValueOnce([
        JSON.stringify({ status: 'active', weight: 100 }),
        JSON.stringify({ status: 'active', weight: 100 }),
      ])
      .mockResolvedValueOnce([JSON.stringify({ proxyID: 'p-a' }), null]);
    mockRedisClient.eval.mockResolvedValue(6);
    const announced = [];
    const res = await registry.reconcile({
      fetchActiveIDs: async () => ['l-1', 'l-2'],
      onMoves: async (info) => { announced.push(info); },
    });
    expect(res.proxies).toBe(2);
    expect(res.version).toBe(6);
    expect(res.moved).toBeGreaterThan(0);
    expect(announced).toEqual([{ moved: res.moved, version: 6 }]);
  });

  test('reconcileAndAnnounce publishes ASSIGNMENTS_CHANGED only on moves', async () => {
    mockRedisClient.scan.mockResolvedValue(['0', ['proxy:node:p-a']]);
    mockRedisClient.mget
      .mockResolvedValueOnce([JSON.stringify({ status: 'active' })])
      .mockResolvedValueOnce([null]);
    mockRedisClient.eval.mockResolvedValue(7);
    await registry.reconcileAndAnnounce({ fetchActiveIDs: async () => ['l-1'] });
    expect(mockPublishControl).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ASSIGNMENTS_CHANGED', version: 7 })
    );

    jest.clearAllMocks();
    mockRedisClient.scan.mockResolvedValue(['0', []]);
    const quiet = await registry.reconcileAndAnnounce({ fetchActiveIDs: async () => [] });
    expect(quiet.moved).toBe(0);
    expect(mockPublishControl).not.toHaveBeenCalled();
  });

  test('reconcile requires fetchActiveIDs', async () => {
    await expect(registry.reconcile({})).rejects.toThrow('fetchActiveIDs is required');
  });

  test('rebalance to zero live proxies unassigns everything (default-deny)', async () => {
    mockRedisClient.mget.mockResolvedValue([
      JSON.stringify({ proxyID: 'p-dead' }),
      JSON.stringify({ proxyID: 'p-dead' }),
    ]);
    mockRedisClient.eval.mockResolvedValue(10);
    const res = await registry.rebalance(['l-1', 'l-2'], []);
    expect(res.moved).toBe(2);
    const [, , payload] = mockRedisClient.eval.mock.calls[0];
    const moves = JSON.parse(payload);
    expect(moves).toEqual([
      { listenerID: 'l-1', from: 'p-dead' },
      { listenerID: 'l-2', from: 'p-dead' },
    ]);
  });
});
