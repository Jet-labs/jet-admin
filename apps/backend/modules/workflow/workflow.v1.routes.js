/**
 * Workflow Routes
 */
const express = require("express");
const router = express.Router({mergeParams:true});
const { workflowController } = require("./workflow.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// TODO: Add Workflow Management Routes (CRUD)
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:workflow:list"]),
  workflowController.getAllWorkflows
);

router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:workflow:create"]),
  workflowController.createWorkflow
);
// // Execute workflow
// router.post("/:id/execute", workflowController.executeWorkflow);

// // Get run status
// router.get("/run/:runId", workflowController.getRunStatus);

module.exports = router;
