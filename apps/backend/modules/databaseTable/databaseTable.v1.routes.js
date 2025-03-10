const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseTableController } = require("./databaseTable.controller");
const { authMiddleware } = require("../auth/auth.middleware");

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:table:list"]),
  databaseTableController.getAllDatabaseTables
);
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:table:create"]),
  databaseTableController.createDatabaseTable
);
router.get(
  "/:databaseTableName/",
  authMiddleware.checkUserPermissions(["tenant:database:table:read"]),
  databaseTableController.getDatabaseTableByName
);
router.patch(
  "/:databaseTableName/",
  authMiddleware.checkUserPermissions(["tenant:database:table:update"]),
  databaseTableController.updateDatabaseTableByName
);
router.delete(
  "/:databaseTableName/",
  authMiddleware.checkUserPermissions(["tenant:database:table:update"]),
  databaseTableController.deleteDatabaseTableByName
);
router.get(
  "/:databaseTableName/rows",
  authMiddleware.checkUserPermissions(["tenant:database:table:row:read"]),
  databaseTableController.getDatabaseTableRows
);
router.post(
  "/:databaseTableName/rows",
  authMiddleware.checkUserPermissions(["tenant:database:table:row:create"]),
  databaseTableController.databaseTableBulkRowAddition
);
router.patch(
  "/:databaseTableName/rows",
  authMiddleware.checkUserPermissions(["tenant:database:table:row:update"]),
  databaseTableController.databaseTableBulkRowUpdate
);
router.patch(
  "/:databaseTableName/rows/delete",
  authMiddleware.checkUserPermissions(["tenant:database:table:row:delete"]),
  databaseTableController.databaseTableBulkRowDelete
);
router.patch(
  "/:databaseTableName/rows/export",
  authMiddleware.checkUserPermissions(["tenant:database:table:row:export"]),
  databaseTableController.databaseTableBulkRowExport
);
router.get(
  "/:databaseTableName/statistics",
  authMiddleware.checkUserPermissions(["tenant:database:table:stats"]),
  databaseTableController.getDatabaseTableStatistics
);

module.exports = router;
