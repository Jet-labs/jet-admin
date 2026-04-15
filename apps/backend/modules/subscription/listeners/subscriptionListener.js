/**
 * Subscription Listener
 * Bootstraps all active subscriptions on server start via the service layer.
 */
const Logger = require("../../../utils/logger");
const { subscriptionService } = require("../subscription.service");

async function startSubscriptionListener() {
  Logger.log("info", { message: "subscription.listener:start" });
  await subscriptionService.startAllServerSubscriptions();
  Logger.log("success", { message: "subscription.listener:started" });
}

async function stopSubscriptionListener() {
  Logger.log("info", { message: "subscription.listener:stop" });
  const subscriptionEngine = require("../subscriptionEngine/engine");
  await subscriptionEngine.stopAll();
  Logger.log("success", { message: "subscription.listener:stopped" });
}

module.exports = { startSubscriptionListener, stopSubscriptionListener };
