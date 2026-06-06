const { resolveTemplate } = require("@jet-admin/expression-engine");
const loopHandler = require('../../../modules/workflow/handlers/loopHandler');
const delayHandler = require('../../../modules/workflow/handlers/delayHandler');

const WORKFLOW_TEMPLATE_OPTIONS = {
  allowedRoots: ['ctx'],
  preserveSingleExpressionType: true,
};

const helpers = (context, nodeID = 'loop-1') => ({
  nodeID,
  resolveTemplate: (value) => resolveTemplate(value, context, WORKFLOW_TEMPLATE_OPTIONS),
});

describe('workflow loop and delay handlers', () => {
  it('emits one loop item per invocation and then follows the completed handle', async () => {
    const context = { input: { items: ['a', 'b'] } };
    const config = {
      sourceVariable: '{{ctx.input.items}}',
      itemVariable: 'item',
      indexVariable: 'index',
      maxIterations: 10,
    };

    const first = await loopHandler.execute(config, context, helpers(context));
    expect(first.nextHandle).toBe('loop');
    expect(first.output.__contextPatch.item).toBe('a');
    expect(first.output.__contextPatch.index).toBe(0);

    const secondContext = { ...context, ...first.output.__contextPatch };
    const second = await loopHandler.execute(config, secondContext, helpers(secondContext));
    expect(second.nextHandle).toBe('loop');
    expect(second.output.__contextPatch.item).toBe('b');
    expect(second.output.__contextPatch.index).toBe(1);

    const doneContext = { ...secondContext, ...second.output.__contextPatch };
    const done = await loopHandler.execute(config, doneContext, helpers(doneContext));
    expect(done.nextHandle).toBe('completed');
    expect(done.output.success).toBe(true);
  });

  it('enforces loop maxIterations before dispatching body work', async () => {
    await expect(loopHandler.execute(
      { sourceVariable: '{{ctx.input.items}}', maxIterations: 1, errorHandling: 'fail_workflow' },
      { input: { items: ['a', 'b'] } },
      helpers({ input: { items: ['a', 'b'] } })
    )).rejects.toThrow(/exceeding maxIterations/);
  });

  it('computes bounded dynamic and until delays', async () => {
    const dynamic = await delayHandler.execute(
      { delayType: 'dynamic', delayVariable: '{{ctx.waitMs}}', errorHandling: 'fail_workflow' },
      { waitMs: 250 },
      helpers({ waitMs: 250 }, 'delay-1')
    );
    expect(dynamic.queueDelay).toBe(250);

    const until = await delayHandler.execute(
      { delayType: 'until', untilTime: new Date(Date.now() - 1000).toISOString() },
      {},
      helpers({}, 'delay-1')
    );
    expect(until.queueDelay).toBe(0);
  });

  it('rejects invalid delay values', async () => {
    await expect(delayHandler.execute(
      { delayType: 'dynamic', delayVariable: '{{ctx.waitMs}}', errorHandling: 'fail_workflow' },
      { waitMs: -1 },
      helpers({ waitMs: -1 }, 'delay-1')
    )).rejects.toThrow(/delay must be greater than or equal to 0/);
  });
});
