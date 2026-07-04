/**
 * ListenerController Unit Tests
 * Tests request handling, response formatting, status codes, and error responses for listener endpoints.
 */

// Mock Listener Service
const mockListenerService = {
  getAllListeners: jest.fn(),
  getListenerByID: jest.fn(),
  createListener: jest.fn(),
  updateListener: jest.fn(),
  deleteListener: jest.fn(),
  cloneListener: jest.fn(),
  activateListener: jest.fn(),
  deactivateListener: jest.fn(),
  addAction: jest.fn(),
  updateAction: jest.fn(),
  deleteAction: jest.fn(),
  getConnectionStatus: jest.fn(),
};
jest.mock('../../../modules/listener/listener.service', () => ({
  listenerService: mockListenerService,
}));

// Mock expressUtils
jest.mock('../../../utils/express.utils', () => ({
  expressUtils: {
    sendResponse: jest.fn((res, success, data, error, statusCode = 200) => {
      res.status(statusCode).json({ success, ...data, error: error ? error.message : undefined });
      return res;
    }),
  },
}));

// Mock auth context utils
jest.mock('../../../utils/auth.context.utils', () => ({
  getServiceAuthContext: jest.fn().mockReturnValue({ userID: 'usr-1' }),
}));

const listenerController = require('../../../modules/listener/listener.controller');

describe('ListenerController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = global.testUtils.createMockRequest({
      params: { tenantID: 'tnt-1', listenerID: 'lst-1', actionID: 'act-1' },
      user: { userID: 'usr-1' },
      body: {},
      query: {},
    });
    res = global.testUtils.createMockResponse();
  });

  it('getAllListeners should return 200 with list of listeners', async () => {
    mockListenerService.getAllListeners.mockResolvedValue({
      listeners: [{ listenerID: 'lst-1' }],
      totalCount: 1,
      totalPages: 1,
      page: 1,
      pageSize: 10,
    });

    await listenerController.getAllListeners(req, res);

    expect(mockListenerService.getAllListeners).toHaveBeenCalledWith({
      tenantID: 'tnt-1',
      search: undefined,
      page: undefined,
      pageSize: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      listeners: [{ listenerID: 'lst-1' }],
      totalCount: 1,
    }));
  });

  it('getListenerByID should return listener when found', async () => {
    mockListenerService.getListenerByID.mockResolvedValue({ listenerID: 'lst-1', listenerTitle: 'Stream' });

    await listenerController.getListenerByID(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      listener: { listenerID: 'lst-1', listenerTitle: 'Stream' },
    }));
  });

  it('getListenerByID should return error response when listener is not found', async () => {
    mockListenerService.getListenerByID.mockResolvedValue(null);

    await listenerController.getListenerByID(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: 'Listener not found',
    }));
  });

  it('createListener should return 201 CREATED', async () => {
    req.body = { listenerTitle: 'New Listener', listenerType: 'websocket' };
    mockListenerService.createListener.mockResolvedValue({ listenerID: 'lst-new', listenerTitle: 'New Listener' });

    await listenerController.createListener(req, res);

    expect(mockListenerService.createListener).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      listener: { listenerID: 'lst-new', listenerTitle: 'New Listener' },
    }));
  });

  it('updateListener should handle update request', async () => {
    req.body = { listenerTitle: 'Updated' };
    mockListenerService.updateListener.mockResolvedValue({ listenerID: 'lst-1', listenerTitle: 'Updated' });

    await listenerController.updateListener(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      listener: { listenerID: 'lst-1', listenerTitle: 'Updated' },
    }));
  });

  it('deleteListener should handle deletion request', async () => {
    mockListenerService.deleteListener.mockResolvedValue({ listenerID: 'lst-1' });

    await listenerController.deleteListener(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Listener deleted successfully.',
    }));
  });

  it('cloneListener should handle cloning request', async () => {
    mockListenerService.cloneListener.mockResolvedValue({ listenerID: 'lst-2', listenerTitle: 'Stream (Copy)' });

    await listenerController.cloneListener(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      listener: { listenerID: 'lst-2', listenerTitle: 'Stream (Copy)' },
    }));
  });

  it('activateListener and deactivateListener should call service lifecycle handlers', async () => {
    mockListenerService.activateListener.mockResolvedValue({ listenerID: 'lst-1', status: 'active' });
    await listenerController.activateListener(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));

    mockListenerService.deactivateListener.mockResolvedValue({ listenerID: 'lst-1', status: 'inactive' });
    await listenerController.deactivateListener(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('addAction, updateAction, deleteAction should handle action endpoints', async () => {
    mockListenerService.addAction.mockResolvedValue({ actionID: 'act-1' });
    await listenerController.addAction(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));

    mockListenerService.updateAction.mockResolvedValue({ actionID: 'act-1' });
    await listenerController.updateAction(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));

    mockListenerService.deleteAction.mockResolvedValue({ actionID: 'act-1' });
    await listenerController.deleteAction(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('getConnectionStatus should return current active connections state', async () => {
    mockListenerService.getConnectionStatus.mockReturnValue({ 'lst-1': { state: 'running' } });

    await listenerController.getConnectionStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      status: { 'lst-1': { state: 'running' } },
    }));
  });
});
