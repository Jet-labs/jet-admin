jest.mock('../../../config/prisma.config', () => ({ prisma: {
  tblWorkflows: { findFirst: jest.fn() }, tblWorkflowNodes: { findMany: jest.fn() }, tblWorkflowEdge: { findMany: jest.fn() },
} }));
jest.mock('../../../modules/workflow/workflowEngine/stateManager', () => ({ stateManager: {
  createInstance: jest.fn(), completeInstance: jest.fn(), logEvent: jest.fn(), markInstanceStarted: jest.fn(), getInstanceForExecutionKey: jest.fn(),
} }));
jest.mock('../../../modules/workflow/temporal/client', () => ({ getTemporalClient: jest.fn() }));
const { prisma } = require('../../../config/prisma.config');
const { stateManager } = require('../../../modules/workflow/workflowEngine/stateManager');
const { getTemporalClient } = require('../../../modules/workflow/temporal/client');
const { startWorkflowTemporal, startTestWorkflowTemporal, cancelWorkflow } = require('../../../modules/workflow/temporal/service');

describe('start validation and ambiguous acknowledgements', () => {
  let start, describe, cancel;
  beforeEach(() => {
    jest.resetAllMocks();
    prisma.tblWorkflows.findFirst.mockResolvedValue({ workflowOptions: {} });
    prisma.tblWorkflowNodes.findMany.mockResolvedValue([{ nodeID: 's', nodeType: 'start' }]);
    prisma.tblWorkflowEdge.findMany.mockResolvedValue([]);
    stateManager.createInstance.mockResolvedValue({ instance: { instanceID: 'r' }, initialContext: { input: {} } });
    stateManager.completeInstance.mockResolvedValue(true);
    stateManager.markInstanceStarted.mockResolvedValue({ count: 1 });
    stateManager.logEvent.mockResolvedValue({});
    start = jest.fn().mockResolvedValue({ workflowId: 'r', firstExecutionRunId: 'run' });
    describe = jest.fn().mockResolvedValue({ status: { name: 'RUNNING' }, runId: 'accepted-run' });
    cancel = jest.fn();
    getTemporalClient.mockResolvedValue({ workflow: { start, getHandle: () => ({ describe, cancel }) } });
  });
  test('graph validation happens before allocating a running instance', async () => {
    prisma.tblWorkflowNodes.findMany.mockResolvedValue([]);
    await expect(startWorkflowTemporal({ workflowID: 'wf', tenantID: 't' })).rejects.toThrow('No start node');
    expect(stateManager.createInstance).not.toHaveBeenCalled();
  });
  test('graph is loaded only from the requested tenant', async () => {
    prisma.tblWorkflows.findFirst.mockResolvedValue(null);
    await expect(startWorkflowTemporal({ workflowID: 'foreign-wf', tenantID: 't' })).rejects.toThrow('not found in tenant');
    expect(prisma.tblWorkflows.findFirst.mock.calls[0][0].where).toEqual({ workflowID: 'foreign-wf', tenantID: 't' });
    expect(stateManager.createInstance).not.toHaveBeenCalled();
  });
  test('duplicate node IDs are rejected before instance allocation', async () => {
    prisma.tblWorkflowNodes.findMany.mockResolvedValue([{ nodeID: 'same', nodeType: 'start' }, { nodeID: 'same', nodeType: 'end' }]);
    await expect(startWorkflowTemporal({ workflowID: 'wf', tenantID: 't' })).rejects.toThrow('Duplicate workflow node');
    expect(stateManager.createInstance).not.toHaveBeenCalled();
  });
  test('accepted start with lost RPC reply is confirmed, not marked failed or started twice', async () => {
    start.mockRejectedValue(new Error('deadline exceeded after acceptance'));
    const result = await startWorkflowTemporal({ workflowID: 'wf', tenantID: 't' });
    expect(result).toMatchObject({ instanceID: 'r', runId: 'accepted-run' });
    expect(stateManager.completeInstance).not.toHaveBeenCalled();
    expect(start).toHaveBeenCalledTimes(1);
  });
  test('unconfirmed start retains unknown state instead of inventing terminal failure', async () => {
    start.mockRejectedValue(new Error('deadline exceeded'));
    describe.mockRejectedValue(new Error('Temporal unavailable'));
    await expect(startWorkflowTemporal({ workflowID: 'wf', tenantID: 't' })).rejects.toMatchObject({ startUncertain: true, instanceID: 'r' });
    expect(stateManager.completeInstance).not.toHaveBeenCalled();
  });
  test('definitively rejected start is finalized as failed', async () => {
    start.mockRejectedValue(new TypeError('invalid options'));
    describe.mockRejectedValue(new Error('not found'));
    await expect(startWorkflowTemporal({ workflowID: 'wf', tenantID: 't' })).rejects.toThrow('invalid options');
    expect(stateManager.completeInstance).toHaveBeenCalledWith('r', 'FAILED');
  });
  test('test metadata persistence failure does not leave a running test', async () => {
    stateManager.logEvent.mockRejectedValue(new Error('disk full'));
    await expect(startTestWorkflowTemporal({ nodes: [{ id: 's', type: 'start' }], edges: [], tenantID: 't' })).rejects.toThrow('disk full');
    expect(stateManager.completeInstance).toHaveBeenCalledWith('r', 'FAILED');
    expect(start).not.toHaveBeenCalled();
  });
  test('failed cancellation RPC propagates instead of falsely reporting success', async () => {
    cancel.mockRejectedValue(new Error('unavailable'));
    await expect(cancelWorkflow({ instanceID: 'r' })).rejects.toThrow('unavailable');
  });
});
