export default function getMqttGuidance({
  listenerConfig = {},
  datasourceOptions = {},
}) {
  const topics = listenerConfig.topics || "sensors/+/temperature, alerts/#";
  const qos = listenerConfig.qos !== undefined ? listenerConfig.qos : 0;
  const host = datasourceOptions.host || datasourceOptions.brokerUrl || "broker.hivemq.com";
  const port = datasourceOptions.port || 1883;

  const firstTopic = topics.split(",")[0].trim().replace(/\+/g, "device1").replace(/#/g, "test");
  const pubSnippet = `mosquitto_pub -h ${host} -p ${port} -t "${firstTopic}" -m '{"temperature": 24.5, "status": "ok"}'`;

  return {
    title: "MQTT Listener Guidance",
    summary: "Subscribes to an MQTT broker for real-time IoT messages and telemetry streams.",
    badges: [
      { label: `Broker: ${host}:${port}`, color: "purple" },
      { label: `QoS: ${qos}`, color: "blue" },
    ],
    snippets: [
      {
        label: "MQTT CLI Test Publisher Command",
        language: "bash",
        code: pubSnippet,
      },
    ],
    instructions: `Subscribed topics: '${topics}'. Wildcards '+' (single level) and '#' (multi level) are supported.`,
  };
}
