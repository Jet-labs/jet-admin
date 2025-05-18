
const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const { authMiddleware } = require("../auth/auth.middleware");
const { auditController } = require("./audit.controller");

//auth routes

router.get(
  "/",
  authMiddleware.authProvider,
  auditController.getAuditLogsByTenantID
);

module.exports = router;
