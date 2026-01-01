import { WebClient } from "@slack/web-api";
import { Logger } from "../../utils/logger.js";

export const slackTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "slack:slackTestConnection:params",
    });

    const client = new WebClient(datasourceOptions.botToken);
    await client.auth.test();

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "slack:slackTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
