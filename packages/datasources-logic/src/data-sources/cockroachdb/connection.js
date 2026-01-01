import { Client } from "pg";
import { Logger } from "../../utils/logger.js";

export const cockroachdbTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "cockroachdb:cockroachdbTestConnection:params",
    });

    const client = new Client({
      connectionString: datasourceOptions.connectionString,
      ssl: datasourceOptions.ssl ? { rejectUnauthorized: false } : false,
    });

    await client.connect();
    await client.end();

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "cockroachdb:cockroachdbTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
