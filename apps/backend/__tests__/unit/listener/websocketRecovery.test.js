const path = require('path');
const { buildSync } = require('esbuild');

// Controllable ws mock: records handlers so the test can emit close/error.
const sockets = [];
jest.mock('ws', () => {
  return jest.fn().mockImplementation(() => {
    const handlers = new Map();
    const socket = {
      handlers,
      on: jest.fn((event, handler) => {
        if (!handlers.has(event)) handlers.set(event, new Set());
        handlers.get(event).add(handler);
      }),
      emit: (event, payload) => { for (const handler of [...(handlers.get(event) || [])]) handler(payload); },
      terminate: jest.fn(),
    };
    sockets.push(socket);
    return socket;
  });
}, { virtual: true });

const compiled = buildSync({
  stdin: {
    contents: 'export { default as WebSocketDataSource } from "./data-sources/websocket/datasource.js";',
    resolveDir: path.resolve(__dirname, '../../../../..', 'packages/datasources-logic/src'),
  },
  bundle: true, packages: 'external', platform: 'node', format: 'cjs', write: false,
}).outputFiles[0].text;
const sourceModule = { exports: {} };
new Function('require', 'module', 'exports', compiled)(require, sourceModule, sourceModule.exports);
const { WebSocketDataSource } = sourceModule.exports;

describe('WebSocket listener recovery', () => {
  beforeEach(() => {
    sockets.length = 0;
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  const subscribe = () => new WebSocketDataSource({
    datasourceID: 'ds-ws', datasourceOptions: { endpoint: 'ws://localhost:8080/ws' },
  }).subscribe({}, jest.fn().mockResolvedValue(undefined));

  test('a dropped socket reconnects with bounded backoff while subscribed', async () => {
    const instance = new WebSocketDataSource({ datasourceID: 'ds-ws', datasourceOptions: { endpoint: 'ws://localhost:8080/ws' } });
    const handle = await instance.subscribe({}, jest.fn().mockResolvedValue(undefined));
    expect(sockets).toHaveLength(1);
    expect(instance.getConnectionState()).toBe('connecting');
    sockets[0].emit('close');
    expect(instance.getConnectionState()).toBe('reconnecting');
    jest.advanceTimersByTime(1000);
    expect(sockets).toHaveLength(2);
    sockets[1].emit('close');
    jest.advanceTimersByTime(2000);
    expect(sockets).toHaveLength(3);
    expect(handle.ws).toBe(sockets[2]);
    sockets[2].readyState = 1;
    expect(instance.getConnectionState()).toBe('open');
  });

  test('unsubscribe stops the reconnect loop and terminates the live socket', async () => {
    const instance = new WebSocketDataSource({ datasourceID: 'ds-ws', datasourceOptions: { endpoint: 'ws://x' } });
    const handle = await instance.subscribe({}, jest.fn().mockResolvedValue(undefined));
    sockets[0].emit('close');
    await instance.unsubscribe(handle);
    jest.advanceTimersByTime(60000);
    expect(sockets).toHaveLength(1);
    expect(sockets[0].terminate).toHaveBeenCalled();
    expect(instance.getConnectionState()).toBe('closed');
  });

  test('declares plugin-owned recovery so the engine does not run a duplicate loop', async () => {
    const instance = new WebSocketDataSource({ datasourceID: 'ds-ws', datasourceOptions: { endpoint: 'ws://x' } });
    expect(instance.recoveryMode).toBe('plugin');
    expect(await instance.healthCheck()).toBe(true);
  });

  test('delivers parsed messages from a reconnected socket', async () => {
    const onEvent = jest.fn().mockResolvedValue(undefined);
    const instance = new WebSocketDataSource({ datasourceID: 'ds-ws', datasourceOptions: { endpoint: 'ws://x' } });
    await instance.subscribe({}, onEvent);
    sockets[0].emit('close');
    jest.advanceTimersByTime(1000);
    sockets[1].emit('message', Buffer.from(JSON.stringify({ fresh: true })));
    expect(onEvent).toHaveBeenCalledWith({ payload: { fresh: true } });
  });
});
