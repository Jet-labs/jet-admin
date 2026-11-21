import { Client } from "pg";
import { Logger } from "../../utils/logger";
import { buildPostgresClientConfig } from "./datasource";

export const postgresqlTestConnection = async ({
  connectionString,
  connectionData,
  connectionDetails,
  connectionOption,
}) => {
  try {
    Logger.log("info", {
      message: "postgresql:postgresqlTestConnection:params",
      params: {
        connectionString: connectionString ? "[REDACTED]" : "",
        host: connectionDetails?.host || connectionData?.host,
        port: connectionDetails?.port || connectionData?.port,
        database: connectionDetails?.database || connectionData?.database,
      },
    });
    const clientConfig = buildPostgresClientConfig({
      connectionString,
      connectionData,
      connectionDetails,
      connectionOption,
    });
    const client = new Client(clientConfig);
    await client.connect();
    Logger.log("info", {
      message: "postgresql:postgresqlTestConnection:connected",
      params: { host: clientConfig.host || "connection-string" },
    });
    await client.end();
    Logger.log("info", {
      message: "postgresql:postgresqlTestConnection:disconnected",
      params: { connectionString, connectionData },
    });
    // Return consistent object format like other datasources
    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "postgresql:postgresqlTestConnection:catch-1",
      params: { error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
