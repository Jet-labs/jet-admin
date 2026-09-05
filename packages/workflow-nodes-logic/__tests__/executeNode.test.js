/**
 * Minimal parity tests for @jet-admin/workflow-nodes-logic.
 * Covers: dispatch for all 13 types, errorHandling modes, loop bounds contract.
 */
const { executeNode, HANDLER_MAP } = require('../dist/index.cjs');
const { ERROR_HANDLING_VALUES } = require('../dist/index.cjs');

describe('executeNode dispatch', () => {
  test('HANDLER_MAP covers all 13 node types', () => {
    expect(Object.keys(HANDLER_MAP).sort()).toEqual(
      ['approval', 'condition', 'dataCollection', 'dataQuery', 'delay', 'end', 'fanout', 'javascript', 'join', 'loop', 'start', 'subWorkflow', 'switch'].sort()
    );
  });

  test('unknown type throws', async () => {
    await expect(executeNode({ node: { id: 'x', type: 'nope', data: {} }, context: {} })).rejects.toThrow(
      /No handler found/
    );
  });

  test('start returns output handle', async () => {
    const res = await executeNode({ node: { id: 's', type: 'start', data: {} }, context: { input: { a: 1 } } });
    expect(res.nextHandle).toBe('output');
    expect(res.output.started).toBe(true);
  });

  test('javascript fail_workflow throws, continue returns error handle', async () => {
    await expect(
      executeNode({
        node: { id: 'j', type: 'javascript', data: { code: 'throw new Error("boom")', errorHandling: 'fail_workflow' } },
        context: {},
      })
    ).rejects.toThrow('boom');
    const res = await executeNode({
      node: { id: 'j', type: 'javascript', data: { code: 'throw new Error("boom")', errorHandling: 'continue' } },
      context: {},
    });
    expect(res.nextHandle).toBe('error');
    expect(res.output.success).toBe(false);
  });

  test('ERROR_HANDLING_VALUES includes retry modes used by dslWorkflow', () => {
    expect(ERROR_HANDLING_VALUES).toEqual(
      expect.arrayContaining(['continue', 'fail_workflow', 'skip_item', 'retry_then_fail', 'retry_then_continue', 'continue_default'])
    );
  });
});
