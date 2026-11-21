/** Authored operations scenarios. All mutation-like actions produce proposals only. */
const crypto = require("crypto");
const id = (key) => {
  const b = crypto.createHash("sha256").update(`marketplace-advanced-v2:${key}`).digest().subarray(0, 16);
  b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  const h = b.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
const expr = (s) => `{{ ${s} }}`;
const definition = (key, type, defaultValue) => ({ key, type, defaultValue, required: false });

function relation(rows) {
  const keys = Object.keys(rows[0]);
  const literal = (v) => v === null ? "NULL" : typeof v === "number" ? `CAST(${v} AS DOUBLE)` : typeof v === "boolean" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
  return `(VALUES ${rows.map((r) => `(${keys.map((k) => literal(r[k])).join(",")})`).join(",")}) AS fixture(${keys.map((k) => `"${k}"`).join(",")})`;
}

function addAdvancedScenarios(m) {
  const catalog = [];
  function datasource(key, title) {
    m.datasources.push({ datasourceID: id(`ds:${key}`), datasourceTitle: title, datasourceType: "duckdb", datasourceDescription: "Synthetic relational fixtures; no production connection.", datasourceOptions: { databasePath: ":memory:", readonly: false, memoryLimit: "128MB" } });
  }
  function sql(key, title, ds, query, inputs = []) {
    m.queries.push({ dataQueryID: id(`query:${key}`), datasourceID: id(`ds:${ds}`), datasourceType: "duckdb", dataQueryTitle: title,
      dataQueryDescription: "Read-only synthetic fixture query. All filter parameters are numeric and typed.",
      dataQueryOptions: { queryType: "sql", query, inputDefinitions: inputs, timeoutSeconds: 20 }, runOnLoad: false });
  }
  function workflow(key, title, description, inputDefinitions, configure, features, category) {
    const w = { workflowID: id(`wf:${key}`), title, workflowOptions: { description, inputDefinitions,
      workflowRunTimeout: 600, workflowTaskTimeout: 30, defaultNodeTimeoutSeconds: 20, defaultRetryLimit: 0 }, nodes: [], edges: [] };
    const node = (name, type, config = {}) => {
      const nodeID = id(`node:${key}:${name}`);
      w.nodes.push({ nodeID, nodeType: type, timeoutSeconds: 20, retryLimit: 0, nodeConfig: { title: name, errorHandling: "fail_workflow", joinMode: type === "join" ? "all" : "any", position: { x: (w.nodes.length % 4) * 300, y: Math.floor(w.nodes.length / 4) * 220 }, ...config } });
      return nodeID;
    };
    const edge = (a, b, sourceHandle = "success") => w.edges.push({ edgeID: id(`edge:${key}:${w.edges.length}`), upstreamNodeID: a, downstreamNodeID: b, sourceHandle, targetHandle: null, edgeType: "smoothstep", edgeConfig: {} });
    configure(node, edge);
    m.workflows.push(w);
    catalog.push({ slug: `curated-${key}-playbook`, itemType: "workflow", title, description: `Demo · ${description}`, category, features,
      mode: "demo", root: { type: "workflow", id: w.workflowID }, sampleInputs: Object.fromEntries(inputDefinitions.map((d) => [d.key, d.defaultValue])) });
  }
  const q = (key, outputVariable, inputValues = {}) => ({ dataQueryID: id(`query:${key}`), outputVariable, inputValues });
  const end = (variable) => ({ outputParameters: [{ name: "result", sourceVariable: expr(`ctx.${variable}`) }] });

  const accounts = Array.from({ length: 24 }, (_, i) => ({ account_id: i + 1, company: ["Aster", "Horizon", "Sakura", "Café Norte"][i % 4] + ` ${i + 1}`, plan: ["starter", "growth", "enterprise"][i % 3], mrr: [49, 299, 1499][i % 3], health: 20 + (i * 11) % 80, active: i % 7 !== 0 }));
  const invoices = accounts.flatMap((a, i) => [
    { invoice_id: 2 * i + 1, account_id: a.account_id, amount: a.mrr, age_days: (i * 3) % 60, paid: i % 4 === 0, failed_attempts: i % 5 },
    { invoice_id: 2 * i + 2, account_id: a.account_id, amount: a.mrr, age_days: i % 15, paid: i % 3 !== 0, failed_attempts: i % 3 },
  ]);
  const a = `SELECT * FROM ${relation(accounts)}`, inv = `SELECT * FROM ${relation(invoices)}`;
  datasource("renewals", "Subscription health and invoices · embedded demo");
  sql("subscriptionAccounts", "Active subscriptions, plan and customer health", "renewals", `${a} ORDER BY account_id`);
  sql("overdueInvoices", "Overdue invoices joined to subscription health", "renewals", `SELECT i.*,a.company,a.plan,a.mrr,a.health,a.active FROM (${inv}) i JOIN (${a}) a USING(account_id) WHERE NOT i.paid AND i.age_days >= {{ inputs.minAge }} ORDER BY i.amount DESC,i.invoice_id`, [definition("minAge", "number", 14)]);
  sql("renewalCohorts", "At-risk MRR and customer health by subscription plan", "renewals", `SELECT plan,count(*)::INTEGER AS accounts,round(sum(mrr),2) AS mrr,round(sum(CASE WHEN health<50 THEN mrr ELSE 0 END),2) AS at_risk_mrr,round(avg(health),1) AS health FROM (${a}) a WHERE active GROUP BY plan ORDER BY mrr DESC`);
  sql("invoiceAging", "Invoice aging buckets and overdue exposure", "renewals", `SELECT CASE WHEN age_days<14 THEN '0-13 days' WHEN age_days<30 THEN '14-29 days' ELSE '30+ days' END AS bucket,round(sum(amount),2) AS exposure,count(*)::INTEGER AS invoices FROM (${inv}) i WHERE NOT paid GROUP BY bucket ORDER BY bucket`);
  workflow("renewal-dunning", "Subscription dunning with health enrichment and approval gate",
    "Joins invoices and subscription health in parallel, separates closed-account mismatches from reminder candidates, and requires approval for high-value exposure. Produces a contact plan; sends no email and charges no card.",
    [definition("minAge", "number", 14), definition("approvalThreshold", "number", 1000)], (n, e) => {
      const s = n("Start", "start"), f = n("Load independent ledgers", "fanout", { branches: [{ id: "invoices", name: "Overdue invoices" }, { id: "accounts", name: "Subscription health" }] });
      const i = n("Read overdue invoices", "dataQuery", q("overdueInvoices", "invoices", { minAge: expr("ctx.input.minAge") }));
      const a = n("Read subscription health", "dataQuery", q("subscriptionAccounts", "accounts"));
      const j = n("Require both ledgers", "join", { sourceVariables: ["invoices", "accounts"], joinMode: "all", requireAll: true, outputVariable: "ledgers" });
      const p = n("Prioritize reminders and anomalies", "javascript", { code: "var inv=ctx.ledgers.invoices||[];var ac=ctx.ledgers.accounts||[];var candidates=inv.map(function(i){var a=ac.find(function(a){return a.account_id===i.account_id});return {invoice_id:i.invoice_id,company:a.company,amount:i.amount,health:a.health,action:!a.active?'investigate_closed_account':i.failed_attempts>=3?'human_outreach':'payment_reminder'};});return {lines:candidates,total:candidates.reduce(function(s,x){return s+x.amount},0),mode:'proposal_only'};", outputVariable: "plan" });
      const gate = n("High-value sign-off", "condition", { branches: [{ id: "review", label: "Exposure requires approval", condition: "ctx.plan.total >= ctx.input.approvalThreshold" }], defaultBranch: "draft" });
      const approve = n("Approve contact plan", "approval", { title: "Approve proposed dunning contacts?", description: "Inspect customer health and closed-account mismatches. No messages are sent.", requireComment: true, expiryMinutes: 10, onTimeout: "expired", outputVariable: "approval" });
      const yes = n("Return approved proposal", "javascript", { code: "return {status:'approved_proposal',plan:ctx.plan,review:ctx.approval,externalWrites:0};", outputVariable: "result" });
      const draft = n("Return low-exposure draft", "javascript", { code: "return {status:'draft',plan:ctx.plan,externalWrites:0};", outputVariable: "result" });
      const no = n("Preserve rejection or expiry", "javascript", { code: "return {status:ctx.approval.expired?'expired':'rejected',plan:ctx.plan,review:ctx.approval,externalWrites:0};", outputVariable: "result" });
      const z = n("Return contact packet", "end", end("result"));
      e(s, f, "output"); e(f, i, "invoices"); e(f, a, "accounts"); e(i, j); e(a, j); e(j, p, "output"); e(p, gate); e(gate, approve, "review"); e(gate, draft, "draft"); e(approve, yes, "approved"); e(approve, no, "rejected"); e(approve, no, "expired"); e(yes, z); e(draft, z); e(no, z);
    }, ["parallel enrichment", "invoice aging", "human approval", "closed-account exceptions"], "Payments & Commerce");

  const tickets = Array.from({ length: 48 }, (_, i) => ({ ticket_id: i + 1, subject: ["Checkout unavailable", "Export incomplete", "Login blocked", "Invoice correction"][i % 4], tier: ["standard", "premium", "enterprise"][i % 3], minutes_open: 10 + (i * 43) % 1500, sla_minutes: [1440, 480, 120][i % 3], severity: ["P1", "P2", "P3", "P4"][i % 4], owner: ["Support", "Platform", "Billing"][i % 3], reopened: i % 6 === 0 }));
  const t = `SELECT * FROM ${relation(tickets)}`;
  datasource("support", "Support cases and SLA clocks · embedded demo");
  sql("slaQueue", "Support cases by SLA consumption and reopen penalty", "support", `SELECT *,round(100.0*minutes_open/sla_minutes,1) AS consumed_pct,greatest(0,minutes_open-sla_minutes) AS breached_minutes FROM (${t}) t WHERE minutes_open*1.0/sla_minutes >= {{ inputs.ratio }} ORDER BY consumed_pct DESC,ticket_id`, [definition("ratio", "number", 0.75)]);
  sql("slaOwners", "SLA breach concentration and affected tiers by owner", "support", `SELECT owner,count(*)::INTEGER AS cases,sum(CASE WHEN minutes_open>sla_minutes THEN 1 ELSE 0 END)::INTEGER AS breached,round(avg(100.0*minutes_open/sla_minutes),1) AS consumed_pct FROM (${t}) t GROUP BY owner ORDER BY breached DESC,owner`);
  sql("slaTiers", "Tier-level SLA breach heatmap", "support", `SELECT tier,severity,count(*)::INTEGER AS cases,sum(CASE WHEN minutes_open>sla_minutes THEN 1 ELSE 0 END)::INTEGER AS breached FROM (${t}) t GROUP BY tier,severity ORDER BY tier,severity`);
  workflow("support-triage", "SLA triage with bounded scoring and priority-specific dispatch",
    "Scores up to eight cases using SLA consumption, severity and reopen penalties; routes the batch into urgent or standard response proposals. Creates no external ticket or notification.",
    [definition("ratio", "number", 0.75)], (n, e) => {
      const s = n("Start", "start"), qn = n("Read at-risk cases", "dataQuery", q("slaQueue", "cases", { ratio: expr("ctx.input.ratio") }));
      const trim = n("Bound review batch", "javascript", { code: "return (ctx.cases||[]).slice(0,8);", outputVariable: "batch" });
      const l = n("Score each case", "loop", { sourceVariable: "batch", itemVariable: "ticket", indexVariable: "index", outputVariable: "scores", maxIterations: 8, errorHandling: "skip_item" });
      const score = n("Combine severity and SLA budget", "javascript", { code: "var t=ctx.ticket;var score=(t.severity==='P1'?100:t.severity==='P2'?60:20)+Math.min(200,t.consumed_pct)+(t.reopened?25:0);return {ticket_id:t.ticket_id,owner:t.owner,score:score,breached:t.breached_minutes>0,action:score>=200?'escalate':'triage'};", outputVariable: "caseScore" });
      const summary = n("Group escalations by accountable owner", "javascript", { code: "var rows=ctx.scores||[];return {cases:rows,urgent:rows.filter(function(x){return x.action==='escalate'}),tier:rows.some(function(x){return x.action==='escalate'})?'urgent':'standard',processed:rows.length};", outputVariable: "summary" });
      const sw = n("Dispatch by batch priority", "switch", { switchValue: expr("ctx.summary.tier"), cases: [{ id: "urgent", label: "Escalation proposal", operator: "equals", matchValue: "urgent" }] });
      const urgent = n("Prepare escalation evidence", "javascript", { code: "return {route:'on_call_proposal',summary:ctx.summary,externalWrites:0};", outputVariable: "result" });
      const standard = n("Prepare normal review queue", "javascript", { code: "return {route:'support_review',summary:ctx.summary,externalWrites:0};", outputVariable: "result" });
      const z = n("Return routing packet", "end", end("result"));
      e(s, qn, "output"); e(qn, trim); e(trim, l); e(l, score, "loop"); e(l, summary, "completed"); e(summary, sw); e(sw, urgent, "urgent"); e(sw, standard, "default"); e(urgent, z); e(standard, z);
    }, ["SLA budget", "bounded loop", "severity scoring", "priority switch"], "Productivity & Content");

  const grants = Array.from({ length: 36 }, (_, i) => ({ grant_id: i + 1, user_name: `reviewer-${i + 1}`, role: ["reader", "editor", "admin"][i % 3], days_since_login: (i * 17) % 190, terminated: i % 8 === 0, has_mfa: i % 5 !== 0, resource: ["billing", "warehouse", "deployment"][i % 3] }));
  datasource("access", "Access grants and identity posture · embedded demo");
  sql("accessFindings", "Privileged dormant access and terminated identities", "access", `SELECT *,CASE WHEN terminated THEN 'terminated_identity' WHEN role='admin' AND NOT has_mfa THEN 'privileged_without_mfa' ELSE 'dormant_privilege' END AS finding FROM ${relation(grants)} WHERE terminated OR (role='admin' AND (NOT has_mfa OR days_since_login > {{ inputs.dormancyDays }})) ORDER BY terminated DESC,days_since_login DESC`, [definition("dormancyDays", "number", 60)]);
  workflow("access-recertification", "Privileged-access recertification with fail-closed approval",
    "Finds terminated identities, dormant administrators and missing MFA, builds a least-privilege revocation proposal, then waits for approval, rejection or expiry. It never revokes real access.",
    [definition("dormancyDays", "number", 60)], (n, e) => {
      const s = n("Start", "start"), qn = n("Read access findings", "dataQuery", q("accessFindings", "findings", { dormancyDays: expr("ctx.input.dormancyDays") }));
      const p = n("Build least-privilege change set", "javascript", { code: "return {count:ctx.findings.length,changes:ctx.findings.map(function(g){return {grant_id:g.grant_id,user:g.user_name,resource:g.resource,reason:g.finding,proposedRole:g.terminated?'none':'reader'}}),mode:'proposal_only'};", outputVariable: "proposal" });
      const gate = n("Require review only for findings", "condition", { branches: [{ id: "review", label: "Findings exist", condition: "ctx.proposal.count > 0" }], defaultBranch: "clear" });
      const approval = n("Approve least-privilege proposal", "approval", { title: "Review proposed access reductions", description: "Verify employment and access requirements. This run produces evidence only.", requireComment: true, expiryMinutes: 10, onTimeout: "expired", outputVariable: "approval" });
      const yes = n("Record approved proposal", "javascript", { code: "return {status:'approved_proposal',proposal:ctx.proposal,externalWrites:0};", outputVariable: "result" });
      const no = n("Fail closed on rejection or expiry", "javascript", { code: "return {status:ctx.approval.expired?'expired':'rejected',proposal:ctx.proposal,externalWrites:0};", outputVariable: "result" });
      const clear = n("Record clean review", "javascript", { code: "return {status:'no_changes',proposal:ctx.proposal,externalWrites:0};", outputVariable: "result" });
      const z = n("Return audit evidence", "end", end("result"));
      e(s, qn, "output"); e(qn, p); e(p, gate); e(gate, approval, "review"); e(gate, clear, "clear"); e(approval, yes, "approved"); e(approval, no, "rejected"); e(approval, no, "expired"); e(yes, z); e(no, z); e(clear, z);
    }, ["least privilege", "MFA audit", "human approval", "fail closed"], "Identity & Security");

  function source(alias, key, extra = {}) { return { alias, type: "query", queryID: id(`query:${key}`), triggerMode: "auto", inputValues: {}, refreshOn: [], ...extra }; }
  function page(key, title, category, sources, variables, features, build) {
    const widgets = [], rows = [];
    const add = (suffix, widgetTitle, widgetType, widgetConfig, span = 12) => {
      const widgetID = id(`widget:${key}:${suffix}`), widgetKey = `widget_${widgetID}_1`;
      m.widgets.push({ widgetID, widgetTitle, widgetType, widgetDescription: "Synthetic demonstration with real bundled query bindings.", widgetConfig: { showHeader: true, ...widgetConfig }, refreshInterval: null });
      widgets.push(widgetKey);
      return { id: id(`slot:${key}:${suffix}`), type: "widget", widgetKey, span, sizing: "fill", minHeight: widgetType === "table" ? 360 : widgetType === "vega-lite" ? 320 : undefined };
    };
    const row = (...children) => rows.push({ id: id(`row:${key}:${rows.length}`), type: "row", sizing: "auto", children });
    build(add, row);
    const appPageID = id(`page:${key}`);
    m.pages.push({ appPageID, appPageTitle: title, appPageDescription: "Synthetic operations rehearsal; automation is manual and proposal-only.", appPageConfig: { layoutVersion: 2, layout: { id: "root", type: "column", children: rows }, widgets, layouts: {}, variables, dataSources: sources } });
    catalog.push({ slug: `curated-${key}-workspace`, itemType: "appTemplate", title, description: `Demo · ${features.join(", ")}. Includes bound queries, fixture data and a manual proposal-only playbook.`, category, features, mode: "demo", root: { type: "appPage", id: appPageID } });
  }
  const data = (alias) => `((state.queries.${alias} || {}).data || [])`;
  const table = (alias, columns) => ({ dataArrayTemplate: expr(data(alias)), columns: columns.map(([key, label, type = "text"]) => ({ key, label, type, sortable: true })), pagination: { enabled: true, pageSize: 10 }, search: { enabled: true }, export: { enabled: true, format: "csv" }, editing: { enabled: false }, isLoading: expr(`(state.queries.${alias} || {}).isLoading || false`) });
  const chart = (alias, encoding, mark = "bar") => ({ vegaSpec: { $schema: "https://vega.github.io/schema/vega-lite/v5.json", width: "container", height: "container", data: { values: expr(data(alias)) }, mark: { type: mark, tooltip: true }, encoding }, renderer: "svg", showActions: false });
  const notice = (text) => ({ content: `# ${text}\nSynthetic data. No emails, payments, access changes or external tickets are issued.`, format: "markdown", showHeader: false });
  const run = (alias) => ({ actionType: "EXECUTE_QUERY", config: { alias } });
  const workflowSource = (key) => ({ alias: "proposal", type: "workflow", workflowID: id(`wf:${key}`), triggerMode: "manual", inputValues: {}, refreshOn: [] });
  const result = { dataTemplate: expr("(state.workflows.proposal || {}).data || null"), isLoading: expr("(state.workflows.proposal || {}).isLoading || false"), maxHeight: 300 };
  page("renewal-operations", "Subscription retention, MRR exposure and dunning desk", "Payments & Commerce", [
    source("invoices", "overdueInvoices", { triggerMode: "reactive", inputValues: { minAge: expr("state.variables.minAge") }, refreshOn: ["variables.minAge"] }), source("cohorts", "renewalCohorts"), source("aging", "invoiceAging"), { ...workflowSource("renewal-dunning"), inputValues: { minAge: expr("state.variables.minAge") } },
  ], [definition("minAge", "number", 14)], ["plan-level MRR exposure", "invoice aging", "health-enriched dunning", "approval gate"], (add, row) => {
    row(add("notice", "Subscription operations", "text", notice("Subscription retention and dunning")));
    row(add("age", "Overdue age", "slider", { label: "Minimum overdue days", min: 0, max: 60, step: 1, defaultValue: 14, events: { onChange: [{ actionType: "SET_VARIABLE", config: { key: "state.variables.minAge", value: expr("event.value") } }] } }, 6), add("run", "Prepare dunning proposal", "button", { text: "Prepare contact plan", events: { onClick: [run("proposal")] } }, 6));
    row(add("queue", "Overdue customer invoices", "table", table("invoices", [["invoice_id", "Invoice", "number"], ["company", "Company"], ["plan", "Plan"], ["amount", "Exposure", "number"], ["health", "Health", "number"], ["age_days", "Days overdue", "number"]]), 8), add("aging", "Unpaid exposure by aging bucket", "vega-lite", chart("aging", { x: { field: "bucket", type: "ordinal" }, y: { field: "exposure", type: "quantitative" } }), 4));
    row(add("cohorts", "At-risk MRR by plan", "vega-lite", chart("cohorts", { x: { field: "plan", type: "nominal" }, y: { field: "at_risk_mrr", type: "quantitative" }, color: { field: "health", type: "quantitative" } }), 6), add("result", "Dunning review result", "json-viewer", result, 6));
  });
  page("support-operations", "SLA budget, breach concentration and escalation desk", "Productivity & Content", [
    source("cases", "slaQueue"), source("owners", "slaOwners"), source("tiers", "slaTiers"), workflowSource("support-triage"),
  ], [], ["SLA consumption", "owner accountability", "tier/severity heatmap", "bounded triage"], (add, row) => {
    row(add("notice", "Support operations", "text", notice("SLA breach triage")));
    row(add("run", "Score eight at-risk cases", "button", { text: "Prepare escalation batch", events: { onClick: [run("proposal")] } }, 4), add("kpi", "Cases beyond SLA", "stat", { label: "Breached cases", valueTemplate: expr(`${data("owners")}.reduce(function(s,x){return s+Number(x.breached||0)},0)`) }, 4));
    row(add("queue", "At-risk case queue", "table", table("cases", [["ticket_id", "Ticket", "number"], ["subject", "Subject"], ["severity", "Severity"], ["tier", "Tier"], ["owner", "Owner"], ["consumed_pct", "SLA consumed %", "number"]])));
    row(add("heatmap", "Breaches by tier and severity", "vega-lite", chart("tiers", { x: { field: "severity", type: "ordinal" }, y: { field: "tier", type: "nominal" }, color: { field: "breached", type: "quantitative" } }, "rect"), 6), add("owners", "Accountable-owner breach totals", "vega-lite", chart("owners", { x: { field: "owner", type: "nominal" }, y: { field: "breached", type: "quantitative" } }), 6));
    row(add("result", "Escalation proposal", "json-viewer", result));
  });
  return catalog;
}

module.exports = { addAdvancedScenarios };
