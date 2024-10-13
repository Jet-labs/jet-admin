const express = require("express");
const { dbModel } = require("../../db/prisma");
const { authMiddleware } = require("../auth/auth.middleware");
const { policyMiddleware } = require("../policies/policy.middleware");
const { appVariableController } = require("./app-variables.controller");
const {
  appVariableAuthorizationMiddleware,
} = require("./app-variables.authorization.middleware");
const router = express.Router();

router.get(
  "/internal",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  // dashboardAuthorizationMiddleware.populateAuthorizedDashboardsForRead,
  appVariableController.getAllInternalAppVariables
);

router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  appVariableAuthorizationMiddleware.populateAuthorizedAppVariablesForRead,
  appVariableController.getAllAppVariables
);
router.get(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  appVariableAuthorizationMiddleware.populateAuthorizedAppVariablesForRead,
  appVariableController.getAppVariableByID
);
router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  appVariableAuthorizationMiddleware.populateAuthorizationForAppVariableAddition,
  appVariableController.addAppVariable
);
router.put(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  appVariableAuthorizationMiddleware.populateAuthorizedAppVariablesForUpdate,
  appVariableController.updateAppVariable
);

router.delete(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  appVariableAuthorizationMiddleware.populateAuthorizedAppVariablesForDelete,
  appVariableController.deleteAppVariable
);

module.exports = router;
