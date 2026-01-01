import oracledb from "oracledb";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class OracleDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "oracle:OracleDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const { query } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;

    let connection;
    try {
      if (datasourceOptions?.connectionString) {
        connection = await oracledb.getConnection({
          connectionString: datasourceOptions.connectionString,
          user: datasourceOptions.user,
          password: datasourceOptions.password,
        });
      } else {
        const details = datasourceOptions?.connectionDetails || datasourceOptions;
        connection = await oracledb.getConnection({
          user: details?.user,
          password: details?.password,
          connectString: `${details?.host}:${details?.port || 1521}/${details?.serviceName}`,
        });
      }

      const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return result.rows;
    } catch (error) {
      Logger.log("error", {
        message: "oracle:OracleDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`Oracle query failed: ${error.message || error}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}
