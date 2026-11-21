/**
 * RabbitMQ query-side publish accepted `exchange`/`routingKey` in the query
 * editor but threw "dataQueryOptions is not defined" at execution time.
 */
const mockChannel = {
  on: jest.fn(),
  assertExchange: jest.fn().mockResolvedValue(true),
  publish: jest.fn(),
  assertQueue: jest.fn().mockResolvedValue({ queue: 'q' }),
  sendToQueue: jest.fn(),
  close: jest.fn().mockResolvedValue(true),
};
const mockConnection = {
  on: jest.fn(),
  createChannel: jest.fn().mockResolvedValue(mockChannel),
  close: jest.fn().mockResolvedValue(true),
};
jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue(mockConnection),
}), { virtual: true });

jest.resetModules();
const { dataSourceRegistry } = require('@jet-admin/datasources-logic');

describe('RabbitMQ publish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChannel.assertExchange.mockResolvedValue(true);
    mockChannel.assertQueue.mockResolvedValue({ queue: 'q' });
    mockConnection.createChannel.mockResolvedValue(mockChannel);
  });

  test('publishes to an exchange with the configured type and routing key', async () => {
    const RabbitMQDataSource = dataSourceRegistry.getDataSource('rabbitmq');
    const instance = new RabbitMQDataSource({
      datasourceID: 'ds-rabbit',
      datasourceOptions: { connectionOption: 'connectionUrl', connectionUrl: 'amqp://qa:pass@rabbit:5672' },
    });

    const result = await instance.execute({
      operation: 'publish',
      exchange: 'fix_exchange',
      exchangeType: 'topic',
      routingKey: 'fix.deliver',
      queue: 'fix_delivery_q',
      message: { seq: 1 },
    });

    expect(mockChannel.assertExchange).toHaveBeenCalledWith('fix_exchange', 'topic', { durable: true });
    expect(mockChannel.publish).toHaveBeenCalledWith(
      'fix_exchange',
      'fix.deliver',
      expect.any(Buffer),
      expect.objectContaining({ contentType: 'application/json' })
    );
    expect(result).toMatchObject({ success: true, exchange: 'fix_exchange', routingKey: 'fix.deliver' });
  });

  test('publishes directly to a queue when no exchange is configured', async () => {
    const RabbitMQDataSource = dataSourceRegistry.getDataSource('rabbitmq');
    const instance = new RabbitMQDataSource({
      datasourceID: 'ds-rabbit',
      datasourceOptions: { connectionOption: 'connectionUrl', connectionUrl: 'amqp://qa:pass@rabbit:5672' },
    });

    await instance.execute({ operation: 'publish', queue: 'fix_queue', message: { ok: true } });
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('fix_queue', expect.any(Object));
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith('fix_queue', expect.any(Buffer), expect.any(Object));
  });
});
