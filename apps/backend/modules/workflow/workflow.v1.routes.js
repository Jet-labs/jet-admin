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
  listInstancesQuerySchema,
} = require("./workflow.validator");
const { P } = require("../../config/permissions");
const { bundleController } = require("../bundle/bundle.controller");
const dataCollectionRoutes = require("./dataCollection/dataCollection.v1.routes");

// Schemas
router.get(
  "/schemas",
  authMiddleware.authorize(P.workflow.list),
  workflowController.getWorkflowNodeSchemas
);

// List all workflows
router.get(
  "/",
  validate(listWorkflowsQuerySchema, "query"),
  authMiddleware.authorize(P.workflow.list),
  workflowController.getAllWorkflows
);

// List workflow run history for the tenant (query: workflowID?, status?, page, pageSize)
// NOTE: must be registered before GET /:workflowID, otherwise Express
// matches "instances" as a workflowID param and rejects it as non-UUID.
router.get(
  "/instances",
  validate(listInstancesQuerySchema, "query"),
  authMiddleware.authorize(P.workflow.list),
  workflowController.getWorkflowInstances
);

// Create workflow
router.post(
  "/",
  validate(createWorkflowSchema, "body"),
  workflowMiddleware.extractWorkflowDataQueryIDs,
  workflowMiddleware.extractWorkflowSubWorkflowIDs,
  authMiddleware.authorize([
    P.workflow.create,
    { ...P.dataquery.execute, reqKey: "dataQueryIDs", skipIfMissing: true },
    { ...P.workflow.execute, reqKey: "subWorkflowIDs", skipIfMissing: true }
  ]),
  workflowController.createWorkflow
);

// Get workflow by ID
router.get(
  "/:workflowID",
  validate(workflowIdParamSchema, "params"),
  authMiddleware.authorize({ ...P.workflow.read, paramKey: "workflowID" }),
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
  workflowMiddleware.extractWorkflowSubWorkflowIDs,
  authMiddleware.authorize([
    { ...P.workflow.update, paramKey: "workflowID" },
    { ...P.dataquery.execute, reqKey: "dataQueryIDs", skipIfMissing: true },
    { ...P.workflow.execute, reqKey: "subWorkflowIDs", skipIfMissing: true }
  ]),
  workflowController.updateWorkflow
);

// Delete workflow
router.delete(
  "/:workflowID",
  validate(workflowIdParamSchema, "params"),
  authMiddleware.authorize({ ...P.workflow.delete, paramKey: "workflowID" }),
  workflowController.deleteWorkflow
);

// Export workflow bundle
router.get(
  "/:workflowID/export",
  validate(workflowIdParamSchema, "params"),
  authMiddleware.authorize(P.workflow.export),
  bundleController.exportWorkflow
);

// Clone workflow
router.post(
  "/:workflowID/clone",
  validate(workflowIdParamSchema, "params"),
  workflowMiddleware.resolveWorkflowDataQueryIDsFromDB,
  workflowMiddleware.resolveWorkflowSubWorkflowIDsFromDB,
  authMiddleware.authorize([
    P.workflow.create,
    { ...P.workflow.read, paramKey: "workflowID" },
    { ...P.dataquery.execute, reqKey: "dataQueryIDs", skipIfMissing: true },
    { ...P.workflow.execute, reqKey: "subWorkflowIDs", skipIfMissing: true }
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
  workflowMiddleware.resolveWorkflowSubWorkflowIDsFromDB,
  authMiddleware.authorize([
    { ...P.workflow.execute, paramKey: "workflowID" },
    { ...P.workflow.execute, reqKey: "subWorkflowIDs", skipIfMissing: true }
  ]),
  workflowController.executeWorkflow
);

// Get run status
router.get(
  "/instances/:instanceID",
  validate(instanceIdParamSchema, "params"),
  workflowMiddleware.resolveWorkflowIDFromInstance,
  authMiddleware.authorize({ ...P.workflow.read, reqKey: "workflowID" }),
  workflowController.getRunStatus
);

// Test run workflow without saving (uses in-memory nodes/edges)
router.post(
  "/test",
  validate(testWorkflowSchema, "body"),
  workflowMiddleware.extractWorkflowDataQueryIDs,
  workflowMiddleware.extractWorkflowSubWorkflowIDs,
  authMiddleware.authorize([
    P.workflow.test,
    { ...P.dataquery.execute, reqKey: "dataQueryIDs", skipIfMissing: true },
    { ...P.workflow.execute, reqKey: "subWorkflowIDs", skipIfMissing: true }
  ]),
  workflowController.testWorkflow
);

// Stop and delete a test workflow instance
router.delete(
  "/instances/:instanceID/stop",
  validate(instanceIdParamSchema, "params"),
  workflowMiddleware.resolveWorkflowIDFromInstance,
  authMiddleware.authorize({ ...P.workflow.execute, reqKey: "workflowID" }),
  workflowController.stopTestWorkflow
);

// Get run status with processed widget data
router.post(
  "/instances/:instanceID/widget",
  validate(instanceIdParamSchema, "params"),
  workflowMiddleware.resolveWorkflowIDFromInstance,
  authMiddleware.authorize({ ...P.workflow.read, reqKey: "workflowID" }),
  workflowController.getRunStatusForWidget
);

router.use(
  "/data-collection",
  dataCollectionRoutes
);

module.exports = router;
