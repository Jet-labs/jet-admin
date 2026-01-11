const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseFunctionController } = require("./databaseFunction.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { param, body } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// List all functions in schema
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:function:list"]),
  databaseFunctionController.getAllFunctions
);

// Create new function
router.post(
  "/",
  body("functionName").notEmpty().withMessage("functionName is required"),
  body("body").notEmpty().withMessage("body is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:function:create"]),
  databaseFunctionController.createFunction
);

// Get specific function details
router.get(
  "/:functionName",
  param("functionName")
    .notEmpty()
    .withMessage("functionName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:function:read"]),
  databaseFunctionController.getFunctionByName
);

// Update function
router.put(
  "/:functionName",
  param("functionName")
    .notEmpty()
    .withMessage("functionName is required"),
  body("body").notEmpty().withMessage("body is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:function:update"]),
  databaseFunctionController.updateFunction
);

// Delete function
router.delete(
  "/:functionName",
  param("functionName")
    .notEmpty()
    .withMessage("functionName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:function:delete"]),
  databaseFunctionController.deleteFunction
);

// Execute function
router.post(
  "/:functionName/execute",
  param("functionName")
    .notEmpty()
    .withMessage("functionName is required"),
  body("args")
    .optional()
    .isArray()
    .withMessage("args must be an array"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:function:execute"]),
  databaseFunctionController.executeFunction
);

module.exports = router;
