const express = require("express");
const { authMiddleware } = require("../auth/auth.middleware");
const { policyMiddleware } = require("../policies/policy.middleware");
const { triggerChannelController } = require("./trigger_channel.controller");
const {
  triggerChannelAuthorizationMiddleware,
} = require("./trigger_channel.authorization.middleware");
const router = express.Router();

// get all data of table
router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  triggerChannelAuthorizationMiddleware.populateAuthorizedTriggerChannelsForRead,
  triggerChannelController.getAllTriggerChannels
);
router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  triggerChannelAuthorizationMiddleware.populateAuthorizedTriggerChannelsForAdd,
  triggerChannelController.addTriggerChannel
);
router.delete(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  triggerChannelAuthorizationMiddleware.populateAuthorizedTriggerChannelsForDelete,
  triggerChannelController.deleteTriggerChannel
);

module.exports = router;
