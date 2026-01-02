import { Kafka, logLevel } from "kafkajs";
import { Logger } from "../../utils/logger.js";

export const kafkaTestConnection = async ({ datasourceOptions }) => {
  let admin;
  
  try {
    Logger.log("info", {
      message: "kafka:kafkaTestConnection:params",
    });

    const brokers = (datasourceOptions.brokers || "localhost:9092").split(",").map(b => b.trim());
    
    const config = {
      clientId: datasourceOptions.clientId || "jet-admin",
      brokers,
      connectionTimeout: datasourceOptions.connectionTimeout || 10000,
      requestTimeout: datasourceOptions.requestTimeout || 30000,
      logLevel: logLevel.WARN,
    };

    if (datasourceOptions.ssl) {
      config.ssl = true;
    }

    if (datasourceOptions.sasl?.enabled) {
      config.sasl = {
        mechanism: datasourceOptions.sasl.mechanism || "plain",
        username: datasourceOptions.sasl.username,
        password: datasourceOptions.sasl.password,
      };
    }

    const kafka = new Kafka(config);
    admin = kafka.admin();
    
    await admin.connect();
    
    // Test by listing topics
    await admin.listTopics();

    Logger.log("info", {
      message: "kafka:kafkaTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "kafka:kafkaTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  } finally {
    if (admin) {
      await admin.disconnect();
    }
  }
};
