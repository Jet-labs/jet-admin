const {
  resolveInputs,
} = require('../../../utils/input.util');

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
      inputValues: { foo: 'bar', count: 42 },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved).toEqual({ foo: 'bar', count: 42 });
    expect(result.errors).toEqual({});
  });

  it('passes through all values when definitions array is empty', async () => {
    const result = await resolveInputs({
      inputDefinitions: [],
      inputValues: { untypedField: 'hello' },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved).toEqual({ untypedField: 'hello' });
  });

  // ─── Coercion ──────────────────────────────────────────────────────────

  it('coerces string to number when definition says number', async () => {
    const result = await resolveInputs({
      inputDefinitions: [{ key: 'age', type: 'number' }],
      inputValues: { age: '30' },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved.age).toBe(30);
  });

  it('coerces string to boolean', async () => {
    const result = await resolveInputs({
      inputDefinitions: [{ key: 'active', type: 'boolean' }],
      inputValues: { active: 'true' },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved.active).toBe(true);
  });

  it('returns error for invalid coercion', async () => {
    const result = await resolveInputs({
      inputDefinitions: [{ key: 'count', type: 'number' }],
      inputValues: { count: 'not-a-number' },
    });

    expect(result.valid).toBe(false);
    expect(result.errors.count).toBeDefined();
  });

  // ─── Required validation ───────────────────────────────────────────────

  it('validates required fields', async () => {
    const result = await resolveInputs({
      inputDefinitions: [
        { key: 'name', type: 'string', required: true },
        { key: 'age', type: 'number', required: true },
      ],
      inputValues: { name: 'Alice' },
    });

    expect(result.valid).toBe(false);
    expect(result.errors.age).toBeDefined();
    expect(result.resolved.name).toBe('Alice');
  });

  it('passes when all required fields are present', async () => {
    const result = await resolveInputs({
      inputDefinitions: [
        { key: 'name', type: 'string', required: true },
        { key: 'age', type: 'number', required: true },
      ],
      inputValues: { name: 'Alice', age: '25' },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved).toEqual({ name: 'Alice', age: 25 });
  });

  it('treats empty string as missing for required fields', async () => {
    const result = await resolveInputs({
      inputDefinitions: [{ key: 'name', type: 'string', required: true }],
      inputValues: { name: '' },
    });

    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  // ─── Defaults ──────────────────────────────────────────────────────────

  it('applies defaults when runtime value is missing', async () => {
    const result = await resolveInputs({
      inputDefinitions: [
        { key: 'limit', type: 'number', default: 10 },
        { key: 'offset', type: 'number', default: 0 },
      ],
      inputValues: { limit: '25' },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved.limit).toBe(25);
    expect(result.resolved.offset).toBe(0);
  });

  it('does not apply default when runtime value is provided', async () => {
    const result = await resolveInputs({
      inputDefinitions: [{ key: 'limit', type: 'number', default: 10 }],
      inputValues: { limit: '5' },
    });

    expect(result.resolved.limit).toBe(5);
  });

  // ─── Template resolution ───────────────────────────────────────────────

  it('resolves templates when supportsTemplate is true and contextData is provided', async () => {
    const result = await resolveInputs({
      inputDefinitions: [
        { key: 'userId', type: 'number', supportsTemplate: true },
      ],
      inputValues: { userId: '{{ctx.input.userId}}' },
      contextData: { ctx: { input: { userId: 42 } } },
    });

    expect(result.valid).toBe(true);
    expect(result.resolved.userId).toBe(42);
  });

  it('does NOT resolve templates when supportsTemplate is false', async () => {
    const result = await resolveInputs({
      inputDefinitions: [
        { key: 'name', type: 'string', supportsTemplate: false },
      ],
      inputValues: { name: '{{ctx.input.name}}' },
      contextData: { ctx: { input: { name: 'Alice' } } },
    });

    // Template string is kept as-is and treated as literal
    expect(result.resolved.name).toBe('{{ctx.input.name}}');
  });

  it('does NOT resolve templates when contextData is missing', async () => {
    const result = await resolveInputs({
      inputDefinitions: [
        { key: 'userId', type: 'string', supportsTemplate: true },
      ],
      inputValues: { userId: '{{ctx.input.userId}}' },
    });

    // No context → value stays as-is
    expect(result.resolved.userId).toBe('{{ctx.input.userId}}');
  });

  // ─── Optional fields ──────────────────────────────────────────────────

  it('sets missing optional fields to null', async () => {
    const result = await resolveInputs({
      inputDefinitions: [
        { key: 'optional', type: 'string', required: false },
      ],
      inputValues: {},
    });

    expect(result.valid).toBe(true);
    expect(result.resolved.optional).toBeNull();
  });

  // ─── Mixed scenario ───────────────────────────────────────────────────

  it('handles a real-world workflow input schema', async () => {
    const result = await resolveInputs({
      inputDefinitions: [
        { key: 'customerId', type: 'number', required: true },
        { key: 'action', type: 'string', required: true },
        { key: 'dryRun', type: 'boolean', default: false },
        { key: 'metadata', type: 'object' },
      ],
      inputValues: {
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
    const { prisma } = require('../../../config/prisma.config');
    jest.spyOn(prisma.tblWorkflows, 'findUnique').mockResolvedValueOnce({
      workflowOptions: {
        inputDefinitions: [{ key: 'x', type: 'number', required: true }]
      }
    });

    const result = await resolveInputs({
      type: 'workflow',
      id: '123e4567-e89b-12d3-a456-426614174000',
      inputValues: { x: '10' },
    });

    expect(prisma.tblWorkflows.findUnique).toHaveBeenCalledWith({
      where: { workflowID: '123e4567-e89b-12d3-a456-426614174000' }
    });
    expect(result.valid).toBe(true);
    expect(result.resolved.x).toBe(10);
  });
});
