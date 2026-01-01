import { Logger } from "../../utils/logger.js";

export const jiraTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "jira:jiraTestConnection:params",
      params: { host: datasourceOptions.host },
    });

    const auth = Buffer.from(`${datasourceOptions.email}:${datasourceOptions.apiToken}`).toString("base64");
    const response = await fetch(`${datasourceOptions.host}/rest/api/3/myself`, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
    });

    if (response.ok) {
      return {
        ok: true,
        status: 200,
        statusText: "Connected",
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    Logger.log("error", {
      message: "jira:jiraTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
