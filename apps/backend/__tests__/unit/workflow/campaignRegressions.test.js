const { runGraph } = require('../../helpers/temporalSourceRuntime');
const contract = require('@jet-admin/workflow-nodes-logic/runtime-contract');
const N = (id, type, data = {}) => ({ id, type, data });
const E = (source, target, sourceHandle = 'output') => ({ source, target, sourceHandle });

describe('visual QA campaign source regressions', () => {
  test.each([
    { name: 'multiple starts', nodes: [N('s', 'start'), N('s2', 'start')], edges: [], message: /exactly one start/ },
    { name: 'unreachable delay', nodes: [N('s', 'start'), N('e', 'end'), N('orphan', 'delay')], edges: [E('s', 'e')], message: /Unreachable/ },
  ])('$name is rejected before any node executes', async ({ nodes, edges, message }) => {
    const run = await runGraph({ nodes, edges });
    expect(run.error.message).toMatch(message);
    expect(run.progress).toEqual([]);
    expect(run.terminal).toHaveLength(1);
    expect(run.terminal[0].finalStatus).toBe('FAILED');
  });

  const joinGraph = (requireAll, errorEdge = false) => ({
    nodes: [N('s', 'start'), N('fan', 'fanout', { branches: [{ id: 'a' }, { id: 'b' }] }),
      N('a-fast', 'javascript', { code: 'return "A";', outputVariable: 'qaA' }),
      N('z-slow', 'delay', { delaySeconds: 1 }), N('z-value', 'javascript', { code: 'return "B";', outputVariable: 'qaB' }),
      N('b-join', 'join', { joinMode: 'any', requireAll, sourceVariables: ['qaA', 'qaB'], errorHandling: 'continue' }), N('c-end', 'end')],
    edges: [E('s', 'fan'), E('fan', 'a-fast', 'a'), E('fan', 'z-slow', 'b'), E('z-slow', 'z-value'),
      E('a-fast', 'b-join', 'success'), E('z-value', 'b-join', 'success'), E('b-join', 'c-end', errorEdge ? 'error' : 'output')],
  });

  test('Join any with requireAll fails truthfully when the first branch lacks another required variable', async () => {
    const run = await runGraph(joinGraph(true));
    expect(run.error.message).toMatch(/Unhandled failure/);
    expect(run.progress.find(row => row.nodeID === 'b-join' && row.status === 'FAILED').errorMessage).toMatch(/qaB/);
    expect(run.progress.some(row => row.nodeID === 'b-join' && row.status === 'SUCCESS')).toBe(false);
    expect(run.progress.some(row => row.nodeID === 'c-end')).toBe(false);
    expect(run.terminal.at(-1).finalStatus).toBe('FAILED');
  });

  test('Join any with optional variables continues once from the first upstream', async () => {
    const run = await runGraph(joinGraph(false));
    expect(run.error).toBeUndefined();
    expect(run.result.joined).toEqual({ qaA: 'A', qaB: null });
    expect(run.progress.filter(row => row.nodeID === 'b-join' && row.status === 'RUNNING')).toHaveLength(1);
    expect(run.progress.filter(row => row.nodeID === 'c-end' && row.status === 'RUNNING')).toHaveLength(1);
    // End is whole-run terminal: no late branch can fire the downstream again.
    expect(run.progress.some(row => row.nodeID === 'z-slow')).toBe(false);
    expect(run.terminal).toHaveLength(1);
  });

  test('Join any can route a missing-variable failure to an explicit error End', async () => {
    const definition = joinGraph(true, true);
    definition.nodes.find(node => node.id === 'c-end').data.status = 'failure';
    const run = await runGraph(definition);
    expect(run.error).toBeUndefined();
    expect(run.result._workflowStatus).toBe('FAILED');
    expect(run.result['__node_b-join'].status).toBe('FAILED');
  });

  test('loop final snapshot restores the parent scope instead of the penultimate body value', async () => {
    const run = await runGraph({
      nodes: [N('s', 'start'), N('l', 'loop', { sourceVariable: 'items' }),
        N('body', 'javascript', { code: 'return ctx.item * 2;', outputVariable: 'doubled' }), N('end', 'end')],
      edges: [E('s', 'l'), E('l', 'body', 'loop'), E('body', 'l', 'success'), E('l', 'end', 'completed')],
      initialContext: { items: [1, 2, 3] },
    });
    expect(run.error).toBeUndefined();
    expect(run.terminal[0].contextData.loopResults).toEqual([2, 4, 6]);
    expect(run.terminal[0].contextData).not.toHaveProperty('doubled');
    expect(run.terminal[0].contextData).not.toHaveProperty('item');
  });

  test('merged child outputs are available to downstream parent nodes without overwriting input', async () => {
    const run = await runGraph({
      nodes: [N('s', 'start'), N('child', 'subWorkflow', { childWorkflowID: 'child-wf', mergeOutputs: true }),
        N('next', 'javascript', { code: 'return ctx.childValue;', outputVariable: 'seen' }),
        N('end', 'end', { outputParameters: [{ name: 'answer', sourceVariable: '{{ctx.seen}}' }] })],
      edges: [E('s', 'child'), E('child', 'next', 'success'), E('next', 'end', 'success')],
      initialContext: { input: { owner: 'parent' } },
      services: { runSubWorkflow: async () => ({ status: 'COMPLETED', childInstanceID: 'child-run',
        output: { childOut: 42 }, contextSnapshot: { input: { owner: 'child' }, childValue: 42 } }) },
    });
    expect(run.error).toBeUndefined();
    expect(run.result).toMatchObject({ childValue: 42, seen: 42, input: { owner: 'parent' } });
    expect(run.terminal[0]).toMatchObject({ workflowOutput: { answer: 42 }, contextData: { output: { answer: 42 } } });
    expect(run.result.__node_child.output.childInstanceID).toBe('child-run');
  });

  test('wrapped child failures preserve an actionable message and linkage in progress', async () => {
    const cause = { message: 'Child workflow child-wf ended with status FAILED: invalid child input',
      details: [{ childInstanceID: 'child-run', childStatus: 'FAILED' }] };
    const wrapped = Object.assign(new Error('Activity task failed'), { cause });
    const run = await runGraph({
      nodes: [N('s', 'start'), N('child', 'subWorkflow', { childWorkflowID: 'child-wf', errorHandling: 'continue' }), N('e', 'end', { status: 'failure' })],
      edges: [E('s', 'child'), E('child', 'e', 'error')],
      onExecute: ({ node }) => { if (node.id === 'child') throw wrapped; },
    });
    const failure = run.progress.find(row => row.nodeID === 'child' && row.status === 'FAILED');
    expect(failure.errorMessage).toMatch(/invalid child input/);
    expect(failure.output.error).toMatchObject({ childInstanceID: 'child-run', childStatus: 'FAILED' });
    expect(contract.describeWorkflowFailure(wrapped).message).not.toBe('Activity task failed');
  });
});
