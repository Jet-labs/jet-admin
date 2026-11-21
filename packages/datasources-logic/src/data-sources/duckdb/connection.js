import { Logger } from "../../utils/logger.js";
import { withDatabase } from "./datasource";

export const duckdbTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "duckdb:duckdbTestConnection:params",
      params: { databasePath: datasourceOptions.databasePath, readonly: datasourceOptions.readonly },
    });

    await withDatabase(datasourceOptions, (db) =>
      new Promise((resolve, reject) => {
        db.all("SELECT 1 AS ok", (error, rows) => {
          if (error) reject(error);
          else if (!rows || !rows.length || Number(rows[0].ok) !== 1) {
            reject(new Error("DuckDB probe returned an unexpected row"));
          } else resolve(rows[0]);
        });
      })
    );

    Logger.log("info", {
      message: "duckdb:duckdbTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "duckdb:duckdbTestConnection:catch",
      params: { error: error.message || String(error) },
    });
    return {
      ok: false,
      error: error.message || String(error),
    };
  }
};
