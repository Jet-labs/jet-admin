const {
  resolveInputs,
} = require('../../../utils/inputArgs.util');

// Mock the template engine
jest.mock("@jet-admin/expression-engine", () => ({
  resolveTemplate: jest.fn((value, context, options) => {
    // Simple mock: replace {{ctx.input.X}} with context.ctx.input[X]
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const path = value.slice(2, -2).trim();
      const parts = path.split('.');
      let result = context;
      for (const part of parts) {
        if (result == null) return value;
        result = result[part];
      }
      return result;
    }
    return value;
  }),
}));



describe('resolveInputs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Basic passthrough ─────────────────────────────────────────────────

  it('passes through all values when no definitions are provided', async () => {
    const result = await resolveInputs({
      runtimeValues: { foo: 'bar', count: 42 },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved).toEqual({ foo: 'bar', count: 42 });
    expect(result.errors).toEqual({});
  });

  it('passes through all values when definitions array is empty', async () => {
    const result = await resolveInputs({
      definitions: [],
      runtimeValues: { untypedField: 'hello' },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved).toEqual({ untypedField: 'hello' });
  });

  // ─── Coercion ──────────────────────────────────────────────────────────

  it('coerces string to number when definition says number', async () => {
    const result = await resolveInputs({
      definitions: [{ key: 'age', type: 'number' }],
      runtimeValues: { age: '30' },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved.age).toBe(30);
  });

  it('coerces string to boolean', async () => {
    const result = await resolveInputs({
      definitions: [{ key: 'active', type: 'boolean' }],
      runtimeValues: { active: 'true' },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved.active).toBe(true);
  });

  it('returns error for invalid coercion', async () => {
    const result = await resolveInputs({
      definitions: [{ key: 'count', type: 'number' }],
      runtimeValues: { count: 'not-a-number' },
    });

    expect(result.valid).toBe(false);
    expect(result.errors.count).toBeDefined();
  });

  // ─── Required validation ───────────────────────────────────────────────

  it('validates required fields', async () => {
    const result = await resolveInputs({
      definitions: [
        { key: 'name', type: 'string', required: true },
        { key: 'age', type: 'number', required: true },
      ],
      runtimeValues: { name: 'Alice' },
    });

    expect(result.valid).toBe(false);
    expect(result.errors.age).toBeDefined();
    expect(result.resolved.name).toBe('Alice');
  });

  it('passes when all required fields are present', async () => {
    const result = await resolveInputs({
      definitions: [
        { key: 'name', type: 'string', required: true },
        { key: 'age', type: 'number', required: true },
      ],
      runtimeValues: { name: 'Alice', age: '25' },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved).toEqual({ name: 'Alice', age: 25 });
  });

  it('treats empty string as missing for required fields', async () => {
    const result = await resolveInputs({
      definitions: [{ key: 'name', type: 'string', required: true }],
      runtimeValues: { name: '' },
    });

    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  // ─── Defaults ──────────────────────────────────────────────────────────

  it('applies defaults when runtime value is missing', async () => {
    const result = await resolveInputs({
      definitions: [
        { key: 'limit', type: 'number', default: 10 },
        { key: 'offset', type: 'number', default: 0 },
      ],
      runtimeValues: { limit: '25' },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved.limit).toBe(25);
    expect(result.resolved.offset).toBe(0);
  });

  it('does not apply default when runtime value is provided', async () => {
    const result = await resolveInputs({
      definitions: [{ key: 'limit', type: 'number', default: 10 }],
      runtimeValues: { limit: '5' },
    });

    expect(result.resolved.limit).toBe(5);
  });

  // ─── Template resolution ───────────────────────────────────────────────

  it('resolves templates when supportsTemplate is true and contextData is provided', async () => {
    const result = await resolveInputs({
      definitions: [
        { key: 'userId', type: 'number', supportsTemplate: true },
      ],
      runtimeValues: { userId: '{{ctx.input.userId}}' },
      contextData: { ctx: { input: { userId: 42 } } },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved.userId).toBe(42);
  });

  it('does NOT resolve templates when supportsTemplate is false', async () => {
    const result = await resolveInputs({
      definitions: [
        { key: 'name', type: 'string', supportsTemplate: false },
      ],
      runtimeValues: { name: '{{ctx.input.name}}' },
      contextData: { ctx: { input: { name: 'Alice' } } },
    });

    // Template string is kept as-is and treated as literal
    expect(result.resolved.name).toBe('{{ctx.input.name}}');
  });

  it('does NOT resolve templates when contextData is missing', async () => {
    const result = await resolveInputs({
      definitions: [
        { key: 'userId', type: 'string', supportsTemplate: true },
      ],
      runtimeValues: { userId: '{{ctx.input.userId}}' },
    });

    // No context → value stays as-is
    expect(result.resolved.userId).toBe('{{ctx.input.userId}}');
  });

  // ─── Optional fields ──────────────────────────────────────────────────

  it('sets missing optional fields to null', async () => {
    const result = await resolveInputs({
      definitions: [
        { key: 'optional', type: 'string', required: false },
      ],
      runtimeValues: {},
    });

    expect(result.valid).toBe(true);
    expect(result.resolved.optional).toBeNull();
  });

  // ─── Mixed scenario ───────────────────────────────────────────────────

  it('handles a real-world workflow input schema', async () => {
    const result = await resolveInputs({
      definitions: [
        { key: 'customerId', type: 'number', required: true },
        { key: 'action', type: 'string', required: true },
        { key: 'dryRun', type: 'boolean', default: false },
        { key: 'metadata', type: 'object' },
      ],
      runtimeValues: {
        customerId: '123',
        action: 'activate',
        metadata: '{"source":"api"}',
      },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved).toEqual({
      customerId: 123,
      action: 'activate',
      dryRun: false,
      metadata: { source: 'api' },
    });
  });

  // ─── Definition fetching fallback ─────────────────────────────────────

  it('calls getInputDefinitions when type and id are provided but definitions are not', async () => {
    const inputArgsUtil = require('../../../utils/inputArgs.util');
    jest.spyOn(inputArgsUtil, 'getInputDefinitions').mockResolvedValueOnce([
      { key: 'x', type: 'number', required: true },
    ]);

    const result = await inputArgsUtil.resolveInputs({
      type: 'workflow',
      id: 'wf-123',
      runtimeValues: { x: '10' },
    });

    expect(getInputDefinitions).toHaveBeenCalledWith('workflow', 'wf-123');
    expect(result.valid).toBe(true);
    expect(result.resolved.x).toBe(10);
  });
});
