import { Client } from "pg";
import { Logger } from "../../utils/logger";

export const postgresqlTestConnection = async ({
  connectionString,
  connectionData,
}) => {
  try {
    Logger.log("info", {
      message: "postgresql:postgresqlTestConnection:params",
      params: { connectionString, connectionData },
    });
    const client = connectionString
      ? new Client(connectionString)
      : new Client({
          host: connectionData.host,
          port: connectionData.port,
          database: connectionData.database,
          user: connectionData.user,
          password: connectionData.password,
        });
    await client.connect();
    Logger.log("info", {
      message: "postgresql:postgresqlTestConnection:connected",
      params: { connectionString, connectionData },
    });
    await client.end();
    Logger.log("info", {
      message: "postgresql:postgresqlTestConnection:disconnected",
      params: { connectionString, connectionData },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "postgresql:postgresqlTestConnection:catch-1",
      params: { error },
    });
    return false;
  }
};
