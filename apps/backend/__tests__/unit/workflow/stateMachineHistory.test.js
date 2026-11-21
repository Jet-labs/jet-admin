jest.mock('../../../config/prisma.config', () => ({ prisma: {
  $transaction: jest.fn(),
  tblWorkflowInstances: { create: jest.fn(), findUnique: jest.fn(), updateMany: jest.fn() },
  tblWorkflowInstanceLogs: { create: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
  tblWorkflowDataCollectionRequests: { updateMany: jest.fn() },
} }));
const { prisma } = require('../../../config/prisma.config');
const { stateManager } = require('../../../modules/workflow/workflowEngine/stateManager');

describe('ordered history and authoritative terminal snapshots', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(fn => fn(prisma));
    prisma.tblWorkflowInstances.findUnique.mockResolvedValue({ finalContext: null });
    prisma.tblWorkflowInstances.updateMany.mockResolvedValue({ count: 1 });
    prisma.tblWorkflowInstances.create.mockResolvedValue({ instanceID: 'r' });
    prisma.tblWorkflowInstanceLogs.findMany.mockResolvedValue([]);
  });
  test('folds by insertion sequence rather than random UUID', async () => {
    const rows = [
      { logID: 'ffffffff', eventSequence: 1n, payload: { value: 'old' } },
      { logID: '11111111', eventSequence: 2n, payload: { value: 'new' } },
    ];
    prisma.tblWorkflowInstanceLogs.findMany.mockImplementation(async ({ orderBy }) => {
      expect(orderBy).toEqual({ eventSequence: 'asc' });
      return rows;
    });
    expect(await stateManager.assembleContext('r')).toEqual({ value: 'new' });
  });
  test('an authoritative final snapshot ignores late activity deltas', async () => {
    prisma.tblWorkflowInstances.findUnique.mockResolvedValue({ finalContext: { output: 0, result: 'final' } });
    expect(await stateManager.assembleContext('r')).toEqual({ output: 0, result: 'final' });
    expect(prisma.tblWorkflowInstanceLogs.findMany).not.toHaveBeenCalled();
  });
  test('active projection restores the parent scope after loop-local values disappear', async () => {
    prisma.tblWorkflowInstances.findUnique.mockResolvedValue({ finalContext: null, contextProjection: { loopResults: [1, 2] } });
    expect(await stateManager.assembleContext('r')).toEqual({ loopResults: [1, 2] });
    expect(prisma.tblWorkflowInstanceLogs.findMany).not.toHaveBeenCalled();
  });
  test('append and projection commit atomically with a sequence guard against stale event retries', async () => {
    prisma.tblWorkflowInstanceLogs.upsert.mockResolvedValue({ eventSequence: 12n });
    await stateManager.logEvent({ instanceID: 'r', eventType: 'NODE_COMPLETED', eventKey: 'event', contextSnapshot: { latest: true } });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.tblWorkflowInstances.updateMany.mock.calls[0][0]).toMatchObject({
      where: { instanceID: 'r', OR: [{ projectionSequence: null }, { projectionSequence: { lt: 12n } }] },
      data: { contextProjection: { latest: true }, projectionSequence: 12n },
    });
  });
  test('retries upsert the same logical activity event instead of appending again', async () => {
    await stateManager.logEvent({ instanceID: 'r', eventType: 'NODE_COMPLETED', eventKey: 'run:activity:SUCCESS' });
    expect(prisma.tblWorkflowInstanceLogs.upsert.mock.calls[0][0]).toMatchObject({ where: { instanceID_eventKey: { instanceID: 'r', eventKey: 'run:activity:SUCCESS' } }, update: {} });
    expect(prisma.tblWorkflowInstanceLogs.create).not.toHaveBeenCalled();
  });
  test('terminal CAS, snapshot, error row and request cleanup share one transaction', async () => {
    await stateManager.completeInstance('r', 'FAILED', { contextData: { value: null }, workflowOutput: false, errorMessage: 'failed end' });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.tblWorkflowInstances.updateMany.mock.calls[0][0].data).toMatchObject({ status: 'FAILED', finalContext: { value: null }, workflowOutput: false });
    expect(prisma.tblWorkflowInstanceLogs.create.mock.calls[0][0].data).toMatchObject({ eventKey: 'terminal-error', errorMessage: 'failed end' });
    expect(prisma.tblWorkflowDataCollectionRequests.updateMany).toHaveBeenCalled();
  });
  test('creating the instance and its initial input is one atomic transaction', async () => {
    const result = await stateManager.createInstance({ workflowID: 'wf', tenantID: 't', inputValues: { amount: 3 } });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result.initialContext).toEqual({ input: { amount: 3 } });
    expect(prisma.tblWorkflowInstanceLogs.create.mock.calls[0][0].data.payload).toMatchObject(result.initialContext);
    expect(prisma.tblWorkflowInstanceLogs.create.mock.calls[0][0].data.payload.__contextSnapshot).toEqual(result.initialContext);
  });
  test('a rejected initial input write rejects the whole create transaction', async () => {
    prisma.tblWorkflowInstanceLogs.create.mockRejectedValue(new Error('durability unavailable'));
    await expect(stateManager.createInstance({ workflowID: 'wf', tenantID: 't' })).rejects.toThrow('durability unavailable');
  });
});
