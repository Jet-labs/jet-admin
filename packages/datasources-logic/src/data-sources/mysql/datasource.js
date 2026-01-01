import mysql from "mysql2/promise";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class MySQLDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "mysql:MySQLDataSource:execute:params",
      params: { dataQueryOptions, config: this.config },
    });
    
    const { query } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions || {};
    
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
        timezone: additionalOptions?.timezone || "Z",
      };
    }
    
    let connection;
    try {
      connection = await mysql.createConnection(connectionConfig);
      
      Logger.log("info", {
        message: "mysql:MySQLDataSource:execute:connected",
        params: { host: connectionConfig.host || "connection-string" },
      });
      
      const [rows] = await connection.execute(query);
      return rows;
    } catch (error) {
      Logger.log("error", {
        message: "mysql:MySQLDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(
        `MySQL request failed: ${error.message || "Unknown error"}`
      );
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}
