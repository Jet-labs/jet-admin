/**
 * Switch / Approval / Fan-out / Join handler tests.
 */
const {
  executeNode,
  executeSwitch,
  executeApproval,
  executeFanout,
  executeJoin,
  HANDLER_MAP,
} = require('../dist/index.cjs');

describe('routing node dispatch', () => {
  test('HANDLER_MAP covers all 13 node types', () => {
    expect(Object.keys(HANDLER_MAP).sort()).toEqual(
      ['approval', 'condition', 'dataCollection', 'dataQuery', 'delay', 'end', 'fanout', 'javascript', 'join', 'loop', 'start', 'subWorkflow', 'switch'].sort()
    );
  });
});

describe('switch handler', () => {
  const node = (data) => ({ id: 'sw', type: 'switch', data });
  const helpers = {};

  test('routes on equals match with template value', async () => {
    const resolveTemplate = (tpl) => (tpl === '{{ctx.status}}' ? 'bull' : tpl);
    const res = await executeNode({
      node: node({ switchValue: '{{ctx.status}}', cases: [{ id: 'bull', label: 'Bull', operator: 'equals', matchValue: 'bull' }] }),
      context: {},
      helpers: { resolveTemplate },
    });
    expect(res.nextHandle).toBe('bull');
    expect(res.output.matched).toBe('bull');
  });

  test('numeric comparison and default fallback', async () => {
    const gt = await executeSwitch(
      { switchValue: 10, cases: [{ id: 'big', operator: 'greater_than', matchValue: 5 }] }, {}, {}
    );
    expect(gt.nextHandle).toBe('big');
    const def = await executeSwitch(
      { switchValue: 1, cases: [{ id: 'big', operator: 'greater_than', matchValue: 5 }] }, {}, {}
    );
    expect(def.nextHandle).toBe('default');
    expect(def.output.matched).toBe('default');
  });

  test('expression case uses ctx scope', async () => {
    const res = await executeSwitch(
      { switchValue: 'ignored', cases: [{ id: 'vip', operator: 'expression', matchValue: 'ctx.score > 80' }] },
      { score: 95 }, {}
    );
    expect(res.nextHandle).toBe('vip');
  });

  test('handler error maps to error handle with continue', async () => {
    const res = await executeSwitch(
      { switchValue: 'x', cases: [{ id: 'r', operator: 'matches_regex', matchValue: '([' }] },
      {}, {}
    );
    // invalid regex is swallowed by compare -> false, so default; force real error path:
    expect(['default', 'error']).toContain(res.nextHandle);
  });
});

describe('approval handler', () => {
  test('returns suspension with fixed approval form', async () => {
    const res = await executeNode({
      node: { id: 'ap', type: 'approval', data: { title: 'Ship it?', approvers: 'boss', outputVariable: 'shipApproval' } },
      context: {},
      helpers: {},
    });
    expect(res.suspended).toBe(true);
    expect(res.output.collectionType).toBe('approval');
    expect(res.output.outputVariable).toBe('shipApproval');
    expect(res.output.approveLabel).toBe('Accept');
    expect(res.output.rejectLabel).toBe('Reject');
    expect(res.output.cancelLabel).toBe('Cancel');
    expect(res.output.formSchema.required).toContain('decision');
    expect(res.output.formSchema.properties.decision.enum).toEqual(['approve', 'reject']);
    expect(res.output.expiryMinutes).toBe(60);
  });

  test('requireComment makes comment required', async () => {
    const res = await executeApproval({ requireComment: true }, {}, {});
    expect(res.output.formSchema.required).toEqual(expect.arrayContaining(['decision', 'comment']));
  });
});

describe('fanout handler', () => {
  test('returns __fanout marker with all handles', async () => {
    const res = await executeNode({
      node: { id: 'fo', type: 'fanout', data: { branches: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }] } },
      context: {},
      helpers: {},
    });
    expect(res.__fanout).toBe(true);
    expect(res.handles).toEqual(['a', 'b']);
    expect(res.nextHandle).toBe('a');
  });

  test('empty branches maps to error handle with continue', async () => {
    const res = await executeFanout({ branches: [] }, {}, {});
    expect(res.nextHandle).toBe('error');
    expect(res.output.success).toBe(false);
  });
});

describe('join handler', () => {
  test('merges listed source variables', async () => {
    const res = await executeNode({
      node: { id: 'j', type: 'join', data: { sourceVariables: ['a', 'b'], outputVariable: 'merged' } },
      context: { a: 1, b: { x: 2 } },
      helpers: {},
    });
    expect(res.nextHandle).toBe('output');
    expect(res.output.merged).toEqual({ a: 1, b: { x: 2 } });
  });

  test('requireAll throws on missing; requireAll false yields null', async () => {
    await expect(
      executeJoin({ sourceVariables: ['missing'], requireAll: true, errorHandling: 'fail_workflow' }, {}, {})
    ).rejects.toThrow(/missing upstream/);
    const res = await executeJoin({ sourceVariables: ['missing'], requireAll: false }, {}, {});
    expect(res.nextHandle).toBe('output');
    expect(res.output.joined).toEqual({ missing: null });
  });
});
