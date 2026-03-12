jest.mock('../../../modules/dataQuery/queryEngine/queryExecution.adapter', () => ({
  createQueryEngine: jest.fn(),
}));

const { createQueryEngine } = require('../../../modules/dataQuery/queryEngine/queryExecution.adapter');
const { resolveTemplate } = require('../../../utils/templateEngine');

const WORKFLOW_TEMPLATE_OPTIONS = {
  allowedRoots: ['ctx'],
  preserveSingleExpressionType: true,
};
const dataQueryHandler = require('../../../modules/workflow/workers/handlers/dataQueryHandler');

describe('workflow dataQueryHandler', () => {
  it('recursively resolves nested args before executing the query engine', async () => {
    const executeQuery = jest.fn().mockResolvedValue([{ id: 1 }]);
    createQueryEngine.mockReturnValue({ executeQuery });

    const context = {
      input: {
        customerID: 42,
        status: 'active',
        tags: ['vip'],
        profile: { tier: 'gold' },
      },
    };

    const result = await dataQueryHandler.execute(
      {
        dataQueryID: 'query-1',
        outputVariable: 'queryResult',
        args: {
          customerID: '{{ctx.input.customerID}}',
          filters: {
            status: '{{ctx.input.status}}',
            tags: '{{ctx.input.tags}}',
            profile: '{{ctx.input.profile}}',
          },
          labels: ['customer_{{ctx.input.customerID}}', '{{ctx.input.tags}}'],
        },
      },
      context,
      {
        resolveTemplate: (value) => resolveTemplate(value, context, WORKFLOW_TEMPLATE_OPTIONS),
      }
    );

    expect(executeQuery).toHaveBeenCalledWith('query-1', {
      customerID: 42,
      filters: {
        status: 'active',
        tags: ['vip'],
        profile: { tier: 'gold' },
      },
      labels: ['customer_42', ['vip']],
    });
    expect(result.output.queryResult).toEqual([{ id: 1 }]);
    expect(result.output.success).toBe(true);
  });

  it('does not resolve raw ctx paths when mustache syntax is bypassed', async () => {
    const executeQuery = jest.fn().mockResolvedValue([{ id: 1 }]);
    createQueryEngine.mockReturnValue({ executeQuery });

    await dataQueryHandler.execute(
      {
        dataQueryID: 'query-2',
        args: {
          customerID: 'ctx.input.customerID',
        },
      },
      { input: { customerID: 42 } },
      {
        resolveTemplate: (value) => resolveTemplate(value, { input: { customerID: 42 } }, WORKFLOW_TEMPLATE_OPTIONS),
      }
    );

    expect(executeQuery).toHaveBeenCalledWith('query-2', {
      customerID: 'ctx.input.customerID',
    });
  });
});