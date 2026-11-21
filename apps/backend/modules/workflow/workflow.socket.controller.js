const Logger = require("../../utils/logger");
const { authorizeWorkflowInstance } = require('../auth/socketAuthorization');

/**
 * Handle user joining a workflow run room
 * @param {object} param0
 * @param {Socket} param0.socket - Socket.IO socket
 * @param {string} param0.runId - Workflow instance ID
 * @param {string} param0.firebaseID - User's Firebase ID
 */
const onWorkflowRunJoin = async ({ socket, runId, firebaseID }) => {
  try {
    if (!runId) return;
    await authorizeWorkflowInstance({ socket, instanceID: runId });
    await socket.join(runId);
    Logger.log("success", {
      message: "User joined workflow run room",
      params: { firebaseID, runId },
    });
    return { joined: true };
  } catch (error) {
    Logger.log("error", {
      message: "Error joining workflow run room",
      params: { error: error.message, stack: error.stack },
    });
    return { joined: false, error: 'PERMISSION_DENIED' };
  }
};

module.exports = {
  workflowSocketController: {
    onWorkflowRunJoin,
  },
};
