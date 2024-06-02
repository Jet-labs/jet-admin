const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const tableController = require("../controllers/table.controller");
const {
  tableAuthorizationMiddleware,
} = require("../middlewares/table.authorization.middleware");
const { policyMiddleware } = require("../middlewares/policy.middleware");
const { dashboardController } = require("../controllers/dashboard.controller");
const {
  dashboardAuthorizationMiddleware,
} = require("../middlewares/dashboard.authorization.middleware");
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

module.exports = router;
