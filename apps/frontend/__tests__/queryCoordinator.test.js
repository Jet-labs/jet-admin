import { getQueryCoordinator } from '../src/logic/appPageRuntime/queryCoordinator';

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const resultActions = dispatch => dispatch.mock.calls.map(([action]) => action).filter(a => a.type === 'APP_PAGE_SET_QUERY_RESULT');

describe('shared query scheduling', () => {
  test('overlapping identical poll/manual triggers share one request and commit once', async () => {
    const dispatch = jest.fn(), pending = deferred();
    const execute = jest.fn(() => pending.promise);
    const coordinator = getQueryCoordinator(dispatch);
    const args = { alias: 'q', tenantID: 't', queryID: 'q1', inputValues: { a: 1 }, execute };
    const first = coordinator.run(args);
    const second = coordinator.run(args);
    expect(first).toBe(second);
    await Promise.resolve();
    expect(execute).toHaveBeenCalledTimes(1);
    pending.resolve(['rows']);
    await first;
    expect(resultActions(dispatch)).toHaveLength(1);
    expect(resultActions(dispatch)[0].payload).toMatchObject({ data: ['rows'], isLoading: false });
  });

  test('changed inputs replace work; late response cannot overwrite latest result', async () => {
    const dispatch = jest.fn(), old = deferred(), fresh = deferred();
    const execute = jest.fn().mockImplementationOnce(() => old.promise).mockImplementationOnce(() => fresh.promise);
    const c = getQueryCoordinator(dispatch);
    const args = { alias: 'q', tenantID: 't', queryID: 'q1', execute };
    const first = c.run({ ...args, inputValues: { page: 1 } });
    await Promise.resolve();
    const second = c.run({ ...args, inputValues: { page: 2 } });
    await Promise.resolve();
    expect(execute.mock.calls[0][0].signal.aborted).toBe(true);
    fresh.resolve(['new']);
    await second;
    old.resolve(['old']);
    expect(await first).toBeNull();
    expect(resultActions(dispatch).map(a => a.payload.data)).toEqual([['new']]);
  });

  test('retiring a source ignores even transports that do not honor abort', async () => {
    const dispatch = jest.fn(), pending = deferred();
    const c = getQueryCoordinator(dispatch);
    const request = c.run({ alias: 'q', execute: () => pending.promise });
    await Promise.resolve();
    c.retire('q');
    pending.resolve('late');
    await request;
    expect(resultActions(dispatch)).toHaveLength(0);
  });

  test('provider scopes are isolated even when aliases match', () => {
    expect(getQueryCoordinator(jest.fn())).not.toBe(getQueryCoordinator(jest.fn()));
  });

  test('current errors settle loading and allow explicit retry', async () => {
    const dispatch = jest.fn();
    const c = getQueryCoordinator(dispatch);
    await expect(c.run({ alias: 'q', execute: () => Promise.reject(new Error('offline')) })).rejects.toThrow('offline');
    expect(resultActions(dispatch)[0].payload.isLoading).toBe(false);
    await c.run({ alias: 'q', execute: async () => ['retried'] });
    expect(resultActions(dispatch).at(-1).payload.data).toEqual(['retried']);
  });
});
