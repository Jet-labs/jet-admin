const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseTriggerController } = require("./databaseTrigger.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:trigger:list"]),
  databaseTriggerController.getAllDatabaseTriggers
);
router.post(
  "/",
  body("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  body("databaseTriggerName")
    .notEmpty()
    .withMessage("databaseTriggerName is required"),
  body("triggerTiming").notEmpty().withMessage("triggerTiming is required"),
  body("triggerEvents").notEmpty().withMessage("triggerEvents is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:trigger:create"]),
  databaseTriggerController.createDatabaseTrigger
);
router.get(
  "/:databaseTableName/:databaseTriggerName/",
  param("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  param("databaseTriggerName")
    .notEmpty()
    .withMessage("databaseTriggerName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:trigger:read"]),
  databaseTriggerController.getDatabaseTriggerByName
);
router.delete(
  "/:databaseTableName/:databaseTriggerName/",
  param("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  param("databaseTriggerName")
    .notEmpty()
    .withMessage("databaseTriggerName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:trigger:delete"]),
  databaseTriggerController.deleteDatabaseTriggerByName
);

module.exports = router;
