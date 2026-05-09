import DataSource from "../datasource.js";

export default class WebhookDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    throw new Error("Webhook is a listener-only datasource.");
  }

  async subscribe(config, onEvent) {
    // Webhook implementation should register a dynamic route with the backend Express server.
    // This is typically handled by a central webhook registry on the backend, 
    // not by long-polling or connecting outward.
    throw new Error("Webhook listener execution is handled natively by the Jet Admin Express router.");
  }

  async unsubscribe(handle) {
    // Unsubscribe logic handled by backend
  }
}
