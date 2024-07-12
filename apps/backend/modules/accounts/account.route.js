const express = require("express");
const { authMiddleware } = require("../auth/auth.middleware");
const {
  accountAuthorizationMiddleware,
} = require("./account.authorization.middleware");

const { policyMiddleware } = require("../policies/policy.middleware");
const { accountController } = require("./account.controller");
const router = express.Router();

router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  accountAuthorizationMiddleware.authorizeAccountAddition,
  accountController.addAccount
);
router.put(
  "/password",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  accountAuthorizationMiddleware.authorizeAccountUpdate,
  accountController.updatePassword
);
router.put(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  accountAuthorizationMiddleware.authorizeAccountUpdate,
  accountController.updateAccount
);



module.exports = router;
