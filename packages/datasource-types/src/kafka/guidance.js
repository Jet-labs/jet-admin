export default function getKafkaGuidance({ listenerConfig = {}, datasourceOptions = {} }) {
  const brokers = datasourceOptions.brokers || "localhost:9092";
  const topics = listenerConfig.topics || "user-events";
  const groupId = listenerConfig.groupId || "jet-admin-consumer";
  const snippet = `kafka-console-producer.sh --bootstrap-server ${brokers} --topic ${topics.split(",")[0].trim()}`;

  return {
    title: "Apache Kafka Listener Guidance",
    summary: "Connects to a Kafka cluster as a consumer group to consume topic message streams.",
    badges: [
      { label: `Brokers: ${brokers}`, color: "blue" },
      { label: `Topics: ${topics}`, color: "purple" },
      { label: `Group: ${groupId}`, color: "emerald" },
    ],
    snippets: [
      {
        label: "Kafka Console Producer Command",
        language: "bash",
        code: snippet,
      },
    ],
    instructions: "Consumes messages as part of the specified consumer group. Supports partition rebalancing.",
  };
}
