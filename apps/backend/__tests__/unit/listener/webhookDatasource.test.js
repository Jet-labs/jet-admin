/**
 * Webhook Datasource Unit Tests
 *
 * The standalone webhookReceiverServer was refactored into the shared
 * WebhookRouter + WebhookDataSource. These tests cover route registration,
 * method validation, auth enforcement, custom responses, and event delivery.
 */

const mockPgClient = {
  connect: jest.fn().mockResolvedValue(true),
  query: jest.fn().mockResolvedValue({ rows: [] }),
  on: jest.fn(),
  end: jest.fn().mockResolvedValue(true),
};
jest.mock('pg', () => ({
  Client: jest.fn().mockImplementation(() => mockPgClient),
}), { virtual: true });

jest.mock('@google-cloud/firestore', () => ({
  Firestore: jest.fn().mockImplementation(() => ({})),
}), { virtual: true });

jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({})),
  ObjectId: jest.fn(),
}), { virtual: true });

jest.mock('graphql-ws', () => ({
  createClient: jest.fn(),
}), { virtual: true });

jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue({}),
}), { virtual: true });

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({})),
  logLevel: { WARN: 1 },
}), { virtual: true });

jest.mock('ioredis', () => {
  const RedisMock = jest.fn().mockImplementation(() => ({}));
  RedisMock.Cluster = jest.fn().mockImplementation(() => ({}));
  return RedisMock;
}, { virtual: true });

jest.mock('mqtt', () => ({
  connect: jest.fn().mockReturnValue({}),
}), { virtual: true });

jest.mock('ws', () => jest.fn().mockImplementation(() => ({})), { virtual: true });

jest.mock('eventsource', () => jest.fn().mockImplementation(() => ({})), { virtual: true });

jest.mock('dgram', () => ({
  createSocket: jest.fn().mockReturnValue({}),
}), { virtual: true });

jest.mock('nats', () => ({
  connect: jest.fn().mockResolvedValue({}),
  StringCodec: jest.fn().mockReturnValue({ decode: (buf) => buf.toString() }),
}), { virtual: true });

const { dataSourceRegistry, webhookRouter } = require('@jet-admin/datasources-logic');

describe('Webhook Datasource (shared WebhookRouter)', () => {
  const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  });

  const makeReq = (overrides = {}) => ({
    method: 'POST',
    headers: {},
    query: {},
    body: { event: 'payment_success', amount: 500 },
    originalUrl: '/webhooks/v1/inbound/tenant-123/stripe-event',
    params: {},
    ...overrides,
  });

  afterEach(async () => {
    // Drain any pending onEvent microtasks and clear registered routes
    await Promise.resolve();
    webhookRouter._handlers.clear();
    jest.clearAllMocks();
  });

  it('registers tenant+pathSuffix and fallback id routes on subscribe', async () => {
    const WebhookDataSource = dataSourceRegistry.getDataSource('webhook');
    const instance = new WebhookDataSource({ datasourceID: 'ds-stripe' });

    const handle = await instance.subscribe(
      { listenerID: 'lst-stripe-1', tenantID: 'tenant-123', pathSuffix: '/stripe-event' },
      jest.fn()
    );

    expect(handle).toEqual({
      routeKeys: ['tenant:tenant-123:stripe-event', 'id:lst-stripe-1'],
    });
    expect(webhookRouter._handlers.has('tenant:tenant-123:stripe-event')).toBe(true);
    expect(webhookRouter._handlers.has('id:lst-stripe-1')).toBe(true);

    await instance.unsubscribe(handle);
    expect(webhookRouter._handlers.size).toBe(0);
  });

  it('delivers events and honors custom response status/body via the tenant route', async () => {
    const WebhookDataSource = dataSourceRegistry.getDataSource('webhook');
    const instance = new WebhookDataSource({
      datasourceID: 'ds-stripe',
      datasourceOptions: { authType: 'none', allowedMethods: 'POST' },
    });
    const onEvent = jest.fn().mockResolvedValue(undefined);
    await instance.subscribe(
      {
        listenerID: 'lst-stripe-999',
        tenantID: 'tenant-123',
        pathSuffix: 'stripe-event',
        responseStatusCode: 201,
        responseBody: '{"status":"received"}',
      },
      onEvent
    );

    // Simulate the express layer resolving the route key and invoking the handler
    const handler = webhookRouter._handlers.get('tenant:tenant-123:stripe-event');
    const req = makeReq();
    const res = makeRes();
    handler(req, res);

    await Promise.resolve();

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ status: 'received' });
    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        method: 'POST',
        body: { event: 'payment_success', amount: 500 },
        url: '/webhooks/v1/inbound/tenant-123/stripe-event',
        timestamp: expect.any(String),
      })
    );
  });

  it('rejects disallowed HTTP methods with 405 without firing onEvent', async () => {
    const WebhookDataSource = dataSourceRegistry.getDataSource('webhook');
    const instance = new WebhookDataSource({
      datasourceID: 'ds-methods',
      datasourceOptions: { authType: 'none', allowedMethods: 'POST' },
    });
    const onEvent = jest.fn().mockResolvedValue(undefined);
    await instance.subscribe({ listenerID: 'lst-methods' }, onEvent);

    const handler = webhookRouter._handlers.get('id:lst-methods');
    const res = makeRes();
    handler(makeReq({ method: 'GET' }), res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(onEvent).not.toHaveBeenCalled();
  });

  it('enforces Basic Auth on the registered handler', async () => {
    const WebhookDataSource = dataSourceRegistry.getDataSource('webhook');
    const instance = new WebhookDataSource({
      datasourceID: 'ds-basic-auth',
      datasourceOptions: {
        authType: 'basic',
        username: 'webhookuser',
        password: 'supersecretpassword',
        allowedMethods: 'POST',
      },
    });
    const onEvent = jest.fn().mockResolvedValue(undefined);
    await instance.subscribe({ listenerID: 'lst-basic-auth' }, onEvent);

    const handler = webhookRouter._handlers.get('id:lst-basic-auth');

    // Missing Authorization header entirely → 401 + challenge header
    const noAuthRes = makeRes();
    handler(makeReq(), noAuthRes);
    expect(noAuthRes.status).toHaveBeenCalledWith(401);
    expect(noAuthRes.setHeader).toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Basic realm="Webhook"'
    );
    expect(onEvent).not.toHaveBeenCalled();

    // Wrong credentials → 401 without challenge header
    const badRes = makeRes();
    handler(
      makeReq({
        headers: {
          authorization:
            'Basic ' + Buffer.from('webhookuser:wrongpassword').toString('base64'),
        },
      }),
      badRes
    );
    expect(badRes.status).toHaveBeenCalledWith(401);
    expect(badRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid Basic Auth username or password.',
    });
    expect(onEvent).not.toHaveBeenCalled();

    // Valid credentials → default success body
    const goodRes = makeRes();
    handler(
      makeReq({
        headers: {
          authorization:
            'Basic ' + Buffer.from('webhookuser:supersecretpassword').toString('base64'),
        },
      }),
      goodRes
    );
    await Promise.resolve();

    expect(goodRes.status).toHaveBeenCalledWith(200);
    expect(goodRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  it('sends non-JSON string responseBody as plain text', async () => {
    const WebhookDataSource = dataSourceRegistry.getDataSource('webhook');
    const instance = new WebhookDataSource({ datasourceID: 'ds-text' });
    await instance.subscribe(
      { listenerID: 'lst-text', responseStatusCode: 202, responseBody: 'OK - accepted' },
      jest.fn().mockResolvedValue(undefined)
    );

    const handler = webhookRouter._handlers.get('id:lst-text');
    const res = makeRes();
    handler(makeReq(), res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledWith('OK - accepted');
  });
});
