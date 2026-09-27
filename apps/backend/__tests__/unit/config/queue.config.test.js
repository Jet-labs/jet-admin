/**
 * queue.config listener events (Redis Streams driver).
 * Redis + bus are mocked — no live Redis needed. The consumer loop's
 * BLOCK read is simulated with a short delayed `null` so the loop idles
 * without spinning.
 */

process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const mockXadd = jest.fn().mockResolvedValue('1-0');
const mockXack = jest.fn().mockResolvedValue(1);
const mockXgroup = jest.fn().mockResolvedValue('OK');
const mockPing = jest.fn().mockResolvedValue('PONG');
const mockPublish = jest.fn().mockResolvedValue(1);
// Idle BLOCK read: resolves null after a tick (loop continues, no busy spin).
const mockXreadgroup = jest.fn(
  () => new Promise((resolve) => setTimeout(() => resolve(null), 25))
);
const mockClient = {
  xadd: mockXadd,
  xack: mockXack,
  xgroup: mockXgroup,
  ping: mockPing,
  publish: mockPublish,
  xreadgroup: mockXreadgroup,
};

jest.mock('../../../config/redis.config', () => ({
  getRedisClient: jest.fn(() => mockClient),
  isClientReady: jest.fn(() => true),
  closeRedis: jest.fn().mockResolvedValue(undefined),
}));

const mockEnsureConsumerGroup = jest.fn().mockResolvedValue(undefined);
const mockPublishListenerEvent = jest.fn().mockImplementation(
  async ({ listenerID, tenantID, rawEvent, eventID }) => ({
    eventID,
    listenerID,
    tenantID,
    rawEvent,
    enqueuedAt: Date.now(),
  })
);
jest.mock('../../../config/listenerBus.config', () => ({
  getBusConfig: () => ({
    stream: 'listener:events',
    group: 'listener-workers',
    dlqStream: 'listener:events:dlq',
    controlChannel: 'listener:control',
    prefetch: 20,
    maxLen: 10000,
  }),
  ensureConsumerGroup: (...args) => mockEnsureConsumerGroup(...args),
  publishListenerEvent: (...args) => mockPublishListenerEvent(...args),
  // Same contract as the real parseStreamMessage (single `data` field, JSON).
  parseStreamMessage: (msgId, fields) => {
    let data = null;
    for (let i = 0; i < fields.length; i += 2) {
      if (fields[i] === 'data') { data = fields[i + 1]; break; }
    }
    if (!data) throw new Error('stream message missing data field');
    const envelope = JSON.parse(data);
    if (!envelope || !envelope.listenerID) throw new Error('stream envelope missing listenerID');
    return { id: msgId, envelope };
  },
  moveToDlq: jest.fn().mockResolvedValue(undefined),
}));

const {
  initializeQueue,
  closeQueue,
  addListenerEvent,
  registerListenerEventWorker,
  isConnectionHealthy,
} = require('../../../config/queue.config');

describe('queue.config listener events (redis driver)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await closeQueue();
  });

  it('ensures the consumer group on initialize and reports healthy', async () => {
    await initializeQueue();
    expect(mockEnsureConsumerGroup).toHaveBeenCalled();
    expect(isConnectionHealthy()).toBe(true);
  });

  it('publishes listener events as durable envelopes', async () => {
    await addListenerEvent({
      listenerID: 'lst-1',
      tenantID: 'tnt-1',
      rawEvent: { id: 'evt-1' },
    });

    expect(mockPublishListenerEvent).toHaveBeenCalledTimes(1);
    expect(mockPublishListenerEvent.mock.calls[0][0]).toMatchObject({
      listenerID: 'lst-1',
      tenantID: 'tnt-1',
      rawEvent: { id: 'evt-1' },
    });
    expect(mockPublishListenerEvent.mock.calls[0][0].eventID).toBeTruthy();
  });

  it('delivers stream messages to the registered worker and ACKs them', async () => {
    const envelope = {
      eventID: 'evt-9',
      listenerID: 'lst-9',
      tenantID: 'tnt-9',
      rawEvent: { id: 'evt-9' },
      enqueuedAt: Date.now(),
    };
    mockXreadgroup.mockResolvedValueOnce([
      ['listener:events', [['1-42', ['data', JSON.stringify(envelope)]]]],
    ]);

    const received = [];
    await initializeQueue();
    registerListenerEventWorker(async (job) => {
      received.push(job);
    });

    const startedAt = Date.now();
    while (received.length === 0 && Date.now() - startedAt < 2000) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      eventID: 'evt-9',
      listenerID: 'lst-9',
      rawEvent: { id: 'evt-9' },
    });
    expect(mockXack).toHaveBeenCalledWith(
      'listener:events',
      'listener-workers',
      '1-42'
    );
  });

  it('throws on initialize when REDIS_URL is missing', async () => {
    const saved = process.env.REDIS_URL;
    delete process.env.REDIS_URL;
    jest.resetModules();
    try {
      const fresh = require('../../../config/queue.config');
      await expect(fresh.initializeQueue()).rejects.toThrow(
        'REDIS_URL is required'
      );
    } finally {
      process.env.REDIS_URL = saved;
    }
  });
});
