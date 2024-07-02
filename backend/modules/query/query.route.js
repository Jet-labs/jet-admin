const express = require("express");
const { authMiddleware } = require("../auth/auth.middleware");
const { policyMiddleware } = require("../middlewares/policy.middleware");
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
  queryController.runPGQuery
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
// router.put(
//   "/",
//   authMiddleware.authProvider,
//   policyMiddleware.populateAuthorizationPolicies,
//   queryAuthorizationMiddleware.populateAuthorizedQueriesForUpdate,
//   queryController.updateQuery
// );

// router.delete(
//   "/:id",
//   authMiddleware.authProvider,
//   policyMiddleware.populateAuthorizationPolicies,
//   queryAuthorizationMiddleware.populateAuthorizedQueriesForDelete,
//   queryController.deleteQuery
// );

module.exports = router;
