const express = require("express");
const router = express.Router({ mergeParams: true });
const { cronJobController } = require("./cronJob.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const { cronJobMiddleware } = require("./cronJob.middleware");
const {
  createCronJobSchema,
  updateCronJobSchema,
  cronJobIdParamSchema,
  cronJobHistoryQuerySchema,
  listCronJobsQuerySchema,
} = require("./cronJob.validator");
const { P } = require("../../config/permissions");

// --- Cron Job Routes ---

// GET / - Get all Cron Jobs
router.get(
  "/",
  validate(listCronJobsQuerySchema, "query"),
  authMiddleware.authorize(P.cronjob.list),
  cronJobController.getAllCronJobs
);

// GET /status/connections - Get all connection statuses
router.get(
  "/status/connections",
  authMiddleware.authorize(P.cronjob.list),
  cronJobController.getConnectionStatus
);

// POST / - Create a new Cron Job
router.post(
  "/",
  validate(createCronJobSchema, "body"),
  authMiddleware.authorize([
    P.cronjob.create,
    {
      ...P.workflow.execute,
      bodyKey: "workflowID",
    }
  ]),
  cronJobController.createCronJob
);

// GET /:cronJobID - Get a specific Cron Job
router.get(
  "/:cronJobID",
  validate(cronJobIdParamSchema, "params"),
  authMiddleware.authorize({
    ...P.cronjob.read,
    paramKey: "cronJobID",
  }),
  cronJobController.getCronJobByID
);

// PATCH /:cronJobID - Update a specific Cron Job
router.patch(
  "/:cronJobID",
  validateAll({
    params: cronJobIdParamSchema,
    body: updateCronJobSchema,
  }),
  authMiddleware.authorize([
    {
      ...P.cronjob.update,
      paramKey: "cronJobID",
    },
    {
      ...P.workflow.execute,
      bodyKey: "workflowID",
      skipIfMissing: true,
    }
  ]),
  cronJobController.updateCronJobByID
);

// DELETE /:cronJobID - Delete a specific Cron Job
router.delete(
  "/:cronJobID",
  validate(cronJobIdParamSchema, "params"),
  authMiddleware.authorize({
    ...P.cronjob.delete,
    paramKey: "cronJobID",
  }),
  cronJobController.deleteCronJobByID
);

// POST /:cronJobID/clone - Clone a specific Cron Job
router.post(
  "/:cronJobID/clone",
  validate(cronJobIdParamSchema, "params"),
  cronJobMiddleware.resolveWorkflowIDFromDB,
  authMiddleware.authorize([
    P.cronjob.create,
    { ...P.cronjob.read, paramKey: "cronJobID" },
    { ...P.workflow.execute, reqKey: "workflowID", skipIfMissing: true }
  ]),
  cronJobController.cloneCronJob
);


// --- Job History Routes ---

// GET /:cronJobID/history - Get history for a specific Cron Job (with pagination)
router.get(
  "/:cronJobID/history",
  validateAll({
    params: cronJobIdParamSchema,
    query: cronJobHistoryQuerySchema,
  }),
  authMiddleware.authorize({
    ...P.cronjob.read,
    paramKey: "cronJobID",
  }),
  cronJobController.getCronJobHistoryByID
);

module.exports = router;
