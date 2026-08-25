/**
 * ListenerEngine Unit Tests
 * Tests connection management, hot reload, reconnect backoff, health check, and event streaming.
 */

// Mock Prisma
const mockPrisma = {
  tblListeners: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
  },
};
jest.mock('../../../config/prisma.config', () => ({
  prisma: mockPrisma,
}));

// Mock Queue Config
const mockAddListenerEvent = jest.fn().mockResolvedValue(true);
jest.mock('../../../config/queue.config', () => ({
  addListenerEvent: mockAddListenerEvent,
}));

// Mock Socket.IO
const mockEmit = jest.fn();
const mockSocketIO = {
  sockets: {
    adapter: {
      rooms: new Map(),
    },
  },
  to: jest.fn().mockReturnValue({ emit: mockEmit }),
};
jest.mock('../../../config/socket.io', () => ({
  socketIO: mockSocketIO,
}));

// Mock Vault Service
jest.mock('../../../modules/vault/vault.service', () => ({
  vaultService: {
    getCredential: jest.fn().mockResolvedValue({ username: 'vaultUser' }),
    getGoogleClientConfig: jest.fn().mockReturnValue({ clientId: 'cid', clientSecret: 'cs' }),
  },
}));

// Mock DataSource instance & DataSourceRegistry
const mockUnsubscribe = jest.fn().mockResolvedValue(true);
const mockSubscribeHandle = { id: 'handle-1' };
let mockSubscribeCallback = null;

class MockDataSource {
  constructor(config, helpers) {
    this.config = config;
    this.helpers = helpers;
  }
  async subscribe(config, onEvent) {
    mockSubscribeCallback = onEvent;
    return mockSubscribeHandle;
  }
  async unsubscribe(handle) {
    return mockUnsubscribe(handle);
  }
  async healthCheck() {
    return true;
  }
}

jest.mock('@jet-admin/datasources-logic', () => ({
  dataSourceRegistry: {
    getDataSource: jest.fn().mockReturnValue(MockDataSource),
  },
}));

const { listenerEngine } = require('../../../modules/listener/listenerEngine/engine');

describe('ListenerEngine', () => {

  const sampleListener = {
    listenerID: 'lst-001',
    tenantID: 'tnt-001',
    listenerTitle: 'Order Stream',
    listenerType: 'websocket',
    listenerConfig: { topic: 'orders' },
    status: 'active',
    tblDatasources: {
      datasourceID: 'ds-001',
      datasourceType: 'websocket',
      datasourceOptions: { endpoint: 'ws://localhost:8080' },
    },
    tblListenerActions: [
      {
        actionID: 'act-1',
        actionType: 'transform',
        actionConfig: { script: 'return { ...event, tagged: true };' },
        isEnabled: true,
        orderIndex: 0,
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Stop all active listeners in engine before each test
    await listenerEngine.stopAll();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start all active listeners on startAll()', async () => {
    mockPrisma.tblListeners.findMany.mockResolvedValue([sampleListener]);

    await listenerEngine.startAll();

    expect(mockPrisma.tblListeners.findMany).toHaveBeenCalledWith({
      where: { status: 'active' },
      include: {
        tblDatasources: true,
        tblListenerActions: {
          where: { isEnabled: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    expect(listenerEngine.active.has('lst-001')).toBe(true);
    expect(listenerEngine.getStatus()['lst-001']).toEqual({
      state: 'running',
      type: 'websocket',
      retryCount: 0,
      title: 'Order Stream',
    });
  });

  it('should not double-start an already active listener', async () => {
    mockPrisma.tblListeners.findMany.mockResolvedValue([sampleListener]);

    await listenerEngine.startOne(sampleListener);
    expect(listenerEngine.active.size).toBe(1);

    // Call startOne again
    await listenerEngine.startOne(sampleListener);
    expect(listenerEngine.active.size).toBe(1);
  });

  it('should process incoming events and push to pipeline queue', async () => {
    await listenerEngine.startOne(sampleListener);

    expect(mockSubscribeCallback).toBeDefined();

    // Trigger raw event from datasource
    const rawEvent = { id: 'evt-1', amount: 100 };
    await mockSubscribeCallback(rawEvent);

    expect(mockAddListenerEvent).toHaveBeenCalledWith({
      listenerID: 'lst-001',
      tenantID: 'tnt-001',
      rawEvent,
      actions: sampleListener.tblListenerActions,
    });
  });

  it('should stream test events to Socket.IO room if clients are listening in test room', async () => {
    await listenerEngine.startOne(sampleListener);

    // Mock active room in socketIO
    const testRoomName = 'listener_test:lst-001';
    mockSocketIO.sockets.adapter.rooms.set(testRoomName, new Set(['socket-client-1']));

    const rawEvent = { id: 'evt-99', value: 42 };
    await mockSubscribeCallback(rawEvent);

    expect(mockSocketIO.to).toHaveBeenCalledWith(testRoomName);
    expect(mockEmit).toHaveBeenCalledWith('listener_test_event', {
      listenerID: 'lst-001',
      rawEvent,
      transformedEvent: { id: 'evt-99', value: 42, tagged: true },
      transformError: null,
      timestamp: expect.any(Number),
    });

    mockSocketIO.sockets.adapter.rooms.clear();
  });

  it('should stop a single listener on stopOne()', async () => {
    await listenerEngine.startOne(sampleListener);
    expect(listenerEngine.active.has('lst-001')).toBe(true);

    await listenerEngine.stopOne('lst-001');

    expect(mockUnsubscribe).toHaveBeenCalledWith(mockSubscribeHandle);
    expect(listenerEngine.active.has('lst-001')).toBe(false);
  });

  it('should restart listener on restartOne()', async () => {
    await listenerEngine.startOne(sampleListener);
    mockPrisma.tblListeners.findUnique.mockResolvedValue(sampleListener);

    await listenerEngine.restartOne('lst-001');

    expect(mockUnsubscribe).toHaveBeenCalled();
    expect(listenerEngine.active.has('lst-001')).toBe(true);
  });

  it('should handle disconnects with exponential backoff and max retries', async () => {
    await listenerEngine.startOne(sampleListener);

    // Simulate exceeding max retries (MAX_RETRIES is 10, so 11 disconnect triggers exceed limit)
    for (let i = 0; i < 11; i++) {
      await listenerEngine._handleDisconnect('lst-001', new Error('Connection lost'));
    }

    expect(listenerEngine.active.has('lst-001')).toBe(false);
    expect(mockPrisma.tblListeners.update).toHaveBeenCalledWith({
      where: { listenerID: 'lst-001' },
      data: {
        status: 'error',
        lastError: expect.stringContaining('Max retries exceeded'),
      },
    });
  });

  it('should perform health checks and handle unhealthy instances', async () => {
    await listenerEngine.startOne(sampleListener);

    // Mock unhealthy health check
    const entry = listenerEngine.active.get('lst-001');
    entry.instance.healthCheck = jest.fn().mockRejectedValue(new Error('Health check failed'));

    listenerEngine._healthCheck();

    // Allow promise rejection microtasks to flush
    await Promise.resolve();

    expect(entry.state).toBe('reconnecting');
    expect(entry.retryCount).toBe(1);
  });

});
