import { MongoClient } from "mongodb";
import { Logger } from "../../utils/logger.js";

export const mongodbTestConnection = async ({ datasourceOptions }) => {
  let client;
  
  try {
    Logger.log("info", {
      message: "mongodb:mongodbTestConnection:params",
    });

    let connectionString;

    if (datasourceOptions.connectionString) {
      connectionString = datasourceOptions.connectionString;
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      const { host, port, database, username, password, authSource, ssl, replicaSet } = details;
      
      let authPart = "";
      if (username && password) {
        authPart = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
      }
      
      const params = new URLSearchParams();
      if (authSource) params.append("authSource", authSource);
      if (ssl) params.append("ssl", "true");
      if (replicaSet) params.append("replicaSet", replicaSet);
      
      const dbName = database || datasourceOptions.database || "test";
      const queryString = params.toString() ? `?${params.toString()}` : "";
      connectionString = `mongodb://${authPart}${host || "localhost"}:${port || 27017}/${dbName}${queryString}`;
    }

    client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    await client.connect();
    
    // Test with a simple ping command
    await client.db().command({ ping: 1 });

    Logger.log("info", {
      message: "mongodb:mongodbTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "mongodb:mongodbTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};
