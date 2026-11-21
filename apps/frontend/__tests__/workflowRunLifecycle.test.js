import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useWorkflowRun } from '../src/presentation/components/workflowComponents/useWorkflowRun';
import { observeWorkflowRun } from '../src/logic/appPageRuntime/observeWorkflowRun';
import { executeWorkflowAPI, testWorkflowAPI, stopTestWorkflowAPI, cancelWorkflowAPI, submitDataCollectionAPI } from '../src/data/apis/workflow';

jest.mock('../src/data/apis/workflow', () => ({ executeWorkflowAPI: jest.fn(), testWorkflowAPI: jest.fn(), stopTestWorkflowAPI: jest.fn(), cancelWorkflowAPI: jest.fn(), submitDataCollectionAPI: jest.fn() }));
jest.mock('../src/logic/appPageRuntime/observeWorkflowRun', () => ({ observeWorkflowRun: jest.fn() }));
jest.mock('../src/utils/error', () => ({ extractError: error => error.message }));
global.IS_REACT_ACT_ENVIRONMENT = true;
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; };

describe('workflow editor run ownership', () => {
  let api, renderer, observers;
  function Probe() { api = useWorkflowRun({ tenantID: 't' }); return null; }
  beforeEach(async () => {
    jest.resetAllMocks(); observers = [];
    executeWorkflowAPI.mockResolvedValue({ instanceID: 'saved' });
    testWorkflowAPI.mockResolvedValue({ instanceID: 'test' });
    stopTestWorkflowAPI.mockResolvedValue({ success: true });
    cancelWorkflowAPI.mockResolvedValue({ cancellationRequested: true });
    submitDataCollectionAPI.mockResolvedValue({ success: true });
    observeWorkflowRun.mockImplementation(options => { const observer = { ...options, disconnect: jest.fn() }; observers.push(observer); return observer; });
    await act(async () => { renderer = TestRenderer.create(React.createElement(Probe)); });
  });
  afterEach(async () => { await act(async () => renderer.unmount()); });

  test('late start response from an older run cannot replace the new observer', async () => {
    const old = deferred();
    executeWorkflowAPI.mockReturnValueOnce(old.promise).mockResolvedValueOnce({ instanceID: 'new' });
    let first;
    await act(async () => { first = api.startSavedRun({ workflowID: 'old' }); });
    await act(async () => api.startSavedRun({ workflowID: 'new' }));
    await act(async () => { old.resolve({ instanceID: 'old' }); await first; });
    expect(observers).toHaveLength(1);
    expect(observers[0].instanceID).toBe('new');
    expect(api.isRunning).toBe(true);
  });

  test('stale callbacks and polls cannot finish a new run', async () => {
    await act(async () => api.startSavedRun({ workflowID: 'one' }));
    const old = observers[0];
    executeWorkflowAPI.mockResolvedValueOnce({ instanceID: 'two' });
    await act(async () => api.startSavedRun({ workflowID: 'two' }));
    await act(async () => old.onTerminal({ status: 'FAILED', contextData: { stale: true } }));
    expect(api.isRunning).toBe(true);
    expect(api.result).toBeNull();
    expect(api.context.stale).toBeUndefined();
    expect(old.disconnect).toHaveBeenCalled();
  });

  test('Stop before a test start reply cleans up the eventual test instance', async () => {
    const pending = deferred(); testWorkflowAPI.mockReturnValueOnce(pending.promise);
    let start;
    await act(async () => { start = api.startTestRun({ nodes: [], edges: [] }); });
    await act(async () => api.stopRun());
    await act(async () => { pending.resolve({ instanceID: 'late-test' }); await start; });
    expect(stopTestWorkflowAPI).toHaveBeenCalledWith({ tenantID: 't', instanceID: 'late-test' });
    expect(api.isRunning).toBe(false);
    expect(observeWorkflowRun).not.toHaveBeenCalled();
  });

  test('production Stop requests cancellation without test deletion or false terminal state', async () => {
    await act(async () => api.startSavedRun({ workflowID: 'wf' }));
    await act(async () => api.stopRun());
    expect(cancelWorkflowAPI).toHaveBeenCalledWith({ tenantID: 't', instanceID: 'saved' });
    expect(stopTestWorkflowAPI).not.toHaveBeenCalled();
    expect(api.isRunning).toBe(true);
    expect(api.result).toBeNull();
    await act(async () => observers[0].onTerminal({ status: 'CANCELLED' }));
    expect(api.isRunning).toBe(false);
  });

  test('terminal cancellation clears pending form and every running/suspended indicator', async () => {
    await act(async () => api.startSavedRun({ workflowID: 'wf' }));
    await act(async () => {
      observers[0].onUpdate({ nodeID: 'n', status: 'RUNNING' });
      observers[0].onRequest({ collectionRequestID: 'r' });
    });
    expect(api.dataCollectionRequest.collectionRequestID).toBe('r');
    await act(async () => observers[0].onTerminal({ status: 'CANCELLED' }));
    expect(api.dataCollectionRequest).toBeNull();
    expect(api.nodeExecutionStatus.n).toBe('cancelled');
  });

  test('failed cancel request keeps observing instead of falsely reporting stopped', async () => {
    cancelWorkflowAPI.mockRejectedValueOnce(new Error('offline'));
    await act(async () => api.startSavedRun({ workflowID: 'wf' }));
    await act(async () => api.stopRun());
    expect(api.isRunning).toBe(true);
    expect(api.logs.at(-1).label).toBe('Cancellation failed');
    expect(observers[0].disconnect).not.toHaveBeenCalled();
  });

  test('late submission completion cannot close a new run\'s form', async () => {
    await act(async () => api.startSavedRun({ workflowID: 'one' }));
    await act(async () => observers[0].onRequest({ collectionRequestID: 'old-form' }));
    const pending = deferred(); submitDataCollectionAPI.mockReturnValueOnce(pending.promise);
    let submitting;
    await act(async () => { submitting = api.submitCollectedData({ value: 1 }); });
    executeWorkflowAPI.mockResolvedValueOnce({ instanceID: 'two' });
    await act(async () => api.startSavedRun({ workflowID: 'two' }));
    await act(async () => observers[1].onRequest({ collectionRequestID: 'new-form' }));
    await act(async () => { pending.resolve({ success: true }); await submitting; });
    expect(api.dataCollectionRequest.collectionRequestID).toBe('new-form');
  });
});
