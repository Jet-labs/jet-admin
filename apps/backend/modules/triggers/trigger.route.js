const express = require("express");
const { authMiddleware } = require("../auth/auth.middleware");
const { policyMiddleware } = require("../policies/policy.middleware");
const { triggerController } = require("./trigger.controller");
const {
  triggerAuthorizationMiddleware,
} = require("./trigger.authorization.middleware");
const router = express.Router();

// get all data of table
router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  triggerAuthorizationMiddleware.populateAuthorizedTriggersForRead,
  triggerController.getAllTriggers
);
router.get(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  triggerAuthorizationMiddleware.populateAuthorizedTriggersForRead,
  triggerController.getTriggerByID
);
router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  triggerAuthorizationMiddleware.populateAuthorizedTriggersForAdd,
  triggerController.addTrigger
);
router.delete(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  triggerAuthorizationMiddleware.populateAuthorizedTriggersForDelete,
  triggerController.deleteTrigger
);

module.exports = router;
