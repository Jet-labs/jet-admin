const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseController } = require("./database.controller");
const databaseTableRouter = require("../databaseTable/databaseTable.v1.routes");
const databaseTriggerRouter = require("../databaseTrigger/databaseTrigger.v1.routes");
const databaseNotificationRouter = require("../databaseNotification/databaseNotification.v1.routes");
const { authMiddleware } = require("../auth/auth.middleware");

// Database routes
router.get(
  "/metadata",
  authMiddleware.checkUserPermissions(["tenant:database:metadata"]),
  databaseController.getDatabaseMetadata
);
router.post(
  "/schemas",
  authMiddleware.checkUserPermissions(["tenant:database:schema:create"]),
  databaseController.createDatabaseSchema
);
router.post(
  "/execute-raw-sql",
  authMiddleware.checkUserPermissions(["tenant:database:raw-sql:execute"]),
  databaseController.executeRawSQLQuery
);
router.use("/schemas/:databaseSchemaName/tables", databaseTableRouter);
router.use("/schemas/:databaseSchemaName/triggers", databaseTriggerRouter);
router.use("/notifications/", databaseNotificationRouter);

module.exports = router;
