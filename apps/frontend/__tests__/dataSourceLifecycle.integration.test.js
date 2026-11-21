import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppPageRuntimeProvider } from '../src/logic/appPageRuntime/AppPageRuntimeProvider';
import { useAppPageDataSourceManager } from '../src/logic/appPageRuntime/useAppPageDataSourceManager';
import { useAppPageDispatch } from '../src/logic/appPageRuntime/useAppPageDispatch';
import { useAppPageStateTree } from '../src/logic/appPageRuntime/useAppPageStateTree';
import { useWidgetState } from '../src/logic/appPageRuntime/useWidgetState';
import { useWidgetMethodRegistry } from '../src/logic/appPageRuntime/useWidgetMethodRegistry';
import { useWidgetEventHandlers } from '../src/logic/appPageRuntime/useWidgetEventHandlers';
import { appPageActions } from '../src/logic/appPageRuntime/appPageActions';
import { runDataQueryByIDAPI } from '../src/data/apis/dataQuery';

jest.mock('../src/data/apis/dataQuery', () => ({ runDataQueryByIDAPI: jest.fn() }));
jest.mock('../src/logic/stores/useSocketStore', () => ({ useSocketStore: { getState: () => ({ socket: null }) } }));
jest.mock('../src/logic/appPageRuntime/executeWorkflowWithStreaming', () => ({ executeWorkflowWithStreaming: jest.fn() }));
global.IS_REACT_ACT_ENVIRONMENT = true;

describe('actual AppPage data-source lifecycle', () => {
  let api, dispatch, tree, renderer, setter, fire;
  const source = { alias: 'q', type: 'query', queryID: 'q1', triggerMode: 'reactive', refreshOn: ['variables.filter'] };
  function Probe() {
    api = useAppPageDataSourceManager();
    dispatch = useAppPageDispatch();
    tree = useAppPageStateTree();
    setter = useWidgetState('w').setWidgetState;
    fire = useWidgetEventHandlers('button', { events: { click: [{ actionType: 'EXECUTE_QUERY', config: { alias: 'q' } }] } }).fireWidgetEvent;
    return null;
  }
  const view = (sources = [source], pageID = 'p', tenantID = 't') => React.createElement(
    AppPageRuntimeProvider,
    { pageID, tenantID, pageConfig: { dataSources: sources, variables: [{ key: 'filter', defaultValue: 'one' }] } },
    React.createElement(Probe)
  );
  beforeEach(() => {
    jest.clearAllMocks();
    runDataQueryByIDAPI.mockResolvedValue(['data']);
  });
  afterEach(async () => { if (renderer) await act(async () => renderer.unmount()); });

  test('reactive ref initializes and dependency changes execute a second request', async () => {
    await act(async () => { renderer = TestRenderer.create(view()); });
    await act(async () => dispatch(appPageActions.setVariable('filter', 'two')));
    expect(runDataQueryByIDAPI).toHaveBeenCalledTimes(2);
    expect(tree.queries.q.isLoading).toBe(false);
  });

  test('StrictMode replay of mount effects sends one query and still commits', async () => {
    await act(async () => { renderer = TestRenderer.create(React.createElement(React.StrictMode, null, view())); });
    expect(runDataQueryByIDAPI).toHaveBeenCalledTimes(1);
    expect(tree.queries.q).toMatchObject({ data: ['data'], isLoading: false });
  });

  test('widget-triggered query shares the in-flight auto-fetch instead of bypassing scheduling', async () => {
    let resolve;
    runDataQueryByIDAPI.mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
    await act(async () => { renderer = TestRenderer.create(view()); });
    let event;
    await act(async () => { event = fire('click'); });
    expect(runDataQueryByIDAPI).toHaveBeenCalledTimes(1);
    await act(async () => { resolve(['shared']); await event; });
    expect(tree.queries.q).toMatchObject({ data: ['shared'], isLoading: false });
  });

  test('nested widget dependency matches ancestor changed path but own output does not loop', async () => {
    await act(async () => { renderer = TestRenderer.create(view([{ ...source, refreshOn: ['state.widgets.w.selectedRow', 'queries.q.data'] }])); });
    await act(async () => setter({ selectedRow: 5 }));
    expect(runDataQueryByIDAPI).toHaveBeenCalledTimes(2);
  });

  test('two overlapping identical triggers send one request and settle loading', async () => {
    let resolve;
    runDataQueryByIDAPI.mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
    await act(async () => { renderer = TestRenderer.create(view([{ ...source, triggerMode: 'manual' }])); });
    let first, second;
    await act(async () => { first = api.executeDataSource(source); second = api.executeDataSource(source); });
    expect(runDataQueryByIDAPI).toHaveBeenCalledTimes(1);
    await act(async () => { resolve(['done']); await Promise.all([first, second]); });
    expect(tree.queries.q).toMatchObject({ data: ['done'], isLoading: false });
  });

  test('source replacement under the same alias retires old response', async () => {
    let resolve;
    runDataQueryByIDAPI.mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
    await act(async () => { renderer = TestRenderer.create(view()); });
    await act(async () => renderer.update(view([{ ...source, queryID: 'q2' }])));
    await act(async () => resolve(['stale']));
    expect(runDataQueryByIDAPI).toHaveBeenCalledTimes(2);
    expect(tree.queries.q.data).toEqual(['data']);
  });

  test('tenant/page switch synchronously replaces runtime instead of retaining old results', async () => {
    await act(async () => { renderer = TestRenderer.create(view()); });
    const oldDispatch = dispatch;
    await act(async () => renderer.update(view([], 'other', 'other-tenant')));
    expect(tree.queries).toEqual({});
    await act(async () => oldDispatch(appPageActions.setQueryResult('q', ['foreign'])));
    expect(tree.queries).toEqual({});
  });

  test('retained widget setter cannot resurrect state after its runtime unmounts', async () => {
    await act(async () => { renderer = TestRenderer.create(view([])); });
    const oldSetter = setter;
    await act(async () => renderer.update(view([], 'new-page')));
    await act(async () => oldSetter({ value: 'late' }));
    expect(tree.widgets.w).toBeUndefined();
  });

  test('late setter cannot resurrect an unregistered widget in the same page', async () => {
    let retained;
    function Widget() {
      retained = useWidgetState('removed').setWidgetState;
      useWidgetMethodRegistry('removed');
      return null;
    }
    const page = show => React.createElement(AppPageRuntimeProvider, { pageID: 'p', tenantID: 't' },
      React.createElement(Probe), show ? React.createElement(Widget) : null);
    await act(async () => { renderer = TestRenderer.create(page(true)); });
    await act(async () => retained({ value: 'before removal' }));
    expect(tree.widgets.removed.value).toBe('before removal');
    const lateSetter = retained;
    await act(async () => renderer.update(page(false)));
    await act(async () => lateSetter({ value: 'late' }));
    expect(tree.widgets.removed).toBeUndefined();
  });
});
