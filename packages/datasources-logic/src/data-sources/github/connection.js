import { Logger } from "../../utils/logger.js";
import { githubRequest } from "./datasource";

export const githubTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "github:githubTestConnection:params",
      params: { apiUrl: datasourceOptions.apiUrl },
    });

    // /rate_limit works authenticated and unauthenticated and proves reachability.
    await githubRequest({ options: datasourceOptions, method: "GET", path: "/rate_limit" });

    Logger.log("info", {
      message: "github:githubTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "github:githubTestConnection:catch",
      params: { error: error.message || String(error) },
    });
    return {
      ok: false,
      error: error.message || String(error),
    };
  }
};
