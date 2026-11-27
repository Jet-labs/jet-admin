const { createHmac, timingSafeEqual } = require('crypto');
const { applicationError } = require('./application.errors');
const { listenerDefinitionHash } = require('../listener/listenerDefinition');

function cursorKey() {
  const secret = process.env.APPLICATION_CURSOR_SECRET || process.env.VAULT_ENCRYPTION_KEY;
  if (!secret) throw applicationError('APPLICATION_CURSOR_UNAVAILABLE', 'Configure a shared application cursor secret before using listener observation.', 503);
  return createHmac('sha256', secret).update('jet-admin:application-listener-cursor:v1').digest();
}
function encodeCursor(scope, seqNo) {
  const body = Buffer.from(JSON.stringify({ scope, seqNo: String(seqNo) })).toString('base64url');
  return `${body}.${createHmac('sha256', cursorKey()).update(body).digest('base64url')}`;
}
function decodeCursor(token, scope) {
  try {
    const [body, signature, extra] = token.split('.');
    const expected = createHmac('sha256', cursorKey()).update(body).digest();
    const actual = Buffer.from(signature || '', 'base64url');
    if (extra || actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error();
    const value = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (value.scope !== scope || !/^(0|[1-9][0-9]{0,18})$/.test(value.seqNo) || BigInt(value.seqNo) > 9223372036854775807n) throw new Error();
    return BigInt(value.seqNo);
  } catch (error) {
    if (error.statusCode === 503) throw error;
    throw applicationError('APPLICATION_CURSOR_INVALID', 'The listener cursor is invalid for this subscription.', 400);
  }
}

async function readApplicationListenerEvents({ db, ctx, applicationID, environment, release, pageAssetKey, alias, source, cursor }) {
  const current = await db.tblListeners.findFirst({ where: { listenerID: source.listenerID, tenantID: ctx.tenantID }, include: { tblListenerActions: { where: { isEnabled: true }, orderBy: [{ orderIndex: 'asc' }, { actionID: 'asc' }] } } });
  if (!current || current.status !== 'active') throw applicationError('APPLICATION_LISTENER_UNAVAILABLE', 'The listener is unavailable or inactive.', 409);
  if (listenerDefinitionHash(current) !== source.definitionHash) throw applicationError('APPLICATION_LISTENER_CHANGED', 'The listener definition changed. Publish a new release before observing it.', 409);
  const scope = [ctx.tenantID, applicationID, environment, release.releaseID, pageAssetKey, alias, ctx.caller.type, ctx.caller.id].join(':');
  const after = cursor ? decodeCursor(cursor, scope) : null;
  const where = { tenantID: ctx.tenantID, listenerID: source.listenerID, bufferName: source.bufferName,
    eventMeta: { path: ['applicationDefinitionHash'], equals: source.definitionHash } };
  if (after !== null && after !== 0n) {
    const anchor = await db.tblListenerEvents.findFirst({ where: { ...where, seqNo: after }, select: { eventID: true } });
    if (!anchor) throw applicationError('APPLICATION_CURSOR_EXPIRED', 'Listener history for this cursor has expired. Reopen the subscription to resynchronize.', 410);
  }
  // Initial observation returns only the latest retained 100 verified events,
  // then advances strictly by cursor. Cursor reads are bounded to 100 and
  // ordered ascending so the client can observe without replaying the buffer.
  const initial = after === null;
  const events = await db.tblListenerEvents.findMany({
    where: { ...where, ...(after !== null ? { seqNo: { gt: after } } : {}) },
    orderBy: { seqNo: initial ? 'desc' : 'asc' }, take: 100,
    select: { eventID: true, seqNo: true, eventData: true, receivedAt: true },
  });
  if (initial) events.reverse();
  const next = events.length ? events[events.length - 1].seqNo : after ?? 0n;
  const projected = events.map(event => ({ eventID: event.eventID, sequence: event.seqNo.toString(), data: event.eventData, receivedAt: event.receivedAt, mode: source.mode, limit: source.limit }));
  const result = { events: projected, cursor: encodeCursor(scope, next), hasMore: !initial && events.length === 100 };
  if (Buffer.byteLength(JSON.stringify(result)) > 2 * 1024 * 1024) throw applicationError('APPLICATION_RESULT_TOO_LARGE', 'Listener observations exceed the runtime result limit.', 413);
  return result;
}

module.exports = { readApplicationListenerEvents, encodeCursor, decodeCursor };
