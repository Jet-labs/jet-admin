import { Logger } from "../../utils/logger.js";
import { gitlabRequest } from "./datasource";

export const gitlabTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "gitlab:gitlabTestConnection:params",
      params: { baseUrl: datasourceOptions.baseUrl, authType: datasourceOptions.authType },
    });

    if (!datasourceOptions.token) {
      throw new Error("GitLab token is required for the connection test.");
    }

    await gitlabRequest({ options: datasourceOptions, method: "GET", path: "/user" });

    Logger.log("info", {
      message: "gitlab:gitlabTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "gitlab:gitlabTestConnection:catch",
      params: { error: error.message || String(error) },
    });
    return {
      ok: false,
      error: error.message || String(error),
    };
  }
};
