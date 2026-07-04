export default function getPostgresqlGuidance({ listenerConfig = {} }) {
  const channels = listenerConfig.channels || "orders_channel";
  const firstChannel = channels.split(",")[0].trim();
  const snippet = `NOTIFY ${firstChannel}, '{"event": "order_created", "id": 1001}';`;

  return {
    title: "PostgreSQL LISTEN / NOTIFY Guidance",
    summary: "Listens for real-time PostgreSQL database notification events.",
    badges: [{ label: `Channels: ${channels}`, color: "purple" }],
    snippets: [
      {
        label: "SQL NOTIFY Test Command",
        language: "sql",
        code: snippet,
      },
    ],
    instructions: "Execute NOTIFY in SQL or triggers to push live notifications to Jet Admin.",
  };
}
