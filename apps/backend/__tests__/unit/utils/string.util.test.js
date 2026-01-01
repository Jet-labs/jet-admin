/**
 * Unit tests for string utility functions
 */

const { stringUtil } = require('../../../utils/string.util');

describe('stringUtil', () => {
  describe('truncateName', () => {
    it('should truncate string longer than specified length', () => {
      const result = stringUtil.truncateName('Hello World', 5);
      expect(result).toBe('Hello...');
    });

    it('should return original string if shorter than length', () => {
      const result = stringUtil.truncateName('Hi', 10);
      expect(result).toBe('Hi');
    });

    it('should return original string if equal to length', () => {
      const result = stringUtil.truncateName('Hello', 5);
      expect(result).toBe('Hello');
    });

    it('should handle empty string', () => {
      const result = stringUtil.truncateName('', 5);
      expect(result).toBe('');
    });
  });

  describe('containsWhitespace', () => {
    it('should return true for string with spaces', () => {
      expect(stringUtil.containsWhitespace('hello world')).toBe(true);
    });

    it('should return true for string with tabs', () => {
      expect(stringUtil.containsWhitespace('hello\tworld')).toBe(true);
    });

    it('should return true for string with newlines', () => {
      expect(stringUtil.containsWhitespace('hello\nworld')).toBe(true);
    });

    it('should return false for string without whitespace', () => {
      expect(stringUtil.containsWhitespace('helloworld')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(stringUtil.containsWhitespace('')).toBe(false);
    });
  });

  describe('removeSQLMarkdownFencesRegex', () => {
    it('should remove SQL markdown fences with sql language tag', () => {
      const input = '```sql\nSELECT * FROM users;\n```';
      const result = stringUtil.removeSQLMarkdownFencesRegex(input);
      expect(result).toBe('SELECT * FROM users;');
    });

    it('should remove plain markdown fences', () => {
      const input = '```\nSELECT * FROM users;\n```';
      const result = stringUtil.removeSQLMarkdownFencesRegex(input);
      expect(result).toBe('SELECT * FROM users;');
    });

    it('should return original text if no fences present', () => {
      const input = 'SELECT * FROM users;';
      const result = stringUtil.removeSQLMarkdownFencesRegex(input);
      expect(result).toBe('SELECT * FROM users;');
    });

    it('should return empty string for null input', () => {
      expect(stringUtil.removeSQLMarkdownFencesRegex(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(stringUtil.removeSQLMarkdownFencesRegex(undefined)).toBe('');
    });

    it('should handle multiline SQL content', () => {
      const input = '```sql\nSELECT *\nFROM users\nWHERE id = 1;\n```';
      const result = stringUtil.removeSQLMarkdownFencesRegex(input);
      expect(result).toBe('SELECT *\nFROM users\nWHERE id = 1;');
    });
  });

  describe('removeJSONMarkdownFencesRegex', () => {
    it('should remove JSON markdown fences with json language tag', () => {
      const input = '```json\n{"key": "value"}\n```';
      const result = stringUtil.removeJSONMarkdownFencesRegex(input);
      expect(result).toBe('{"key": "value"}');
    });

    it('should remove plain markdown fences', () => {
      const input = '```\n{"key": "value"}\n```';
      const result = stringUtil.removeJSONMarkdownFencesRegex(input);
      expect(result).toBe('{"key": "value"}');
    });

    it('should return original text if no fences present', () => {
      const input = '{"key": "value"}';
      const result = stringUtil.removeJSONMarkdownFencesRegex(input);
      expect(result).toBe('{"key": "value"}');
    });

    it('should return empty string for null input', () => {
      expect(stringUtil.removeJSONMarkdownFencesRegex(null)).toBe('');
    });

    it('should handle nested JSON content', () => {
      const input = '```json\n{"user": {"name": "John", "age": 30}}\n```';
      const result = stringUtil.removeJSONMarkdownFencesRegex(input);
      expect(result).toBe('{"user": {"name": "John", "age": 30}}');
    });
  });
});
