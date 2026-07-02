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

  async getSchema(params, context) {
    const datasourceOptions = this.config.datasourceOptions;
    let db;
    try {
      db = new Database(datasourceOptions?.databasePath, {
        readonly: true,
      });

      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").all();
      const result = [];
      for (const t of tables) {
        const columns = db.prepare(`PRAGMA table_info(\`${t.name}\`);`).all();
        result.push({
          tableName: t.name,
          columns: columns.map(c => ({
            columnName: c.name,
            dataType: c.type,
            isNullable: c.notnull === 0,
            defaultValue: c.dflt_value,
            isPrimaryKey: c.pk === 1,
          }))
        });
      }
      return { tables: result };
    } catch (error) {
      Logger.log("error", {
        message: "sqlite:SQLiteDataSource:getSchema:catch",
        params: error.message || error,
      });
      throw error;
    } finally {
      if (db) {
        db.close();
      }
    }
  }

  async getSampleData(params, context) {
    const { table, limit = 5 } = params;
    if (!table || typeof table !== 'string' || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
      throw new Error("Invalid table name");
    }
    const datasourceOptions = this.config.datasourceOptions;
    let db;
    try {
      db = new Database(datasourceOptions?.databasePath, {
        readonly: true,
      });
      const rows = db.prepare(`SELECT * FROM \`${table}\` LIMIT ${parseInt(limit, 10)};`).all();
      return rows;
    } catch (error) {
      Logger.log("error", {
        message: "sqlite:SQLiteDataSource:getSampleData:catch",
        params: error.message || error,
      });
      throw error;
    } finally {
      if (db) {
        db.close();
      }
    }
  }
}
