const mockHistoryCreate = jest.fn().mockResolvedValue({});
const mockFindInstance = jest.fn();
const mockAuthorizedExecuteWorkflow = jest.fn();
const mockRedisClient = {
  set: jest.fn(),
  eval: jest.fn().mockResolvedValue(1),
};

jest.mock('../../../config/prisma.config', () => ({
  prisma: {
    tblCronJobHistory: { create: mockHistoryCreate },
    tblWorkflowInstances: { findUnique: mockFindInstance },
  },
}));
jest.mock('../../../modules/workflow/workflow.service', () => ({ workflowService: {} }));
jest.mock('../../../utils/authorizedProxy', () => ({
  authorizedExecuteWorkflow: (...args) => mockAuthorizedExecuteWorkflow(...args),
}));
jest.mock('../../../utils/input.util', () => ({
  resolveInputs: jest.fn().mockResolvedValue({ resolved: {}, errors: [], valid: true }),
  extractWorkflowDefinitions: jest.fn().mockReturnValue([]),
}));
jest.mock('../../../config/redis.config', () => ({
  isRedisEnabled: jest.fn(() => true),
  getRedisClient: jest.fn(() => mockRedisClient),
}));
jest.mock('node-cron', () => ({ schedule: jest.fn(() => ({ stop: jest.fn() })) }));

const { cronJobEngine } = require('../../../modules/cronJob/cronJobEngine/engine');

describe('CronJobEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient.set.mockResolvedValue('OK');
    mockAuthorizedExecuteWorkflow.mockResolvedValue({ instanceID: 'inst-1' });
    mockHistoryCreate.mockResolvedValue({});
  });

  it('records SUCCESS only after the workflow reaches COMPLETED', async () => {
    mockFindInstance
      .mockResolvedValueOnce({ status: 'RUNNING', completedAt: null })
      .mockResolvedValueOnce({ status: 'COMPLETED', completedAt: new Date('2026-01-01T00:00:01.000Z') });

    const result = await cronJobEngine.runCronJob({
      cronJob: {
        cronJobID: 'cron-1', tenantID: 'tenant-1', workflowID: 'wf-1',
        timeoutSeconds: 10, workflowConfig: {},
      },
    });

    expect(result).toBe(true);
    expect(mockHistoryCreate).toHaveBeenCalledTimes(1);
    const data = mockHistoryCreate.mock.calls[0][0].data;
    expect(data.status).toBe('SUCCESS');
    expect(JSON.parse(data.result).finalWorkflowStatus).toBe('COMPLETED');
    expect(data.durationMs).toBeGreaterThanOrEqual(500);
  });

  it('records FAILURE when the workflow finishes FAILED', async () => {
    mockFindInstance.mockResolvedValueOnce({ status: 'FAILED', completedAt: new Date() });

    const result = await cronJobEngine.runCronJob({
      cronJob: {
        cronJobID: 'cron-2', tenantID: 'tenant-1', workflowID: 'wf-1',
        timeoutSeconds: 10, workflowConfig: {},
      },
    });

    expect(result).toBe(false);
    expect(mockHistoryCreate.mock.calls[0][0].data.status).toBe('FAILURE');
  });

  it('does not run when the distributed lock cannot be acquired (fail closed)', async () => {
    mockRedisClient.set.mockRejectedValue(new Error('redis down'));

    const result = await cronJobEngine.runCronJob({
      cronJob: {
        cronJobID: 'cron-3', tenantID: 'tenant-1', workflowID: 'wf-1',
        timeoutSeconds: 10, workflowConfig: {},
      },
    });

    expect(result).toBe(false);
    expect(mockAuthorizedExecuteWorkflow).not.toHaveBeenCalled();
    expect(mockHistoryCreate).not.toHaveBeenCalled();
  });
});
