const {
  resolveTemplate,
} = require('../../../utils/templateEngine/resolver');

describe('utils/templateEngine', () => {


  it('resolves safe rooted whole-template expressions through the shared resolver', () => {
    expect(
      resolveTemplate(
        '{{ctx.input[0].profile.name}}',
        { input: [{ profile: { name: 'Ada' } }], 'user-id': 42 },
        { allowedRoots: ['ctx'] }
      )
    ).toBe('Ada');
  });

  it('preserves native values for whole-string expressions when enabled', () => {
    expect(
      resolveTemplate('{{ctx.input.total}}', { input: { total: 99 } }, {
        allowedRoots: ['ctx'],
        preserveSingleExpressionType: true,
      })
    ).toBe(99);
  });

  it('uses empty-string fallback for missing values in mixed interpolation by default', () => {
    expect(
      resolveTemplate('SELECT {{args.missing}}', {}, { allowedRoots: ['args'] })
    ).toBe('SELECT ');
  });

  it('supports explicit empty-string fallback for mixed interpolation', () => {
    expect(
      resolveTemplate('customer_{{ctx.input.id}}', {}, {
        allowedRoots: ['ctx'],
        preserveSingleExpressionType: true,
        inlineValueFormatter: (value) =>
          value !== undefined && value !== null ? String(value) : '',
      })
    ).toBe('customer_');
  });

  it('recursively resolves nested objects and arrays while preserving array shape', () => {
    expect(
      resolveTemplate(
        {
          limit: '{{args.limit}}',
          filters: ['{{args.status}}', { ids: '{{args.ids}}' }],
        },
        { limit: 10, status: 'active', ids: [1, 2] },
        { allowedRoots: ['args'], preserveSingleExpressionType: true }
      )
    ).toEqual({
      limit: 10,
      filters: ['active', { ids: [1, 2] }],
    });
  });
});