/**
 * Unit tests for queryEngine parsers
 * Tests the template extraction function
 */

const { extractTemplateBlocks } = require('../../../modules/dataQuery/queryEngine/parsers');

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

    it('should handle newlines in template block content', () => {
      const template = `SELECT * FROM users WHERE id = {{
        userId
      }}`;
      const result = extractTemplateBlocks(template);

      expect(result).toHaveLength(1);
      expect(result[0].expression).toBe('userId');
    });

    it('should handle array index access in expressions', () => {
      const template = 'SELECT * FROM users WHERE id = {{items[0].id}}';
      const result = extractTemplateBlocks(template);

      expect(result).toHaveLength(1);
      expect(result[0].expression).toBe('items[0].id');
    });

    it('should handle deeply nested object templates', () => {
      const template = {
        level1: {
          level2: {
            query: 'SELECT {{field}}'
          }
        }
      };
      const result = extractTemplateBlocks(template);

      expect(result).toHaveLength(1);
      expect(result[0].expression).toBe('field');
    });
  });
});
