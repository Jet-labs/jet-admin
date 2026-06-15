/**
 * Listener API Routes (v1)
 *
 * GET     /listeners                              — list all listeners
 * POST    /listeners                              — create a listener
 * GET     /listeners/:listenerID                  — get listener by ID
 * PUT     /listeners/:listenerID                  — update a listener
 * DELETE  /listeners/:listenerID                  — delete a listener
 * POST    /listeners/:listenerID/activate         — activate a listener
 * POST    /listeners/:listenerID/deactivate       — deactivate a listener
 * POST    /listeners/:listenerID/actions           — add an action
 * PUT     /listeners/:listenerID/actions/:actionID — update an action
 * DELETE  /listeners/:listenerID/actions/:actionID — delete an action
 * GET     /listeners/status/connections            — get all connection statuses
 */
const express = require('express');
const listenerController = require('./listener.controller');
const { authMiddleware } = require('../auth/auth.middleware');
const { listenerMiddleware } = require('./listener.middleware');
const { validate } = require("../../utils/validation.utils");
const { listListenersQuerySchema } = require("./listener.validator");

const router = express.Router({ mergeParams: true });

// Connection status (must be before :listenerID param route)
router.get('/status/connections', authMiddleware.authorize('listener', 'read'), listenerController.getConnectionStatus);

// Listener CRUD
router.get('/', validate(listListenersQuerySchema, 'query'), authMiddleware.authorize('listener', 'list'), listenerController.getAllListeners);

router.post('/',
  listenerMiddleware.extractListenerPipelinePermissions,
  authMiddleware.authorize([
    { resource: 'listener', action: 'create' },
    { resource: 'datasource', action: 'read', bodyKey: 'datasourceID' },
    { resource: 'workflow', action: 'execute', reqKey: 'workflowIDs', skipIfMissing: true },
    { resource: 'dataquery', action: 'execute', reqKey: 'dataQueryIDs', skipIfMissing: true }
  ]),
  listenerController.createListener
);

router.get('/:listenerID', authMiddleware.authorize('listener', 'read', { paramKey: 'listenerID' }), listenerController.getListenerByID);

router.put('/:listenerID',
  listenerMiddleware.extractListenerPipelinePermissions,
  authMiddleware.authorize([
    { resource: 'listener', action: 'update', paramKey: 'listenerID' },
    { resource: 'datasource', action: 'read', bodyKey: 'datasourceID', skipIfMissing: true },
    { resource: 'workflow', action: 'execute', reqKey: 'workflowIDs', skipIfMissing: true },
    { resource: 'dataquery', action: 'execute', reqKey: 'dataQueryIDs', skipIfMissing: true }
  ]),
  listenerController.updateListener
);

router.delete('/:listenerID', authMiddleware.authorize('listener', 'delete', { paramKey: 'listenerID' }), listenerController.deleteListener);

router.post('/:listenerID/clone',
  listenerMiddleware.resolveListenerClonePermissionsFromDB,
  authMiddleware.authorize([
    { resource: 'listener', action: 'create' },
    { resource: 'listener', action: 'read', paramKey: 'listenerID' },
    { resource: 'datasource', action: 'read', reqKey: 'datasourceID', skipIfMissing: true },
    { resource: 'workflow', action: 'execute', reqKey: 'workflowIDs', skipIfMissing: true },
    { resource: 'dataquery', action: 'execute', reqKey: 'dataQueryIDs', skipIfMissing: true }
  ]),
  listenerController.cloneListener
);


// Lifecycle
router.post('/:listenerID/activate', authMiddleware.authorize('listener', 'update', { paramKey: 'listenerID' }), listenerController.activateListener);
router.post('/:listenerID/deactivate', authMiddleware.authorize('listener', 'update', { paramKey: 'listenerID' }), listenerController.deactivateListener);

// Actions
router.post('/:listenerID/actions',
  listenerMiddleware.extractListenerPipelinePermissions,
  authMiddleware.authorize([
    { resource: 'listener', action: 'update', paramKey: 'listenerID' },
    { resource: 'workflow', action: 'execute', reqKey: 'workflowIDs', skipIfMissing: true },
    { resource: 'dataquery', action: 'execute', reqKey: 'dataQueryIDs', skipIfMissing: true }
  ]),
  listenerController.addAction
);

router.put('/:listenerID/actions/:actionID',
  listenerMiddleware.extractListenerPipelinePermissions,
  authMiddleware.authorize([
    { resource: 'listener', action: 'update', paramKey: 'listenerID' },
    { resource: 'workflow', action: 'execute', reqKey: 'workflowIDs', skipIfMissing: true },
    { resource: 'dataquery', action: 'execute', reqKey: 'dataQueryIDs', skipIfMissing: true }
  ]),
  listenerController.updateAction
);

router.delete('/:listenerID/actions/:actionID', authMiddleware.authorize('listener', 'update', { paramKey: 'listenerID' }), listenerController.deleteAction);


module.exports = router;
