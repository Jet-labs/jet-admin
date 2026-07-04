export default function getMongodbGuidance({ listenerConfig = {} }) {
  const collection = listenerConfig.collection || "transactions";
  const snippet = `db.${collection}.insertOne({ type: "payment", amount: 100, createdAt: new Date() });`;

  return {
    title: "MongoDB Change Stream Guidance",
    summary: "Subscribes to MongoDB Change Streams on target collections.",
    badges: [{ label: `Collection: ${collection}`, color: "emerald" }],
    snippets: [
      {
        label: "MongoDB Shell Insert Command",
        language: "javascript",
        code: snippet,
      },
    ],
    instructions: "Listens for document mutations (insert, update, replace, delete) on your MongoDB cluster.",
  };
}
