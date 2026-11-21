import { Logger } from "../../utils/logger.js";
import { buildBaseUrl } from "./datasource";

export const influxdbTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "influxdb:influxdbTestConnection:params",
      params: { baseUrl: datasourceOptions.baseUrl },
    });

    // Public /health proves reachability; an authed bucket list proves token/org access.
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      Math.max(1, Number(datasourceOptions.timeout) || 15) * 1000
    );

    try {
      const response = await fetch(new URL("/health", `${buildBaseUrl(datasourceOptions)}/`), {
        method: "GET",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`InfluxDB /health returned HTTP ${response.status}`);
      }
      await response.text().catch(() => "");

      const org = encodeURIComponent(datasourceOptions.org || "");
      const bucketsResponse = await fetch(
        new URL(`/api/v2/buckets?org=${org}`, `${buildBaseUrl(datasourceOptions)}/`),
        {
          method: "GET",
          signal: controller.signal,
          headers: { Authorization: `Token ${datasourceOptions.token || ""}` },
        }
      );
      if (!bucketsResponse.ok) {
        throw new Error(`InfluxDB token/org check failed: HTTP ${bucketsResponse.status}`);
      }
      await bucketsResponse.text().catch(() => "");
    } finally {
      clearTimeout(timer);
    }

    Logger.log("info", {
      message: "influxdb:influxdbTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "influxdb:influxdbTestConnection:catch",
      params: { error: error.message || String(error) },
    });
    return {
      ok: false,
      error: error.message || String(error),
    };
  }
};
