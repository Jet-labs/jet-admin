import { isWorkflowRunActive, workflowEventLabel } from '../src/logic/workflowRunPresentation';

test.each(['PENDING', 'RUNNING', 'SUSPENDED'])('%s run details keep polling for the final state', status => {
  expect(isWorkflowRunActive(status)).toBe(true);
});
test.each(['COMPLETED', 'FAILED', 'CANCELLED', undefined])('%s run details stop polling', status => {
  expect(isWorkflowRunActive(status)).toBe(false);
});
test('workflow and node failures have different timeline labels', () => {
  expect(workflowEventLabel({ eventType: 'NODE_FAILED', nodeID: 'node' })).toBe('NODE FAILED');
  expect(workflowEventLabel({ eventType: 'NODE_FAILED', nodeID: null })).toBe('Workflow failed');
});
