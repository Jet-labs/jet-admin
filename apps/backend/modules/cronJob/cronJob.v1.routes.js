const express = require("express");
const router = express.Router({ mergeParams: true });
const { cronJobController } = require("./cronJob.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  createCronJobSchema,
  updateCronJobSchema,
  cronJobIdParamSchema,
  cronJobHistoryQuerySchema,
} = require("./cronJob.validator");

// --- Cron Job Routes ---

// GET / - Get all Cron Jobs
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:cronjob:list"]),
  cronJobController.getAllCronJobs
);

// GET /status/connections - Get all connection statuses
router.get(
  "/status/connections",
  authMiddleware.checkUserPermissions(["tenant:cronjob:list"]),
  cronJobController.getConnectionStatus
);

// POST / - Create a new Cron Job
router.post(
  "/",
  validate(createCronJobSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:cronjob:create"]),
  cronJobController.createCronJob
);

// GET /:cronJobID - Get a specific Cron Job
router.get(
  "/:cronJobID",
  validate(cronJobIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:cronjob:read"]),
  cronJobController.getCronJobByID
);

// PATCH /:cronJobID - Update a specific Cron Job
router.patch(
  "/:cronJobID",
  validateAll({
    params: cronJobIdParamSchema,
    body: updateCronJobSchema,
  }),
  authMiddleware.checkUserPermissions(["tenant:cronjob:update"]),
  cronJobController.updateCronJobByID
);

// DELETE /:cronJobID - Delete a specific Cron Job
router.delete(
  "/:cronJobID",
  validate(cronJobIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:cronjob:delete"]),
  cronJobController.deleteCronJobByID
);

// POST /:cronJobID/clone - Clone a specific Cron Job
router.post(
  "/:cronJobID/clone",
  validate(cronJobIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:cronjob:create"]),
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
  authMiddleware.checkUserPermissions([
    "tenant:cronjob:read",
    "tenant:cronjob:history:read",
  ]),
  cronJobController.getCronJobHistoryByID
);

module.exports = router;
