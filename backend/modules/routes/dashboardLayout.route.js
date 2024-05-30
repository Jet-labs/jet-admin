const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const tableController = require("../controllers/table.controller");
const {
  tableAuthorizationMiddleware,
} = require("../middlewares/table.authorization.middleware");
const { policyMiddleware } = require("../middlewares/policy.middleware");
const {
  dashboardLayoutController,
} = require("../controllers/dashboardLayout.controller");
const {
  dashboardLayoutAuthorizationMiddleware,
} = require("../middlewares/dashboardLayout.authorization.middleware");
const router = express.Router();

// get all data of table
router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  dashboardLayoutAuthorizationMiddleware.populateAuthorizedDashboardLayoutsForRead,
  dashboardLayoutController.getAllDashboardLayouts
);
router.get(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  dashboardLayoutAuthorizationMiddleware.populateAuthorizedDashboardLayoutsForRead,
  dashboardLayoutController.getDashboardLayoutByID
);
router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  dashboardLayoutAuthorizationMiddleware.populateAuthorizationForDashboardLayoutAddition,
  dashboardLayoutController.addDashboardLayout
);
router.put(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  dashboardLayoutAuthorizationMiddleware.populateAuthorizedDashboardLayoutsForUpdate,
  dashboardLayoutController.updateDashboardLayout
);

module.exports = router;
