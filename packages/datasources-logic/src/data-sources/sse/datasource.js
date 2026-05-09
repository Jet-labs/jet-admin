import DataSource from "../datasource.js";
import EventSource from "eventsource";
import { Logger } from "../../utils/logger.js";

export default class SSEDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    throw new Error("SSE is a listener-only datasource.");
  }

  async subscribe(config, onEvent) {
    const datasourceOptions = this.config.datasourceOptions || {};
    const { endpoint, headers } = datasourceOptions;
    
    if (!endpoint) {
      throw new Error("SSE endpoint is required");
    }

    const eventNames = (config.eventNames || "").split(",").map(e => e.trim()).filter(Boolean);

    Logger.log("info", {
      message: "sse:subscribe:start",
      params: { endpoint, eventNames, datasourceID: this.config.datasourceID },
    });

    const options = {};
    if (headers && Array.isArray(headers)) {
      options.headers = {};
      headers.forEach(h => {
        if (h.key && h.value) options.headers[h.key] = h.value;
      });
    }

    const es = new EventSource(endpoint, options);

    es.onmessage = (event) => {
      let payload = event.data;
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        // keep as string
      }
      onEvent({ eventName: "message", payload });
    };

    for (const eventName of eventNames) {
      if (eventName === "message") continue;
      es.addEventListener(eventName, (event) => {
        let payload = event.data;
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          // keep as string
        }
        onEvent({ eventName, payload });
      });
    }

    es.onerror = (err) => {
      Logger.log("error", {
        message: "sse:subscribe:error",
        params: { error: err.message || "Unknown SSE error" },
      });
    };

    return { es };
  }

  async unsubscribe(handle) {
    if (!handle || !handle.es) return;
    
    Logger.log("info", {
      message: "sse:unsubscribe",
      params: { datasourceID: this.config.datasourceID },
    });

    try {
      handle.es.close();
    } catch (e) {
      Logger.log("error", {
        message: "sse:unsubscribe:error",
        params: { error: e.message },
      });
    }
  }
}
