import duckdb from "duckdb";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

function openDatabase(options) {
  const path = options.databasePath || ":memory:";
  if (path !== ":memory:" && options.readonly) {
    return new duckdb.Database(path, duckdb.OPEN_READONLY);
  }
  return new duckdb.Database(path);
}

function all(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (error, rows) => {
      if (error) reject(error);
      else resolve(rows || []);
    });
  });
}

function run(db, sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

function close(db) {
  return new Promise((resolve) => db.close(() => resolve()));
}

async function withDatabase(options, fn) {
  const db = openDatabase(options);
  try {
    if (options.memoryLimit) {
      await run(db, `SET memory_limit='${String(options.memoryLimit).replace(/'/g, "''")}'`);
    }
    return await fn(db);
  } finally {
    await close(db);
  }
}

export default class DuckDBDataSource extends DataSource {
  async execute(dataQueryOptions) {
    const options = this.config.datasourceOptions || {};
    const query = String(dataQueryOptions?.query || "").trim();

    // Never log the SQL body: templates and literals may carry secrets.
    Logger.log("info", {
      message: "duckdb:DuckDBDataSource:execute:params",
      params: { queryLength: query.length },
    });

    if (!query) {
      throw new Error("DuckDB query is required.");
    }
    if (query.split(";").map((s) => s.trim()).filter(Boolean).length > 1) {
      throw new Error("DuckDB execute accepts a single statement.");
    }

    try {
      return await withDatabase(options, (db) => all(db, query));
    } catch (error) {
      Logger.log("error", {
        message: "duckdb:DuckDBDataSource:execute:catch",
        params: { error: error.message || String(error) },
      });
      throw new Error(`DuckDB query failed: ${error.message || String(error)}`);
    }
  }
}

export { withDatabase };
