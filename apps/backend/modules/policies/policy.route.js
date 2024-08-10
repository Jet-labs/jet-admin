const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../auth/auth.middleware");
const { policyController } = require("./policy.controller");

//policy routes

router.get("/", authMiddleware.authProvider, policyController.getAllPolicies);
router.get("/:id", authMiddleware.authProvider, policyController.getPolicyByID);
router.post("/", authMiddleware.authProvider, policyController.addPolicy);
router.put("/", authMiddleware.authProvider, policyController.updatePolicy);
router.delete(
  "/:id",
  authMiddleware.authProvider,
  policyController.deletePolicy
);

module.exports = router;
