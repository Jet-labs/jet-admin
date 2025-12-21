const Logger = require("../../../utils/logger");

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
