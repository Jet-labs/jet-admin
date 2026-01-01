/**
 * Unit tests for queryEngine parsers
 * Tests the template extraction and argument resolution functions
 */

const { extractTemplateBlocks, resolveArgs } = require('../../../modules/dataQuery/queryEngine/parsers');

describe('queryEngine/parsers', () => {
  describe('extractTemplateBlocks', () => {
    it('should extract single template block', () => {
      const template = 'SELECT * FROM users WHERE id = {{userId}}';
      const result = extractTemplateBlocks(template);

      expect(result).toHaveLength(1);
      expect(result[0].fullMatch).toBe('{{userId}}');
      expect(result[0].expression).toBe('userId');
    });

    it('should extract multiple template blocks', () => {
      const template = 'SELECT * FROM {{tableName}} WHERE id = {{userId}} AND name = {{userName}}';
      const result = extractTemplateBlocks(template);

      expect(result).toHaveLength(3);
      expect(result[0].expression).toBe('tableName');
      expect(result[1].expression).toBe('userId');
      expect(result[2].expression).toBe('userName');
    });

    it('should handle template with spaces inside braces', () => {
      const template = 'SELECT * FROM users WHERE id = {{ userId }}';
      const result = extractTemplateBlocks(template);

      expect(result).toHaveLength(1);
      expect(result[0].expression).toBe('userId');
    });

    it('should return empty array for template without blocks', () => {
      const template = 'SELECT * FROM users';
      const result = extractTemplateBlocks(template);

      expect(result).toEqual([]);
    });

    it('should return empty array for null input', () => {
      expect(extractTemplateBlocks(null)).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
      expect(extractTemplateBlocks(undefined)).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      expect(extractTemplateBlocks('')).toEqual([]);
    });

    it('should extract blocks from object values recursively', () => {
      const template = {
        query: 'SELECT * FROM {{tableName}}',
        condition: 'WHERE id = {{userId}}'
      };
      const result = extractTemplateBlocks(template);

      expect(result).toHaveLength(2);
      // Results are flattened from object values
      expect(result.map(r => r.expression)).toContain('tableName');
      expect(result.map(r => r.expression)).toContain('userId');
    });

    it('should handle nested object expressions', () => {
      const template = 'SELECT * FROM users WHERE id = {{args.user.id}}';
      const result = extractTemplateBlocks(template);

      expect(result).toHaveLength(1);
      expect(result[0].expression).toBe('args.user.id');
    });
  });

  describe('resolveArgs', () => {
    it('should resolve string key in object argument', () => {
      const args = { field: 'userId' };
      const runtimeArgs = { userId: 'user_123' };
      const result = resolveArgs(args, runtimeArgs);

      expect(result.field).toBe('user_123');
    });

    it('should resolve numeric arguments by converting to string', () => {
      const args = { limit: 'count' };
      const runtimeArgs = { count: 100 };
      const result = resolveArgs(args, runtimeArgs);

      // Numeric values get converted
      expect(result.limit).toBe(100);
    });

    it('should handle multiple replacements in object', () => {
      const args = { 
        query: 'userId',
        limit: 'pageSize'
      };
      const runtimeArgs = { 
        userId: 'user_1',
        pageSize: 10
      };
      const result = resolveArgs(args, runtimeArgs);

      expect(result.query).toBe('user_1');
      expect(result.limit).toBe(10);
    });

    it('should handle string input and parse as JSON', () => {
      const args = '{"userId": "id"}';
      const runtimeArgs = { id: '12345' };
      const result = resolveArgs(args, runtimeArgs);

      expect(result.userId).toBe('12345');
    });

    it('should preserve keys that dont match any runtime arg', () => {
      const args = { field: 'unknownKey' };
      const runtimeArgs = { userId: 'user_123' };
      const result = resolveArgs(args, runtimeArgs);

      expect(result.field).toBe('unknownKey');
    });

    it('should handle object values in runtimeArgs', () => {
      const args = { data: 'filterObj' };
      const runtimeArgs = { filterObj: { active: true } };
      const result = resolveArgs(args, runtimeArgs);

      // Object gets stringified
      expect(typeof result.data).toBe('string');
    });
  });
});
