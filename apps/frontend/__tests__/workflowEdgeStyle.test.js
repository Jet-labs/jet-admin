import { getWorkflowEdgeType } from '../src/logic/workflowEditorState';

describe('persisted workflow edge style', () => {
  test.each(['default', 'straight', 'step', 'smoothstep', 'simplebezier'])('prefers saved %s even on an empty canvas', edgeType => {
    expect(getWorkflowEdgeType({ workflowOptions: { edgeType }, edges: [] })).toBe(edgeType);
  });
  test('legacy workflows infer the first non-error style', () => {
    expect(getWorkflowEdgeType({ edges: [{ type: 'error' }, { type: 'straight' }] })).toBe('straight');
  });
  test('error-only and unknown legacy graphs use a connectable default', () => {
    expect(getWorkflowEdgeType({ edges: [{ type: 'error' }, { type: 'legacy-unknown' }] })).toBe('smoothstep');
  });
});
