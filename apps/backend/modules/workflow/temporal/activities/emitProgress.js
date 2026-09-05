/**
 * emitProgressActivity — Socket + Widget + DB audit (NON-RETRYABLE).
 * RUNNING is ephemeral (socket only); SUCCESS/FAILED/SUSPENDED persist via stateManager.
 */
const Logger = require('../../../../utils/logger');
const constants = require('../../../../constants');

/**
 * Build the DB payload from activity output. Shared shape with the workflow's
 * mergeOutputIntoContext (see workflows/dslWorkflow.js) — outputVariable wins,
 * __contextPatch spreads, __node_<id> sentinel always recorded.
 */
function buildProgressPayload({ nodeID, output, outputVariable }) {
  const payload = {};
  if (output && typeof output === 'object') {
    if (output.__contextPatch && typeof output.__contextPatch === 'object') {
      Object.assign(payload, output.__contextPatch);
    } else if (outputVariable && output[outputVariable] !== undefined) {
      payload[outputVariable] = output[outputVariable];
    } else if (outputVariable) {
      payload[outputVariable] = output[outputVariable] ?? output;
    }
    payload[`__node_${nodeID}`] = { output, status: undefined, outputVariable };
    if (output.__deleteKeys) payload.__deleteKeys = output.__deleteKeys;
  }
  return payload;
}

function resolveProgressEvent(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'SUCCESS' || status === constants.WORKFLOW_STATUS.SUCCESS) {
    return {
      eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_COMPLETED,
      nodeStatus: constants.WORKFLOW_STATUS.SUCCESS,
    };
  }
  if (s === 'FAILED' || s === 'ERROR' || status === constants.WORKFLOW_STATUS.ERROR) {
    return {
      eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_FAILED,
      nodeStatus: constants.WORKFLOW_STATUS.ERROR,
    };
  }
  if (s === 'SUSPENDED' || status === constants.WORKFLOW_STATUS.SUSPENDED) {
    return {
      eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_SUSPENDED,
      nodeStatus: constants.WORKFLOW_STATUS.SUSPENDED,
    };
  }
  return { eventType: null, nodeStatus: null }; // RUNNING — ephemeral
}

async function emitProgressActivity({ instanceID, nodeID, status, output, contextData, errorMessage, nodeType, outputVariable, nodeAttempt = 1 }) {
  try {
    const { stateManager } = require('../../workflowEngine/stateManager');
    const { socketIO } = require('../../../../config/socket.io');
    const { widgetWorkflowBridge } = require('../../../widget/widgetWorkflowBridge');

    const userContext = contextData ? Object.fromEntries(Object.entries(contextData).filter(([k]) => !k.startsWith('__'))) : {};
    const { eventType, nodeStatus } = resolveProgressEvent(status);

    if (eventType) {
      const payload = buildProgressPayload({ nodeID, output, outputVariable });
      // Stamp the actual status on the sentinel (builder leaves it undefined).
      if (payload[`__node_${nodeID}`]) payload[`__node_${nodeID}`].status = status;
      try {
        await stateManager.logEvent({
          instanceID,
          nodeID,
          eventType,
          nodeStatus,
          outputVariable: outputVariable || null,
          payload,
          errorMessage: errorMessage || null,
          nodeAttempt,
        });
      } catch (logErr) {
        if (logErr?.code !== 'P2002') {
          Logger.log('warning', { message: 'temporal:emitProgress:logEventFailed', params: { instanceID, nodeID, error: logErr.message } });
        }
      }
    }

    try {
      // Visibility for split-process topologies: if no socket is in this
      // instance room (e.g. activities running in a sidecar without clients),
      // node updates are silently lost — warn so it shows in backend logs.
      const roomSize = socketIO.sockets?.adapter?.rooms?.get?.(instanceID)?.size ?? null;
      if (roomSize === 0 || roomSize === null) {
        const rooms = socketIO.sockets?.adapter?.rooms;
        Logger.log('warning', {
          message: 'temporal:emitProgress:noListeners',
          params: { instanceID, nodeID, status, roomSize, knownRooms: rooms ? rooms.size : null },
        });
      }
      socketIO.to(instanceID).emit(constants.SOCKET_EMIT_EVENTS.WORKFLOW_NODE_UPDATE, {
        instanceID,
        nodeID,
        status,
        output,
        error: errorMessage || null,
        contextData: userContext,
      });
    } catch (sockErr) {
      Logger.log('warning', { message: 'temporal:emitProgress:socketFailed', params: { instanceID, nodeID, error: sockErr.message } });
    }

    try {
      widgetWorkflowBridge.emitContextUpdate(instanceID, {
        type: 'NODE_COMPLETE',
        nodeID,
        nodeType,
        outputVariable,
        value: output?.[outputVariable] ?? output,
        status,
        contextSnapshot: userContext,
      });
    } catch (bridgeErr) {
      Logger.log('warning', { message: 'temporal:emitProgress:bridgeFailed', params: { error: bridgeErr.message } });
    }

    return { emitted: true };
  } catch (err) {
    Logger.log('error', { message: 'temporal:emitProgress:failed', params: { instanceID, nodeID, error: err.message } });
    return { emitted: false, error: err.message };
  }
}

module.exports = { emitProgressActivity, buildProgressPayload, resolveProgressEvent };
