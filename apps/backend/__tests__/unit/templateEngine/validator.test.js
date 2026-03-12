const {
  hasMissingTemplateBraces,
  collectTemplateViolations,
  MUSTACHE_ONLY_TEMPLATE_MESSAGE,
} = require('../../../utils/templateEngine/validator');

describe('templateEngine/validator', () => {
  describe('hasMissingTemplateBraces', () => {
    it('returns true for raw paths', () => {
      expect(hasMissingTemplateBraces('ctx.input.id')).toBe(true);
    });

    it('returns false for mustache syntax', () => {
      expect(hasMissingTemplateBraces('{{ctx.input.id}}')).toBe(false);
    });

    it('returns false for partial mustache syntax', () => {
      expect(hasMissingTemplateBraces('customer_{{ctx.input.id}}')).toBe(false);
    });

    it('returns false for allowed roots', () => {
      expect(hasMissingTemplateBraces('ctx', { allowedRoots: ['ctx'] })).toBe(false);
    });
  });

  describe('collectTemplateViolations', () => {
    it('collects violations recursively from objects and arrays', () => {
      const issues = [];
      collectTemplateViolations(
        {
          id: '{{ctx.id}}',
          raw: 'ctx.raw',
          nested: [{ arrayItem: 'ctx.arrayItem' }]
        },
        ['root'],
        issues
      );

      expect(issues).toHaveLength(2);
      expect(issues[0].message).toBe(MUSTACHE_ONLY_TEMPLATE_MESSAGE);
      expect(issues[0].path).toEqual(['root', 'raw']);
      expect(issues[1].path).toEqual(['root', 'nested', 0, 'arrayItem']);
    });
  });
});
