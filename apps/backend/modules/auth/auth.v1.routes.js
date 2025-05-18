
const express = require("express");
const router = express.Router();
const { authController } = require("./auth.controller");
const { authMiddleware } = require("./auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");
const { auditLogMiddleware } = require("../audit/audit.middleware");

//auth routes

router.get(
  "/",
  authMiddleware.authProvider,
  auditLogMiddleware.audit,
  authController.getUserInfo
);
router.get(
  "/config/:tenantID",
  param("tenantID").isInt().withMessage("Invalid tenantID"),
  expressUtils.validationChecker,
  authMiddleware.authProvider,
  authController.getUserConfig
);
router.post(
  "/config/:tenantID",
  param("tenantID").isInt().withMessage("Invalid tenantID"),
  body("config").notEmpty().withMessage("config is required"),
  expressUtils.validationChecker,
  authMiddleware.authProvider,
  auditLogMiddleware.audit,
  authController.updateUserConfig
);
module.exports = router;
