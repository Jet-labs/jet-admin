const {
  initializeQueue,
  closeQueue,
  addNodeJob,
  registerTaskWorker,
} = require('../../../config/queue.config');

const waitFor = async (assertion, timeoutMs = 200) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      assertion();
      return;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  assertion();
};

describe('queue.config addNodeJob', () => {
  const processedJobs = [];

  beforeEach(async () => {
    processedJobs.length = 0;
    await initializeQueue();
    registerTaskWorker(async (job) => {
      processedJobs.push(job);
    });
  });

  afterEach(async () => {
    await closeQueue();
  });

  it('preserves incoming retry metadata', async () => {
    await addNodeJob({
      instanceID: 'instance-1',
      nodeID: 'node-1',
      nodeType: 'dataQuery',
      attempts: 2,
      maxAttempts: 5,
    });

    await waitFor(() => {
      expect(processedJobs).toHaveLength(1);
    });

    expect(processedJobs[0]).toMatchObject({
      attempts: 2,
      maxAttempts: 5,
    });
  });

  it('applies retry defaults when metadata is absent', async () => {
    await addNodeJob({
      instanceID: 'instance-2',
      nodeID: 'node-2',
      nodeType: 'code',
    });

    await waitFor(() => {
      expect(processedJobs).toHaveLength(1);
    });

    expect(processedJobs[0]).toMatchObject({
      attempts: 0,
      maxAttempts: 3,
    });
  });
});