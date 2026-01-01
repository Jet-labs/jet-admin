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
}
