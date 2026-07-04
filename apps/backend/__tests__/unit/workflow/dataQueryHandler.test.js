jest.mock('../../../modules/dataQuery/dataQuery.service', () => ({
  createQueryEngine: jest.fn(),
}));

jest.mock('../../../utils/input.util', () => ({
  resolveInputs: jest.fn().mockImplementation(async ({ inputValues, contextData }) => {
    const { resolveTemplate } = require("@jet-admin/expression-engine");
    const WORKFLOW_TEMPLATE_OPTIONS = {
      preserveSingleExpressionType: true,
    };
    const resolveNested = (val) => {
      if (typeof val === 'string') {
        try {
          return resolveTemplate(val, contextData, WORKFLOW_TEMPLATE_OPTIONS);
        } catch {
          return val;
        }
      }
      if (Array.isArray(val)) {
        return val.map(resolveNested);
      }
      if (typeof val === 'object' && val !== null) {
        const res = {};
        for (const k of Object.keys(val)) {
          res[k] = resolveNested(val[k]);
        }
        return res;
      }
      return val;
    };
    return {
      resolved: resolveNested(inputValues),
      errors: {},
      valid: true,
    };
  }),
}));

const { authorizedExecuteDataQuery } = require('../../../utils/authorizedProxy');
const { resolveTemplate } = require("@jet-admin/expression-engine");

const WORKFLOW_TEMPLATE_OPTIONS = {
  preserveSingleExpressionType: true,
};
const dataQueryHandler = require('../../../modules/workflow/handlers/dataQueryHandler');

jest.mock('../../../utils/authorizedProxy', () => ({
  authorizedExecuteDataQuery: jest.fn()
}));

describe('workflow dataQueryHandler', () => {
  it('recursively resolves nested inputValues before executing the query engine', async () => {
    authorizedExecuteDataQuery.mockResolvedValue([{ id: 1 }]);

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
        inputValues: {
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

    expect(authorizedExecuteDataQuery).toHaveBeenCalledWith(expect.objectContaining({
      dataQueryID: 'query-1',
      executionInputs: {
        customerID: 42,
        filters: {
          status: 'active',
          tags: ['vip'],
          profile: { tier: 'gold' },
        },
        labels: ['customer_42', ['vip']],
      }
    }));
    expect(result.output.queryResult).toEqual([{ id: 1 }]);
    expect(result.output.success).toBe(true);
  });

  it('does not resolve raw ctx paths when mustache syntax is bypassed', async () => {
    authorizedExecuteDataQuery.mockResolvedValue([{ id: 1 }]);

    await dataQueryHandler.execute(
      {
        dataQueryID: 'query-2',
        inputValues: {
          customerID: 'ctx.input.customerID',
        },
      },
      { input: { customerID: 42 } },
      {
        resolveTemplate: (value) => resolveTemplate(value, { input: { customerID: 42 } }, WORKFLOW_TEMPLATE_OPTIONS),
      }
    );

    expect(authorizedExecuteDataQuery).toHaveBeenCalledWith(expect.objectContaining({
      dataQueryID: 'query-2',
      executionInputs: {
        customerID: 'ctx.input.customerID',
      }
    }));
  });
});