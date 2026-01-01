import Database from "better-sqlite3";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class SQLiteDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "sqlite:SQLiteDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const { query } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;

    let db;
    try {
      db = new Database(datasourceOptions?.databasePath, {
        readonly: datasourceOptions?.readonly || false,
      });

      const stmt = db.prepare(query);
      const isSelect = query.trim().toUpperCase().startsWith("SELECT");
      
      if (isSelect) {
        return stmt.all();
      } else {
        return stmt.run();
      }
    } catch (error) {
      Logger.log("error", {
        message: "sqlite:SQLiteDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`SQLite query failed: ${error.message || error}`);
    } finally {
      if (db) {
        db.close();
      }
    }
  }
}
