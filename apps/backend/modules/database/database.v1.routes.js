const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseController } = require("./database.controller");
const databaseTableRouter = require("../databaseTable/databaseTable.v1.routes");
const databaseTriggerRouter = require("../databaseTrigger/databaseTrigger.v1.routes");
const databaseViewRouter = require("../databaseView/databaseView.v1.routes");
const storedProcedureRouter = require("../storedProcedure/storedProcedure.v1.routes");
const databaseFunctionRouter = require("../databaseFunction/databaseFunction.v1.routes");
const databaseChatRouter = require("../databaseChat/databaseChat.v1.routes");
const { authMiddleware } = require("../auth/auth.middleware");
const { body } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// Database routes
router.get(
  "/metadata",
  authMiddleware.checkUserPermissions(["tenant:database:metadata"]),
  databaseController.getDatabaseMetadata
);
router.get(
  "/schemas/:databaseSchemaName/metadata",
  authMiddleware.checkUserPermissions(["tenant:database:metadata"]),
  databaseController.getDatabaseMetadataBySchema
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
router.use(
  "/schemas/:databaseSchemaName/views",
  authMiddleware.checkUserPermissions(["tenant:database:view"]),
  databaseViewRouter
);
router.use(
  "/schemas/:databaseSchemaName/procedures",
  authMiddleware.checkUserPermissions(["tenant:database:procedure"]),
  storedProcedureRouter
);
router.use(
  "/schemas/:databaseSchemaName/functions",
  authMiddleware.checkUserPermissions(["tenant:database:function"]),
  databaseFunctionRouter
);

// Database Chat routes
router.use(
  "/chat",
  databaseChatRouter
);

module.exports = router;
