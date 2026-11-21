import dns from "dns/promises";
import net from "net";

const CONNECT_TIMEOUT_MS = 5000;

export const syslogTestConnection = async ({ datasourceOptions }) => {
  const host = datasourceOptions?.host;
  const port = Number(datasourceOptions?.port);
  const protocol = String(datasourceOptions?.protocol || "udp").toLowerCase();
  if (!host) {
    return { ok: false, error: "Syslog host is required." };
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, error: "Syslog port must be between 1 and 65535." };
  }
  try {
    await dns.lookup(host);
  } catch (error) {
    return { ok: false, error: `Cannot resolve syslog host '${host}': ${error.message}` };
  }
  if (protocol !== "tcp") {
    // UDP has no handshake; validating host + port is the strongest
    // non-sending check. The listener is passive by design.
    return { ok: true, success: true, status: 200, statusText: "Host resolved (UDP)" };
  }
  return await new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      resolve(result);
    };
    const timer = setTimeout(
      () => finish({ ok: false, error: `Syslog TCP connection timed out after ${CONNECT_TIMEOUT_MS}ms` }),
      CONNECT_TIMEOUT_MS
    );
    socket.once("connect", () => finish({ ok: true, success: true, status: 200, statusText: "Connected" }));
    socket.once("error", (error) => finish({ ok: false, error: error.message || String(error) }));
  });
};
