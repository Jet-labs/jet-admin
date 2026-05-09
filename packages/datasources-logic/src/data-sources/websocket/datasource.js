import DataSource from "../datasource.js";
import WebSocket from "ws";
import { Logger } from "../../utils/logger.js";

export default class WebSocketDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    throw new Error("WebSocket is a listener-only datasource.");
  }

  async subscribe(config, onEvent) {
    const { endpoint, headers, protocols } = this.config.datasourceOptions || {};
    
    if (!endpoint) {
      throw new Error("WebSocket endpoint is required");
    }

    Logger.log("info", {
      message: "websocket:subscribe:start",
      params: { endpoint, datasourceID: this.config.datasourceID },
    });

    const options = {};
    if (headers && Array.isArray(headers)) {
      options.headers = {};
      headers.forEach(h => {
        if (h.key && h.value) options.headers[h.key] = h.value;
      });
    }

    // Connect WebSocket
    const ws = new WebSocket(endpoint, protocols || [], options);

    ws.on("message", (data) => {
      let payload = data.toString();
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        // keep as string
      }
      onEvent({ payload });
    });

    ws.on("error", (error) => {
      Logger.log("error", {
        message: "websocket:subscribe:error",
        params: { error: error.message },
      });
    });

    return { ws };
  }

  async unsubscribe(handle) {
    if (!handle || !handle.ws) return;
    
    Logger.log("info", {
      message: "websocket:unsubscribe",
      params: { datasourceID: this.config.datasourceID },
    });

    try {
      handle.ws.terminate();
    } catch (e) {
      Logger.log("error", {
        message: "websocket:unsubscribe:error",
        params: { error: e.message },
      });
    }
  }
}
