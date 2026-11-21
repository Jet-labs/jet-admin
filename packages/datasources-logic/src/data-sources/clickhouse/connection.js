import { Logger } from "../../utils/logger.js";
import { runQuery } from "./datasource";

export const clickhouseTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "clickhouse:clickhouseTestConnection:params",
      params: {
        host: datasourceOptions.host,
        port: datasourceOptions.port,
        database: datasourceOptions.database,
      },
    });

    await runQuery({ options: datasourceOptions, query: "SELECT 1" });

    Logger.log("info", {
      message: "clickhouse:clickhouseTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "clickhouse:clickhouseTestConnection:catch",
      params: { error: error.message || String(error) },
    });
    return {
      ok: false,
      error: error.message || String(error),
    };
  }
};
