const mockFindInstance = jest.fn();
const mockTerminate = jest.fn().mockResolvedValue(true);
const mockDeleteTestInstance = jest.fn().mockResolvedValue(true);
const mockFindScoped = jest.fn();
const mockCancel = jest.fn().mockResolvedValue({ cancellationRequested: true });

jest.mock('../../../config/prisma.config', () => ({
  prisma: { tblWorkflowInstances: { findUnique: mockFindInstance, findFirst: mockFindScoped } },
}));
jest.mock('../../../modules/workflow/temporal/service', () => ({
  terminateWorkflow: (...args) => mockTerminate(...args),
  cancelWorkflow: (...args) => mockCancel(...args),
}));
jest.mock('../../../modules/workflow/workflowEngine/stateManager', () => ({
  stateManager: { deleteTestInstance: (...args) => mockDeleteTestInstance(...args) },
}));

const { workflowService } = require('../../../modules/workflow/workflow.service');

describe('workflowService.stopTestWorkflow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects a non-test instance before terminating anything', async () => {
    mockFindInstance.mockResolvedValue({ instanceID: 'inst-1', isTest: false, status: 'RUNNING' });

    await expect(workflowService.stopTestWorkflow({ instanceID: 'inst-1' }))
      .rejects.toThrow('Only test workflow instances');
    expect(mockTerminate).not.toHaveBeenCalled();
    expect(mockDeleteTestInstance).not.toHaveBeenCalled();
  });

  it('rejects a missing instance', async () => {
    mockFindInstance.mockResolvedValue(null);
    await expect(workflowService.stopTestWorkflow({ instanceID: 'missing' }))
      .rejects.toThrow('not found');
    expect(mockTerminate).not.toHaveBeenCalled();
  });

  it('terminates and deletes a test instance', async () => {
    mockFindInstance.mockResolvedValue({ instanceID: 'inst-2', isTest: true, status: 'RUNNING' });
    await expect(workflowService.stopTestWorkflow({ instanceID: 'inst-2' }))
      .resolves.toEqual({ success: true });
    expect(mockTerminate).toHaveBeenCalledWith({ instanceID: 'inst-2', reason: 'stopTestWorkflow' });
    expect(mockDeleteTestInstance).toHaveBeenCalledWith('inst-2');
  });
});

describe('production cancellation', () => {
  beforeEach(() => jest.clearAllMocks());
  test('requires a tenant-bound instance and never deletes production history', async () => {
    mockFindScoped.mockResolvedValue({ status: 'RUNNING' });
    await expect(workflowService.cancelRun({ instanceID: 'r', tenantID: 't' })).resolves.toEqual({ cancellationRequested: true });
    expect(mockFindScoped).toHaveBeenCalledWith({ where: { instanceID: 'r', tenantID: 't' } });
    expect(mockCancel).toHaveBeenCalledWith({ instanceID: 'r' });
    expect(mockDeleteTestInstance).not.toHaveBeenCalled();
    expect(mockTerminate).not.toHaveBeenCalled();
  });
  test('foreign/missing instance cannot be cancelled', async () => {
    mockFindScoped.mockResolvedValue(null);
    await expect(workflowService.cancelRun({ instanceID: 'foreign', tenantID: 't' })).rejects.toMatchObject({ statusCode: 404 });
    expect(mockCancel).not.toHaveBeenCalled();
  });
  test('terminal instance is an idempotent no-op', async () => {
    mockFindScoped.mockResolvedValue({ status: 'COMPLETED' });
    expect(await workflowService.cancelRun({ instanceID: 'r', tenantID: 't' })).toEqual({ cancellationRequested: false, status: 'COMPLETED' });
    expect(mockCancel).not.toHaveBeenCalled();
  });
});
