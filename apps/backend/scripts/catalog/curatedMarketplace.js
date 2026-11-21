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
  const datasourceID = uuid("postgres-admin:datasource");
  const tablesQueryID = uuid("postgres-admin:query:tables");
  const countQueryID = uuid("postgres-admin:query:table-count");
  const instructionsWidgetID = uuid("postgres-admin:widget:instructions");
  const statWidgetID = uuid("postgres-admin:widget:table-count");
  const tableWidgetID = uuid("postgres-admin:widget:tables");
  const pageID = uuid("postgres-admin:page");
  const tableFilter = "WHERE table_schema NOT IN ('pg_catalog', 'information_schema')";
  const tableQuery = `SELECT table_schema, table_name FROM information_schema.tables ${tableFilter} ORDER BY table_schema, table_name LIMIT 200`;
  const countQuery = `SELECT count(*)::int AS tables FROM information_schema.tables ${tableFilter}`;
  manifest.datasources.push({
    datasourceID,
    datasourceTitle: "PostgreSQL · schema catalog",
    datasourceType: "postgresql",
    datasourceDescription: "Reconnect with your PostgreSQL host, database and user. Read-only information_schema queries are bundled.",
    datasourceOptions: { host: "", port: 5432, database: "", user: "", password: "", ssl: false },
    datasourceTags: ["integration", "curated", "postgresql", "read-only"],
    requiresReconnect: true,
  });
  manifest.queries.push(
    {
      dataQueryID: tablesQueryID, datasourceID, datasourceType: "postgresql",
      dataQueryTitle: "PostgreSQL · visible tables",
      dataQueryDescription: "Lists visible user tables from information_schema. Read-only.",
      dataQueryOptions: { queryType: "sql", query: tableQuery, inputDefinitions: [], timeoutSeconds: 20 },
      runOnLoad: false,
    },
    {
      dataQueryID: countQueryID, datasourceID, datasourceType: "postgresql",
      dataQueryTitle: "PostgreSQL · visible table count",
      dataQueryDescription: "Counts visible user tables. Read-only.",
      dataQueryOptions: { queryType: "sql", query: countQuery, inputDefinitions: [], timeoutSeconds: 20 },
      runOnLoad: false,
    }
  );
  manifest.widgets.push(
    {
      widgetID: instructionsWidgetID, widgetTitle: "Connect PostgreSQL",
      widgetDescription: "Setup checklist and scope of the read-only schema catalog.",
      widgetType: "text", refreshInterval: null,
      widgetConfig: {
        showHeader: false, format: "markdown",
        content: "# PostgreSQL admin app\n1. Open **Data sources → PostgreSQL · schema catalog**.\n2. Enter your host, port, database, user and password, then test the connection.\n3. Return to this page. The table catalog and count refresh from your database.\n\n> This app runs read-only `information_schema` queries. It does not modify your database.",
      },
    },
    {
      widgetID: statWidgetID, widgetTitle: "Visible tables", widgetDescription: "Count of tables visible to the connected user.",
      widgetType: "stat", refreshInterval: null,
      widgetConfig: {
        showHeader: true, label: "Visible tables",
        valueTemplate: expr("((state.queries.table_count || {}).data || [])[0]?.tables || 0"),
      },
    },
    {
      widgetID: tableWidgetID, widgetTitle: "Schema and table catalog",
      widgetDescription: "Visible schemas and tables from information_schema.",
      widgetType: "table", refreshInterval: null,
      widgetConfig: {
        showHeader: true,
        dataArrayTemplate: expr("((state.queries.tables || {}).data || [])"),
        columns: [
          { key: "table_schema", label: "Schema", type: "text", sortable: true },
          { key: "table_name", label: "Table", type: "text", sortable: true },
        ],
        pagination: { enabled: true, pageSize: 15 },
        search: { enabled: true },
        export: { enabled: true, format: "csv" },
        editing: { enabled: false },
        isLoading: expr("((state.queries.tables || {}).isLoading || false)"),
        emptyText: "No tables returned. Confirm the connection and that the user can see application schemas.",
      },
    }
  );
  const widgetKeys = [instructionsWidgetID, statWidgetID, tableWidgetID].map((id) => `widget_${id}_1`);
  const row = (index, children) => ({ id: uuid(`postgres-admin:row:${index}`), type: "row", sizing: "auto", children });
  const widgetNode = (key, span, minHeight) => ({
    id: uuid(`postgres-admin:slot:${key}`), type: "widget", widgetKey: key, span,
    sizing: "fill", ...(minHeight ? { minHeight } : {}),
  });
  manifest.pages.push({
    appPageID: pageID,
    appPageTitle: "PostgreSQL Admin App",
    appPageDescription: "Read-only PostgreSQL schema and table catalog. Reconnect the bundled datasource before use.",
    appPageConfig: {
      layoutVersion: 2,
      layout: {
        id: "root", type: "column", children: [
          row(0, [widgetNode(widgetKeys[0], 8), widgetNode(widgetKeys[1], 4)]),
          row(1, [widgetNode(widgetKeys[2], 12, 440)]),
        ],
      },
      layouts: {},
      widgets: widgetKeys,
      variables: [],
      dataSources: [
        { alias: "tables", type: "query", queryID: tablesQueryID, triggerMode: "auto", inputValues: {}, refreshOn: [], refetchInterval: null },
        { alias: "table_count", type: "query", queryID: countQueryID, triggerMode: "auto", inputValues: {}, refreshOn: [], refetchInterval: null },
      ],
    },
  });
  return {
    root: { type: "appPage", id: pageID },
    entry: {
      slug: "curated-postgresql-admin-app", itemType: "appTemplate",
      title: "PostgreSQL Admin App", category: "Databases", icon: "SiPostgresql",
      description: "Reconnect your PostgreSQL database, then browse visible schemas and tables with a query-backed catalog, table count and setup checklist. Includes the datasource, two read-only queries and all page widgets.",
      features: ["schema browser", "table catalog", "read-only SQL", "credential reconnect required", "dependency complete"],
      mode: "requires-connection",
      setup: [
        "Install the full bundle: datasource, two queries, three widgets and the app page.",
        "Open Data sources → PostgreSQL · schema catalog and enter host, port, database, user and password.",
        "Test the connection, then open the App Page. The catalog and count run automatically.",
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
