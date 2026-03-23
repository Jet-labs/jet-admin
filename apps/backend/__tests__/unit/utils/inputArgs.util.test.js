const {
  validateAndCoerceInputArgs,
  keyValueTypeArrayToObject,
  coerceValue,
} = require('../../../utils/inputArgs.util');

describe('inputArgs.util', () => {
  // ─── coerceValue ──────────────────────────────────────────────────────────

  describe('coerceValue', () => {
    it('coerces string values', () => {
      expect(coerceValue(42, 'string')).toEqual({ value: '42', error: null });
      expect(coerceValue(true, 'string')).toEqual({ value: 'true', error: null });
    });

    it('coerces number values', () => {
      expect(coerceValue('42', 'number')).toEqual({ value: 42, error: null });
      expect(coerceValue('3.14', 'number')).toEqual({ value: 3.14, error: null });
      expect(coerceValue('', 'number')).toEqual({ value: null, error: null });
    });

    it('returns error for invalid number', () => {
      const result = coerceValue('abc', 'number');
      expect(result.error).toMatch(/Expected number/);
    });

    it('coerces boolean values', () => {
      expect(coerceValue('true', 'boolean')).toEqual({ value: true, error: null });
      expect(coerceValue('false', 'boolean')).toEqual({ value: false, error: null });
      expect(coerceValue(true, 'boolean')).toEqual({ value: true, error: null });
      expect(coerceValue(false, 'boolean')).toEqual({ value: false, error: null });
      expect(coerceValue(1, 'boolean')).toEqual({ value: true, error: null });
      expect(coerceValue(0, 'boolean')).toEqual({ value: false, error: null });
    });

    it('coerces object values from JSON string', () => {
      const result = coerceValue('{"a":1}', 'object');
      expect(result).toEqual({ value: { a: 1 }, error: null });
    });

    it('passes through object values', () => {
      const obj = { a: 1 };
      expect(coerceValue(obj, 'object')).toEqual({ value: obj, error: null });
    });

    it('returns error for invalid JSON object', () => {
      expect(coerceValue('not json', 'object').error).toMatch(/Invalid JSON/);
      expect(coerceValue('[1,2]', 'object').error).toMatch(/Expected JSON object/);
    });

    it('coerces array values from JSON string', () => {
      expect(coerceValue('[1,2,3]', 'array')).toEqual({ value: [1, 2, 3], error: null });
    });

    it('passes through array values', () => {
      const arr = [1, 2];
      expect(coerceValue(arr, 'array')).toEqual({ value: arr, error: null });
    });

    it('returns error for invalid JSON array', () => {
      expect(coerceValue('not json', 'array').error).toMatch(/Invalid JSON array/);
      expect(coerceValue('{"a":1}', 'array').error).toMatch(/Expected JSON array/);
    });

    it('passes null/undefined through', () => {
      expect(coerceValue(null, 'string')).toEqual({ value: null, error: null });
      expect(coerceValue(undefined, 'number')).toEqual({ value: undefined, error: null });
    });
  });

  // ─── validateAndCoerceInputArgs ───────────────────────────────────────────

  describe('validateAndCoerceInputArgs', () => {
    it('validates and coerces values against schema', () => {
      const schema = [
        { key: 'name', type: 'string', required: true },
        { key: 'age', type: 'number', required: true },
        { key: 'active', type: 'boolean' },
      ];
      const result = validateAndCoerceInputArgs(schema, {
        name: 'Alice',
        age: '30',
        active: 'true',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.coercedValues).toEqual({
        name: 'Alice',
        age: 30,
        active: true,
      });
    });

    it('returns errors for missing required fields', () => {
      const schema = [
        { key: 'name', type: 'string', required: true },
        { key: 'age', type: 'number', required: true },
      ];
      const result = validateAndCoerceInputArgs(schema, { name: 'Alice' });

      expect(result.valid).toBe(false);
      expect(result.errors.age).toBeDefined();
    });

    it('skips missing optional fields', () => {
      const schema = [
        { key: 'name', type: 'string', required: true },
        { key: 'nickname', type: 'string', required: false },
      ];
      const result = validateAndCoerceInputArgs(schema, { name: 'Alice' });

      expect(result.valid).toBe(true);
      expect(result.coercedValues.nickname).toBeNull();
    });

    it('passes through all values when no schema is provided', () => {
      const result = validateAndCoerceInputArgs([], { foo: 'bar' });
      expect(result.valid).toBe(true);
      expect(result.coercedValues).toEqual({ foo: 'bar' });
    });

    it('handles null inputArgs gracefully', () => {
      const schema = [{ key: 'x', type: 'string' }];
      const result = validateAndCoerceInputArgs(schema, null);
      expect(result.valid).toBe(true);
    });

    it('returns coercion errors when types are wrong', () => {
      const schema = [{ key: 'count', type: 'number' }];
      const result = validateAndCoerceInputArgs(schema, { count: 'abc' });
      expect(result.valid).toBe(false);
      expect(result.errors.count).toBeDefined();
    });
  });

  // ─── keyValueTypeArrayToObject ────────────────────────────────────────────

  describe('keyValueTypeArrayToObject', () => {
    it('converts KVT array to typed flat object', () => {
      const result = keyValueTypeArrayToObject([
        { key: 'customerID', type: 'number', value: '42' },
        { key: 'status', type: 'string', value: 'ACTIVE' },
        { key: 'isAdmin', type: 'boolean', value: 'true' },
      ]);

      expect(result).toEqual({
        customerID: 42,
        status: 'ACTIVE',
        isAdmin: true,
      });
    });

    it('handles array type', () => {
      const result = keyValueTypeArrayToObject([
        { key: 'ids', type: 'array', value: '[1,2,3]' },
      ]);
      expect(result).toEqual({ ids: [1, 2, 3] });
    });

    it('handles object type', () => {
      const result = keyValueTypeArrayToObject([
        { key: 'config', type: 'object', value: '{"x":1}' },
      ]);
      expect(result).toEqual({ config: { x: 1 } });
    });

    it('returns empty object for non-array input', () => {
      expect(keyValueTypeArrayToObject(null)).toEqual({});
      expect(keyValueTypeArrayToObject(undefined)).toEqual({});
    });

    it('skips items without key', () => {
      const result = keyValueTypeArrayToObject([
        { key: '', type: 'string', value: 'skip' },
        { key: 'valid', type: 'string', value: 'keep' },
      ]);
      expect(result).toEqual({ valid: 'keep' });
    });
  });
});
