import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { createApplicationStore } from '../src/logic/applicationRuntime/applicationStore';
import { resolveCompositionValue, resolveCompositionConfig, createCompositionServices } from '../src/logic/applicationRuntime/compositionRuntime';
import { createRuntimeServices } from '../src/logic/applicationRuntime/runtimeServices';
import { AppPageRuntimeProvider } from '../src/logic/appPageRuntime/AppPageRuntimeProvider';
import { useAppPageStateTree } from '../src/logic/appPageRuntime/useAppPageStateTree';
import { useAppPageDispatch } from '../src/logic/appPageRuntime/useAppPageDispatch';
import { useWidgetEventHandlers } from '../src/logic/appPageRuntime/useWidgetEventHandlers';
import { appPageActions } from '../src/logic/appPageRuntime/appPageActions';
import {
  moveApplicationRoute,
  moveApplicationRouteByOffset,
  shouldRedirectToHome,
} from '../src/logic/applicationRuntime/routeOrdering';

global.IS_REACT_ACT_ENVIRONMENT = true;
jest.mock('../src/logic/appPageRuntime/executeWorkflowWithStreaming', () => ({ executeWorkflowWithStreaming: jest.fn() }));

describe('Composition expression safety', () => {
  const state = { page: { variables: { orderID: 7, rows: [{ label: 'A' }] } } };
  it('preserves path binding types and interpolates plain text', () => {
    expect(resolveCompositionValue('{{ state.page.variables.orderID }}', state)).toBe(7);
    expect(resolveCompositionValue('{{ state.page.variables.rows[0].label }}', state)).toBe('A');
    expect(resolveCompositionValue('Order {{ state.page.variables.orderID }}', state)).toBe('Order 7');
    expect(resolveCompositionConfig({ nested: ['{{ state.page.variables.rows }}'] }, state).nested[0]).toEqual([{ label: 'A' }]);
  });
  it.each(['{{ globalThis }}', '{{ state.constructor.constructor("return window")() }}', '{{ fetch("/api") }}', '{{ state.page.variables.orderID = 100 }}', '{{ state.page.variables.rows.map(x => x) }}', '{{ state.__proto__ }}', '{{ state.widgetMethods.button.click }}'])('never evaluates code: %s', expression => {
    expect(resolveCompositionValue(expression, state)).toBeUndefined();
    expect(state.page.variables.orderID).toBe(7);
  });
  it('resolves only snapshot widgets, never falling back to a live resource', async () => {
    const services = createCompositionServices({ mode: 'composition', executionEnabled: false, previewID: 'p1', widgets: { button: { widgetType: 'button' } } });
    expect(await services.resolveWidget('button')).toEqual({ widgetType: 'button' });
    await expect(services.resolveWidget('missing')).rejects.toThrow('not present');
    expect(() => createCompositionServices({ mode: 'production', executionEnabled: true })).toThrow('Unsupported');
    expect(services.evaluateVisibility('{{ state.page.variables.orderID = 100 }}', state).visible).toBe(false);
  });
});

describe('Application state isolation', () => {
  it('isolates sessions and enforces declared JSON state types', () => {
    const declaration = { workspace: { type: ['string', 'null'], default: null }, preferences: { type: 'object', default: { compact: false } } };
    const first = createApplicationStore(declaration), second = createApplicationStore(declaration);
    first.getState().setVariable('workspace', 'team-a');
    expect(first.getState().variables.workspace).toBe('team-a'); expect(second.getState().variables.workspace).toBeNull();
    expect(() => first.getState().setVariable('workspace', 42)).toThrow();
    expect(() => first.getState().setVariable('__proto__', {})).toThrow();
    const value = { compact: true }; first.getState().setVariable('preferences', value); value.compact = false;
    expect(first.getState().variables.preferences.compact).toBe(true);
    first.getState().reset(); expect(first.getState().variables.workspace).toBeNull();
  });
});

describe('Deployed runtime services', () => {
  const manifest = {
    mode: 'runtime',
    executionEnabled: true,
    actionsEnabled: true,
    runtime: { releaseID: 'release-1' },
    widgets: { button: { widgetType: 'button', widgetConfig: { text: 'Pinned' } } },
    pages: {
      'orders-page': {
        appPageConfig: {
          dataSources: [
            { alias: 'orders', type: 'query', triggerMode: 'auto' },
            { alias: 'saveOrder', type: 'query', triggerMode: 'manual' },
          ],
        },
      },
    },
  };
  it('resolves only pinned widgets and executes only page-scoped query aliases', async () => {
    const executeQuery = jest.fn().mockResolvedValue({ rows: [1] });
    const services = createRuntimeServices({ manifest, pageAssetKey: 'orders-page', executeQuery });
    expect(services.actionsEnabled).toBe(true);
    expect(services).not.toHaveProperty('mutationsEnabled');
    expect(services).not.toHaveProperty('executeAction');
    expect(await services.resolveWidget('button')).toMatchObject({ widgetType: 'button' });
    await expect(services.resolveWidget('live-widget')).rejects.toThrow('not part of this release');
    await expect(services.runQuery({ alias: 'orders', inputValues: { limit: 1 }, signal: 's' }))
      .resolves.toEqual({ rows: [1] });
    expect(executeQuery).toHaveBeenCalledWith({ pageAssetKey: 'orders-page', alias: 'orders', inputValues: { limit: 1 }, signal: 's' });
    await expect(services.runQuery({ alias: 'missing', inputValues: {} }))
      .rejects.toThrow('not a pinned query');
    expect(executeQuery).toHaveBeenCalledTimes(1);
    const otherPage = createRuntimeServices({ manifest, pageAssetKey: 'other-page', executeQuery });
    await expect(otherPage.runQuery({ alias: 'orders', inputValues: {} })).rejects.toThrow('not a pinned query');
  });
  it('executes configured mutation queries through the same adapter without idempotency metadata', async () => {
    const executeQuery = jest.fn().mockResolvedValue({ rowCount: 1 });
    const services = createRuntimeServices({ manifest, pageAssetKey: 'orders-page', executeQuery });
    await expect(services.runQuery({
      alias: 'saveOrder',
      inputValues: { status: 'paid' },
      signal: 's',
    })).resolves.toEqual({ rowCount: 1 });
    expect(executeQuery).toHaveBeenCalledWith({
      pageAssetKey: 'orders-page',
      alias: 'saveOrder',
      inputValues: { status: 'paid' },
      signal: 's',
    });
  });
  it('ignores legacy effect labels when resolving a published query alias', async () => {
    const legacy = { ...manifest, pages: { 'orders-page': { appPageConfig: { dataSources: [
      { alias: 'saveOrder', type: 'query', effect: 'write', readOnly: false, triggerMode: 'manual' },
    ] } } } };
    const executeQuery = jest.fn().mockResolvedValue({ rowCount: 1 });
    const services = createRuntimeServices({ manifest: legacy, pageAssetKey: 'orders-page', executeQuery });
    await expect(services.runQuery({ alias: 'saveOrder', inputValues: {} })).resolves.toEqual({ rowCount: 1 });
  });
  it('rejects manifests that are not deployed runtime contracts', () => {
    expect(() => createRuntimeServices({ manifest: { ...manifest, mode: 'composition' }, pageAssetKey: 'orders-page', executeQuery: jest.fn() }))
      .toThrow('Unsupported');
  });
});

describe('Application route ordering and root routing', () => {
  const definition = () => ({
    shell: {
      kind: 'sidebar',
      homeRouteID: 'sla',
      navigation: [
        { routeID: 'sla', label: 'sla' },
        { routeID: 'home', label: 'home' },
      ],
    },
    routes: [
      { id: 'sla', path: '/sla', pageAssetKey: 'sla-page' },
      { id: 'home', path: '/', pageAssetKey: 'overview-page' },
    ],
  });

  it('moves a route and keeps navigation in the same order', () => {
    const next = moveApplicationRoute(definition(), 'home', 'sla', 'before');
    expect(next.routes.map(route => route.id)).toEqual(['home', 'sla']);
    expect(next.shell.navigation.map(item => item.routeID)).toEqual(['home', 'sla']);
    expect(next.shell.homeRouteID).toBe('sla');
    expect(definition().routes.map(route => route.id)).toEqual(['sla', 'home']);
  });

  it('supports keyboard-style one-step moves and ignores no-op moves', () => {
    const next = moveApplicationRouteByOffset(definition(), 'sla', 1);
    expect(next.routes.map(route => route.id)).toEqual(['home', 'sla']);
    expect(moveApplicationRoute(definition(), 'sla', 'home', 'before')).toBeNull();
    expect(moveApplicationRouteByOffset(definition(), 'home', 1)).toBeNull();
  });

  it('does not redirect a real root route, but still redirects an empty root URL to homeRouteID', () => {
    expect(shouldRedirectToHome(definition().routes, '/', 'sla')).toBe(false);
    const noRoot = definition().routes.filter(route => route.path !== '/');
    expect(shouldRedirectToHome(noRoot, '/', 'sla')).toBe(true);
    expect(shouldRedirectToHome(noRoot, '/other', 'sla')).toBe(false);
  });
});

describe('Runtime query event adapter', () => {
  const holder = {};
  function WriteProbe() {
    holder.tree = useAppPageStateTree();
    holder.fire = useWidgetEventHandlers('button', {
      events: {
        onClick: [
          {
            actionType: 'EXECUTE_QUERY',
            config: { alias: 'saveOrder', inputValues: { status: 'paid' } },
          },
        ],
      },
    }).fireWidgetEvent;
    return null;
  }
  const render = (props) => React.createElement(
    AppPageRuntimeProvider,
    {
      pageID: 'page',
      tenantID: 'tenant',
      pageConfig: {
        variables: [],
        dataSources: [
          { alias: 'saveOrder', type: 'query', triggerMode: 'manual' },
        ],
      },
      ...props,
    },
    React.createElement(WriteProbe)
  );
  it('executes a configured query through runtime services without effect or idempotency fields', async () => {
    const runQuery = jest.fn().mockResolvedValue({ rowCount: 1 });
    let renderer;
    act(() => {
      renderer = TestRenderer.create(render({
        runtimeServices: {
          identity: 'runtime:release-1',
          executionEnabled: true,
          actionsEnabled: true,
          runQuery,
        },
      }));
    });
    let result;
    await act(async () => { result = await holder.fire('onClick'); });
    expect(result[0]).toMatchObject({
      actionType: 'EXECUTE_QUERY',
      success: true,
      result: { rowCount: 1 },
    });
    expect(runQuery).toHaveBeenCalledTimes(1);
    expect(runQuery.mock.calls[0][0]).toMatchObject({
      alias: 'saveOrder',
      inputValues: { status: 'paid' },
    });
    expect(runQuery.mock.calls[0][0]).not.toHaveProperty('idempotencyKey');
    expect(holder.tree.queries.saveOrder.data).toEqual({ rowCount: 1 });
    act(() => renderer.unmount());
  });
});

describe('Existing page runtime composition adapter', () => {
  const holder = {};
  function Probe() {
    holder.tree = useAppPageStateTree(); holder.dispatch = useAppPageDispatch();
    holder.fire = useWidgetEventHandlers('button', { events: { onClick: [{ actionType: 'SET_VARIABLE', config: { key: 'value', value: 'unsafe' } }] } }).fireWidgetEvent;
    return null;
  }
  const render = props => React.createElement(AppPageRuntimeProvider, { pageID: 'page', tenantID: 'tenant', pageConfig: { variables: [{ key: 'value', defaultValue: 'default' }] }, ...props }, React.createElement(Probe));
  it('preserves legacy aliases while projecting application and page scope', () => {
    let renderer;
    const context = { application: { variables: { shared: 'retained' } }, route: { id: 'list' } };
    act(() => { renderer = TestRenderer.create(render({ scopeID: 'list', expressionContext: context })); });
    act(() => holder.dispatch(appPageActions.setVariable('value', 'changed')));
    expect(holder.tree.variables.value).toBe('changed'); expect(holder.tree.page.variables.value).toBe('changed');
    act(() => renderer.update(render({ scopeID: 'detail:record-2', expressionContext: { ...context, route: { id: 'detail' } } })));
    expect(holder.tree.variables.value).toBe('default'); expect(holder.tree.application.variables.shared).toBe('retained');
    act(() => renderer.unmount());
  });
  it('blocks widget event chains even if a preview config contains executable actions', async () => {
    let renderer;
    act(() => { renderer = TestRenderer.create(render({ runtimeServices: { identity: 'p1', executionEnabled: false } })); });
    let result; await act(async () => { result = await holder.fire('onClick'); });
    expect(result[0]).toMatchObject({ success: false, status: 'skipped', error: { code: 'COMPOSITION_ONLY' } });
    expect(holder.tree.variables.value).toBe('default');
    act(() => renderer.unmount());
  });
  it('retains standalone event behavior when no composition services are passed', async () => {
    let renderer; act(() => { renderer = TestRenderer.create(render({})); });
    await act(async () => holder.fire('onClick'));
    expect(holder.tree.variables.value).toBe('unsafe');
    act(() => renderer.unmount());
  });
});
