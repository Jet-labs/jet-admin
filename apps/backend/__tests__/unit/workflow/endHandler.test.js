const { resolveTemplate } = require('../../../utils/templateEngine');

const WORKFLOW_TEMPLATE_OPTIONS = {
  allowedRoots: ['ctx'],
  preserveSingleExpressionType: true,
};
const endHandler = require('../../../modules/workflow/workers/handlers/endHandler');

describe('workflow endHandler', () => {
  it('resolves mustache-based output parameters through the shared resolver', async () => {
    const result = await endHandler.execute(
      {
        outputParameters: [{ name: 'customerID', sourceVariable: '{{ctx.input.customerID}}' }],
      },
      { input: { customerID: 42 } },
      {
        instanceID: 'instance-1',
        resolveTemplate: (value) => resolveTemplate(value, { input: { customerID: 42 } }, WORKFLOW_TEMPLATE_OPTIONS),
      }
    );

    expect(result.output.workflowOutput).toEqual({ customerID: 42 });
  });

  it('keeps literal output values literal when bypassing API validation', async () => {
    const result = await endHandler.execute(
      {
        outputParameters: [{ name: 'label', sourceVariable: 'hardcoded-value' }],
      },
      { input: { customerID: 42 } },
      {
        instanceID: 'instance-1',
        resolveTemplate: (value) => resolveTemplate(value, { input: { customerID: 42 } }, WORKFLOW_TEMPLATE_OPTIONS),
      }
    );

    expect(result.output.workflowOutput).toEqual({ label: 'hardcoded-value' });
  });
});