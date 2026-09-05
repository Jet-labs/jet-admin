/**
 * evaluationEngine — unit tests for mustache expression resolution.
 *
 * Covers the documented contract in evaluationEngine.js:
 *  - whole-template expressions preserve value types
 *  - mixed strings interpolate (missing paths become empty strings)
 *  - full JS expressions evaluate inside {{ }}
 *  - paths without the state. prefix are rejected
 *  - dependency extraction returns top-level state paths
 */
import {
  resolveValue,
  resolveConfig,
  evaluateExpression,
  containsExpression,
  extractDependencies,
} from '../src/logic/evaluationEngine';

const tree = () => ({
  queries: {
    users: { data: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }], isLoading: false, error: null },
  },
  variables: { name: 'Ada', min: 5, show: true },
  widgets: { t1: { selectedRow: { id: 7 } } },
});

describe('evaluationEngine', () => {
  test('whole-template returns raw values with types preserved', () => {
    const s = tree();
    expect(resolveValue('{{ state.queries.users.data }}', s)).toBe(s.queries.users.data);
    expect(resolveValue('{{ state.queries.users.data.length }}', s)).toBe(2);
    expect(resolveValue('{{ state.variables.min }}', s)).toBe(5);
    expect(resolveValue('{{ state.variables.show }}', s)).toBe(true);
  });

  test('mixed strings interpolate; missing paths become empty', () => {
    const s = tree();
    expect(resolveValue('Hello {{ state.variables.name }}!', s)).toBe('Hello Ada!');
    expect(resolveValue('Hi {{ state.variables.missing }}!', s)).toBe('Hi !');
  });

  test('full JS expressions evaluate inside templates', () => {
    const s = tree();
    expect(
      resolveValue("{{ state.queries.users.data.length > 0 ? 'yes' : 'no' }}", s)
    ).toBe('yes');
    expect(resolveValue('{{ Math.round(state.variables.min * 1.5) }}', s)).toBe(8);
    expect(resolveValue('{{ state.widgets.t1.selectedRow.id }}', s)).toBe(7);
  });

  test('non-string values pass through untouched', () => {
    const s = tree();
    expect(resolveValue(42, s)).toBe(42);
    expect(resolveValue(null, s)).toBeNull();
    expect(resolveValue(undefined, s)).toBeUndefined();
  });

  test('resolveConfig deep-walks objects and arrays', () => {
    const s = tree();
    const out = resolveConfig(
      {
        title: '{{ state.variables.name }} list',
        limit: '{{ state.variables.min }}',
        nested: { arr: ['{{ state.variables.show }}', 'plain'] },
      },
      s
    );
    expect(out.title).toBe('Ada list');
    expect(out.limit).toBe(5);
    expect(out.nested.arr).toEqual([true, 'plain']);
  });

  test('evaluateExpression enforces the state. prefix', () => {
    const s = tree();
    expect(evaluateExpression('state.variables.name', s)).toBe('Ada');
    expect(evaluateExpression('variables.name', s)).toBeUndefined();
    expect(evaluateExpression('state.nope.deeper', s)).toBeUndefined();
  });

  test('containsExpression detects mustache blocks', () => {
    expect(containsExpression('nope')).toBe(false);
    expect(containsExpression('hi {{ state.x }}')).toBe(true);
    expect(containsExpression(42)).toBe(false);
  });

  test('extractDependencies returns top-level state paths', () => {
    const deps = extractDependencies({
      a: '{{ state.queries.users.data }}',
      b: 'x {{ state.variables.min }} y {{ state.variables.min }}',
    });
    expect(deps).toEqual(expect.arrayContaining(['queries.users', 'variables.min']));
  });
});
