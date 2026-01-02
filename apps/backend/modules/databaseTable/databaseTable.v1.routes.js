const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseTableController } = require("./databaseTable.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
    createTableSchema,
    bulkRowSchema,
    tableNameParamSchema,
} = require("./databaseTable.validator");

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:table:list"]),
  databaseTableController.getAllDatabaseTables
);

router.post(
  "/",
    validate(createTableSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:database:table:create"]),
  databaseTableController.createDatabaseTable
);

router.get(
  "/:databaseTableName/",
    validate(tableNameParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:database:table:read"]),
  databaseTableController.getDatabaseTableByName
);

router.patch(
  "/:databaseTableName/",
    validate(tableNameParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:database:table:update"]),
  databaseTableController.updateDatabaseTableByName
);

router.delete(
  "/:databaseTableName/",
    validate(tableNameParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:database:table:update"]),
  databaseTableController.deleteDatabaseTableByName
);

router.get(
  "/:databaseTableName/rows",
    validate(tableNameParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:database:table:row:read"]),
  databaseTableController.getDatabaseTableRows
);

router.post(
  "/:databaseTableName/rows",
    validateAll({
        params: tableNameParamSchema,
        body: bulkRowSchema,
    }),
  authMiddleware.checkUserPermissions(["tenant:database:table:row:create"]),
  databaseTableController.databaseTableBulkRowAddition
);

router.patch(
  "/:databaseTableName/rows",
    validateAll({
        params: tableNameParamSchema,
        body: bulkRowSchema,
    }),
  authMiddleware.checkUserPermissions(["tenant:database:table:row:update"]),
  databaseTableController.databaseTableBulkRowUpdate
);

router.patch(
  "/:databaseTableName/rows/delete",
    validate(tableNameParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:database:table:row:delete"]),
  databaseTableController.databaseTableBulkRowDelete
);

router.patch(
  "/:databaseTableName/rows/export",
    validate(tableNameParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:database:table:row:export"]),
  databaseTableController.databaseTableBulkRowExport
);

router.get(
  "/:databaseTableName/statistics",
    validate(tableNameParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:database:table:stats"]),
  databaseTableController.getDatabaseTableStatistics
);

module.exports = router;
