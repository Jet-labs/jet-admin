jest.mock('../../../config/prisma.config', () => ({ prisma: {
  $transaction: jest.fn(),
  tblWorkflowInstances: { updateMany: jest.fn(), findMany: jest.fn() },
  tblWorkflowDataCollectionRequests: { updateMany: jest.fn() },
} }));
jest.mock('../../../modules/workflow/temporal/client', () => ({ getTemporalClient: jest.fn() }));
const { prisma } = require('../../../config/prisma.config');
const { getTemporalClient } = require('../../../modules/workflow/temporal/client');
const { stateManager } = require('../../../modules/workflow/workflowEngine/stateManager');
const { reconcileWorkflowInstance } = require('../../../modules/workflow/temporal/service');

describe('Temporal-authoritative recovery and terminal state', () => {
  let describe;
  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(fn => fn(prisma));
    prisma.tblWorkflowInstances.updateMany.mockResolvedValue({ count: 1 });
    prisma.tblWorkflowDataCollectionRequests.updateMany.mockResolvedValue({ count: 1 });
    describe = jest.fn();
    getTemporalClient.mockResolvedValue({ workflow: { getHandle: () => ({ describe, result: async () => ({ _workflowStatus: 'COMPLETED', input: {} }) }) } });
  });
  test('old timer/HITL run stays running', async () => {
    describe.mockResolvedValue({ status: { name: 'RUNNING' } });
    await stateManager.markInstancesAsRecovered(['silent-run']);
    expect(prisma.tblWorkflowInstances.updateMany).not.toHaveBeenCalled();
  });
  test('unavailable Temporal never fabricates failure', async () => {
    describe.mockRejectedValue(new Error('connection refused'));
    expect(await reconcileWorkflowInstance({ instanceID: 'r' })).toEqual({ reconciled: false, unknown: true });
    expect(prisma.tblWorkflowInstances.updateMany).not.toHaveBeenCalled();
  });
  test.each([['TIMED_OUT', 'FAILED'], ['TERMINATED', 'CANCELLED'], ['CANCELED', 'CANCELLED'], ['COMPLETED', 'COMPLETED']])('%s converges DB to %s and closes open requests', async (name, status) => {
    describe.mockResolvedValue({ status: { name } });
    await reconcileWorkflowInstance({ instanceID: 'r' });
    expect(prisma.tblWorkflowInstances.updateMany.mock.calls[0][0]).toMatchObject({ where: { instanceID: 'r', status: { in: ['PENDING', 'RUNNING', 'SUSPENDED'] } }, data: { status } });
    expect(prisma.tblWorkflowDataCollectionRequests.updateMany).toHaveBeenCalled();
  });
  test('late completion cannot overwrite a terminal winner or close its accepted requests', async () => {
    prisma.tblWorkflowInstances.updateMany.mockResolvedValue({ count: 0 });
    expect(await stateManager.completeInstance('r', 'FAILED')).toBe(false);
    expect(prisma.tblWorkflowDataCollectionRequests.updateMany).not.toHaveBeenCalled();
  });
  test('rejects accidental nonterminal finalization', async () => {
    await expect(stateManager.completeInstance('r', 'RUNNING')).rejects.toThrow('Invalid terminal status');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test('Temporal COMPLETED can contain an explicit cancelled DSL result', async () => {
    describe.mockResolvedValue({ status: { name: 'COMPLETED' } });
    getTemporalClient.mockResolvedValue({ workflow: { getHandle: () => ({ describe, result: async () => ({ _workflowStatus: 'CANCELLED', _workflowOutput: 0, answer: 42 }) }) } });
    await reconcileWorkflowInstance({ instanceID: 'r' });
    expect(prisma.tblWorkflowInstances.updateMany.mock.calls[0][0].data).toMatchObject({ status: 'CANCELLED', finalContext: { answer: 42 }, workflowOutput: 0 });
  });
});
