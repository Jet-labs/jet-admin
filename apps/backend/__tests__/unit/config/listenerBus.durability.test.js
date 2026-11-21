const { ensureConsumerGroup, moveToDlq } = require('../../../config/listenerBus.config');

describe('listener bus durable acceptance', () => {
  test('new consumer group consumes existing backlog', async () => {
    const client = { xgroup: jest.fn().mockResolvedValue('OK') };
    await ensureConsumerGroup(client);
    expect(client.xgroup.mock.calls[0].slice(-2)).toEqual(['0', 'MKSTREAM']);
  });
  test('DLQ outage propagates so caller cannot ACK the source', async () => {
    const client = { xadd: jest.fn().mockRejectedValue(new Error('disk full')) };
    await expect(moveToDlq(client, { eventID: 'e' }, new Error('poison'))).rejects.toThrow('disk full');
  });
  test('resolves only after DLQ append succeeds', async () => {
    const client = { xadd: jest.fn().mockResolvedValue('1-0') };
    await moveToDlq(client, { eventID: 'e' }, new Error('poison'));
    expect(JSON.parse(client.xadd.mock.calls[0].at(-1))).toMatchObject({ eventID: 'e', error: 'poison' });
  });
});
