const {
  createWorkflowSchema,
  executeWorkflowSchema,
  testWorkflowSchema,
  updateWorkflowSchema,
} = require('../../../modules/workflow/workflow.validator');
const {
  MUSTACHE_ONLY_TEMPLATE_MESSAGE,
} = require("@jet-admin/expression-engine");

describe('workflow.validator', () => {
  it('accepts canonical create payloads', () => {
    const result = createWorkflowSchema.safeParse({
      title: 'My Workflow',
      nodes: [{ id: 'n1' }],
      edges: [],
    });

    expect(result.success).toBe(true);
  });

  it('rejects create payloads without title field', () => {
    const result = createWorkflowSchema.safeParse({
      nodes: [],
      edges: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects raw ctx paths in workflow template fields for create payloads', () => {
    const result = createWorkflowSchema.safeParse({
      title: 'My Workflow',
      nodes: [{
        id: 'n1',
        type: 'dataQuery',
        data: {
          inputValues: {
            customerID: 'ctx.input.customerID',
          },
        },
      }],
      edges: [],
    });

    expect(result.success).toBe(false);
    expect(result.error.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: ['nodes', 0, 'data', 'inputValues', 'customerID'],
        message: MUSTACHE_ONLY_TEMPLATE_MESSAGE,
      }),
    ]));
  });

  it('rejects raw ctx paths in update payloads for loop and end nodes', () => {
    const result = updateWorkflowSchema.safeParse({
      nodes: [
        {
          id: 'loop-1',
          type: 'loop',
          data: { sourceVariable: 'ctx.items' },
        },
        {
          id: 'end-1',
          type: 'end',
          data: {
            outputParameters: [{ name: 'drivers', sourceVariable: 'ctx.drivers' }],
          },
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: ['nodes', 0, 'data', 'sourceVariable'],
        message: MUSTACHE_ONLY_TEMPLATE_MESSAGE,
      }),
      expect.objectContaining({
        path: ['nodes', 1, 'data', 'outputParameters', 0, 'sourceVariable'],
        message: MUSTACHE_ONLY_TEMPLATE_MESSAGE,
      }),
    ]));
  });

  it('keeps raw ctx expressions allowed in non-template nodes', () => {
    const result = createWorkflowSchema.safeParse({
      title: 'My Workflow',
      nodes: [
        {
          id: 'condition-1',
          type: 'condition',
          data: {
            branches: [{ id: 'b1', condition: 'ctx.input.total > 100' }],
          },
        },
        {
          id: 'js-1',
          type: 'javascript',
          data: {
            code: 'return ctx.input.customerID;',
          },
        },
      ],
      edges: [],
    });

    expect(result.success).toBe(true);
  });

  it('accepts canonical execute payload fields', () => {
    expect(executeWorkflowSchema.safeParse({ inputParams: { customerID: 1 } }).success).toBe(true);
  });

  it('rejects raw ctx paths in test workflow payloads', () => {
    const result = testWorkflowSchema.safeParse({
      nodes: [{
        id: 'delay-1',
        type: 'delay',
        data: { delayVariable: 'ctx.waitTime', untilTime: 'ctx.targetTime' },
      }],
      edges: [],
    });

    expect(result.success).toBe(false);
    expect(result.error.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: ['nodes', 0, 'data', 'delayVariable'],
        message: MUSTACHE_ONLY_TEMPLATE_MESSAGE,
      }),
      expect.objectContaining({
        path: ['nodes', 0, 'data', 'untilTime'],
        message: MUSTACHE_ONLY_TEMPLATE_MESSAGE,
      }),
    ]));
  });
});