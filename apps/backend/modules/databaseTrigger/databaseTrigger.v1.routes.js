const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseTriggerController } = require("./databaseTrigger.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate } = require("../../utils/validation.utils");
const {
    createTriggerSchema,
    triggerParamSchema,
} = require("./databaseTrigger.validator");

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:trigger:list"]),
  databaseTriggerController.getAllDatabaseTriggers
);

router.post(
  "/",
    validate(createTriggerSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:database:trigger:create"]),
  databaseTriggerController.createDatabaseTrigger
);

router.get(
  "/:databaseTableName/:databaseTriggerName/",
    validate(triggerParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:database:trigger:read"]),
  databaseTriggerController.getDatabaseTriggerByName
);

router.delete(
  "/:databaseTableName/:databaseTriggerName/",
    validate(triggerParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:database:trigger:delete"]),
  databaseTriggerController.deleteDatabaseTriggerByName
);

module.exports = router;
