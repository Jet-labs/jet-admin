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
const {
  createListenerSchema,
  updateListenerSchema,
  addListenerActionSchema,
  updateListenerActionSchema,
  listListenersQuerySchema,
} = require("./listener.validator");
const { P } = require("../../config/permissions");

const router = express.Router({ mergeParams: true });

// Connection status (must be before :listenerID param route)
router.get('/status/connections', authMiddleware.authorize(P.listener.read), listenerController.getConnectionStatus);

// Schemas
router.get(
  "/schemas",
  authMiddleware.authorize(P.listener.list),
  listenerController.getListenerSchemas
);

// Listener CRUD
router.get('/', validate(listListenersQuerySchema, 'query'), authMiddleware.authorize(P.listener.list), listenerController.getAllListeners);

router.post('/',
  validate(createListenerSchema, 'body'),
  listenerMiddleware.extractListenerPipelinePermissions,
  authMiddleware.authorize([
    P.listener.create,
    { ...P.datasource.read, bodyKey: 'datasourceID' },
    { ...P.workflow.execute, reqKey: 'workflowIDs', skipIfMissing: true },
    { ...P.dataquery.execute, reqKey: 'dataQueryIDs', skipIfMissing: true }
  ]),
  listenerController.createListener
);

router.get('/:listenerID', authMiddleware.authorize({ ...P.listener.read, paramKey: 'listenerID' }), listenerController.getListenerByID);

router.put('/:listenerID',
  validate(updateListenerSchema, 'body'),
  listenerMiddleware.extractListenerPipelinePermissions,
  authMiddleware.authorize([
    { ...P.listener.update, paramKey: 'listenerID' },
    { ...P.datasource.read, bodyKey: 'datasourceID', skipIfMissing: true },
    { ...P.workflow.execute, reqKey: 'workflowIDs', skipIfMissing: true },
    { ...P.dataquery.execute, reqKey: 'dataQueryIDs', skipIfMissing: true }
  ]),
  listenerController.updateListener
);

router.delete('/:listenerID', authMiddleware.authorize({ ...P.listener.delete, paramKey: 'listenerID' }), listenerController.deleteListener);

router.post('/:listenerID/clone',
  listenerMiddleware.resolveListenerClonePermissionsFromDB,
  authMiddleware.authorize([
    P.listener.create,
    { ...P.listener.read, paramKey: 'listenerID' },
    { ...P.datasource.read, reqKey: 'datasourceID', skipIfMissing: true },
    { ...P.workflow.execute, reqKey: 'workflowIDs', skipIfMissing: true },
    { ...P.dataquery.execute, reqKey: 'dataQueryIDs', skipIfMissing: true }
  ]),
  listenerController.cloneListener
);


// Lifecycle
router.post('/:listenerID/activate', authMiddleware.authorize({ ...P.listener.update, paramKey: 'listenerID' }), listenerController.activateListener);
router.post('/:listenerID/deactivate', authMiddleware.authorize({ ...P.listener.update, paramKey: 'listenerID' }), listenerController.deactivateListener);

// Actions
router.post('/:listenerID/actions',
  validate(addListenerActionSchema, 'body'),
  listenerMiddleware.extractListenerPipelinePermissions,
  authMiddleware.authorize([
    { ...P.listener.update, paramKey: 'listenerID' },
    { ...P.workflow.execute, reqKey: 'workflowIDs', skipIfMissing: true },
    { ...P.dataquery.execute, reqKey: 'dataQueryIDs', skipIfMissing: true }
  ]),
  listenerController.addAction
);

router.put('/:listenerID/actions/:actionID',
  validate(updateListenerActionSchema, 'body'),
  listenerMiddleware.extractListenerPipelinePermissions,
  authMiddleware.authorize([
    { ...P.listener.update, paramKey: 'listenerID' },
    { ...P.workflow.execute, reqKey: 'workflowIDs', skipIfMissing: true },
    { ...P.dataquery.execute, reqKey: 'dataQueryIDs', skipIfMissing: true }
  ]),
  listenerController.updateAction
);

router.delete('/:listenerID/actions/:actionID', authMiddleware.authorize({ ...P.listener.update, paramKey: 'listenerID' }), listenerController.deleteAction);


module.exports = router;
