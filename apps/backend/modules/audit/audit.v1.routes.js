
const express = require("express");
const router = express.Router({ mergeParams: true });
const { authMiddleware } = require("../auth/auth.middleware");
const { auditController } = require("./audit.controller");
const { validate } = require("../../utils/validation.utils");
const { listAuditLogsQuerySchema, exportAuditLogsQuerySchema } = require("./audit.validator");
const { P } = require("../../config/permissions");

// Export as CSV (server-side, full date range, no pagination)
router.get(
  "/export",
  validate(exportAuditLogsQuerySchema, "query"),
  authMiddleware.authorize(P.audit.list),
  auditController.exportAuditLogsCSV
);

// List audit logs (paginated)
router.get(
  "/",
  validate(listAuditLogsQuerySchema, "query"),
  authMiddleware.authorize(P.audit.list),
  auditController.getAuditLogsByTenantID
);

module.exports = router;
