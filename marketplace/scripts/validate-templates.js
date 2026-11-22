/**
 * Validate every marketplace template package.
 *
 * Usage: node marketplace/scripts/validate-templates.js [slug]
 */
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const { deterministicUUID } = require("./lib/util");
const schema = require("../schema/template.schema.json");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATES = path.join(ROOT, "templates");
const ALLOWED_WIDGETS = new Set([
  "vega", "vega-lite", "button", "table", "text", "stat", "alert", "form", "image", "iframe",
  "date-picker", "date-range-picker", "html", "text-input", "select", "multi-select", "checkbox",
  "radio-group", "switch", "slider", "search-input", "file-upload", "divider", "tabs", "key-value",
  "json-viewer", "list", "badge", "progress", "timeline", "video", "code-block", "kanban", "calendar",
]);
const ALLOWED_ACTION_TYPES = new Set(["transform", "trigger_workflow", "trigger_query", "save_to_buffer", "push_to_app_page"]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function listFiles(dir, filter) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && filter(entry.name))
    .map((entry) => path.join(dir, entry.name));
}

function loadPackage(dir) {
  const manifest = readJson(path.join(dir, "manifest.json"));
  const datasources = readJson(path.join(dir, "datasources", "datasources.json"));
  const queries = listFiles(path.join(dir, "queries"), (n) => n.endsWith(".json")).flatMap(readJson);
  const widgets = listFiles(path.join(dir, "widgets"), (n) => n.endsWith(".json")).flatMap(readJson);
  const pages = listFiles(path.join(dir, "pages"), (n) => n.endsWith(".json")).map(readJson);
  const workflows = listFiles(path.join(dir, "workflows"), (n) => n.endsWith(".json")).map(readJson);
  const listeners = readJson(path.join(dir, "listeners", "listeners.json"));
  const cronJobs = readJson(path.join(dir, "cronjobs", "cronjobs.json"));
  const roles = readJson(path.join(dir, "roles", "roles.json"));
  const schemaSql = fs.readFileSync(path.join(dir, "schema", "001-schema.sql"), "utf8");
  const seedSql = fs.readFileSync(path.join(dir, "seed", "001-seed.sql"), "utf8");
  const readme = fs.readFileSync(path.join(dir, "README.md"), "utf8");
  const tables = [...new Set([...schemaSql.matchAll(/\{\{table:([a-z0-9_]+)\}\}/g)].map((m) => m[1]))];
  return { manifest, datasources, queries, widgets, pages, workflows, listeners, cronJobs, roles, schemaSql, seedSql, readme, tables, dir };
}

function collectLayoutSlots(node, slots = []) {
  if (!node || typeof node !== "object") return slots;
  if (node.type === "widget") slots.push(node);
  for (const child of node.children || []) collectLayoutSlots(child, slots);
  return slots;
}

function scanBindings(value, context, errors, pathLabel) {
  if (typeof value === "string") {
    const blocks = value.matchAll(/\{\{([\s\S]*?)\}\}/g);
    for (const block of blocks) {
      const expression = block[1];
      if (/\{\{/.test(expression)) continue;
      const queryMatches = [
        ...expression.matchAll(/state\.queries\.([A-Za-z0-9_]+)/g),
        ...expression.matchAll(/state\.queries\[\s*['"]([^'"]+)['"]\s*\]/g),
      ];
      for (const match of queryMatches) {
        if (context.aliases && !context.aliases.has(match[1])) {
          errors.push(`${pathLabel}: unknown query alias "${match[1]}"`);
        }
      }
      const variableMatches = [
        ...expression.matchAll(/state\.variables\.([A-Za-z0-9_]+)/g),
        ...expression.matchAll(/state\.variables\[\s*['"]([^'"]+)['"]\s*\]/g),
      ];
      for (const match of variableMatches) {
        if (context.variables && !context.variables.has(match[1])) {
          errors.push(`${pathLabel}: unknown page variable "${match[1]}"`);
        }
      }
      const widgetMatches = [
        ...expression.matchAll(/state\.widgets\.([A-Za-z0-9_]+)/g),
        ...expression.matchAll(/state\.widgets\[\s*['"]([^'"]+)['"]\s*\]/g),
      ];
      for (const match of widgetMatches) {
        if (context.widgetKeys && !context.widgetKeys.has(match[1])) {
          errors.push(`${pathLabel}: unknown widget instance "${match[1]}"`);
        }
      }
      if (/\bctx\./.test(expression) && !context.allowCtx) {
        errors.push(`${pathLabel}: ctx binding is not allowed in a page/widget`);
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanBindings(item, context, errors, `${pathLabel}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) scanBindings(child, context, errors, `${pathLabel}.${key}`);
  }
}

function validateQuery(query, ctx) {
  const errors = [];
  const options = query.options || {};
  if (ctx.datasources.get(query.datasource) == null) errors.push(`query ${query.slug}: unknown datasource "${query.datasource}"`);
  if (query.datasource === "primary") {
    if (!options.parameterized) errors.push(`query ${query.slug}: SQL query must set parameterized: true`);
    if (typeof options.query !== "string" || options.query.trim() === "") errors.push(`query ${query.slug}: missing SQL`);
    const sql = options.query || "";
    const tableRefs = [...sql.matchAll(/\{\{(?:table|rawtable):([a-z0-9_]+)\}\}/g)].map((m) => m[1]);
    for (const name of tableRefs) {
      if (!ctx.tables.has(name)) errors.push(`query ${query.slug}: unknown table placeholder "${name}"`);
    }
    const paramNumbers = [...sql.matchAll(/\$(\d+)/g)].map((m) => Number(m[1]));
    const inputCount = (options.inputDefinitions || []).length;
    const maxParam = paramNumbers.length ? Math.max(...paramNumbers) : 0;
    if (maxParam > inputCount) errors.push(`query ${query.slug}: SQL uses $${maxParam} but only ${inputCount} input definitions exist`);
    if (/\{\{\s*inputs\./.test(sql)) errors.push(`query ${query.slug}: legacy raw {{ inputs.* }} interpolation is forbidden; use $n parameters`);
    if (/\{\{p:/.test(sql)) errors.push(`query ${query.slug}: unresolved generator placeholder`);
  }
  return errors;
}

function validateWorkflow(wf, ctx) {
  const errors = [];
  const nodeIDs = new Set();
  for (const node of wf.nodes || []) {
    if (!node.nodeID) errors.push(`workflow ${wf.slug}: node missing nodeID`);
    if (nodeIDs.has(node.nodeID)) errors.push(`workflow ${wf.slug}: duplicate node ${node.nodeID}`);
    nodeIDs.add(node.nodeID);
    if (!ctx.queryIDs.has(node.config?.dataQueryID) && node.type === "dataQuery") {
      errors.push(`workflow ${wf.slug}: node ${node.key || node.nodeID} references unknown query ${node.config?.dataQueryID}`);
    }
    if (node.config?.childWorkflowID && !ctx.workflowIDs.has(node.config.childWorkflowID)) {
      errors.push(`workflow ${wf.slug}: unknown child workflow`);
    }
  }
  const start = (wf.nodes || []).find((n) => n.type === "start");
  const ends = (wf.nodes || []).filter((n) => n.type === "end");
  if (!start) errors.push(`workflow ${wf.slug}: missing start node`);
  if (!ends.length) errors.push(`workflow ${wf.slug}: missing end node`);
  for (const edge of wf.edges || []) {
    if (!nodeIDs.has(edge.from)) errors.push(`workflow ${wf.slug}: edge from unknown node ${edge.from}`);
    if (!nodeIDs.has(edge.to)) errors.push(`workflow ${wf.slug}: edge to unknown node ${edge.to}`);
  }
  const withIncoming = new Set((wf.edges || []).map((e) => e.to));
  for (const node of wf.nodes || []) {
    if (node.type !== "start" && !withIncoming.has(node.nodeID) && (wf.edges || []).length) {
      errors.push(`workflow ${wf.slug}: node ${node.key || node.nodeID} is unreachable`);
    }
  }
  // Every non-end node with no outgoing edge is suspicious, except a loop
  // body (the loop node owns its iteration routing).
  const nodeByID = new Map((wf.nodes || []).map((n) => [n.nodeID, n]));
  const loopBodies = new Set(
    (wf.edges || [])
      .filter((e) => e.handle === "loop" && nodeByID.get(e.from)?.type === "loop")
      .map((e) => e.to)
  );
  const withOutgoing = new Set((wf.edges || []).map((e) => e.from));
  for (const node of wf.nodes || []) {
    if (!["end"].includes(node.type) && !withOutgoing.has(node.nodeID) && !loopBodies.has(node.nodeID)) {
      errors.push(`workflow ${wf.slug}: node ${node.key || node.nodeID} has no outgoing edge`);
    }
  }
  return errors;
}

function validatePackage(pkg) {
  const errors = [];
  const warnings = [];
  const pm = pkg.manifest;
  if (pkg.datasources.length < 2 || pkg.datasources.length > 3) {
    errors.push("datasource count must be 2-3");
  }
  const databaseTypes = new Set([
    "postgresql", "mysql", "mariadb", "mssql", "oracle", "sqlite",
    "mongodb", "snowflake", "bigquery", "redshift", "clickhouse",
  ]);
  const databaseSources = pkg.datasources.filter((datasource) => databaseTypes.has(datasource.type));
  if (databaseSources.some((datasource) => datasource.type !== "postgresql")) {
    errors.push("only PostgreSQL may be used as a database datasource");
  }
  if (databaseSources.length > 1) {
    errors.push("only one database datasource is allowed");
  }
  const datasourceSlugs = new Set(pkg.datasources.map((d) => d.slug));
  const datasources = new Map(pkg.datasources.map((d) => [d.slug, d]));
  const tables = new Set(pkg.tables);
  const queryBySlug = new Map(pkg.queries.map((q) => [q.slug, q]));
  const queryIDs = new Set(pkg.queries.map((q) => deterministicUUID(`${pm.slug}:dataQuery:${q.slug}`)));
  const widgetByUUID = new Map(pkg.widgets.map((w) => [deterministicUUID(`${pm.slug}:widget:${w.slug}`), w]));
  const pageIDs = new Set(pkg.pages.map((p) => deterministicUUID(`${pm.slug}:appPage:${p.slug}`)));
  const workflowIDs = new Set(pkg.workflows.map((w) => deterministicUUID(`${pm.slug}:workflow:${w.slug}`)));
  for (const query of pkg.queries) {
    errors.push(...validateQuery(query, { datasources, tables, queryIDs }));
  }
  for (const widget of pkg.widgets) {
    if (!ALLOWED_WIDGETS.has(widget.type)) errors.push(`widget ${widget.slug}: unsupported type "${widget.type}"`);
  }
  const pageSlugs = new Set();
  for (const page of pkg.pages) {
    if (pageSlugs.has(page.slug)) errors.push(`duplicate page slug ${page.slug}`);
    pageSlugs.add(page.slug);
    const aliases = new Set((page.sources || []).map((s) => s.alias));
    const variables = new Set((page.variables || []).map((v) => v.key));
    const slots = collectLayoutSlots(page.appPageConfig?.layout);
    const widgetKeys = new Set(slots.map((slot) => slot.widgetKey));
    const pageWidgets = pkg.widgets.filter((w) => w.page === page.slug);
    for (const source of page.sources || []) {
      if (!queryIDs.has(source.queryID)) errors.push(`page ${page.slug}: source ${source.alias} references unknown query ID`);
    }
    for (const slot of slots) {
      const match = String(slot.widgetKey || "").match(/^widget_([0-9a-f-]{36})_\d+$/);
      if (!match) {
        errors.push(`page ${page.slug}: invalid widget instance key ${slot.widgetKey}`);
        continue;
      }
      if (!widgetByUUID.has(match[1])) errors.push(`page ${page.slug}: unknown widget ${slot.widgetKey}`);
    }
    for (const widget of pageWidgets) {
      scanBindings(widget.config, { aliases, variables, widgetKeys }, errors, `widget ${widget.slug}`);
    }
    scanBindings(page.appPageConfig?.layout, { aliases, variables, widgetKeys }, errors, `page ${page.slug}.layout`);
    for (const source of page.sources || []) {
      scanBindings(source.inputValues, { aliases, variables, widgetKeys }, errors, `page ${page.slug}.source.${source.alias}`);
    }
    for (const variable of page.variables || []) {
      if (variable.defaultValue !== undefined) scanBindings(variable.defaultValue, { aliases, variables, widgetKeys }, errors, `page ${page.slug}.variable.${variable.key}`);
    }
    if ((page.accessTags || []).length === 0) errors.push(`page ${page.slug}: at least one access tag is required`);
  }
  for (const wf of pkg.workflows) {
    errors.push(...validateWorkflow(wf, { queryIDs, workflowIDs }));
  }
  if (pkg.listeners.length < 2 || pkg.listeners.length > 15) errors.push("listener count must be 2-15");
  const endpointPaths = new Set();
  for (const listener of pkg.listeners) {
    if (!datasourceSlugs.has(listener.datasource)) errors.push(`listener ${listener.slug}: unknown datasource`);
    if (endpointPaths.has(listener.endpointPath)) errors.push(`listener ${listener.slug}: duplicate endpoint path`);
    endpointPaths.add(listener.endpointPath);
    if (!listener.actions?.length) errors.push(`listener ${listener.slug}: no actions`);
    for (const action of listener.actions || []) {
      if (!ALLOWED_ACTION_TYPES.has(action.actionType)) errors.push(`listener ${listener.slug}: unsupported action ${action.actionType}`);
      if (action.actionType === "trigger_workflow" && !workflowIDs.has(action.actionConfig?.workflowID)) {
        errors.push(`listener ${listener.slug}: unknown workflow ${action.actionConfig?.workflowID}`);
      }
      if (action.actionType === "trigger_query" && !queryIDs.has(action.actionConfig?.dataQueryID)) {
        errors.push(`listener ${listener.slug}: unknown query ${action.actionConfig?.dataQueryID}`);
      }
      if (action.actionType === "push_to_app_page" && !pageIDs.has(action.actionConfig?.appPageID)) {
        errors.push(`listener ${listener.slug}: unknown app page`);
      }
      for (const value of Object.values(action.actionConfig || {})) {
        if (typeof value === "string" && value.includes("{{")) {
          for (const match of value.matchAll(/\{\{([\s\S]*?)\}\}/g)) {
            if (!/^\s*event(\.[A-Za-z0-9_.]+)?\s*$/.test(match[1])) {
              errors.push(`listener ${listener.slug}: listener bindings must be safe event paths, got {{${match[1]}}}`);
            }
          }
        }
      }
    }
  }
  if (pkg.cronJobs.length < 2 || pkg.cronJobs.length > 10) errors.push("cron job count must be 2-10");
  for (const cron of pkg.cronJobs) {
    if (!workflowIDs.has(cron.workflow)) errors.push(`cron ${cron.key}: unknown workflow`);
    if (!/^(\S+\s+){4}\S+$/.test(cron.schedule)) errors.push(`cron ${cron.key}: invalid 5-field schedule`);
  }
  if (pkg.roles.length < 4 || pkg.roles.length > 7) errors.push("role count must be 4-7");
  const pageMatrix = new Map(pkg.roles.map((role) => [role.key, role.pages || []]));
  for (const role of pkg.roles) {
    for (const entry of role.pages || []) if (!pageSlugs.has(entry.page)) errors.push(`role ${role.key}: unknown page ${entry.page}`);
    for (const entry of role.queries || []) if (!queryBySlug.has(entry.query)) errors.push(`role ${role.key}: unknown query ${entry.query}`);
    for (const entry of role.workflows || []) if (!pkg.workflows.some((w) => w.slug === entry.workflow)) errors.push(`role ${role.key}: unknown workflow ${entry.workflow}`);
  }
  for (const page of pkg.pages) {
    if (!pkg.roles.some((role) => pageMatrix.get(role.key).some((entry) => entry.page === page.slug && entry.canView))) {
      errors.push(`page ${page.slug}: not visible to any role`);
    }
  }
  if (pm.counts.queries !== pkg.queries.length) errors.push("manifest query count does not match files");
  if (pm.counts.pages !== pkg.pages.length) errors.push("manifest page count does not match files");
  if (pm.counts.workflows !== pkg.workflows.length) errors.push("manifest workflow count does not match files");
  if (pm.counts.listeners !== pkg.listeners.length) errors.push("manifest listener count does not match files");
  if (pm.counts.cronJobs !== pkg.cronJobs.length) errors.push("manifest cron job count does not match files");
  if (pm.counts.roles !== pkg.roles.length) errors.push("manifest role count does not match files");
  if (pm.counts.tables !== pkg.tables.length) errors.push("manifest table count does not match schema placeholders");
  if (pm.counts.seedRows < 100) errors.push("manifest seed row count looks too small");
  if (pkg.queries.length < 30 || pkg.queries.length > 80) errors.push("query count must be 30-80");
  if (pkg.pages.length < 12) errors.push("page count must be at least 12");
  if (pkg.workflows.length < 4 || pkg.workflows.length > 20) errors.push("workflow count must be 4-20");
  if (!pkg.readme.includes("```mermaid")) errors.push("README must contain Mermaid diagrams");
  if (!pkg.readme.includes("## Page map")) errors.push("README must contain a page map");
  const assetRoot = path.join(pkg.dir, "assets");
  for (const relative of ["icon.svg", "cover.svg", "emails/welcome.html", "emails/notification.html"]) {
    if (!fs.existsSync(path.join(assetRoot, relative))) errors.push(`missing asset ${relative}`);
  }
  for (const shot of pm.screenshots || []) {
    if (!fs.existsSync(path.join(pkg.dir, shot.path))) errors.push(`missing screenshot ${shot.path}`);
  }
  // Secret scan: datasource options must not carry non-empty credentials.
  for (const ds of pkg.datasources) {
    for (const key of ["password", "bearerToken", "authSecret", "token", "clientSecret", "connectionString"]) {
      const value = ds.options?.[key];
      if (value && !String(value).includes("{{PLATFORM_DATABASE_URL}}") && String(value).trim() !== "") {
        errors.push(`datasource ${ds.slug}: non-empty credential field "${key}" is not allowed in a package`);
      }
    }
  }
  if (errors.length) {
    return { ok: false, errors, warnings };
  }
  return { ok: true, errors, warnings };
}

function main() {
  const requested = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  const dirs = requested.length
    ? requested.map((slug) => path.join(TEMPLATES, slug))
    : fs.readdirSync(TEMPLATES).map((name) => path.join(TEMPLATES, name)).filter((dir) => fs.statSync(dir).isDirectory());
  if (!dirs.length) {
    console.error("No template packages found.");
    process.exitCode = 1;
    return;
  }
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  let failures = 0;
  for (const dir of dirs) {
    const slug = path.basename(dir);
    try {
      const pkg = loadPackage(dir);
      const data = {
        manifest: pkg.manifest,
        tables: pkg.tables,
        datasources: pkg.datasources,
        queries: pkg.queries,
        widgets: pkg.widgets,
        pages: pkg.pages,
        workflows: pkg.workflows,
        listeners: pkg.listeners,
        cronJobs: pkg.cronJobs,
        roles: pkg.roles,
      };
      const schemaOk = validate(data);
      const schemaErrors = schemaOk ? [] : (validate.errors || []).map((e) => `${e.instancePath || "/"} ${e.message}`);
      const result = validatePackage(pkg);
      if (!schemaOk || !result.ok) {
        failures += 1;
        console.error(`x ${slug}`);
        for (const error of [...schemaErrors, ...result.errors]) console.error(`  - ${error}`);
      } else {
        console.log(
          `+ ${slug}: schema ok · ${pkg.tables.length} tables · ${pkg.queries.length} queries · ` +
            `${pkg.pages.length} pages · ${pkg.workflows.length} workflows · ${pkg.listeners.length} listeners · ` +
            `${pkg.cronJobs.length} cron · ${pkg.roles.length} roles`
        );
        for (const warning of result.warnings) console.log(`  ! ${warning}`);
      }
    } catch (error) {
      failures += 1;
      console.error(`x ${slug}: ${error.stack || error.message}`);
    }
  }
  if (failures) {
    console.error(`\n${failures} template package(s) failed validation.`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${dirs.length} template package(s) passed validation.`);
  }
}

module.exports = { loadPackage, validatePackage, listFiles, collectLayoutSlots, scanBindings, validateQuery, validateWorkflow };

if (require.main === module) main();
