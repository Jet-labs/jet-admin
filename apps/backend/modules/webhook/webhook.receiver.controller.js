/**
 * Webhook Receiver Controller
 * Thin controller — extracts request params and delegates to WebhookEngine.
 */
const Logger = require("../../utils/logger");
const constants = require("../../constants");
const webhookEngine = require("./webhookEngine/engine");

const webhookReceiverController = {
  handleIncomingWebhook: async (req, res) => {
    const { tenantID } = req.params;
    const webhookPath = req.params[0];

    try {
      const result = await webhookEngine.processIncomingWebhook({
        tenantID,
        webhookPath,
        headers: req.headers,
        query: req.query,
        body: req.body,
        method: req.method,
      });

      res.status(result.status).json(result.body);
    } catch (error) {
      Logger.log("error", {
        message: "webhookReceiverController:handleError",
        params: { error: error.message }
      });
      if (!res.headersSent) {
        res.status(500).json({ error: constants.ERROR_CODES.SERVER_ERROR });
      }
    }
  }
};

module.exports = { webhookReceiverController };
