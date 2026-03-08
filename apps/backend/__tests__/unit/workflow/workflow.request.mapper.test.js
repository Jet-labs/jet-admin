const {
  normalizeWorkflowGraphPayload,
  normalizeWorkflowInputParams,
} = require('../../../modules/workflow/workflow.request.mapper');

describe('workflow.request.mapper', () => {
  it('normalizes canonical workflow graph fields', () => {
    const result = normalizeWorkflowGraphPayload({
      title: 'Canonical Flow',
      nodes: [{ id: 'node-1' }],
      edges: [{ source: 'node-1', target: 'node-2' }],
      workflowOptions: { parallel: true },
    });

    expect(result).toEqual({
      title: 'Canonical Flow',
      nodes: [{ id: 'node-1' }],
      edges: [{ source: 'node-1', target: 'node-2' }],
      workflowOptions: { parallel: true },
    });
  });

  it('normalizes legacy workflow graph aliases', () => {
    const result = normalizeWorkflowGraphPayload({
      workflowTitle: 'Legacy Flow',
      workflowNodes: [{ id: 'legacy-node' }],
      workflowEdges: [{ source: 'legacy-node', target: 'next-node' }],
    });

    expect(result).toEqual({
      title: 'Legacy Flow',
      nodes: [{ id: 'legacy-node' }],
      edges: [{ source: 'legacy-node', target: 'next-node' }],
      workflowOptions: undefined,
    });
  });

  it('returns empty arrays when defaultEmptyGraph is enabled', () => {
    const result = normalizeWorkflowGraphPayload({}, { defaultEmptyGraph: true });

    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });

  it('normalizes input params from canonical and legacy fields', () => {
    expect(normalizeWorkflowInputParams({ inputParams: { id: 1 } })).toEqual({ id: 1 });
    expect(normalizeWorkflowInputParams({ args: { id: 2 } })).toEqual({ id: 2 });
    expect(normalizeWorkflowInputParams({})).toEqual({});
  });
});