const workerSDK = require('../../../modules/workflow/workers/workerSDK');
const contextResolver = require('../../../modules/workflow/workers/contextResolver');
const widgetBinding = require('../../../modules/workflow/workers/widgetBinding');

describe('workflow worker helper split', () => {
  it('keeps context resolver helpers available through the compatibility barrel', () => {
    expect(workerSDK.resolveFromContext).toBe(contextResolver.resolveFromContext);
    expect(workerSDK.resolveStringWithContext).toBe(contextResolver.resolveStringWithContext);

    const value = workerSDK.resolveStringWithContext(
      { input: { customerID: 42 } },
      '{{ctx.input.customerID}}'
    );

    expect(value).toBe(42);
  });

  it('keeps widget binding helpers available through the compatibility barrel', () => {
    expect(workerSDK.resolveWidgetDatasetFields).toBe(widgetBinding.resolveWidgetDatasetFields);

    const result = workerSDK.resolveWidgetDatasetFields(
      {
        data: {
          rows: [{ value: 1 }, { value: 2 }],
        },
      },
      {
        values: 'ctx.data.rows[*].value',
      }
    );

    expect(result).toEqual({ values: [1, 2] });
  });
});