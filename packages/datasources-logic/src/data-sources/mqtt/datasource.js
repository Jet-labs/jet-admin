import DataSource from "../datasource.js";
import mqtt from "mqtt";
import { Logger } from "../../utils/logger.js";

export default class MQTTDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    throw new Error("MQTT is a listener-only datasource.");
  }

  async subscribe(config, onEvent) {
    const datasourceOptions = this.config.datasourceOptions || {};
    const details = datasourceOptions.connectionDetails || datasourceOptions;
    
    let { host, port, protocol, username, password, clientId } = details;
    protocol = protocol || "mqtt";
    
    if (!host) {
      throw new Error("MQTT host is required");
    }

    const brokerUrl = `${protocol}://${host}:${port || 1883}`;

    const topics = (config.topics || "").split(",").map(t => t.trim()).filter(Boolean);
    const qos = config.qos || 0;

    if (!topics.length) {
      throw new Error("MQTT topics are required");
    }

    Logger.log("info", {
      message: "mqtt:subscribe:start",
      params: { brokerUrl, topics, datasourceID: this.config.datasourceID },
    });

    const options = {};
    if (username) options.username = username;
    if (password) options.password = password;
    if (clientId) options.clientId = clientId;

    const client = mqtt.connect(brokerUrl, options);

    return new Promise((resolve, reject) => {
      let isConnected = false;
      
      client.on("connect", () => {
        isConnected = true;
        client.subscribe(topics, { qos }, (err) => {
          if (err) {
            Logger.log("error", { message: "mqtt:subscribe:subscribeError", params: { error: err.message } });
            reject(err);
          } else {
            resolve({ client, topics });
          }
        });
      });

      client.on("error", (error) => {
        Logger.log("error", {
          message: "mqtt:subscribe:error",
          params: { error: error.message },
        });
        if (!isConnected) {
          reject(error);
        }
      });

      client.on("message", (topic, message) => {
        let payload = message.toString();
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          // keep as string
        }
        onEvent({ topic, payload });
      });
    });
  }

  async unsubscribe(handle) {
    if (!handle || !handle.client) return;
    
    Logger.log("info", {
      message: "mqtt:unsubscribe",
      params: { datasourceID: this.config.datasourceID },
    });

    try {
      if (handle.topics) {
        handle.client.unsubscribe(handle.topics);
      }
      handle.client.end();
    } catch (e) {
      Logger.log("error", {
        message: "mqtt:unsubscribe:error",
        params: { error: e.message },
      });
    }
  }
}
