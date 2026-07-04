export default function getSyslogGuidance({ listenerConfig = {}, datasourceOptions = {} }) {
  const syslogPort = listenerConfig.port || datasourceOptions.port || 5514;
  const address = listenerConfig.address || datasourceOptions.address || "0.0.0.0";
  const snippet = `logger -n 127.0.0.1 -P ${syslogPort} -u "Test syslog event from Jet Admin"`;

  return {
    title: "Syslog UDP Receiver Guidance",
    summary: "Binds a local UDP Syslog receiver server socket to ingest system and router log streams.",
    badges: [
      { label: `Address: ${address}`, color: "purple" },
      { label: `Port: ${syslogPort} (UDP)`, color: "emerald" },
    ],
    snippets: [
      {
        label: "Linux Logger Test Command",
        language: "bash",
        code: snippet,
      },
    ],
    instructions: `Configure rsyslog, syslog-ng, or firewall routers to forward UDP logs to port ${syslogPort}.`,
  };
}
