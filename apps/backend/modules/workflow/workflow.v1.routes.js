/**
 * Workflow Routes
 */
const express = require("express");
const router = express.Router({ mergeParams: true });
const { workflowController } = require("./workflow.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  createWorkflowSchema,
  updateWorkflowSchema,
  executeWorkflowSchema,
  testWorkflowSchema,
  workflowIdParamSchema,
  instanceIdParamSchema,
} = require("./workflow.validator");

// List all workflows
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:workflow:list"]),
  workflowController.getAllWorkflows
);

// Create workflow
router.post(
  "/",
  validate(createWorkflowSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:workflow:create"]),
  workflowController.createWorkflow
);

// Get workflow by ID
router.get(
  "/:workflowID",
  validate(workflowIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:workflow:read"]),
  workflowController.getWorkflowByID
);

// Update workflow
router.patch(
  "/:workflowID",
  validateAll({
    params: workflowIdParamSchema,
    body: updateWorkflowSchema,
  }),
  authMiddleware.checkUserPermissions(["tenant:workflow:update"]),
  workflowController.updateWorkflow
);

// Delete workflow
router.delete(
  "/:workflowID",
  validate(workflowIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:workflow:delete"]),
  workflowController.deleteWorkflow
);

// Execute workflow (async - returns instanceID immediately)
router.post(
  "/:workflowID/execute",
  validateAll({
    params: workflowIdParamSchema,
    body: executeWorkflowSchema,
  }),
  authMiddleware.checkUserPermissions(["tenant:workflow:execute"]),
  workflowController.executeWorkflow
);

// Get run status
router.get(
  "/instances/:instanceID",
  validate(instanceIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:workflow:read"]),
  workflowController.getRunStatus
);

// Test run workflow without saving (uses in-memory nodes/edges)
router.post(
  "/test",
  validate(testWorkflowSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:workflow:execute"]),
  workflowController.testWorkflow
);

// Stop and delete a test workflow instance
router.delete(
  "/instances/:instanceID/stop",
  validate(instanceIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:workflow:execute"]),
  workflowController.stopTestWorkflow
);

module.exports = router;
