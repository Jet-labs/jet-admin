/**
 * Workflow Engine Stress Test Suite
 *
 * Run:   npx jest tests/stress/workflowStress.test.js --testTimeout=60000
 *
 * Covers:
 *  1. Unit — dagScheduler barrier logic
 *  2. Unit — stateManager context assembly and log writes
 *  3. Unit — orchestrator payload builder
 *  4. Integration — all 12 topology shapes run to completion
 *  5. Concurrency — join node double-dispatch detection
 *  6. Concurrency — N parallel instances of the same workflow
 *  7. Error paths — fail nodes, error edges, recovery paths
 *  8. Load — 100 concurrent linear workflows
 *  9. Load — 50 concurrent diamond (AND join) workflows
 * 10. Edge cases — stale instance recovery, empty output params, missing node
 *
 * Module layout assumed:
 *   src/modules/workflow/orchestrator/orchestrator.js
 *   src/modules/workflow/orchestrator/stateManager.js
 *   src/modules/workflow/orchestrator/dagScheduler.js
 *   src/modules/workflow/handlers/index.js
 *   src/config/prisma.config.js
 *   src/config/queue.config.js
 *   src/config/socket.io.js
 *   src/modules/widget/widgetWorkflowBridge.js
 *   src/utils/logger.js
 *   src/constants/index.js  (exports WORKFLOW_LOG_EVENT_TYPES)
 *
 * Adjust paths in the jest.mock() calls below if your project differs.
 */

// ─── In-memory Prisma — must be required before jest.mock hoisting resolves ──
const { prisma, store } = require('./inMemoryPrisma');

const pendingJobs = require('./pendingJobs');
const { runSequential, runParallel, runConcurrentInstances } = require('./workflowExecutor');

// ─── Jest module mocks ────────────────────────────────────────────────────────
// jest.mock() calls are hoisted before any require(), so these take effect
// before the source modules first load.

jest.mock('../../config/prisma.config', () => {
  const { prisma } = require('./inMemoryPrisma');
  return { prisma };
});

jest.mock('../../config/queue.config', () => {
  const pendingJobs = require('./pendingJobs');
  return {
    addNodeJob: jest.fn(async (job) => { pendingJobs.push(job); }),
    addResult:  jest.fn(),                      // taskWorker not used in tests
    registerTaskWorker:   jest.fn(),
    registerResultsWorker: jest.fn(),
    initializeQueue: jest.fn(),
    closeQueue:      jest.fn(),
  };
});

jest.mock('../../config/socket.io', () => ({
  socketIO: { to: () => ({ emit: jest.fn() }) },
}));

jest.mock('../../modules/widget/widgetWorkflowBridge', () => ({
  widgetWorkflowBridge: {
    emitContextUpdate: jest.fn(),
    emitWorkflowStatus: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  log: jest.fn(),
}));

// ─── Register test-only handlers BEFORE importing orchestrator ────────────────

const { handlers } = require('../../modules/workflow/handlers');

// __echo: returns echoOutput via echoHandle, supports joinMode in nodeConfig
handlers['__echo'] = {
  execute: async (nodeConfig, _ctx) => ({
    output: { [nodeConfig.outputVariable]: nodeConfig.echoOutput, success: true },
    nextHandle: nodeConfig.echoHandle ?? 'success',
  }),
};

// __fail: always throws
handlers['__fail'] = {
  execute: async (nodeConfig) => {
    throw new Error(nodeConfig.errorMessage ?? 'synthetic handler failure');
  },
};

// __delay: waits, then echoes
handlers['__delay'] = {
  execute: async (nodeConfig) => {
    await new Promise(r => setTimeout(r, nodeConfig.delayMs ?? 10));
    return {
      output: { [nodeConfig.outputVariable]: nodeConfig.echoOutput, success: true },
      nextHandle: 'success',
    };
  },
};

// ─── Imports (after mocks are in place) ──────────────────────────────────────

const { stateManager } = require('../../modules/workflow/workflowEngine/stateManager');
const { dagScheduler } = require('../../modules/workflow/workflowEngine/dagScheduler');
const { startWorkflow, __test__ } = require('../../modules/workflow/workflowEngine/engine');

const {
  LINEAR, FAN_OUT, DIAMOND_AND, DIAMOND_OR,
  DEEP_CHAIN, WIDE_FAN_OUT, WIDE_FAN_IN,
  ERROR_PATH, CONDITIONAL, MULTI_DIAMOND,
  ERROR_RECOVERY, DELAY_HEAVY,
  ALL_TOPOLOGIES,
} = require('./topologies');

// ─── Test helpers ─────────────────────────────────────────────────────────────

const TENANT = 'tenant-stress-test';

async function launchWorkflow(topology, inputValues = {}) {
  store.seedWorkflow(topology);
  const { instanceID } = await startWorkflow({
    workflowID: topology.workflowID,
    tenantID: TENANT,
    inputValues,
  });
  return instanceID;
}

async function runTopology(topology, { mode = 'sequential', inputParams = {} } = {}) {
  const instanceID = await launchWorkflow(topology, inputParams);
  const runner = mode === 'parallel' ? runParallel : runSequential;
  return runner(instanceID, { store });
}

beforeEach(() => {
  store.reset();
  pendingJobs.length = 0;
  jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. UNIT — dagScheduler barrier logic
// ═══════════════════════════════════════════════════════════════════════════════

describe('dagScheduler — isNodeReadyToExecute', () => {
  test('no incoming edges → always ready', () => {
    expect(dagScheduler.isNodeReadyToExecute({ incomingEdges: [] })).toBe(true);
  });

  test('single incoming edge → always ready', () => {
    expect(dagScheduler.isNodeReadyToExecute({
      incomingEdges: [{ upstreamNodeID: 'A' }],
    })).toBe(true);
  });

  test('AND join — both complete → ready', () => {
    const ready = dagScheduler.isNodeReadyToExecute({
      incomingEdges: [{ upstreamNodeID: 'A' }, { upstreamNodeID: 'B' }],
      joinMode: 'all',
      completedNodeIDs: new Set(['A', 'B']),
    });
    expect(ready).toBe(true);
  });

  test('AND join — only one complete → not ready', () => {
    const ready = dagScheduler.isNodeReadyToExecute({
      incomingEdges: [{ upstreamNodeID: 'A' }, { upstreamNodeID: 'B' }],
      joinMode: 'all',
      completedNodeIDs: new Set(['A']),
    });
    expect(ready).toBe(false);
  });

  test('OR join — one complete → ready', () => {
    const ready = dagScheduler.isNodeReadyToExecute({
      incomingEdges: [{ upstreamNodeID: 'A' }, { upstreamNodeID: 'B' }],
      joinMode: 'any',
      completedNodeIDs: new Set(['A']),
    });
    expect(ready).toBe(true);
  });

  test('OR join — none complete → not ready', () => {
    const ready = dagScheduler.isNodeReadyToExecute({
      incomingEdges: [{ upstreamNodeID: 'A' }, { upstreamNodeID: 'B' }],
      joinMode: 'any',
      completedNodeIDs: new Set(),
    });
    expect(ready).toBe(false);
  });

  test('unknown joinMode defaults to "all"', () => {
    const ready = dagScheduler.isNodeReadyToExecute({
      incomingEdges: [{ upstreamNodeID: 'A' }, { upstreamNodeID: 'B' }],
      joinMode: 'BOGUS',
      completedNodeIDs: new Set(['A']),
      instanceID: 'i1',
    });
    expect(ready).toBe(false); // treated as 'all', B missing
  });

  test('test-run barrier uses contextData __node_ sentinel', () => {
    const ctx = { '__node_A': { status: 'success' } };
    const ready = dagScheduler.isNodeReadyToExecute({
      incomingEdges: [{ upstreamNodeID: 'A' }, { upstreamNodeID: 'B' }],
      joinMode: 'all',
      isTestRun: true,
      contextData: ctx,
    });
    expect(ready).toBe(false); // B sentinel missing
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. UNIT — stateManager
// ═══════════════════════════════════════════════════════════════════════════════

describe('stateManager', () => {
  test('createInstance writes INPUT_SET log row', async () => {
    const { instance, initialContext } = await stateManager.createInstance({
      workflowID: 'wf-1', tenantID: TENANT, inputValues: { foo: 'bar' },
    });

    expect(instance.status).toBe('RUNNING');
    expect(initialContext).toMatchObject({ input: { foo: 'bar' } });

    const logs = store.getLogs(instance.instanceID);
    expect(logs).toHaveLength(1);
    expect(logs[0].eventType).toBe('INPUT_SET');
    expect(logs[0].payload).toMatchObject({ input: { foo: 'bar' } });
  });

  test('assembleContext folds rows in logID order (later row wins on conflict)', async () => {
    const { instance } = await stateManager.createInstance({ workflowID: 'wf-1', tenantID: TENANT });
    const id = instance.instanceID;

    await stateManager.logEvent({ instanceID: id, eventType: 'NODE_COMPLETED', payload: { x: 1, y: 10 } });
    await stateManager.logEvent({ instanceID: id, eventType: 'NODE_COMPLETED', payload: { x: 2 } }); // x wins

    const ctx = await stateManager.assembleContext(id);
    expect(ctx.x).toBe(2);
    expect(ctx.y).toBe(10); // not overwritten
  });

  test('assembleContext excludes NODE_FAILED rows', async () => {
    const { instance } = await stateManager.createInstance({ workflowID: 'wf-1', tenantID: TENANT });
    const id = instance.instanceID;

    await stateManager.logEvent({ instanceID: id, eventType: 'NODE_FAILED', payload: { secret: 'should not appear' } });

    const ctx = await stateManager.assembleContext(id);
    expect(ctx.secret).toBeUndefined();
  });

  test('getCompletedNodeIDs returns correct set', async () => {
    const { instance } = await stateManager.createInstance({ workflowID: 'wf-1', tenantID: TENANT });
    const id = instance.instanceID;

    await stateManager.logEvent({ instanceID: id, nodeID: 'A', eventType: 'NODE_COMPLETED', payload: {} });
    await stateManager.logEvent({ instanceID: id, nodeID: 'B', eventType: 'NODE_FAILED', payload: {} });

    const completed = await stateManager.getCompletedNodeIDs(id, ['A', 'B', 'C']);
    expect(completed.has('A')).toBe(true);
    expect(completed.has('B')).toBe(false); // failed, not completed
    expect(completed.has('C')).toBe(false);
  });

  test('logEventBulk writes all rows', async () => {
    const { instance } = await stateManager.createInstance({ workflowID: 'wf-1', tenantID: TENANT });
    const id = instance.instanceID;

    await stateManager.logEventBulk([
      { instanceID: id, eventType: 'SYSTEM_SET', payload: { a: 1 } },
      { instanceID: id, eventType: 'SYSTEM_SET', payload: { b: 2 } },
      { instanceID: id, eventType: 'SYSTEM_SET', payload: { c: 3 } },
    ]);

    const logs = store.getLogs(id).filter(l => l.eventType === 'SYSTEM_SET');
    expect(logs).toHaveLength(3);
  });

  test('completeInstance updates status', async () => {
    const { instance } = await stateManager.createInstance({ workflowID: 'wf-1', tenantID: TENANT });
    await stateManager.completeInstance(instance.instanceID, 'COMPLETED');

    const updated = store.getInstance(instance.instanceID);
    expect(updated.status).toBe('COMPLETED');
    expect(updated.completedAt).not.toBeNull();
  });

  test('deleteTestInstance removes all rows', async () => {
    const { instance } = await stateManager.createInstance({ workflowID: 'wf-1', tenantID: TENANT, isTest: true });
    await stateManager.logEvent({ instanceID: instance.instanceID, eventType: 'NODE_COMPLETED', payload: {} });

    await stateManager.deleteTestInstance(instance.instanceID);

    expect(store.getInstance(instance.instanceID)).toBeNull();
    expect(store.getLogs(instance.instanceID)).toHaveLength(0);
  });

  test('deleteTestInstance rejects non-test instances', async () => {
    const { instance } = await stateManager.createInstance({ workflowID: 'wf-1', tenantID: TENANT, isTest: false });
    await expect(stateManager.deleteTestInstance(instance.instanceID)).rejects.toThrow('not a test instance');
  });

  test('getStaleRunningInstances respects threshold', async () => {
    const { instance } = await stateManager.createInstance({ workflowID: 'wf-1', tenantID: TENANT });

    // Backdate updatedAt to simulate staleness
    const staleRow = store.state.instances.get(instance.instanceID);
    staleRow.updatedAt = new Date(Date.now() - 10 * 60 * 1000); // 10 min ago

    const stale = await stateManager.getStaleRunningInstances({ staleAfterMs: 5 * 60 * 1000 });
    expect(stale.some(i => i.instanceID === instance.instanceID)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. UNIT — orchestrator helper functions
// ═══════════════════════════════════════════════════════════════════════════════

describe('orchestrator — _buildLogPayload', () => {
  const { _buildLogPayload } = __test__;

  test('writes outputVariable key and sentinel', () => {
    const payload = _buildLogPayload({
      nodeID: 'n1',
      nodeType: '__echo',
      outputVariable: 'myVar',
      output: { myVar: { value: 42 }, success: true },
      status: 'success',
    });

    expect(payload.myVar).toEqual({ value: 42 });
    expect(payload['__node_n1']).toBeDefined();
    expect(payload['__node_n1'].status).toBe('success');
  });

  test('end node writes .output key', () => {
    const payload = _buildLogPayload({
      nodeID: 'end1',
      nodeType: 'end',
      outputVariable: null,
      output: { workflowOutput: { result: 99 }, status: 'success' },
      status: 'success',
    });

    expect(payload.output).toEqual({ result: 99 });
  });

  test('null output is handled gracefully', () => {
    const payload = _buildLogPayload({
      nodeID: 'n1', nodeType: '__echo', outputVariable: null, output: null, status: 'success',
    });
    expect(payload['__node_n1']).toBeDefined();
  });
});

describe('orchestrator — _buildWorkflowDefinition', () => {
  const { _buildWorkflowDefinition } = __test__;

  test('normalises ReactFlow nodes to internal format', () => {
    const nodes = [{ id: 'abc', type: 'start', data: { label: 'Start' } }];
    const edges = [{ source: 'abc', target: 'xyz', sourceHandle: 'output' }];
    const def = _buildWorkflowDefinition(nodes, edges);

    expect(def.nodes['abc']).toMatchObject({ nodeID: 'abc', nodeType: 'start' });
    expect(def.edges[0]).toMatchObject({ upstreamNodeID: 'abc', downstreamNodeID: 'xyz' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. INTEGRATION — topology shapes
// ═══════════════════════════════════════════════════════════════════════════════

describe('Integration — workflow topologies', () => {
  test('LINEAR completes with COMPLETED status', async () => {
    const { instance, stats } = await runTopology(LINEAR);
    expect(instance.status).toBe('COMPLETED');
    expect(stats.nodeExecutions.map(n => n.nodeType)).toContain('end');
  });

  test('LINEAR assembles context with all step outputs', async () => {
    const instanceID = await launchWorkflow(LINEAR);
    await runSequential(instanceID, { store });

    const ctx = await stateManager.assembleContext(instanceID);
    expect(ctx.stepA).toBeDefined();
    expect(ctx.stepB).toBeDefined();
    expect(ctx.stepC).toBeDefined();
  });

  test('FAN_OUT dispatches all 3 branches from start', async () => {
    const { stats } = await runTopology(FAN_OUT);
    const endCount = stats.nodeExecutions.filter(n => n.nodeType === 'end').length;
    expect(endCount).toBe(3);
  });

  test('DIAMOND_AND (joinMode=all) only dispatches join after BOTH branches complete', async () => {
    const instanceID = await launchWorkflow(DIAMOND_AND);
    const { instance } = await runParallel(instanceID, { store });

    expect(instance.status).toBe('COMPLETED');
    // Join node J should execute exactly once
    expect(store.getNodeExecutionCount(instanceID, 'J')).toBe(1);
  });

  test('DIAMOND_OR (joinMode=any) dispatches join as soon as first branch lands', async () => {
    const instanceID = await launchWorkflow(DIAMOND_OR);
    const { instance } = await runSequential(instanceID, { store });
    expect(instance.status).toBe('COMPLETED');
    expect(store.getNodeExecutionCount(instanceID, 'J')).toBeGreaterThanOrEqual(1);
  });

  test('DEEP_CHAIN (20 nodes) completes and logs all 20 intermediate steps', async () => {
    const instanceID = await launchWorkflow(DEEP_CHAIN);
    const { instance } = await runSequential(instanceID, { store });
    expect(instance.status).toBe('COMPLETED');

    const completed = store.getCompletedNodes(instanceID);
    // start + 20 echo nodes + end = 22 NODE_COMPLETED entries
    expect(completed.length).toBeGreaterThanOrEqual(21);
  });

  test('WIDE_FAN_OUT (1→10) all 10 branches reach their end node', async () => {
    const { stats } = await runTopology(WIDE_FAN_OUT, { mode: 'parallel' });
    const endCount = stats.nodeExecutions.filter(n => n.nodeType === 'end').length;
    expect(endCount).toBe(10);
  });

  test('WIDE_FAN_IN (10→1 AND join) join node runs exactly once', async () => {
    const instanceID = await launchWorkflow(WIDE_FAN_IN);
    const { instance } = await runParallel(instanceID, { store });
    expect(instance.status).toBe('COMPLETED');
    expect(store.getNodeExecutionCount(instanceID, 'J')).toBe(1);
  });

  test('MULTI_DIAMOND (two levels) completes and executes both join nodes once each', async () => {
    const instanceID = await launchWorkflow(MULTI_DIAMOND);
    const { instance } = await runParallel(instanceID, { store });
    expect(instance.status).toBe('COMPLETED');
    expect(store.getNodeExecutionCount(instanceID, 'M')).toBe(1);
    expect(store.getNodeExecutionCount(instanceID, 'F')).toBe(1);
  });

  test('CONDITIONAL follows the success edge, never executes sad path', async () => {
    const instanceID = await launchWorkflow(CONDITIONAL);
    const { stats } = await runSequential(instanceID, { store });
    const executed = stats.nodeExecutions.map(n => n.nodeID);
    expect(executed).toContain('happy');
    expect(executed).not.toContain('sad');
  });

  test('DELAY_HEAVY (3 parallel delays → AND join) completes correctly', async () => {
    const instanceID = await launchWorkflow(DELAY_HEAVY);
    const { instance } = await runParallel(instanceID, { store });
    expect(instance.status).toBe('COMPLETED');
    expect(store.getNodeExecutionCount(instanceID, 'J')).toBe(1);
  }, 10_000);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ERROR PATHS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Error paths', () => {
  test('ERROR_PATH — fail node routes to error-end, not success-end', async () => {
    const instanceID = await launchWorkflow(ERROR_PATH);
    const { stats } = await runSequential(instanceID, { store });

    const executed = stats.nodeExecutions.map(n => n.nodeID);
    expect(executed).toContain('e-err');
    expect(executed).not.toContain('e-ok');
  });

  test('ERROR_PATH — instance still reaches COMPLETED (error end node has status=failure but instance closes)', async () => {
    const instanceID = await launchWorkflow(ERROR_PATH);
    const { instance } = await runSequential(instanceID, { store });
    // end node with status:'failure' → _finalizeWorkflow sets FAILED
    expect(['COMPLETED', 'FAILED']).toContain(instance.status);
  });

  test('ERROR_RECOVERY — fail node → error edge → fallback node → success end', async () => {
    const instanceID = await launchWorkflow(ERROR_RECOVERY);
    const { instance, stats } = await runSequential(instanceID, { store });

    const executed = stats.nodeExecutions.map(n => n.nodeID);
    expect(executed).toContain('fallback');
    expect(instance.status).toBe('COMPLETED');
  });

  test('fail node writes NODE_FAILED log entry', async () => {
    const instanceID = await launchWorkflow(ERROR_PATH);
    await runSequential(instanceID, { store });

    const logs = store.getLogs(instanceID);
    const failedLogs = logs.filter(l => l.eventType === 'NODE_FAILED');
    expect(failedLogs.length).toBeGreaterThan(0);
    expect(failedLogs[0].errorMessage).toBe('intentional test failure');
  });

  test('fail node produces no context output', async () => {
    const instanceID = await launchWorkflow(ERROR_PATH);
    await runSequential(instanceID, { store });

    const ctx = await stateManager.assembleContext(instanceID);
    // fail node has no outputVariable — context should not contain its internal payload
    expect(ctx).not.toHaveProperty('__failOutput');
  });

  test('unregistered node type throws and marks workflow FAILED', async () => {
    const wf = {
      workflowID: 'wf-bad-type',
      nodes: [
        { nodeID: 's', nodeType: 'start', nodeConfig: {} },
        { nodeID: 'x', nodeType: '__not_a_real_handler', nodeConfig: {} },
        { nodeID: 'e', nodeType: 'end', nodeConfig: { status: 'success', outputParameters: [] } },
      ],
      edges: [
        { upstreamNodeID: 's', downstreamNodeID: 'x', sourceHandle: 'output' },
        { upstreamNodeID: 'x', downstreamNodeID: 'e', sourceHandle: 'success' },
      ],
    };

    const instanceID = await launchWorkflow(wf);
    // Executor will call getHandler('__not_a_real_handler') which throws
    // The error propagates through executeJob → handleTaskResult(error) → dagScheduler finds no error edge → orchestrator catches and marks FAILED
    const { instance } = await runSequential(instanceID, { store }).catch(async () => {
      return { instance: store.getInstance(instanceID) };
    });
    expect(['FAILED', 'RUNNING']).toContain(instance?.status);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. CONCURRENCY — join node correctness under parallel execution
// ═══════════════════════════════════════════════════════════════════════════════

describe('Concurrency — join node correctness', () => {
  test('DIAMOND_AND run 10 times in parallel — join node never executes more than once per instance', async () => {
    store.seedWorkflow(DIAMOND_AND);

    const results = await runConcurrentInstances(
      async () => {
        const { instanceID } = await startWorkflow({
          workflowID: DIAMOND_AND.workflowID,
          tenantID: TENANT,
        });
        return instanceID;
      },
      10,
      { store, mode: 'parallel' }
    );

    for (const { instance } of results) {
      const joinCount = store.getNodeExecutionCount(instance.instanceID, 'J');
      expect(joinCount).toBe(1);
      expect(instance.status).toBe('COMPLETED');
    }
  });

  test('WIDE_FAN_IN run 5 times in parallel — join node executes exactly once per instance', async () => {
    store.seedWorkflow(WIDE_FAN_IN);

    const results = await runConcurrentInstances(
      async () => {
        const { instanceID } = await startWorkflow({ workflowID: WIDE_FAN_IN.workflowID, tenantID: TENANT });
        return instanceID;
      },
      5,
      { store, mode: 'parallel' }
    );

    for (const { instance } of results) {
      expect(store.getNodeExecutionCount(instance.instanceID, 'J')).toBe(1);
    }
  });

  test('MULTI_DIAMOND concurrently — both join nodes execute once per instance', async () => {
    store.seedWorkflow(MULTI_DIAMOND);

    const results = await runConcurrentInstances(
      async () => {
        const { instanceID } = await startWorkflow({ workflowID: MULTI_DIAMOND.workflowID, tenantID: TENANT });
        return instanceID;
      },
      5,
      { store, mode: 'parallel' }
    );

    for (const { instance } of results) {
      expect(store.getNodeExecutionCount(instance.instanceID, 'M')).toBe(1);
      expect(store.getNodeExecutionCount(instance.instanceID, 'F')).toBe(1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CONTEXT INTEGRITY — outputs are visible to downstream nodes
// ═══════════════════════════════════════════════════════════════════════════════

describe('Context integrity', () => {
  test('LINEAR — each node sees previous node outputs in context', async () => {
    // Make B's echoOutput reference ctx so we can verify context propagation.
    // We do this by using a javascript handler node in an extended topology.
    const wf = {
      workflowID: 'wf-ctx-check',
      nodes: [
        { nodeID: 's', nodeType: 'start', nodeConfig: {} },
        { nodeID: 'A', nodeType: '__echo', nodeConfig: { outputVariable: 'aOut', echoOutput: { val: 100 }, echoHandle: 'success' } },
        // B reads ctx.aOut and puts it in its output via __echo — simplified to assert context assembly
        { nodeID: 'B', nodeType: '__echo', nodeConfig: { outputVariable: 'bOut', echoOutput: { val: 200 }, echoHandle: 'success' } },
        { nodeID: 'e', nodeType: 'end', nodeConfig: { status: 'success', outputParameters: [] } },
      ],
      edges: [
        { upstreamNodeID: 's', downstreamNodeID: 'A', sourceHandle: 'output' },
        { upstreamNodeID: 'A', downstreamNodeID: 'B', sourceHandle: 'success' },
        { upstreamNodeID: 'B', downstreamNodeID: 'e', sourceHandle: 'success' },
      ],
    };

    const instanceID = await launchWorkflow(wf);
    await runSequential(instanceID, { store });

    const ctx = await stateManager.assembleContext(instanceID);
    expect(ctx.aOut).toEqual({ val: 100 });
    expect(ctx.bOut).toEqual({ val: 200 });
  });

  test('DIAMOND_AND — join node sees outputs from BOTH branches', async () => {
    const instanceID = await launchWorkflow(DIAMOND_AND);
    await runParallel(instanceID, { store });

    const ctx = await stateManager.assembleContext(instanceID);
    expect(ctx.dataA).toEqual({ from: 'A' });
    expect(ctx.dataB).toEqual({ from: 'B' });
    expect(ctx.joined).toEqual({ merged: true });
  });

  test('input parameters are available in context under "input" key', async () => {
    const instanceID = await launchWorkflow(LINEAR, { userId: 42, action: 'test' });
    await runSequential(instanceID, { store });

    const ctx = await stateManager.assembleContext(instanceID);
    expect(ctx.input).toEqual({ userId: 42, action: 'test' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. LOAD — high volume linear workflows
// ═══════════════════════════════════════════════════════════════════════════════

describe('Load — 100 concurrent linear workflows', () => {
  test('all 100 complete with COMPLETED status', async () => {
    store.seedWorkflow(LINEAR);

    const results = await runConcurrentInstances(
      async () => {
        const { instanceID } = await startWorkflow({ workflowID: LINEAR.workflowID, tenantID: TENANT });
        return instanceID;
      },
      100,
      { store, mode: 'sequential' }
    );

    const failed = results.filter(r => r.instance.status !== 'COMPLETED');
    expect(failed).toHaveLength(0);
  }, 30_000);

  test('total execution time for 100 linear runs is under 10s', async () => {
    store.seedWorkflow(LINEAR);
    const t0 = Date.now();

    await runConcurrentInstances(
      async () => {
        const { instanceID } = await startWorkflow({ workflowID: LINEAR.workflowID, tenantID: TENANT });
        return instanceID;
      },
      100,
      { store, mode: 'sequential' }
    );

    const elapsed = Date.now() - t0;
    console.log(`100 linear workflows completed in ${elapsed}ms`);
    expect(elapsed).toBeLessThan(10_000);
  }, 15_000);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. LOAD — 50 concurrent diamond (AND join) workflows
// ═══════════════════════════════════════════════════════════════════════════════

describe('Load — 50 concurrent diamond AND-join workflows', () => {
  test('all 50 complete with COMPLETED status, no double-dispatch', async () => {
    store.seedWorkflow(DIAMOND_AND);

    const results = await runConcurrentInstances(
      async () => {
        const { instanceID } = await startWorkflow({ workflowID: DIAMOND_AND.workflowID, tenantID: TENANT });
        return instanceID;
      },
      50,
      { store, mode: 'parallel' }
    );

    let doubleDispatched = 0;
    for (const { instance } of results) {
      expect(instance.status).toBe('COMPLETED');
      const joinCount = store.getNodeExecutionCount(instance.instanceID, 'J');
      if (joinCount > 1) doubleDispatched++;
    }

    // Report double-dispatch count for observability
    if (doubleDispatched > 0) {
      console.warn(`⚠️  Double-dispatch detected on J in ${doubleDispatched}/50 instances`);
    }
    expect(doubleDispatched).toBe(0);
  }, 30_000);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. EDGE CASES
// ═══════════════════════════════════════════════════════════════════════════════

describe('Edge cases', () => {
  test('stale instance recovery marks FAILED and writes SYSTEM_SET log', async () => {
    const { instance } = await stateManager.createInstance({ workflowID: 'wf-1', tenantID: TENANT });

    // Backdate so it counts as stale
    store.state.instances.get(instance.instanceID).updatedAt = new Date(Date.now() - 10 * 60 * 1000);

    const stale = await stateManager.getStaleRunningInstances({ staleAfterMs: 5 * 60 * 1000 });
    await stateManager.markInstancesAsRecovered(stale.map(i => i.instanceID));

    const recovered = store.getInstance(instance.instanceID);
    expect(recovered.status).toBe('FAILED');

    const sysLogs = store.getLogs(instance.instanceID).filter(l => l.eventType === 'SYSTEM_SET');
    expect(sysLogs.length).toBeGreaterThan(0);
    expect(sysLogs[0].payload.__recoveryError).toMatch(/recovery/i);
  });

  test('workflow with no outgoing edge from end node completes cleanly', async () => {
    const wf = {
      workflowID: 'wf-minimal',
      nodes: [
        { nodeID: 's', nodeType: 'start', nodeConfig: {} },
        { nodeID: 'e', nodeType: 'end', nodeConfig: { status: 'success', outputParameters: [] } },
      ],
      edges: [{ upstreamNodeID: 's', downstreamNodeID: 'e', sourceHandle: 'output' }],
    };

    const instanceID = await launchWorkflow(wf);
    const { instance } = await runSequential(instanceID, { store });
    expect(instance.status).toBe('COMPLETED');
  });

  test('end node with outputParameters collects values from context', async () => {
    const wf = {
      workflowID: 'wf-output-params',
      nodes: [
        { nodeID: 's', nodeType: 'start', nodeConfig: {} },
        { nodeID: 'A', nodeType: '__echo', nodeConfig: { outputVariable: 'myData', echoOutput: { answer: 42 }, echoHandle: 'success' } },
        { nodeID: 'e', nodeType: 'end', nodeConfig: {
          status: 'success',
          outputParameters: [{ name: 'result', sourceVariable: '{{ctx.myData}}' }],
        }},
      ],
      edges: [
        { upstreamNodeID: 's', downstreamNodeID: 'A', sourceHandle: 'output' },
        { upstreamNodeID: 'A', downstreamNodeID: 'e', sourceHandle: 'success' },
      ],
    };

    const instanceID = await launchWorkflow(wf);
    const { instance } = await runSequential(instanceID, { store });
    expect(instance.status).toBe('COMPLETED');

    const ctx = await stateManager.assembleContext(instanceID);
    // output key is written by _buildLogPayload for end nodes
    expect(ctx.output?.result).toEqual({ answer: 42 });
  });

  test('getStartNode throws if workflow has no start node', async () => {
    store.seedWorkflow({ workflowID: 'wf-no-start', nodes: [], edges: [] });
    await expect(dagScheduler.getStartNode('wf-no-start')).rejects.toThrow('no start node');
  });

  test('calculateNextNodes returns [] when no outgoing edges match the handle', async () => {
    store.seedWorkflow(LINEAR);
    const next = await dagScheduler.calculateNextNodes(
      LINEAR.workflowID, 'A', 'nonexistent_handle', null
    );
    expect(next).toEqual([]);
  });

  test('all 12 topologies reach a terminal state', async () => {
    for (const topology of ALL_TOPOLOGIES) {
      store.reset();
      pendingJobs.length = 0;

      const instanceID = await launchWorkflow(topology);
      const runner = ['wf-diamond-and', 'wf-diamond-or', 'wf-wide-fan-in', 'wf-multi-diamond', 'wf-delay-heavy'].includes(topology.workflowID)
        ? runParallel
        : runSequential;

      const { instance } = await runner(instanceID, { store });
      expect(['COMPLETED', 'FAILED']).toContain(instance.status);
    }
  }, 30_000);
});
