const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseController } = require("./database.controller");
const databaseTableRouter = require("../databaseTable/databaseTable.v1.routes");
const databaseTriggerRouter = require("../databaseTrigger/databaseTrigger.v1.routes");
const databaseNotificationRouter = require("../databaseNotification/databaseNotification.v1.routes");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate } = require("../../utils/validation.utils");
const {
  createSchemaSchema,
  executeRawSqlSchema,
} = require("./database.validator");

// Database routes
router.get(
  "/metadata",
  authMiddleware.checkUserPermissions(["tenant:database:metadata"]),
  databaseController.getDatabaseMetadata
);

router.post(
  "/schemas",
  validate(createSchemaSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:database:schema:create"]),
  databaseController.createDatabaseSchema
);

router.post(
  "/execute-raw-sql",
  validate(executeRawSqlSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:database:raw-sql:execute"]),
  databaseController.executeRawSQLQuery
);

router.use(
  "/schemas/:databaseSchemaName/tables",
  authMiddleware.checkUserPermissions(["tenant:database:table"]),
  databaseTableRouter
);

router.use(
  "/schemas/:databaseSchemaName/triggers",
  authMiddleware.checkUserPermissions(["tenant:database:trigger"]),
  databaseTriggerRouter
);

// router.use(
//   "/notifications/",
//   authMiddleware.checkUserPermissions(["tenant:database:notification"]),
//   databaseNotificationRouter
// );

module.exports = router;
