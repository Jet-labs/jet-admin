export default function getGraphqlGuidance({ listenerConfig = {}, datasourceOptions = {} }) {
  const wsEndpoint = datasourceOptions.wsEndpoint || "ws://localhost:4000/graphql";
  const query = listenerConfig.subscriptionQuery || "subscription {\n  orderCreated {\n    id\n    amount\n  }\n}";

  return {
    title: "GraphQL Subscription Guidance",
    summary: "Establishes a GraphQL WebSocket subscription using graphql-ws protocol.",
    badges: [{ label: `WS Endpoint: ${wsEndpoint}`, color: "pink" }],
    snippets: [
      {
        label: "GraphQL Subscription Query",
        language: "graphql",
        code: query,
      },
    ],
    instructions: "Receives real-time data pushes published by your GraphQL subscription endpoint.",
  };
}
