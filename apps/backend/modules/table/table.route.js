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
  tableController.getTables
);

router.get(
  "/:table_name/columns",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  tableController.getTableColumns
);

router.get(
  "/:table_name/pkey",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  tableController.getTablePrimaryKey
);

router.get(
  "/:table_name",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.authorizeRowRead,
  tableController.getAllRows
);

router.get(
  "/:table_name/stats",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.authorizeRowRead,
  tableController.getTableStatistics
);

router.get(
  "/:table_name/:query",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.authorizeRowRead,
  tableController.getRowByID
);

router.put(
  "/:table_name/:query",
  authMiddleware.authProvider,
  // tableAuthorizationMiddleware.isAuthorized,
  policyMiddleware.populateAuthorizationPolicies,
  tableAuthorizationMiddleware.authorizeRowUpdate,
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
  tableAuthorizationMiddleware.authorizeRowRead,
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
