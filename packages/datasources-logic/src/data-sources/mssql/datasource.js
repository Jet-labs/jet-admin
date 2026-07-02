import sql from "mssql";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class MSSQLDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "mssql:MSSQLDataSource:execute:params",
      params: { dataQueryOptions, config: this.config },
    });

    const { query } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;

    let config;
    if (datasourceOptions?.connectionString) {
      config = datasourceOptions.connectionString;
    } else {
      const details = datasourceOptions?.connectionDetails || datasourceOptions;
      config = {
        server: details?.server,
        port: details?.port || 1433,
        database: details?.database,
        user: details?.user,
        password: details?.password,
        options: {
          encrypt: details?.encrypt !== false,
          trustServerCertificate: details?.trustServerCertificate || false,
        },
      };
    }

    let pool;
    try {
      pool = await sql.connect(config);
      Logger.log("info", {
        message: "mssql:MSSQLDataSource:execute:connected",
      });

      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      Logger.log("error", {
        message: "mssql:MSSQLDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`MSSQL query failed: ${error.message || error}`);
    } finally {
      if (pool) {
        await pool.close();
      }
    }
  }

  async getSchema(params, context) {
    const datasourceOptions = this.config.datasourceOptions;
    let config;
    if (datasourceOptions?.connectionString) {
      config = datasourceOptions.connectionString;
    } else {
      const details = datasourceOptions?.connectionDetails || datasourceOptions;
      config = {
        server: details?.server,
        port: details?.port || 1433,
        database: details?.database,
        user: details?.user,
        password: details?.password,
        options: {
          encrypt: details?.encrypt !== false,
          trustServerCertificate: details?.trustServerCertificate || false,
        },
      };
    }

    let pool;
    try {
      pool = await sql.connect(config);
      const query = `
        SELECT 
          c.TABLE_NAME as table_name, 
          c.COLUMN_NAME as column_name, 
          c.DATA_TYPE as data_type, 
          c.IS_NULLABLE as is_nullable,
          c.COLUMN_DEFAULT as column_default,
          CASE WHEN kcu.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as is_primary_key
        FROM INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
          ON c.TABLE_CATALOG = kcu.TABLE_CATALOG 
          AND c.TABLE_SCHEMA = kcu.TABLE_SCHEMA 
          AND c.TABLE_NAME = kcu.TABLE_NAME 
          AND c.COLUMN_NAME = kcu.COLUMN_NAME
        LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc 
          ON kcu.TABLE_CATALOG = tc.TABLE_CATALOG 
          AND kcu.TABLE_SCHEMA = tc.TABLE_SCHEMA 
          AND kcu.TABLE_NAME = tc.TABLE_NAME 
          AND kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME 
          AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        WHERE c.TABLE_SCHEMA = 'dbo' OR c.TABLE_SCHEMA = 'public' OR c.TABLE_SCHEMA = c.TABLE_CATALOG
        ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;
      `;
      const result = await pool.request().query(query);
      const rows = result.recordset;

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
          isPrimaryKey: Boolean(row.is_primary_key),
        });
      }
      return { tables: Object.values(tablesMap) };
    } catch (error) {
      Logger.log("error", {
        message: "mssql:MSSQLDataSource:getSchema:catch",
        params: error.message || error,
      });
      throw error;
    } finally {
      if (pool) {
        await pool.close();
      }
    }
  }

  async getSampleData(params, context) {
    const { table, limit = 5 } = params;
    if (!table || typeof table !== 'string' || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
      throw new Error("Invalid table name");
    }
    const datasourceOptions = this.config.datasourceOptions;
    let config;
    if (datasourceOptions?.connectionString) {
      config = datasourceOptions.connectionString;
    } else {
      const details = datasourceOptions?.connectionDetails || datasourceOptions;
      config = {
        server: details?.server,
        port: details?.port || 1433,
        database: details?.database,
        user: details?.user,
        password: details?.password,
        options: {
          encrypt: details?.encrypt !== false,
          trustServerCertificate: details?.trustServerCertificate || false,
        },
      };
    }

    let pool;
    try {
      pool = await sql.connect(config);
      const query = `SELECT TOP ${parseInt(limit, 10)} * FROM [${table}];`;
      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      Logger.log("error", {
        message: "mssql:MSSQLDataSource:getSampleData:catch",
        params: error.message || error,
      });
      throw error;
    } finally {
      if (pool) {
        await pool.close();
      }
    }
  }
}
