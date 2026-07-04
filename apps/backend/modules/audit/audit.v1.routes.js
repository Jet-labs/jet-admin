
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../auth/auth.middleware");
const { auditController } = require("./audit.controller");
const { validate } = require("../../utils/validation.utils");
const { listAuditLogsQuerySchema } = require("./audit.validator");
const { P } = require("../../config/permissions");

//auth routes

router.get(
  "/",
  validate(listAuditLogsQuerySchema, "query"),
  authMiddleware.authorize(P.audit.list),
  auditController.getAuditLogsByTenantID
);

module.exports = router;
