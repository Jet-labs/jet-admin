const Logger = require("../../utils/logger");
const constants = require("../../constants");
const { subscriptionService } = require("./subscription.service");

const subscriptionController = {
  createSubscription: async (req, res) => {
    try {
      const { tenantID } = req.params;
      const { datasourceID, subscriptionTitle, subscriptionType, subscriptionConfig, status, workflows } = req.body;

      const subscription = await subscriptionService.createSubscription({
        tenantID,
        datasourceID,
        subscriptionTitle,
        subscriptionType,
        subscriptionConfig,
        status,
        workflows
      });

      res.status(201).json(subscription);
    } catch (err) {
      Logger.log("error", { message: "subscriptionController:create", params: { error: err.message } });
      res.status(500).json({ error: constants.ERROR_CODES.SERVER_ERROR });
    }
  },

  getAllSubscriptions: async (req, res) => {
    try {
      const { tenantID } = req.params;
      const subscriptions = await subscriptionService.getAllSubscriptions({ tenantID });
      res.status(200).json(subscriptions);
    } catch (err) {
      Logger.log("error", { message: "subscriptionController:getAll", params: { error: err.message } });
      res.status(500).json({ error: constants.ERROR_CODES.SERVER_ERROR });
    }
  },

  updateSubscription: async (req, res) => {
    try {
      const { tenantID, subscriptionID } = req.params;
      const { subscriptionTitle, subscriptionConfig, status, workflows } = req.body;

      const subscription = await subscriptionService.updateSubscription({
        tenantID,
        subscriptionID,
        updateData: { subscriptionTitle, subscriptionConfig, status },
        workflows
      });

      res.status(200).json(subscription);
    } catch (err) {
      Logger.log("error", { message: "subscriptionController:update", params: { error: err.message } });
      res.status(500).json({ error: constants.ERROR_CODES.SERVER_ERROR });
    }
  },

  deleteSubscription: async (req, res) => {
    try {
      const { tenantID, subscriptionID } = req.params;
      await subscriptionService.deleteSubscription({ tenantID, subscriptionID });
      res.status(200).json({ success: true });
    } catch (err) {
      Logger.log("error", { message: "subscriptionController:delete", params: { error: err.message } });
      res.status(500).json({ error: constants.ERROR_CODES.SERVER_ERROR });
    }
  }
};

module.exports = { subscriptionController };
