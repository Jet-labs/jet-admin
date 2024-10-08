const express = require("express");
const { dbModel } = require("../../db/prisma");
const { authMiddleware } = require("../auth/auth.middleware");
const { policyMiddleware } = require("../policies/policy.middleware");
const { appConstantController } = require("./app-constants.controller");
const {
  appConstantAuthorizationMiddleware,
} = require("./app-constants.authorization.middleware");
const router = express.Router();

router.get(
  "/internal",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  // dashboardAuthorizationMiddleware.populateAuthorizedDashboardsForRead,
  appConstantController.getAllInternalAppConstants
);

router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  appConstantAuthorizationMiddleware.populateAuthorizedAppConstantsForRead,
  appConstantController.getAllAppConstants
);
router.get(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  appConstantAuthorizationMiddleware.populateAuthorizedAppConstantsForRead,
  appConstantController.getAppConstantByID
);
router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  appConstantAuthorizationMiddleware.populateAuthorizationForAppConstantAddition,
  appConstantController.addAppConstant
);
router.put(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  appConstantAuthorizationMiddleware.populateAuthorizedAppConstantsForUpdate,
  appConstantController.updateAppConstant
);

router.delete(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  appConstantAuthorizationMiddleware.populateAuthorizedAppConstantsForDelete,
  appConstantController.deleteAppConstant
);

module.exports = router;
