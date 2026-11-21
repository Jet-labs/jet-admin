import { connect, StringCodec } from "nats";

const CONNECT_TIMEOUT_MS = 5000;

export const natsTestConnection = async ({ datasourceOptions }) => {
  const servers = datasourceOptions?.servers || datasourceOptions?.server;
  if (!servers) {
    return { ok: false, error: "NATS server URL is required." };
  }
  let nc;
  try {
    nc = await connect({
      servers: String(servers).split(",").map((s) => s.trim()).filter(Boolean),
      timeout: CONNECT_TIMEOUT_MS,
      reconnect: false,
    });
    // Flush proves the connection is usable, not just that a socket opened.
    nc.publish("jetadmin.connection.test", StringCodec().encode("ping"));
    await nc.flush();
    return { ok: true, success: true, status: 200, statusText: "Connected" };
  } catch (error) {
    return { ok: false, error: error.message || String(error) };
  } finally {
    if (nc) {
      try { await nc.close(); } catch (_) { /* ignore */ }
    }
  }
};
