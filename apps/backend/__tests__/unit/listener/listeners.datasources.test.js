/**
 * Listener Datasources Unit Tests
 * Tests subscribe() and unsubscribe() methods across ALL 13 listener datasource types.
 */

// Mock third-party libraries used by datasources with { virtual: true } to support isolated workspace execution
const mockPgClient = {
  connect: jest.fn().mockResolvedValue(true),
  query: jest.fn().mockResolvedValue({ rows: [] }),
  on: jest.fn(),
  end: jest.fn().mockResolvedValue(true),
};
jest.mock('pg', () => ({
  Client: jest.fn().mockImplementation(() => mockPgClient),
}), { virtual: true });

const mockDoc = { id: 'doc-1', data: () => ({ name: 'Test Doc' }), exists: true };
const mockDocChanges = [
  { type: 'added', doc: mockDoc },
  { type: 'modified', doc: mockDoc },
];
const mockSnapshot = {
  exists: true,
  data: () => ({ name: 'Test Doc' }),
  docChanges: () => mockDocChanges,
};

const mockFirestoreUnsubscribe = jest.fn();
const mockFirestoreDoc = {
  onSnapshot: jest.fn((onNext) => {
    onNext(mockSnapshot);
    return mockFirestoreUnsubscribe;
  }),
};
const mockFirestoreCollection = {
  doc: jest.fn().mockReturnValue(mockFirestoreDoc),
  onSnapshot: jest.fn((onNext) => {
    onNext(mockSnapshot);
    return mockFirestoreUnsubscribe;
  }),
};
const mockFirestoreDb = {
  collection: jest.fn().mockReturnValue(mockFirestoreCollection),
};
jest.mock('@google-cloud/firestore', () => ({
  Firestore: jest.fn().mockImplementation(() => mockFirestoreDb),
}), { virtual: true });

const mockChangeStream = {
  on: jest.fn((event, callback) => {
    if (event === 'change') {
      callback({
        operationType: 'insert',
        ns: { coll: 'users' },
        documentKey: { _id: '507f1f77bcf86cd799439011' },
        fullDocument: { name: 'Alice' },
      });
    }
  }),
  close: jest.fn().mockResolvedValue(true),
};
const mockMongoCollection = {
  watch: jest.fn().mockReturnValue(mockChangeStream),
};
const mockMongoDb = {
  collection: jest.fn().mockReturnValue(mockMongoCollection),
  watch: jest.fn().mockReturnValue(mockChangeStream),
};
const mockMongoClient = {
  connect: jest.fn().mockResolvedValue(true),
  db: jest.fn().mockReturnValue(mockMongoDb),
  close: jest.fn().mockResolvedValue(true),
};
jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => mockMongoClient),
  ObjectId: jest.fn(),
}), { virtual: true });

const mockGraphQLDispose = jest.fn().mockResolvedValue(true);
const mockGraphQLUnsubscribe = jest.fn();
const mockGraphQLClient = {
  subscribe: jest.fn((request, sink) => {
    sink.next({ data: { userCreated: { id: 'usr-1' } } });
    return mockGraphQLUnsubscribe;
  }),
  dispose: mockGraphQLDispose,
};
jest.mock('graphql-ws', () => ({
  createClient: jest.fn().mockImplementation(() => mockGraphQLClient),
}), { virtual: true });

const mockAmqpChannel = {
  on: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(true),
  assertExchange: jest.fn().mockResolvedValue(true),
  assertQueue: jest.fn().mockResolvedValue({ queue: 'test-queue' }),
  bindQueue: jest.fn().mockResolvedValue(true),
  consume: jest.fn().mockResolvedValue({ consumerTag: 'tag-123' }),
  ack: jest.fn(),
  cancel: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true),
};
const mockAmqpConnection = {
  on: jest.fn(),
  createChannel: jest.fn().mockResolvedValue(mockAmqpChannel),
  close: jest.fn().mockResolvedValue(true),
};
jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue(mockAmqpConnection),
}), { virtual: true });

const mockKafkaConsumer = {
  connect: jest.fn().mockResolvedValue(true),
  subscribe: jest.fn().mockResolvedValue(true),
  run: jest.fn().mockImplementation(async ({ eachMessage }) => {
    await eachMessage({
      topic: 'events',
      partition: 0,
      message: {
        key: Buffer.from('key1'),
        value: Buffer.from(JSON.stringify({ event: 'user_login' })),
        timestamp: '1600000000',
      },
    });
  }),
  disconnect: jest.fn().mockResolvedValue(true),
};
const mockKafkaClient = {
  consumer: jest.fn().mockReturnValue(mockKafkaConsumer),
};
jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => mockKafkaClient),
  logLevel: { WARN: 1 },
}), { virtual: true });

const mockRedisClient = {
  subscribe: jest.fn().mockResolvedValue(true),
  on: jest.fn((event, callback) => {
    if (event === 'message') {
      callback('channel1', JSON.stringify({ message: 'hello redis' }));
    }
  }),
  unsubscribe: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn(),
  xgroup: jest.fn().mockResolvedValue('OK'),
  xreadgroup: jest.fn().mockResolvedValue([
    ['stream1', [['id-1', ['data', JSON.stringify({ item: 1 })]]]],
  ]),
  xack: jest.fn().mockResolvedValue(1),
};
jest.mock('ioredis', () => {
  const RedisMock = jest.fn().mockImplementation(() => mockRedisClient);
  RedisMock.Cluster = jest.fn().mockImplementation(() => mockRedisClient);
  return RedisMock;
}, { virtual: true });

const mockMqttClient = {
  on: jest.fn((event, callback) => {
    if (event === 'connect') {
      callback();
    }
  }),
  subscribe: jest.fn((topics, opts, callback) => callback(null)),
  unsubscribe: jest.fn(),
  end: jest.fn(),
};
jest.mock('mqtt', () => ({
  connect: jest.fn().mockReturnValue(mockMqttClient),
}), { virtual: true });

const mockWsSocket = {
  on: jest.fn((event, callback) => {
    if (event === 'message') {
      callback(Buffer.from(JSON.stringify({ type: 'ping' })));
    }
  }),
  terminate: jest.fn(),
};
jest.mock('ws', () => jest.fn().mockImplementation(() => mockWsSocket), { virtual: true });

const mockEventSource = {
  onmessage: null,
  addEventListener: jest.fn((event, callback) => {
    callback({ data: JSON.stringify({ custom: 'event' }) });
  }),
  close: jest.fn(),
};
jest.mock('eventsource', () => jest.fn().mockImplementation(() => mockEventSource), { virtual: true });

const mockDgramSocket = {
  on: jest.fn((event, callback) => {
    if (event === 'message') {
      callback(Buffer.from('Syslog test message'), { address: '127.0.0.1', port: 514 });
    }
  }),
  bind: jest.fn((port, address, callback) => callback()),
  close: jest.fn(),
};
jest.mock('dgram', () => ({
  createSocket: jest.fn().mockReturnValue(mockDgramSocket),
}), { virtual: true });

const mockNatsSubscription = {
  [Symbol.asyncIterator]: jest.fn().mockImplementation(() => {
    const messages = [
      { subject: 'orders.new', data: Buffer.from(JSON.stringify({ id: 'ord-1' })) },
    ];
    let index = 0;
    return {
      next: async () => {
        if (index < messages.length) {
          return { value: messages[index++], done: false };
        }
        return { done: true };
      },
    };
  }),
  unsubscribe: jest.fn(),
};
const mockNatsConnection = {
  subscribe: jest.fn().mockReturnValue(mockNatsSubscription),
  close: jest.fn().mockResolvedValue(true),
};
jest.mock('nats', () => ({
  connect: jest.fn().mockResolvedValue(mockNatsConnection),
  StringCodec: jest.fn().mockReturnValue({
    decode: (buf) => buf.toString(),
  }),
}), { virtual: true });

// Import registered dataSources from `@jet-admin/datasources-logic`
const { dataSourceRegistry } = require('@jet-admin/datasources-logic');

describe('Listener Datasources (All 13 Listener Types)', () => {

  // 1. PostgreSQL Listener
  describe('PostgreSQL Listener', () => {
    it('should subscribe to channels and listen for notifications', async () => {
      const PostgreSQLDataSource = dataSourceRegistry.getDataSource('postgresql');
      const instance = new PostgreSQLDataSource({ datasourceID: 'ds-pg', datasourceOptions: { connectionString: 'postgres://localhost:5432/db' } });

      const onEvent = jest.fn();
      const handle = await instance.subscribe({ channels: 'channel1, channel2' }, onEvent);

      expect(mockPgClient.connect).toHaveBeenCalled();
      expect(mockPgClient.query).toHaveBeenCalledWith('LISTEN "channel1"');
      expect(mockPgClient.query).toHaveBeenCalledWith('LISTEN "channel2"');
      expect(handle.client).toBe(mockPgClient);

      // Simulate notification
      const notificationCallback = mockPgClient.on.mock.calls.find((call) => call[0] === 'notification')[1];
      notificationCallback({ channel: 'channel1', payload: '{"msg":"test"}' });

      expect(onEvent).toHaveBeenCalledWith({
        channel: 'channel1',
        payload: { msg: 'test' },
      });

      // Unsubscribe
      await instance.unsubscribe(handle);
      expect(mockPgClient.query).toHaveBeenCalledWith('UNLISTEN "channel1"');
      expect(mockPgClient.query).toHaveBeenCalledWith('UNLISTEN "channel2"');
      expect(mockPgClient.end).toHaveBeenCalled();
    });

    it('should throw error when no channels specified', async () => {
      const PostgreSQLDataSource = dataSourceRegistry.getDataSource('postgresql');
      const instance = new PostgreSQLDataSource({ datasourceID: 'ds-pg' });
      await expect(instance.subscribe({ channels: '' }, jest.fn())).rejects.toThrow('No channels specified');
    });
  });

  // 2. Firestore Listener
  describe('Firestore Listener', () => {
    it('should subscribe to document snapshots and collection changes', async () => {
      const FirestoreDataSource = dataSourceRegistry.getDataSource('firestore');
      const instance = new FirestoreDataSource({ datasourceID: 'ds-fs', datasourceOptions: { projectId: 'test-project' } });

      const onEventDoc = jest.fn();
      const handleDoc = await instance.subscribe({ collection: 'users', documentId: 'doc-1' }, onEventDoc);
      expect(mockFirestoreDb.collection).toHaveBeenCalledWith('users');
      expect(mockFirestoreCollection.doc).toHaveBeenCalledWith('doc-1');
      expect(onEventDoc).toHaveBeenCalledWith({
        collection: 'users',
        documentId: 'doc-1',
        exists: true,
        payload: { name: 'Test Doc' },
      });

      await instance.unsubscribe(handleDoc);
      expect(mockFirestoreUnsubscribe).toHaveBeenCalled();
    });

    it('should throw error when collection is missing', async () => {
      const FirestoreDataSource = dataSourceRegistry.getDataSource('firestore');
      const instance = new FirestoreDataSource({ datasourceID: 'ds-fs', datasourceOptions: { projectId: 'test-project' } });
      await expect(instance.subscribe({}, jest.fn())).rejects.toThrow('Collection is required');
    });
  });

  // 3. MongoDB Listener
  describe('MongoDB Listener', () => {
    it('should subscribe to Change Streams with pipeline filtering', async () => {
      const MongoDBDataSource = dataSourceRegistry.getDataSource('mongodb');
      const instance = new MongoDBDataSource({ datasourceID: 'ds-mongo', datasourceOptions: { connectionString: 'mongodb://localhost:27017/testdb' } });

      const onEvent = jest.fn();
      const handle = await instance.subscribe({ collection: 'users', operationTypes: ['insert'] }, onEvent);

      expect(mockMongoClient.connect).toHaveBeenCalled();
      expect(mockMongoDb.collection).toHaveBeenCalledWith('users');
      expect(mockMongoCollection.watch).toHaveBeenCalledWith([{ $match: { operationType: { $in: ['insert'] } } }]);

      expect(onEvent).toHaveBeenCalledWith({
        operationType: 'insert',
        collection: 'users',
        documentKey: { _id: '507f1f77bcf86cd799439011' },
        fullDocument: { name: 'Alice' },
        updateDescription: undefined,
        payload: expect.any(Object),
      });

      await instance.unsubscribe(handle);
      expect(mockChangeStream.close).toHaveBeenCalled();
      expect(mockMongoClient.close).toHaveBeenCalled();
    });
  });

  // 4. GraphQL Listener
  describe('GraphQL Listener', () => {
    it('should subscribe to GraphQL WebSocket subscriptions', async () => {
      const GraphQLDataSource = dataSourceRegistry.getDataSource('graphql');
      const instance = new GraphQLDataSource({
        datasourceID: 'ds-gql',
        datasourceOptions: { endpoint: 'http://localhost:4000/graphql', authType: 'bearer', bearerToken: 'secret-token' },
      });

      const onEvent = jest.fn();
      const handle = await instance.subscribe({ subscription: 'subscription { userCreated { id } }' }, onEvent);

      expect(mockGraphQLClient.subscribe).toHaveBeenCalledWith(
        { query: 'subscription { userCreated { id } }', variables: {} },
        expect.any(Object)
      );

      expect(onEvent).toHaveBeenCalledWith({ payload: { userCreated: { id: 'usr-1' } } });

      await instance.unsubscribe(handle);
      expect(mockGraphQLUnsubscribe).toHaveBeenCalled();
      expect(mockGraphQLDispose).toHaveBeenCalled();
    });

    it('should throw error when subscription query is missing', async () => {
      const GraphQLDataSource = dataSourceRegistry.getDataSource('graphql');
      const instance = new GraphQLDataSource({ datasourceID: 'ds-gql', datasourceOptions: { endpoint: 'http://localhost:4000/graphql' } });
      await expect(instance.subscribe({}, jest.fn())).rejects.toThrow('GraphQL subscription query is required');
    });
  });

  // 5. RabbitMQ Listener
  describe('RabbitMQ Listener', () => {
    it('should assert exchange, bind queue, and consume messages', async () => {
      const RabbitMQDataSource = dataSourceRegistry.getDataSource('rabbitmq');
      const instance = new RabbitMQDataSource({ datasourceID: 'ds-rmq', datasourceOptions: { connectionUrl: 'amqp://localhost' } });

      const onEvent = jest.fn();
      const handle = await instance.subscribe({ exchange: 'amq.topic', routingKey: 'user.*' }, onEvent);

      expect(mockAmqpChannel.prefetch).toHaveBeenCalledWith(10);
      expect(mockAmqpChannel.assertExchange).toHaveBeenCalledWith('amq.topic', 'topic', { durable: true });
      expect(mockAmqpChannel.assertQueue).toHaveBeenCalled();
      expect(mockAmqpChannel.bindQueue).toHaveBeenCalled();
      expect(mockAmqpChannel.consume).toHaveBeenCalled();

      // Trigger consume callback
      const consumeCallback = mockAmqpChannel.consume.mock.calls[0][1];
      consumeCallback({
        fields: { routingKey: 'user.created' },
        content: Buffer.from(JSON.stringify({ name: 'Bob' })),
      });

      expect(onEvent).toHaveBeenCalledWith({
        exchange: 'amq.topic',
        routingKey: 'user.created',
        payload: { name: 'Bob' },
      });
      expect(mockAmqpChannel.ack).toHaveBeenCalled();

      await instance.unsubscribe(handle);
      expect(mockAmqpChannel.cancel).toHaveBeenCalledWith('tag-123');
      expect(mockAmqpChannel.close).toHaveBeenCalled();
      expect(mockAmqpConnection.close).toHaveBeenCalled();
    });

    it('should throw error when exchange is missing', async () => {
      const RabbitMQDataSource = dataSourceRegistry.getDataSource('rabbitmq');
      const instance = new RabbitMQDataSource({ datasourceID: 'ds-rmq', datasourceOptions: { connectionUrl: 'amqp://localhost' } });
      await expect(instance.subscribe({}, jest.fn())).rejects.toThrow('Exchange is required');
    });
  });

  // 6. Kafka Listener
  describe('Kafka Listener', () => {
    it('should connect consumer, subscribe to topic, and run message loop', async () => {
      const KafkaDataSource = dataSourceRegistry.getDataSource('kafka');
      const instance = new KafkaDataSource({ datasourceID: 'ds-kafka', datasourceOptions: { brokers: 'localhost:9092' } });

      const onEvent = jest.fn();
      const handle = await instance.subscribe({ topic: 'orders-topic', consumerGroup: 'test-group' }, onEvent);

      expect(mockKafkaConsumer.connect).toHaveBeenCalled();
      expect(mockKafkaConsumer.subscribe).toHaveBeenCalledWith({ topic: 'orders-topic', fromBeginning: false });
      expect(mockKafkaConsumer.run).toHaveBeenCalled();

      expect(onEvent).toHaveBeenCalledWith({
        topic: 'events',
        partition: 0,
        key: 'key1',
        payload: { event: 'user_login' },
        timestamp: '1600000000',
      });

      await instance.unsubscribe(handle);
      expect(mockKafkaConsumer.disconnect).toHaveBeenCalled();
    });
  });

  // 7. Redis Listener
  describe('Redis Listener', () => {
    it('should subscribe to PubSub channels and handle messages', async () => {
      const RedisDataSource = dataSourceRegistry.getDataSource('redis');
      const instance = new RedisDataSource({ datasourceID: 'ds-redis', datasourceOptions: { host: 'localhost', port: 6379 } });

      const onEvent = jest.fn();
      const handle = await instance.subscribe({ subscriptionType: 'pubsub', channels: 'ch1, ch2' }, onEvent);

      expect(mockRedisClient.subscribe).toHaveBeenCalledWith('ch1', 'ch2');
      expect(handle.type).toBe('pubsub');

      expect(onEvent).toHaveBeenCalledWith({
        channel: 'channel1',
        payload: { message: 'hello redis' },
      });

      await instance.unsubscribe(handle);
      expect(mockRedisClient.unsubscribe).toHaveBeenCalled();
    });

    it('should throw error when pubsub channels are missing', async () => {
      const RedisDataSource = dataSourceRegistry.getDataSource('redis');
      const instance = new RedisDataSource({ datasourceID: 'ds-redis', datasourceOptions: { host: 'localhost' } });
      await expect(instance.subscribe({ subscriptionType: 'pubsub', channels: '' }, jest.fn())).rejects.toThrow('No channels specified');
    });
  });

  // 8. Webhook Listener
  describe('Webhook Listener', () => {
    it('should return active handle on subscribe', async () => {
      const WebhookDataSource = dataSourceRegistry.getDataSource('webhook');
      const instance = new WebhookDataSource({ datasourceID: 'ds-wh' });

      await expect(instance.execute({})).rejects.toThrow('Webhook is a listener-only datasource.');
      const handle = await instance.subscribe({}, jest.fn());
      expect(handle).toEqual(
        expect.objectContaining({ type: 'webhook', active: true })
      );
    });
  });

  // 9. MQTT Listener
  describe('MQTT Listener', () => {
    it('should connect to broker and subscribe to topics', async () => {
      const MQTTDataSource = dataSourceRegistry.getDataSource('mqtt');
      const instance = new MQTTDataSource({ datasourceID: 'ds-mqtt', datasourceOptions: { host: 'broker.hivemq.com', port: 1883 } });

      const onEvent = jest.fn();
      const handle = await instance.subscribe({ topics: 'sensors/temperature, sensors/humidity', qos: 1 }, onEvent);

      expect(mockMqttClient.subscribe).toHaveBeenCalledWith(['sensors/temperature', 'sensors/humidity'], { qos: 1 }, expect.any(Function));
      expect(handle.topics).toEqual(['sensors/temperature', 'sensors/humidity']);

      // Simulate message
      const messageCallback = mockMqttClient.on.mock.calls.find((call) => call[0] === 'message')[1];
      messageCallback('sensors/temperature', Buffer.from(JSON.stringify({ temp: 22.5 })));

      expect(onEvent).toHaveBeenCalledWith({
        topic: 'sensors/temperature',
        payload: { temp: 22.5 },
      });

      await instance.unsubscribe(handle);
      expect(mockMqttClient.unsubscribe).toHaveBeenCalledWith(['sensors/temperature', 'sensors/humidity']);
      expect(mockMqttClient.end).toHaveBeenCalled();
    });

    it('should throw error when MQTT host or topics are missing', async () => {
      const MQTTDataSource = dataSourceRegistry.getDataSource('mqtt');
      const instanceNoHost = new MQTTDataSource({ datasourceID: 'ds-mqtt', datasourceOptions: {} });
      await expect(instanceNoHost.subscribe({ topics: 't1' }, jest.fn())).rejects.toThrow('MQTT host is required');

      const instanceNoTopics = new MQTTDataSource({ datasourceID: 'ds-mqtt', datasourceOptions: { host: 'localhost' } });
      await expect(instanceNoTopics.subscribe({ topics: '' }, jest.fn())).rejects.toThrow('MQTT topics are required');
    });
  });

  // 10. WebSocket Listener
  describe('WebSocket Listener', () => {
    it('should connect to WebSocket endpoint and parse messages', async () => {
      const WebSocketDataSource = dataSourceRegistry.getDataSource('websocket');
      const instance = new WebSocketDataSource({
        datasourceID: 'ds-ws',
        datasourceOptions: { endpoint: 'ws://localhost:8080/ws', headers: [{ key: 'X-Token', value: 'abc' }] },
      });

      const onEvent = jest.fn();
      const handle = await instance.subscribe({}, onEvent);

      expect(handle.ws).toBe(mockWsSocket);
      expect(onEvent).toHaveBeenCalledWith({ payload: { type: 'ping' } });

      await instance.unsubscribe(handle);
      expect(mockWsSocket.terminate).toHaveBeenCalled();
    });

    it('should throw error when endpoint is missing', async () => {
      const WebSocketDataSource = dataSourceRegistry.getDataSource('websocket');
      const instance = new WebSocketDataSource({ datasourceID: 'ds-ws', datasourceOptions: {} });
      await expect(instance.subscribe({}, jest.fn())).rejects.toThrow('WebSocket endpoint is required');
    });
  });

  // 11. SSE Listener
  describe('SSE Listener', () => {
    it('should connect to EventSource and listen to custom event names', async () => {
      const SSEDataSource = dataSourceRegistry.getDataSource('sse');
      const instance = new SSEDataSource({ datasourceID: 'ds-sse', datasourceOptions: { endpoint: 'http://localhost:3000/events' } });

      const onEvent = jest.fn();
      const handle = await instance.subscribe({ eventNames: 'update, alert' }, onEvent);

      expect(handle.es).toBe(mockEventSource);
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('update', expect.any(Function));
      expect(mockEventSource.addEventListener).toHaveBeenCalledWith('alert', expect.any(Function));

      expect(onEvent).toHaveBeenCalledWith({
        eventName: 'update',
        payload: { custom: 'event' },
      });

      await instance.unsubscribe(handle);
      expect(mockEventSource.close).toHaveBeenCalled();
    });

    it('should throw error when SSE endpoint is missing', async () => {
      const SSEDataSource = dataSourceRegistry.getDataSource('sse');
      const instance = new SSEDataSource({ datasourceID: 'ds-sse', datasourceOptions: {} });
      await expect(instance.subscribe({}, jest.fn())).rejects.toThrow('SSE endpoint is required');
    });
  });

  // 12. Syslog Listener
  describe('Syslog Listener', () => {
    it('should bind UDP server socket and receive syslog events', async () => {
      const SyslogDataSource = dataSourceRegistry.getDataSource('syslog');
      const instance = new SyslogDataSource({ datasourceID: 'ds-syslog', datasourceOptions: { port: 514, address: '0.0.0.0' } });

      const onEvent = jest.fn();
      const handle = await instance.subscribe({}, onEvent);

      expect(mockDgramSocket.bind).toHaveBeenCalledWith(514, '0.0.0.0', expect.any(Function));
      expect(onEvent).toHaveBeenCalledWith({
        source: '127.0.0.1:514',
        payload: 'Syslog test message',
      });

      await instance.unsubscribe(handle);
      expect(mockDgramSocket.close).toHaveBeenCalled();
    });
  });

  // 13. NATS Listener
  describe('NATS Listener', () => {
    it('should connect to NATS server and iterate over subject messages', async () => {
      const NatsDataSource = dataSourceRegistry.getDataSource('nats');
      const instance = new NatsDataSource({ datasourceID: 'ds-nats', datasourceOptions: { servers: 'nats://localhost:4222' } });

      const onEvent = jest.fn();
      const handle = await instance.subscribe({ subject: 'orders.*', queue: 'workers' }, onEvent);

      expect(mockNatsConnection.subscribe).toHaveBeenCalledWith('orders.*', { queue: 'workers' });

      // Allow async iterator loop to run
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(onEvent).toHaveBeenCalledWith({
        subject: 'orders.new',
        payload: { id: 'ord-1' },
      });

      await instance.unsubscribe(handle);
      expect(mockNatsSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockNatsConnection.close).toHaveBeenCalled();
    });

    it('should throw error when NATS servers are missing', async () => {
      const NatsDataSource = dataSourceRegistry.getDataSource('nats');
      const instance = new NatsDataSource({ datasourceID: 'ds-nats', datasourceOptions: {} });
      await expect(instance.subscribe({}, jest.fn())).rejects.toThrow('NATS servers are required');
    });
  });

});
