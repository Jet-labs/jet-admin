const express = require("express");
const { authMiddleware } = require("../auth/auth.middleware");
const { policyMiddleware } = require("../middlewares/policy.middleware");
const { dashboardController } = require("./dashboard.controller");
const {
  dashboardAuthorizationMiddleware,
} = require("./dashboard.authorization.middleware");
const router = express.Router();

// get all data of table
router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  dashboardAuthorizationMiddleware.populateAuthorizedDashboardsForRead,
  dashboardController.getAllDashboards
);
router.get(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  dashboardAuthorizationMiddleware.populateAuthorizedDashboardsForRead,
  dashboardController.getDashboardByID
);
router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  dashboardAuthorizationMiddleware.populateAuthorizationForDashboardAddition,
  dashboardController.addDashboard
);
router.put(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  dashboardAuthorizationMiddleware.populateAuthorizedDashboardsForUpdate,
  dashboardController.updateDashboard
);

router.delete(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  dashboardAuthorizationMiddleware.populateAuthorizedDashboardsForDelete,
  dashboardController.deleteDashboard
);

module.exports = router;
