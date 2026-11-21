import WebSocket from "ws";

const CONNECT_TIMEOUT_MS = 5000;

export const websocketTestConnection = async ({ datasourceOptions }) => {
  const endpoint = datasourceOptions?.url || datasourceOptions?.endpoint;
  if (!endpoint) {
    return { ok: false, error: "WebSocket URL is required." };
  }
  return await new Promise((resolve) => {
    let settled = false;
    const ws = new WebSocket(endpoint, {
      handshakeTimeout: CONNECT_TIMEOUT_MS,
      rejectUnauthorized: datasourceOptions?.rejectUnauthorized !== false,
    });
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { ws.terminate(); } catch (_) { /* ignore */ }
      resolve(result);
    };
    const timer = setTimeout(
      () => finish({ ok: false, error: `WebSocket connection timed out after ${CONNECT_TIMEOUT_MS}ms` }),
      CONNECT_TIMEOUT_MS + 500
    );
    ws.once("open", () => finish({ ok: true, success: true, status: 200, statusText: "Connected" }));
    ws.once("error", (error) => finish({ ok: false, error: error.message || String(error) }));
  });
};
