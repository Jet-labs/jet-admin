const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseTableController } = require("./databaseTable.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:table:list"]),
  databaseTableController.getAllDatabaseTables
);
router.post(
  "/",
  body("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:table:create"]),
  databaseTableController.createDatabaseTable
);
router.get(
  "/:databaseTableName/",
  param("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:table:read"]),
  databaseTableController.getDatabaseTableByName
);
router.patch(
  "/:databaseTableName/",
  param("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:table:update"]),
  databaseTableController.updateDatabaseTableByName
);
router.delete(
  "/:databaseTableName/",
  param("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:table:update"]),
  databaseTableController.deleteDatabaseTableByName
);
router.get(
  "/:databaseTableName/rows",
  param("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:table:row:read"]),
  databaseTableController.getDatabaseTableRows
);
router.post(
  "/:databaseTableName/rows",
  param("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  body("databaseTableRowData")
    .isArray()
    .withMessage("databaseTableRowData is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:table:row:create"]),
  databaseTableController.databaseTableBulkRowAddition
);
router.patch(
  "/:databaseTableName/rows",
  param("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  body("databaseTableRowData")
    .isArray()
    .withMessage("databaseTableRowData is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:table:row:update"]),
  databaseTableController.databaseTableBulkRowUpdate
);
router.patch(
  "/:databaseTableName/rows/delete",
  param("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:table:row:delete"]),
  databaseTableController.databaseTableBulkRowDelete
);
router.patch(
  "/:databaseTableName/rows/export",
  param("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:table:row:export"]),
  databaseTableController.databaseTableBulkRowExport
);
router.get(
  "/:databaseTableName/statistics",
  param("databaseTableName")
    .notEmpty()
    .withMessage("databaseTableName is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database:table:stats"]),
  databaseTableController.getDatabaseTableStatistics
);

module.exports = router;
