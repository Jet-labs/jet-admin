export default function getWebsocketGuidance({ datasourceOptions = {} }) {
  const endpoint = datasourceOptions.endpoint || "ws://localhost:8080/ws";
  const snippet = `wscat -c "${endpoint}"`;

  return {
    title: "WebSocket Listener Guidance",
    summary: "Connects as a client to a remote WebSocket server endpoint (ws:// or wss://).",
    badges: [{ label: `Endpoint: ${endpoint}`, color: "blue" }],
    snippets: [
      {
        label: "WebSocket Client Test Command (wscat)",
        language: "bash",
        code: snippet,
      },
    ],
    instructions: "Maintains a persistent socket connection. Incoming JSON/string frames are queued for pipeline execution.",
  };
}
