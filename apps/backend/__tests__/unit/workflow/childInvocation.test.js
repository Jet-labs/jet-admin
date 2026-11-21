const mockWorkflowsFindFirst = jest.fn();
const mockNodesFindMany = jest.fn();
const mockEdgesFindMany = jest.fn();
const mockInstancesFindUnique = jest.fn();
const mockCreateInstance = jest.fn();
const mockGetInstance = jest.fn();
const mockCompleteInstance = jest.fn().mockResolvedValue(true);

jest.mock('../../../config/prisma.config', () => ({
  prisma: {
    tblWorkflows: { findFirst: mockWorkflowsFindFirst },
    tblWorkflowNodes: { findMany: mockNodesFindMany },
    tblWorkflowEdge: { findMany: mockEdgesFindMany },
    tblWorkflowInstances: { findUnique: mockInstancesFindUnique },
  },
}));
jest.mock('../../../modules/workflow/workflowEngine/stateManager', () => ({
  stateManager: {
    createInstance: mockCreateInstance,
    getInstance: mockGetInstance,
    completeInstance: mockCompleteInstance,
    markInstanceStarted: jest.fn().mockResolvedValue({ count: 1 }),
  },
}));
jest.mock('../../../modules/workflow/temporal/client', () => ({
  getTemporalClient: jest.fn(),
}));

const { getTemporalClient } = require('../../../modules/workflow/temporal/client');
const { runSubWorkflowAndWait } = require('../../../modules/workflow/temporal/service');

describe('sub-workflow stable invocation identity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWorkflowsFindFirst.mockResolvedValue({ workflowID: 'child-wf', title: 'Child' });
    mockNodesFindMany.mockResolvedValue([{ nodeID: 's', nodeType: 'start', nodeConfig: {} }]);
    mockEdgesFindMany.mockResolvedValue([]);
    mockInstancesFindUnique.mockResolvedValue({ workflowID: 'parent-wf' });
    mockCompleteInstance.mockResolvedValue(true);
  });

  test('a retried activity resumes the same child instead of allocating a duplicate', async () => {
    // createInstance is an upsert keyed by (tenantID, executionKey).
    const instance = { instanceID: 'child-instance-1' };
    const instanceByKey = new Map();
    mockCreateInstance.mockImplementation(async ({ executionKey }) => {
      if (executionKey && instanceByKey.has(executionKey)) {
        return { instance: instanceByKey.get(executionKey), initialContext: { input: { amount: 1 } } };
      }
      if (executionKey) instanceByKey.set(executionKey, instance);
      return { instance, initialContext: { input: { amount: 1 } } };
    });

    const start = jest.fn().mockResolvedValue({ workflowId: 'child-instance-1', firstExecutionRunId: 'run-1' });
    // Second attempt: Temporal rejects a duplicate workflowId, and describe
    // confirms the ALREADY-ACCEPTED execution.
    start.mockImplementationOnce(async () => ({ workflowId: 'child-instance-1', firstExecutionRunId: 'run-1' }))
      .mockImplementationOnce(async () => { throw new Error('Workflow execution already started'); });
    const describe = jest.fn().mockResolvedValue({ status: { name: 'RUNNING' }, runId: 'run-1' });
    const result = jest.fn().mockResolvedValue({ _workflowStatus: 'COMPLETED', _workflowOutput: 'done', answer: 42 });
    getTemporalClient.mockResolvedValue({ workflow: { start, getHandle: () => ({ describe, result }) } });

    const params = {
      childWorkflowID: 'child-wf', tenantID: 'tenant-a', parentInstanceID: 'parent-instance',
      parentNodeID: 'node-1', executionKey: 'subflow:run:activity-1',
    };
    const first = await runSubWorkflowAndWait(params);
    const retry = await runSubWorkflowAndWait(params);

    expect(start).toHaveBeenCalledTimes(2);
    expect(start.mock.calls[0][1].workflowId).toBe('child-instance-1');
    expect(start.mock.calls[1][1].workflowId).toBe('child-instance-1');
    expect(first.childInstanceID).toBe('child-instance-1');
    expect(retry.childInstanceID).toBe('child-instance-1');
    expect(result).toHaveBeenCalledTimes(2);
  });

  test('every loop invocation gets a distinct key and a distinct child instance', async () => {
    let counter = 0;
    mockCreateInstance.mockImplementation(async ({ executionKey }) => {
      counter += 1;
      return { instance: { instanceID: `child-${counter}` }, initialContext: { input: {} } };
    });
    const start = jest.fn(async (type, options) => ({ workflowId: options.workflowId, firstExecutionRunId: 'run' }));
    const result = jest.fn().mockResolvedValue({ _workflowStatus: 'COMPLETED', _workflowOutput: counter });
    getTemporalClient.mockResolvedValue({ workflow: { start, getHandle: () => ({ describe: jest.fn(), result }) } });

    await runSubWorkflowAndWait({ childWorkflowID: 'child-wf', tenantID: 't', parentInstanceID: 'p', parentNodeID: 'n', executionKey: 'subflow:run:activity-1' });
    await runSubWorkflowAndWait({ childWorkflowID: 'child-wf', tenantID: 't', parentInstanceID: 'p', parentNodeID: 'n', executionKey: 'subflow:run:activity-2' });

    expect(mockCreateInstance.mock.calls.map(([params]) => params.executionKey)).toEqual([
      'subflow:run:activity-1', 'subflow:run:activity-2',
    ]);
    expect(start.mock.calls.map(([, options]) => options.workflowId)).toEqual(['child-1', 'child-2']);
  });

  test('a definitively rejected child start finalizes that child instance', async () => {
    mockCreateInstance.mockResolvedValue({ instance: { instanceID: 'child-bad' }, initialContext: { input: {} } });
    const start = jest.fn().mockRejectedValue(new TypeError('invalid child options'));
    const describe = jest.fn().mockRejectedValue(new Error('not found'));
    getTemporalClient.mockResolvedValue({ workflow: { start, getHandle: () => ({ describe, result: jest.fn() }) } });

    await expect(runSubWorkflowAndWait({
      childWorkflowID: 'child-wf', tenantID: 't', parentInstanceID: 'p', parentNodeID: 'n', executionKey: 'subflow:run:a',
    })).rejects.toThrow('invalid child options');
    expect(mockCompleteInstance).toHaveBeenCalledWith('child-bad', 'FAILED');
  });
});
