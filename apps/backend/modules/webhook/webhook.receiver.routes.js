const express = require("express");
const router = express.Router({ mergeParams: true });
const { webhookReceiverController } = require("./webhook.receiver.controller");

// The wildcard route handles all dynamic webhook endpoints.
// Example: POST /api/v1/webhooks/:tenantID/github
router.all("/:tenantID/*", webhookReceiverController.handleIncomingWebhook);

module.exports = router;
