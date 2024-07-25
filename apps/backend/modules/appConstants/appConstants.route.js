const express = require("express");
const { dbModel } = require("../../config/prisma");
const { authMiddleware } = require("../auth/auth.middleware");
const { policyMiddleware } = require("../policies/policy.middleware");
const { appConstantController } = require("./appConstants.controller");
const router = express.Router();

// get all data of table
router.get("/db_model", async (req, res) => {
  return res.json({
    success: true,
    constants: {
      db_model: dbModel,
    },
  });
});

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
  // dashboardAuthorizationMiddleware.populateAuthorizedDashboardsForRead,
  appConstantController.getAllAppConstants
);

module.exports = router;
