const express = require('express');
const router = express.Router({ mergeParams: true });
const { dataCollectionController } = require('./dataCollection.controller');
const { authMiddleware } = require('../../auth/auth.middleware');
const { validate } = require('../../../utils/validation.utils');
const { z } = require('../../../utils/validation.utils');

const requestIdParamSchema = z.object({ collectionRequestID: z.string().uuid() }).passthrough();

// Submit data for a pending collection request (resumes the workflow)
router.post(
    '/:collectionRequestID/submit',
    validate(requestIdParamSchema, 'params'),
    authMiddleware.checkUserPermissions(['tenant:workflow:execute']),
    dataCollectionController.submitData
);

// Get a single request (page-refresh recovery)
router.get(
    '/:collectionRequestID',
    validate(requestIdParamSchema, 'params'),
    authMiddleware.checkUserPermissions(['tenant:workflow:read']),
    dataCollectionController.getRequest
);

module.exports = router;