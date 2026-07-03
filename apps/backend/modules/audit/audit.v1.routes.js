
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../auth/auth.middleware");
const { auditController } = require("./audit.controller");
const { validate } = require("../../utils/validation.utils");
const { listAuditLogsQuerySchema } = require("./audit.validator");

//auth routes

router.get(
  "/",
  validate(listAuditLogsQuerySchema, "query"),
  authMiddleware.authorize("audit", "list"),
  auditController.getAuditLogsByTenantID
);

module.exports = router;
