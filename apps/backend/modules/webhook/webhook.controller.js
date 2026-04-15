/**
 * Webhook Management Controller
 * Thin controller for CRUD — delegates to webhookService.
 */
const Logger = require("../../utils/logger");
const constants = require("../../constants");
const { webhookService } = require("./webhook.service");

const webhookMgmtController = {
  createWebhook: async (req, res) => {
    try {
      const { tenantID } = req.params;
      const { webhookTitle, webhookPath, authType, authConfig, status, workflows } = req.body;

      const webhook = await webhookService.createWebhook({
        tenantID, webhookTitle, webhookPath, authType, authConfig, status, workflows
      });

      res.status(201).json(webhook);
    } catch (err) {
      Logger.log("error", { message: "webhookMgmtController:create", params: { error: err.message } });
      res.status(500).json({ error: constants.ERROR_CODES.SERVER_ERROR });
    }
  },

  getAllWebhooks: async (req, res) => {
    try {
      const { tenantID } = req.params;
      const webhooks = await webhookService.getAllWebhooks({ tenantID });
      res.status(200).json(webhooks);
    } catch (err) {
      Logger.log("error", { message: "webhookMgmtController:getAll", params: { error: err.message } });
      res.status(500).json({ error: constants.ERROR_CODES.SERVER_ERROR });
    }
  },

  updateWebhook: async (req, res) => {
    try {
      const { tenantID, webhookID } = req.params;
      const { webhookTitle, webhookPath, authType, authConfig, status, workflows } = req.body;

      const webhook = await webhookService.updateWebhook({
        tenantID,
        webhookID,
        updateData: { webhookTitle, webhookPath, authType, authConfig, status },
        workflows
      });

      res.status(200).json(webhook);
    } catch (err) {
      Logger.log("error", { message: "webhookMgmtController:update", params: { error: err.message } });
      res.status(500).json({ error: constants.ERROR_CODES.SERVER_ERROR });
    }
  },

  deleteWebhook: async (req, res) => {
    try {
      const { tenantID, webhookID } = req.params;
      await webhookService.deleteWebhook({ tenantID, webhookID });
      res.status(200).json({ success: true });
    } catch (err) {
      Logger.log("error", { message: "webhookMgmtController:delete", params: { error: err.message } });
      res.status(500).json({ error: constants.ERROR_CODES.SERVER_ERROR });
    }
  }
};

module.exports = { webhookMgmtController };
