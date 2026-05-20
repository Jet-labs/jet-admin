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

const router = express.Router({ mergeParams: true });

// Connection status (must be before :listenerID param route)
router.get('/status/connections', listenerController.getConnectionStatus);

// Listener CRUD
router.get('/', listenerController.getAllListeners);
router.post('/', listenerController.createListener);
router.get('/:listenerID', listenerController.getListenerByID);
router.put('/:listenerID', listenerController.updateListener);
router.delete('/:listenerID', listenerController.deleteListener);
router.post('/:listenerID/clone', listenerController.cloneListener);

// Lifecycle & Testing
router.post('/:listenerID/activate', listenerController.activateListener);
router.post('/:listenerID/deactivate', listenerController.deactivateListener);
router.post('/:listenerID/test-script', listenerController.updateTestScript);

// Actions
router.post('/:listenerID/actions', listenerController.addAction);
router.put('/:listenerID/actions/:actionID', listenerController.updateAction);
router.delete('/:listenerID/actions/:actionID', listenerController.deleteAction);

module.exports = router;
