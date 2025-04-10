const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseController } = require("./database.controller");
const databaseTableRouter = require("../databaseTable/databaseTable.v1.routes");
const databaseTriggerRouter = require("../databaseTrigger/databaseTrigger.v1.routes");
const databaseNotificationRouter = require("../databaseNotification/databaseNotification.v1.routes");
const { authMiddleware } = require("../auth/auth.middleware");
const { body } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// Database routes
router.get(
  "/metadata",
  authMiddleware.checkUserPermissions(["tenant:database:metadata"]),
  databaseController.getDatabaseMetadata
);
router.post(
  "/schemas",
  body("databaseSchemaName")
    .notEmpty()
    .withMessage("databaseSchemaName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:schema:create"]),
  databaseController.createDatabaseSchema
);
router.post(
  "/execute-raw-sql",
  body("query").notEmpty().withMessage("query is required"),
  expressUtils.validationChecker,
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
