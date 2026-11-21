import { Logger } from "../../utils/logger.js";
import { promGet } from "./datasource";

export const prometheusTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "prometheus:prometheusTestConnection:params",
      params: { baseUrl: datasourceOptions.baseUrl },
    });

    // buildinfo is lightweight and proves HTTP reachability + API shape.
    await promGet({ options: datasourceOptions, path: "/api/v1/status/buildinfo", params: {} });

    Logger.log("info", {
      message: "prometheus:prometheusTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "prometheus:prometheusTestConnection:catch",
      params: { error: error.message || String(error) },
    });
    return {
      ok: false,
      error: error.message || String(error),
    };
  }
};
