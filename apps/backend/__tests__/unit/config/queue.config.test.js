const {
  initializeQueue,
  closeQueue,
  addListenerEvent,
  registerListenerEventWorker,
  isConnectionHealthy,
} = require('../../../config/queue.config');

const waitFor = async (assertion, timeoutMs = 500) => {
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

describe('queue.config listener events (memory driver)', () => {
  const processedJobs = [];

  beforeEach(async () => {
    processedJobs.length = 0;
    await initializeQueue();
    registerListenerEventWorker(async (job) => {
      processedJobs.push(job);
    });
  });

  afterEach(async () => {
    await closeQueue();
  });

  it('delivers listener events to the registered worker', async () => {
    await addListenerEvent({
      listenerID: 'lst-1',
      tenantID: 'tnt-1',
      rawEvent: { id: 'evt-1' },
      actions: [],
    });

    await waitFor(() => {
      expect(processedJobs).toHaveLength(1);
    });

    expect(processedJobs[0]).toMatchObject({
      listenerID: 'lst-1',
      tenantID: 'tnt-1',
      rawEvent: { id: 'evt-1' },
    });
  });

  it('reports healthy once initialized', async () => {
    expect(isConnectionHealthy()).toBe(true);
  });

  it('throws when publishing before initialization', async () => {
    await closeQueue();
    await expect(
      addListenerEvent({ listenerID: 'lst-x', tenantID: 'tnt-x', rawEvent: {} })
    ).rejects.toThrow('Queue not initialized');
  });
});
