import mysql from "mysql2/promise";
import { Logger } from "../../utils/logger.js";

export const mysqlTestConnection = async ({ datasourceOptions }) => {
  let connection;
  
  try {
    Logger.log("info", {
      message: "mysql:mysqlTestConnection:params",
    });

    let connectionConfig;
    
    if (datasourceOptions.connectionString) {
      connectionConfig = datasourceOptions.connectionString;
    } else {
      const { host, port, database, user, password, ssl, additionalOptions } = 
        datasourceOptions.connectionDetails || datasourceOptions;
      
      connectionConfig = {
        host: host || datasourceOptions.host,
        port: port || datasourceOptions.port || 3306,
        database: database || datasourceOptions.database,
        user: user || datasourceOptions.user,
        password: password || datasourceOptions.password,
        ssl: ssl || datasourceOptions.ssl ? { rejectUnauthorized: false } : undefined,
        connectTimeout: additionalOptions?.connectTimeout || 10000,
      };
    }
    
    connection = await mysql.createConnection(connectionConfig);
    
    // Test with a simple query
    await connection.execute("SELECT 1");

    Logger.log("info", {
      message: "mysql:mysqlTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "mysql:mysqlTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
