import mqtt from "mqtt";

const CONNECT_TIMEOUT_MS = 5000;

export const mqttTestConnection = async ({ datasourceOptions }) => {
  const brokerUrl = datasourceOptions?.brokerUrl || datasourceOptions?.url;
  if (!brokerUrl) {
    return { ok: false, error: "MQTT broker URL is required." };
  }
  return await new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { client.end(true); } catch (_) { /* ignore */ }
      resolve(result);
    };
    const client = mqtt.connect(brokerUrl, {
      connectTimeout: CONNECT_TIMEOUT_MS,
      reconnectPeriod: 0,
      rejectUnauthorized: datasourceOptions?.rejectUnauthorized !== false,
    });
    const timer = setTimeout(
      () => finish({ ok: false, error: `MQTT connection timed out after ${CONNECT_TIMEOUT_MS}ms` }),
      CONNECT_TIMEOUT_MS + 500
    );
    client.once("connect", () => finish({ ok: true, success: true, status: 200, statusText: "Connected" }));
    client.once("error", (error) => finish({ ok: false, error: error.message || String(error) }));
  });
};
