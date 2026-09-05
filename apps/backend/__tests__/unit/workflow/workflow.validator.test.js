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

  it('rejects raw ctx paths in subWorkflow inputMapping', () => {
    const result = createWorkflowSchema.safeParse({
      title: 'Parent',
      nodes: [{
        id: 'sub-1',
        type: 'subWorkflow',
        data: {
          childWorkflowID: '123e4567-e89b-12d3-a456-426614174000',
          inputMapping: { vs: 'ctx.input.vs' },
        },
      }],
      edges: [],
    });

    expect(result.success).toBe(false);
    expect(result.error.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: ['nodes', 0, 'data', 'inputMapping', 'vs'],
        message: MUSTACHE_ONLY_TEMPLATE_MESSAGE,
      }),
    ]));
  });

  it('validates subWorkflow childWorkflowID, maxDepth and outputVariable', () => {
    const bad = createWorkflowSchema.safeParse({
      title: 'Parent',
      nodes: [{
        id: 'sub-1',
        type: 'subWorkflow',
        data: {
          childWorkflowID: 'not-a-uuid',
          maxDepth: 99,
          outputVariable: 'has space',
          timeoutSeconds: 0,
        },
      }],
      edges: [],
    });
    expect(bad.success).toBe(false);
    const paths = bad.error.issues.map((i) => i.path.join('.'));
    expect(paths).toEqual(expect.arrayContaining([
      'nodes.0.data.childWorkflowID',
      'nodes.0.data.maxDepth',
      'nodes.0.data.outputVariable',
      'nodes.0.data.timeoutSeconds',
    ]));

    const good = createWorkflowSchema.safeParse({
      title: 'Parent',
      nodes: [{
        id: 'sub-1',
        type: 'subWorkflow',
        data: {
          childWorkflowID: '123e4567-e89b-12d3-a456-426614174000',
          inputMapping: { vs: '{{ctx.input.vs}}' },
          outputVariable: 'childOut',
          maxDepth: 3,
          timeoutSeconds: 300,
        },
      }],
      edges: [],
    });
    expect(good.success).toBe(true);
  });

  it('rejects raw ctx paths in switch switchValue and case matchValues', () => {
    const result = createWorkflowSchema.safeParse({
      title: 'Router',
      nodes: [{
        id: 'sw-1',
        type: 'switch',
        data: {
          switchValue: 'ctx.status',
          cases: [{ id: 'a', operator: 'equals', matchValue: 'ctx.other' }],
        },
      }],
      edges: [],
    });

    expect(result.success).toBe(false);
    expect(result.error.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: ['nodes', 0, 'data', 'switchValue'],
        message: MUSTACHE_ONLY_TEMPLATE_MESSAGE,
      }),
      expect.objectContaining({
        path: ['nodes', 0, 'data', 'cases', 0, 'matchValue'],
        message: MUSTACHE_ONLY_TEMPLATE_MESSAGE,
      }),
    ]));
  });

  it('validates switch cases, approval, fanout and join configs', () => {
    const dupes = createWorkflowSchema.safeParse({
      title: 'Router',
      nodes: [
        { id: 'sw-1', type: 'switch', data: { switchValue: '{{ctx.s}}', cases: [{ id: 'a' }, { id: 'a' }] } },
        { id: 'fo-1', type: 'fanout', data: { branches: [] } },
        { id: 'j-1', type: 'join', data: { joinMode: 'sometimes', outputVariable: 'bad name' } },
        { id: 'ap-1', type: 'approval', data: { expiryMinutes: -5, onTimeout: 'later' } },
      ],
      edges: [],
    });
    expect(dupes.success).toBe(false);
    const paths = dupes.error.issues.map((i) => i.path.join('.'));
    expect(paths).toEqual(expect.arrayContaining([
      'nodes.0.data.cases.1.id',
      'nodes.1.data.branches',
      'nodes.2.data.joinMode',
      'nodes.2.data.outputVariable',
      'nodes.3.data.expiryMinutes',
      'nodes.3.data.onTimeout',
    ]));

    const good = createWorkflowSchema.safeParse({
      title: 'Router',
      nodes: [
        { id: 'sw-1', type: 'switch', data: { switchValue: '{{ctx.s}}', cases: [{ id: 'a', operator: 'equals', matchValue: 'x' }] } },
        { id: 'fo-1', type: 'fanout', data: { branches: [{ id: 'a', name: 'A' }] } },
        { id: 'j-1', type: 'join', data: { joinMode: 'any', outputVariable: 'merged', sourceVariables: ['a'] } },
        { id: 'ap-1', type: 'approval', data: { expiryMinutes: 30, onTimeout: 'expired', outputVariable: 'ap' } },
      ],
      edges: [],
    });
    expect(good.success).toBe(true);
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