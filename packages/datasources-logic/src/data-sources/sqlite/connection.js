import Database from "better-sqlite3";
import { Logger } from "../../utils/logger.js";

export const sqliteTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "sqlite:sqliteTestConnection:params",
      params: { databasePath: datasourceOptions.databasePath },
    });

    const db = new Database(datasourceOptions.databasePath, {
      readonly: datasourceOptions.readonly || false,
    });
    
    // Test with simple query
    db.prepare("SELECT 1").get();
    db.close();

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "sqlite:sqliteTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
