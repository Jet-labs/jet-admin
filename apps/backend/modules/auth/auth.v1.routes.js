const express = require("express");
const router = express.Router();
const { authController } = require("./auth.controller");
const { authMiddleware } = require("./auth.middleware");
const { auditLogMiddleware } = require("../audit/audit.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const { updateConfigSchema, tenantIdParamSchema } = require("./auth.validator");

//auth routes

router.get(
  "/",
  authMiddleware.authProvider,
  auditLogMiddleware.audit,
  authController.getUserInfo
);

router.get(
  "/config/:tenantID",
  validate(tenantIdParamSchema, "params"),
  authMiddleware.authProvider,
  authController.getUserConfig
);

router.post(
  "/config/:tenantID",
  validateAll({
    params: tenantIdParamSchema,
    body: updateConfigSchema,
  }),
  authMiddleware.authProvider,
  auditLogMiddleware.audit,
  authController.updateUserConfig
);

module.exports = router;
