import { observeWorkflowRun } from '../src/logic/appPageRuntime/observeWorkflowRun';
import { executeWorkflowWithStreaming } from '../src/logic/appPageRuntime/executeWorkflowWithStreaming';
import { executeWorkflowAPI, getWorkflowRunStatusAPI, cancelWorkflowAPI } from '../src/data/apis/workflow';

let mockSocket = null;
const mockSubscribers = new Set();
jest.mock('../src/data/apis/workflow', () => ({ executeWorkflowAPI: jest.fn(), getWorkflowRunStatusAPI: jest.fn(), cancelWorkflowAPI: jest.fn() }));
jest.mock('../src/logic/stores/useSocketStore', () => ({ useSocketStore: {
  getState: () => ({ socket: mockSocket }),
  subscribe: fn => { mockSubscribers.add(fn); return () => mockSubscribers.delete(fn); },
} }));

function socket() {
  const listeners = new Map();
  return {
    on: jest.fn((event, fn) => { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(fn); }),
    off: jest.fn((event, fn) => listeners.get(event)?.delete(fn)),
    emit: jest.fn(),
    receive: (event, data) => { for (const fn of [...(listeners.get(event) || [])]) fn(data); },
    count: event => listeners.get(event)?.size || 0,
  };
}
const flush = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };

describe('workflow observation convergence', () => {
  const observers = [];
  const observe = args => { const result = observeWorkflowRun({ tenantID: 't', instanceID: 'r', ...args }); observers.push(result); return result; };
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockSocket = null;
    getWorkflowRunStatusAPI.mockResolvedValue({ data: { instanceID: 'r', status: 'RUNNING' } });
    executeWorkflowAPI.mockResolvedValue({ instanceID: 'r' });
    cancelWorkflowAPI.mockResolvedValue({ success: true });
  });
  afterEach(() => {
    for (const observer of observers.splice(0)) observer.disconnect();
    mockSubscribers.clear();
    jest.useRealTimers();
  });

  test('no socket does not falsely complete a started workflow; polling finds final result', async () => {
    const dispatch = jest.fn(), onComplete = jest.fn();
    const stream = executeWorkflowWithStreaming({ tenantID: 't', workflowID: 'w', alias: 'q', dispatch, onComplete });
    observers.push(stream);
    await flush();
    expect(dispatch.mock.calls.at(-1)[0].payload.isLoading).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();
    getWorkflowRunStatusAPI.mockResolvedValue({ data: { instanceID: 'r', status: 'COMPLETED', contextData: { answer: 42 } } });
    jest.advanceTimersByTime(2000);
    await flush();
    expect(dispatch.mock.calls.at(-1)[0].payload).toMatchObject({ data: { answer: 42 }, isLoading: false });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('mount-before-socket binds on readiness and re-joins after reconnect', async () => {
    const onTerminal = jest.fn();
    observe({ onTerminal });
    await flush();
    mockSocket = socket();
    for (const fn of mockSubscribers) fn({ socket: mockSocket });
    expect(mockSocket.emit).toHaveBeenCalledWith('workflow_run_join', { runId: 'r' }, expect.any(Function));
    mockSocket.emit.mockClear();
    mockSocket.receive('connect');
    expect(mockSocket.emit).toHaveBeenCalledWith('workflow_run_join', { runId: 'r' }, expect.any(Function));
    mockSocket.receive('workflow_status_update', { instanceID: 'r', status: 'COMPLETED' });
    expect(onTerminal).toHaveBeenCalledTimes(1);
    expect(mockSocket.count('workflow_status_update')).toBe(0);
  });

  test('poll transport failure remains an observation error, not a workflow failure', async () => {
    const onTerminal = jest.fn(), onObservationError = jest.fn();
    getWorkflowRunStatusAPI.mockRejectedValueOnce(new Error('offline'));
    observe({ onTerminal, onObservationError });
    await flush();
    expect(onObservationError).toHaveBeenCalledTimes(1);
    expect(onTerminal).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2000);
    await flush();
    expect(getWorkflowRunStatusAPI).toHaveBeenCalledTimes(2);
  });

  test('terminal event is absorbing even if an older poll resolves later', async () => {
    let resolve;
    getWorkflowRunStatusAPI.mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
    mockSocket = socket();
    const onUpdate = jest.fn(), onTerminal = jest.fn();
    observe({ onUpdate, onTerminal });
    mockSocket.receive('workflow_status_update', { instanceID: 'r', status: 'CANCELLED' });
    resolve({ data: { instanceID: 'r', status: 'RUNNING' } });
    await flush();
    expect(onTerminal).toHaveBeenCalledTimes(1);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  test('cleanup uses original socket and leaves room after socket replacement', () => {
    const old = socket(), fresh = socket();
    mockSocket = old;
    const observer = observe({});
    mockSocket = fresh;
    for (const fn of mockSubscribers) fn({ socket: fresh });
    expect(old.count('workflow_node_update')).toBe(0);
    expect(old.emit).toHaveBeenCalledWith('leave_room', 'r');
    observer.disconnect();
    expect(fresh.count('workflow_node_update')).toBe(0);
    expect(fresh.emit).toHaveBeenCalledWith('leave_room', 'r');
  });

  test('one observer cannot leave a room still used by another', () => {
    mockSocket = socket();
    const first = observe({}), second = observe({});
    first.disconnect();
    expect(mockSocket.emit).not.toHaveBeenCalledWith('leave_room', 'r');
    second.disconnect();
    expect(mockSocket.emit).toHaveBeenCalledWith('leave_room', 'r');
  });

  test('disposal before start response prevents late subscriptions or callbacks', async () => {
    let resolve;
    executeWorkflowAPI.mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
    const dispatch = jest.fn(), onError = jest.fn();
    const stream = executeWorkflowWithStreaming({ tenantID: 't', workflowID: 'w', alias: 'q', dispatch, onError });
    await flush();
    stream.disconnect();
    const actionCount = dispatch.mock.calls.length;
    resolve({ instanceID: 'r' });
    await flush();
    expect(dispatch).toHaveBeenCalledTimes(actionCount);
    expect(getWorkflowRunStatusAPI).not.toHaveBeenCalled();
    expect(mockSubscribers.size).toBe(0);
  });

  test('same-turn setup/cleanup (StrictMode) never starts a disposed execution', async () => {
    const stream = executeWorkflowWithStreaming({ tenantID: 't', workflowID: 'w', alias: 'q', dispatch: jest.fn() });
    stream.disconnect();
    await flush();
    expect(executeWorkflowAPI).not.toHaveBeenCalled();
  });

  test('Stop before the start reply requests real cancellation once the run ID is known', async () => {
    let resolve;
    executeWorkflowAPI.mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
    const dispatch = jest.fn();
    const stream = executeWorkflowWithStreaming({ tenantID: 't', workflowID: 'w', alias: 'q', dispatch });
    observers.push(stream);
    await flush();
    expect(await stream.cancel()).toEqual({ queued: true });
    resolve({ instanceID: 'r' });
    await flush();
    expect(cancelWorkflowAPI).toHaveBeenCalledWith({ tenantID: 't', instanceID: 'r' });
    expect(dispatch.mock.calls.at(-1)[0].payload.isLoading).toBe(true);
  });

  test('authorized snapshots can rediscover a pending human-input request', async () => {
    const onRequest = jest.fn();
    getWorkflowRunStatusAPI.mockResolvedValue({ data: { status: 'RUNNING', pendingDataCollectionRequests: [{ collectionRequestID: 'request' }] } });
    observe({ onRequest });
    await flush();
    expect(onRequest).toHaveBeenCalledWith({ collectionRequestID: 'request' });
  });
});
