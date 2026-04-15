const express = require("express");
const router = express.Router({ mergeParams: true });
const { webhookMgmtController } = require("./webhook.controller");

router.post("/", webhookMgmtController.createWebhook);
router.get("/", webhookMgmtController.getAllWebhooks);
router.patch("/:webhookID", webhookMgmtController.updateWebhook);
router.delete("/:webhookID", webhookMgmtController.deleteWebhook);

module.exports = router;
