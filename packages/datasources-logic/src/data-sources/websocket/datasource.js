import DataSource from "../datasource.js";
import WebSocket from "ws";
import { Logger } from "../../utils/logger.js";

export default class WebSocketDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    throw new Error("WebSocket is a listener-only datasource.");
  }

  async subscribe(config, onEvent) {
    const dsOptions = this.config.datasourceOptions || {};
    // Accept both `endpoint` (engine) and `url` (formConfig) keys.
    const endpoint = dsOptions.endpoint || dsOptions.url;
    const protocols = dsOptions.protocols || [];

    if (!endpoint) {
      throw new Error("WebSocket endpoint is required (provide datasourceOptions.endpoint or datasourceOptions.url)");
    }

    const messageFilter = (config.messageFilter ?? "").trim();
    const parseAsJSON = config.parseAsJSON !== false;

    Logger.log("info", {
      message: "websocket:subscribe:start",
      params: { endpoint, datasourceID: this.config.datasourceID },
    });

    const options = {};
    const normalizedHeaders = normalizeHeaders(dsOptions.headers);
    if (Object.keys(normalizedHeaders).length > 0) {
      options.headers = normalizedHeaders;
    }

    // Connect WebSocket
    const ws = new WebSocket(endpoint, protocols || [], options);

    ws.on("message", (data) => {
      const raw = data.toString();
      if (messageFilter) {
        try {
          if (!new RegExp(messageFilter).test(raw)) return;
        } catch {
          // Invalid regex — do not filter, deliver the event.
        }
      }
      let payload = raw;
      if (parseAsJSON) {
        try {
          payload = JSON.parse(raw);
        } catch (e) {
          // keep as string
        }
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

function normalizeHeaders(rawHeaders) {
  if (!rawHeaders) return {};
  if (Array.isArray(rawHeaders)) {
    const out = {};
    for (const h of rawHeaders) {
      if (h && h.key && h.value !== undefined) out[h.key] = h.value;
    }
    return out;
  }
  if (typeof rawHeaders === "string") {
    const trimmed = rawHeaders.trim();
    if (!trimmed) return {};
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      return {};
    }
    return {};
  }
  if (typeof rawHeaders === "object") return { ...rawHeaders };
  return {};
}
