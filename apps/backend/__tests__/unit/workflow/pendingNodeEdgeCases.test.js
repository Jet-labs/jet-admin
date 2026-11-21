const { runGraph, executeNode } = require('../../helpers/temporalSourceRuntime');
const N = (id, type, data = {}) => ({ id, type, data });
const E = (source, target, sourceHandle = 'output') => ({ source, target, sourceHandle });
const resolveTemplate = value => value === '{{ctx.value}}' ? 0 : value;

describe('remaining node boundaries (source-level, not browser coverage)', () => {
  test.each([
    ['equals', 0, '0', true], ['not_equals', false, 'false', false],
    ['contains', 'abc', 'bc', true], ['not_contains', 'abc', 'd', true],
    ['starts_with', 'abc', 'ab', true], ['ends_with', 'abc', 'bc', true],
    ['greater_than', '9', '10', false], ['greater_than', '10', '10', false], ['greater_than', '11', '10', true],
    ['less_than', '9', '10', true], ['greater_or_equal', 10, 10, true], ['less_or_equal', 10, 10, true],
    ['is_empty', null, '', true], ['is_empty', [], '', true], ['is_empty', 0, '', false],
    ['is_not_empty', false, '', true], ['matches_regex', 'abc123', '\\d+', true], ['matches_regex', 'abc', '[', false],
  ])('Condition %s on %j / %j matches=%s', async (operator, left, right, matches) => {
    const result = await executeNode({ node: N('condition', 'condition', { branches: [{ id: 'match', conditions: [{ operator, leftValue: left, rightValue: right }] }] }) });
    expect(result.nextHandle).toBe(matches ? 'match' : 'default');
  });

  test('overlapping Switch cases take the first matching case only', async () => {
    const result = await executeNode({ node: N('switch', 'switch', { switchValue: 'xfoo', cases: [
      { id: 'first', operator: 'contains', matchValue: 'x' },
      { id: 'second', operator: 'expression', matchValue: 'true' },
    ] }) });
    expect(result.nextHandle).toBe('first');
  });

  test('Switch templates preserve zero rather than substituting an empty value', async () => {
    const result = await executeNode({ node: N('switch', 'switch', { switchValue: '{{ctx.value}}', cases: [{ id: 'zero', matchValue: '0' }] }), helpers: { resolveTemplate } });
    expect(result.nextHandle).toBe('zero');
    expect(result.output.value).toBe(0);
  });

  test('disabled Delay neither waits nor evaluates an invalid time', async () => {
    const run = await runGraph({ nodes: [N('s', 'start'), N('d', 'delay', { isDisabled: true, delayType: 'until', untilTime: 'invalid' }), N('e', 'end')],
      edges: [E('s', 'd'), E('d', 'e')], onSleep: () => { throw new Error('disabled timer slept'); } });
    expect(run.error).toBeUndefined();
    expect(run.progress.find(row => row.nodeID === 'd' && row.status === 'SKIPPED')).toBeDefined();
    expect(run.result._workflowStatus).toBe('COMPLETED');
  });

  test('nested loops execute their own body and restore the parent scope', async () => {
    const run = await runGraph({ nodes: [N('s', 'start'), N('outer', 'loop', { sourceVariable: 'items', outputVariable: 'outerResults' }),
      N('inner', 'loop', { sourceVariable: 'item', outputVariable: 'innerResults' }),
      N('body', 'javascript', { code: 'return ctx.item * 2;', outputVariable: 'v' }), N('e', 'end')],
      edges: [E('s', 'outer'), E('outer', 'inner', 'loop'), E('inner', 'body', 'loop'), E('body', 'inner', 'success'),
        E('inner', 'outer', 'completed'), E('outer', 'e', 'completed')], initialContext: { items: [[1, 2], [3]] } });
    expect(run.error).toBeUndefined();
    expect(run.result.outerResults.map(result => result.innerResults)).toEqual([[2, 4], [6]]);
    expect(run.progress.filter(row => row.nodeID === 'body' && row.status === 'RUNNING')).toHaveLength(3);
    expect(run.result).not.toHaveProperty('item');
  });

  test('child input mapping preserves native types and passes only the mapped inputs', async () => {
    const runSubWorkflow = jest.fn().mockResolvedValue({ status: 'COMPLETED', output: false });
    const result = await executeNode({ node: N('sub', 'subWorkflow', { childWorkflowID: 'child', inputMapping: { n: '{{ctx.value}}', b: false, arr: [1, 2] } }),
      context: { secretParentValue: 'not mapped' }, services: { runSubWorkflow }, helpers: { resolveTemplate, workflowID: 'parent' } });
    expect(runSubWorkflow.mock.calls[0][0].inputValues).toEqual({ n: 0, b: false, arr: [1, 2] });
    expect(result.output.subResult).toBe(false);
  });

  test.each([
    [{ childWorkflowID: 'parent' }, {}, /self-reference/],
    [{ childWorkflowID: 'child', maxDepth: 1 }, { __subDepth: 1 }, /max depth/],
    [{}, {}, /pick a saved workflow/],
  ])('invalid child invocation never starts a child (%j)', async (data, context, message) => {
    const runSubWorkflow = jest.fn();
    await expect(executeNode({ node: N('sub', 'subWorkflow', data), context, helpers: { workflowID: 'parent' }, services: { runSubWorkflow } })).rejects.toThrow(message);
    expect(runSubWorkflow).not.toHaveBeenCalled();
  });

  test('child failure exposes its status and ID on the error path', async () => {
    const result = await executeNode({ node: N('sub', 'subWorkflow', { childWorkflowID: 'child', errorHandling: 'continue' }),
      services: { runSubWorkflow: async () => ({ childInstanceID: 'child-run', status: 'FAILED', errorMessage: 'invalid input' }) } });
    expect(result.nextHandle).toBe('error');
    expect(result.output.error).toMatchObject({ childInstanceID: 'child-run', childStatus: 'FAILED' });
    expect(result.output.error.message).toMatch(/invalid input/);
  });

  test('missing Data Query fails before any query service is called', async () => {
    const authorizedExecuteDataQuery = jest.fn();
    await expect(executeNode({ node: N('q', 'dataQuery'), services: { authorizedExecuteDataQuery } })).rejects.toThrow(/dataQueryID/);
    expect(authorizedExecuteDataQuery).not.toHaveBeenCalled();
  });
});
