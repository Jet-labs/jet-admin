import { WebClient } from "@slack/web-api";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class SlackDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "slack:SlackDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const { resource, operation, channelId, userId, message, limit } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;

    const client = new WebClient(datasourceOptions?.botToken);

    try {
      let result;

      switch (resource) {
        case "channels":
          if (operation === "list") {
            result = await client.conversations.list({ limit: limit || 100 });
          } else if (operation === "info") {
            result = await client.conversations.info({ channel: channelId });
          }
          break;

        case "users":
          if (operation === "list") {
            result = await client.users.list({ limit: limit || 100 });
          } else if (operation === "info") {
            result = await client.users.info({ user: userId });
          }
          break;

        case "messages":
        case "conversations":
          if (operation === "history") {
            result = await client.conversations.history({ channel: channelId, limit: limit || 100 });
          } else if (operation === "post") {
            result = await client.chat.postMessage({ channel: channelId, text: message });
          }
          break;

        default:
          throw new Error(`Unsupported resource: ${resource}`);
      }

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "slack:SlackDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`Slack operation failed: ${error.message || error}`);
    }
  }
}
