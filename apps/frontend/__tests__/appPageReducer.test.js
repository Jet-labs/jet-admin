/**
 * appPageReducer — unit tests for the per-page runtime state machine.
 *
 * Locks the contracts the reactive UI depends on:
 *  - INIT seeds variables from definitions (defaults vs URL overrides)
 *  - Every action updates its own slice and NOTHING else (referential
 *    stability of untouched slices prevents render-loop cascades)
 *  - Listener append/prepend honours the cap, workflow loading clears state
 */
import { appPageReducer, createAppPageInitialState } from '../src/logic/appPageRuntime/appPageReducer';
import { appPageActions } from '../src/logic/appPageRuntime/appPageActions';
import { buildAppPageStateTree } from '../src/logic/appPageRuntime/appPageExpressionEngine';
import { resolveConfig, resolveValue } from '../src/logic/evaluationEngine';

const initWith = (defs, globals = { tenantID: 't1', pageID: 'p1' }, overrides = {}) =>
  appPageReducer(createAppPageInitialState(), appPageActions.init(defs, globals, overrides));

describe('appPageReducer', () => {
  test('INIT seeds defaults and honours explicit overrides', () => {
    const s = initWith(
      [
        { key: 'search', defaultValue: '' },
        { key: 'page', defaultValue: 1 },
        { key: 'sel', defaultValue: null },
        { key: 'noDefault' },
      ],
      undefined,
      { page: 3 }
    );
    expect(s.variables).toEqual({ search: '', page: 3, sel: null, noDefault: null });
  });

  test('SET_VARIABLE sets one key and preserves slice references', () => {
    const prev = initWith([{ key: 'a', defaultValue: 1 }]);
    const withQuery = appPageReducer(prev, appPageActions.setQueryResult('q', [1]));
    const next = appPageReducer(withQuery, appPageActions.setVariable('a', 2));
    expect(next.variables.a).toBe(2);
    expect(next.queryResults).toBe(withQuery.queryResults);
    expect(next.widgetStates).toBe(withQuery.widgetStates);
  });

  test('SET_VARIABLES merges multiple keys and preserves slice references', () => {
    const prev = initWith([{ key: 'page', defaultValue: 1 }, { key: 'search', defaultValue: '' }]);
    const withQuery = appPageReducer(prev, appPageActions.setQueryResult('q', [1]));
    const next = appPageReducer(
      withQuery,
      appPageActions.setVariables({ page: 2, search: 'open' })
    );
    expect(next.variables).toEqual({ page: 2, search: 'open' });
    expect(next.queryResults).toBe(withQuery.queryResults);
    expect(next.widgetStates).toBe(withQuery.widgetStates);
  });

  test('SET_QUERY_RESULT stores data shape; SET_QUERY_LOADING preserves data', () => {
    let s = initWith([]);
    s = appPageReducer(s, appPageActions.setQueryResult('films', [{ id: 1 }]));
    expect(s.queryResults.films.isLoading).toBe(false);
    expect(s.queryResults.films.data).toEqual([{ id: 1 }]);
    expect(typeof s.queryResults.films.lastUpdated).toBe('number');
    const loading = appPageReducer(s, appPageActions.setQueryLoading('films'));
    expect(loading.queryResults.films.isLoading).toBe(true);
    expect(loading.queryResults.films.error).toBeNull();
    expect(loading.queryResults.films.data).toEqual([{ id: 1 }]);
  });

  test('workflow loading clears instance; result preserves instance when payload omits it', () => {
    let s = initWith([]);
    s = appPageReducer(s, appPageActions.setWorkflowResult('flow', { ok: 1 }, null, true, 'inst-1'));
    expect(s.workflowResults.flow.instanceID).toBe('inst-1');
    s = appPageReducer(s, appPageActions.setWorkflowLoading('flow'));
    expect(s.workflowResults.flow).toMatchObject({ isLoading: true, error: null, instanceID: null });
    s = appPageReducer(s, appPageActions.setWorkflowLoading('flow'));
    s = appPageReducer(
      s,
      appPageActions.setWorkflowResult('flow', { ok: 2 }, null, true, 'inst-2')
    );
    const kept = appPageReducer(
      s,
      appPageActions.setWorkflowResult('flow', { ok: 3 }, null, true, null)
    );
    expect(kept.workflowResults.flow.instanceID).toBe('inst-2');
  });

  test('widget state merges; register/unregister cleans methods AND state', () => {
    let s = initWith([]);
    s = appPageReducer(s, appPageActions.setWidgetState('w1', { a: 1 }));
    s = appPageReducer(s, appPageActions.setWidgetState('w1', { b: 2 }));
    expect(s.widgetStates.w1).toEqual({ a: 1, b: 2 });
    const fn = () => {};
    s = appPageReducer(s, appPageActions.registerWidgetMethods('w1', { refresh: fn }));
    expect(s.widgetMethods.w1.refresh).toBe(fn);
    s = appPageReducer(s, appPageActions.unregisterWidget('w1'));
    expect(s.widgetMethods.w1).toBeUndefined();
    expect(s.widgetStates.w1).toBeUndefined();
  });

  test('listener replace/append/prepend honours the cap', () => {
    let s = initWith([]);
    s = appPageReducer(s, appPageActions.setListenerResult('log', [1, 2], null, 'replace'));
    expect(s.listenerResults.log.data).toEqual([1, 2]);
    s = appPageReducer(s, appPageActions.setListenerResult('log', 3, null, 'append', 3));
    expect(s.listenerResults.log.data).toEqual([1, 2, 3]);
    s = appPageReducer(s, appPageActions.setListenerResult('log', 4, null, 'append', 3));
    expect(s.listenerResults.log.data).toEqual([2, 3, 4]);
    s = appPageReducer(s, appPageActions.setListenerResult('log', 0, null, 'prepend', 3));
    expect(s.listenerResults.log.data).toEqual([0, 2, 3]);
  });

  test('unknown action returns the identical state reference', () => {
    const s = initWith([]);
    expect(appPageReducer(s, { type: 'NOPE' })).toBe(s);
  });

  // B01: functional updates must resolve atomically against latest state.
  // Most input widgets call setWidgetState((prev) => ({ ...prev, value })).
  // The old reducer spread the function itself, silently dropping the update.
  describe('B01 functional widget-state updates', () => {
    test('functional updater applies against latest state (text-input pattern)', () => {
      let s = initWith([]);
      const asTextInputCallsIt = (v) => (prev) => ({ ...prev, value: v });
      s = appPageReducer(s, appPageActions.setWidgetState('name', asTextInputCallsIt('Ada')));
      expect(s.widgetStates.name).toEqual({ value: 'Ada' });
      s = appPageReducer(s, appPageActions.setWidgetState('name', asTextInputCallsIt('Grace')));
      expect(s.widgetStates.name).toEqual({ value: 'Grace' });
    });

    test('object patches and functional updates behave identically', () => {
      const fromObject = appPageReducer(
        appPageReducer(initWith([]), appPageActions.setWidgetState('w', { a: 1 })),
        appPageActions.setWidgetState('w', { value: 'x', b: 2 })
      );
      const fromFn = appPageReducer(
        appPageReducer(initWith([]), appPageActions.setWidgetState('w', { a: 1 })),
        appPageActions.setWidgetState('w', (prev) => ({ ...prev, value: 'x', b: 2 }))
      );
      expect(fromFn.widgetStates.w).toEqual(fromObject.widgetStates.w);
      expect(fromFn.widgetStates.w).toEqual({ a: 1, value: 'x', b: 2 });
    });

    test('reducer merge preserves untouched keys even when updater omits them', () => {
      let s = initWith([]);
      s = appPageReducer(s, appPageActions.setWidgetState('w', { keep: 1, value: 'a' }));
      // Updater returns only the changed slice (no ...prev spread).
      s = appPageReducer(s, appPageActions.setWidgetState('w', () => ({ value: 'b' })));
      expect(s.widgetStates.w).toEqual({ keep: 1, value: 'b' });
    });

    test('sequential toggles resolve against latest state (switch reproduction)', () => {
      let s = initWith([]);
      s = appPageReducer(s, appPageActions.setWidgetState('sw', { value: false }));
      const toggle = (prev) => ({ ...prev, value: !prev.value });
      s = appPageReducer(s, appPageActions.setWidgetState('sw', toggle));
      expect(s.widgetStates.sw.value).toBe(true);
      s = appPageReducer(s, appPageActions.setWidgetState('sw', toggle));
      expect(s.widgetStates.sw.value).toBe(false);
    });

    test('counter increments atomically across rapid sequential dispatches', () => {
      let s = initWith([]);
      s = appPageReducer(s, appPageActions.setWidgetState('c', { count: 0 }));
      const inc = (prev) => ({ count: (prev.count || 0) + 1 });
      s = appPageReducer(s, appPageActions.setWidgetState('c', inc));
      s = appPageReducer(s, appPageActions.setWidgetState('c', inc));
      s = appPageReducer(s, appPageActions.setWidgetState('c', inc));
      expect(s.widgetStates.c.count).toBe(3);
    });

    test('functional update isolates widgets and preserves slice references', () => {
      let s = initWith([]);
      s = appPageReducer(s, appPageActions.setQueryResult('q', [1]));
      s = appPageReducer(s, appPageActions.setWidgetState('w1', { value: 'a' }));
      const before = s;
      const next = appPageReducer(s, appPageActions.setWidgetState('w2', (p) => ({ ...p, value: 'b' })));
      expect(next.widgetStates.w1).toBe(before.widgetStates.w1);
      expect(next.widgetStates.w2).toEqual({ value: 'b' });
      expect(next.queryResults).toBe(before.queryResults);
      expect(next.variables).toBe(before.variables);
    });

    test('malformed updater results leave state untouched instead of corrupting it', () => {
      let s = initWith([]);
      s = appPageReducer(s, appPageActions.setWidgetState('w', { value: 'ok' }));
      const ref = s;
      expect(appPageReducer(s, appPageActions.setWidgetState('w', () => null))).toBe(ref);
      expect(appPageReducer(s, appPageActions.setWidgetState('w', () => undefined))).toBe(ref);
      expect(appPageReducer(s, appPageActions.setWidgetState('w', () => 42))).toBe(ref);
      expect(appPageReducer(s, appPageActions.setWidgetState('w', () => []))).toBe(ref);
      expect(s.widgetStates.w).toEqual({ value: 'ok' });
    });

    test('real input -> page state -> bound sibling flow', () => {
      let s = initWith([]);
      // 1. Switch writes via functional updater, as SwitchWidget does.
      s = appPageReducer(
        s,
        appPageActions.setWidgetState('switch1', (p) => ({ ...p, value: true }))
      );
      // 2. Page state tree exposes the committed value to siblings.
      let tree = buildAppPageStateTree(s, []);
      expect(tree.widgets.switch1.value).toBe(true);
      // 3. A sibling text widget bound via {{ state.widgets.switch1.value }} resolves.
      const siblingConfig = {
        content: 'Switch is {{ state.widgets.switch1.value }}',
        echo: '{{ state.widgets.switch1.value }}',
      };
      let resolved = resolveConfig(siblingConfig, tree);
      expect(resolved.echo).toBe(true);
      // 4. Toggle back via updater that reads latest state; binding follows.
      s = appPageReducer(
        s,
        appPageActions.setWidgetState('switch1', (p) => ({ ...p, value: !p.value }))
      );
      tree = buildAppPageStateTree(s, []);
      expect(tree.widgets.switch1.value).toBe(false);
      resolved = resolveConfig(siblingConfig, tree);
      expect(resolved.echo).toBe(false);
      // 5. A text-input style write also flows to a bound echo.
      s = appPageReducer(
        s,
        appPageActions.setWidgetState('name', (prev) => ({ ...prev, value: 'Ada' }))
      );
      tree = buildAppPageStateTree(s, []);
      expect(resolveValue('{{ state.widgets.name.value }}', tree)).toBe('Ada');
    });
  });
});
