/**
 * Marketplace App Template package loader/compiler.
 *
 * Packages are data-only folders under /marketplace/templates/<slug>. This
 * module reads them and compiles them into Bundle v1 items for the existing
 * importer. It never writes to the database.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TEMPLATES_ROOT = path.resolve(__dirname, "../../../../marketplace/templates");

function deterministicUUID(key) {
  const bytes = crypto.createHash("sha256").update(`jet-marketplace-v1:${key}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const h = bytes.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function assertSlug(slug) {
  if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Invalid template slug.");
  }
}

function packageDir(slug) {
  assertSlug(slug);
  const dir = path.resolve(TEMPLATES_ROOT, slug);
  if (!dir.startsWith(path.resolve(TEMPLATES_ROOT) + path.sep)) {
    throw new Error("Template path escapes the marketplace root.");
  }
  return dir;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => readJson(path.join(dir, name)));
}

function listSlugs() {
  if (!fs.existsSync(TEMPLATES_ROOT)) return [];
  return fs
    .readdirSync(TEMPLATES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(TEMPLATES_ROOT, entry.name, "manifest.json")))
    .map((entry) => entry.name)
    .sort();
}

function loadPackage(slug) {
  const dir = packageDir(slug);
  if (!fs.existsSync(path.join(dir, "manifest.json"))) throw new Error(`Template "${slug}" not found.`);
  const manifest = readJson(path.join(dir, "manifest.json"));
  const datasources = readJson(path.join(dir, "datasources", "datasources.json"));
  const queries = listJson(path.join(dir, "queries")).flat();
  const widgets = listJson(path.join(dir, "widgets")).flat();
  const pages = listJson(path.join(dir, "pages"));
  const workflows = listJson(path.join(dir, "workflows"));
  const listeners = readJson(path.join(dir, "listeners", "listeners.json"));
  const cronJobs = readJson(path.join(dir, "cronjobs", "cronjobs.json"));
  const roles = readJson(path.join(dir, "roles", "roles.json"));
  const schemaSql = fs.readFileSync(path.join(dir, "schema", "001-schema.sql"), "utf8");
  const seedSql = fs.existsSync(path.join(dir, "seed", "001-seed.sql"))
    ? fs.readFileSync(path.join(dir, "seed", "001-seed.sql"), "utf8")
    : "";
  const readme = fs.readFileSync(path.join(dir, "README.md"), "utf8");
  const tables = [...new Set([...schemaSql.matchAll(/\{\{table:([a-z0-9_]+)\}\}/g)].map((m) => m[1]))];
  return { dir, manifest, datasources, queries, widgets, pages, workflows, listeners, cronJobs, roles, schemaSql, seedSql, readme, tables };
}

function tablePrefix(manifest, tenantID) {
  const alias = String(manifest.alias || manifest.slug.split("-")[0]).replace(/[^a-z0-9_]/g, "_");
  const tenant = String(tenantID).replace(/-/g, "").slice(0, 8);
  return `tpl_${alias}_${tenant}_`;
}

function quoteIdent(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function resolvePlaceholders(text, prefix) {
  return String(text)
    .replace(/\{\{table:([a-z0-9_]+)\}\}/g, (_, name) => quoteIdent(`${prefix}${name}`))
    .replace(/\{\{rawtable:([a-z0-9_]+)\}\}/g, (_, name) => `${prefix}${name}`)
    .replace(/\{\{idx:([a-z0-9_]+)\}\}/g, (_, name) => `${prefix}idx_${name}`)
    .replace(/\{\{fn:([a-z0-9_]+)\}\}/g, (_, name) => `${prefix}fn_${name}`)
    .replace(/\{\{trigger:([a-z0-9_]+)\}\}/g, (_, name) => `${prefix}trg_${name}`);
}

function refId(slug, type, key) {
  return deterministicUUID(`${slug}:${type}:${key}`);
}

function compileBundle(pkg, prefix) {
  const { manifest } = pkg;
  const items = [];
  const datasourceId = (key) => refId(manifest.slug, "datasource", key);
  const queryId = (key) => refId(manifest.slug, "dataQuery", key);
  const widgetId = (key) => refId(manifest.slug, "widget", key);
  const pageId = (key) => refId(manifest.slug, "appPage", key);
  const workflowId = (key) => refId(manifest.slug, "workflow", key);
  const listenerId = (key) => refId(manifest.slug, "listener", key);

  for (const ds of pkg.datasources) {
    const options = { ...(ds.options || {}) };
    if (ds.installStrategy === "platformDatabase") {
      // Bundle import strips credentials. The installer writes the real
      // platform connection after import; this placeholder only establishes
      // the resource and its ID mapping.
      options.connectionOption = "connectionString";
      options.connectionString = "";
    }
    items.push({
      type: "datasource",
      id: datasourceId(ds.slug),
      payload: {
        datasourceTitle: ds.title,
        datasourceType: ds.type,
        datasourceDescription: ds.description || null,
        datasourceTags: ["template", manifest.slug, ds.slug],
        datasourceOptions: options,
        requiresReconnect: !!ds.requiresReconnect,
      },
      dependencies: [],
    });
  }

  for (const query of pkg.queries) {
    const ds = pkg.datasources.find((d) => d.slug === query.datasource);
    if (!ds) throw new Error(`Template query ${query.slug} references unknown datasource ${query.datasource}`);
    const options = JSON.parse(JSON.stringify(query.options || {}));
    if (typeof options.query === "string") options.query = resolvePlaceholders(options.query, prefix);
    items.push({
      type: "dataQuery",
      id: queryId(query.slug),
      payload: {
        dataQueryTitle: query.title,
        dataQueryDescription: `${manifest.name} · ${query.tags.join(", ")}`,
        dataQueryOptions: options,
        runOnLoad: false,
        datasourceType: ds.type,
      },
      dependencies: [{ type: "datasource", id: datasourceId(ds.slug), bundled: true }],
    });
  }

  for (const widget of pkg.widgets) {
    items.push({
      type: "widget",
      id: widgetId(widget.slug),
      payload: {
        widgetTitle: widget.title,
        widgetDescription: `${manifest.name} · ${widget.page || "preset"}`,
        widgetType: widget.type,
        widgetConfig: widget.config || {},
        refreshInterval: null,
      },
      dependencies: [],
    });
  }

  for (const wf of pkg.workflows) {
    const nodeMap = new Map();
    const nodes = (wf.nodes || []).map((node) => {
      const id = deterministicUUID(`${manifest.slug}:node:${wf.slug}:${node.key}`);
      nodeMap.set(node.nodeID || node.key, id);
      return {
        nodeID: id,
        nodeType: node.type,
        nodeConfig: node.config || {},
        timeoutSeconds: node.timeoutSeconds ?? 300,
        retryLimit: node.retryLimit ?? 0,
      };
    });
    const edges = (wf.edges || []).map((edge) => ({
      upstreamNodeID: nodeMap.get(edge.from),
      downstreamNodeID: nodeMap.get(edge.to),
      sourceHandle: edge.handle || "success",
      targetHandle: null,
      edgeType: edge.edgeType || "smoothstep",
      edgeConfig: edge.edgeConfig || {},
    }));
    const deps = [];
    for (const node of wf.nodes || []) {
      if (node.config?.dataQueryID) deps.push({ type: "dataQuery", id: node.config.dataQueryID, bundled: true });
      if (node.config?.childWorkflowID) deps.push({ type: "workflow", id: node.config.childWorkflowID, bundled: true });
    }
    items.push({
      type: "workflow",
      id: workflowId(wf.slug),
      payload: {
        title: wf.title,
        workflowOptions: wf.options || {},
        nodes,
        edges,
      },
      dependencies: deps,
    });
  }

  for (const page of pkg.pages) {
    const deps = [];
    for (const source of page.sources || []) {
      deps.push({ type: "dataQuery", id: source.queryID, bundled: true });
    }
    for (const slot of page.appPageConfig?.widgets || []) {
      const match = String(slot.widgetKey || "").match(/^widget_([0-9a-f-]{36})_\d+$/);
      if (match) deps.push({ type: "widget", id: match[1], bundled: true });
    }
    items.push({
      type: "appPage",
      id: pageId(page.slug),
      payload: {
        appPageTitle: page.title,
        appPageDescription: page.description || null,
        appPageConfig: page.appPageConfig,
      },
      dependencies: deps,
    });
  }

  for (const listener of pkg.listeners) {
    const deps = [{ type: "datasource", id: datasourceId(listener.datasource), bundled: true }];
    for (const action of listener.actions || []) {
      if (action.actionType === "trigger_workflow" && action.actionConfig?.workflowID) {
        deps.push({ type: "workflow", id: action.actionConfig.workflowID, bundled: true });
      }
      if (action.actionType === "trigger_query" && action.actionConfig?.dataQueryID) {
        deps.push({ type: "dataQuery", id: action.actionConfig.dataQueryID, bundled: true });
      }
      if (action.actionType === "push_to_app_page" && action.actionConfig?.appPageID) {
        deps.push({ type: "appPage", id: action.actionConfig.appPageID, bundled: true });
      }
    }
    items.push({
      type: "listener",
      id: listenerId(listener.slug),
      payload: {
        listenerTitle: listener.title,
        listenerDescription: listener.description || null,
        listenerType: listener.type,
        listenerConfig: listener.config || {},
        endpointPath: listener.endpointPath,
        status: "inactive",
        actions: (listener.actions || []).map((action, index) => ({
          actionType: action.actionType,
          actionConfig: action.actionConfig || {},
          isEnabled: action.isEnabled !== false,
          orderIndex: action.orderIndex ?? index,
        })),
      },
      dependencies: deps,
    });
  }

  return { bundleVersion: 1, generator: "jet-marketplace-template", items };
}

module.exports = {
  TEMPLATES_ROOT,
  deterministicUUID,
  listSlugs,
  loadPackage,
  tablePrefix,
  resolvePlaceholders,
  compileBundle,
  refId,
  packageDir,
};
