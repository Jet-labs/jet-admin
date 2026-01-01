import oracledb from "oracledb";
import { Logger } from "../../utils/logger.js";

export const oracleTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "oracle:oracleTestConnection:params",
      params: { host: datasourceOptions.connectionDetails?.host },
    });

    let connection;
    if (datasourceOptions.connectionString) {
      connection = await oracledb.getConnection({
        connectionString: datasourceOptions.connectionString,
        user: datasourceOptions.user,
        password: datasourceOptions.password,
      });
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      connection = await oracledb.getConnection({
        user: details.user,
        password: details.password,
        connectString: `${details.host}:${details.port || 1521}/${details.serviceName}`,
      });
    }

    await connection.close();

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "oracle:oracleTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
