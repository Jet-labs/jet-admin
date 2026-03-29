const { NEXT_HANDLE } = require('../../../modules/workflow/workers/handlers/constants');
const conditionHandler = require('../../../modules/workflow/workers/handlers/conditionHandler');
const javascriptHandler = require('../../../modules/workflow/workers/handlers/javascriptHandler');

describe('workflow handler sandboxing', () => {
  it('condition handler selects the first matching branch', async () => {
    const result = await conditionHandler.execute(
      {
        branches: [
          { id: 'high-value', condition: 'ctx.input.total > 100' },
          { id: 'fallback', condition: 'true' },
        ],
      },
      { input: { total: 250 } },
      {}
    );

    expect(result).toEqual({
      output: {
        matched: 'high-value',
        condition: 'ctx.input.total > 100',
        success: true,
      },
      nextHandle: 'high-value',
    });
  });

  it('condition handler falls back when accessing host globals (process)', async () => {
    const result = await conditionHandler.execute(
      {
        branches: [{ id: 'unsafe', condition: 'process.env.NODE_ENV === "test"' }],
        defaultBranch: 'default-branch',
      },
      {},
      {}
    );

    expect(result.nextHandle).toBe('default-branch');
    expect(result.output.success).toBe(true);
  });

  it('javascript handler executes safe sandboxed code', async () => {
    const result = await javascriptHandler.execute(
      {
        code: 'return ctx.input.count * 2;',
        outputVariable: 'value',
      },
      { input: { count: 4 } },
      {}
    );

    expect(result).toEqual({
      output: {
        value: 8,
        success: true,
      },
      nextHandle: NEXT_HANDLE.SUCCESS,
    });
  });

  it('javascript handler blocks access to node process inside the sandbox', async () => {
    const result = await javascriptHandler.execute(
      {
        code: 'return process.pid;',
        outputVariable: 'value',
      },
      {},
      {}
    );

    expect(result.nextHandle).toBe(NEXT_HANDLE.ERROR);
    expect(result.output.success).toBe(false);
    expect(result.output.error).toEqual(expect.any(String));
  });
});