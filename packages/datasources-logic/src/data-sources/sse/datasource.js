import DataSource from "../datasource.js";
import * as EventSourceNs from "eventsource";
import { Logger } from "../../utils/logger.js";

// eventsource@4 exports { EventSource, ErrorEvent } with an __esModule flag
// (so a default import compiles to `.default` which does NOT exist).
// Older versions export the class directly. A namespace import keeps member
// access intact through esbuild external interop; resolve both shapes here.
const EventSource =
  EventSourceNs?.EventSource || EventSourceNs?.default || EventSourceNs;

export default class SSEDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    throw new Error("SSE is a listener-only datasource.");
  }

  async subscribe(config, onEvent) {
    const datasourceOptions = this.config.datasourceOptions || {};
    // Accept both `endpoint` (engine) and `url` (formConfig) keys.
    const endpoint = datasourceOptions.endpoint || datasourceOptions.url;
    const rawHeaders = datasourceOptions.headers;

    if (!endpoint) {
      throw new Error("SSE endpoint is required (provide datasourceOptions.endpoint or datasourceOptions.url)");
    }

    // Accept both `eventNames` (legacy) and `eventTypes` (listenerConfig form) keys.
    const eventFilterRaw = config.eventNames ?? config.eventTypes ?? "";
    const eventNames = String(eventFilterRaw).split(",").map(e => e.trim()).filter(Boolean);
    const parseAsJSON = config.parseAsJSON !== false;

    Logger.log("info", {
      message: "sse:subscribe:start",
      params: { endpoint, eventNames, datasourceID: this.config.datasourceID },
    });

    const options = {};
    const normalizedHeaders = normalizeHeaders(rawHeaders);
    if (Object.keys(normalizedHeaders).length > 0) {
      options.headers = normalizedHeaders;
    }

    if (typeof EventSource !== 'function') {
      throw new Error('SSE EventSource client is unavailable (eventsource package shape mismatch)');
    }

    const es = new EventSource(endpoint, options);

    const parsePayload = (data) => {
      if (!parseAsJSON) return data;
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    };

    es.onmessage = (event) => {
      onEvent({ eventName: "message", payload: parsePayload(event.data) });
    };

    for (const eventName of eventNames) {
      if (eventName === "message") continue;
      es.addEventListener(eventName, (event) => {
        onEvent({ eventName, payload: parsePayload(event.data) });
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
