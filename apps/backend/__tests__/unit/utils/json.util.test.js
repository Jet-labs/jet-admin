const { keyValueTypeArrayToObject } = require('../../../utils/json.util');

describe('jsonUtil', () => {
  describe('keyValueTypeArrayToObject', () => {
    it('should convert string type correctly', () => {
      const input = [{ key: 'name', value: 'John', type: 'string' }];
      const expected = { name: 'John' };
      expect(keyValueTypeArrayToObject(input)).toEqual(expected);
    });

    it('should convert number type correctly', () => {
      const input = [{ key: 'age', value: '30', type: 'number' }];
      const expected = { age: 30 };
      expect(keyValueTypeArrayToObject(input)).toEqual(expected);
    });

    it('should convert boolean type correctly (true)', () => {
      const input = [{ key: 'active', value: 'true', type: 'boolean' }];
      const expected = { active: true };
      expect(keyValueTypeArrayToObject(input)).toEqual(expected);
    });

    it('should convert boolean type correctly (false)', () => {
      const input = [{ key: 'active', value: 'false', type: 'boolean' }];
      const expected = { active: false };
      expect(keyValueTypeArrayToObject(input)).toEqual(expected);
    });

    it('should convert object type correctly (valid JSON)', () => {
      const input = [{ key: 'data', value: '{"id": 1}', type: 'object' }];
      const expected = { data: { id: 1 } };
      expect(keyValueTypeArrayToObject(input)).toEqual(expected);
    });

    it('should handle invalid JSON for object type by returning null', () => {
      const input = [{ key: 'data', value: 'invalid json', type: 'object' }];
      const expected = { data: null };
      expect(keyValueTypeArrayToObject(input)).toEqual(expected);
    });

    it('should handle unknown types by returning the value as-is', () => {
      const input = [{ key: 'data', value: 'some value', type: 'unknown' }];
      const expected = { data: 'some value' };
      expect(keyValueTypeArrayToObject(input)).toEqual(expected);
    });

    it('should handle an empty array by returning an empty object', () => {
      const input = [];
      const expected = {};
      expect(keyValueTypeArrayToObject(input)).toEqual(expected);
    });

    it('should handle multiple items in the array', () => {
      const input = [
        { key: 'name', value: 'John', type: 'string' },
        { key: 'age', value: '30', type: 'number' },
        { key: 'active', value: 'true', type: 'boolean' }
      ];
      const expected = {
        name: 'John',
        age: 30,
        active: true
      };
      expect(keyValueTypeArrayToObject(input)).toEqual(expected);
    });
  });
});
