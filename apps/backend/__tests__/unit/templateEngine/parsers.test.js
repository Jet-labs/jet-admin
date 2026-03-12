const {
  extractTemplateBlocks,
  extractWholeTemplateExpression,
} = require('../../../utils/templateEngine/parsers');

describe('templateEngine/parsers', () => {
  it('extracts template blocks recursively from arrays and objects', () => {
    expect(
      extractTemplateBlocks({
        query: 'SELECT {{args.table}}',
        filters: ['{{args.status}}', { id: '{{args.id}}' }],
      }).map((block) => block.expression)
    ).toEqual(['args.table', 'args.status', 'args.id']);
  });

  it('extracts whole template expressions correctly', () => {
    expect(extractWholeTemplateExpression('{{ctx.value}}')).toEqual({
      fullMatch: '{{ctx.value}}',
      expression: 'ctx.value',
      index: 0,
    });
  });

  it('rejects partial whole template expressions', () => {
    expect(extractWholeTemplateExpression('{{ctx.value}} foo')).toBeNull();
  });
});
