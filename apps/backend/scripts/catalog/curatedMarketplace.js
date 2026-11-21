/**
 * Scenario-first bundles built from maintained executable platform scenarios.
 * Every entry carries its dependency closure. Widget entries include a page:
 * state.queries bindings need a page runtime, not just a widget configuration.
 * This first quality tranche does NOT repair the old 400+ generated entries.
 */
const crypto = require("crypto");
const { buildManifest, ref } = require("../showcase/manifest");
const { addAdvancedScenarios } = require("./advancedScenarios");
const { sizeCuratedPage, readableChart } = require("./curatedLayout");

const VERSION = "marketplace-curated-v2";
const expr = (body) => `{{ ${body} }}`;
const clone = (value) => JSON.parse(JSON.stringify(value));
function uuid(key) {
  const b = crypto.createHash("sha256").update(`${VERSION}:${key}`).digest().subarray(0, 16);
  b[6] = (b[6] & 15) | 64;
  b[8] = (b[8] & 63) | 128;
  const h = b.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
const REFERENCE_TYPES = {
  queryID: "dataQuery", dataQueryID: "dataQuery", datasourceID: "datasource",
  workflowID: "workflow", childWorkflowID: "workflow", listenerID: "listener",
};
const COLLECTIONS = {
  datasource: ["datasources", "datasourceID"], dataQuery: ["queries", "dataQueryID"],
  workflow: ["workflows", "workflowID"], widget: ["widgets", "widgetID"], appPage: ["pages", "appPageID"],
};

function collectReferences(value, refs = []) {
  if (!value || typeof value !== "object") return refs;
  for (const [key, v] of Object.entries(value)) {
    if (REFERENCE_TYPES[key] && typeof v === "string") refs.push({ type: REFERENCE_TYPES[key], id: v });
    else if (key === "widgetKey" && typeof v === "string") refs.push({ type: "widget", id: v.split("_")[1] });
    else if (key === "widgets" && Array.isArray(v)) v.forEach((k) => refs.push({ type: "widget", id: k.split("_")[1] }));
    else collectReferences(v, refs);
  }
  return refs;
}

/** Read expression strings directly, not JSON-escaped text. */
function collectPageAliases(value, aliases = new Set()) {
  if (typeof value === "string") {
    const pattern = /state\.(?:queries|workflows)(?:\.([A-Za-z_][A-Za-z_0-9]*)|\[\s*(['"])([^'"]+)\2\s*\])/g;
    for (const match of value.matchAll(pattern)) aliases.add(match[1] || match[3]);
  } else if (value && typeof value === "object") {
    if (value.actionType === "EXECUTE_QUERY" && value.config?.alias) aliases.add(value.config.alias);
    Object.values(value).forEach((v) => collectPageAliases(v, aliases));
  }
  return aliases;
}

function payloadFor(type, row) {
  switch (type) {
    case "datasource": return {
      datasourceTitle: row.datasourceTitle, datasourceDescription: row.datasourceDescription,
      datasourceType: row.datasourceType, datasourceOptions: row.datasourceOptions,
      datasourceTags: ["integration", "curated", row.requiresReconnect ? "requires-connection" : ["duckdb", "sqlite"].includes(row.datasourceType) ? "demo" : "public-api", row.datasourceType],
      requiresReconnect: row.requiresReconnect ?? false,
    };
    case "dataQuery": return {
      dataQueryTitle: row.dataQueryTitle, dataQueryDescription: row.dataQueryDescription,
      datasourceType: row.datasourceType, dataQueryOptions: row.dataQueryOptions, runOnLoad: false,
    };
    case "widget": return {
      widgetTitle: row.widgetTitle, widgetDescription: row.widgetDescription,
      widgetType: row.widgetType, widgetConfig: row.widgetConfig, refreshInterval: null,
    };
    case "workflow": return {
      title: row.title, workflowOptions: row.workflowOptions,
      nodes: row.nodes.map(({ nodeID, nodeType, nodeConfig, timeoutSeconds, retryLimit }) =>
        ({ nodeID, nodeType, nodeConfig, timeoutSeconds, retryLimit })),
      edges: row.edges.map(({ upstreamNodeID, downstreamNodeID, sourceHandle, targetHandle, edgeType, edgeConfig }) =>
        ({ upstreamNodeID, downstreamNodeID, sourceHandle, targetHandle, edgeType, edgeConfig })),
    };
    case "appPage": return {
      appPageTitle: row.appPageTitle, appPageDescription: row.appPageDescription, appPageConfig: row.appPageConfig,
    };
    default: throw new Error(`Unsupported curated resource ${type}`);
  }
}

function compileBundle(manifest, roots) {
  const index = new Map();
  for (const [type, [collection, idField]] of Object.entries(COLLECTIONS)) {
    manifest[collection].forEach((row) => index.set(`${type}:${row[idField]}`, row));
  }
  const done = new Set(), visiting = new Set(), items = [];
  function visit({ type, id }) {
    const key = `${type}:${id}`;
    if (done.has(key)) return;
    if (visiting.has(key)) throw new Error(`Circular curated dependency ${key}`);
    const row = index.get(key);
    if (!row) throw new Error(`Unbundled curated dependency ${key}`);
    visiting.add(key);
    const payload = clone(payloadFor(type, row));
    if (type === "appPage") sizeCuratedPage(payload.appPageConfig, (id) => index.get(`widget:${id}`)?.widgetType);
    if (type === "widget" && ["vega", "vega-lite"].includes(payload.widgetType)) readableChart(payload.widgetConfig);
    const refs = collectReferences(payload);
    if (type === "dataQuery") refs.push({ type: "datasource", id: row.datasourceID });
    const dependencies = [...new Map(refs.map((r) => [`${r.type}:${r.id}`, { ...r, bundled: true }])).values()];
    dependencies.forEach(visit);
    items.push({ type, id, payload: clone(payload), dependencies });
    visiting.delete(key);
    done.add(key);
  }
  roots.forEach(visit);
  return { bundleVersion: 1, generator: VERSION, items };
}

/** UUIDs embedded in expressions cannot be remapped at install; use aliases. */
function preparePages(manifest) {
  manifest.workflows.find((w) => w.workflowID === ref("workflow", "approval")).title = "Risk · high-value exposure approval review";
  const fulfillment = manifest.workflows.find((w) => w.workflowID === ref("workflow", "fulfillment"));
  const gate = fulfillment.nodes.find((n) => n.nodeType === "condition");
  gate.nodeConfig.branches[0].label = "Payment, stock or risk hold";
  gate.nodeConfig.branches[0].condition = "!ctx.orderRows[0].paid || ctx.orderRows[0].on_hand < ctx.orderRows[0].units || !ctx.riskAssessment || !ctx.riskAssessment.result || ctx.riskAssessment.result.decision !== 'release'";
  for (const page of manifest.pages) {
    const config = page.appPageConfig;
    config.dataSources = config.dataSources.filter((s) => s.type !== "listener");
    const widgets = manifest.widgets.filter((w) => config.widgets.some((k) => k.split("_")[1] === w.widgetID));
    if (page.appPageID === ref("page", "events")) {
      const live = widgets.find((w) => w.widgetType === "json-viewer" && /live/i.test(w.widgetTitle));
      live.widgetTitle = "Live ingress setup (not activated)";
      live.widgetConfig.dataTemplate = expr("({mode: 'demo', liveIngress: false, instructions: 'Configure and activate a separate authenticated listener for live events.'})");
    }
    const aliases = new Map();
    function rewrite(value) {
      if (!value || typeof value !== "object") return;
      if (value.actionType === "TRIGGER_WORKFLOW") {
        const { workflowID, ...rest } = value.config;
        if (!aliases.has(workflowID)) aliases.set(workflowID, `playbook_${aliases.size + 1}`);
        value.actionType = "EXECUTE_QUERY";
        value.config = { alias: aliases.get(workflowID), ...rest };
      }
      Object.values(value).forEach(rewrite);
    }
    widgets.forEach((w) => rewrite(w.widgetConfig));
    for (const [workflowID, alias] of aliases) {
      config.dataSources.push({ alias, type: "workflow", workflowID, triggerMode: "manual", inputValues: {}, refreshOn: [] });
      for (const widget of widgets) {
        widget.widgetConfig = JSON.parse(JSON.stringify(widget.widgetConfig).replaceAll(`direct_workflow_${workflowID}`, alias));
      }
    }
  }
}

/** A focused widget preview, not a duplicate of the full workspace bundle. */
function addPanelPage(manifest, pageKey, widgetKey, title) {
  const original = manifest.pages.find((p) => p.appPageID === ref("page", pageKey));
  const companionKeys = {
    "commerce:queue": ["region", "reset", "detail"],
    "events:payload": ["routeStatus", "routeResult"],
  }[`${pageKey}:${widgetKey}`] || [];
  const ids = [widgetKey, ...companionKeys].map((k) => ref("widget", `${pageKey}:${k}`));
  const page = clone(original);
  page.appPageID = uuid(`panel-page:${pageKey}:${widgetKey}`);
  page.appPageTitle = `${title} · demo preview`;
  page.appPageDescription = "Focused component preview with bundled queries. Synthetic data; no production changes.";
  page.appPageConfig.widgets = original.appPageConfig.widgets.filter((k) => ids.includes(k.split("_")[1]));
  function prune(node) {
    if (node.type === "widget") return ids.includes(node.widgetKey.split("_")[1]) ? node : null;
    const children = (node.children || []).map(prune).filter(Boolean);
    return children.length ? { ...node, children } : null;
  }
  page.appPageConfig.layout = prune(page.appPageConfig.layout);
  const aliases = collectPageAliases(manifest.widgets.filter((w) => ids.includes(w.widgetID)).map((w) => w.widgetConfig));
  page.appPageConfig.dataSources = page.appPageConfig.dataSources.filter((s) => aliases.has(s.alias));
  manifest.pages.push(page);
  return { type: "appPage", id: page.appPageID };
}

const APP_RECIPES = [
  ["commerce", "Order fulfillment control tower", "Payments & Commerce", "SiStripe",
    "Demo · Region-filtered order queue, row-to-detail inventory join, revenue trends and a nested risk-scoring fulfillment playbook.",
    ["reactive filters", "master-detail", "inventory join", "child workflow", "payment hold"]],
  ["risk", "Fraud review and exposure approval desk", "Identity & Security", "TbShieldCheck",
    "Demo · Adjustable risk thresholds, customer anomaly clusters, policy lookup, bounded batch scoring and approval/reject/expiry routes.",
    ["risk scoring", "bounded loop", "human approval", "expiry", "customer clusters"]],
  ["treasury", "Settlement reconciliation and closeout room", "Payments & Commerce", "SiStripe",
    "Demo · Unpaid receivables, missing settlements, aging buckets and a parallel ledger reconciliation that returns a closeout packet.",
    ["fanout", "barrier join", "receivables aging", "reconciliation"]],
  ["reliability", "SLO incident escalation and recovery room", "Monitoring", "SiPrometheus",
    "Demo · Service latency correlation, customer impact, P1/P2 escalation, durable cooldown and an explicit compensating error route.",
    ["severity switch", "cooldown", "error recovery", "SLO burn"]],
  ["supply", "Demand, shortage and supplier exception planner", "Data & Analytics", "TbTruck",
    "Demo · Demand-to-stock joins, costed reorder shortages, supplier concentration and a human intake form for revised ETAs.",
    ["inventory join", "reorder costing", "human intake", "supplier search"]],
  ["events", "Event contract quarantine and replay workbench", "Messaging", "TbWebhook",
    "Demo · Submit structured envelopes, route warning/error cases, inspect normalized results and replay Unicode/null/zero contract samples. No live listener is activated.",
    ["form submission", "dedupe key", "contract boundaries", "quarantine routing"]],
  ["integrations", "GitHub, GraphQL and economic enrichment observatory", "DevOps & Infrastructure", "SiGithub",
    "Public APIs · Manually fetch repository metadata/issues, a GraphQL country/currency directory and World Bank context. Provider failures remain visible.",
    ["native GitHub", "GraphQL", "REST", "manual network requests"]],
];
const WORKFLOW_RECIPES = [
  ["fulfillment", "Risk-gated order allocation with nested scoring", "Payments & Commerce", "Loads a selected order with inventory, invokes a child risk scorer and branches to a held or allocated decision. Demo only; never changes orders.", ["dataQuery", "subWorkflow", "condition"], { orderID: 1 }],
  ["batchRisk", "Bounded fraud batch with per-record exception isolation", "Identity & Security", "Screens high-risk orders, bounds the batch to eight, loops with skip-item isolation and aggregates reject/review decisions. Demo only.", ["dataQuery", "loop", "javascript"], {}],
  ["reconciliation", "Parallel receivables and exception-ledger closeout", "Payments & Commerce", "Fans out into independent ledger queries, joins only when both finish and emits totals plus exception evidence. No funds are released.", ["fanout", "join", "dataQuery"], {}],
  ["approval", "Exposure release review with rejection and expiry", "Identity & Security", "Loads exposure, suspends for a required-comment approval and records distinct approved, rejected and expired outcomes. Does not enforce independent-reviewer separation. No production write.", ["approval", "dataQuery", "javascript"], {}],
  ["incident", "Severity escalation with a durable quiet period", "Monitoring", "Fetches incident context, switches P1/P2/default priorities, delays P2 handling and returns a response packet. No notification is sent.", ["switch", "delay", "dataQuery"], {}],
  ["supplier", "Supplier ETA intake and costed restock proposal", "Data & Analytics", "Joins demand/stock, collects a validated revised ETA and reason, then returns the shortage lines needing action. No purchase order is sent.", ["dataCollection", "dataQuery", "javascript"], {}],
  ["event", "Envelope normalization, dedupe key and quarantine routing", "Messaging", "Normalizes event payloads, derives a stable dedupe key and routes warnings separately. The fail sample deliberately exercises error feedback; no dedupe store is claimed.", ["javascript", "switch"], { event: { event_id: "review-1", order_id: 7, severity: "warning" } }],
  ["recovery", "Upstream failure with an explicit compensating fallback", "Monitoring", "Deliberately fails a bounded upstream step, follows the error handle and returns a clearly labeled synthetic fallback packet.", ["javascript"], {}],
  ["riskScore", "Reusable payment-aware order risk scoring sub-playbook", "Payments & Commerce", "Accepts an order object, adds an unpaid penalty, caps the risk score and returns release/review/reject decisions for parent workflows.", ["javascript"], { order: { order_id: 19, risk: 85, paid: false } }],
];
const WIDGET_RECIPES = [
  ["commerce", "queue", "Fulfillment queue with selectable inventory detail", "Payments & Commerce", "Region-filtered work queue, row selection and a companion inventory-detail panel; includes the page and queries that power the interaction."],
  ["commerce", "trend", "Daily revenue trend with cumulative warehouse query", "Data & Analytics", "A real DuckDB aggregation and running-total query bound to a responsive Vega-Lite line chart, with an installable preview page."],
  ["risk", "clusters", "Repeat-customer anomaly exposure chart", "Identity & Security", "Groups repeat customers, filters average risk and ranks exposure; includes the warehouse query and runnable chart page."],
  ["treasury", "aging", "Receivables aging ladder", "Payments & Commerce", "Buckets unpaid exposure into 0–24h, 24–48h and 48h+ bands; the chart reads the bundled aggregation, not hardcoded chart values."],
  ["treasury", "coverage", "Matched-and-paid settlement coverage KPI", "Payments & Commerce", "Computes settlement coverage from paid and matched records; includes the query-backed KPI and a demo page."],
  ["reliability", "health", "Service latency correlation panel", "Monitoring", "Aggregates incident latency, error rates and burn by service; includes the query-backed chart and demo runtime."],
  ["supply", "suppliers", "Server-filtered supplier concentration scorecard", "Data & Analytics", "Server-side supplier search, SKU coverage and costed reorder exposure, with its queries and companion page included."],
  ["events", "payload", "Validated envelope intake with workflow result feedback", "Messaging", "An event form with required fields, severity routing and visible status/result panels; installs the workflow and page dependencies."],
  ["events", "history", "Replay envelope timeline", "Messaging", "A timeline bound to a deterministic event history query, including timestamps, descriptions and a companion runtime page."],
  ["events", "edge", "Null, Unicode and numeric boundary contract grid", "Data & Analytics", "A query-backed grid for null/empty strings, zero, false, Unicode and large safe integers. Includes executable SQL and its preview page."],
];

function catalogEntry({ slug, itemType, title, description, category, icon = "TbPuzzle", features, bundle, root, mode, setup, sampleInputs }) {
  const limitations = {
    "public-api": ["Network access and provider availability are required; rate limits may apply.", "Read-only queries run manually; no background polling or external writes."],
    "requires-connection": ["Requires your own database credentials; none are embedded in the bundle.", "Queries read information_schema only; visible tables depend on the database user's permissions."],
    demo: ["Synthetic fixture data; not connected to your production systems.", "Human-input workflows wait for an explicit decision or timeout.", "Workflow transport and browser execution need separate end-to-end verification."],
  }[mode] || ["Review this bundle's setup and limitations before use."];
  bundle.marketplace = {
    root, mode, features, setup, sampleInputs: sampleInputs || {}, limitations,
    verification: { status: "pending", schema: false, localRuntime: false, browser: false, liveProvider: false },
  };
  return {
    itemID: uuid(slug), slug, itemType, title, description, category,
    tags: ["integration", "curated-v2", mode, ...features], icon, iconColor: "#2563eb",
    publisher: "jet-admin", version: "2.0.1", payload: bundle,
    isVerified: false, installCount: 0, sourceFamily: "curated-playbooks", publishedByUserID: null,
  };
}

/**
 * A real PostgreSQL starting workspace. It intentionally requires reconnect,
 * but the page, widgets, queries and datasource are one dependency-complete
 * bundle rather than the former blank app-page placeholder.
 */
function addPostgresAdminApp(manifest) {
  const id = (key) => uuid(`postgres-admin:${key}`);
  const datasourceID = id("datasource");
  const queryIDs = {
    tables: id("query:tables"),
    tableCount: id("query:table-count"),
    rows: id("query:rows"),
    rowCount: id("query:row-count"),
    columns: id("query:columns"),
    constraints: id("query:constraints"),
    indexes: id("query:indexes"),
    size: id("query:size"),
  };
  const widgetIDs = {
    instructions: id("widget:instructions"),
    refresh: id("widget:refresh"),
    loadRows: id("widget:load-rows"),
    viewSchema: id("widget:view-schema"),
    rowCount: id("widget:row-count"),
    catalog: id("widget:catalog"),
    rows: id("widget:rows"),
    columns: id("widget:columns"),
    constraints: id("widget:constraints"),
    indexes: id("widget:indexes"),
    size: id("widget:size"),
  };
  const pageID = id("page");
  const IDENT = "^[A-Za-z_][A-Za-z0-9_]*$";
  const SEARCH = "^[A-Za-z0-9_ .-]{0,64}$";
  const identInput = (key, defaultValue = "") => ({
    key,
    type: "string",
    required: key !== "search",
    defaultValue,
    pattern: IDENT,
    maxLength: 63,
  });
  const limitInput = { key: "limit", type: "number", required: false, defaultValue: 15 };
  const offsetInput = { key: "offset", type: "number", required: false, defaultValue: 0 };
  const searchInput = {
    key: "search",
    type: "string",
    required: false,
    defaultValue: "",
    pattern: SEARCH,
    maxLength: 64,
  };
  const tableFilter = `WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND (table_schema ILIKE '%' || '{{ inputs.search }}' || '%'
        OR table_name ILIKE '%' || '{{ inputs.search }}' || '%')`;

  manifest.datasources.push({
    datasourceID,
    datasourceTitle: "PostgreSQL · schema catalog",
    datasourceType: "postgresql",
    datasourceDescription:
      "Reconnect with your PostgreSQL host, database and user. The bundled admin console runs read-only catalog and table queries.",
    datasourceOptions: { host: "", port: 5432, database: "", user: "", password: "", ssl: false },
    datasourceTags: ["integration", "curated", "postgresql", "read-only", "admin"],
    requiresReconnect: true,
  });

  const addQuery = (key, title, description, sql, inputDefinitions) => {
    manifest.queries.push({
      dataQueryID: queryIDs[key],
      datasourceID,
      datasourceType: "postgresql",
      dataQueryTitle: title,
      dataQueryDescription: description,
      dataQueryOptions: { queryType: "sql", query: sql, inputDefinitions, timeoutSeconds: 30 },
      runOnLoad: false,
    });
  };

  addQuery(
    "tables",
    "PostgreSQL · visible tables",
    "Lists visible user tables with safe search and server-side limit/offset pagination. Read-only.",
    `SELECT table_schema, table_name
     FROM information_schema.tables
     ${tableFilter}
     ORDER BY table_schema, table_name
     LIMIT {{ inputs.limit }} OFFSET {{ inputs.offset }}`,
    [searchInput, limitInput, offsetInput]
  );
  addQuery(
    "tableCount",
    "PostgreSQL · visible table count",
    "Counts visible user tables for the current catalog search. Read-only.",
    `SELECT count(*)::int AS tables FROM information_schema.tables ${tableFilter}`,
    [searchInput]
  );
  addQuery(
    "rows",
    "PostgreSQL · selected table rows",
    "Returns a page of rows from the selected table. Identifiers are pattern-validated and quoted. Read-only.",
    `SELECT * FROM "{{ inputs.schema }}"."{{ inputs.table }}"
     LIMIT {{ inputs.limit }} OFFSET {{ inputs.offset }}`,
    [identInput("schema"), identInput("table"), limitInput, offsetInput]
  );
  addQuery(
    "rowCount",
    "PostgreSQL · selected table row count",
    "Exact row count for the selected table. Read-only.",
    `SELECT count(*)::bigint AS total FROM "{{ inputs.schema }}"."{{ inputs.table }}"`,
    [identInput("schema"), identInput("table")]
  );
  addQuery(
    "columns",
    "PostgreSQL · selected table columns",
    "Column names, types, nullability and defaults for the selected table. Read-only.",
    `SELECT ordinal_position, column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = '{{ inputs.schema }}' AND table_name = '{{ inputs.table }}'
     ORDER BY ordinal_position`,
    [identInput("schema"), identInput("table")]
  );
  addQuery(
    "constraints",
    "PostgreSQL · selected table constraints",
    "Primary keys, foreign keys, unique and check constraints for the selected table. Read-only.",
    `SELECT tc.constraint_name, tc.constraint_type, kcu.column_name, kcu.ordinal_position
     FROM information_schema.table_constraints tc
     LEFT JOIN information_schema.key_column_usage kcu
       ON tc.constraint_schema = kcu.constraint_schema
      AND tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
      AND tc.table_name = kcu.table_name
     WHERE tc.table_schema = '{{ inputs.schema }}' AND tc.table_name = '{{ inputs.table }}'
     ORDER BY tc.constraint_type, tc.constraint_name, kcu.ordinal_position`,
    [identInput("schema"), identInput("table")]
  );
  addQuery(
    "indexes",
    "PostgreSQL · selected table indexes",
    "Index definitions for the selected table. Read-only.",
    `SELECT indexname, indexdef
     FROM pg_indexes
     WHERE schemaname = '{{ inputs.schema }}' AND tablename = '{{ inputs.table }}'
     ORDER BY indexname`,
    [identInput("schema"), identInput("table")]
  );
  addQuery(
    "size",
    "PostgreSQL · selected table size",
    "Formatted total size and estimated row count from pg_class. Read-only.",
    `SELECT pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
            c.reltuples::bigint AS estimated_rows
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = '{{ inputs.schema }}' AND c.relname = '{{ inputs.table }}'`,
    [identInput("schema"), identInput("table")]
  );

  const addWidget = (key, title, widgetType, widgetConfig) => {
    manifest.widgets.push({
      widgetID: widgetIDs[key],
      widgetTitle: title,
      widgetDescription: `PostgreSQL admin · ${title}`,
      widgetType,
      widgetConfig: { showHeader: true, ...widgetConfig },
      refreshInterval: null,
    });
    return `widget_${widgetIDs[key]}_1`;
  };

  const setVar = (key, value) => ({
    actionType: "SET_VARIABLE",
    config: { key: `state.variables.${key}`, value },
  });
  const execute = (alias, inputValues) => ({
    actionType: "EXECUTE_QUERY",
    config: { alias, ...(inputValues ? { inputValues } : {}) },
  });
  const tableConfig = (alias, columns, extra = {}) => ({
    dataArrayTemplate: expr(`((state.queries.${alias} || {}).data || [])`),
    columns,
    search: { enabled: false },
    export: { enabled: true, format: "csv" },
    editing: { enabled: false },
    isLoading: expr(`((state.queries.${alias} || {}).isLoading || false)`),
    ...extra,
  });

  const instructionsKey = addWidget(
    "instructions",
    "PostgreSQL admin",
    "text",
    {
      showHeader: false,
      format: "markdown",
      content:
        "# PostgreSQL admin console\n1. Connect **Data sources → PostgreSQL · schema catalog**.\n2. The catalog loads automatically; use **Refresh catalog** after DDL changes.\n3. Select a table to load its rows; use **View schema** for columns, constraints and indexes.\n\n> Read-only catalog and table queries. Identifiers are validated and quoted; no writes are performed.",
    }
  );
  const refreshKey = addWidget("refresh", "Refresh catalog", "button", {
    text: "Refresh catalog",
    variant: "outline",
    events: {
      onClick: [
        execute("tables", {
          search: expr("state.variables.catalogSearch"),
          limit: 15,
          offset: 0,
        }),
        execute("table_count", { search: expr("state.variables.catalogSearch") }),
      ],
    },
  });
  const loadRowsKey = addWidget("loadRows", "Load rows", "button", {
    text: "Load selected rows",
    events: {
      onClick: [
        execute("rows", {
          schema: expr("state.variables.selectedSchema"),
          table: expr("state.variables.selectedTable"),
          limit: 15,
          offset: 0,
        }),
        execute("row_count", {
          schema: expr("state.variables.selectedSchema"),
          table: expr("state.variables.selectedTable"),
        }),
      ],
    },
  });
  const viewSchemaKey = addWidget("viewSchema", "View schema", "button", {
    text: "View schema",
    variant: "outline",
    events: {
      onClick: [
        execute("columns", {
          schema: expr("state.variables.selectedSchema"),
          table: expr("state.variables.selectedTable"),
        }),
        execute("constraints", {
          schema: expr("state.variables.selectedSchema"),
          table: expr("state.variables.selectedTable"),
        }),
        execute("indexes", {
          schema: expr("state.variables.selectedSchema"),
          table: expr("state.variables.selectedTable"),
        }),
        execute("size", {
          schema: expr("state.variables.selectedSchema"),
          table: expr("state.variables.selectedTable"),
        }),
      ],
    },
  });
  const rowCountKey = addWidget("rowCount", "Rows in selected table", "stat", {
    label: "Rows (exact)",
    valueTemplate: expr(
      "((((state.queries.row_count || {}).data || [])[0] || {}).total || 0)"
    ),
  });
  const catalogKey = addWidget("catalog", "Table catalog", "table", tableConfig(
    "tables",
    [
      { key: "table_schema", label: "Schema", type: "text", sortable: true },
      { key: "table_name", label: "Table", type: "text", sortable: true },
    ],
    {
      pagination: {
        enabled: true,
        mode: "server",
        pageSize: 15,
        pageParam: "page",
        pageSizeParam: "limit",
        totalTemplate: expr(
          "((((state.queries.table_count || {}).data || [])[0] || {}).tables || 0)"
        ),
      },
      search: { enabled: true, serverSide: true, placeholder: "Filter tables..." },
      emptyText: "No tables yet. Connect the datasource, then click Refresh catalog.",
      events: {
        onPageChange: [
          execute("tables", {
            search: expr("state.variables.catalogSearch"),
            limit: expr("event.pageSize"),
            offset: expr("event.offset"),
          }),
        ],
        onSearch: [
          setVar("catalogSearch", expr("event.searchTerm")),
          execute("tables", {
            search: expr("event.searchTerm"),
            limit: 15,
            offset: 0,
          }),
          execute("table_count", { search: expr("event.searchTerm") }),
        ],
        onRowSelect: [
          setVar("selectedSchema", expr("event.row.table_schema")),
          setVar("selectedTable", expr("event.row.table_name")),
          execute("rows", {
            schema: expr("event.row.table_schema"),
            table: expr("event.row.table_name"),
            limit: 15,
            offset: 0,
          }),
          execute("row_count", {
            schema: expr("event.row.table_schema"),
            table: expr("event.row.table_name"),
          }),
        ],
      },
    }
  ));
  const rowsKey = addWidget("rows", "Table data", "table", tableConfig("rows", [], {
    pagination: {
      enabled: true,
      mode: "server",
      pageSize: 15,
      pageParam: "page",
      pageSizeParam: "limit",
      totalTemplate: expr(
        "((((state.queries.row_count || {}).data || [])[0] || {}).total || 0)"
      ),
    },
    emptyText: "Select a table to preview its rows.",
    emptyHint: "Row data is read with the selected schema and table identifiers.",
    events: {
      onPageChange: [
        execute("rows", {
          schema: expr("state.variables.selectedSchema"),
          table: expr("state.variables.selectedTable"),
          limit: expr("event.pageSize"),
          offset: expr("event.offset"),
        }),
      ],
    },
  }));
  const columnsKey = addWidget("columns", "Columns", "table", tableConfig(
    "columns",
    [
      { key: "ordinal_position", label: "#", type: "number", width: 56 },
      { key: "column_name", label: "Column", type: "text" },
      { key: "data_type", label: "Type", type: "text" },
      { key: "is_nullable", label: "Nullable", type: "text" },
      { key: "column_default", label: "Default", type: "text" },
    ],
    { emptyText: "Select a table and choose View schema." }
  ));
  const constraintsKey = addWidget("constraints", "Constraints", "table", tableConfig(
    "constraints",
    [
      { key: "constraint_name", label: "Constraint", type: "text" },
      { key: "constraint_type", label: "Type", type: "text" },
      { key: "column_name", label: "Column", type: "text" },
    ],
    { emptyText: "Select a table and choose View schema." }
  ));
  const indexesKey = addWidget("indexes", "Indexes", "table", tableConfig(
    "indexes",
    [
      { key: "indexname", label: "Index", type: "text" },
      { key: "indexdef", label: "Definition", type: "text" },
    ],
    { emptyText: "Select a table and choose View schema." }
  ));
  const sizeKey = addWidget("size", "Table size", "key-value", {
    dataTemplate: expr("((state.queries.size || {}).data || [])[0] || {}"),
    columns: 1,
  });

  const row = (index, children) => ({
    id: id(`row:${index}`),
    type: "row",
    sizing: "auto",
    children,
  });
  const slot = (key, span, height) => ({
    id: id(`slot:${key}`),
    type: "widget",
    widgetKey: key,
    span,
    sizing: height ? "fixed" : "fill",
    ...(height ? { height, fixedHeight: height } : {}),
  });
  manifest.pages.push({
    appPageID: pageID,
    appPageTitle: "PostgreSQL Admin App",
    appPageDescription:
      "Professional read-only PostgreSQL admin: table catalog, rows, columns, constraints, indexes and table size.",
    appPageConfig: {
      layoutVersion: 2,
      layout: {
        id: "root",
        type: "column",
        children: [
          row(0, [slot(instructionsKey, 12)]),
          row(1, [
            slot(refreshKey, 3, 120),
            slot(loadRowsKey, 3, 120),
            slot(viewSchemaKey, 3, 120),
            slot(rowCountKey, 3, 120),
          ]),
          row(2, [slot(catalogKey, 5, 520), slot(rowsKey, 7, 520)]),
          row(3, [slot(columnsKey, 7, 440), slot(constraintsKey, 5, 440)]),
          row(4, [slot(indexesKey, 7, 380), slot(sizeKey, 5, 240)]),
        ],
      },
      layouts: {},
      widgets: [
        instructionsKey,
        refreshKey,
        loadRowsKey,
        viewSchemaKey,
        rowCountKey,
        catalogKey,
        rowsKey,
        columnsKey,
        constraintsKey,
        indexesKey,
        sizeKey,
      ],
      variables: [
        { key: "catalogSearch", type: "string", required: false, defaultValue: "" },
        { key: "selectedSchema", type: "string", required: false, defaultValue: "public" },
        { key: "selectedTable", type: "string", required: false, defaultValue: "" },
      ],
      dataSources: [
        {
          alias: "tables",
          type: "query",
          queryID: queryIDs.tables,
          triggerMode: "auto",
          inputValues: { search: "", limit: 15, offset: 0 },
          refreshOn: [],
          refetchInterval: null,
        },
        {
          alias: "table_count",
          type: "query",
          queryID: queryIDs.tableCount,
          triggerMode: "auto",
          inputValues: { search: "" },
          refreshOn: [],
          refetchInterval: null,
        },
        {
          alias: "rows",
          type: "query",
          queryID: queryIDs.rows,
          triggerMode: "manual",
          inputValues: { schema: "public", table: "", limit: 15, offset: 0 },
          refreshOn: [],
          refetchInterval: null,
        },
        {
          alias: "row_count",
          type: "query",
          queryID: queryIDs.rowCount,
          triggerMode: "manual",
          inputValues: { schema: "public", table: "" },
          refreshOn: [],
          refetchInterval: null,
        },
        {
          alias: "columns",
          type: "query",
          queryID: queryIDs.columns,
          triggerMode: "manual",
          inputValues: { schema: "public", table: "" },
          refreshOn: [],
          refetchInterval: null,
        },
        {
          alias: "constraints",
          type: "query",
          queryID: queryIDs.constraints,
          triggerMode: "manual",
          inputValues: { schema: "public", table: "" },
          refreshOn: [],
          refetchInterval: null,
        },
        {
          alias: "indexes",
          type: "query",
          queryID: queryIDs.indexes,
          triggerMode: "manual",
          inputValues: { schema: "public", table: "" },
          refreshOn: [],
          refetchInterval: null,
        },
        {
          alias: "size",
          type: "query",
          queryID: queryIDs.size,
          triggerMode: "manual",
          inputValues: { schema: "public", table: "" },
          refreshOn: [],
          refetchInterval: null,
        },
      ],
    },
  });
  return {
    root: { type: "appPage", id: pageID },
    entry: {
      slug: "curated-postgresql-admin-app",
      itemType: "appTemplate",
      title: "PostgreSQL Admin App",
      category: "Databases",
      icon: "SiPostgresql",
      description:
        "Professional read-only PostgreSQL admin console: searchable table catalog, click-to-load rows with server pagination, columns, constraints, indexes and table size. Includes the datasource, eight queries and all page widgets.",
      features: [
        "table catalog",
        "row browser",
        "schema columns",
        "constraints",
        "indexes",
        "table size",
        "server pagination",
        "pattern-validated identifiers",
        "credential reconnect required",
        "dependency complete",
      ],
      mode: "requires-connection",
      setup: [
        "Install the full bundle: datasource, catalog queries, row/schema widgets and the admin page.",
        "Open Data sources → PostgreSQL · schema catalog and enter host, port, database, user and password.",
        "Test the connection, then open the App Page. Select a table to load rows; use View schema for columns, constraints and indexes.",
      ],
    },
  };
}


function buildCuratedCatalog() {
  const manifest = buildManifest();
  preparePages(manifest);
  const advancedRecipes = addAdvancedScenarios(manifest);
  const postgresApp = addPostgresAdminApp(manifest);
  const catalog = [];
  const demoSetup = ["Install the full bundle, then open its App Page or Workflow.", "Demo SQL runs against an embedded in-memory warehouse; no credentials are needed.", "Connect your own data before treating any result as a production decision."];
  for (const [key, title, category, icon, description, features] of APP_RECIPES) {
    const root = { type: "appPage", id: ref("page", key) };
    catalog.push(catalogEntry({ slug: `curated-${key}-workspace`, itemType: "appTemplate", title, category, icon, description, features, root,
      mode: key === "integrations" ? "public-api" : "demo",
      setup: key === "integrations" ? ["Install and open the App Page.", "Use the load buttons to make read-only public requests; network errors are not replaced with demo success."] : demoSetup,
      bundle: compileBundle(manifest, [root]),
    }));
  }
  for (const [key, title, category, description, features, sampleInputs] of WORKFLOW_RECIPES) {
    const root = { type: "workflow", id: ref("workflow", key) };
    catalog.push(catalogEntry({ slug: `curated-${key}-playbook`, itemType: "workflow", title, description, category, features, root, mode: "demo", sampleInputs,
      setup: [...demoSetup, "Run manually with the supplied sample inputs. Approval/intake steps must be completed in workflow history."],
      bundle: compileBundle(manifest, [root]),
    }));
  }
  for (const [pageKey, widgetKey, title, category, description] of WIDGET_RECIPES) {
    const root = { type: "widget", id: ref("widget", `${pageKey}:${widgetKey}`) };
    const page = addPanelPage(manifest, pageKey, widgetKey, title);
    catalog.push(catalogEntry({ slug: `curated-${pageKey}-${widgetKey}-panel`, itemType: "widget", title, description: `Demo · ${description}`, category,
      features: ["bound queries", "companion app page", "dependency complete"], root, mode: "demo", setup: demoSetup,
      bundle: compileBundle(manifest, [page]),
    }));
  }
  const connectors = [
    ["github", "GitHub repository health and issue-triage query pack", "DevOps & Infrastructure", "Native GitHub connector with configured repository metadata and bounded open-issue queries for facebook/react.", ["githubRepo", "githubIssues"], "public-api"],
    ["graphql", "GraphQL country, capital and currency enrichment pack", "Data & Analytics", "A configured public GraphQL directory with an explicit query for SG, DE, US, JP and BR; nested continent enrichment included.", ["countries"], "public-api"],
    ["rest", "World Bank population enrichment query pack", "Data & Analytics", "A configured REST datasource and bounded Singapore population-indicator query, including format and page-size parameters.", ["economy"], "public-api"],
    ["commerce", "Embedded commerce warehouse with relational analytics", "Databases", "Portable in-memory DuckDB dataset with order/inventory joins, risk windows, reconciliation exceptions and revenue aggregates. Synthetic, not a production connector.", ["orders", "orderDetail", "commerceSummary", "regionRevenue", "dailyRevenue", "riskQueue", "reconciliation", "inventory"], "demo"],
  ];
  for (const [key, title, category, description, queries, mode] of connectors) {
    const root = { type: "datasource", id: ref("datasource", key) };
    catalog.push(catalogEntry({ slug: `curated-${key}-query-pack`, itemType: "datasource", title, category, description: `${mode === "demo" ? "Demo" : "Public APIs"} · ${description}`,
      features: ["configured queries", "read only", mode === "demo" ? "embedded SQL" : "manual requests"], root, mode,
      setup: ["Install the datasource and query dependencies.", "Open a bundled query and run it manually.", mode === "demo" ? "No credentials required; all rows are synthetic." : "No embedded credentials. Provider rate limits, network restrictions and availability may affect results."],
      bundle: compileBundle(manifest, [root, ...queries.map((q) => ({ type: "dataQuery", id: ref("query", q) }))]),
    }));
  }
  for (const recipe of advancedRecipes) {
    catalog.push(catalogEntry({ ...recipe, setup: demoSetup, bundle: compileBundle(manifest, [recipe.root]) }));
  }
  catalog.push(catalogEntry({
    ...postgresApp.entry,
    root: postgresApp.root,
    bundle: compileBundle(manifest, [postgresApp.root]),
  }));
  return catalog;
}

module.exports = { VERSION, buildCuratedCatalog, compileBundle, collectReferences, collectPageAliases, preparePages };
