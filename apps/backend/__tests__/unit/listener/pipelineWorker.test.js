/**
 * Pipeline Worker Unit Tests
 * Tests event queue processing, transforms, workflow/query dispatches, buffer retention, and app page events.
 */

// Mock dependencies
const mockRegisterWorker = jest.fn();
jest.mock('../../../config/queue.config', () => ({
  registerListenerEventWorker: (fn) => mockRegisterWorker(fn),
}));

const mockPrisma = {
  tblListeners: {
    update: jest.fn().mockReturnValue({ catch: jest.fn() }),
  },
  tblListenerEvents: {
    create: jest.fn().mockResolvedValue({ eventID: 'evt-1' }),
    findFirst: jest.fn().mockResolvedValue({ seqNo: 10 }),
    deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
  },
};
jest.mock('../../../config/prisma.config', () => ({
  prisma: mockPrisma,
}));

const mockEmit = jest.fn();
const mockSocketIO = {
  to: jest.fn().mockReturnValue({ emit: mockEmit }),
};
jest.mock('../../../config/socket.io', () => ({
  socketIO: mockSocketIO,
}));

const mockAuthorizedExecuteWorkflow = jest.fn().mockResolvedValue({ success: true });
const mockAuthorizedExecuteDataQuery = jest.fn().mockResolvedValue({ success: true });
jest.mock('../../../utils/authorizedProxy', () => ({
  authorizedExecuteWorkflow: (...args) => mockAuthorizedExecuteWorkflow(...args),
  authorizedExecuteDataQuery: (...args) => mockAuthorizedExecuteDataQuery(...args),
}));

const { startPipelineWorker } = require('../../../modules/listener/listenerEngine/pipelineWorker');

describe('PipelineWorker', () => {

  let processEventFn = null;

  beforeEach(async () => {
    jest.clearAllMocks();
    await startPipelineWorker();
    expect(mockRegisterWorker).toHaveBeenCalled();
    processEventFn = mockRegisterWorker.mock.calls[0][0];
  });

  it('should execute transform action and update event payload', async () => {
    const job = {
      listenerID: 'lst-100',
      tenantID: 'tnt-100',
      rawEvent: { price: 50, currency: 'usd' },
      actions: [
        {
          actionID: 'act-trans',
          actionType: 'transform',
          actionConfig: { script: 'return { ...event, total: event.price * 2 };' },
          isEnabled: true,
        },
        {
          actionID: 'act-buf',
          actionType: 'save_to_buffer',
          actionConfig: { bufferName: 'orders' },
          isEnabled: true,
        },
      ],
    };

    await processEventFn(job);

    expect(mockPrisma.tblListenerEvents.create).toHaveBeenCalledWith({
      data: {
        listenerID: 'lst-100',
        tenantID: 'tnt-100',
        bufferName: 'orders',
        eventData: { price: 50, currency: 'usd', total: 100 },
        eventMeta: null,
      },
    });

    expect(mockPrisma.tblListeners.update).toHaveBeenCalledWith({
      where: { listenerID: 'lst-100' },
      data: {
        lastEventAt: expect.any(Date),
        eventCount: { increment: 1 },
      },
    });
  });

  it('should abort pipeline on transformation error', async () => {
    const job = {
      listenerID: 'lst-100',
      tenantID: 'tnt-100',
      rawEvent: { a: 1 },
      actions: [
        {
          actionID: 'act-trans',
          actionType: 'transform',
          actionConfig: { script: 'return event.nonExistent.field;' },
          isEnabled: true,
        },
        {
          actionID: 'act-wf',
          actionType: 'trigger_workflow',
          actionConfig: { workflowID: 'wf-1' },
          isEnabled: true,
        },
      ],
    };

    await processEventFn(job);

    expect(mockAuthorizedExecuteWorkflow).not.toHaveBeenCalled();
    expect(mockPrisma.tblListeners.update).not.toHaveBeenCalled();
  });

  it('should drop event if transform returns null (event filtered out)', async () => {
    const job = {
      listenerID: 'lst-100',
      tenantID: 'tnt-100',
      rawEvent: { status: 'draft' },
      actions: [
        {
          actionID: 'act-trans',
          actionType: 'transform',
          actionConfig: { script: 'if (event.status === "draft") return null; return event;' },
          isEnabled: true,
        },
        {
          actionID: 'act-buf',
          actionType: 'save_to_buffer',
          actionConfig: { bufferName: 'events' },
          isEnabled: true,
        },
      ],
    };

    await processEventFn(job);

    expect(mockPrisma.tblListenerEvents.create).not.toHaveBeenCalled();
    expect(mockPrisma.tblListeners.update).not.toHaveBeenCalled();
  });

  it('should dispatch trigger_workflow action with template resolved input values', async () => {
    const job = {
      listenerID: 'lst-100',
      tenantID: 'tnt-100',
      rawEvent: { userId: 'usr-42', email: 'user@example.com' },
      actions: [
        {
          actionID: 'act-wf',
          actionType: 'trigger_workflow',
          actionConfig: {
            workflowID: 'wf-999',
            inputValues: {
              targetUser: '{{event.userId}}',
            },
          },
          isEnabled: true,
        },
      ],
    };

    await processEventFn(job);

    expect(mockAuthorizedExecuteWorkflow).toHaveBeenCalledWith({
      workflowID: 'wf-999',
      tenantID: 'tnt-100',
      inputValues: { targetUser: 'usr-42' },
      executionCtx: expect.objectContaining({ tenantID: 'tnt-100' }),
    });

    expect(mockPrisma.tblListeners.update).toHaveBeenCalled();
  });

  it('should dispatch trigger_query action with template resolved input values', async () => {
    const job = {
      listenerID: 'lst-100',
      tenantID: 'tnt-100',
      rawEvent: { queryFilter: 'active' },
      actions: [
        {
          actionID: 'act-query',
          actionType: 'trigger_query',
          actionConfig: {
            dataQueryID: 'dq-777',
            inputValues: { filter: '{{event.queryFilter}}' },
          },
          isEnabled: true,
        },
      ],
    };

    await processEventFn(job);

    expect(mockAuthorizedExecuteDataQuery).toHaveBeenCalledWith({
      dataQueryID: 'dq-777',
      inputValues: { filter: 'active' },
      executionCtx: expect.objectContaining({ tenantID: 'tnt-100' }),
    });
  });

  it('should dispatch push_to_app_page action to Socket.IO room', async () => {
    const job = {
      listenerID: 'lst-100',
      tenantID: 'tnt-100',
      rawEvent: { temperature: 36.6 },
      actions: [
        {
          actionID: 'act-app',
          actionType: 'push_to_app_page',
          actionConfig: {
            appPageID: 'page-123',
            channelName: 'sensor_data',
            mode: 'append',
            maxArrayLength: 50,
          },
          isEnabled: true,
        },
      ],
    };

    await processEventFn(job);

    expect(mockSocketIO.to).toHaveBeenCalledWith('listener:app_page:page-123');
    expect(mockEmit).toHaveBeenCalledWith('listener_event', {
      channelName: 'sensor_data',
      data: { temperature: 36.6 },
      mode: 'append',
      limit: 50,
      timestamp: expect.any(Number),
    });
  });

  it('should enforce retention policy cleanup on save_to_buffer', async () => {
    const job = {
      listenerID: 'lst-100',
      tenantID: 'tnt-100',
      rawEvent: { val: 1 },
      actions: [
        {
          actionID: 'act-buf',
          actionType: 'save_to_buffer',
          actionConfig: {
            bufferName: 'logs',
            retentionPolicy: 'count',
            maxEvents: 100,
          },
          isEnabled: true,
        },
      ],
    };

    await processEventFn(job);

    expect(mockPrisma.tblListenerEvents.create).toHaveBeenCalled();
    expect(mockPrisma.tblListenerEvents.findFirst).toHaveBeenCalledWith({
      where: { listenerID: 'lst-100', bufferName: 'logs' },
      orderBy: { seqNo: 'desc' },
      skip: 100,
      select: { seqNo: true },
    });
    expect(mockPrisma.tblListenerEvents.deleteMany).toHaveBeenCalledWith({
      where: {
        listenerID: 'lst-100',
        bufferName: 'logs',
        seqNo: { lte: 10 },
      },
    });
  });

});
