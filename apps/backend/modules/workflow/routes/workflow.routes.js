/**
 * Workflow Routes
 */
const express = require("express");
const router = express.Router();
const { workflowController } = require("../controllers/workflow.controller");

// Execute workflow
router.post("/:id/execute", workflowController.executeWorkflow);

// Get run status
router.get("/run/:runId", workflowController.getRunStatus);

module.exports = router;
