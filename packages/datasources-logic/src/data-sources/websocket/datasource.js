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

    // Reconnection is owned here, not by the listener engine: without it a
    // dropped socket stays dead until a config change or process restart.
    const state = { stopped: false, attempts: 0, socket: null, timer: null };
    const connect = () => {
      if (state.stopped) return;
      state.timer = null;
      const ws = new WebSocket(endpoint, protocols || [], options);
      state.socket = ws;

      ws.on("open", () => {
        state.attempts = 0;
        Logger.log("success", {
          message: "websocket:connected",
          params: { datasourceID: this.config.datasourceID },
        });
      });

      ws.on("message", async (data) => {
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
        try {
          // Await so a rejected durable enqueue reaches the sender and can be retried.
          await onEvent({ payload });
        } catch (error) {
          Logger.log("error", {
            message: "websocket:event:rejected",
            params: { datasourceID: this.config.datasourceID, error: error.message },
          });
        }
      });

      ws.on("error", (error) => {
        Logger.log("error", {
          message: "websocket:subscribe:error",
          params: { error: error.message },
        });
      });

      ws.on("close", () => {
        if (state.stopped) return;
        const delay = Math.min(30000, 1000 * 2 ** Math.min(state.attempts, 5));
        state.attempts += 1;
        Logger.log("warning", {
          message: "websocket:reconnecting",
          params: { datasourceID: this.config.datasourceID, delayMs: delay, attempt: state.attempts },
        });
        state.timer = setTimeout(connect, delay);
      });
    };

    connect();
    this._connectionState = state;

    const handle = {
      get ws() { return state.socket; },
      stop() {
        state.stopped = true;
        if (state.timer) clearTimeout(state.timer);
        state.timer = null;
      },
    };
    return handle;
  }

  get recoveryMode() {
    return "plugin";
  }

  /** Observed transport state, separate from the engine's activation intent. */
  getConnectionState() {
    const state = this._connectionState;
    if (!state || state.stopped) return "closed";
    if (state.socket && state.socket.readyState === 1) return "open";
    if (state.timer) return "reconnecting";
    return "connecting";
  }

  async healthCheck() {
    // Transient drops are owned by the reconnect loop; only a stopped
    // subscription is a hard failure the engine should act on.
    return true;
  }

  async unsubscribe(handle) {
    if (!handle) return;
    if (typeof handle.stop === "function") handle.stop();
    if (!handle.ws) return;

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
