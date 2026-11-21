const { runGraph } = require('../../helpers/temporalSourceRuntime');
const N = (id, type, data = {}) => ({ id, type, data });
const E = (source, target, sourceHandle = 'output') => ({ source, target, sourceHandle });

describe('actual scoped graph scenarios', () => {
  test('fanout in a loop executes every branch, not just the first', async () => {
    const run = await runGraph({
      nodes: [N('s', 'start'), N('l', 'loop', { sourceVariable: 'items' }), N('f', 'fanout', { branches: [{ id: 'x' }, { id: 'y' }] }), N('x', 'javascript', { code: 'return 1;' }), N('y', 'javascript', { code: 'return 2;' }), N('e', 'end')],
      edges: [E('s', 'l'), E('l', 'f', 'loop'), E('f', 'x', 'x'), E('f', 'y', 'y'), E('x', 'l', 'success'), E('y', 'l', 'success'), E('l', 'e', 'completed')],
      initialContext: { items: [1] },
    });
    expect(run.error).toBeUndefined();
    const executed = run.progress.filter(row => row.status === 'RUNNING').map(row => row.nodeID);
    expect(executed).toContain('x');
    expect(executed).toContain('y');
  });

  test('failure End inside a loop terminates the entire run as failed', async () => {
    const run = await runGraph({
      nodes: [N('s', 'start'), N('l', 'loop', { sourceVariable: 'items' }), N('bad', 'end', { status: 'failure' }), N('good', 'end')],
      edges: [E('s', 'l'), E('l', 'bad', 'loop'), E('l', 'good', 'completed')], initialContext: { items: [1, 2] },
    });
    expect(run.error).toBeUndefined();
    expect(run.result._workflowStatus).toBe('FAILED');
    expect(run.terminal).toHaveLength(1);
    expect(run.terminal[0].finalStatus).toBe('FAILED');
    expect(run.progress.some(row => row.nodeID === 'good')).toBe(false);
  });

  test('whole-run End prevents a later ready sibling side effect', async () => {
    const run = await runGraph({
      nodes: [N('s', 'start'), N('a-end', 'end'), N('z-side-effect', 'javascript', { code: 'throw new Error("must not execute")' })],
      edges: [E('s', 'a-end'), E('s', 'z-side-effect')],
    });
    expect(run.error).toBeUndefined();
    expect(run.progress.some(row => row.nodeID === 'z-side-effect')).toBe(false);
  });

  test('exclusive branch reconvergence does not wait forever for an inactive path', async () => {
    const run = await runGraph({
      nodes: [N('s', 'start'), N('c', 'switch', { switchValue: 1, cases: [{ id: 'a', matchValue: 1 }] }), N('x', 'javascript', { code: 'return 1;' }), N('y', 'javascript', { code: 'throw new Error("untaken")' }), N('e', 'end')],
      edges: [E('s', 'c'), E('c', 'x', 'a'), E('c', 'y', 'default'), E('x', 'e', 'success'), E('y', 'e', 'success')],
    });
    expect(run.error).toBeUndefined();
    expect(run.result._workflowStatus).toBe('COMPLETED');
    expect(run.progress.some(row => row.nodeID === 'y')).toBe(false);
  });

  test('all-join still waits for both active fanout branches', async () => {
    const run = await runGraph({
      nodes: [N('s', 'start'), N('f', 'fanout', { branches: [{ id: 'x' }, { id: 'y' }] }), N('x', 'javascript', { code: 'return 1;', outputVariable: 'one' }), N('y', 'javascript', { code: 'return 2;', outputVariable: 'two' }), N('e', 'end')],
      edges: [E('s', 'f'), E('f', 'x', 'x'), E('f', 'y', 'y'), E('x', 'e', 'success'), E('y', 'e', 'success')],
    });
    expect(run.error).toBeUndefined();
    const order = run.progress.filter(row => row.status === 'RUNNING').map(row => row.nodeID);
    expect(order.indexOf('e')).toBeGreaterThan(order.indexOf('x'));
    expect(order.indexOf('e')).toBeGreaterThan(order.indexOf('y'));
    expect(run.result).toMatchObject({ one: 1, two: 2 });
  });

  test('loop and main paths share success-to-output fallback routing', async () => {
    const run = await runGraph({
      nodes: [N('s', 'start'), N('l', 'loop', { sourceVariable: 'items' }), N('j', 'javascript', { code: 'return 1;' }), N('k', 'javascript', { code: 'return 2;' }), N('e', 'end')],
      edges: [E('s', 'l'), E('l', 'j', 'loop'), E('j', 'k', 'output'), E('k', 'l', 'success'), E('l', 'e', 'completed')], initialContext: { items: [1] },
    });
    expect(run.error).toBeUndefined();
    expect(run.progress.some(row => row.nodeID === 'k')).toBe(true);
  });

  test('unhandled continued failure cannot fall off the graph as success', async () => {
    const run = await runGraph({ nodes: [N('s', 'start'), N('j', 'javascript', { code: 'throw new Error("boom")', errorHandling: 'continue' })], edges: [E('s', 'j')] });
    expect(run.error.message).toMatch(/Unhandled failure/);
    expect(run.terminal.at(-1).finalStatus).toBe('FAILED');
  });

  test('non-loop cycle is rejected before any activity executes', async () => {
    const run = await runGraph({ nodes: [N('s', 'start'), N('j', 'javascript', { code: 'return 1;' })], edges: [E('s', 'j'), E('j', 's', 'success')] });
    expect(run.error.message).toMatch(/cycle/);
    expect(run.progress).toHaveLength(0);
  });
});
