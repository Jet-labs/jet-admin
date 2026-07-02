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

  async getSchema(params, context) {
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
      const dbName = connectionConfig.database || (typeof connectionConfig === 'string' ? new URL(connectionConfig).pathname.replace('/', '') : '');
      if (!dbName) {
        throw new Error("Database name is required for MySQL schema introspection");
      }
      
      const query = `
        SELECT 
          c.TABLE_NAME as table_name, 
          c.COLUMN_NAME as column_name, 
          c.DATA_TYPE as data_type, 
          c.IS_NULLABLE as is_nullable,
          c.COLUMN_DEFAULT as column_default,
          c.COLUMN_KEY as column_key
        FROM information_schema.COLUMNS c
        WHERE c.TABLE_SCHEMA = ?
        ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;
      `;
      const [rows] = await connection.execute(query, [dbName]);
      
      const tablesMap = {};
      for (const row of rows) {
        if (!tablesMap[row.table_name]) {
          tablesMap[row.table_name] = {
            tableName: row.table_name,
            columns: [],
          };
        }
        tablesMap[row.table_name].columns.push({
          columnName: row.column_name,
          dataType: row.data_type,
          isNullable: row.is_nullable === 'YES',
          defaultValue: row.column_default,
          isPrimaryKey: row.column_key === 'PRI',
        });
      }
      return { tables: Object.values(tablesMap) };
    } catch (error) {
      Logger.log("error", {
        message: "mysql:MySQLDataSource:getSchema:catch",
        params: error.message || error,
      });
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  async getSampleData(params, context) {
    const { table, limit = 5 } = params;
    if (!table || typeof table !== 'string' || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
      throw new Error("Invalid table name");
    }
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
      const query = `SELECT * FROM \`${table}\` LIMIT ${parseInt(limit, 10)};`;
      const [rows] = await connection.execute(query);
      return rows;
    } catch (error) {
      Logger.log("error", {
        message: "mysql:MySQLDataSource:getSampleData:catch",
        params: error.message || error,
      });
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}
