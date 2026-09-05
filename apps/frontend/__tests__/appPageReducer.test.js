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
});
