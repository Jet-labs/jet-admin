const express = require("express");
const { authMiddleware } = require("../auth/auth.middleware");
const {
  accountAuthorizationMiddleware,
} = require("./account.authorization.middleware");

const { policyMiddleware } = require("../policies/policy.middleware");
const { accountController } = require("./account.controller");
const router = express.Router();

router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  accountAuthorizationMiddleware.authorizedAccountsForRead,
  accountController.getAllAccounts
);

router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  accountAuthorizationMiddleware.authorizeAccountAddition,
  accountController.addAccount
);
router.put(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  accountAuthorizationMiddleware.authorizeAccountUpdate,
  accountController.updateAccount
);
router.get(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  accountAuthorizationMiddleware.authorizedAccountsForRead,
  accountController.getAccountByID
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

router.delete(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  accountAuthorizationMiddleware.authorizeAccountDeletion,
  accountController.deleteAccount
);



module.exports = router;
