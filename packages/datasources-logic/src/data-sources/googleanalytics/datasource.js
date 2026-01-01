import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class GoogleAnalyticsDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "googleanalytics:GoogleAnalyticsDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const { reportType, dateRanges, dimensions, metrics, limit } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;

    let clientConfig = {};
    if (datasourceOptions?.credentials) {
      const credentials = typeof datasourceOptions.credentials === "string"
        ? JSON.parse(datasourceOptions.credentials)
        : datasourceOptions.credentials;
      clientConfig = { credentials };
    }

    const analyticsDataClient = new BetaAnalyticsDataClient(clientConfig);

    try {
      let result;

      if (reportType === "runReport") {
        const [response] = await analyticsDataClient.runReport({
          property: `properties/${datasourceOptions?.propertyId}`,
          dateRanges: dateRanges || [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: dimensions || [],
          metrics: metrics || [{ name: "activeUsers" }],
          limit: limit || 10000,
        });

        result = {
          rows: response.rows?.map((row) => ({
            dimensions: row.dimensionValues?.map((d) => d.value),
            metrics: row.metricValues?.map((m) => m.value),
          })) || [],
          dimensionHeaders: response.dimensionHeaders?.map((h) => h.name),
          metricHeaders: response.metricHeaders?.map((h) => h.name),
          rowCount: response.rowCount,
        };
      } else if (reportType === "runRealtimeReport") {
        const [response] = await analyticsDataClient.runRealtimeReport({
          property: `properties/${datasourceOptions?.propertyId}`,
          dimensions: dimensions || [],
          metrics: metrics || [{ name: "activeUsers" }],
          limit: limit || 10000,
        });

        result = {
          rows: response.rows?.map((row) => ({
            dimensions: row.dimensionValues?.map((d) => d.value),
            metrics: row.metricValues?.map((m) => m.value),
          })) || [],
          dimensionHeaders: response.dimensionHeaders?.map((h) => h.name),
          metricHeaders: response.metricHeaders?.map((h) => h.name),
          rowCount: response.rowCount,
        };
      } else {
        throw new Error(`Unsupported report type: ${reportType}`);
      }

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "googleanalytics:GoogleAnalyticsDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`Google Analytics query failed: ${error.message || error}`);
    }
  }
}
