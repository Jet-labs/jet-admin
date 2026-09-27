/**
 * Listener Proxy shard-sync unit tests (Phase 2).
 * The proxy subscribes ONLY to its registry shard; global CRUD fan-out is
 * filtered by local ownership; assignment changes trigger re-sync.
 */

const mockEngine = {
  getStatus: jest.fn().mockReturnValue({}),
  restartOne: jest.fn().mockResolvedValue(true),
  stopOne: jest.fn().mockResolvedValue(true),
  startAll: jest.fn().mockResolvedValue(true),
  stopAll: jest.fn().mockResolvedValue(true),
};
jest.mock('../../../modules/listener/listenerEngine/engine', () => ({
  listenerEngine: mockEngine,
}));

const mockRegistry = {
  HEARTBEAT_INTERVAL_MS: 10000,
  registerProxy: jest.fn().mockResolvedValue({}),
  heartbeat: jest.fn().mockResolvedValue({ ok: true, known: true }),
  listLiveProxies: jest.fn().mockResolvedValue([]),
  getShard: jest.fn().mockResolvedValue([]),
  getVersion: jest.fn().mockResolvedValue(0),
  rebalance: jest.fn().mockResolvedValue({ moved: 0, moves: [], version: 1 }),
};
jest.mock('../../../modules/proxyRegistry/proxyRegistry.service', () => mockRegistry);

const mockPrismaFindMany = jest.fn().mockResolvedValue([]);
jest.mock('../../../config/prisma.config', () => ({
  prisma: { tblListeners: { findMany: mockPrismaFindMany } },
}));

const mockPublishControl = jest.fn().mockResolvedValue(1);
jest.mock('../../../config/listenerBus.config', () => ({
  publishControl: (...args) => mockPublishControl(...args),
}));

const proxyApp = require('../../../../listener-proxy');

describe('proxy shard sync (pure)', () => {
  test('fingerprintMembership is order-insensitive and empty-safe', () => {
    expect(proxyApp.fingerprintMembership([])).toBe('');
    expect(proxyApp.fingerprintMembership(null)).toBe('');
    expect(
      proxyApp.fingerprintMembership([{ proxyID: 'b' }, { proxyID: 'a' }])
    ).toBe(
      proxyApp.fingerprintMembership([{ proxyID: 'a' }, { proxyID: 'b' }])
    );
  });

  test('computeSyncActions stops non-shard and starts missing', () => {
    expect(proxyApp.computeSyncActions(['a', 'b', 'c'], ['b', 'd'])).toEqual({
      toStop: ['a', 'c'],
      toStart: ['d'],
    });
  });

  test('computeSyncActions with empty shard stops everything (default-deny)', () => {
    expect(proxyApp.computeSyncActions(['a', 'b'], [])).toEqual({
      toStop: ['a', 'b'],
      toStart: [],
    });
    expect(proxyApp.computeSyncActions([], [])).toEqual({ toStop: [], toStart: [] });
  });
});

describe('proxy control filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('LISTENER_RELOAD restarts only owned listeners', async () => {
    mockEngine.getStatus.mockReturnValue({ mine: {} });
    await proxyApp.handleControlMessage({ type: 'LISTENER_RELOAD', listenerID: 'mine' });
    expect(mockEngine.restartOne).toHaveBeenCalledWith('mine');
    jest.clearAllMocks();
    await proxyApp.handleControlMessage({ type: 'LISTENER_RELOAD', listenerID: 'theirs' });
    expect(mockEngine.restartOne).not.toHaveBeenCalled();
  });

  test('LISTENER_REMOVE stops only owned listeners', async () => {
    mockEngine.getStatus.mockReturnValue({ mine: {} });
    await proxyApp.handleControlMessage({ type: 'LISTENER_REMOVE', listenerID: 'mine' });
    expect(mockEngine.stopOne).toHaveBeenCalledWith('mine');
    jest.clearAllMocks();
    await proxyApp.handleControlMessage({ type: 'LISTENER_REMOVE', listenerID: 'theirs' });
    expect(mockEngine.stopOne).not.toHaveBeenCalled();
  });

  test('ASSIGNMENTS_CHANGED re-syncs to the registry shard', async () => {
    mockEngine.getStatus.mockReturnValue({});
    mockRegistry.getShard.mockResolvedValue(['new-1']);
    await proxyApp.handleControlMessage({ type: 'ASSIGNMENTS_CHANGED', version: 7 });
    expect(mockRegistry.getShard).toHaveBeenCalled();
    expect(mockEngine.restartOne).toHaveBeenCalledWith('new-1');
  });

  test('unknown control types are ignored without throwing', async () => {
    await expect(
      proxyApp.handleControlMessage({ type: 'SOMETHING_ELSE' })
    ).resolves.toBeUndefined();
    expect(mockEngine.restartOne).not.toHaveBeenCalled();
    expect(mockEngine.stopOne).not.toHaveBeenCalled();
  });
});

describe('proxy resync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('membership change triggers rebalance + announce + sync; repeat is a no-op', async () => {
    mockEngine.getStatus.mockReturnValue({});
    mockRegistry.listLiveProxies.mockResolvedValue([{ proxyID: 'solo' }]);
    mockRegistry.getVersion.mockResolvedValue(2);
    mockPrismaFindMany.mockResolvedValue([{ listenerID: 'l-1' }]);
    mockRegistry.rebalance.mockResolvedValue({ moved: 1, moves: [], version: 2 });
    mockRegistry.getShard.mockResolvedValue(['l-1']);

    const first = await proxyApp.resync('interval');
    expect(first.changed).toBe(true);
    expect(mockRegistry.rebalance).toHaveBeenCalled();
    expect(mockPublishControl).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ASSIGNMENTS_CHANGED', version: 2 })
    );
    expect(mockEngine.restartOne).toHaveBeenCalledWith('l-1');

    jest.clearAllMocks();
    const second = await proxyApp.resync('interval');
    expect(second.changed).toBe(false);
    expect(mockRegistry.rebalance).not.toHaveBeenCalled();
  });

  test('LISTENER_RELOAD_ALL forces a full resync', async () => {
    mockEngine.getStatus.mockReturnValue({});
    mockRegistry.listLiveProxies.mockResolvedValue([{ proxyID: 'solo' }]);
    mockPrismaFindMany.mockResolvedValue([]);
    mockRegistry.rebalance.mockResolvedValue({ moved: 0, moves: [], version: 2 });
    mockRegistry.getShard.mockResolvedValue([]);
    await proxyApp.handleControlMessage({ type: 'LISTENER_RELOAD_ALL' });
    expect(mockRegistry.rebalance).toHaveBeenCalled();
  });

  test('version bump without membership change syncs without rebalancing', async () => {
    // State left by previous tests: fp 'solo', version 1. A bump to 9 with
    // the same member set must re-fetch the shard but NOT rebalance.
    mockEngine.getStatus.mockReturnValue({});
    mockRegistry.listLiveProxies.mockResolvedValue([{ proxyID: 'solo' }]);
    mockRegistry.getVersion.mockResolvedValue(9);
    mockRegistry.getShard.mockResolvedValue([]);
    const res = await proxyApp.resync('interval');
    expect(res.changed).toBe(true);
    expect(mockRegistry.rebalance).not.toHaveBeenCalled();
    expect(mockRegistry.getShard).toHaveBeenCalled();
  });

  test('periodic full pass rebalances with no membership/version change', async () => {
    mockEngine.getStatus.mockReturnValue({});
    mockRegistry.listLiveProxies.mockResolvedValue([{ proxyID: 'solo' }]);
    mockRegistry.getVersion.mockResolvedValue(9);
    mockPrismaFindMany.mockResolvedValue([]);
    mockRegistry.rebalance.mockResolvedValue({ moved: 0, moves: [], version: 9 });
    mockRegistry.getShard.mockResolvedValue([]);
    const realNow = Date.now;
    try {
      Date.now = () => realNow() + proxyApp.FULL_RESYNC_INTERVAL_MS + 1000;
      const res = await proxyApp.resync('interval');
      expect(res.changed).toBe(true);
      expect(mockRegistry.rebalance).toHaveBeenCalled();
    } finally {
      Date.now = realNow;
    }
  });

  test('unknown heartbeat triggers re-registration', async () => {
    mockRegistry.heartbeat.mockResolvedValueOnce({ ok: false, known: false });
    mockRegistry.listLiveProxies.mockResolvedValue([{ proxyID: 'solo' }]);
    mockPrismaFindMany.mockResolvedValue([]);
    mockRegistry.rebalance.mockResolvedValue({ moved: 0, moves: [], version: 1 });
    mockRegistry.getShard.mockResolvedValue([]);
    await proxyApp.resync('boot');
    expect(mockRegistry.registerProxy).toHaveBeenCalledWith(
      expect.objectContaining({ proxyID: proxyApp.proxyID })
    );
  });
});
