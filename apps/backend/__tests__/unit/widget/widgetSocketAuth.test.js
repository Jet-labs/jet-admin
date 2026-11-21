/**
 * H-001 regression: widget socket operations must be scoped to the
 * authenticated user's tenant and the socket that opened the connection.
 */
const mockGetUser = jest.fn();
jest.mock('../../../modules/auth/auth.service', () => ({
  authService: { getUserFromFirebaseID: (...args) => mockGetUser(...args) },
}));

const mockMembership = jest.fn();
jest.mock('../../../config/prisma.config', () => ({
  prisma: { tblUsersTenantsRelationship: { findFirst: (...args) => mockMembership(...args) } },
}));

const mockGetInstance = jest.fn();
const mockAssemble = jest.fn();
const mockLogEvent = jest.fn();
jest.mock('../../../modules/workflow/workflowEngine/stateManager', () => ({
  stateManager: {
    getInstance: (...args) => mockGetInstance(...args),
    assembleContext: (...args) => mockAssemble(...args),
    logEvent: (...args) => mockLogEvent(...args),
  },
}));

const mockRegister = jest.fn();
const mockGetConnection = jest.fn();
const mockGetInstanceForWidget = jest.fn();
jest.mock('../../../modules/widget/widgetWorkflowBridge', () => ({
  widgetWorkflowBridge: {
    registerWidget: (...args) => mockRegister(...args),
    getWidgetConnection: (...args) => mockGetConnection(...args),
    getInstanceForWidget: (...args) => mockGetInstanceForWidget(...args),
    unregisterWidget: jest.fn(),
  },
}));

jest.mock('../../../modules/workflow/workflow.service', () => ({ workflowService: {} }));

const { widgetSocketController } = require('../../../modules/widget/widget.socket.controller');

function makeSocket(id = 'sock-1') {
  return {
    id,
    handshake: { auth: { firebase_id: 'fb-1' } },
    emit: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
  };
}

describe('widget socket tenant authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ userID: 'user-1' });
  });

  test('rejects subscribe when the user is not a tenant member', async () => {
    mockMembership.mockResolvedValue(null);
    const socket = makeSocket();

    await widgetSocketController.onWidgetWorkflowConnect({
      socket, widgetID: 'w1', mode: 'subscribe', instanceID: 'inst-1',
      tenantID: 'tenant-1', firebaseID: 'fb-1',
    });

    expect(mockRegister).not.toHaveBeenCalled();
    expect(mockGetInstance).not.toHaveBeenCalled();
    expect(socket.emit).toHaveBeenCalledWith(
      'widget_workflow_error',
      expect.objectContaining({ error: expect.objectContaining({ message: 'Tenant access denied.' }) })
    );
  });

  test('rejects an instance that belongs to another tenant', async () => {
    mockMembership.mockResolvedValue({ tenantID: 'tenant-1', userID: 'user-1' });
    mockGetInstance.mockResolvedValue({ instanceID: 'inst-1', tenantID: 'tenant-2', status: 'COMPLETED' });
    const socket = makeSocket();

    await widgetSocketController.onWidgetWorkflowConnect({
      socket, widgetID: 'w1', mode: 'subscribe', instanceID: 'inst-1',
      tenantID: 'tenant-1', firebaseID: 'fb-1',
    });

    expect(mockRegister).not.toHaveBeenCalled();
    expect(socket.emit).toHaveBeenCalledWith(
      'widget_workflow_error',
      expect.objectContaining({ error: expect.objectContaining({ message: 'Workflow instance not found in tenant.' }) })
    );
  });

  test('subscribes when membership and instance tenant match', async () => {
    mockMembership.mockResolvedValue({ tenantID: 'tenant-1', userID: 'user-1' });
    mockGetInstance.mockResolvedValue({
      instanceID: 'inst-1', tenantID: 'tenant-1', workflowID: 'wf-1', status: 'RUNNING',
    });
    mockAssemble.mockResolvedValue({ input: {} });
    const socket = makeSocket();

    await widgetSocketController.onWidgetWorkflowConnect({
      socket, widgetID: 'w1', mode: 'subscribe', instanceID: 'inst-1',
      tenantID: 'tenant-1', firebaseID: 'fb-1',
    });

    expect(mockRegister).toHaveBeenCalledWith('w1', 'inst-1', socket, expect.objectContaining({
      tenantID: 'tenant-1', firebaseID: 'fb-1',
    }));
    expect(socket.emit).toHaveBeenCalledWith('widget_workflow_connected', expect.objectContaining({
      widgetID: 'w1', instanceID: 'inst-1', mode: 'subscribe',
    }));
  });

  test('rejects widget input from a different socket', async () => {
    mockGetConnection.mockReturnValue({ socketId: 'other-socket', instanceID: 'inst-1', tenantID: 'tenant-1' });
    const socket = makeSocket('sock-1');

    await widgetSocketController.onWidgetSendInput({
      socket, widgetID: 'w1', instanceID: 'inst-1', inputType: 'form_submit', data: { a: 1 },
    });

    expect(mockLogEvent).not.toHaveBeenCalled();
    expect(socket.emit).toHaveBeenCalledWith(
      'widget_workflow_error',
      expect.objectContaining({ error: expect.objectContaining({ message: 'Widget is not connected to this socket' }) })
    );
  });

  test('accepts widget input from the owning socket', async () => {
    mockGetConnection.mockReturnValue({ socketId: 'sock-1', instanceID: 'inst-1', tenantID: 'tenant-1' });
    mockGetInstance.mockResolvedValue({ instanceID: 'inst-1', tenantID: 'tenant-1' });
    const socket = makeSocket('sock-1');

    await widgetSocketController.onWidgetSendInput({
      socket, widgetID: 'w1', instanceID: 'inst-1', inputType: 'form_submit', data: { a: 1 },
    });

    expect(mockLogEvent).toHaveBeenCalledWith(expect.objectContaining({ instanceID: 'inst-1' }));
    expect(socket.emit).toHaveBeenCalledWith('widget_input_received', expect.objectContaining({
      widgetID: 'w1', instanceID: 'inst-1', success: true,
    }));
  });
});
