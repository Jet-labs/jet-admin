const {
  normalizeDefinitions,
  extractWorkflowDefinitions,
  extractQueryDefinitions,
} = require('../../../utils/definitionProvider.util');

describe('definitionProvider.util', () => {
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
