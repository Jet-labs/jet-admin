export default function getFirestoreGuidance({ listenerConfig = {} }) {
  const collection = listenerConfig.collection || "orders";
  const snippet = `// Trigger snapshot listener in Firebase SDK:
await db.collection("${collection}").add({
  status: "new",
  timestamp: new Date()
});`;

  return {
    title: "Firestore Real-time Listener Guidance",
    summary: "Subscribes to Google Cloud Firestore real-time collection document changes.",
    badges: [{ label: `Collection: ${collection}`, color: "amber" }],
    snippets: [
      {
        label: "Firebase JS SDK Document Trigger",
        language: "javascript",
        code: snippet,
      },
    ],
    instructions: "Listens for document creates, updates, and deletes in the specified Firestore collection.",
  };
}
