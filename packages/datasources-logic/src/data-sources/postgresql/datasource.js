import { Client } from "pg";
import { Logger } from "../../utils/logger.js";
import DataSource from "../../core/models/datasource.js";

export default class PostgreSQLDataSource extends DataSource {
  async execute(query, context) {
    const client = new Client({
      connectionString: this.config.connectionString,
      ...this.config.connectionData,
    });
    try {
      await client.connect();
      Logger.log("info", {
        message: "postgresql:PostgreSQLDataSource:execute:connected",
        params: { connectionString: this.config.connectionString },
      });
      const result = await client.query(query);
      return result.rows;
    }catch (error) {
      Logger.log("error", {
        message: "postgresql:PostgreSQLDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(
        `Database request failed: ${error.response?.status || "No response"}`
      );
    } finally {
      await client.end();
    }
  }
}
