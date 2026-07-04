export default function getRedisGuidance({ listenerConfig = {} }) {
  const subType = listenerConfig.subType || "pubsub";
  const channels = listenerConfig.channels || listenerConfig.pattern || "orders";
  const firstChannel = channels.split(",")[0].trim();
  const snippet = `redis-cli PUBLISH "${firstChannel}" '{"event": "user_signup", "id": 42}'`;

  return {
    title: "Redis Pub/Sub & Keyspace Guidance",
    summary: "Subscribes to Redis Pub/Sub channels or Keyspace pattern notifications.",
    badges: [
      { label: `Type: ${subType}`, color: "red" },
      { label: `Target: ${channels}`, color: "purple" },
    ],
    snippets: [
      {
        label: "redis-cli Publish Command",
        language: "bash",
        code: snippet,
      },
    ],
    instructions: "Captures messages published to Redis channels or keyspace expiration events.",
  };
}
