const {

  keyValueTypeArrayToObject,
  coerceValue,
  normalizeDefinitions,
  extractWorkflowDefinitions,
  extractQueryDefinitions,
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

  // ─── normalizeDefinitions ─────────────────────────────────────────────────

  describe('normalizeDefinitions', () => {
    it('converts raw args to canonical InputDefinition shape', () => {
      const raw = [
        { key: 'userId', type: 'number', required: true },
        { key: 'name', type: 'string' },
      ];
      const result = normalizeDefinitions(raw);

      expect(result).toEqual([
        {
          key: 'userId',
          type: 'number',
          required: true,
          default: undefined,
          supportsTemplate: false,
          definitionSource: 'native',
        },
        {
          key: 'name',
          type: 'string',
          required: false,
          default: undefined,
          supportsTemplate: false,
          definitionSource: 'native',
        },
      ]);
    });

    it('applies custom options (supportsTemplate, definitionSource)', () => {
      const raw = [{ key: 'q', type: 'string' }];
      const result = normalizeDefinitions(raw, {
        supportsTemplate: true,
        definitionSource: 'derived',
      });

      expect(result[0].supportsTemplate).toBe(true);
      expect(result[0].definitionSource).toBe('derived');
    });

    it('filters out items without key', () => {
      const raw = [
        { key: '', type: 'string' },
        { key: 'valid', type: 'number' },
        null,
      ];
      expect(normalizeDefinitions(raw)).toHaveLength(1);
      expect(normalizeDefinitions(raw)[0].key).toBe('valid');
    });

    it('returns empty array for non-array input', () => {
      expect(normalizeDefinitions(null)).toEqual([]);
      expect(normalizeDefinitions(undefined)).toEqual([]);
      expect(normalizeDefinitions('string')).toEqual([]);
    });

    it('defaults type to string when missing', () => {
      const raw = [{ key: 'x' }];
      expect(normalizeDefinitions(raw)[0].type).toBe('string');
    });

    it('preserves default values', () => {
      const raw = [{ key: 'limit', type: 'number', default: 10 }];
      expect(normalizeDefinitions(raw)[0].default).toBe(10);
    });
  });

  // ─── extractWorkflowDefinitions ─────────────────────────────────────────

  describe('extractWorkflowDefinitions', () => {
    it('extracts definitions from workflowOptions.args', () => {
      const workflow = {
        workflowOptions: {
          args: [
            { key: 'userId', type: 'number', required: true },
            { key: 'mode', type: 'string' },
          ],
        },
      };
      const defs = extractWorkflowDefinitions(workflow);

      expect(defs).toHaveLength(2);
      expect(defs[0]).toMatchObject({
        key: 'userId',
        type: 'number',
        required: true,
        supportsTemplate: false,
        definitionSource: 'native',
      });
    });

    it('returns empty array for workflow without workflowOptions', () => {
      expect(extractWorkflowDefinitions({})).toEqual([]);
      expect(extractWorkflowDefinitions(null)).toEqual([]);
    });

    it('returns empty array when workflowOptions.args is missing', () => {
      expect(extractWorkflowDefinitions({ workflowOptions: {} })).toEqual([]);
    });
  });

  // ─── extractQueryDefinitions ────────────────────────────────────────────

  describe('extractQueryDefinitions', () => {
    it('extracts definitions from dataQueryOptions.args with supportsTemplate=true', () => {
      const query = {
        dataQueryOptions: {
          args: [
            { key: 'customerId', type: 'number', required: true },
            { key: 'status', type: 'string' },
          ],
        },
      };
      const defs = extractQueryDefinitions(query);

      expect(defs).toHaveLength(2);
      expect(defs[0]).toMatchObject({
        key: 'customerId',
        type: 'number',
        required: true,
        supportsTemplate: true,
        definitionSource: 'native',
      });
    });

    it('returns empty array for query without dataQueryOptions', () => {
      expect(extractQueryDefinitions({})).toEqual([]);
      expect(extractQueryDefinitions(null)).toEqual([]);
    });
  });
});
