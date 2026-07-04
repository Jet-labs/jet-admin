export default function getSseGuidance({ listenerConfig = {}, datasourceOptions = {} }) {
  const endpoint = datasourceOptions.endpoint || "http://localhost:3000/events";
  const eventNames = listenerConfig.eventNames || "all un-named events";
  const snippet = `curl -N "${endpoint}"`;

  return {
    title: "Server-Sent Events (SSE) Guidance",
    summary: "Opens an HTTP EventSource stream to receive real-time server events.",
    badges: [
      { label: `Endpoint: ${endpoint}`, color: "blue" },
      { label: `Events: ${eventNames}`, color: "emerald" },
    ],
    snippets: [
      {
        label: "Curl EventSource Stream Test Command",
        language: "bash",
        code: snippet,
      },
    ],
    instructions: "Listens for HTTP stream events. Custom event names specified in configuration will trigger pipelines.",
  };
}
