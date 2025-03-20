const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseTriggerController } = require("./databaseTrigger.controller");
const { authMiddleware } = require("../auth/auth.middleware");

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:trigger:list"]),
  databaseTriggerController.getAllDatabaseTriggers
);
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:trigger:create"]),
  databaseTriggerController.createDatabaseTrigger
);
router.get(
  "/:databaseTableName/:databaseTriggerName/",
  authMiddleware.checkUserPermissions(["tenant:database:trigger:read"]),
  databaseTriggerController.getDatabaseTriggerByName
);
router.delete(
  "/:databaseTableName/:databaseTriggerName/",
  authMiddleware.checkUserPermissions(["tenant:database:trigger:delete"]),
  databaseTriggerController.deleteDatabaseTriggerByName
);


module.exports = router;
