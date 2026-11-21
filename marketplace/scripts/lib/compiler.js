/**
 * Template package compiler.
 *
 * Takes the generated JSON-safe template object (manifest/resources/assets)
 * and writes the committed folder layout consumed by the backend installer.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { deterministicUUID, titleCase } = require("./util");
const { coreEntities, statusField, labelField, ownerField, amountField, dateField } = require("./model");
const { PLATFORM_VERSION } = require("./generator");
const { buildWorkflows, buildListeners, buildCronJobs, buildRoles, buildRoleMatrixSeed } = require("./automation");
const { buildListPage, buildDetailPage, buildCreatePage, buildDashboard, buildReports, buildKanbanCalendar, buildSharedPages, buildAdminPages } = require("./pages");

function json(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

function buildDatasources(spec) {
  return [
    {
      slug: "primary",
      title: `${spec.name} · primary PostgreSQL`,
      type: "postgresql",
      description: "Binds the installed template tables on the platform database. Credentials are injected server-side; none are committed.",
      options: {
        connectionOption: "connectionString",
        connectionString: "{{PLATFORM_DATABASE_URL}}",
      },
      requiresReconnect: true,
      installStrategy: "platformDatabase",
    },
    {
      slug: "webhook",
      title: `${spec.name} · inbound webhook`,
      type: "webhook",
      description: "Inbound webhook connector for partner and internal events. Listeners are installed inactive and must be activated after review.",
      options: {
        connectionName: `${spec.alias}-inbound`,
        allowedMethods: "POST",
        authType: "none",
      },
      requiresReconnect: false,
      installStrategy: "asIs",
    },
    {
      slug: "integration",
      title: `${spec.name} · mock REST integration`,
      type: "restapi",
      description: "Deliberately unreachable mock REST endpoint used by the integration-sync workflow to prove the error path. Reconnect to a real provider in production.",
      options: {
        baseUrl: "http://127.0.0.1:9",
        timeout: 5,
        authType: "none",
        headers: [],
        queryParams: [],
        contentType: "application/json",
        followRedirects: false,
        sslVerify: true,
      },
      requiresReconnect: true,
      installStrategy: "asIs",
    },
  ];
}

function buildManifest(spec, ctx) {
  const pages = ctx.pages.map((page) => ({
    slug: page.slug,
    title: page.title,
    description: page.description,
    tags: page.accessTags,
  }));
  const workflows = ctx.workflows.map((wf) => ({
    slug: wf.slug,
    title: wf.title,
    description: wf.description,
    nodeCount: wf.nodes.length,
    edgeCount: wf.edges.length,
  }));
  const screenshots = ["dashboard", `${coreEntities(spec)[0].key}-list`, `${coreEntities(spec)[0].key}-detail`, "reports-operations", "admin-audit", "portal"];
  const integrations = spec.integrations || [
    { key: "webhook", title: "Inbound webhook", requiredFields: ["endpoint path", "signature header (optional)"], mock: "Send any JSON body with kind=webhook.received to the inactive listener." },
    { key: "integration", title: "Mock REST integration", requiredFields: ["baseUrl", "auth token"], mock: "The packaged endpoint is intentionally unreachable; reconnect to a real provider." },
  ];
  return {
    id: `jet.marketplace.${spec.slug}`,
    slug: spec.slug,
    alias: spec.alias,
    name: spec.name,
    version: spec.version || "1.0.0",
    category: spec.category,
    tags: spec.tags || [],
    shortDescription: spec.tagline,
    longDescription: spec.description,
    author: spec.author || "Jet Admin",
    license: spec.license || "MIT",
    minPlatformVersion: spec.minPlatformVersion || PLATFORM_VERSION,
    icon: "assets/icon.svg",
    cover: "assets/cover.svg",
    accent: spec.accent || "#2563eb",
    screenshots: screenshots.map((slug) => {
      const page = pages.find((p) => p.slug.endsWith(slug)) || pages.find((p) => p.key === slug);
      return { title: page ? page.title : titleCase(slug), path: `assets/screenshots/${slug}.svg` };
    }),
    features: spec.features || [
      "Seeded, domain-specific data model with audit triggers",
      "Parameterized SQL queries with server-side pagination and CSV export",
      "Role-aware pages and Casbin asset permissions",
      "Workflow automations for intake, approvals, assignments and SLA sweeps",
      "In-app notification center, comments, attachments and saved views",
      "Admin screens for users, roles, audit, operations and data quality",
    ],
    requiredIntegrations: integrations,
    installOptions: [
      { key: "includeSampleData", label: "Include sample data", type: "boolean", default: true, description: "Load the deterministic demo dataset (30-300 rows per core table)." },
      { key: "createDemoUsers", label: "Create demo staff directory", type: "boolean", default: false, description: "Mark seeded staff as demo identities. These are not Firebase logins." },
      { key: "enableAutomation", label: "Enable cron automations", type: "boolean", default: false, description: "Enable the packaged cron jobs. Leave off until listeners and integrations are reviewed." },
    ],
    counts: {
      tables: ctx.tableCount,
      domainTables: spec.entities.length,
      supportTables: ctx.supportTableCount,
      seedRows: ctx.seedRowsCount,
      queries: ctx.queries.length,
      pages: ctx.pages.length,
      widgets: ctx.widgets.length,
      workflows: ctx.workflows.length,
      listeners: ctx.listeners.length,
      cronJobs: ctx.cronJobs.length,
      roles: ctx.roles.length,
    },
    pages,
    workflows,
    roles: ctx.roles.map((role) => ({ key: role.key, title: role.title, scope: role.scope })),
    entities: spec.entities.map((entity) => ({
      key: entity.key,
      title: entity.title,
      core: entity.core !== false,
      seedCount: entity.seedCount || (entity.core === false ? 45 : 80),
      fields: entity.fields.map((f) => ({ key: f.key, type: f.type, required: !!f.required })),
    })),
    categories: spec.categories || [spec.category],
  };
}

function mermaidERD(spec) {
  const lines = ["erDiagram"];
  for (const entity of spec.entities) {
    lines.push(`  ${entity.key.toUpperCase()} {`);
    lines.push("    int id PK");
    for (const field of entity.fields) {
      const type = field.type === "ref" ? "int" : field.type === "enum" ? "string" : field.type === "json" ? "json" : field.type === "timestamptz" ? "datetime" : field.type === "bool" ? "boolean" : field.type === "int" ? "int" : field.type === "money" || field.type === "decimal" ? "decimal" : "string";
      lines.push(`    ${type} ${field.key}${field.ref ? " FK" : ""}`);
    }
    lines.push("  }");
  }
  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.type === "ref") {
        const target = field.ref === "staff" ? "STAFF" : field.ref.toUpperCase();
        lines.push(`  ${target} ||--o{ ${entity.key.toUpperCase()} : "${field.key}"`);
      }
    }
  }
  lines.push("  STAFF ||--o{ AUDIT_LOG : actor");
  lines.push("  STAFF ||--o{ COMMENTS : author");
  lines.push("  STAFF ||--o{ NOTIFICATIONS : recipient");
  return lines.join("\n");
}

function mermaidWorkflow(wf) {
  const lines = ["flowchart TD"];
  const ids = new Map();
  wf.nodes.forEach((node, index) => {
    const id = `n${index}`;
    ids.set(node.nodeID, id);
    const label = String(node.config.title || node.key).replace(/"/g, "'").slice(0, 60);
    lines.push(`  ${id}["${label}<br/><small>${node.type}</small>"]`);
  });
  for (const edge of wf.edges) {
    const from = ids.get(edge.from);
    const to = ids.get(edge.to);
    if (!from || !to) continue;
    lines.push(`  ${from} -->|${edge.handle || "success"}| ${to}`);
  }
  return lines.join("\n");
}

function buildReadme(spec, ctx, manifest) {
  const main = coreEntities(spec)[0];
  const pageRows = ctx.pages.map((p) => `| \`${p.slug}\` | ${p.title} | ${p.accessTags.join(", ")} |`).join("\n");
  const wfRows = ctx.workflows.map((w) => `| \`${w.slug}\` | ${w.title} | ${w.nodes.length} |`).join("\n");
  const workflowDiagrams = ctx.workflows
    .slice(0, 6)
    .map((w) => `### ${w.title}\n\n${mermaidWorkflow(w)}\n`)
    .join("\n");
  return `# ${spec.name}

${spec.tagline}

${spec.description}

**Category:** ${spec.category}  
**Version:** ${manifest.version}  
**Template slug:** \`${spec.slug}\`  
**Minimum platform:** ${manifest.minPlatformVersion}

## What it does

${spec.longDescription || spec.description}

The package is data-only: schema, deterministic seed, parameterized queries, widgets, pages, workflows, listeners, cron jobs and roles. Installing it creates tenant-isolated physical tables named \`tpl_${spec.alias}_<tenantShort>_*\` and bundles every UI resource through the existing Bundle v1 importer.

## Page map

| Page slug | Title | Access tags |
| --- | --- | --- |
${pageRows}

## Data model

\`\`\`mermaid
${mermaidERD(spec)}
\`\`\`

The package ships ${manifest.counts.domainTables} domain tables plus ${manifest.counts.supportTables} support tables (staff, lookups, audit, comments, attachments, notifications, settings, imports, operations, role matrix).

## Workflows

| Workflow | Purpose | Nodes |
| --- | --- | --- |
${wfRows}

${workflowDiagrams}

Failure behavior: every workflow declares per-node \`errorHandling\`; external sync and recovery workflows have explicit error edges. Human tasks (approval/dataCollection) suspend with an expiry and resume through the platform's data-collection endpoint. Cron jobs and listeners ship **inactive/disabled** until reviewed.

## Roles and permissions

${ctx.roles.map((role) => `- **${role.title}** (\`${role.key}\`): ${role.description}`).join("\n")}

The installer creates tenant-scoped platform roles and grants asset-level Casbin permissions for the pages, queries and workflows in this package. Admin pages are tagged \`admin\`; the client portal is tagged \`portal\`. Widget visibility is enforced by page grouping and query execution permissions because the platform has no widget-level RBAC.

## Integrations

${(spec.integrations || []).map((i) => `- **${i.title}** — required: ${(i.requiredFields || []).join(", ")}. Mock: ${i.mock || "reconnect in the datasource UI."}`).join("\n") || "- Inbound webhook and mock REST integration are packaged inactive."}

## Install

1. Open **Marketplace → App templates**.
2. Select **${spec.name}** and choose install options (sample data is on by default).
3. Install. The installer creates the schema, seed, resources, roles and (optionally) cron jobs.
4. Reconnect the primary PostgreSQL datasource only if the platform database differs from the tenant's target database; the bundled install injects the platform connection server-side.
5. Review inactive listeners and disabled cron jobs before enabling automation.
6. Open **Dashboard** (or **Client portal** for external roles).

## Quality features

- Audit trigger on every domain and support write, with old/new JSON snapshots.
- Soft delete + restore on domain tables.
- CSV import with validation summary and stored error report.
- CSV export on every list, report and comment/attachment table.
- Saved filter views, bulk actions, comments, attachments, in-app notifications.
- Keyboard-accessible form widget with required/format/min/max validation.
- Empty, loading and error states on every operational page.

## Customization

- **Fields:** edit \`schema/001-schema.sql\` and the field arrays in the spec, then regenerate.
- **Seed:** edit \`seed/001-seed.sql\` or the generator spec; dates are relative to \`now()\`.
- **Queries:** \`queries/*.json\` are parameterized (\`$1...$n\`); keep the input definition order in sync with the numbers.
- **Pages/widgets:** \`pages/*.json\` and \`widgets/*.json\` use layout v2 and the \`{{ state.* }}\` binding syntax.
- **Workflows:** \`workflows/*.json\` use the platform node handlers; edges carry \`sourceHandle\` values.
- **Regenerate deterministically:** \`node marketplace/scripts/generate-templates.js ${spec.slug}\`.

## Known limitations

- Widget-level RBAC is not a platform primitive; use page tags and asset permissions.
- Modal/drawer widgets are not available; detail pages and tabs are used.
- DataCollection API/webhook delivery is not first-class; forms/approval plus webhook listeners are used.
- XLSX export is Excel-compatible CSV; there is no XLSX runtime.
`;
}

function renderCsv(spec, entity, ctx) {
  const rows = (ctx.seedRows[entity.key] || []).slice(0, 10);
  const columns = entity.fields.map((f) => f.key);
  const cell = (field, value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object" && value.__sql) return field.type === "date" ? "2026-01-15" : "2026-01-15T09:00:00Z";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  return [columns.map(esc).join(","), ...rows.map((r) => columns.map((c) => esc(cell(entity.fields.find((f) => f.key === c) || {}, r[c]))).join(","))].join("\n") + "\n";
}

function buildAssets(spec, ctx, manifest) {
  const core = coreEntities(spec);
  const accent = spec.accent || "#2563eb";
  const secondary = spec.accentSecondary || "#0f172a";
  const assets = [];
  const initials = spec.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  assets.push({
    path: "assets/icon.svg",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${spec.name} icon"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="${secondary}"/></linearGradient></defs><rect width="128" height="128" rx="28" fill="url(#g)"/><text x="64" y="78" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="700" fill="#fff" text-anchor="middle">${initials}</text></svg>\n`,
  });
  assets.push({
    path: "assets/cover.svg",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-label="${spec.name} cover"><rect width="1200" height="630" fill="${secondary}"/><circle cx="980" cy="120" r="260" fill="${accent}" opacity="0.28"/><circle cx="1100" cy="560" r="180" fill="${accent}" opacity="0.16"/><text x="80" y="180" font-family="Inter, Arial, sans-serif" font-size="34" fill="#94a3b8">Jet Admin · Marketplace app template</text><text x="80" y="280" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="700" fill="#fff">${spec.name}</text><text x="80" y="350" font-family="Inter, Arial, sans-serif" font-size="28" fill="#cbd5e1">${spec.tagline}</text><text x="80" y="540" font-family="Inter, Arial, sans-serif" font-size="24" fill="#94a3b8">${manifest.counts.pages} pages · ${manifest.counts.queries} queries · ${manifest.counts.workflows} workflows</text></svg>\n`,
  });
  for (const shot of manifest.screenshots) {
    const name = shot.path.split("/").pop();
    assets.push({
      path: shot.path,
      content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${shot.title} screenshot"><rect width="1200" height="800" fill="#f8fafc"/><rect width="1200" height="64" fill="${secondary}"/><circle cx="32" cy="32" r="8" fill="#ef4444"/><circle cx="58" cy="32" r="8" fill="#f59e0b"/><circle cx="84" cy="32" r="8" fill="#22c55e"/><text x="120" y="40" font-family="Inter, Arial, sans-serif" font-size="18" fill="#e2e8f0">${spec.name}</text><rect x="24" y="88" width="1152" height="88" rx="12" fill="#fff" stroke="#e2e8f0"/><text x="48" y="142" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="700" fill="#0f172a">${shot.title}</text><rect x="24" y="196" width="360" height="240" rx="12" fill="#fff" stroke="#e2e8f0"/><rect x="408" y="196" width="360" height="240" rx="12" fill="#fff" stroke="#e2e8f0"/><rect x="792" y="196" width="384" height="240" rx="12" fill="#fff" stroke="#e2e8f0"/><rect x="24" y="460" width="1152" height="304" rx="12" fill="#fff" stroke="#e2e8f0"/><rect x="56" y="500" width="1088" height="18" rx="9" fill="${accent}" opacity="0.16"/><rect x="56" y="536" width="980" height="14" rx="7" fill="#e2e8f0"/><rect x="56" y="566" width="1040" height="14" rx="7" fill="#e2e8f0"/><rect x="56" y="596" width="920" height="14" rx="7" fill="#e2e8f0"/><rect x="56" y="626" width="1010" height="14" rx="7" fill="#e2e8f0"/><text x="24" y="790" font-family="Inter, Arial, sans-serif" font-size="14" fill="#94a3b8">Synthetic marketplace screenshot · ${name}</text></svg>\n`,
    });
  }
  assets.push({
    path: "assets/emails/welcome.html",
    content: `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px"><div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;padding:24px"><h1 style="color:#0f172a">Welcome to ${spec.name}</h1><p>Your workspace is ready. Start with the dashboard, review inactive automations and invite your team.</p><p style="color:#64748b">This is a sample notification. Replace the copy and sender in the template settings.</p></div></body></html>\n`,
  });
  assets.push({
    path: "assets/emails/notification.html",
    content: `<!doctype html><html><body style="font-family:Arial,sans-serif;padding:24px"><h2 style="color:#0f172a">{{ notification.title }}</h2><p>{{ notification.body }}</p><p><a href="{{ notification.link_page }}" style="background:${accent};color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Open in ${spec.name}</a></p></body></html>\n`,
  });
  assets.push({
    path: "assets/emails/approval.html",
    content: `<!doctype html><html><body style="font-family:Arial,sans-serif;padding:24px"><h2 style="color:#0f172a">Approval required</h2><p>{{ approval.description }}</p><p><strong>Record:</strong> #{{ approval.record_id }}</p><p><a href="{{ approval.link }}" style="background:${accent};color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Review decision</a></p></body></html>\n`,
  });
  for (const entity of core) {
    assets.push({ path: `assets/samples/${entity.key}.csv`, content: renderCsv(spec, entity, ctx) });
  }
  const demo = ["name,email,role_key,department", ...(ctx.seedRows.staff || []).slice(0, 10).map((s) => `"${s.full_name}","${s.email}","${s.role_key}","${s.department}"`)].join("\n") + "\n";
  assets.push({ path: "seed/demo-users.csv", content: demo });
  return assets;
}

function groupQueries(spec, queries) {
  const groups = new Map();
  for (const query of queries) {
    const parts = query.slug.split(".");
    const key = parts[1] === "shared" ? "shared" : parts[1];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(query);
  }
  return [...groups.entries()].map(([key, rows]) => ({
    path: `queries/${key}.json`,
    content: json(rows.map(({ slug, title, datasource, tags, options }) => ({ slug, title, datasource, tags, options }))),
  }));
}

function groupWidgets(ctx) {
  const groups = new Map();
  for (const widget of ctx.widgets) {
    const page = widget.page || "presets";
    if (!groups.has(page)) groups.set(page, []);
    groups.get(page).push(widget);
  }
  return [...groups.entries()].map(([page, rows]) => ({
    path: `widgets/${page}.json`,
    content: json(rows.map(({ slug, key, page: p, title, type, config }) => ({ slug, key, page: p, title, type, config }))),
  }));
}

function buildPackage(spec) {
  const ctx = {
    spec,
    rng: require("./util").createRandom(`seed:${spec.slug}`),
    queries: [],
    widgets: [],
    pages: [],
    workflows: [],
    listeners: [],
    cronJobs: [],
    roles: [],
    seedRows: {},
    counts: {},
  };
  const { buildSchema, buildSeed, buildQueries, requireSpec } = require("./generator");
  requireSpec(spec);
  const schema = buildSchema(spec);
  let seed = buildSeed(spec, ctx);
  buildQueries(spec, ctx);
  buildWorkflows(spec, ctx);
  buildListeners(spec, ctx);
  buildCronJobs(spec, ctx);
  buildListPageForEach(spec, ctx);
  buildDashboardSpec(spec, ctx);
  buildReportsSpec(spec, ctx);
  buildKanbanCalendarSpec(spec, ctx);
  buildSharedPagesSpec(spec, ctx);
  buildAdminPagesSpec(spec, ctx);
  buildRoles(spec, ctx);
  seed += `\n\n${buildRoleMatrixSeed(spec, ctx)}`;
  ctx.supportTableCount = 10;
  ctx.tableCount = ctx.supportTableCount + spec.entities.length;
  ctx.seedRowsCount = Object.values(ctx.seedRows).reduce((n, rows) => n + rows.length, 0);
  const datasources = buildDatasources(spec);
  const manifest = buildManifest(spec, ctx);
  const readme = buildReadme(spec, ctx, manifest);
  const assets = buildAssets(spec, ctx, manifest);
  const files = [
    { path: "manifest.json", content: json(manifest) },
    { path: "README.md", content: readme },
    { path: "schema/001-schema.sql", content: schema },
    { path: "seed/001-seed.sql", content: seed },
    { path: "datasources/datasources.json", content: json(datasources) },
    { path: "listeners/listeners.json", content: json(ctx.listeners) },
    { path: "cronjobs/cronjobs.json", content: json(ctx.cronJobs) },
    { path: "roles/roles.json", content: json(ctx.roles) },
    ...groupQueries(spec, ctx.queries),
    ...groupWidgets(ctx),
    ...ctx.pages.map((page) => ({ path: `pages/${page.slug}.json`, content: json(page) })),
    ...ctx.workflows.map((wf) => ({ path: `workflows/${wf.slug}.json`, content: json(wf) })),
    ...assets.map((asset) => ({ path: asset.path, content: asset.content })),
  ];
  return { spec, manifest, files, ctx };
}

// The page module needs ctx.pages etc.; these links keep the compiler readable.
function buildListPageForEach(spec, ctx) {
  const { buildListPage, buildDetailPage, buildCreatePage } = require("./pages");
  for (const entity of coreEntities(spec)) {
    buildListPage(ctx, spec, entity);
    buildDetailPage(ctx, spec, entity);
    buildCreatePage(ctx, spec, entity);
  }
}

function buildDashboardSpec(spec, ctx) {
  const { buildDashboard } = require("./pages");
  buildDashboard(ctx, spec);
}

function buildReportsSpec(spec, ctx) {
  const { buildReports } = require("./pages");
  buildReports(ctx, spec);
}

function buildKanbanCalendarSpec(spec, ctx) {
  const { buildKanbanCalendar } = require("./pages");
  buildKanbanCalendar(ctx, spec);
}

function buildSharedPagesSpec(spec, ctx) {
  const { buildSharedPages } = require("./pages");
  buildSharedPages(ctx, spec);
}

function buildAdminPagesSpec(spec, ctx) {
  const { buildAdminPages } = require("./pages");
  buildAdminPages(ctx, spec);
}

function writePackage(templateDir, pkg) {
  // Generated package: remove stale files from an earlier generator version.
  if (fs.existsSync(templateDir)) fs.rmSync(templateDir, { recursive: true, force: true });
  fs.mkdirSync(templateDir, { recursive: true });
  for (const file of pkg.files) {
    const target = path.join(templateDir, file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.content, "utf8");
  }
}

module.exports = { buildPackage, writePackage, buildManifest, buildReadme, mermaidERD, mermaidWorkflow };
