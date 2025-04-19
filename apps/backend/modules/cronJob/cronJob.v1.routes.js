const express = require("express");
const router = express.Router({ mergeParams: true }); // Ensure mergeParams if nested
const { cronJobController } = require("./cronJob.controller");
const { authMiddleware } = require("../auth/auth.middleware"); // Adjust path as needed
const { body, param, query } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils"); // Adjust path as needed

// --- Cron Job Routes ---

// GET / - Get all Cron Jobs
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:cronjob:list"]), // Define appropriate permission
  cronJobController.getAllCronJobs
);

// POST / - Create a new Cron Job
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:cronjob:create"]), // Define appropriate permission
  [
    // Validation middleware
    body("cronJobTitle")
      .notEmpty()
      .withMessage("cronJobTitle is required")
      .isString(),
    body("cronJobDescription").optional().isString(),
    body("databaseQueryID")
      .notEmpty()
      .withMessage("databaseQueryID is required")
      .isString(),
    body("cronJobSchedule")
      .notEmpty()
      .withMessage("cronJobSchedule is required")
      .isString()
      // Basic cron validation (adjust regex as needed for complexity)
      .matches(
        /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) (\*|([0-6])|\*\/([0-6])|sun|mon|tue|wed|thu|fri|sat)$/i
      )
      .withMessage(
        'cronSchedule must be a valid cron string (e.g., "*/5 * * * *")'
      ),
    body("isDisabled")
      .optional()
      .isBoolean()
      .withMessage("isDisabled must be a boolean"),
    body("timeoutSeconds")
      .optional()
      .isInt({ min: 1 })
      .withMessage("timeoutSeconds must be a positive integer"),
    body("retryAttempts")
      .optional()
      .isInt({ min: 0 })
      .withMessage("retryAttempts must be a non-negative integer"),
    body("retryDelaySeconds")
      .optional()
      .isInt({ min: 1 })
      .withMessage("retryDelaySeconds must be a positive integer"),
  ],
  expressUtils.validationChecker, // Check validation results
  cronJobController.createCronJob
);



// GET /:cronJobID - Get a specific Cron Job
router.get(
  "/:cronJobID",
  authMiddleware.checkUserPermissions(["tenant:cronjob:read"]), // Define appropriate permission
  [
    param("cronJobID")
      .isNumeric()
      .withMessage("cronJobID must be a number in the URL parameter"),
  ],
  expressUtils.validationChecker,
  cronJobController.getCronJobByID
);

// PATCH /:cronJobID - Update a specific Cron Job
router.patch(
  "/:cronJobID",
  authMiddleware.checkUserPermissions(["tenant:cronjob:update"]), // Define appropriate permission
  [
    // Validation middleware
    param("cronJobID")
      .isNumeric()
      .withMessage("cronJobID must be a number in the URL parameter"),
    // Validate fields if they are present in the body (use optional())
    body("cronJobTitle")
      .notEmpty()
      .withMessage("cronJobTitle is required")
      .isString(),
    body("cronJobDescription").optional().isString(),
    body("databaseQueryID")
      .notEmpty()
      .withMessage("databaseQueryID is required")
      .isNumeric(),
    body("cronJobSchedule")
      .notEmpty()
      .withMessage("cronJobSchedule is required")
      .isString()
      // Basic cron validation (adjust regex as needed for complexity)
      .matches(
        /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) (\*|([0-6])|\*\/([0-6])|sun|mon|tue|wed|thu|fri|sat)$/i
      )
      .withMessage(
        'cronSchedule must be a valid cron string (e.g., "*/5 * * * *")'
      ),
    body("isDisabled")
      .optional()
      .isBoolean()
      .withMessage("isDisabled must be a boolean if provided"),
    body("timeoutSeconds")
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage("timeoutSeconds must be a positive integer if provided"),
    body("retryAttempts")
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage("retryAttempts must be a non-negative integer if provided"),
    body("retryDelaySeconds")
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage("retryDelaySeconds must be a positive integer if provided"),
  ],
  expressUtils.validationChecker,
  cronJobController.updateCronJobByID
);

// DELETE /:cronJobID - Delete a specific Cron Job
router.delete(
  "/:cronJobID",
  authMiddleware.checkUserPermissions(["tenant:cronjob:delete"]), // Define appropriate permission
  [
    param("cronJobID")
      .isNumeric()
      .withMessage("cronJobID must be a number in the URL parameter"),
  ],
  expressUtils.validationChecker,
  cronJobController.deleteCronJobByID
);

// --- Job History Routes ---

// GET /:cronJobID/history - Get history for a specific Cron Job (with pagination)
router.get(
  "/:cronJobID/history",
  authMiddleware.checkUserPermissions([
    "tenant:cronjob:read",
    "tenant:cronjob:history:read",
  ]), // Or just tenant:cronjob:read
  [
    param("cronJobID").isNumeric().withMessage("cronJobID parameter must be a number"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("page query parameter must be a positive integer"),
    query("pageSize")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("pageSize query parameter must be between 1 and 100"), // Add reasonable limit
  ],
  expressUtils.validationChecker,
  cronJobController.getCronJobHistoryByID
);

module.exports = router; // Use module.exports for CommonJS
// Or export default router; for ES Modules if your project is set up for it.
