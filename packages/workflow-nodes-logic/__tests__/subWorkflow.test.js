/**
 * Sub-Workflow (sub-playbook) handler tests.
 * Covers: validation, self-reference + depth guards, input template mapping,
 * isolated context contract, merge-back, child failure mapping, dispatch.
 */
const { executeNode, executeSubWorkflow, HANDLER_MAP } = require('../dist/index.cjs');

const baseHelpers = { tenantID: 't1', instanceID: 'i1', workflowID: 'parent-wf', nodeID: 'n1' };

function mockRunSubWorkflow(result) {
  return jest.fn(async () => result);
}

describe('subWorkflow handler', () => {
  test('registered in HANDLER_MAP as subWorkflow', () => {
    expect(HANDLER_MAP.subWorkflow).toBe(executeSubWorkflow);
  });

  test('missing childWorkflowID: fail_workflow throws, continue returns error handle', async () => {
    await expect(
      executeSubWorkflow({ errorHandling: 'fail_workflow' }, {}, baseHelpers, {})
    ).rejects.toThrow(/childWorkflowID/);
    const res = await executeSubWorkflow({ errorHandling: 'continue', outputVariable: 'sub' }, {}, baseHelpers, {});
    expect(res.nextHandle).toBe('error');
    expect(res.output.sub).toBeNull();
    expect(res.output.success).toBe(false);
  });

  test('self-reference is rejected', async () => {
    const res = await executeSubWorkflow(
      { childWorkflowID: 'parent-wf', errorHandling: 'continue' },
      {},
      baseHelpers,
      { runSubWorkflow: mockRunSubWorkflow({}) }
    );
    expect(res.nextHandle).toBe('error');
    expect(res.output.error.message).toMatch(/self-reference/);
  });

  test('maxDepth guard blocks deep nesting', async () => {
    const res = await executeSubWorkflow(
      { childWorkflowID: 'child-wf', maxDepth: 2, errorHandling: 'continue' },
      { __subDepth: 2 },
      baseHelpers,
      { runSubWorkflow: mockRunSubWorkflow({}) }
    );
    expect(res.nextHandle).toBe('error');
    expect(res.output.error.message).toMatch(/max depth/i);
  });

  test('resolves {{ctx.*}} mapping against parent ctx; child sees only mapped inputs', async () => {
    const runSubWorkflow = mockRunSubWorkflow({
      childInstanceID: 'child-i1',
      status: 'COMPLETED',
      output: { summary: 'ok' },
      contextSnapshot: {},
    });
    const resolveTemplate = (tpl) => {
      if (tpl === '{{ctx.input.vs}}') return 'usd';
      if (tpl === '{{ctx.limit}}') return 5;
      return tpl;
    };
    const res = await executeSubWorkflow(
      {
        childWorkflowID: 'child-wf',
        inputMapping: { vs: '{{ctx.input.vs}}', limit: '{{ctx.limit}}', fixed: 'USD' },
        outputVariable: 'childOut',
      },
      { input: { vs: 'usd' }, limit: 5, secretParentVar: 'hidden' },
      { ...baseHelpers, resolveTemplate },
      { runSubWorkflow }
    );
    expect(res.nextHandle).toBe('success');
    expect(runSubWorkflow).toHaveBeenCalledWith(expect.objectContaining({
      childWorkflowID: 'child-wf',
      inputValues: { vs: 'usd', limit: 5, fixed: 'USD' },
      depth: 0,
    }));
    expect(res.output.childOut).toEqual({ summary: 'ok' });
    expect(res.output.childInstanceID).toBe('child-i1');
    expect(res.output.secretParentVar).toBeUndefined();
  });

  test('mergeOutputs spreads child snapshot except input and __ keys', async () => {
    const runSubWorkflow = mockRunSubWorkflow({
      childInstanceID: 'child-i1',
      status: 'COMPLETED',
      output: { summary: 'ok' },
      contextSnapshot: { report: { a: 1 }, input: { hacked: true }, __subDepth: 1 },
    });
    const res = await executeSubWorkflow(
      { childWorkflowID: 'child-wf', outputVariable: 'childOut', mergeOutputs: true },
      {},
      baseHelpers,
      { runSubWorkflow }
    );
    expect(res.output.report).toEqual({ a: 1 });
    expect(res.output.input).toBeUndefined();
    expect(res.output.__subDepth).toBeUndefined();
    expect(res.output.childOut).toEqual({ summary: 'ok' });
  });

  test('child FAILED + continue maps to error handle with null output', async () => {
    const runSubWorkflow = mockRunSubWorkflow({
      childInstanceID: 'child-i1',
      status: 'FAILED',
      output: null,
      contextSnapshot: {},
      errorMessage: 'boom in child',
    });
    const res = await executeSubWorkflow(
      { childWorkflowID: 'child-wf', errorHandling: 'continue' },
      {},
      baseHelpers,
      { runSubWorkflow }
    );
    expect(res.nextHandle).toBe('error');
    expect(res.output.subResult).toBeNull();
    expect(res.output.error.message).toMatch(/FAILED/);
  });

  test('dispatches through executeNode with services injection', async () => {
    const runSubWorkflow = mockRunSubWorkflow({
      childInstanceID: 'child-i1',
      status: 'COMPLETED',
      output: 42,
      contextSnapshot: {},
    });
    const res = await executeNode({
      node: { id: 'n1', type: 'subWorkflow', data: { childWorkflowID: 'child-wf', outputVariable: 'answer' } },
      context: {},
      helpers: baseHelpers,
      services: { runSubWorkflow },
    });
    expect(res.nextHandle).toBe('success');
    expect(res.output.answer).toBe(42);
  });
});
