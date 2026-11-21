const { runGraph } = require('../../helpers/temporalSourceRuntime');
const N = (id, type, data = {}) => ({ id, type, data });
const E = (source, target, sourceHandle = 'output') => ({ source, target, sourceHandle });
const submit = (request, signal, decision = 'approve') => {
  request.status = 'SUBMITTED';
  request.submittedData = { decision };
  signal('submitHumanInput', { nodeID: request.nodeID, waitID: request.waitID, collectionRequestID: request.collectionRequestID, data: { decision } });
};

describe('actual DSL human-input scenarios with controlled transport/time', () => {
  const approvalGraph = data => ({ nodes: [N('s', 'start'), N('a', 'approval', data), N('e', 'end')], edges: [E('s', 'a'), E('a', 'e', 'approved'), E('a', 'e', 'expired')] });

  test('loop approval creates one request per iteration; stale/duplicate signals cannot resume the next wait', async () => {
    let previous;
    const run = await runGraph({
      nodes: [N('s', 'start'), N('l', 'loop', { sourceVariable: 'items' }), N('a', 'approval'), N('e', 'end')],
      edges: [E('s', 'l'), E('l', 'a', 'loop'), E('a', 'l', 'approved'), E('l', 'e', 'completed')],
      initialContext: { items: [1, 2] },
      onWait: ({ predicate, requests, signal }) => {
        const current = [...requests.values()].at(-1);
        if (previous) {
          signal('submitHumanInput', { nodeID: 'a', waitID: previous.waitID, collectionRequestID: previous.collectionRequestID, data: { decision: 'reject' } });
          expect(predicate()).toBe(false);
        }
        submit(current, signal);
        submit(current, signal);
        previous = current;
      },
    });
    expect(run.error).toBeUndefined();
    expect(run.requests).toHaveLength(2);
    expect(new Set(run.requests.map(request => request.waitID)).size).toBe(2);
    expect(run.requests.every(request => request.status === 'COMPLETED')).toBe(true);
    expect(run.result.loopResults).toHaveLength(2);
    expect(run.result.loopResults.every(value => value.approved)).toBe(true);
    expect(run.progress.filter(row => row.status === 'SUSPENDED')).toHaveLength(0); // request activity owns the single suspension record
  });

  test('default UI expiry and workflow timer share the same sixty-minute deadline', async () => {
    const run = await runGraph(approvalGraph({}));
    expect(run.error).toBeUndefined();
    expect(run.requests[0].collectionConfig.expiryMinutes).toBe(60);
    expect(run.requests[0].status).toBe('EXPIRED');
    expect(run.result.approval.expired).toBe(true);
  });

  test('zero expiry is an unbounded wait, not an immediate timeout', async () => {
    const run = await runGraph({ ...approvalGraph({ expiryMinutes: 0 }), onWait: ({ timeout, requests, signal }) => {
      expect(timeout).toBeUndefined();
      expect([...requests.values()][0].expiresAt).toBeNull();
      submit([...requests.values()][0], signal);
    } });
    expect(run.error).toBeUndefined();
    expect(run.result.approval.approved).toBe(true);
  });

  test('workflow duration overrides the default consistently in row and timer', async () => {
    const run = await runGraph({ ...approvalGraph({}), workflowConfig: { humanInLoopTimeout: 120 }, onWait: ({ timeout, requests, advance }) => {
      expect(timeout).toBe(120000);
      expect([...requests.values()][0].collectionConfig.expiryMinutes).toBe(2);
      advance(timeout);
    } });
    expect(run.error).toBeUndefined();
    expect(run.requests[0].status).toBe('EXPIRED');
  });

  test('custom cancel during the last node cannot report completed', async () => {
    const run = await runGraph({ nodes: [N('s', 'start'), N('e', 'end')], edges: [E('s', 'e')],
      onExecute: ({ node, signal }) => { if (node.id === 'e') signal('cancelWorkflow'); },
    });
    expect(run.error.message).toMatch(/cancelled/);
    expect(run.terminal.at(-1).finalStatus).toBe('CANCELLED');
  });

  test('legacy replay branch still uses the original node-ID wait commands', async () => {
    const run = await runGraph({ ...approvalGraph({}), repaired: false, onWait: ({ signal }) => signal('submitHumanInput', { nodeID: 'a', data: { decision: 'approve' } }) });
    expect(run.error).toBeUndefined();
    expect(run.requests[0].waitID).toBeUndefined();
    expect(run.result.approval.approved).toBe(true);
  });
});
