export default function getNatsGuidance({ listenerConfig = {}, datasourceOptions = {} }) {
  const servers = datasourceOptions.servers || "nats://localhost:4222";
  const subject = listenerConfig.subject || "orders.*";
  const queue = listenerConfig.queue || "workers";
  const snippet = `nats pub "${subject.replace(/\*/g, "created")}" '{"orderId": "1001", "status": "paid"}'`;

  return {
    title: "NATS Listener Guidance",
    summary: "Subscribes to NATS server subjects for high-performance event messaging.",
    badges: [
      { label: `Servers: ${servers}`, color: "blue" },
      { label: `Subject: ${subject}`, color: "purple" },
      ...(queue ? [{ label: `Queue: ${queue}`, color: "emerald" }] : []),
    ],
    snippets: [
      {
        label: "NATS CLI Publish Command",
        language: "bash",
        code: snippet,
      },
    ],
    instructions: "Wildcards '*' (single token) and '>' (multi token) are supported for subject matching.",
  };
}
