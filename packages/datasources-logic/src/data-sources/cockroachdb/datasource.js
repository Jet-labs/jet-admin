import { Client } from "pg";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class CockroachDBDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "cockroachdb:CockroachDBDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const { query } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;

    const client = new Client({
      connectionString: datasourceOptions?.connectionString,
      ssl: datasourceOptions?.ssl ? { rejectUnauthorized: false } : false,
    });

    try {
      await client.connect();
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      Logger.log("error", {
        message: "cockroachdb:CockroachDBDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`CockroachDB query failed: ${error.message || error}`);
    } finally {
      await client.end();
    }
  }
}
