const express = require("express");
const router = express.Router({ mergeParams: true });
const { storedProcedureController } = require("./storedProcedure.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { param, body } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// List all stored procedures in schema
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:procedure:list"]),
  storedProcedureController.getAllStoredProcedures
);

// Create new stored procedure
router.post(
  "/",
  body("procedureName").notEmpty().withMessage("procedureName is required"),
  body("body").notEmpty().withMessage("body is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:procedure:create"]),
  storedProcedureController.createStoredProcedure
);

// Get specific stored procedure details
router.get(
  "/:procedureName",
  param("procedureName")
    .notEmpty()
    .withMessage("procedureName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:procedure:read"]),
  storedProcedureController.getStoredProcedureByName
);

// Update stored procedure
router.put(
  "/:procedureName",
  param("procedureName")
    .notEmpty()
    .withMessage("procedureName is required"),
  body("body").notEmpty().withMessage("body is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:procedure:update"]),
  storedProcedureController.updateStoredProcedure
);

// Delete stored procedure
router.delete(
  "/:procedureName",
  param("procedureName")
    .notEmpty()
    .withMessage("procedureName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:procedure:delete"]),
  storedProcedureController.deleteStoredProcedure
);

// Execute stored procedure
router.post(
  "/:procedureName/execute",
  param("procedureName")
    .notEmpty()
    .withMessage("procedureName is required"),
  body("args")
    .optional()
    .isArray()
    .withMessage("args must be an array"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:procedure:execute"]),
  storedProcedureController.executeStoredProcedure
);

module.exports = router;

