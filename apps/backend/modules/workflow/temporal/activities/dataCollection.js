/**
 * createDataCollectionRequestActivity — idempotent PENDING request creation.
 */
const Logger = require('../../../../utils/logger');
const constants = require('../../../../constants');
const { emitProgressActivity } = require('./emitProgress');

async function createDataCollectionRequestActivity({ instanceID, nodeID, nodeAttempt = 1, collectionConfig }) {
  const { stateManager } = require('../../workflowEngine/stateManager');
  const { socketIO } = require('../../../../config/socket.io');
  const expiryMins = collectionConfig?.expiryMinutes ?? 60;
  const expiresAt = expiryMins > 0 ? new Date(Date.now() + expiryMins * 60 * 1000) : null;
  Logger.log('info', { message: 'temporal:activity:createDataCollectionRequest', params: { instanceID, nodeID } });
  const existing = await stateManager.getPendingRequestForNode(instanceID, nodeID);
  if (existing) {
    socketIO.to(instanceID).emit(constants.SOCKET_EMIT_EVENTS.WORKFLOW_DATA_COLLECTION_REQUEST, {
      instanceID,
      nodeID,
      collectionRequestID: existing.collectionRequestID,
      collectionType: existing.collectionType,
      collectionConfig: existing.collectionConfig,
    });
    return { collectionRequestID: existing.collectionRequestID, reused: true, collectionConfig: existing.collectionConfig };
  }
  const request = await stateManager.createDataCollectionRequest({
    instanceID,
    nodeID,
    nodeAttempt,
    collectionType: collectionConfig?.collectionType || 'form',
    collectionConfig,
    expiresAt,
  });
  await stateManager.logEvent({
    instanceID,
    nodeID,
    eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_SUSPENDED,
    nodeStatus: constants.WORKFLOW_STATUS.SUSPENDED,
    payload: { collectionRequestID: request.collectionRequestID },
    nodeAttempt,
  });
  socketIO.to(instanceID).emit(constants.SOCKET_EMIT_EVENTS.WORKFLOW_DATA_COLLECTION_REQUEST, {
    instanceID,
    nodeID,
    collectionRequestID: request.collectionRequestID,
    collectionType: request.collectionType,
    collectionConfig: request.collectionConfig,
  });
  await emitProgressActivity({
    instanceID,
    nodeID,
    status: constants.WORKFLOW_STATUS.SUSPENDED,
    output: collectionConfig,
    contextData: {},
    nodeAttempt,
  });
  return { collectionRequestID: request.collectionRequestID, reused: false, collectionConfig: request.collectionConfig };
}

module.exports = { createDataCollectionRequestActivity };
