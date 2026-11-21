const mockHistoryCreate = jest.fn().mockResolvedValue({});
const mockFindInstance = jest.fn();
const mockCronUpdateMany = jest.fn();
const mockCronUpdate = jest.fn().mockResolvedValue({});
const mockAuthorizedExecuteWorkflow = jest.fn();
const mockCancelWorkflow = jest.fn().mockResolvedValue({ cancellationRequested: true });
const mockRedisClient = {
  set: jest.fn(),
  eval: jest.fn().mockResolvedValue(1),
};

jest.mock('../../../config/prisma.config', () => ({
  prisma: {
    tblCronJobHistory: { create: mockHistoryCreate },
    tblWorkflowInstances: { findUnique: mockFindInstance },
    tblCronJobs: { updateMany: mockCronUpdateMany, update: mockCronUpdate },
  },
}));
jest.mock('../../../modules/workflow/workflow.service', () => ({ workflowService: {} }));
jest.mock('../../../modules/workflow/temporal/service', () => ({
  cancelWorkflow: (...args) => mockCancelWorkflow(...args),
}));
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
jest.mock('node-cron', () => {
  const schedule = jest.fn(() => ({ stop: jest.fn() }));
  return { schedule, validate: () => true };
});

const { cronJobEngine } = require('../../../modules/cronJob/cronJobEngine/engine');

const baseJob = (overrides = {}) => ({
  cronJobID: 'cron-1', tenantID: 'tenant-1', workflowID: 'wf-1',
  cronJobSchedule: '0 * * * *', timeoutSeconds: 10, workflowConfig: {},
  ...overrides,
});

describe('CronJobEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient.set.mockResolvedValue('OK');
    mockRedisClient.eval.mockResolvedValue(1);
    mockAuthorizedExecuteWorkflow.mockResolvedValue({ instanceID: 'inst-1' });
    mockHistoryCreate.mockResolvedValue({});
    mockCronUpdateMany.mockResolvedValue({ count: 1 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('records SUCCESS only after the workflow reaches COMPLETED', async () => {
    mockFindInstance
      .mockResolvedValueOnce({ status: 'RUNNING', completedAt: null })
      .mockResolvedValueOnce({ status: 'COMPLETED', completedAt: new Date('2026-01-01T00:00:01.000Z') });

    const result = await cronJobEngine.runCronJob({ cronJob: baseJob() });

    expect(result).toBe(true);
    expect(mockHistoryCreate).toHaveBeenCalledTimes(1);
    const data = mockHistoryCreate.mock.calls[0][0].data;
    expect(data.status).toBe('SUCCESS');
    expect(JSON.parse(data.result).finalWorkflowStatus).toBe('COMPLETED');
    expect(data.durationMs).toBeGreaterThanOrEqual(500);
  });

  it('records FAILURE when the workflow finishes FAILED', async () => {
    mockFindInstance.mockResolvedValueOnce({ status: 'FAILED', completedAt: new Date() });

    const result = await cronJobEngine.runCronJob({ cronJob: baseJob({ cronJobID: 'cron-2' }) });

    expect(result).toBe(false);
    expect(mockHistoryCreate.mock.calls[0][0].data.status).toBe('FAILURE');
  });

  it('does not run when the distributed lock cannot be acquired (fail closed)', async () => {
    mockRedisClient.set.mockRejectedValue(new Error('redis down'));

    const result = await cronJobEngine.runCronJob({ cronJob: baseJob({ cronJobID: 'cron-3' }) });

    expect(result).toBe(false);
    expect(mockAuthorizedExecuteWorkflow).not.toHaveBeenCalled();
    expect(mockHistoryCreate).not.toHaveBeenCalled();
  });
});

describe('CronJobEngine occurrence identity', () => {
  let lastScheduledAt;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockRedisClient.set.mockResolvedValue('OK');
    mockRedisClient.eval.mockResolvedValue(1);
    mockAuthorizedExecuteWorkflow.mockResolvedValue({ instanceID: 'inst-1' });
    mockFindInstance.mockResolvedValue({ status: 'COMPLETED', completedAt: new Date() });
    mockHistoryCreate.mockResolvedValue({});
    lastScheduledAt = null;
    mockCronUpdateMany.mockImplementation(async ({ where, data }) => {
      if (where.cronJobID !== 'cron-occ') return { count: 0 };
      if (lastScheduledAt && lastScheduledAt >= data.lastScheduledAt) return { count: 0 };
      lastScheduledAt = data.lastScheduledAt;
      return { count: 1 };
    });
  });

  it('claims a scheduled tick exactly once even when two replicas fire together', async () => {
    const tick = new Date('2026-01-01T00:00:00.200Z');
    const cronJob = baseJob({ cronJobID: 'cron-occ' });
    const [first, second] = await Promise.all([
      cronJobEngine.runCronJob({ cronJob, triggerType: 'SCHEDULED', scheduledFor: tick }),
      cronJobEngine.runCronJob({ cronJob, triggerType: 'SCHEDULED', scheduledFor: new Date('2026-01-01T00:00:00.900Z') }),
    ]);
    expect([first, second].filter(Boolean)).toHaveLength(1);
    expect(mockAuthorizedExecuteWorkflow).toHaveBeenCalledTimes(1);
    expect(mockHistoryCreate).toHaveBeenCalledTimes(1);
    expect(lastScheduledAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
  });

  it('a later tick is a new occurrence and runs again', async () => {
    const cronJob = baseJob({ cronJobID: 'cron-occ' });
    expect(await cronJobEngine.runCronJob({ cronJob, scheduledFor: new Date('2026-01-01T00:00:00.000Z') })).toBe(true);
    expect(await cronJobEngine.runCronJob({ cronJob, scheduledFor: new Date('2026-01-01T01:00:00.000Z') })).toBe(true);
    expect(mockAuthorizedExecuteWorkflow).toHaveBeenCalledTimes(2);
  });

  it('manual runs are not occurrence-claimed', async () => {
    const result = await cronJobEngine.runCronJob({ cronJob: baseJob({ cronJobID: 'cron-manual' }), triggerType: 'MANUAL' });
    expect(result).toBe(true);
    expect(mockCronUpdateMany).not.toHaveBeenCalled();
    expect(mockHistoryCreate.mock.calls[0][0].data.triggerType).toBe('MANUAL');
  });
});

describe('CronJobEngine retries and timeouts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockRedisClient.set.mockResolvedValue('OK');
    mockRedisClient.eval.mockResolvedValue(1);
    mockHistoryCreate.mockResolvedValue({});
    mockCronUpdateMany.mockResolvedValue({ count: 1 });
    mockCancelWorkflow.mockResolvedValue({ cancellationRequested: true });
  });

  it('consumes retryAttempts/retryDelaySeconds and stores one history row per occurrence', async () => {
    jest.spyOn(cronJobEngine, '_waitForWorkflowCompletion')
      .mockResolvedValueOnce({ status: 'FAILED' })
      .mockResolvedValueOnce({ status: 'COMPLETED', completedAt: new Date() });
    mockAuthorizedExecuteWorkflow
      .mockResolvedValueOnce({ instanceID: 'attempt-1' })
      .mockResolvedValueOnce({ instanceID: 'attempt-2' });

    const result = await cronJobEngine.runCronJob({
      cronJob: baseJob({ cronJobID: 'cron-retry', retryAttempts: 2, retryDelaySeconds: 0 }),
    });

    expect(result).toBe(true);
    expect(mockAuthorizedExecuteWorkflow).toHaveBeenCalledTimes(2);
    expect(mockHistoryCreate).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(mockHistoryCreate.mock.calls[0][0].data.result);
    expect(payload.attempts).toEqual([
      { attempt: 1, instanceID: 'attempt-1', status: 'FAILED' },
      { attempt: 2, instanceID: 'attempt-2', status: 'COMPLETED' },
    ]);
  });

  it('requests cancellation on timeout, keeps the lock through the grace wait, never retries the live run', async () => {
    const events = [];
    mockCancelWorkflow.mockImplementation(async () => { events.push('cancel-request'); });
    mockRedisClient.eval.mockImplementation(async () => { events.push('lock-release'); return 1; });
    jest.spyOn(cronJobEngine, '_waitForWorkflowCompletion')
      .mockResolvedValueOnce({ status: 'TIMEOUT' })
      .mockResolvedValueOnce({ status: 'CANCELLED' });

    const result = await cronJobEngine.runCronJob({
      cronJob: baseJob({ cronJobID: 'cron-timeout', retryAttempts: 3, timeoutSeconds: 1 }),
    });

    expect(result).toBe(false);
    expect(mockCancelWorkflow).toHaveBeenCalledWith({ instanceID: 'inst-1' });
    expect(mockAuthorizedExecuteWorkflow).toHaveBeenCalledTimes(1);
    expect(events.indexOf('cancel-request')).toBeLessThan(events.indexOf('lock-release'));
    const payload = JSON.parse(mockHistoryCreate.mock.calls[0][0].data.result);
    expect(payload).toMatchObject({ finalWorkflowStatus: 'TIMEOUT', cancellationRequested: true, statusAfterCancel: 'CANCELLED' });
  });

  it('does not retry a timeout that remains non-terminal after cancellation', async () => {
    jest.spyOn(cronJobEngine, '_waitForWorkflowCompletion')
      .mockResolvedValueOnce({ status: 'TIMEOUT' })
      .mockResolvedValueOnce({ status: 'TIMEOUT' });

    await cronJobEngine.runCronJob({
      cronJob: baseJob({ cronJobID: 'cron-timeout-2', retryAttempts: 5, timeoutSeconds: 1 }),
    });

    expect(mockAuthorizedExecuteWorkflow).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(mockHistoryCreate.mock.calls[0][0].data.result);
    expect(payload.statusAfterCancel).toBe('TIMEOUT');
  });
});

describe('CronJobEngine fleet reconciliation', () => {
  const cron = require('node-cron');
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockCronUpdate.mockResolvedValue({});
  });

  it('applies a disable/change/delete made on another replica', async () => {
    const first = baseJob({ cronJobID: 'cron-a', updatedAt: new Date('2026-01-01') });
    cronJobEngine.reconcileSchedules([first]);
    expect(cron.schedule).toHaveBeenCalledTimes(1);
    const scheduledJob = cronJobEngine.scheduledJobs['cron-a'];

    // Unchanged config is a no-op (no timer churn).
    cronJobEngine.reconcileSchedules([{ ...first, updatedAt: new Date('2026-01-01') }]);
    expect(cron.schedule).toHaveBeenCalledTimes(1);
    expect(cronJobEngine.scheduledJobs['cron-a']).toBe(scheduledJob);

    // Changed expression reschedules.
    cronJobEngine.reconcileSchedules([{ ...first, cronJobSchedule: '0 2 * * *', updatedAt: new Date('2026-01-02') }]);
    expect(cron.schedule).toHaveBeenCalledTimes(2);

    // Deleted/disabled on another replica disappears locally.
    cronJobEngine.reconcileSchedules([]);
    expect(cronJobEngine.scheduledJobs['cron-a']).toBeUndefined();
  });

  it('maintains nextRunAt when a parser is available', async () => {
    cronJobEngine.reconcileSchedules([baseJob({ cronJobID: 'cron-next' })]);
    expect(mockCronUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { cronJobID: 'cron-next' },
      data: { nextRunAt: expect.any(Date) },
    }));
  });
});
