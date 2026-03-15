const { dagScheduler } = require('../../../modules/workflow/orchestrator/dagScheduler');

describe('dagScheduler.isNodeReadyToExecute', () => {
  it('returns true when there are no incoming edges (start node)', async () => {
    expect(await dagScheduler.isNodeReadyToExecute({
      incomingEdges: [],
      instanceID: 'test-instance',
      isTestRun: true,
      contextData: {},
    })).toBe(true);
  });

  it('returns true for a single incoming edge (no fan-in)', async () => {
    expect(await dagScheduler.isNodeReadyToExecute({
      incomingEdges: [{ upstreamNodeID: 'node-A' }],
      instanceID: 'test-instance',
      isTestRun: true,
      contextData: {},
    })).toBe(true);
  });

  describe('joinMode: all (default) — test run with contextData', () => {
    const incomingEdges = [
      { upstreamNodeID: 'node-A' },
      { upstreamNodeID: 'node-B' },
    ];

    it('returns false when only one parent has completed', async () => {
      expect(await dagScheduler.isNodeReadyToExecute({
        incomingEdges,
        instanceID: 'test-instance',
        isTestRun: true,
        contextData: {
          '__node_node-A': { output: {}, status: 'success' },
        },
      })).toBe(false);
    });

    it('returns false when no parents have completed', async () => {
      expect(await dagScheduler.isNodeReadyToExecute({
        incomingEdges,
        instanceID: 'test-instance',
        isTestRun: true,
        contextData: {},
      })).toBe(false);
    });

    it('returns true when all parents have completed', async () => {
      expect(await dagScheduler.isNodeReadyToExecute({
        incomingEdges,
        instanceID: 'test-instance',
        isTestRun: true,
        contextData: {
          '__node_node-A': { output: {}, status: 'success' },
          '__node_node-B': { output: {}, status: 'success' },
        },
      })).toBe(true);
    });

    it('defaults to joinMode all when not specified', async () => {
      expect(await dagScheduler.isNodeReadyToExecute({
        incomingEdges,
        instanceID: 'test-instance',
        isTestRun: true,
        contextData: {
          '__node_node-A': { output: {}, status: 'success' },
        },
      })).toBe(false);
    });
  });

  describe('joinMode: any — test run with contextData', () => {
    const incomingEdges = [
      { upstreamNodeID: 'node-A' },
      { upstreamNodeID: 'node-B' },
    ];

    it('returns true when at least one parent has completed', async () => {
      expect(await dagScheduler.isNodeReadyToExecute({
        incomingEdges,
        instanceID: 'test-instance',
        isTestRun: true,
        contextData: {
          '__node_node-A': { output: {}, status: 'success' },
        },
        joinMode: 'any',
      })).toBe(true);
    });

    it('returns false when no parents have completed', async () => {
      expect(await dagScheduler.isNodeReadyToExecute({
        incomingEdges,
        instanceID: 'test-instance',
        isTestRun: true,
        contextData: {},
        joinMode: 'any',
      })).toBe(false);
    });

    it('returns true when all parents have completed', async () => {
      expect(await dagScheduler.isNodeReadyToExecute({
        incomingEdges,
        instanceID: 'test-instance',
        isTestRun: true,
        contextData: {
          '__node_node-A': { output: {}, status: 'success' },
          '__node_node-B': { output: {}, status: 'success' },
        },
        joinMode: 'any',
      })).toBe(true);
    });
  });

  describe('three-parent fan-in — test run with contextData', () => {
    const incomingEdges = [
      { upstreamNodeID: 'node-A' },
      { upstreamNodeID: 'node-B' },
      { upstreamNodeID: 'node-C' },
    ];

    it('returns false with joinMode all when 2 of 3 parents are done', async () => {
      expect(await dagScheduler.isNodeReadyToExecute({
        incomingEdges,
        instanceID: 'test-instance',
        isTestRun: true,
        contextData: {
          '__node_node-A': { output: {}, status: 'success' },
          '__node_node-C': { output: {}, status: 'success' },
        },
        joinMode: 'all',
      })).toBe(false);
    });

    it('returns true with joinMode all when all 3 parents are done', async () => {
      expect(await dagScheduler.isNodeReadyToExecute({
        incomingEdges,
        instanceID: 'test-instance',
        isTestRun: true,
        contextData: {
          '__node_node-A': { output: {}, status: 'success' },
          '__node_node-B': { output: {}, status: 'success' },
          '__node_node-C': { output: {}, status: 'success' },
        },
        joinMode: 'all',
      })).toBe(true);
    });

    it('returns true with joinMode any when 1 of 3 parents is done', async () => {
      expect(await dagScheduler.isNodeReadyToExecute({
        incomingEdges,
        instanceID: 'test-instance',
        isTestRun: true,
        contextData: {
          '__node_node-B': { output: {}, status: 'success' },
        },
        joinMode: 'any',
      })).toBe(true);
    });
  });
});
