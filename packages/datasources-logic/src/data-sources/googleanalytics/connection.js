import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { Logger } from "../../utils/logger.js";

export const googleanalyticsTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "googleanalytics:googleanalyticsTestConnection:params",
      params: { propertyId: datasourceOptions.propertyId },
    });

    let clientConfig = {};
    if (datasourceOptions.credentials) {
      const credentials = typeof datasourceOptions.credentials === "string"
        ? JSON.parse(datasourceOptions.credentials)
        : datasourceOptions.credentials;
      clientConfig = { credentials };
    }

    const analyticsDataClient = new BetaAnalyticsDataClient(clientConfig);
    
    // Run a simple report to test connection
    await analyticsDataClient.runReport({
      property: `properties/${datasourceOptions.propertyId}`,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      metrics: [{ name: "activeUsers" }],
      limit: 1,
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "googleanalytics:googleanalyticsTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
