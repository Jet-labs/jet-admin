const path = require('path');
const { buildSync } = require('esbuild');
const contract = require('@jet-admin/workflow-nodes-logic/runtime-contract');
const { applyWorkflowConfigToNodes } = require('../../../modules/workflow/temporal/workflowConfig');
const { buildProgressPayload } = require('../../../modules/workflow/temporal/activities/emitProgress');

// Execute the source, not a potentially stale package dist.
const compiled = buildSync({ entryPoints: [path.resolve(__dirname, '../../../../../packages/workflow-nodes-logic/src/index.js')],
  bundle: true, write: false, format: 'cjs', packages: 'external', platform: 'node',
}).outputFiles[0].text;
const source = { exports: {} };
new Function('require', 'module', 'exports', compiled)(require, source, source.exports);
const { executeNode } = source.exports;

describe('node execution and projection contract', () => {
  test.each(Object.entries(contract.OUTPUT_DEFAULTS))('%s materializes handler default output %s before starting Temporal', (type, outputVariable) => {
    const original = { id: 'n', type, data: {} };
    expect(applyWorkflowConfigToNodes([original], {})[0].data).toMatchObject({ outputVariable, errorHandling: 'fail_workflow' });
    expect(original.data).toEqual({});
  });
  test.each(['javascript', 'dataQuery', 'subWorkflow', 'approval', 'dataCollection'])('disabled %s performs no user code, service call or wait', async type => {
    const runSubWorkflow = jest.fn(), executeDataQuery = jest.fn();
    const result = await executeNode({ node: { id: 'n', type, data: { isDisabled: true, code: 'throw new Error("must not run")' } }, services: { runSubWorkflow, executeDataQuery } });
    expect(result).toMatchObject({ skipped: true, output: { skipped: true, success: true } });
    expect(result.suspended).not.toBe(true);
    expect(runSubWorkflow).not.toHaveBeenCalled();
    expect(executeDataQuery).not.toHaveBeenCalled();
  });
  test('default JavaScript output matches materialized workflow namespace', async () => {
    const node = applyWorkflowConfigToNodes([{ id: 'j', type: 'javascript', data: { code: 'return 42;' } }], {})[0];
    const result = await executeNode({ node });
    expect(result.output[node.data.outputVariable]).toBe(42);
  });
  test('context patch and named output both survive persistence', () => {
    const payload = buildProgressPayload({ nodeID: 'j', outputVariable: 'v', output: { __contextPatch: { a: 1 }, v: 2, success: true } });
    expect(payload).toMatchObject({ a: 1, v: 2 });
  });
  test('same delta gives identical live and persisted values including delete/reinsert', () => {
    const params = { nodeID: 'j', outputVariable: 'v', output: { __contextPatch: { a: 1 }, __deleteKeys: ['old', 'v'], v: null, success: false } };
    const live = contract.applyContextDelta({ old: 1, v: 'stale' }, contract.buildContextDelta(params));
    const { __deleteKeys = [], ...values } = buildProgressPayload(params);
    const persisted = { old: 1, v: 'stale' };
    for (const key of __deleteKeys) delete persisted[key];
    Object.assign(persisted, values);
    expect(persisted).toEqual(live);
    expect(persisted.v).toBeNull();
    expect(persisted.old).toBeUndefined();
  });
  test.each([0, false, '', null])('End preserves falsy output %s', output => {
    expect(buildProgressPayload({ nodeID: 'e', nodeType: 'end', output: { workflowOutput: output } }).output).toBe(output);
  });
  test('subworkflow opt-in merge uses a context patch without clobbering parent input', async () => {
    const result = await executeNode({
      node: { id: 'child', type: 'subWorkflow', data: { childWorkflowID: 'child-wf', mergeOutputs: true } },
      helpers: { tenantID: 't' },
      services: { runSubWorkflow: async () => ({ status: 'COMPLETED', output: 2, contextSnapshot: { input: { foreign: true }, answer: 42 } }) },
    });
    expect(result.output.__contextPatch).toEqual({ answer: 42 });
    expect(result.output.subResult).toBe(2);
  });
});
