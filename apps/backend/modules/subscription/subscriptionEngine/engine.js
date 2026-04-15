const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
const Logger = require("../../../utils/logger");
const workflowService = require("../../workflow/workflow.service");

class SubscriptionEngine {
  constructor() {
    this.handles = new Map(); // Maps subscriptionID -> { instance, handle }
  }

  async startSubscription(subscription) {
    Logger.log("info", { message: "SubscriptionEngine:startSubscription:init", params: { subscriptionID: subscription.subscriptionID } });

    try {
      const datasourceConfig = subscription.tblDatasources;
      if (!datasourceConfig) throw new Error("Missing datasource configuration");

      const DataSource = dataSourceRegistry.getDataSource(datasourceConfig.datasourceType);
      if (!DataSource) throw new Error(`Unknown datasource type: ${datasourceConfig.datasourceType}`);

      const instance = new DataSource(datasourceConfig);

      const handle = await instance.subscribe(
        subscription.subscriptionConfig,
        async (eventPayload) => {
          // Inner listener logic
          await this.processEvent(subscription, eventPayload);
        }
      );

      this.handles.set(subscription.subscriptionID, { instance, handle });

      Logger.log("success", { 
        message: "SubscriptionEngine:startSubscription:success", 
        params: { subscriptionID: subscription.subscriptionID }
      });
    } catch (error) {
      Logger.log("error", {
        message: "SubscriptionEngine:startSubscription:error",
        params: { subscriptionID: subscription.subscriptionID, error: error.message }
      });
    }
  }

  async stopSubscription(subscriptionID) {
    Logger.log("info", { message: "SubscriptionEngine:stopSubscription:init", params: { subscriptionID } });
    if (!this.handles.has(subscriptionID)) {
      return;
    }

    try {
      const { instance, handle } = this.handles.get(subscriptionID);
      if (instance && typeof instance.unsubscribe === 'function') {
        await instance.unsubscribe(handle);
      }
      this.handles.delete(subscriptionID);
      Logger.log("success", { message: "SubscriptionEngine:stopSubscription:success", params: { subscriptionID } });
    } catch (error) {
      Logger.log("error", {
        message: "SubscriptionEngine:stopSubscription:error",
        params: { subscriptionID, error: error.message }
      });
    }
  }

  async processEvent(subscription, eventPayload) {
    if (!subscription.tblSubscriptionListeners) return;

    for (const listener of subscription.tblSubscriptionListeners) {
      if (listener.listenerType === 'workflow' && listener.isEnabled) {
        try {
          await workflowService.executeWorkflow({
            workflowID: listener.workflowID,
            tenantID: subscription.tenantID,
            inputArgs: { event: eventPayload }
          });
        } catch (wfErr) {
          Logger.log("error", {
            message: "SubscriptionEngine:processEvent:workflowError",
            params: { workflowID: listener.workflowID, error: wfErr.message }
          });
        }
      }
    }
  }

  async stopAll() {
    Logger.log("info", { message: "SubscriptionEngine:stopAll:init" });
    for (const [subscriptionID] of this.handles) {
      await this.stopSubscription(subscriptionID);
    }
  }
}

// Single singleton instance
const subscriptionEngine = new SubscriptionEngine();

module.exports = subscriptionEngine;
