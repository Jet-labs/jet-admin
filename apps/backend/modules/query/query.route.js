const express = require("express");
const { authMiddleware } = require("../auth/auth.middleware");
const { policyMiddleware } = require("../policies/policy.middleware");
const { queryController } = require("./query.controller");
const {
  queryAuthorizationMiddleware,
} = require("./query.authorization.middleware");
const router = express.Router();

// get all data of table
router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  queryAuthorizationMiddleware.populateAuthorizedQueriesForRead,
  queryController.getAllQueries
);
router.post(
  "/runner",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  // queryAuthorizationMiddleware.populateAuthorizedQueriesForRead,
  queryController.runQuery
);
router.post(
  "/duplicate",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  queryAuthorizationMiddleware.populateAuthorizationForQueryAddition,
  queryController.duplicateQuery
);
router.get(
  "/:id/runner",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  queryAuthorizationMiddleware.populateAuthorizedQueriesForRead,
  queryController.runQueryByID
);
router.get(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  queryAuthorizationMiddleware.populateAuthorizedQueriesForRead,
  queryController.getQueryByID
);
router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  queryAuthorizationMiddleware.populateAuthorizationForQueryAddition,
  queryController.addQuery
);
router.put(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  queryAuthorizationMiddleware.populateAuthorizedQueriesForUpdate,
  queryController.updateQuery
);

router.delete(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  queryAuthorizationMiddleware.populateAuthorizedQueriesForDelete,
  queryController.deleteQuery
);

module.exports = router;
