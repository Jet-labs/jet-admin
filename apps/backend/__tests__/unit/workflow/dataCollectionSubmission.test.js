jest.mock('../../../config/prisma.config', () => ({ prisma: {
  $transaction: jest.fn(),
  tblWorkflowInstances: { findUnique: jest.fn(), updateMany: jest.fn() },
  tblWorkflowDataCollectionRequests: { findUnique: jest.fn(), updateMany: jest.fn(), findMany: jest.fn() },
} }));
jest.mock('../../../modules/workflow/temporal/service', () => ({ signalHumanInput: jest.fn() }));
const { prisma } = require('../../../config/prisma.config');
const { signalHumanInput } = require('../../../modules/workflow/temporal/service');
const { dataCollectionService } = require('../../../modules/workflow/dataCollection/dataCollection.service');
const { deliverSubmission } = require('../../../modules/workflow/dataCollection/submissionDelivery');
const { stateManager } = require('../../../modules/workflow/workflowEngine/stateManager');

describe('atomic human-input submission and durable delivery', () => {
  let row, instance, serial;
  const submit = data => dataCollectionService.submitCollectionData({ collectionRequestID: 'r', submittedData: data, tenantID: 't' });
  beforeEach(() => {
    jest.resetAllMocks();
    serial = Promise.resolve();
    instance = { instanceID: 'i', tenantID: 't', status: 'RUNNING' };
    row = {
      collectionRequestID: 'r', instanceID: 'i', nodeID: 'unsaved-node', waitID: 'wait-1',
      status: 'PENDING', submittedData: null, expiresAt: new Date(Date.now() + 60000),
      deliveredAt: null, deliveryToken: null, deliveryLeaseUntil: null,
      collectionConfig: { formSchema: { type: 'object', required: ['decision'], properties: { decision: { enum: ['approve', 'reject'] }, comment: { type: 'string' } } } },
    };
    // Serial transaction shim represents the parent-row locking contract; this
    // is not a substitute for the pending real-Postgres concurrency gate.
    prisma.$transaction.mockImplementation(fn => {
      const operation = serial.then(() => fn(prisma));
      serial = operation.catch(() => {});
      return operation;
    });
    prisma.tblWorkflowInstances.findUnique.mockImplementation(async () => ({ ...instance }));
    prisma.tblWorkflowInstances.updateMany.mockImplementation(async ({ where }) => ({ count: instance.status === where.status ? 1 : 0 }));
    prisma.tblWorkflowDataCollectionRequests.findUnique.mockImplementation(async () => ({ ...row }));
    prisma.tblWorkflowDataCollectionRequests.updateMany.mockImplementation(async ({ where, data }) => {
      if (where.status && where.status !== row.status) return { count: 0 };
      if (where.expiresAt && (!row.expiresAt || row.expiresAt > where.expiresAt.lte)) return { count: 0 };
      if (where.deliveredAt === null && row.deliveredAt !== null) return { count: 0 };
      if (where.deliveryToken && where.deliveryToken !== row.deliveryToken) return { count: 0 };
      if (where.OR && row.deliveryLeaseUntil && row.deliveryLeaseUntil > new Date()) return { count: 0 };
      Object.assign(row, data);
      return { count: 1 };
    });
    signalHumanInput.mockResolvedValue({ signalled: true });
  });

  test('concurrent approve/reject has one canonical winner and one signal', async () => {
    const results = await Promise.allSettled([submit({ decision: 'approve' }), submit({ decision: 'reject' })]);
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
    expect(signalHumanInput).toHaveBeenCalledTimes(1);
    expect(row.status).toBe('SUBMITTED');
    expect(row.deliveredAt).toBeInstanceOf(Date);
  });

  test('concurrent identical retries share one delivery lease', async () => {
    let release, began;
    const gate = new Promise(resolve => { release = resolve; });
    const signalBegan = new Promise(resolve => { began = resolve; });
    signalHumanInput.mockImplementation(async () => { began(); await gate; });
    const first = submit({ decision: 'approve' });
    const second = submit({ decision: 'approve' });
    await signalBegan;
    release();
    await Promise.all([first, second]);
    expect(signalHumanInput).toHaveBeenCalledTimes(1);
  });

  test('failed signal leaves a durable retryable submission instead of completed/nonretryable', async () => {
    signalHumanInput.mockRejectedValueOnce(new Error('Temporal unavailable'));
    expect(await submit({ decision: 'approve' })).toMatchObject({ success: true, delivery: 'queued' });
    expect(row).toMatchObject({ status: 'SUBMITTED', submittedData: { decision: 'approve' }, deliveredAt: null, deliveryToken: null });
    await deliverSubmission({ ...row });
    expect(signalHumanInput).toHaveBeenCalledTimes(2);
    expect(row.deliveredAt).toBeInstanceOf(Date);
    expect(signalHumanInput.mock.calls[1][0]).toMatchObject({ collectionRequestID: 'r', waitID: 'wait-1', data: { decision: 'approve' } });
  });

  test('only workflow consumption marks a new request completed', async () => {
    await submit({ decision: 'approve' });
    expect(row.status).toBe('SUBMITTED');
    const resolved = await stateManager.resolveDataCollectionRequest('r');
    expect(resolved.status).toBe('COMPLETED');
    expect(resolved.submittedData).toEqual({ decision: 'approve' });
  });

  test('submit-before-timeout winner is consumed even if signal delivery was lost', async () => {
    row.status = 'SUBMITTED';
    row.submittedData = { decision: 'reject' };
    row.expiresAt = new Date(Date.now() - 1);
    const resolved = await stateManager.resolveDataCollectionRequest('r', true);
    expect(resolved.status).toBe('COMPLETED');
    expect(resolved.submittedData.decision).toBe('reject');
  });

  test('timeout-before-submit produces EXPIRED, not COMPLETED', async () => {
    row.expiresAt = new Date(Date.now() - 1);
    await expect(submit({ decision: 'approve' })).rejects.toThrow('expired');
    expect(row.status).toBe('EXPIRED');
    expect(signalHumanInput).not.toHaveBeenCalled();
  });

  test.each([{}, { decision: 'maybe' }, [], null])('invalid submitted data %j never reaches CAS or signal', async data => {
    await expect(submit(data)).rejects.toThrow();
    expect(row.status).toBe('PENDING');
    expect(signalHumanInput).not.toHaveBeenCalled();
  });

  test('required approval comments cannot be blank', async () => {
    row.collectionConfig.requireComment = true;
    await expect(submit({ decision: 'approve', comment: '  ' })).rejects.toThrow('comment is required');
    expect(row.status).toBe('PENDING');
  });

  test('terminal parent rejects submission under the same lock order as finalization', async () => {
    instance.status = 'COMPLETED';
    await expect(submit({ decision: 'approve' })).rejects.toThrow('no longer running');
    expect(row.status).toBe('PENDING');
    expect(signalHumanInput).not.toHaveBeenCalled();
  });

  test('completed identical retry is idempotent without sending a second signal', async () => {
    row.status = 'COMPLETED';
    row.submittedData = { decision: 'approve' };
    instance.status = 'COMPLETED';
    expect(await submit({ decision: 'approve' })).toMatchObject({ alreadyAccepted: true });
    expect(signalHumanInput).not.toHaveBeenCalled();
  });

  test('tenant mismatch fails before submission', async () => {
    instance.tenantID = 'foreign';
    await expect(submit({ decision: 'approve' })).rejects.toThrow('not found in tenant');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
