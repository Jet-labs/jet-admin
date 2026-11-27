const { readApplicationListenerEvents, decodeCursor } = require('../../../modules/application/application.listenerRuntime');
const { listenerDefinitionHash } = require('../../../modules/listener/listenerDefinition');
const listener = { listenerID: 'l', tenantID: 't', datasourceID: 'd', listenerType: 'webhook', listenerConfig: {}, status: 'active', tblListenerActions: [] };
const source = { listenerID: 'l', bufferName: 'default', definitionHash: listenerDefinitionHash(listener), mode: 'append', limit: 20 };
const params = { ctx: { tenantID: 't', caller: { type: 'user', id: 'u' } }, applicationID: 'a', environment: 'production', release: { releaseID: 'r' }, pageAssetKey: 'p', alias: 'changes', source };
function fixture() {
  return { tblListeners: { findFirst: jest.fn().mockResolvedValue(listener) }, tblListenerEvents: { findFirst: jest.fn().mockResolvedValue({ eventID: 'e' }), findMany: jest.fn().mockResolvedValue([{ eventID: 'e', seqNo: 9007199254740993n, eventData: { id: 1 }, receivedAt: 'now' }]) } };
}
describe('Release-scoped buffered listeners', () => {
  beforeEach(() => { process.env.APPLICATION_CURSOR_SECRET = 'test-only-application-cursor-secret'; });
  afterAll(() => { delete process.env.APPLICATION_CURSOR_SECRET; });
  it('returns bounded ordered verified data and lossless sequence cursors', async () => {
    const db = fixture(); const result = await readApplicationListenerEvents({ ...params, db });
    expect(result.events).toEqual([{ eventID: 'e', sequence: '9007199254740993', data: { id: 1 }, receivedAt: 'now', mode: 'append', limit: 20 }]);
    expect(db.tblListenerEvents.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tenantID: 't', listenerID: 'l', bufferName: 'default', eventMeta: { path: ['applicationDefinitionHash'], equals: source.definitionHash } }), take: 100, orderBy: { seqNo: 'desc' } }));
    expect(decodeCursor(result.cursor, 't:a:production:r:p:changes:user:u')).toBe(9007199254740993n);
    await readApplicationListenerEvents({ ...params, db, cursor: result.cursor });
    expect(db.tblListenerEvents.findMany.mock.calls[1][0]).toEqual(expect.objectContaining({ where: expect.objectContaining({ seqNo: { gt: 9007199254740993n } }), orderBy: { seqNo: 'asc' } }));
  });
  it.each([{ alias: 'other' }, { release: { releaseID: 'other' } }, { ctx: { tenantID: 't', caller: { type: 'user', id: 'other' } } }])('rejects cursors from another scope: %j', async changed => {
    const db = fixture(); const { cursor } = await readApplicationListenerEvents({ ...params, db });
    db.tblListenerEvents.findMany.mockClear();
    await expect(readApplicationListenerEvents({ ...params, ...changed, db, cursor })).rejects.toMatchObject({ code: 'APPLICATION_CURSOR_INVALID' });
    expect(db.tblListenerEvents.findMany).not.toHaveBeenCalled();
  });
  it('rejects tampering, expired history, source changes and inactive listeners', async () => {
    const db = fixture(); const { cursor } = await readApplicationListenerEvents({ ...params, db });
    await expect(readApplicationListenerEvents({ ...params, db, cursor: `${cursor}x` })).rejects.toMatchObject({ code: 'APPLICATION_CURSOR_INVALID' });
    db.tblListenerEvents.findFirst.mockResolvedValue(null);
    await expect(readApplicationListenerEvents({ ...params, db, cursor })).rejects.toMatchObject({ code: 'APPLICATION_CURSOR_EXPIRED', statusCode: 410 });
    db.tblListeners.findFirst.mockResolvedValue({ ...listener, listenerConfig: { changed: true } });
    await expect(readApplicationListenerEvents({ ...params, db })).rejects.toMatchObject({ code: 'APPLICATION_LISTENER_CHANGED' });
    db.tblListeners.findFirst.mockResolvedValue({ ...listener, status: 'inactive' });
    await expect(readApplicationListenerEvents({ ...params, db })).rejects.toMatchObject({ code: 'APPLICATION_LISTENER_UNAVAILABLE' });
  });
});
