/**
 * WorkflowController
 * Handles API requests for workflow execution.
 */
const workflowService = require("../services/workflow.service");
const Logger = require("../../../utils/logger");

const workflowController = {};

workflowController.executeWorkflow = async (req, res) => {
  const { id } = req.params;
  const { params } = req.body; // Trigger params

  try {
    const result = await workflowService.executeWorkflow(id, params);
    res.status(202).json(result);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:executeWorkflow:error", params: { error: error.message } });
    res.status(500).json({ error: error.message });
  }
};

workflowController.getRunStatus = async (req, res) => {
  const { runId } = req.params;

  try {
    const status = await workflowService.getRunStatus(runId);
    if (!status) {
      return res.status(404).json({ error: "Run not found" });
    }
    res.json(status);
  } catch (error) {
    Logger.log("error", { message: "WorkflowController:getRunStatus:error", params: { error: error.message } });
    res.status(500).json({ error: error.message });
  }
};

module.exports = { workflowController };
