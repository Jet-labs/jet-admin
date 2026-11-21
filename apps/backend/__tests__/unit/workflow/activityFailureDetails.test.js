jest.mock('@jet-admin/workflow-nodes-logic', () => ({ executeNode: jest.fn() }));
jest.mock('../../../modules/workflow/temporal/activities/resolveTemplate', () => ({ buildResolveTemplate: () => value => value }));
jest.mock('../../../utils/input.util', () => ({ resolveInputs: jest.fn() }));
jest.mock('../../../utils/authorizedProxy', () => ({ authorizedExecuteDataQuery: jest.fn() }));
jest.mock('../../../modules/workflow/temporal/service', () => ({ runSubWorkflowAndWait: jest.fn() }));
jest.mock('../../../utils/executionContext', () => ({ createSystemContext: jest.fn(), ORIGIN_TYPES: {} }));
const { executeNode } = require('@jet-admin/workflow-nodes-logic');
const { executeNodeActivity } = require('../../../modules/workflow/temporal/activities/executeNode');

test('child linkage survives Temporal application-failure serialization', async () => {
  executeNode.mockRejectedValue(Object.assign(new Error('Child child-wf failed: invalid input'), { childInstanceID: 'child-run', childStatus: 'FAILED' }));
  await expect(executeNodeActivity({ node: { id: 'sub', type: 'subWorkflow', data: {} }, context: {} })).rejects.toMatchObject({
    message: 'Child child-wf failed: invalid input', details: [{ childInstanceID: 'child-run', childStatus: 'FAILED' }],
  });
});

test('deterministic code errors retain a real non-retryable ApplicationFailure', async () => {
  executeNode.mockRejectedValue(Object.assign(new Error('value is not defined'), { name: 'ReferenceError' }));
  await expect(executeNodeActivity({ node: { id: 'js', type: 'javascript', data: {} }, context: {} })).rejects.toMatchObject({
    name: 'ApplicationFailure', type: 'ReferenceError', nonRetryable: true,
  });
});
