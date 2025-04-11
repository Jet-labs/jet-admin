const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseQueryController } = require("./databaseQuery.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// Database query routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:query:list"]),
  databaseQueryController.getAllDatabaseQueries
);
router.post(
  "/",
  body("databaseQueryData")
    .notEmpty()
    .withMessage("databaseQueryData is required"),
  body("databaseQueryTitle")
    .notEmpty()
    .withMessage("databaseQueryTitle is required"),
  body("databaseQueryDescription")
    .optional()
    .isString()
    .withMessage("databaseQueryDescription must be a string"),
  body("runOnLoad").optional().isBoolean().withMessage("runOnLoad is required"),
  expressUtils.validationChecker,
  authMiddleware.authProvider,
  authMiddleware.checkUserPermissions(["tenant:query:create"]),
  databaseQueryController.createDatabaseQuery
);
router.patch(
  "/queryTest",
  body("databaseQueryData")
    .notEmpty()
    .withMessage("databaseQueryData is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:test"]),
  databaseQueryController.runDatabaseQuery
);

router.patch(
  "/generate",
  body("aiPrompt").notEmpty().withMessage("aiPrompt is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:test"]),
  databaseQueryController.generateAIPromptBasedQuery
);
router.get(
  "/:databaseQueryID",
  param("databaseQueryID")
    .isNumeric()
    .withMessage("databaseQueryID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:read"]),
  databaseQueryController.getDatabaseQueryByID
);
router.get(
  "/:databaseQueryID/queryTest",
  param("databaseQueryID")
    .isNumeric()
    .withMessage("databaseQueryID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:test"]),
  databaseQueryController.runDatabaseQueryByID
);
router.patch(
  "/:databaseQueryID",
  param("databaseQueryID")
    .isNumeric()
    .withMessage("databaseQueryID must be a number"),
  body("databaseQueryData")
    .notEmpty()
    .withMessage("databaseQueryData is required"),
  body("databaseQueryTitle")
    .notEmpty()
    .withMessage("databaseQueryTitle is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:update"]),
  databaseQueryController.updateDatabaseQueryByID
);
router.delete(
  "/:databaseQueryID",
  param("databaseQueryID")
    .isNumeric()
    .withMessage("databaseQueryID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:delete"]),
  databaseQueryController.deleteDatabaseQueryByID
);

module.exports = router;
