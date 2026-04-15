const express = require("express");
const router = express.Router({ mergeParams: true });
const { subscriptionController } = require("./subscription.controller");

router.post("/", subscriptionController.createSubscription);
router.get("/", subscriptionController.getAllSubscriptions);
router.patch("/:subscriptionID", subscriptionController.updateSubscription);
router.delete("/:subscriptionID", subscriptionController.deleteSubscription);

module.exports = router;
