export default function getRabbitmqGuidance({ listenerConfig = {} }) {
  const exchange = listenerConfig.exchange || "amq.topic";
  const routingKey = listenerConfig.routingKey || "orders.created";
  const queueName = listenerConfig.queueName || "jet-admin-queue";
  const snippet = `rabbitmqadmin publish exchange="${exchange}" routing_key="${routingKey}" payload='{"orderId": 123, "status": "created"}'`;

  return {
    title: "RabbitMQ AMQP Guidance",
    summary: "Asserts exchange, binds queue, and consumes real-time AMQP messages.",
    badges: [
      { label: `Exchange: ${exchange}`, color: "purple" },
      { label: `Routing Key: ${routingKey}`, color: "blue" },
      { label: `Queue: ${queueName || "auto-generated"}`, color: "emerald" },
    ],
    snippets: [
      {
        label: "RabbitMQ Admin Publish Command",
        language: "bash",
        code: snippet,
      },
    ],
    instructions: "Listens for messages matching the specified routing key pattern.",
  };
}
