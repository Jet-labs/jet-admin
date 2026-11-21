/**
 * emitWorkflowCompletedActivity — marks instance COMPLETED/FAILED/CANCELLED + notifies socket/widget.
 * errorMessage is set for terminal failures (deadlock, node error, timeout, ...)
 * so the run console and history can show WHY the run failed.
 */
const Logger = require('../../../../utils/logger');
const constants = require('../../../../constants');

async function emitWorkflowCompletedActivity({ instanceID, finalStatus, contextData, workflowOutput, errorMessage }) {
  try {
    const { stateManager } = require('../../workflowEngine/stateManager');
    const { socketIO } = require('../../../../config/socket.io');
    const { widgetWorkflowBridge } = require('../../../widget/widgetWorkflowBridge');
    const userContext = contextData ? Object.fromEntries(Object.entries(contextData).filter(([k]) => !k.startsWith('__'))) : {};
    const changed = await stateManager.completeInstance(instanceID, finalStatus, {
      contextData, workflowOutput, errorMessage: finalStatus === 'FAILED' ? errorMessage : undefined,
    });
    if (!changed) return { completed: false }; // terminal state is absorbing
    const roomSize = socketIO.sockets?.adapter?.rooms?.get?.(instanceID)?.size ?? null;
    if (roomSize === 0 || roomSize === null) {
      Logger.log('warning', {
        message: 'temporal:emitWorkflowCompleted:noListeners',
        params: { instanceID, finalStatus, roomSize },
      });
    }
    try {
      socketIO.to(instanceID).emit(constants.SOCKET_EMIT_EVENTS.WORKFLOW_STATUS_UPDATE, {
        instanceID,
        status: finalStatus,
        contextData: userContext,
        output: workflowOutput ?? null,
        ...(errorMessage ? { error: errorMessage } : {}),
      });
      widgetWorkflowBridge.emitWorkflowStatus(instanceID, finalStatus, userContext);
    } catch (notificationError) {
      Logger.log('warning', { message: 'temporal:workflowCompleted:notificationFailed', params: { instanceID, error: notificationError.message } });
    }
    Logger.log('success', { message: 'temporal:workflowCompleted', params: { instanceID, finalStatus, ...(errorMessage ? { errorMessage } : {}) } });
    return { completed: true };
  } catch (err) {
    Logger.log('error', { message: 'temporal:emitWorkflowCompleted:failed', params: { instanceID, error: err.message } });
    throw err;
  }
}

module.exports = { emitWorkflowCompletedActivity };
