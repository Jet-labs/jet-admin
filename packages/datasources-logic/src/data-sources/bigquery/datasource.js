import { BigQuery } from "@google-cloud/bigquery";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class BigQueryDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "bigquery:BigQueryDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const { query, useLegacySql, args } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;

    let bigquery;
    if (datasourceOptions?.credentials) {
      const credentials = typeof datasourceOptions.credentials === "string"
        ? JSON.parse(datasourceOptions.credentials)
        : datasourceOptions.credentials;
      bigquery = new BigQuery({
        projectId: datasourceOptions.projectId,
        credentials,
      });
    } else if (datasourceOptions?.keyFilePath) {
      bigquery = new BigQuery({
        projectId: datasourceOptions.projectId,
        keyFilename: datasourceOptions.keyFilePath,
      });
    } else {
      bigquery = new BigQuery({
        projectId: datasourceOptions.projectId,
      });
    }

    try {
      const options = {
        query,
        useLegacySql: useLegacySql || false,
        location: datasourceOptions?.location || "US",
      };

      // Add query parameters if provided
      if (args && Array.isArray(args) && args.length > 0) {
        options.params = {};
        for (const arg of args) {
          options.params[arg.key] = context?.[arg.key] || null;
        }
      }

      const [rows] = await bigquery.query(options);

      Logger.log("info", {
        message: "bigquery:BigQueryDataSource:execute:success",
        params: { rowCount: rows.length },
      });

      return rows;
    } catch (error) {
      Logger.log("error", {
        message: "bigquery:BigQueryDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`BigQuery query failed: ${error.message || error}`);
    }
  }
}
