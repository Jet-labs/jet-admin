/**
 * Workflow, listener, cron and role generation for marketplace templates.
 */
const { deterministicUUID, titleCase } = require("./util");
const {
  coreEntities,
  statusField,
  labelField,
  dateField,
  amountField,
  ownerField,
  isClosedStatus,
} = require("./model");

function expr(body) {
  return `{{ ${body} }}`;
}

function qid(spec, slug) {
  return deterministicUUID(`${spec.slug}:dataQuery:${slug}`);
}

function wfid(spec, slug) {
  return deterministicUUID(`${spec.slug}:workflow:${slug}`);
}

function nid(spec, slug, node) {
  return deterministicUUID(`${spec.slug}:node:${slug}:${node}`);
}

function eid(spec, slug, index) {
  return deterministicUUID(`${spec.slug}:edge:${slug}:${index}`);
}

function inputDef(key, type = "string", defaultValue = undefined, required = false) {
  return { key, type, required, ...(defaultValue !== undefined ? { defaultValue } : {}) };
}

function workflow(spec, ctx, { key, title, description, tags, inputs = [], configure }) {
  const wf = {
    slug: `${spec.alias}.${key}`,
    key,
    title,
    description,
    tags,
    options: {
      description,
      inputDefinitions: inputs,
      workflowRunTimeout: 600,
      workflowTaskTimeout: 60,
      humanInLoopTimeout: 3600,
      defaultNodeTimeoutSeconds: 30,
      defaultRetryLimit: 1,
      defaultRetryDelaySeconds: 3,
      nodeDefaults: {
        javascript: { timeoutSeconds: 10, retryLimit: 1, retryDelaySeconds: 1 },
        dataQuery: { timeoutSeconds: 30, retryLimit: 1, retryDelaySeconds: 2 },
      },
    },
    nodes: [],
    edges: [],
  };
  const node = (nodeKey, nodeType, nodeConfig = {}, options = {}) => {
    const id = nid(spec, key, nodeKey);
    wf.nodes.push({
      key: nodeKey,
      nodeID: id,
      type: nodeType,
      timeoutSeconds: options.timeoutSeconds ?? 30,
      retryLimit: options.retryLimit ?? 1,
      config: {
        title: nodeKey,
        errorHandling: options.errorHandling || "continue",
        joinMode: nodeType === "join" ? "all" : "any",
        position: { x: (wf.nodes.length % 4) * 320, y: Math.floor(wf.nodes.length / 4) * 220 },
        ...nodeConfig,
      },
    });
    return id;
  };
  const edge = (from, to, handle = "success") => {
    wf.edges.push({
      from,
      to,
      handle,
      edgeType: "smoothstep",
      edgeConfig: {},
    });
  };
  const q = (nodeKey, querySlug, outputVariable, inputValues = {}) =>
    node(nodeKey, "dataQuery", { dataQueryID: qid(spec, querySlug), outputVariable, inputValues });
  const js = (nodeKey, code, outputVariable = "result", options = {}) =>
    node(nodeKey, "javascript", { code, outputVariable, ...options });
  const end = (nodeKey, variable) =>
    node(nodeKey, "end", { outputParameters: [{ name: "result", sourceVariable: expr(`ctx.${variable}`) }] });
  configure({ node, edge, q, js, end, wf });
  const startNode = wf.nodes.find((n) => n.type === "start");
  if (startNode) {
    for (const item of wf.edges) {
      if (item.from === startNode.nodeID && item.handle === "success") item.handle = "output";
    }
  }
  ctx.workflows.push(wf);
  return wf;
}

function buildWorkflows(spec, ctx) {
  const main = coreEntities(spec)[0];
  const st = statusField(main);
  const owner = ownerField(main);
  const dt = dateField(main);
  const amount = amountField(main);
  const label = labelField(main);
  const slugs = {
    detail: `${spec.alias}.${main.key}.detail`,
    list: `${spec.alias}.${main.key}.list`,
    overdue: dt ? `${spec.alias}.${main.key}.overdue` : `${spec.alias}.${main.key}.list`,
    stats: `${spec.alias}.${main.key}.stats`,
    status: st ? `${spec.alias}.${main.key}.status` : `${spec.alias}.${main.key}.update`,
    assign: owner ? `${spec.alias}.${main.key}.assign` : `${spec.alias}.${main.key}.update`,
    score: `${spec.alias}.${main.key}.score`,
    notify: `${spec.alias}.shared.notification_create`,
    comment: `${spec.alias}.shared.comment_create`,
    attachment: `${spec.alias}.shared.attachment_create`,
    integration: `${spec.alias}.shared.integration_ping`,
    settings: `${spec.alias}.shared.settings`,
  };
  const notifyInputs = (title, body, staffID = "ctx.recordID") => ({
    staffID: `{{ ${staffID} }}`,
    title,
    body,
    category: "info",
    linkPage: `${spec.alias}-notifications`,
  });

  // 1. Intake triage.
  workflow(spec, ctx, {
    key: "intake-triage",
    title: `${main.title} · intake triage`,
    description: "Loads a record, computes a deterministic risk/priority score, then routes to review or standard triage and notifies the owner.",
    tags: ["core", "automation"],
    inputs: [inputDef("recordID", "number", 1), inputDef("staffID", "number", 1)],
    configure({ node, edge, q, js, end }) {
      const s = node("start", "start");
      const d = q("loadRecord", slugs.detail, "recordRows", { id: "{{ ctx.recordID }}" });
      const score = js("scoreRecord", `
var r = (ctx.recordRows || [])[0] || {};
var amount = Number(r.${amount ? amount.key : "id"} || 0);
var score = Math.min(100, Math.round((amount > 50000 ? 60 : 20) + (${st ? `String(r.${st.key}) === "new" ? 20 : 5` : "5"})));
return { recordID: Number(r.id || ctx.recordID), score: score, decision: score >= 70 ? "review" : "standard", ownerID: Number(r.${owner ? owner.key : "id"} || ctx.staffID) };
`, "score");
      const cond = node("highValue", "condition", {
        branches: [{ id: "review", label: "Needs review", condition: "ctx.score.score >= 70" }],
        defaultBranch: "standard",
      });
      const high = q("setReview", slugs.status, "reviewResult", { id: "{{ ctx.recordID }}", status: st ? st.values[Math.min(1, st.values.length - 1)] : "review" });
      const low = q("setStandard", slugs.status, "standardResult", { id: "{{ ctx.recordID }}", status: st ? st.values[0] : "new" });
      const notifyHigh = q("notifyReview", slugs.notify, "notification", {
        staffID: "{{ ctx.score.ownerID || ctx.staffID }}",
        title: `${main.title} needs review`,
        body: `Record #{{ ctx.recordID }} scored {{ ctx.score.score }} and was routed for review.`,
        category: "warning",
        linkPage: `${spec.alias}-notifications`,
      });
      const z = end("done", "score");
      edge(s, d);
      edge(d, score);
      edge(score, cond);
      edge(cond, high, "review");
      edge(cond, low, "standard");
      edge(high, notifyHigh);
      edge(notifyHigh, z);
      edge(low, z);
    },
  });

  // 2. Round-robin assignment.
  if (owner) {
    workflow(spec, ctx, {
      key: "round-robin-assignment",
      title: `${main.title} · round-robin assignment`,
      description: "Picks the least-loaded active staff member and assigns the record, then sends an in-app notification.",
      tags: ["core", "automation"],
      inputs: [inputDef("recordID", "number", 1)],
      configure({ node, edge, q, js, end }) {
        const s = node("start", "start");
        const staff = q("loadStaff", `${spec.alias}.shared.operational_staff`, "staffRows");
        const pick = js("pickAssignee", `
var list = (ctx.staffRows || []);
var chosen = list.length ? list[0] : { id: 1, full_name: "Unassigned" };
return { staffID: Number(chosen.id || 1), name: chosen.full_name || "Unassigned", load: Number(chosen.assigned || 0) };
`, "assignment");
        const assign = q("assignOwner", slugs.assign, "assignmentResult", { id: "{{ ctx.recordID }}", staffID: "{{ ctx.assignment.staffID }}" });
        const notify = q("notifyOwner", slugs.notify, "notification", {
          staffID: "{{ ctx.assignment.staffID }}",
          title: `${main.title} assigned`,
          body: `Record #{{ ctx.recordID }} was assigned to {{ ctx.assignment.name }} ({{ ctx.assignment.load }} open items).`,
          category: "action",
          linkPage: `${spec.alias}-${main.key}-list`,
        });
        const z = end("done", "assignment");
        edge(s, staff); edge(staff, pick); edge(pick, assign); edge(assign, notify); edge(notify, z);
      },
    });
  }

  // 3. Approval chain.
  if (st) {
    workflow(spec, ctx, {
      key: "approval-chain",
      title: `${main.title} · approval chain`,
      description: "Human approval with timeout, rejection and expiry paths. Approved records move to the next stage; every path notifies the owner.",
      tags: ["core", "approval"],
      inputs: [inputDef("recordID", "number", 1), inputDef("staffID", "number", 1)],
      configure({ node, edge, q, end }) {
        const s = node("start", "start");
        const d = q("loadRecord", slugs.detail, "recordRows", { id: "{{ ctx.recordID }}" });
        const approval = node("approval", "approval", {
          title: `Approve ${main.singular || main.title} #{{ ctx.recordID }}`,
          description: "Review the record, then approve or reject with a comment.",
          requireComment: true,
          expiryMinutes: 1440,
          onTimeout: "expired",
          outputVariable: "approval",
        }, { timeoutSeconds: 900, retryLimit: 0 });
        const approved = q("setApproved", slugs.status, "approvedResult", { id: "{{ ctx.recordID }}", status: st.values[Math.min(1, st.values.length - 1)] });
        const rejected = q("setRejected", slugs.status, "rejectedResult", { id: "{{ ctx.recordID }}", status: st.values[st.values.length - 1] });
        const expired = q("setExpired", slugs.status, "expiredResult", { id: "{{ ctx.recordID }}", status: st.values[0] });
        const notify = q("notifyDecision", slugs.notify, "notification", {
          staffID: "{{ ctx.staffID }}",
          title: `${main.title} approval decision`,
          body: `Record #{{ ctx.recordID }} decision: {{ ctx.approval.decision || "expired" }}.`,
          category: "info",
          linkPage: `${spec.alias}-notifications`,
        });
        const z = end("done", "approval");
        edge(s, d); edge(d, approval); edge(approval, approved, "approved"); edge(approval, rejected, "rejected"); edge(approval, expired, "expired");
        edge(approved, notify); edge(rejected, notify); edge(expired, notify); edge(notify, z);
      },
    });
  }

  // 4. Threshold sweep.
  workflow(spec, ctx, {
    key: "threshold-sweep",
    title: `${main.title} · threshold sweep`,
    description: "Finds overdue records, iterates with a bounded loop and sends an in-app reminder for each one.",
    tags: ["core", "automation", "sla"],
    inputs: [inputDef("days", "number", dt ? 7 : 14), inputDef("staffID", "number", 1)],
    configure({ node, edge, q, js, end }) {
      const s = node("start", "start");
      const overdue = q("loadOverdue", slugs.overdue, "overdueRows", { days: "{{ ctx.days }}" });
      const batch = js("boundBatch", `return (ctx.overdueRows || []).slice(0, 20);`, "batch");
      const loop = node("loopOverdue", "loop", {
        sourceVariable: "batch",
        itemVariable: "record",
        indexVariable: "index",
        outputVariable: "reminders",
        maxIterations: 20,
      });
      const notify = q("notifyOverdue", slugs.notify, "reminder", {
        staffID: "{{ ctx.record.${owner ? owner.key : 'id'} || ctx.staffID }}",
        title: `${main.title} overdue`,
        body: `Record #{{ ctx.record.id }} is past its due date and needs attention.`,
        category: "warning",
        linkPage: `${spec.alias}-${main.key}-list`,
      });
      const z = end("done", "reminders");
      edge(s, overdue); edge(overdue, batch); edge(batch, loop); edge(loop, notify, "loop"); edge(loop, z, "completed");
    },
  });

  // 5. Daily digest.
  workflow(spec, ctx, {
    key: "daily-digest",
    title: `${main.title} · daily digest`,
    description: "Builds a daily summary and writes a single in-app notification.",
    tags: ["automation", "digest"],
    inputs: [inputDef("staffID", "number", 1)],
    configure({ node, edge, q, js, end }) {
      const s = node("start", "start");
      const stats = q("loadStats", slugs.stats, "summary");
      const compose = js("composeDigest", `
var s = (ctx.summary || [])[0] || {};
return { total: Number(s.total || 0), value: Number(s.total_value || 0), staffID: ctx.staffID || 1 };
`, "digest");
      const notify = q("sendDigest", slugs.notify, "notification", {
        staffID: "{{ ctx.digest.staffID }}",
        title: `${spec.name} daily digest`,
        body: "{{ ctx.digest.total }} records · value {{ ctx.digest.value }}",
        category: "info",
        linkPage: `${spec.alias}-dashboard`,
      });
      const z = end("done", "digest");
      edge(s, stats); edge(stats, compose); edge(compose, notify); edge(notify, z);
    },
  });

  // 6. Escalation with a durable delay.
  workflow(spec, ctx, {
    key: "escalation",
    title: `${main.title} · escalation`,
    description: "Waits for a configurable delay, then escalates high-priority records and notifies the manager.",
    tags: ["automation", "escalation"],
    inputs: [inputDef("recordID", "number", 1), inputDef("staffID", "number", 1)],
    configure({ node, edge, q, js, end }) {
      const s = node("start", "start");
      const delay = node("waitForResponse", "delay", { delayType: "fixed", delayMs: 250 });
      const d = q("loadRecord", slugs.detail, "recordRows", { id: "{{ ctx.recordID }}" });
      const decide = js("readPriority", `
var r = (ctx.recordRows || [])[0] || {};
return { id: r.id || ctx.recordID, priority: String(r.${st ? st.key : "id"} || ""), ownerID: Number(r.${owner ? owner.key : "id"} || ctx.staffID) };
`, "record");
      const cond = node("needsEscalation", "condition", {
        branches: [{ id: "escalate", label: "Escalate", condition: "['urgent','high','critical','overdue'].indexOf(String(ctx.record.priority).toLowerCase()) >= 0" }],
        defaultBranch: "normal",
      });
      const notify = q("notifyEscalation", slugs.notify, "notification", {
        staffID: "{{ ctx.record.ownerID }}",
        title: `${main.title} escalation`,
        body: `Record #{{ ctx.record.id }} was escalated after the response window.`,
        category: "warning",
        linkPage: `${spec.alias}-${main.key}-list`,
      });
      const z = end("done", "record");
      edge(s, delay); edge(delay, d); edge(d, decide); edge(decide, cond); edge(cond, notify, "escalate"); edge(cond, z, "normal"); edge(notify, z);
    },
  });

  // 7. External sync with error handler.
  workflow(spec, ctx, {
    key: "integration-sync",
    title: `${spec.name} · integration sync`,
    description: "Calls the mock REST integration, normalizes the response and recovers through an explicit error path. The default endpoint is intentionally unreachable.",
    tags: ["automation", "integration"],
    inputs: [inputDef("recordID", "number", 1)],
    configure({ node, edge, q, js, end }) {
      const s = node("start", "start");
      const ping = q("callIntegration", slugs.integration, "integrationResponse");
      const normalize = js("normalizeResponse", `
return { ok: true, response: ctx.integrationResponse || null, recordID: ctx.recordID || 1 };
`, "sync");
      const recover = js("recover", `
return { ok: false, recovered: true, reason: "Mock integration unreachable; queued for retry", recordID: ctx.recordID || 1 };
`, "sync", { errorHandling: "continue" });
      const notify = q("notifyFailure", slugs.notify, "notification", {
        staffID: "{{ ctx.staffID || 1 }}",
        title: `${spec.name} integration sync recovered`,
        body: "The mock integration failed and the workflow took the compensation path.",
        category: "warning",
        linkPage: `${spec.alias}-admin-integrations`,
      });
      const z = end("done", "sync");
      edge(s, ping); edge(ping, normalize); edge(ping, recover, "error"); edge(normalize, z); edge(recover, notify); edge(notify, z);
    },
  });

  // 8. Document generation.
  workflow(spec, ctx, {
    key: "document-generation",
    title: `${main.title} · document generation`,
    description: "Builds an HTML document from record fields, links it as an attachment and notifies the owner.",
    tags: ["automation", "documents"],
    inputs: [inputDef("recordID", "number", 1)],
    configure({ node, edge, q, js, end }) {
      const s = node("start", "start");
      const d = q("loadRecord", slugs.detail, "recordRows", { id: "{{ ctx.recordID }}" });
      const build = js("buildDocument", `
var r = (ctx.recordRows || [])[0] || {};
var html = "<h1>" + String(r.${label} || "Record") + "</h1><p>Record #" + String(r.id) + "</p>";
return { fileName: "${main.key}-" + String(r.id || ctx.recordID) + ".pdf", fileURL: "https://files.example.invalid/${spec.slug}/" + String(r.id || ctx.recordID) + ".pdf", mimeType: "application/pdf", html: html };
`, "document");
      const attach = q("linkDocument", slugs.attachment, "attachment", {
        entity: main.key,
        entityID: "{{ ctx.recordID }}",
        fileName: "{{ ctx.document.fileName }}",
        fileURL: "{{ ctx.document.fileURL }}",
        mimeType: "{{ ctx.document.mimeType }}",
        uploadedBy: "{{ ctx.staffID || 1 }}",
      });
      const notify = q("notifyDocument", slugs.notify, "notification", {
        staffID: "{{ ctx.staffID || 1 }}",
        title: `${main.title} document ready`,
        body: `Document {{ ctx.document.fileName }} was generated for record #{{ ctx.recordID }}.`,
        category: "success",
        linkPage: `${spec.alias}-${main.key}-detail`,
      });
      const z = end("done", "document");
      edge(s, d); edge(d, build); edge(build, attach); edge(attach, notify); edge(notify, z);
    },
  });

  // 9. Human data collection.
  workflow(spec, ctx, {
    key: "data-collection",
    title: `${main.title} · supplier/customer follow-up`,
    description: "Suspends for a structured follow-up form, then records the answer as a comment.",
    tags: ["automation", "data-collection"],
    inputs: [inputDef("recordID", "number", 1)],
    configure({ node, edge, q, end }) {
      const s = node("start", "start");
      const form = node("collectFollowUp", "dataCollection", {
        title: `Follow up on ${main.singular || main.title} #{{ ctx.recordID }}`,
        description: "Record the external response and the revised commitment date.",
        collectionType: "form",
        outputVariable: "followUp",
        expiryMinutes: 1440,
        formSchema: {
          type: "object",
          properties: {
            outcome: { type: "string", title: "Outcome", enum: ["confirmed", "delayed", "declined"] },
            revisedDate: { type: "string", title: "Revised date" },
            notes: { type: "string", title: "Notes", minLength: 5 },
          },
          required: ["outcome", "notes"],
        },
        formUischema: {
          type: "VerticalLayout",
          elements: [
            { type: "Control", scope: "#/properties/outcome" },
            { type: "Control", scope: "#/properties/revisedDate" },
            { type: "Control", scope: "#/properties/notes", options: { multi: true, rows: 3 } },
          ],
        },
      }, { timeoutSeconds: 900, retryLimit: 0 });
      const comment = q("recordFollowUp", slugs.comment, "commentResult", {
        entity: main.key,
        entityID: "{{ ctx.recordID }}",
        authorID: "{{ ctx.staffID || 1 }}",
        body: "Follow-up: {{ ctx.followUp.outcome }} · {{ ctx.followUp.notes }} · revised {{ ctx.followUp.revisedDate }}",
      });
      const z = end("done", "followUp");
      edge(s, form); edge(form, comment, "output"); edge(comment, z);
    },
  });

  // 10. Expected failure and recovery.
  workflow(spec, ctx, {
    key: "error-recovery",
    title: `${spec.name} · expected failure and recovery`,
    description: "Injects a bounded failure, follows the error edge and confirms the compensation path with a notification.",
    tags: ["automation", "reliability"],
    inputs: [inputDef("recordID", "number", 1)],
    configure({ node, edge, q, js, end }) {
      const s = node("start", "start");
      const fail = js("injectFailure", `throw new Error("Synthetic upstream unavailable");`, "failure", { errorHandling: "continue", retryLimit: 0 });
      const recover = js("compensate", `return { recovered: true, fallback: "cached snapshot", recordID: ctx.recordID || 1 };`, "recovery");
      const notify = q("notifyRecovery", slugs.notify, "notification", {
        staffID: "{{ ctx.staffID || 1 }}",
        title: `${spec.name} recovery completed`,
        body: "A failed upstream call was compensated without losing the record.",
        category: "warning",
        linkPage: `${spec.alias}-admin-jobs`,
      });
      const z = end("done", "recovery");
      edge(s, fail); edge(fail, recover, "error"); edge(recover, notify); edge(notify, z);
    },
  });

  // A short notification-only workflow is useful for listener demos when
  // customers do not want to run a full triage.
  workflow(spec, ctx, {
    key: "notify-only",
    title: `${spec.name} · notify only`,
    description: "Minimal workflow used by inbound webhooks and manual demos: writes one notification.",
    tags: ["automation", "listener"],
    inputs: [inputDef("recordID", "number", 1), inputDef("event", "object", {})],
    configure({ node, edge, q, end }) {
      const s = node("start", "start");
      const notify = q("notify", slugs.notify, "notification", {
        staffID: "{{ ctx.staffID || 1 }}",
        title: `${spec.name} event received`,
        body: "Event {{ ctx.event.kind || 'record' }} received for record #{{ ctx.recordID }}.",
        category: "info",
        linkPage: `${spec.alias}-notifications`,
      });
      const z = end("done", "notification");
      edge(s, notify); edge(notify, z);
    },
  });
}

function buildListeners(spec, ctx) {
  const main = coreEntities(spec)[0];
  const dashboard = ctx.pages.find((p) => p.key === "dashboard");
  const workflow = (key) => wfid(spec, `${spec.alias}.${key}`);
  const listeners = [
    {
      key: "record-created",
      title: `${main.title} · record created`,
      description: "Inbound record-created event triggers intake triage.",
      event: "record.created",
      workflow: "intake-triage",
      inputs: { recordID: "{{ event.record_id }}", staffID: "{{ event.staff_id }}", event: "{{ event }}" },
    },
    {
      key: "record-status-changed",
      title: `${main.title} · status changed`,
      description: "Status changes run the notification-only automation.",
      event: "record.status_changed",
      workflow: "notify-only",
      inputs: { recordID: "{{ event.record_id }}", event: "{{ event }}" },
    },
    {
      key: "webhook-received",
      title: `${spec.name} · inbound webhook`,
      description: "Generic inbound webhook for partner updates.",
      event: "webhook.received",
      workflow: "integration-sync",
      inputs: { recordID: "{{ event.record_id }}", event: "{{ event }}" },
    },
    {
      key: "threshold-breach",
      title: `${spec.name} · threshold breach`,
      description: "Threshold breach sweep for overdue records.",
      event: "threshold.breached",
      workflow: "threshold-sweep",
      inputs: { days: "{{ event.days }}", staffID: "{{ event.staff_id }}" },
    },
    {
      key: "sla-nearing",
      title: `${spec.name} · SLA nearing breach`,
      description: "SLA pre-breach event triggers the escalation workflow.",
      event: "sla.nearing_breach",
      workflow: "escalation",
      inputs: { recordID: "{{ event.record_id }}", staffID: "{{ event.staff_id }}" },
    },
    {
      key: "comment-created",
      title: `${spec.name} · comment created`,
      description: "New comment notification.",
      event: "comment.created",
      workflow: "notify-only",
      inputs: { recordID: "{{ event.record_id }}", event: "{{ event }}" },
    },
    {
      key: "import-completed",
      title: `${spec.name} · import completed`,
      description: "Import completion triggers a digest notification.",
      event: "import.completed",
      workflow: "daily-digest",
      inputs: { staffID: "{{ event.staff_id }}" },
    },
    {
      key: "integration-failed",
      title: `${spec.name} · integration failed`,
      description: "Integration failure follows the recovery workflow.",
      event: "integration.failed",
      workflow: "error-recovery",
      inputs: { recordID: "{{ event.record_id }}" },
    },
  ];
  ctx.listeners = listeners.map((listener) => {
    const slug = `${spec.alias}-${listener.key}`;
    return {
      slug,
      key: listener.key,
      title: listener.title,
      description: listener.description,
      type: "webhook",
      datasource: "webhook",
      endpointPath: `${spec.alias}-${listener.key}`,
      status: "inactive",
      config: {
        pathSuffix: `${spec.alias}-${listener.key}`,
        responseStatusCode: 202,
        responseBody: '{"accepted":true}',
      },
      actions: [
        {
          actionType: "transform",
          actionConfig: {
            script: `var e = event && event.body ? event.body : event; if (!e || e.kind !== ${JSON.stringify(listener.event)}) { return null; } return e;`,
          },
        },
        {
          actionType: "trigger_workflow",
          actionConfig: {
            workflowID: workflow(listener.workflow),
            inputValues: listener.inputs,
          },
        },
        {
          actionType: "save_to_buffer",
          actionConfig: { bufferName: `${spec.alias}_${listener.key}`, maxRecords: 200, maxAgeHours: 72, retentionPolicy: "both" },
        },
        ...(dashboard
          ? [{
              actionType: "push_to_app_page",
              actionConfig: { appPageID: deterministicUUID(`${spec.slug}:appPage:${dashboard.slug}`), channelName: `${spec.alias}:${listener.key}`, mode: "append", maxArrayLength: 100 },
            }]
          : []),
      ],
    };
  });
}

function buildCronJobs(spec, ctx) {
  const main = coreEntities(spec)[0];
  const workflows = [
    ["daily-digest", "0 8 * * *", "Daily operations digest", { staffID: 1 }],
    ["threshold-sweep", "0 */4 * * *", "Overdue and threshold sweep", { days: 7, staffID: 1 }],
    ["intake-triage", "15 9 * * 1-5", "Weekday intake triage rehearsal", { recordID: 1, staffID: 1 }],
    ["document-generation", "30 18 * * 1-5", "End-of-day document generation", { recordID: 1 }],
    ["round-robin-assignment", "0 7 * * *", "Daily assignment rebalance", { recordID: 1 }],
    ["integration-sync", "0 */6 * * *", "Integration sync health cycle", { recordID: 1 }],
  ];
  ctx.cronJobs = workflows.map(([workflowKey, schedule, title, inputs]) => ({
    key: workflowKey,
    title: `${spec.name} · ${title}`,
    description: `${title}. Schedules are evaluated in the server's timezone (UTC in production). Installed disabled by default; enable after reviewing the workflow.`,
    schedule,
    timezone: "UTC",
    workflow: wfid(spec, `${spec.alias}.${workflowKey}`),
    workflowConfig: { inputValues: inputs, idempotencyKey: `${spec.alias}:${workflowKey}:{{ scheduledFor }}` },
    isDisabled: true,
    timeoutSeconds: 300,
    retryAttempts: 2,
    retryDelaySeconds: 60,
  }));
}

function buildRoles(spec, ctx) {
  const pages = ctx.pages;
  const queries = ctx.queries;
  const workflows = ctx.workflows;
  const defaultGeneral = [
    "tenant:apppage:list",
    "tenant:dataquery:list",
    "tenant:workflow:list",
    "tenant:cronjob:list",
    "tenant:listener:list",
    "tenant:audit:list",
    "tenant:marketplace:list",
    "tenant:role:list",
  ];
  const roleSpecs = spec.roles.map((role) => {
    const pageTags = role.pageTags || [role.key];
    const queryTags = role.queryTags || ["read"];
    const workflowTags = role.workflowTags || [];
    const pageMatrix = pages.map((page) => ({
      page: page.slug,
      pageTitle: page.title,
      tags: page.accessTags,
      canView: pageTags.includes("*") || page.accessTags.some((tag) => pageTags.includes(tag)),
      canExport: (pageTags.includes("*") || page.accessTags.some((tag) => pageTags.includes(tag))) && queryTags.includes("export"),
    }));
    const queryMatrix = queries.map((query) => ({
      query: query.slug,
      tags: query.tags,
      canExecute: queryTags.includes("*") || query.tags.some((tag) => queryTags.includes(tag)),
    }));
    const workflowMatrix = workflows.map((wf) => ({
      workflow: wf.slug,
      tags: wf.tags,
      canTrigger: workflowTags.includes("*") || wf.tags.some((tag) => workflowTags.includes(tag)),
    }));
    return {
      key: role.key,
      title: role.title,
      description: role.description,
      scope: role.scope,
      pageTags,
      queryTags,
      workflowTags,
      generalPermissions: [...new Set([...defaultGeneral, ...(role.generalPermissions || [])])],
      pages: pageMatrix,
      queries: queryMatrix,
      workflows: workflowMatrix,
    };
  });
  ctx.roles = roleSpecs;
}

function buildRoleMatrixSeed(spec, ctx) {
  const rows = [];
  let id = 1;
  for (const role of ctx.roles) {
    for (const page of role.pages) {
      rows.push({ id: id++, role_key: role.key, page_slug: page.page, can_view: page.canView, can_export: page.canExport });
    }
  }
  const sql = `INSERT INTO {{table:role_matrix}} (id, role_key, page_slug, can_view, can_export, updated_at) VALUES\n${rows
    .map((r) => `(${r.id}, '${r.role_key.replace(/'/g, "''")}', '${r.page_slug.replace(/'/g, "''")}', ${r.can_view}, ${r.can_export}, now())`)
    .join(",\n")}\nON CONFLICT (id) DO NOTHING;\nSELECT setval(pg_get_serial_sequence('{{rawtable:role_matrix}}', 'id'), COALESCE((SELECT max(id) FROM {{table:role_matrix}}), 1), true);`;
  ctx.roleMatrixRows = rows;
  return sql;
}

module.exports = {
  buildWorkflows,
  buildListeners,
  buildCronJobs,
  buildRoles,
  buildRoleMatrixSeed,
  workflow,
  inputDef,
  qid,
  wfid,
  nid,
  eid,
};
