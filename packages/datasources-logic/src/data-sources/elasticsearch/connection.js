import { Client } from "@elastic/elasticsearch";
import { Logger } from "../../utils/logger.js";

export const elasticsearchTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "elasticsearch:elasticsearchTestConnection:params",
      params: { authType: datasourceOptions.authType },
    });

    let clientConfig = {};

    switch (datasourceOptions.authType) {
      case "none":
        clientConfig = { node: datasourceOptions.node };
        break;
      case "basic":
        clientConfig = {
          node: datasourceOptions.node,
          auth: {
            username: datasourceOptions.username,
            password: datasourceOptions.password,
          },
        };
        break;
      case "apiKey":
        clientConfig = {
          node: datasourceOptions.node,
          auth: { apiKey: datasourceOptions.apiKey },
        };
        break;
      case "cloud":
        clientConfig = {
          cloud: { id: datasourceOptions.cloudId },
          auth: { apiKey: datasourceOptions.apiKey },
        };
        break;
      default:
        clientConfig = { node: datasourceOptions.node };
    }

    const client = new Client(clientConfig);
    
    // Test connection with cluster health check
    const health = await client.cluster.health();

    Logger.log("info", {
      message: "elasticsearch:elasticsearchTestConnection:connected",
      params: { clusterName: health.cluster_name, status: health.status },
    });

    return {
      ok: true,
      status: 200,
      statusText: `Connected to ${health.cluster_name}`,
    };
  } catch (error) {
    Logger.log("error", {
      message: "elasticsearch:elasticsearchTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
