/**
 * Workflow Routes
 */
const express = require("express");
const router = express.Router({mergeParams:true});
const { workflowController } = require("./workflow.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// List all workflows
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:workflow:list"]),
  workflowController.getAllWorkflows
);

// Create workflow
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:workflow:create"]),
  workflowController.createWorkflow
);

// Get workflow by ID
router.get(
  "/:workflowID",
  authMiddleware.checkUserPermissions(["tenant:workflow:read"]),
  workflowController.getWorkflowByID
);

// Update workflow
router.patch(
  "/:workflowID",
  authMiddleware.checkUserPermissions(["tenant:workflow:update"]),
  workflowController.updateWorkflow
);

// Delete workflow
router.delete(
  "/:workflowID",
  authMiddleware.checkUserPermissions(["tenant:workflow:delete"]),
  workflowController.deleteWorkflow
);

// Execute workflow (async - returns instanceID immediately)
router.post(
  "/:workflowID/execute",
  authMiddleware.checkUserPermissions(["tenant:workflow:execute"]),
  workflowController.executeWorkflow
);

// Get run status
router.get(
  "/instances/:instanceID",
  authMiddleware.checkUserPermissions(["tenant:workflow:read"]),
  workflowController.getRunStatus
);

// Test run workflow without saving (uses in-memory nodes/edges)
router.post(
  "/test",
  authMiddleware.checkUserPermissions(["tenant:workflow:execute"]),
  workflowController.testWorkflow
);

module.exports = router;


