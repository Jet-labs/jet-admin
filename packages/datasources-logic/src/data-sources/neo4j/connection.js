import neo4j from "neo4j-driver";
import { Logger } from "../../utils/logger.js";

export const neo4jTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "neo4j:neo4jTestConnection:params",
      params: { uri: datasourceOptions.uri },
    });

    const driver = neo4j.driver(
      datasourceOptions.uri,
      neo4j.auth.basic(datasourceOptions.username, datasourceOptions.password)
    );

    await driver.verifyConnectivity();
    await driver.close();

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "neo4j:neo4jTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
