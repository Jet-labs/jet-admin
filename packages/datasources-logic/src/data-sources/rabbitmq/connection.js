import amqp from "amqplib";
import { Logger } from "../../utils/logger.js";

export const rabbitmqTestConnection = async ({ datasourceOptions }) => {
  let connection;
  
  try {
    Logger.log("info", {
      message: "rabbitmq:rabbitmqTestConnection:params",
    });

    let connectionUrl;
    
    if (datasourceOptions.connectionUrl) {
      connectionUrl = datasourceOptions.connectionUrl;
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      const protocol = details.ssl ? "amqps" : "amqp";
      const auth = details.username && details.password 
        ? `${encodeURIComponent(details.username)}:${encodeURIComponent(details.password)}@`
        : "";
      const vhost = encodeURIComponent(details.vhost || "/");
      const heartbeat = details.heartbeat ? `?heartbeat=${details.heartbeat}` : "";
      
      connectionUrl = `${protocol}://${auth}${details.host || "localhost"}:${details.port || 5672}/${vhost}${heartbeat}`;
    }
    
    connection = await amqp.connect(connectionUrl);

    Logger.log("info", {
      message: "rabbitmq:rabbitmqTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "rabbitmq:rabbitmqTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};
