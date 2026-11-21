/** One durable request and suspension event per logical wait. */
const { v5: uuidv5 } = require('uuid');
const Logger = require('../../../../utils/logger');
const constants = require('../../../../constants');
const { emitProgressActivity } = require('./emitProgress');
const { activityEventKey } = require('./activityEventKey');

async function createDataCollectionRequestActivity({ instanceID, nodeID, nodeAttempt = 1, collectionConfig, waitID, expiresAt, contextData = {} }) {
  const { stateManager } = require('../../workflowEngine/stateManager');
  const { socketIO } = require('../../../../config/socket.io');
  const expiryMins = collectionConfig?.expiryMinutes ?? 60;
  const deadline = expiresAt !== undefined
    ? (expiresAt === null ? null : new Date(expiresAt))
    : expiryMins > 0 ? new Date(Date.now() + expiryMins * 60 * 1000) : null;
  const requestID = waitID ? uuidv5(`${instanceID}:${waitID}`, uuidv5.URL) : null;
  const existing = requestID
    ? await stateManager.getDataCollectionRequest(requestID)
    : await stateManager.getPendingRequestForNode(instanceID, nodeID);
  const request = existing || await stateManager.createDataCollectionRequest({
    instanceID, nodeID, nodeAttempt, collectionType: collectionConfig?.collectionType || 'form',
    collectionConfig, expiresAt: deadline, waitID, collectionRequestID: requestID,
  });
  await stateManager.logEvent({
    instanceID, nodeID, eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_SUSPENDED,
    nodeStatus: constants.WORKFLOW_STATUS.SUSPENDED,
    payload: { collectionRequestID: request.collectionRequestID }, nodeAttempt,
    eventKey: waitID ? `wait:${waitID}:suspended` : activityEventKey('suspended'),
  });
  if (request.status === 'PENDING') try {
    socketIO.to(instanceID).emit(constants.SOCKET_EMIT_EVENTS.WORKFLOW_DATA_COLLECTION_REQUEST, {
      instanceID, nodeID, collectionRequestID: request.collectionRequestID,
      collectionType: request.collectionType, collectionConfig: request.collectionConfig,
    });
  } catch (error) {
    Logger.log('warning', { message: 'humanInput:requestNotificationFailed', params: { instanceID, error: error.message } });
  }
  if (request.status === 'PENDING') await emitProgressActivity({
    instanceID, nodeID, status: constants.WORKFLOW_STATUS.SUSPENDED,
    output: collectionConfig, contextData, nodeAttempt, persist: false,
  });
  return {
    collectionRequestID: request.collectionRequestID, reused: Boolean(existing),
    collectionConfig: request.collectionConfig, status: request.status,
  };
}

async function resolveDataCollectionRequestActivity({ collectionRequestID, expire = false }) {
  const { stateManager } = require('../../workflowEngine/stateManager');
  const request = await stateManager.resolveDataCollectionRequest(collectionRequestID, expire);
  return request ? { status: request.status, submittedData: request.submittedData } : { status: 'MISSING' };
}
module.exports = { createDataCollectionRequestActivity, resolveDataCollectionRequestActivity };
