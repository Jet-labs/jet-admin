const express = require("express");
const { authMiddleware } = require("../auth/auth.middleware");
const { policyMiddleware } = require("../policies/policy.middleware");
const { schemaController } = require("./schema.controller");
const {
  schemaAuthorizationMiddleware,
} = require("./schema.authorization.middleware");
const router = express.Router();

// get all data of table
router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  schemaAuthorizationMiddleware.populateAuthorizedSchemasForRead,
  schemaController.getSchema
);
router.put(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  schemaAuthorizationMiddleware.populateAuthorizedSchemasForUpdate,
  schemaController.runSchemaQuery
);

module.exports = router;
