const { runGraph } = require('../../helpers/temporalSourceRuntime');
const N = (id, type, data = {}) => ({ id, type, data });
const E = (source, target, sourceHandle = 'output') => ({ source, target, sourceHandle });
const failed = () => ({ output: { success: false, v: 'must-not-survive', error: { message: 'business failure' } }, nextHandle: 'error' });
const graph = data => ({ nodes: [N('s', 'start'), N('j', 'javascript', { outputVariable: 'v', ...data }), N('e', 'end')], edges: [E('s', 'j'), E('j', 'e', 'error')] });

describe('actual DSL node outcome scenarios', () => {
  test.each(['continue', 'retry_then_continue'])('%s reports FAILED and clears stale output before continuing', async errorHandling => {
    const run = await runGraph({ ...graph({ errorHandling, retryLimit: 1, retryDelaySeconds: 0 }), initialContext: { v: 'stale' }, onExecute: ({ node }) => node.id === 'j' ? failed() : undefined });
    expect(run.error).toBeUndefined();
    expect(run.result.v).toBeNull();
    expect(run.result.__node_j.status).toBe('FAILED');
    const events = run.progress.filter(row => row.nodeID === 'j');
    expect(events.some(row => row.status === 'SUCCESS')).toBe(false);
    expect(events.at(-1)).toMatchObject({ status: 'FAILED', output: { v: null }, contextData: { v: null }, required: true });
  });

  test('thrown continued errors also clear stale values before error-path consumers run', async () => {
    const run = await runGraph({ ...graph({ errorHandling: 'continue' }), initialContext: { v: 'stale' }, onExecute: ({ node }) => { if (node.id === 'j') throw new Error('transport failure'); } });
    expect(run.error).toBeUndefined();
    expect(run.result.v).toBeNull();
    expect(run.progress.find(row => row.nodeID === 'j' && row.status === 'FAILED').contextData.v).toBeNull();
  });

  test('fail_workflow retries returned failures then fails instead of emitting success', async () => {
    let attempts = 0;
    const run = await runGraph({ ...graph({ errorHandling: 'fail_workflow', retryLimit: 2, retryDelaySeconds: 0 }), onExecute: ({ node }) => { if (node.id === 'j') { attempts++; return failed(); } } });
    expect(attempts).toBe(3);
    expect(run.error.message).toMatch(/business failure/);
    expect(run.terminal.at(-1).finalStatus).toBe('FAILED');
    expect(run.progress.filter(row => row.nodeID === 'j' && row.status === 'SUCCESS')).toHaveLength(0);
  });

  test('continue_default routes to default with the configured fallback output', async () => {
    const definition = graph({ errorHandling: 'continue_default', defaultOutput: 7 });
    definition.edges[1].sourceHandle = 'default';
    const run = await runGraph({ ...definition, onExecute: ({ node }) => node.id === 'j' ? failed() : undefined });
    expect(run.error).toBeUndefined();
    expect(run.result.v).toBe(7);
    expect(run.result._workflowStatus).toBe('COMPLETED');
  });

  test('skip_item omits the failed iteration rather than storing a stale result', async () => {
    const run = await runGraph({
      nodes: [N('s', 'start'), N('l', 'loop', { sourceVariable: 'items' }), N('j', 'javascript', { errorHandling: 'skip_item', code: 'return ctx.item;', outputVariable: 'v' }), N('e', 'end')],
      edges: [E('s', 'l'), E('l', 'j', 'loop'), E('j', 'l', 'success'), E('l', 'e', 'completed')],
      initialContext: { items: [1, 2] },
      onExecute: ({ node, context }) => node.id === 'j' && context.item === 1 ? failed() : undefined,
    });
    expect(run.error).toBeUndefined();
    expect(run.result.loopResults).toEqual([2]);
  });

  test('required progress commit failure is not swallowed as mere observability loss', async () => {
    const run = await runGraph({ nodes: [N('s', 'start'), N('e', 'end')], edges: [E('s', 'e')], onProgress: data => { if (data.nodeID === 's' && data.status === 'SUCCESS') throw new Error('DB commit unavailable'); } });
    expect(run.error.message).toMatch(/DB commit unavailable/);
    expect(run.progress.some(row => row.nodeID === 'e')).toBe(false);
    expect(run.terminal.at(-1).finalStatus).toBe('FAILED');
  });

  test('implicit completion has one finalization command', async () => {
    const run = await runGraph({ nodes: [N('s', 'start')], edges: [] });
    expect(run.error).toBeUndefined();
    expect(run.terminal).toHaveLength(1);
  });

  test('cancelled End is a cancelled node outcome, not success/failed', async () => {
    const run = await runGraph({ nodes: [N('s', 'start'), N('e', 'end', { status: 'cancelled' })], edges: [E('s', 'e')] });
    expect(run.error).toBeUndefined();
    expect(run.result.__node_e.status).toBe('CANCELLED');
    expect(run.progress.find(row => row.nodeID === 'e' && row.status !== 'RUNNING').status).toBe('CANCELLED');
    expect(run.terminal.at(-1).finalStatus).toBe('CANCELLED');
  });

  test('legacy histories retain their original outcome command branch', async () => {
    const run = await runGraph({ ...graph({ errorHandling: 'continue' }), repaired: false, onExecute: ({ node }) => node.id === 'j' ? failed() : undefined });
    expect(run.progress.some(row => row.nodeID === 'j' && row.status === 'SUCCESS')).toBe(true);
    expect(run.progress.every(row => !row.required)).toBe(true);
  });
});
