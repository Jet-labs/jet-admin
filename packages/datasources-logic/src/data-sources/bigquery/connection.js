import { BigQuery } from "@google-cloud/bigquery";
import { Logger } from "../../utils/logger.js";

export const bigqueryTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "bigquery:bigqueryTestConnection:params",
      params: { projectId: datasourceOptions.projectId },
    });

    let bigquery;
    if (datasourceOptions.credentials) {
      const credentials = typeof datasourceOptions.credentials === "string"
        ? JSON.parse(datasourceOptions.credentials)
        : datasourceOptions.credentials;
      bigquery = new BigQuery({
        projectId: datasourceOptions.projectId,
        credentials,
      });
    } else if (datasourceOptions.keyFilePath) {
      bigquery = new BigQuery({
        projectId: datasourceOptions.projectId,
        keyFilename: datasourceOptions.keyFilePath,
      });
    } else {
      // Use default credentials (Application Default Credentials)
      bigquery = new BigQuery({
        projectId: datasourceOptions.projectId,
      });
    }

    // Test connection by getting datasets
    const [datasets] = await bigquery.getDatasets({ maxResults: 1 });
    
    Logger.log("info", {
      message: "bigquery:bigqueryTestConnection:connected",
      params: { datasetsFound: datasets.length },
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "bigquery:bigqueryTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
