const express = require("express");
const { authMiddleware } = require("../auth/auth.middleware");
const tableController = require("./table.controller");
const {
  tableAuthorizationMiddleware,
} = require("./table.authorization.middleware");
const { policyMiddleware } = require("../policies/policy.middleware");
const router = express.Router();

router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  tableController.getAllTablesForRead
);


router.get(
  "/:table_name/read_columns",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  tableController.getAuthorizedColumnsForRead
);

router.get(
  "/:table_name/edit_columns",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  tableController.getAuthorizedColumnsForUpdate
);

router.get(
  "/:table_name/add_columns",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.authorizeRowAddition,
  tableController.getAuthorizedColumnsForAdd
);

router.get(
  "/:table_name",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.populateAuthorizedRowsForRead,
  tableAuthorizationMiddleware.populateAuthorizedColumnsForRead,
  tableAuthorizationMiddleware.populateAuthorizedIncludeColumnsForRead,
  tableController.getAllRows
);

router.get(
  "/:table_name/stats",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.populateAuthorizedRowsForRead,
  tableAuthorizationMiddleware.populateAuthorizedColumnsForRead,
  tableController.getTableStatistics
);

router.get(
  "/:table_name/:query",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.populateAuthorizedRowsForRead,
  tableAuthorizationMiddleware.populateAuthorizedColumnsForRead,
  tableAuthorizationMiddleware.populateAuthorizedIncludeColumnsForRead,
  tableController.getRowByID
);

router.put(
  "/:table_name/:query",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.authorizeRowUpdate,
  tableAuthorizationMiddleware.authorizeColumnUpdate,
  tableController.updateRowByID
);

router.post(
  "/:table_name/delete",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.authorizeRowDeletion,
  tableController.deleteRowByMultipleIDs
);

router.post(
  "/:table_name/export",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.populateAuthorizedRowsForRead,
  tableController.exportRowByMultipleIDs
);

router.post(
  "/:table_name",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.authorizeRowAddition,
  tableController.addRowByID
);

router.delete(
  "/:table_name/:query",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.authorizeRowDeletion,
  tableController.deleteRowByID
);



module.exports = router;
