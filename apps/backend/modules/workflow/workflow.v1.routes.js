/**
 * Workflow Routes
 */
const express = require("express");
const router = express.Router({ mergeParams: true });
const { workflowController } = require("./workflow.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { workflowMiddleware } = require("./workflow.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  createWorkflowSchema,
  updateWorkflowSchema,
  executeWorkflowSchema,
  testWorkflowSchema,
  workflowIdParamSchema,
  instanceIdParamSchema,
  listWorkflowsQuerySchema,
} = require("./workflow.validator");
const dataCollectionRoutes = require("./dataCollection/dataController.route");

// List all workflows
router.get(
  "/",
  validate(listWorkflowsQuerySchema, "query"),
  authMiddleware.authorize("workflow", "list"),
  workflowController.getAllWorkflows
);

// Create workflow
router.post(
  "/",
  validate(createWorkflowSchema, "body"),
  workflowMiddleware.extractWorkflowDataQueryIDs,
  authMiddleware.authorize([
    { resource: "workflow", action: "create" },
    { resource: "dataquery", action: "execute", reqKey: "dataQueryIDs", skipIfMissing: true }
  ]),
  workflowController.createWorkflow
);

// Get workflow by ID
router.get(
  "/:workflowID",
  validate(workflowIdParamSchema, "params"),
  authMiddleware.authorize("workflow", "read", { paramKey: "workflowID" }),
  workflowController.getWorkflowByID
);

// Update workflow
router.patch(
  "/:workflowID",
  validateAll({
    params: workflowIdParamSchema,
    body: updateWorkflowSchema,
  }),
  workflowMiddleware.extractWorkflowDataQueryIDs,
  authMiddleware.authorize([
    { resource: "workflow", action: "update", paramKey: "workflowID" },
    { resource: "dataquery", action: "execute", reqKey: "dataQueryIDs", skipIfMissing: true }
  ]),
  workflowController.updateWorkflow
);

// Delete workflow
router.delete(
  "/:workflowID",
  validate(workflowIdParamSchema, "params"),
  authMiddleware.authorize("workflow", "delete", { paramKey: "workflowID" }),
  workflowController.deleteWorkflow
);

// Clone workflow
router.post(
  "/:workflowID/clone",
  validate(workflowIdParamSchema, "params"),
  workflowMiddleware.resolveWorkflowDataQueryIDsFromDB,
  authMiddleware.authorize([
    { resource: "workflow", action: "create" },
    { resource: "workflow", action: "read", paramKey: "workflowID" },
    { resource: "dataquery", action: "execute", reqKey: "dataQueryIDs", skipIfMissing: true }
  ]),
  workflowController.cloneWorkflow
);


// Execute workflow (async - returns instanceID immediately)
router.post(
  "/:workflowID/execute",
  validateAll({
    params: workflowIdParamSchema,
    body: executeWorkflowSchema,
  }),
  authMiddleware.authorize("workflow", "execute", { paramKey: "workflowID" }),
  workflowController.executeWorkflow
);

// Get run status
router.get(
  "/instances/:instanceID",
  validate(instanceIdParamSchema, "params"),
  workflowMiddleware.resolveWorkflowIDFromInstance,
  authMiddleware.authorize("workflow", "read", { reqKey: "workflowID" }),
  workflowController.getRunStatus
);

// Test run workflow without saving (uses in-memory nodes/edges)
router.post(
  "/test",
  validate(testWorkflowSchema, "body"),
  workflowMiddleware.extractWorkflowDataQueryIDs,
  authMiddleware.authorize([
    { resource: "workflow", action: "test" },
    { resource: "dataquery", action: "execute", reqKey: "dataQueryIDs", skipIfMissing: true }
  ]),
  workflowController.testWorkflow
);

// Stop and delete a test workflow instance
router.delete(
  "/instances/:instanceID/stop",
  validate(instanceIdParamSchema, "params"),
  workflowMiddleware.resolveWorkflowIDFromInstance,
  authMiddleware.authorize("workflow", "execute", { reqKey: "workflowID" }),
  workflowController.stopTestWorkflow
);

// Get run status with processed widget data
router.post(
  "/instances/:instanceID/widget",
  validate(instanceIdParamSchema, "params"),
  workflowMiddleware.resolveWorkflowIDFromInstance,
  authMiddleware.authorize("workflow", "read", { reqKey: "workflowID" }),
  workflowController.getRunStatusForWidget
);

router.use(
  "/data-collection",
  dataCollectionRoutes
);

module.exports = router;
