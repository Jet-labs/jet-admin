const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../auth/auth.middleware");
const { policyController } = require("./policy.controller");
const {
  policyAuthorizationMiddleware,
  policyMiddleware,
} = require("./policy.middleware");

//policy routes

router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  policyAuthorizationMiddleware.authorizedPoliciesForRead,
  policyController.getAllPolicies
);
router.get(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  policyAuthorizationMiddleware.authorizedPoliciesForRead,
  policyController.getPolicyByID
);
router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  policyAuthorizationMiddleware.authorizePolicyAddition,
  policyController.addPolicy
);
router.post(
  "/duplicate",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  policyAuthorizationMiddleware.authorizePolicyAddition,
  policyController.duplicatePolicy
);
router.put(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  policyAuthorizationMiddleware.authorizePolicyUpdate,
  policyController.updatePolicy
);
router.delete(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  policyAuthorizationMiddleware.authorizePolicyDeletion,
  policyController.deletePolicy
);

module.exports = router;
