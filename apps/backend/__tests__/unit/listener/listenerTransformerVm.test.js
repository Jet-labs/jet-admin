/**
 * ListenerTransformerVm Unit Tests
 * Tests isolated-vm transformation script execution for listener events.
 */

const { ListenerTransformerVm } = require('../../../modules/listener/listenerEngine/listenerTransformerVm');

describe('ListenerTransformerVm', () => {
  const sampleEvent = {
    id: 'evt-100',
    type: 'user.created',
    data: { name: 'John Doe', age: 30 },
  };

  it('should return raw event unmodified if script is empty, null, or whitespace', () => {
    expect(ListenerTransformerVm.execute('', sampleEvent)).toEqual({
      output: sampleEvent,
      error: null,
    });

    expect(ListenerTransformerVm.execute(null, sampleEvent)).toEqual({
      output: sampleEvent,
      error: null,
    });

    expect(ListenerTransformerVm.execute('   \n  ', sampleEvent)).toEqual({
      output: sampleEvent,
      error: null,
    });
  });

  it('should execute valid transform script and return modified payload', () => {
    const script = `
      return {
        eventId: event.id,
        user: event.data.name.toUpperCase(),
        processedAt: '2026-07-04'
      };
    `;

    const result = ListenerTransformerVm.execute(script, sampleEvent);

    expect(result.error).toBeNull();
    expect(result.output).toEqual({
      eventId: 'evt-100',
      user: 'JOHN DOE',
      processedAt: '2026-07-04',
    });
  });

  it('should handle event filtering when script returns null or undefined', () => {
    const scriptNull = `if (event.data.age > 20) return null; return event;`;
    const resultNull = ListenerTransformerVm.execute(scriptNull, sampleEvent);
    expect(resultNull.error).toBeNull();
    expect(resultNull.output).toBeNull();

    const scriptUndefined = `return undefined;`;
    const resultUndefined = ListenerTransformerVm.execute(scriptUndefined, sampleEvent);
    expect(resultUndefined.error).toBeNull();
    expect(resultUndefined.output).toBeNull();
  });

  it('should catch runtime errors in user script and return error message', () => {
    const script = `return event.nonExistentField.someProperty;`;
    const result = ListenerTransformerVm.execute(script, sampleEvent);

    expect(result.output).toBeNull();
    expect(result.error).toBeDefined();
    expect(typeof result.error).toBe('string');
  });

  it('should catch syntax errors in script and return error', () => {
    const script = `const a = ; return event;`;
    const result = ListenerTransformerVm.execute(script, sampleEvent);

    expect(result.output).toBeNull();
    expect(result.error).toBeDefined();
  });

  it('should enforce execution timeout on infinite loops', () => {
    const script = `while(true) {} return event;`;
    const result = ListenerTransformerVm.execute(script, sampleEvent);

    expect(result.output).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error.toLowerCase()).toContain('timed out');
  });
});
