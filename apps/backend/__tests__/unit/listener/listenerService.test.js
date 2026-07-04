/**
 * ListenerService Unit Tests
 * Tests CRUD operations for listeners and actions, cloning, hot reload integration, and permission policy handling.
 */

// Mock Prisma
const mockPrisma = {
  tblListeners: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  tblListenerActions: {
    create: jest.fn(),
    createMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrisma)),
};
jest.mock('../../../config/prisma.config', () => ({
  prisma: mockPrisma,
}));

// Mock Listener Engine
const mockListenerEngine = {
  startOne: jest.fn().mockResolvedValue(true),
  stopOne: jest.fn().mockResolvedValue(true),
  restartOne: jest.fn().mockResolvedValue(true),
  startAll: jest.fn().mockResolvedValue(true),
  stopAll: jest.fn().mockResolvedValue(true),
  getStatus: jest.fn().mockReturnValue({ 'lst-1': { state: 'running' } }),
};
jest.mock('../../../modules/listener/listenerEngine/engine', () => ({
  listenerEngine: mockListenerEngine,
}));

// Mock Casbin
const mockGrantCreatorAccess = jest.fn().mockResolvedValue(true);
const mockRemovePoliciesForResource = jest.fn().mockResolvedValue(true);
jest.mock('../../../config/casbin.config', () => ({
  grantCreatorAccess: (...args) => mockGrantCreatorAccess(...args),
  removePoliciesForResource: (...args) => mockRemovePoliciesForResource(...args),
}));

// Mock Auth Context Utils
jest.mock('../../../utils/auth.context.utils', () => ({
  getCreationContextFromAuthContext: jest.fn().mockImplementation((authCtx) => ({ creatorID: 'usr-001', createdByApiKeyID: null })),
}));

const { listenerService } = require('../../../modules/listener/listener.service');

describe('ListenerService', () => {

  const tenantID = 'tnt-001';
  const userID = 'usr-001';
  const sampleListener = {
    listenerID: 'lst-100',
    tenantID,
    listenerTitle: 'Webhook Ingest',
    listenerType: 'webhook',
    status: 'inactive',
    tblListenerActions: [
      { actionID: 'act-1', actionType: 'transform', actionConfig: { script: 'return event;' }, orderIndex: 0 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all listeners with pagination and extract transformScript', async () => {
    mockPrisma.tblListeners.findMany.mockResolvedValue([sampleListener]);
    mockPrisma.tblListeners.count.mockResolvedValue(1);

    const result = await listenerService.getAllListeners({ tenantID, page: 1, pageSize: 10 });

    expect(result.listeners.length).toBe(1);
    expect(result.listeners[0].transformScript).toBe('return event;');
    expect(result.totalCount).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('should fetch listener by ID', async () => {
    mockPrisma.tblListeners.findFirst.mockResolvedValue(sampleListener);

    const listener = await listenerService.getListenerByID({ tenantID, listenerID: 'lst-100' });

    expect(listener).toBeDefined();
    expect(listener.listenerID).toBe('lst-100');
    expect(listener.transformScript).toBe('return event;');
  });

  it('should create listener and grant creator access in Casbin', async () => {
    const data = {
      datasourceID: 'ds-100',
      listenerTitle: 'MQTT Stream',
      listenerType: 'mqtt',
      listenerConfig: { topics: 'sensors/+' },
      status: 'active',
      transformScript: 'return event;',
    };

    const createdListener = {
      listenerID: 'lst-200',
      tenantID,
      ...data,
      tblListenerActions: [],
    };

    mockPrisma.tblListeners.create.mockResolvedValue(createdListener);
    mockPrisma.tblListenerActions.create.mockResolvedValue({
      actionID: 'act-new',
      actionType: 'transform',
      actionConfig: { script: 'return event;' },
      orderIndex: 0,
      isEnabled: true,
    });

    const result = await listenerService.createListener({ tenantID, userID, data, authContext: {} });

    expect(mockPrisma.tblListeners.create).toHaveBeenCalled();
    expect(mockGrantCreatorAccess).toHaveBeenCalledWith(tenantID, 'listener', 'lst-200', {}, userID);
    expect(mockListenerEngine.startOne).toHaveBeenCalledWith(result);
  });

  it('should update listener and trigger hot reload if active', async () => {
    const existing = { ...sampleListener, status: 'active' };
    mockPrisma.tblListeners.findFirst.mockResolvedValue(existing);

    const updatedListener = { ...existing, listenerTitle: 'Updated Stream' };
    mockPrisma.tblListeners.update.mockResolvedValue(updatedListener);

    const result = await listenerService.updateListener({
      tenantID,
      listenerID: 'lst-100',
      data: { listenerTitle: 'Updated Stream' },
    });

    expect(result.listenerTitle).toBe('Updated Stream');
    expect(mockListenerEngine.restartOne).toHaveBeenCalledWith('lst-100');
  });

  it('should stop listener and remove Casbin policies on deleteListener', async () => {
    mockPrisma.tblListeners.findFirst.mockResolvedValue(sampleListener);
    mockPrisma.tblListeners.delete.mockResolvedValue(sampleListener);

    const result = await listenerService.deleteListener({ tenantID, listenerID: 'lst-100' });

    expect(mockListenerEngine.stopOne).toHaveBeenCalledWith('lst-100');
    expect(mockPrisma.tblListeners.delete).toHaveBeenCalledWith({ where: { listenerID: 'lst-100' } });
    expect(mockRemovePoliciesForResource).toHaveBeenCalledWith(tenantID, 'listener:lst-100');
    expect(result).toEqual({ listenerID: 'lst-100' });
  });

  it('should clone listener and its actions', async () => {
    mockPrisma.tblListeners.findFirst.mockResolvedValue(sampleListener);
    const cloned = { ...sampleListener, listenerID: 'lst-cloned', listenerTitle: 'Webhook Ingest (Copy)' };
    mockPrisma.tblListeners.create.mockResolvedValue(cloned);

    const result = await listenerService.cloneListener({ tenantID, listenerID: 'lst-100', userID, authContext: {} });

    expect(mockPrisma.tblListeners.create).toHaveBeenCalled();
    expect(mockPrisma.tblListenerActions.createMany).toHaveBeenCalled();
    expect(mockGrantCreatorAccess).toHaveBeenCalledWith(tenantID, 'listener', 'lst-cloned', {}, userID);
    expect(result.listenerTitle).toBe('Webhook Ingest (Copy)');
  });

  it('should add listener action and restart active listener engine', async () => {
    mockPrisma.tblListeners.findFirst.mockResolvedValue({ ...sampleListener, status: 'active' });
    const newAction = { actionID: 'act-2', actionType: 'save_to_buffer', actionConfig: { bufferName: 'default' } };
    mockPrisma.tblListenerActions.create.mockResolvedValue(newAction);

    const action = await listenerService.addAction({
      tenantID,
      listenerID: 'lst-100',
      data: { actionType: 'save_to_buffer', actionConfig: { bufferName: 'default' } },
    });

    expect(action.actionID).toBe('act-2');
    expect(mockListenerEngine.restartOne).toHaveBeenCalledWith('lst-100');
  });

  it('should update listener action and delete action', async () => {
    mockPrisma.tblListeners.findFirst.mockResolvedValue({ ...sampleListener, status: 'active' });
    mockPrisma.tblListenerActions.findFirst.mockResolvedValue({ actionID: 'act-1', listenerID: 'lst-100' });
    mockPrisma.tblListenerActions.update.mockResolvedValue({ actionID: 'act-1', isEnabled: false });

    await listenerService.updateAction({
      tenantID,
      listenerID: 'lst-100',
      actionID: 'act-1',
      data: { isEnabled: false },
    });

    expect(mockListenerEngine.restartOne).toHaveBeenCalledWith('lst-100');

    await listenerService.deleteAction({ tenantID, listenerID: 'lst-100', actionID: 'act-1' });
    expect(mockPrisma.tblListenerActions.delete).toHaveBeenCalledWith({ where: { actionID: 'act-1' } });
  });

  it('should activate and deactivate listener', async () => {
    mockPrisma.tblListeners.findFirst.mockResolvedValue(sampleListener);
    mockPrisma.tblListeners.update.mockResolvedValue({ ...sampleListener, status: 'active' });

    await listenerService.activateListener({ tenantID, listenerID: 'lst-100' });
    expect(mockPrisma.tblListeners.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'active' }),
    }));

    mockPrisma.tblListeners.update.mockResolvedValue({ ...sampleListener, status: 'inactive' });
    await listenerService.deactivateListener({ tenantID, listenerID: 'lst-100' });
    expect(mockListenerEngine.stopOne).toHaveBeenCalledWith('lst-100');
  });

});
