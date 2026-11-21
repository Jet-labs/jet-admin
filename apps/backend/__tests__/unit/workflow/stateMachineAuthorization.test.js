jest.mock('../../../config/prisma.config', () => ({ prisma: {
  tblWorkflowInstances: { findFirst: jest.fn() },
  tblWorkflowDataCollectionRequests: { findFirst: jest.fn() },
  tblUsersTenantsRelationship: { findFirst: jest.fn() },
  tblListeners: { findUnique: jest.fn() },
  tblAppPages: { findUnique: jest.fn() },
} }));
jest.mock('../../../config/casbin.config', () => ({ enforce: jest.fn() }));
jest.mock('../../../modules/auth/auth.service', () => ({ authService: { getUserFromFirebaseID: jest.fn() } }));
jest.mock('../../../utils/express.utils', () => ({ expressUtils: { sendResponse: jest.fn() } }));

const { prisma } = require('../../../config/prisma.config');
const { enforce } = require('../../../config/casbin.config');
const { authService } = require('../../../modules/auth/auth.service');
const { expressUtils } = require('../../../utils/express.utils');
const { workflowMiddleware } = require('../../../modules/workflow/workflow.middleware');
const { workflowSocketController } = require('../../../modules/workflow/workflow.socket.controller');
const { joinAuthorizedRoom } = require('../../../modules/auth/socketAuthorization');

describe('state-machine transition authorization', () => {
  let socket;
  beforeEach(() => {
    jest.resetAllMocks();
    socket = { handshake: { auth: { firebase_id: 'verified-user' } }, join: jest.fn() };
    authService.getUserFromFirebaseID.mockResolvedValue({ userID: 'u' });
    prisma.tblUsersTenantsRelationship.findFirst.mockResolvedValue({ userID: 'u', tenantID: 'tenant-a' });
    enforce.mockResolvedValue(true);
  });

  test('foreign instance cannot fall back to wildcard permission in URL tenant', async () => {
    prisma.tblWorkflowInstances.findFirst.mockResolvedValue(null);
    const req = { params: { instanceID: 'foreign-run', tenantID: 'tenant-a' } };
    const next = jest.fn();
    await workflowMiddleware.resolveWorkflowIDFromInstance(req, {}, next);
    expect(prisma.tblWorkflowInstances.findFirst).toHaveBeenCalledWith({ where: { instanceID: 'foreign-run', tenantID: 'tenant-a' }, select: { workflowID: true } });
    expect(next).not.toHaveBeenCalled();
    expect(req.workflowID).toBeUndefined();
    expect(expressUtils.sendResponse.mock.calls[0][4]).toBe(404);
  });

  test('collection request resolution binds its parent instance to URL tenant', async () => {
    prisma.tblWorkflowDataCollectionRequests.findFirst.mockResolvedValue(null);
    const next = jest.fn();
    await workflowMiddleware.resolveWorkflowIDFromCollectionRequest({ params: { collectionRequestID: 'r', tenantID: 'tenant-a' } }, {}, next);
    expect(prisma.tblWorkflowDataCollectionRequests.findFirst.mock.calls[0][0].where).toEqual({ collectionRequestID: 'r', tblWorkflowInstances: { tenantID: 'tenant-a' } });
    expect(next).not.toHaveBeenCalled();
  });

  test('missing tenant fails closed', async () => {
    const next = jest.fn();
    await workflowMiddleware.resolveWorkflowIDFromInstance({ params: { instanceID: 'r' } }, {}, next);
    expect(next).not.toHaveBeenCalled();
    expect(prisma.tblWorkflowInstances.findFirst).not.toHaveBeenCalled();
  });

  test('workflow join checks the actual owner tenant, not a supplied firebaseID', async () => {
    prisma.tblWorkflowInstances.findFirst.mockResolvedValue({ tenantID: 'tenant-b', workflowID: 'wf-b' });
    prisma.tblUsersTenantsRelationship.findFirst.mockResolvedValue(null);
    expect(await workflowSocketController.onWorkflowRunJoin({ socket, runId: 'foreign', firebaseID: 'forged' })).toEqual({ joined: false, error: 'PERMISSION_DENIED' });
    expect(socket.join).not.toHaveBeenCalled();
    expect(authService.getUserFromFirebaseID).toHaveBeenCalledWith({ firebaseID: 'verified-user' });
  });

  test('tenant membership alone does not grant resource read', async () => {
    prisma.tblWorkflowInstances.findFirst.mockResolvedValue({ tenantID: 'tenant-a', workflowID: 'restricted' });
    enforce.mockResolvedValue(false);
    await workflowSocketController.onWorkflowRunJoin({ socket, runId: 'r' });
    expect(enforce).toHaveBeenCalledWith('u', 'tenant-a', 'workflow:restricted', 'read');
    expect(socket.join).not.toHaveBeenCalled();
  });

  test('authorized workflow observer can join', async () => {
    prisma.tblWorkflowInstances.findFirst.mockResolvedValue({ tenantID: 'tenant-a', workflowID: 'wf' });
    expect(await workflowSocketController.onWorkflowRunJoin({ socket, runId: 'r' })).toEqual({ joined: true });
    expect(socket.join).toHaveBeenCalledWith('r');
  });

  test.each(['tenant:tenant-a', 'listener:anything', 'listener:app_page:p:extra', null])('generic prefix room %s fails closed', async room => {
    await expect(joinAuthorizedRoom({ socket, room })).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
    expect(socket.join).not.toHaveBeenCalled();
  });

  test.each([
    ['listener_test:l', 'tblListeners', { listenerID: 'l', tenantID: 'tenant-a' }, 'listener:l'],
    ['listener:app_page:p', 'tblAppPages', { appPageID: 'p', tenantID: 'tenant-a' }, 'appPage:p'],
  ])('authorizes exact room %s against its actual resource', async (room, table, row, selector) => {
    prisma[table].findUnique.mockResolvedValue(row);
    await joinAuthorizedRoom({ socket, room });
    expect(enforce).toHaveBeenCalledWith('u', 'tenant-a', selector, 'read');
    expect(socket.join).toHaveBeenCalledWith(room);
  });
});
