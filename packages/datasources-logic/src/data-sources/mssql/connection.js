import sql from "mssql";
import { Logger } from "../../utils/logger.js";

export const mssqlTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "mssql:mssqlTestConnection:params",
      params: { datasourceOptions: { ...datasourceOptions, password: "[REDACTED]" } },
    });

    let config;
    if (datasourceOptions.connectionString) {
      config = datasourceOptions.connectionString;
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      config = {
        server: details.server,
        port: details.port || 1433,
        database: details.database,
        user: details.user,
        password: details.password,
        options: {
          encrypt: details.encrypt !== false,
          trustServerCertificate: details.trustServerCertificate || false,
        },
      };
    }

    const pool = await sql.connect(config);
    Logger.log("info", {
      message: "mssql:mssqlTestConnection:connected",
    });
    
    await pool.close();
    Logger.log("info", {
      message: "mssql:mssqlTestConnection:disconnected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "mssql:mssqlTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
