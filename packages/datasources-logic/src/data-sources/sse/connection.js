import axios from "axios";

const CONNECT_TIMEOUT_MS = 5000;

export const sseTestConnection = async ({ datasourceOptions }) => {
  const endpoint = datasourceOptions?.url || datasourceOptions?.endpoint;
  if (!endpoint) {
    return { ok: false, error: "SSE URL is required." };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);
  try {
    const response = await axios.get(endpoint, {
      responseType: "stream",
      timeout: CONNECT_TIMEOUT_MS,
      signal: controller.signal,
      validateStatus: () => true,
      headers: { Accept: "text/event-stream" },
    });
    if (response.status >= 200 && response.status < 300) {
      // Abort the stream immediately; we only needed headers/handshake.
      try { response.data?.destroy?.(); } catch (_) { /* ignore */ }
      return { ok: true, success: true, status: response.status, statusText: "Connected" };
    }
    return { ok: false, error: `SSE endpoint returned HTTP ${response.status}` };
  } catch (error) {
    return { ok: false, error: error.message || String(error) };
  } finally {
    clearTimeout(timer);
  }
};
