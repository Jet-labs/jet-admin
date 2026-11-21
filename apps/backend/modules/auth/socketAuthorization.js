const { prisma } = require('../../config/prisma.config');
const { enforce } = require('../../config/casbin.config');
const { authService } = require('./auth.service');

function denied() {
  const error = new Error('Socket resource access denied');
  error.code = 'PERMISSION_DENIED';
  return error;
}

// Identity comes exclusively from verified socket authentication, never event data.
async function authorizeSocketResource({ socket, tenantID, resource, resourceID, action = 'read' }) {
  const firebaseID = socket?.handshake?.auth?.firebase_id;
  if (!firebaseID || !tenantID || !resourceID) throw denied();
  const user = await authService.getUserFromFirebaseID({ firebaseID });
  if (!user) throw denied();
  const membership = await prisma.tblUsersTenantsRelationship.findFirst({
    where: { userID: user.userID, tenantID },
  });
  if (!membership || !await enforce(user.userID, tenantID, `${resource}:${resourceID}`, action)) throw denied();
  return user;
}

async function authorizeWorkflowInstance({ socket, instanceID, tenantID, action = 'read' }) {
  if (typeof instanceID !== 'string' || !instanceID) throw denied();
  const instance = await prisma.tblWorkflowInstances.findFirst({
    where: { instanceID, ...(tenantID ? { tenantID } : {}) },
  });
  if (!instance) throw denied();
  await authorizeSocketResource({ socket, tenantID: instance.tenantID, resource: 'workflow', resourceID: instance.workflowID || '*', action });
  return instance;
}

async function joinAuthorizedRoom({ socket, room }) {
  if (typeof room !== 'string') throw denied();
  let match = /^listener_test:([^:]+)$/.exec(room);
  if (match) {
    const listener = await prisma.tblListeners.findUnique({ where: { listenerID: match[1] } });
    if (!listener) throw denied();
    await authorizeSocketResource({ socket, tenantID: listener.tenantID, resource: 'listener', resourceID: listener.listenerID });
  } else if ((match = /^listener:app_page:([^:]+)$/.exec(room))) {
    const page = await prisma.tblAppPages.findUnique({ where: { appPageID: match[1] } });
    if (!page) throw denied();
    await authorizeSocketResource({ socket, tenantID: page.tenantID, resource: 'appPage', resourceID: page.appPageID });
  } else {
    // No arbitrary prefix joins, including broad tenant-wide broadcast rooms.
    throw denied();
  }
  await socket.join(room);
  return { joined: true };
}

module.exports = { authorizeSocketResource, authorizeWorkflowInstance, joinAuthorizedRoom };
