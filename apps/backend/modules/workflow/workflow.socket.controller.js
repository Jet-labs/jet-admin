const Logger = require("../../utils/logger");

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
    await socket.join(runId);
    Logger.log("success", {
      message: "User joined workflow run room",
      params: { firebaseID, runId },
    });
  } catch (error) {
    Logger.log("error", {
      message: "Error joining workflow run room",
      params: { error: error.message, stack: error.stack },
    });
  }
};

module.exports = {
  workflowSocketController: {
    onWorkflowRunJoin,
  },
};
