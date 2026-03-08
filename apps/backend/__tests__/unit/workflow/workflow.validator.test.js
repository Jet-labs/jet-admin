const {
  createWorkflowSchema,
  executeWorkflowSchema,
  testWorkflowSchema,
} = require('../../../modules/workflow/workflow.validator');

describe('workflow.validator', () => {
  it('accepts canonical create payloads', () => {
    const result = createWorkflowSchema.safeParse({
      title: 'My Workflow',
      nodes: [{ id: 'n1' }],
      edges: [],
    });

    expect(result.success).toBe(true);
  });

  it('accepts legacy create payload aliases', () => {
    const result = createWorkflowSchema.safeParse({
      workflowTitle: 'Legacy Workflow',
      workflowNodes: [{ id: 'n1' }],
      workflowEdges: [],
    });

    expect(result.success).toBe(true);
  });

  it('rejects create payloads without either title field', () => {
    const result = createWorkflowSchema.safeParse({
      nodes: [],
      edges: [],
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('title is required');
  });

  it('accepts canonical and legacy execute payload fields', () => {
    expect(executeWorkflowSchema.safeParse({ inputParams: { customerID: 1 } }).success).toBe(true);
    expect(executeWorkflowSchema.safeParse({ args: { customerID: 1 } }).success).toBe(true);
  });

  it('accepts legacy workflow graph aliases for test workflow payloads', () => {
    const result = testWorkflowSchema.safeParse({
      workflowNodes: [{ id: 'n1' }],
      workflowEdges: [{ source: 'n1', target: 'n2' }],
      args: { test: true },
    });

    expect(result.success).toBe(true);
  });
});