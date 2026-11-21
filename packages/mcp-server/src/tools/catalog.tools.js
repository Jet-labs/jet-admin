// File: packages/mcp-server/src/tools/catalog.tools.js
/**
 * catalog.tools.js — plugin catalog discovery (offline-capable, no backend call)
 *
 * These tools answer "what CAN I build?" before any backend round-trip:
 *   - list_datasource_types  — all 35 @jet-admin/datasource-types values
 *   - list_listener_types    — 13 listener-capable subset
 *   - list_widget_types      — all 32 @jet-admin/widget-types
 *   - list_workflow_node_types — 13 implemented nodes (+2 declared, unimplemented)
 *
 * Static lists are embedded so catalog works even when the backend is down.
 * For live connection/query option shapes, follow up with get_datasource_schemas /
 * get_data_query_schemas / get_listener_schemas / get_widget_schemas / get_workflow_schema.
 */

const DATASOURCE_TYPES = [
  { value: "postgresql", name: "PostgreSQL", supportsListener: true },
  { value: "restapi", name: "REST API", supportsListener: false },
  { value: "weburl", name: "Web URL", supportsListener: false },
  { value: "firestore", name: "Firestore", supportsListener: true },
  { value: "mysql", name: "MySQL", supportsListener: false },
  { value: "mongodb", name: "MongoDB", supportsListener: true },
  { value: "googlesheets", name: "Google Sheets", supportsListener: false },
  { value: "graphql", name: "GraphQL", supportsListener: true },
  { value: "rabbitmq", name: "RabbitMQ", supportsListener: true },
  { value: "kafka", name: "Kafka", supportsListener: true },
  { value: "redis", name: "Redis", supportsListener: true },
  { value: "mssql", name: "Microsoft SQL Server", supportsListener: false },
  { value: "supabase", name: "Supabase", supportsListener: false },
  { value: "bigquery", name: "BigQuery", supportsListener: false },
  { value: "airtable", name: "Airtable", supportsListener: false },
  { value: "s3", name: "AWS S3", supportsListener: false },
  { value: "elasticsearch", name: "Elasticsearch", supportsListener: false },
  { value: "stripe", name: "Stripe", supportsListener: false },
  { value: "oracle", name: "Oracle", supportsListener: false },
  { value: "sqlite", name: "SQLite", supportsListener: false },
  { value: "cockroachdb", name: "CockroachDB", supportsListener: false },
  { value: "neo4j", name: "Neo4j", supportsListener: false },
  { value: "twilio", name: "Twilio", supportsListener: false },
  { value: "sendgrid", name: "SendGrid", supportsListener: false },
  { value: "slack", name: "Slack", supportsListener: false },
  { value: "notion", name: "Notion", supportsListener: false },
  { value: "jira", name: "Jira", supportsListener: false },
  { value: "googleanalytics", name: "Google Analytics", supportsListener: false },
  { value: "webhook", name: "Webhook", supportsListener: true },
  { value: "mqtt", name: "MQTT", supportsListener: true },
  { value: "websocket", name: "WebSocket", supportsListener: true },
  { value: "sse", name: "Server-Sent Events", supportsListener: true },
  { value: "syslog", name: "Syslog", supportsListener: true },
  { value: "nats", name: "NATS", supportsListener: true },
  { value: "excelcsv", name: "Excel & CSV", supportsListener: false },
];

const WIDGET_TYPES = [
  "vega-lite", "vega", "button", "table", "text", "stat", "alert", "form",
  "image", "iframe", "date-picker", "date-range-picker", "html", "text-input",
  "select", "multi-select", "checkbox", "radio-group", "switch", "slider",
  "search-input", "file-upload", "divider", "tabs", "key-value", "json-viewer",
  "list", "badge", "progress", "timeline", "video", "code-block",
];

const WORKFLOW_NODE_TYPES = [
  { type: "start", implemented: true },
  { type: "end", implemented: true },
  { type: "dataQuery", implemented: true },
  { type: "javascript", implemented: true },
  { type: "condition", implemented: true },
  { type: "switch", implemented: true },
  { type: "loop", implemented: true },
  { type: "delay", implemented: true },
  { type: "dataCollection", implemented: true },
  { type: "approval", implemented: true },
  { type: "fanout", implemented: true },
  { type: "join", implemented: true },
  { type: "subWorkflow", implemented: true },
  { type: "connectorPull", implemented: false },
  { type: "connectorPush", implemented: false },
];

export const catalogTools = [
  {
    name: "list_datasource_types",
    description:
      "List ALL available datasource plugin types (35) — the full @jet-admin/datasource-types catalog.\n\n" +
      "Returns: { totalCount, types: [{ value, name, supportsListener }] }.\n\n" +
      "Use this FIRST before create_datasource / test_datasource_connection — the old 4-type docs are " +
      "outdated. For live connection shapes call get_datasource_schemas; for query shapes call " +
      "get_data_query_schemas.\n\n" +
      "Example call: {} (no arguments)\n\n" +
      "Related: get_datasource_schemas, create_datasource, list_listener_types.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => ({
      totalCount: DATASOURCE_TYPES.length,
      types: DATASOURCE_TYPES,
    }),
  },
  {
    name: "list_listener_types",
    description:
      "List datasource types that can back a real-time listener (13 of 35).\n\n" +
      "Returns: { totalCount, types: [{ value, name }] } — valid listenerType values for create_listener.\n\n" +
      "Full set: postgresql, firestore, mongodb, graphql, rabbitmq, kafka, redis, webhook, mqtt, " +
      "websocket, sse, syslog, nats.\n\n" +
      "Example call: {}\n\n" +
      "Related: create_listener, get_listener_schemas, list_datasource_types.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => {
      const types = DATASOURCE_TYPES.filter((t) => t.supportsListener).map(({ value, name }) => ({ value, name }));
      return { totalCount: types.length, types };
    },
  },
  {
    name: "list_widget_types",
    description:
      "List ALL available widget types (32) from @jet-admin/widget-types.\n\n" +
      "Returns: { totalCount, types: [string] }. NOTE: there is no 'chart' type — use 'vega' or 'vega-lite'.\n\n" +
      "For authoritative config shapes call get_widget_schemas (all or per-type).\n\n" +
      "Example call: {}\n\n" +
      "Related: get_widget_schemas, create_widget.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => ({ totalCount: WIDGET_TYPES.length, types: WIDGET_TYPES }),
  },
  {
    name: "list_workflow_node_types",
    description:
      "List ALL workflow node types (13 implemented + 2 declared-unimplemented).\n\n" +
      "Returns: { totalCount, implemented: [string], unimplemented: [string], types: [{ type, implemented }] }.\n\n" +
      "Valid types for create_workflow nodes: start, end, dataQuery, javascript, condition, switch, loop, " +
      "delay, dataCollection, approval, fanout, join, subWorkflow. connectorPull/connectorPush are declared " +
      "but have no implementation — do not use them.\n\n" +
      "Example call: {}\n\n" +
      "Related: get_workflow_schema, create_workflow.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => ({
      totalCount: WORKFLOW_NODE_TYPES.length,
      implemented: WORKFLOW_NODE_TYPES.filter((n) => n.implemented).map((n) => n.type),
      unimplemented: WORKFLOW_NODE_TYPES.filter((n) => !n.implemented).map((n) => n.type),
      types: WORKFLOW_NODE_TYPES,
    }),
  },
];
