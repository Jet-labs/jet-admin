import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { createRuntimeServices } from '../src/logic/applicationRuntime/runtimeServices';
import { observeApplicationListener } from '../src/logic/applicationRuntime/observeListener';
import { executeWorkflowWithStreaming } from '../src/logic/appPageRuntime/executeWorkflowWithStreaming';
import { AppPageRuntimeProvider } from '../src/logic/appPageRuntime/AppPageRuntimeProvider';
import { useAppPageDataSourceManager } from '../src/logic/appPageRuntime/useAppPageDataSourceManager';
import { useAppPageStateTree } from '../src/logic/appPageRuntime/useAppPageStateTree';
import { useWidgetEventHandlers } from '../src/logic/appPageRuntime/useWidgetEventHandlers';
import { executeWorkflowAPI } from '../src/data/apis/workflow';

jest.mock('../src/data/apis/workflow', () => ({ executeWorkflowAPI: jest.fn(), cancelWorkflowAPI: jest.fn(), getWorkflowRunStatusAPI: jest.fn() }));
jest.mock('../src/logic/stores/useSocketStore', () => ({ useSocketStore: { getState: () => ({ socket: null }), subscribe: jest.fn(() => () => {}) } }));
jest.mock('../src/data/apis/dataQuery', () => ({ runDataQueryByIDAPI: jest.fn() }));
global.IS_REACT_ACT_ENVIRONMENT = true;
const manifest = { mode: 'runtime', executionEnabled: true, actionsEnabled: true, runtime: { releaseID: 'r1' }, widgets: {}, pages: { p: { appPageConfig: { dataSources: [
  { alias: 'flow', type: 'workflow', triggerMode: 'auto' }, { alias: 'events', type: 'listener', triggerMode: 'auto' },
] } } } };
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
const services = options => createRuntimeServices({ manifest, pageAssetKey: 'p', ...options });

describe('Application workflow and listener adapters', () => {
  beforeEach(() => { jest.useFakeTimers(); jest.clearAllMocks(); });
  afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });
  it('retains an accepted run across route-service recreation, but allows an explicit new start', async () => {
    const executeQuery = jest.fn().mockResolvedValue({ instanceID: 'run' });
    const workflowRuns = new Map();
    const first = services({ executeQuery, workflowRuns });
    const a = first.startWorkflow({ alias: 'flow', inputValues: { id: 1 }, resume: true });
    const b = first.startWorkflow({ alias: 'flow', inputValues: { id: 1 }, resume: true });
    await expect(a).resolves.toEqual({ instanceID: 'run' }); await b;
    const nextRoute = services({ executeQuery, workflowRuns });
    await nextRoute.startWorkflow({ alias: 'flow', inputValues: { id: 1 }, resume: true });
    expect(executeQuery).toHaveBeenCalledTimes(1);
    await nextRoute.startWorkflow({ alias: 'flow', inputValues: { id: 1 } });
    expect(executeQuery).toHaveBeenCalledTimes(2);
  });
  it('keeps uncertain acceptance as an observable run and never retries its start automatically', async () => {
    const executeQuery = jest.fn().mockRejectedValue({ code: 'APPLICATION_WORKFLOW_START_UNKNOWN', details: { instanceID: 'uncertain' } });
    const runtime = services({ executeQuery });
    await expect(runtime.startWorkflow({ alias: 'flow', inputValues: {}, resume: true })).resolves.toMatchObject({ instanceID: 'uncertain' });
    await runtime.startWorkflow({ alias: 'flow', inputValues: {}, resume: true });
    expect(executeQuery).toHaveBeenCalledTimes(1);
  });
  it('streams a deployed run using only the injected status transport, not live workflow IDs or rooms', async () => {
    const dispatch = jest.fn(), getWorkflowStatus = jest.fn().mockResolvedValue({ instanceID: 'run', status: 'COMPLETED', contextData: { output: { ok: true } } });
    const runtime = services({ executeQuery: jest.fn().mockResolvedValue({ instanceID: 'run' }), getWorkflowStatus });
    const stream = executeWorkflowWithStreaming({ tenantID: 't', alias: 'flow', inputValues: {}, dispatch, runtimeServices: runtime });
    await flush();
    expect(getWorkflowStatus).toHaveBeenCalledWith({ pageAssetKey: 'p', alias: 'flow', instanceID: 'run' });
    expect(executeWorkflowAPI).not.toHaveBeenCalled();
    expect(dispatch.mock.calls.some(([action]) => JSON.stringify(action).includes('"ok":true'))).toBe(true);
    stream.disconnect();
    jest.advanceTimersByTime(10000); await flush();
    expect(getWorkflowStatus).toHaveBeenCalledTimes(1);
  });
  it('polls listener cursors in order and stops rather than hiding an expired history gap', async () => {
    const readEvents = jest.fn().mockResolvedValueOnce({ events: [{ sequence: '1', data: 'first' }], cursor: 'cursor1' })
      .mockRejectedValueOnce({ status: 410, code: 'APPLICATION_CURSOR_EXPIRED' });
    const onEvent = jest.fn(), onError = jest.fn();
    observeApplicationListener({ readEvents, onEvent, onError });
    await flush(); jest.advanceTimersByTime(2000); await flush();
    expect(onEvent).toHaveBeenCalledWith({ sequence: '1', data: 'first' });
    expect(readEvents.mock.calls[1][0].cursor).toBe('cursor1');
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ status: 410 }));
    jest.advanceTimersByTime(10000); await flush(); expect(readEvents).toHaveBeenCalledTimes(2);
  });
  it('aborts listener observation on leave and ignores late deliveries', async () => {
    let resolve;
    const readEvents = jest.fn(() => new Promise(yes => { resolve = yes; })), onEvent = jest.fn();
    const observer = observeApplicationListener({ readEvents, onEvent });
    observer.disconnect(); resolve({ events: [{ data: 'late' }], cursor: 'x' }); await flush();
    expect(readEvents.mock.calls[0][0].signal.aborted).toBe(true);
    expect(onEvent).not.toHaveBeenCalled();
  });
  it('denies using query transport for workflows or observing undeclared listener aliases', async () => {
    const runtime = services({ executeQuery: jest.fn() });
    await expect(runtime.runQuery({ alias: 'flow', inputValues: {} })).rejects.toThrow('not a pinned query');
    await expect(runtime.startWorkflow({ alias: 'other', inputValues: {} })).rejects.toThrow('not a captured workflow');
    expect(() => runtime.subscribeListener({ alias: 'other' })).toThrow('not a captured listener');
  });
  it('does not resubscribe a push listener on its configured refetch interval', async () => {
    // Push listeners own their cursor; disconnect/reconnect would replay history.
    const disconnect = jest.fn();
    const subscribeListener = jest.fn(() => ({ disconnect }));
    const runtime = { identity: 'r1:p', executionEnabled: true, actionsEnabled: true, subscribeListener };
    function Probe() { useAppPageDataSourceManager(); return null; }
    let renderer;
    await act(async () => { renderer = TestRenderer.create(React.createElement(AppPageRuntimeProvider, { pageID: 'p', tenantID: 't', runtimeServices: runtime,
      pageConfig: { dataSources: [{ alias: 'events', type: 'listener', triggerMode: 'auto', refetchInterval: 1000 }] } }, React.createElement(Probe))); await flush(); });
    expect(subscribeListener).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(5000); await flush();
    expect(subscribeListener).toHaveBeenCalledTimes(1);
    await act(async () => renderer.unmount());
    jest.advanceTimersByTime(5000); await flush();
    expect(subscribeListener).toHaveBeenCalledTimes(1);
  });
  it('auto-starts workflow/listener aliases without exposing source IDs and tears down only observers', async () => {
    const startWorkflow = jest.fn().mockResolvedValue({ instanceID: 'run' });
    const getWorkflowStatus = jest.fn().mockResolvedValue({ instanceID: 'run', status: 'RUNNING', contextData: { output: null }, pendingDataCollectionRequests: [] });
    const disconnect = jest.fn(); let onEvent, tree;
    const subscribeListener = jest.fn(options => { onEvent = options.onEvent; return { disconnect }; });
    const runtime = { identity: 'r1:p', executionEnabled: true, actionsEnabled: true, startWorkflow, getWorkflowStatus, subscribeListener };
    function Probe() { useAppPageDataSourceManager(); tree = useAppPageStateTree(); return null; }
    let renderer;
    await act(async () => { renderer = TestRenderer.create(React.createElement(AppPageRuntimeProvider, { pageID: 'p', tenantID: 't', runtimeServices: runtime, pageConfig: manifest.pages.p.appPageConfig }, React.createElement(Probe))); await flush(); });
    expect(startWorkflow).toHaveBeenCalledWith({ alias: 'flow', inputValues: {}, resume: true });
    expect(subscribeListener).toHaveBeenCalledTimes(1);
    act(() => onEvent({ data: { changed: true }, mode: 'replace', limit: 10 }));
    expect(tree.listeners.events.data).toEqual({ changed: true });
    await act(async () => renderer.unmount());
    expect(disconnect).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(10000); await flush();
    expect(startWorkflow).toHaveBeenCalledTimes(1);
  });
  it('starts manual workflow events through the deployed adapter without a live-source fallback', async () => {
    const startWorkflow = jest.fn().mockResolvedValue({ instanceID: 'run' });
    const getWorkflowStatus = jest.fn().mockResolvedValue({ instanceID: 'run', status: 'COMPLETED', contextData: { output: 'done' } });
    let fire, renderer;
    function Probe() { fire = useWidgetEventHandlers('button', { events: { onClick: [{ actionType: 'EXECUTE_QUERY', config: { alias: 'flow' } }] } }).fireWidgetEvent; return null; }
    await act(async () => { renderer = TestRenderer.create(React.createElement(AppPageRuntimeProvider, { pageID: 'p', tenantID: 't', runtimeServices: { identity: 'r1', executionEnabled: true, actionsEnabled: true, startWorkflow, getWorkflowStatus }, pageConfig: { dataSources: [{ alias: 'flow', type: 'workflow', triggerMode: 'manual' }] } }, React.createElement(Probe))); });
    await act(async () => { await fire('onClick'); await flush(); });
    expect(startWorkflow).toHaveBeenCalledTimes(1); expect(executeWorkflowAPI).not.toHaveBeenCalled();
    await act(async () => renderer.unmount());
  });
});
