/**
 * Marketplace template generator.
 *
 * A template spec is a compact, domain-specific description (tables, fields,
 * seed size, page/workflow recipes). This module expands it into the committed
 * package shape:
 *
 *   manifest.json, schema/*.sql, seed/*.sql, datasources, queries, widgets,
 *   pages, workflows, listeners, cronjobs, roles, assets and README.
 *
 * The output is deterministic. Dates in seeds are relative to now().
 */
const {
  deterministicUUID,
  createRandom,
  personName,
  companyName,
  emailFor,
  phone,
  sentence,
  titleCase,
  sqlString,
  escapeHtml,
  toCsv,
  DEPARTMENTS,
  CITIES,
} = require("./util");
const {
  coreEntities,
  statusField,
  labelField,
  dateField,
  amountField,
  ownerField,
  isClosedStatus,
} = require("./model");

const PLATFORM_VERSION = "2.1.0-preview.1";
const SUPPORT_TABLE_NAMES = [
  "staff",
  "lookups",
  "audit_log",
  "comments",
  "attachments",
  "notifications",
  "app_config",
  "import_jobs",
  "ops_events",
  "role_matrix",
];

const ALLOWED_NODE_TYPES = new Set([
  "start",
  "end",
  "javascript",
  "dataQuery",
  "condition",
  "switch",
  "approval",
  "delay",
  "loop",
  "fanout",
  "join",
  "subWorkflow",
  "dataCollection",
]);

const FIELD_SQL = {
  text: "text",
  longtext: "text",
  email: "text",
  phone: "text",
  url: "text",
  code: "text",
  int: "integer",
  money: "numeric(14,2)",
  decimal: "numeric(12,2)",
  bool: "boolean",
  date: "date",
  timestamptz: "timestamptz",
  enum: "text",
  ref: "integer",
  json: "jsonb",
  uuid: "uuid",
};

const WIDGET_COLUMN_TYPE = {
  text: "text",
  longtext: "text",
  email: "link",
  phone: "text",
  url: "link",
  code: "text",
  int: "number",
  money: "number",
  decimal: "number",
  bool: "boolean",
  date: "date",
  timestamptz: "date",
  enum: "badge",
  ref: "number",
  json: "text",
  uuid: "text",
};

const FORM_FIELD_TYPE = {
  text: "text",
  longtext: "textarea",
  email: "email",
  phone: "text",
  url: "text",
  code: "text",
  int: "number",
  money: "number",
  decimal: "number",
  bool: "checkbox",
  date: "text",
  timestamptz: "text",
  enum: "select",
  ref: "select",
  json: "textarea",
  uuid: "text",
};

function expr(body) {
  return `{{ ${body} }}`;
}

function pluck(alias, path = "data") {
  return `(state.queries.${alias} || {}).${path}`;
}

function rows(alias) {
  return `((${pluck(alias)} || []))`;
}

function rowField(alias, field, index = 0) {
  return `((((${pluck(alias)} || [])[${index}] || {})).${field})`;
}

function qid(spec, slug) {
  return deterministicUUID(`${spec.slug}:dataQuery:${slug}`);
}

function wid(spec, slug) {
  return deterministicUUID(`${spec.slug}:widget:${slug}`);
}

function pid(spec, slug) {
  return deterministicUUID(`${spec.slug}:appPage:${slug}`);
}

function wfid(spec, slug) {
  return deterministicUUID(`${spec.slug}:workflow:${slug}`);
}

function lid(spec, slug) {
  return deterministicUUID(`${spec.slug}:listener:${slug}`);
}

function nid(spec, slug, node) {
  return deterministicUUID(`${spec.slug}:node:${slug}:${node}`);
}

function eid(spec, slug, index) {
  return deterministicUUID(`${spec.slug}:edge:${slug}:${index}`);
}

function table(name) {
  return `{{table:${name}}}`;
}

function indexName(name) {
  return `{{idx:${name}}}`;
}

function fnName(name) {
  return `{{fn:${name}}}`;
}

function triggerName(name) {
  return `{{trigger:${name}}}`;
}

function requireSpec(spec) {
  for (const field of ["slug", "name", "alias", "category", "tagline", "description"]) {
    if (!spec[field]) throw new Error(`Template spec is missing "${field}"`);
  }
  if (!/^[a-z0-9-]+$/.test(spec.slug)) throw new Error(`Invalid template slug: ${spec.slug}`);
  if (!/^[a-z0-9_]+$/.test(spec.alias)) throw new Error(`Invalid template alias: ${spec.alias}`);
  if (!Array.isArray(spec.entities) || spec.entities.length < 6) {
    throw new Error(`${spec.slug}: at least 6 domain entities are required`);
  }
  if (SUPPORT_TABLE_NAMES.length + spec.entities.length > 20) {
    throw new Error(`${spec.slug}: ${SUPPORT_TABLE_NAMES.length + spec.entities.length} tables exceeds the 20-table limit`);
  }
  const keys = new Set();
  for (const entity of spec.entities) {
    if (!entity.key || !/^[a-z0-9_]+$/.test(entity.key)) throw new Error(`${spec.slug}: invalid entity key ${entity.key}`);
    if (keys.has(entity.key)) throw new Error(`${spec.slug}: duplicate entity ${entity.key}`);
    keys.add(entity.key);
  }
  for (const entity of spec.entities) {
    if (!Array.isArray(entity.fields) || entity.fields.length < 3) throw new Error(`${spec.slug}/${entity.key}: at least 3 fields required`);
    for (const field of entity.fields) {
      if (!field.key || !field.type) throw new Error(`${spec.slug}/${entity.key}: field needs key and type`);
      if (!FIELD_SQL[field.type]) throw new Error(`${spec.slug}/${entity.key}.${field.key}: unknown type ${field.type}`);
      if (field.type === "enum" && (!Array.isArray(field.values) || field.values.length < 2)) {
        throw new Error(`${spec.slug}/${entity.key}.${field.key}: enum needs values`);
      }
      if (field.type === "ref" && field.ref !== "staff" && !keys.has(field.ref)) {
        throw new Error(`${spec.slug}/${entity.key}.${field.key}: unknown ref ${field.ref}`);
      }
    }
  }
  if (!Array.isArray(spec.roles) || spec.roles.length < 4 || spec.roles.length > 7) {
    throw new Error(`${spec.slug}: 4-7 roles required`);
  }
}

function entityByKey(spec, key) {
  return spec.entities.find((entity) => entity.key === key);
}


function buildSupportSchema(spec) {
  return `
-- Support tables shared by every app template.
CREATE TABLE IF NOT EXISTS ${table("staff")} (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  role_key text NOT NULL,
  department text,
  job_title text,
  phone text,
  city text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ${indexName("staff_role")} ON ${table("staff")} (role_key);
CREATE UNIQUE INDEX IF NOT EXISTS ${indexName("staff_email")} ON ${table("staff")} (email);

CREATE TABLE IF NOT EXISTS ${table("lookups")} (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  category text NOT NULL,
  code text NOT NULL,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (category, code)
);
CREATE INDEX IF NOT EXISTS ${indexName("lookups_category")} ON ${table("lookups")} (category);

CREATE TABLE IF NOT EXISTS ${table("audit_log")} (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  entity text NOT NULL,
  entity_id integer,
  action text NOT NULL,
  actor text NOT NULL DEFAULT 'system',
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ${indexName("audit_entity")} ON ${table("audit_log")} (entity, entity_id);
CREATE INDEX IF NOT EXISTS ${indexName("audit_created")} ON ${table("audit_log")} (created_at DESC);

CREATE TABLE IF NOT EXISTS ${table("comments")} (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  entity text NOT NULL,
  entity_id integer NOT NULL,
  author_id integer REFERENCES ${table("staff")}(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS ${indexName("comments_entity")} ON ${table("comments")} (entity, entity_id);

CREATE TABLE IF NOT EXISTS ${table("attachments")} (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  entity text NOT NULL,
  entity_id integer NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  mime_type text,
  uploaded_by integer REFERENCES ${table("staff")}(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ${indexName("attachments_entity")} ON ${table("attachments")} (entity, entity_id);

CREATE TABLE IF NOT EXISTS ${table("notifications")} (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  staff_id integer REFERENCES ${table("staff")}(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  category text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  link_page text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ${indexName("notifications_staff")} ON ${table("notifications")} (staff_id, is_read);

CREATE TABLE IF NOT EXISTS ${table("app_config")} (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  kind text NOT NULL,
  config_key text NOT NULL,
  config_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  label text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, config_key)
);
CREATE INDEX IF NOT EXISTS ${indexName("app_config_kind")} ON ${table("app_config")} (kind);

CREATE TABLE IF NOT EXISTS ${table("import_jobs")} (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  entity text NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  total_rows integer NOT NULL DEFAULT 0,
  success_rows integer NOT NULL DEFAULT 0,
  error_rows integer NOT NULL DEFAULT 0,
  error_report jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS ${indexName("import_jobs_created")} ON ${table("import_jobs")} (created_at DESC);

CREATE TABLE IF NOT EXISTS ${table("ops_events")} (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  kind text NOT NULL,
  source text NOT NULL,
  status text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  message text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ${indexName("ops_events_kind")} ON ${table("ops_events")} (kind, created_at DESC);

CREATE TABLE IF NOT EXISTS ${table("role_matrix")} (
  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  role_key text NOT NULL,
  page_slug text NOT NULL,
  can_view boolean NOT NULL DEFAULT true,
  can_export boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_key, page_slug)
);
CREATE INDEX IF NOT EXISTS ${indexName("role_matrix_role")} ON ${table("role_matrix")} (role_key);
`.trim();
}

function buildDomainSchema(spec) {
  const blocks = [];
  for (const entity of orderEntitiesForSeed(spec)) {
    const columns = [`  id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY`];
    for (const field of entity.fields) {
      let sqlType = field.sqlType || FIELD_SQL[field.type];
      if (field.type === "ref") sqlType = "integer";
      let line = `  ${field.key} ${sqlType}`;
      if (field.required) line += " NOT NULL";
      if (field.type === "enum") {
        line += ` CHECK (${field.key} IN (${field.values.map((v) => sqlString(v)).join(", ")}))`;
      }
      if (field.type === "ref") {
        const refTable = field.ref === "staff" ? "staff" : field.ref;
        line += ` REFERENCES ${table(refTable)}(id) ON DELETE SET NULL`;
      }
      if (field.type === "bool" && field.default !== undefined) line += ` DEFAULT ${field.default ? "true" : "false"}`;
      if (field.type === "json") line += ` DEFAULT '{}'::jsonb`;
      if (field.unique) line += " UNIQUE";
      columns.push(line);
    }
    columns.push("  created_at timestamptz NOT NULL DEFAULT now()");
    columns.push("  updated_at timestamptz NOT NULL DEFAULT now()");
    if (entity.softDelete !== false) columns.push("  deleted_at timestamptz");
    blocks.push(`CREATE TABLE IF NOT EXISTS ${table(entity.key)} (\n${columns.join(",\n")}\n);`);
    const indexFields = new Map();
    for (const field of entity.fields) {
      if (field.type === "enum" || field.type === "ref" || ["date", "timestamptz"].includes(field.type)) {
        indexFields.set(field.key, `${entity.key}_${field.key}`);
      }
    }
    if (entity.softDelete !== false) indexFields.set("deleted_at", `${entity.key}_deleted`);
    for (const [fieldKey, idx] of indexFields) {
      blocks.push(`CREATE INDEX IF NOT EXISTS ${indexName(idx)} ON ${table(entity.key)} (${fieldKey});`);
    }
    const label = labelField(entity);
    if (label !== "id") blocks.push(`CREATE INDEX IF NOT EXISTS ${indexName(`${entity.key}_label`)} ON ${table(entity.key)} (${label});`);
  }
  return blocks.join("\n\n");
}

function buildAuditTriggers(spec) {
  const auditFn = `
CREATE OR REPLACE FUNCTION ${fnName("audit")}() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO ${table("audit_log")} (entity, entity_id, action, actor, old_data, new_data)
    VALUES (TG_TABLE_NAME, OLD.id, 'delete', COALESCE(current_setting('jet.actor', true), current_user), to_jsonb(OLD), NULL);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO ${table("audit_log")} (entity, entity_id, action, actor, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, 'update', COALESCE(current_setting('jet.actor', true), current_user), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    INSERT INTO ${table("audit_log")} (entity, entity_id, action, actor, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, 'create', COALESCE(current_setting('jet.actor', true), current_user), NULL, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;
`.trim();
  const domainTables = spec.entities.map((entity) => entity.key);
  const auditedTables = [...SUPPORT_TABLE_NAMES.filter((name) => name !== "audit_log"), ...domainTables];
  const triggers = auditedTables.map((tableName) => {
    const trigger = triggerName(`${tableName}_audit`);
    return `DROP TRIGGER IF EXISTS ${trigger} ON ${table(tableName)};\nCREATE TRIGGER ${trigger} AFTER INSERT OR UPDATE OR DELETE ON ${table(tableName)} FOR EACH ROW EXECUTE FUNCTION ${fnName("audit")}();`;
  });
  return `${auditFn}\n\n${triggers.join("\n\n")}`;
}

function buildSchema(spec) {
  return `-- ${spec.name} — template schema\n-- Idempotent DDL. Physical table names are resolved at install time.\n\n${buildSupportSchema(spec)}\n\n${buildDomainSchema(spec)}\n\n${buildAuditTriggers(spec)}\n`;
}

// ─── Seed generation ─────────────────────────────────────────────────────

function seedValue(entity, field, index, rng, context) {
  if (typeof field.seed === "function") return field.seed({ rng, index, entity, field, context });
  if (field.seed !== undefined) return field.seed;
  if (field.type === "enum") {
    const values = field.values;
    if (index < values.length * 3) return values[index % values.length];
    return rng.pick(values);
  }
  if (field.type === "ref") {
    const count = field.ref === "staff" ? 24 : context.counts[field.ref] || 30;
    if (/owner|assignee|agent|manager|approver|driver|recruiter|steward|analyst/i.test(field.key)) {
      return rng.int(1, Math.min(count, 12));
    }
    return rng.int(1, count);
  }
  if (field.type === "money") return rng.int(9500, 950000) / 100;
  if (field.type === "decimal") return rng.int(100, 50000) / 100;
  if (field.type === "int") {
    if (/score/i.test(field.key)) return rng.int(5, 99);
    if (/count|quantity|units|stock|open|days|hours|quantity/i.test(field.key)) return rng.int(1, 240);
    return rng.int(1, 100);
  }
  if (field.type === "bool") return field.default !== undefined ? field.default : rng.chance(0.72);
  if (field.type === "date") return { __sql: `(now() - interval '${rng.int(1, 120)} days')::date` };
  if (field.type === "timestamptz") return { __sql: `now() - interval '${rng.int(0, 120)} days ${rng.int(0, 23)} hours'` };
  if (field.type === "json") return {};
  if (field.type === "email") {
    const name = personName(rng);
    return `${name.toLowerCase().replace(/[^a-z]+/g, ".")}.${index}@example.com`;
  }
  if (field.type === "phone") return phone(rng);
  if (field.type === "url") return `https://files.example.invalid/${context.spec.slug}/${entity.key}-${index}.pdf`;
  if (field.type === "uuid") return deterministicUUID(`${context.spec.slug}:${entity.key}:${index}`);
  if (field.type === "code") {
    const prefix = (field.prefix || entity.key.slice(0, 3)).toUpperCase();
    return `${prefix}-${String(index).padStart(5, "0")}`;
  }
  const key = field.key.toLowerCase();
  if (key === "name" || key.endsWith("_name") || key === "full_name") {
    if (/company|account|vendor|client|customer|organization|org/i.test(key)) return companyName(rng);
    return personName(rng);
  }
  if (/company|account|vendor|client|customer|organization|org|merchant|partner/i.test(key)) return companyName(rng);
  if (/email/.test(key)) return emailFor(personName(rng), rng);
  if (/phone/.test(key)) return phone(rng);
  if (/city|location|region|site|warehouse|zone/i.test(key)) return rng.pick(CITIES);
  if (/department|team/.test(key)) return rng.pick(DEPARTMENTS);
  if (/description|notes|body|summary|reason|details|comment|message/i.test(key)) return sentence(rng, 14);
  if (/title|subject|name|label/.test(key)) return titleCase(`${rng.pick(["Quarterly", "Priority", "Regional", "Renewal", "Onboarding", "Exception"])} ${rng.pick(["review", "follow-up", "request", "plan", "check", "case"])}`);
  return field.values ? rng.pick(field.values) : sentence(rng, 5);
}

function renderSeedValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "object" && value.__sql) return value.__sql;
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") return `${sqlString(JSON.stringify(value))}::jsonb`;
  return sqlString(value);
}

function orderEntitiesForSeed(spec) {
  const byKey = new Map(spec.entities.map((entity) => [entity.key, entity]));
  const visited = new Set();
  const visiting = new Set();
  const ordered = [];
  function visit(entity) {
    if (visited.has(entity.key)) return;
    if (visiting.has(entity.key)) throw new Error(`${spec.slug}: circular ref involving ${entity.key}`);
    visiting.add(entity.key);
    for (const field of entity.fields) {
      if (field.type === "ref" && field.ref !== "staff") {
        const target = byKey.get(field.ref);
        if (!target) throw new Error(`${spec.slug}/${entity.key}: unknown ref ${field.ref}`);
        visit(target);
      }
    }
    visiting.delete(entity.key);
    visited.add(entity.key);
    ordered.push(entity);
  }
  spec.entities.forEach(visit);
  return ordered;
}

function buildSeed(spec, ctx) {
  const statements = [];
  const counts = {};
  const rowsByEntity = {};

  // Staff is generated first so refs can point at it.
  const staffRows = [];
  for (let i = 1; i <= 24; i += 1) {
    const name = personName(ctx.rng);
    const role = spec.roles[i % spec.roles.length];
    staffRows.push({
      id: i,
      full_name: name,
      email: `staff.${i}@example.com`,
      role_key: role.key,
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      job_title: titleCase(`${role.key} ${["specialist", "lead", "coordinator"][i % 3]}`),
      phone: phone(ctx.rng),
      city: CITIES[i % CITIES.length],
      is_active: i % 11 !== 0,
    });
  }
  counts.staff = staffRows.length;
  rowsByEntity.staff = staffRows;
  const staffCols = ["id", "full_name", "email", "role_key", "department", "job_title", "phone", "city", "is_active"];
  statements.push(
    `INSERT INTO ${table("staff")} (${staffCols.join(", ")}) VALUES\n${staffRows
      .map((row) => `(${staffCols.map((c) => renderSeedValue(row[c])).join(", ")})`)
      .join(",\n")}\nON CONFLICT (id) DO NOTHING;`
  );

  // Domain rows. Generate referenced entities first so FK values are valid.
  for (const entity of orderEntitiesForSeed(spec)) {
    const count = entity.seedCount || (entity.core === false ? 45 : 80);
    const rows = [];
    for (let i = 1; i <= count; i += 1) {
      const row = { id: i };
      for (const field of entity.fields) {
        row[field.key] = seedValue(entity, field, i, ctx.rng, { ...ctx, counts });
      }
      row.created_at = { __sql: `now() - interval '${ctx.rng.int(1, 210)} days ${ctx.rng.int(0, 23)} hours'` };
      row.updated_at = { __sql: `now() - interval '${ctx.rng.int(0, 40)} days ${ctx.rng.int(0, 23)} hours'` };
      if (entity.softDelete !== false) {
        row.deleted_at = i % 29 === 0 ? { __sql: `now() - interval '${ctx.rng.int(1, 10)} days'` } : null;
      }
      rows.push(row);
    }
    counts[entity.key] = count;
    rowsByEntity[entity.key] = rows;
    const cols = ["id", ...entity.fields.map((f) => f.key), "created_at", "updated_at"];
    if (entity.softDelete !== false) cols.push("deleted_at");
    statements.push(
      `INSERT INTO ${table(entity.key)} (${cols.join(", ")}) VALUES\n${rows
        .map((row) => `(${cols.map((c) => renderSeedValue(row[c])).join(", ")})`)
        .join(",\n")}\nON CONFLICT (id) DO NOTHING;`
    );
  }

  // Lookups.
  const lookups = [];
  const lookupSeen = new Set();
  const lookupCategories = [
    ["priority", ["low", "normal", "high", "urgent"]],
    ["sentiment", ["positive", "neutral", "negative"]],
    ["channel", ["web", "email", "phone", "mobile", "partner"]],
  ];
  for (const [category, values] of lookupCategories) {
    values.forEach((code, i) => {
      const key = `${category}:${code}`;
      if (lookupSeen.has(key)) return;
      lookupSeen.add(key);
      lookups.push({ category, code, label: titleCase(code), sort_order: i + 1, is_active: true });
    });
  }
  for (const entity of spec.entities) {
    for (const field of entity.fields) {
      if (field.type !== "enum") continue;
      const category = `${entity.key}.${field.key}`;
      field.values.forEach((code, i) => {
        const key = `${category}:${code}`;
        if (lookupSeen.has(key)) return;
        lookupSeen.add(key);
        lookups.push({ category, code, label: titleCase(code), sort_order: i + 1, is_active: true });
      });
    }
  }
  lookups.forEach((row, i) => (row.id = i + 1));
  rowsByEntity.lookups = lookups;
  statements.push(
    `INSERT INTO ${table("lookups")} (id, category, code, label, sort_order, is_active) VALUES\n${lookups
      .map((r) => `(${r.id}, ${renderSeedValue(r.category)}, ${renderSeedValue(r.code)}, ${renderSeedValue(r.label)}, ${r.sort_order}, true)`)
      .join(",\n")}\nON CONFLICT (id) DO NOTHING;`
  );

  // Comments, attachments, notifications, app config, imports, ops events, audit.
  const core = coreEntities(spec);
  const comments = [];
  for (let i = 1; i <= 90; i += 1) {
    const entity = core[i % core.length];
    comments.push({
      id: i,
      entity: entity.key,
      entity_id: ((i * 7) % counts[entity.key]) + 1,
      author_id: ((i * 3) % 24) + 1,
      body: sentence(ctx.rng, 12),
      created_at: { __sql: `now() - interval '${ctx.rng.int(1, 60)} days ${ctx.rng.int(0, 23)} hours'` },
      updated_at: { __sql: `now() - interval '${ctx.rng.int(0, 20)} days ${ctx.rng.int(0, 23)} hours'` },
      deleted_at: i % 37 === 0 ? { __sql: `now() - interval '2 days'` } : null,
    });
  }
  rowsByEntity.comments = comments;
  statements.push(
    `INSERT INTO ${table("comments")} (id, entity, entity_id, author_id, body, created_at, updated_at, deleted_at) VALUES\n${comments
      .map((r) => `(${r.id}, ${renderSeedValue(r.entity)}, ${r.entity_id}, ${r.author_id}, ${renderSeedValue(r.body)}, ${renderSeedValue(r.created_at)}, ${renderSeedValue(r.updated_at)}, ${renderSeedValue(r.deleted_at)})`)
      .join(",\n")}\nON CONFLICT (id) DO NOTHING;`
  );

  const attachments = [];
  for (let i = 1; i <= 36; i += 1) {
    const entity = core[i % core.length];
    attachments.push({
      id: i,
      entity: entity.key,
      entity_id: ((i * 5) % counts[entity.key]) + 1,
      file_name: `${entity.key}-${i}.pdf`,
      file_url: `https://files.example.invalid/${spec.slug}/${entity.key}-${i}.pdf`,
      mime_type: i % 4 === 0 ? "image/png" : "application/pdf",
      uploaded_by: ((i * 2) % 24) + 1,
      created_at: { __sql: `now() - interval '${ctx.rng.int(1, 45)} days'` },
    });
  }
  rowsByEntity.attachments = attachments;
  statements.push(
    `INSERT INTO ${table("attachments")} (id, entity, entity_id, file_name, file_url, mime_type, uploaded_by, created_at) VALUES\n${attachments
      .map((r) => `(${r.id}, ${renderSeedValue(r.entity)}, ${r.entity_id}, ${renderSeedValue(r.file_name)}, ${renderSeedValue(r.file_url)}, ${renderSeedValue(r.mime_type)}, ${r.uploaded_by}, ${renderSeedValue(r.created_at)})`)
      .join(",\n")}\nON CONFLICT (id) DO NOTHING;`
  );

  const notifications = [];
  for (let i = 1; i <= 44; i += 1) {
    notifications.push({
      id: i,
      staff_id: (i % 24) + 1,
      title: titleCase(`${["New", "Updated", "Approval", "SLA", "Digest"][i % 5]} ${["assignment", "request", "alert", "summary"][i % 4]}`),
      body: sentence(ctx.rng, 10),
      category: ["info", "warning", "success", "action"][i % 4],
      is_read: i % 3 === 0,
      link_page: `${spec.alias}-notifications`,
      created_at: { __sql: `now() - interval '${ctx.rng.int(0, 20)} days ${ctx.rng.int(0, 23)} hours'` },
    });
  }
  rowsByEntity.notifications = notifications;
  statements.push(
    `INSERT INTO ${table("notifications")} (id, staff_id, title, body, category, is_read, link_page, created_at) VALUES\n${notifications
      .map((r) => `(${r.id}, ${r.staff_id}, ${renderSeedValue(r.title)}, ${renderSeedValue(r.body)}, ${renderSeedValue(r.category)}, ${r.is_read}, ${renderSeedValue(r.link_page)}, ${renderSeedValue(r.created_at)})`)
      .join(",\n")}\nON CONFLICT (id) DO NOTHING;`
  );

  const configs = [];
  const addConfig = (kind, key, value, label) => {
    configs.push({ id: configs.length + 1, kind, config_key: key, config_value: value, label });
  };
  addConfig("branding", "brand.name", { value: spec.name }, "Application name");
  addConfig("branding", "brand.accent", { value: spec.accent || "#2563eb" }, "Accent color");
  addConfig("branding", "brand.logo", { value: `assets/icon.svg` }, "Logo");
  addConfig("setting", "general.timezone", { value: "UTC" }, "Default timezone");
  addConfig("setting", "general.currency", { value: "USD" }, "Currency");
  addConfig("setting", "notifications.email", { value: true }, "Email notifications");
  addConfig("setting", "notifications.inApp", { value: true }, "In-app notifications");
  addConfig("setting", "notifications.digest", { value: "daily" }, "Digest frequency");
  addConfig("setting", "data.retentionDays", { value: 730 }, "Retention (days)");
  addConfig("feature_flag", "flags.bulkActions", { value: true }, "Bulk actions");
  addConfig("feature_flag", "flags.csvImport", { value: true }, "CSV import");
  addConfig("feature_flag", "flags.workflowAutomation", { value: false }, "Automation (enable after review)");
  addConfig("feature_flag", "flags.externalPortal", { value: true }, "External portal");
  core.forEach((entity, i) => {
    addConfig("saved_view", `saved_view.${spec.alias}-${entity.key}-list.default`, { search: "", page: 1, status: "" }, titleCase(`${entity.key} default view`));
    if (i < 2) addConfig("saved_view", `saved_view.${spec.alias}-${entity.key}-list.attention`, { search: "", page: 1, status: statusField(entity)?.values[0] || "" }, titleCase(`${entity.key} attention view`));
  });
  rowsByEntity.app_config = configs;
  statements.push(
    `INSERT INTO ${table("app_config")} (id, kind, config_key, config_value, label, updated_at) VALUES\n${configs
      .map((r) => `(${r.id}, ${renderSeedValue(r.kind)}, ${renderSeedValue(r.config_key)}, ${renderSeedValue(r.config_value)}, ${renderSeedValue(r.label)}, now() - interval '${ctx.rng.int(1, 30)} days')`)
      .join(",\n")}\nON CONFLICT (id) DO NOTHING;`
  );

  const imports = [];
  for (let i = 1; i <= 10; i += 1) {
    const entity = core[i % core.length];
    const total = ctx.rng.int(20, 300);
    const errors = i % 3 === 0 ? ctx.rng.int(1, 8) : 0;
    imports.push({
      id: i,
      entity: entity.key,
      file_name: `${entity.key}-import-${i}.csv`,
      status: ["completed", "completed", "completed_with_errors", "failed"][i % 4],
      total_rows: total,
      success_rows: total - errors,
      error_rows: errors,
      error_report: errors
        ? [{ row: 4, field: "email", message: "Invalid email address" }, { row: 9, field: "status", message: "Unknown status value" }].slice(0, errors)
        : [],
      created_at: { __sql: `now() - interval '${ctx.rng.int(1, 40)} days'` },
      completed_at: { __sql: `now() - interval '${ctx.rng.int(0, 39)} days'` },
    });
  }
  rowsByEntity.import_jobs = imports;
  statements.push(
    `INSERT INTO ${table("import_jobs")} (id, entity, file_name, status, total_rows, success_rows, error_rows, error_report, created_at, completed_at) VALUES\n${imports
      .map((r) => `(${r.id}, ${renderSeedValue(r.entity)}, ${renderSeedValue(r.file_name)}, ${renderSeedValue(r.status)}, ${r.total_rows}, ${r.success_rows}, ${r.error_rows}, ${renderSeedValue(r.error_report)}, ${renderSeedValue(r.created_at)}, ${renderSeedValue(r.completed_at)})`)
      .join(",\n")}\nON CONFLICT (id) DO NOTHING;`
  );

  const ops = [];
  const opsKinds = ["integration_health", "job_run", "webhook", "data_quality"];
  const sources = spec.integrations.map((i) => i.key);
  for (let i = 1; i <= 96; i += 1) {
    const kind = opsKinds[i % opsKinds.length];
    let status = "success";
    let severity = "info";
    if (i % 7 === 0) { status = "warning"; severity = "warning"; }
    if (i % 17 === 0) { status = "failed"; severity = "error"; }
    ops.push({
      id: i,
      kind,
      source: kind === "integration_health" ? sources[i % sources.length] : kind === "job_run" ? `${spec.alias}.daily-digest` : kind === "webhook" ? `${spec.alias}-webhook` : `${spec.alias}.checks`,
      status,
      severity,
      message: `${titleCase(kind)} ${status} for ${spec.name}`,
      payload: { runId: `run-${i}`, durationMs: ctx.rng.int(50, 24000), attempts: status === "failed" ? 3 : 1 },
      created_at: { __sql: `now() - interval '${ctx.rng.int(0, 20)} days ${ctx.rng.int(0, 23)} hours'` },
    });
  }
  rowsByEntity.ops_events = ops;
  statements.push(
    `INSERT INTO ${table("ops_events")} (id, kind, source, status, severity, message, payload, created_at) VALUES\n${ops
      .map((r) => `(${r.id}, ${renderSeedValue(r.kind)}, ${renderSeedValue(r.source)}, ${renderSeedValue(r.status)}, ${renderSeedValue(r.severity)}, ${renderSeedValue(r.message)}, ${renderSeedValue(r.payload)}, ${renderSeedValue(r.created_at)})`)
      .join(",\n")}\nON CONFLICT (id) DO NOTHING;`
  );


  ctx.counts = counts;
  ctx.seedRows = rowsByEntity;
  // Explicit IDs were used above for determinism. Advance each identity
  // sequence past the seeded max so runtime inserts never collide.
  for (const tableName of [...SUPPORT_TABLE_NAMES, ...spec.entities.map((e) => e.key)]) {
    statements.push(
      `SELECT setval(pg_get_serial_sequence('{{rawtable:${tableName}}}', 'id'), COALESCE((SELECT max(id) FROM ${table(tableName)}), 1), true);`
    );
  }
  return statements.join("\n\n");
}

// ─── Query generation ────────────────────────────────────────────────────

function input(key, type = "string", extra = {}) {
  return { key, type, required: false, ...extra };
}

function parameterized(template, inputs) {
  const indexes = new Map();
  inputs.forEach((def, i) => indexes.set(def.key, i + 1));
  const query = template.replace(/\{\{p:([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    if (!indexes.has(key)) throw new Error(`SQL parameter "${key}" has no input definition`);
    return `$${indexes.get(key)}`;
  });
  return {
    queryType: "query",
    query,
    inputDefinitions: inputs.map((def) => ({ ...def })),
    parameterized: true,
    timeoutSeconds: 20,
  };
}

function quoteQ(identifier) {
  return `"${identifier}"`;
}

function selectColumns(entity) {
  return ["id", ...entity.fields.map((f) => f.key), "created_at", "updated_at", ...(entity.softDelete !== false ? ["deleted_at"] : [])]
    .map(quoteQ)
    .join(", ");
}

function textSearchFields(entity) {
  return entity.fields.filter((f) => ["text", "longtext", "email", "phone", "code", "url"].includes(f.type));
}

function createQuery(spec, slug, title, options, tags = [], datasource = "primary") {
  return {
    slug,
    key: slug,
    title,
    datasource,
    tags,
    options,
  };
}

function buildEntityQueries(spec, entity, ctx) {
  const qs = [];
  const entitySlug = `${spec.alias}.${entity.key}`;
  const st = statusField(entity);
  const dt = dateField(entity);
  const label = labelField(entity);
  const searchFields = textSearchFields(entity).slice(0, 4);
  const sortFields = entity.fields.filter((f) => ["text", "code", "int", "money", "decimal", "date", "timestamptz"].includes(f.type)).slice(0, 4);

  // List with server-side pagination/filter/search/sort.
  const listInputs = [input("search"), ...(st ? [input("status")] : []), input("page", "number", { default: 1 }), input("limit", "number", { default: 10 }), input("sortBy", "string", { default: label }), input("sortDir", "string", { default: "asc" }), input("dateFrom"), input("dateTo")];
  const searchClause = searchFields.length
    ? `(${searchFields.map((f) => `coalesce(${quoteQ(f.key)}::text, '') ILIKE '%' || {{p:search}}::text || '%'`).join(" OR ")})`
    : "({{p:search}}::text = '')";
  const statusClause = st ? `AND ({{p:status}}::text = '' OR ${quoteQ(st.key)} = {{p:status}}::text)` : "";
  const sortClause = sortFields
    .flatMap((f) => [
      `CASE WHEN {{p:sortBy}}::text = ${sqlString(f.key)} AND {{p:sortDir}}::text = 'asc' THEN ${quoteQ(f.key)} END ASC`,
      `CASE WHEN {{p:sortBy}}::text = ${sqlString(f.key)} AND {{p:sortDir}}::text = 'desc' THEN ${quoteQ(f.key)} END DESC`,
    ])
    .join(", ");
  const listSql = `SELECT ${selectColumns(entity)}, count(*) OVER() AS total_count
FROM ${table(entity.key)}
WHERE ${entity.softDelete !== false ? "deleted_at IS NULL AND " : ""}${searchClause}
  ${statusClause}
  AND (NULLIF({{p:dateFrom}}::text, '')::date IS NULL OR created_at >= NULLIF({{p:dateFrom}}::text, '')::date)
  AND (NULLIF({{p:dateTo}}::text, '')::date IS NULL OR created_at < (NULLIF({{p:dateTo}}::text, '')::date + interval '1 day'))
ORDER BY ${sortClause}, id DESC
LIMIT {{p:limit}}::int OFFSET ((({{p:page}}::int - 1) * {{p:limit}}::int))`;
  qs.push(createQuery(spec, `${entitySlug}.list`, `${entity.title} · list`, parameterized(listSql, listInputs), ["read", "core", entity.key]));

  // Export (no pagination).
  const exportInputs = [input("search"), ...(st ? [input("status")] : []), input("dateFrom"), input("dateTo")];
  const exportSql = `SELECT ${selectColumns(entity)}
FROM ${table(entity.key)}
WHERE ${entity.softDelete !== false ? "deleted_at IS NULL AND " : ""}${searchClause}
  ${statusClause}
  AND (NULLIF({{p:dateFrom}}::text, '')::date IS NULL OR created_at >= NULLIF({{p:dateFrom}}::text, '')::date)
  AND (NULLIF({{p:dateTo}}::text, '')::date IS NULL OR created_at < (NULLIF({{p:dateTo}}::text, '')::date + interval '1 day'))
ORDER BY id DESC
LIMIT 5000`;
  qs.push(createQuery(spec, `${entitySlug}.export`, `${entity.title} · export`, parameterized(exportSql, exportInputs), ["read", "export", entity.key]));

  // Detail.
  qs.push(createQuery(spec, `${entitySlug}.detail`, `${entity.title} · detail`, parameterized(`SELECT ${selectColumns(entity)} FROM ${table(entity.key)} WHERE id = $1::int AND ${entity.softDelete !== false ? "deleted_at IS NULL" : "true"}`, [input("id", "number", { required: true, default: 1 })]), ["read", "core", entity.key]));

  // Create / update.
  const writable = entity.fields.filter((f) => !f.readOnly);
  const createInputs = writable.map((f) => input(f.key, f.type === "ref" || f.type === "int" ? "number" : f.type === "bool" ? "boolean" : f.type === "json" ? "object" : f.type === "money" || f.type === "decimal" ? "number" : "string", { required: !!f.required }));
  const createSql = `INSERT INTO ${table(entity.key)} (${writable.map((f) => quoteQ(f.key)).join(", ")}, created_at, updated_at)
VALUES (${writable.map((_, i) => `$${i + 1}${fTypeCast(writable[i])}`).join(", ")}, now(), now())
RETURNING ${selectColumns(entity)}`;
  qs.push(createQuery(spec, `${entitySlug}.create`, `${entity.title} · create`, parameterized(createSql, createInputs), ["write", "core", entity.key]));

  const updateInputs = [input("id", "number", { required: true, default: 1 }), ...writable.map((f) => input(f.key, f.type === "ref" || f.type === "int" ? "number" : f.type === "bool" ? "boolean" : f.type === "json" ? "object" : f.type === "money" || f.type === "decimal" ? "number" : "string", { required: !!f.required }))];
  const updateSql = `UPDATE ${table(entity.key)}
SET ${writable.map((f, i) => `${quoteQ(f.key)} = $${i + 2}${fTypeCast(f)}`).join(", ")}, updated_at = now()
WHERE id = $1::int AND ${entity.softDelete !== false ? "deleted_at IS NULL" : "true"}
RETURNING ${selectColumns(entity)}`;
  qs.push(createQuery(spec, `${entitySlug}.update`, `${entity.title} · update`, parameterized(updateSql, updateInputs), ["write", "core", entity.key]));

  // Soft delete / restore / bulk.
  qs.push(createQuery(spec, `${entitySlug}.delete`, `${entity.title} · soft delete`, parameterized(`UPDATE ${table(entity.key)} SET deleted_at = now(), updated_at = now() WHERE id = ANY($1::int[]) AND deleted_at IS NULL RETURNING id`, [input("ids", "array", { default: [] })]), ["write", "core", entity.key]));
  qs.push(createQuery(spec, `${entitySlug}.restore`, `${entity.title} · restore`, parameterized(`UPDATE ${table(entity.key)} SET deleted_at = NULL, updated_at = now() WHERE id = ANY($1::int[]) AND deleted_at IS NOT NULL RETURNING id`, [input("ids", "array", { default: [] })]), ["write", "core", entity.key]));

  // Lookup.
  qs.push(createQuery(spec, `${entitySlug}.lookup`, `${entity.title} · lookup`, parameterized(`SELECT id, ${quoteQ(label)}::text AS label FROM ${table(entity.key)} WHERE ${entity.softDelete !== false ? "deleted_at IS NULL" : "true"} ORDER BY ${quoteQ(label)} LIMIT 500`, []), ["read", "lookup", entity.key]));

  // Status transition (used by detail quick actions and workflows).
  if (st) {
    qs.push(createQuery(spec, `${entitySlug}.status`, `${entity.title} · change status`, parameterized(`UPDATE ${table(entity.key)} SET ${quoteQ(st.key)} = $2::text, updated_at = now() WHERE id = $1::int RETURNING id, ${quoteQ(st.key)}`, [input("id", "number", { default: 1 }), input("status", "string", { default: st.values[0] })]), ["write", "core", entity.key]));
  }

  const owner = ownerField(entity);
  if (owner) {
    qs.push(createQuery(spec, `${entitySlug}.assign`, `${entity.title} · assign owner`, parameterized(`UPDATE ${table(entity.key)} SET ${quoteQ(owner.key)} = $2::int, updated_at = now() WHERE id = $1::int RETURNING id, ${quoteQ(owner.key)}`, [input("id", "number", { default: 1 }), input("staffID", "number", { default: 1 })]), ["write", "core", entity.key]));
  }

  const score = entity.fields.find((f) => ["int", "decimal", "money"].includes(f.type) && /score/i.test(f.key));
  if (score) {
    qs.push(createQuery(spec, `${entitySlug}.score`, `${entity.title} · save score`, parameterized(`UPDATE ${table(entity.key)} SET ${quoteQ(score.key)} = $2::numeric, updated_at = now() WHERE id = $1::int RETURNING id, ${quoteQ(score.key)}`, [input("id", "number", { default: 1 }), input("score", "number", { default: 0 })]), ["write", "core", entity.key]));
  }

  // Main two entities get analytics queries.
  const coreIndex = coreEntities(spec).findIndex((e) => e.key === entity.key);
  if (coreIndex >= 0 && coreIndex < 2) {
    const analyticsInputs = [input("dateFrom"), input("dateTo")];
    const fromIdx = 1;
    const toIdx = 2;
    const amount = amountField(entity);
    const statusCount = st
      ? st.values.map((v) => `count(*) FILTER (WHERE ${quoteQ(st.key)} = ${sqlString(v)})::int AS ${slugFromValue(v)}`).join(", ")
      : "0 AS open_count";
    qs.push(createQuery(spec, `${entitySlug}.stats`, `${entity.title} · KPI totals`, parameterized(`SELECT count(*)::int AS total, ${amount ? `coalesce(sum(${quoteQ(amount.key)}), 0)::numeric(14,2) AS total_value, coalesce(avg(${quoteQ(amount.key)}), 0)::numeric(14,2) AS average_value,` : ""} ${statusCount}
FROM ${table(entity.key)}
WHERE ${entity.softDelete !== false ? "deleted_at IS NULL AND " : ""}(NULLIF($${fromIdx}::text, '')::date IS NULL OR created_at >= NULLIF($${fromIdx}::text, '')::date)
  AND (NULLIF($${toIdx}::text, '')::date IS NULL OR created_at < (NULLIF($${toIdx}::text, '')::date + interval '1 day'))`, analyticsInputs), ["read", "report", entity.key]));

    qs.push(createQuery(spec, `${entitySlug}.trend`, `${entity.title} · daily trend`, parameterized(`SELECT date_trunc('day', created_at)::date AS day, count(*)::int AS count${amount ? `, coalesce(sum(${quoteQ(amount.key)}), 0)::numeric(14,2) AS total` : ""}
FROM ${table(entity.key)}
WHERE ${entity.softDelete !== false ? "deleted_at IS NULL AND " : ""}created_at >= coalesce(NULLIF($1::text, '')::date, now() - interval '90 days')
  AND created_at < (coalesce(NULLIF($2::text, '')::date, now()::date) + interval '1 day')
GROUP BY 1 ORDER BY 1`, analyticsInputs), ["read", "report", entity.key]));

    if (st) {
      qs.push(createQuery(spec, `${entitySlug}.by_status`, `${entity.title} · by status`, parameterized(`SELECT ${quoteQ(st.key)} AS status, count(*)::int AS count FROM ${table(entity.key)} WHERE ${entity.softDelete !== false ? "deleted_at IS NULL AND " : ""}(NULLIF($1::text, '')::date IS NULL OR created_at >= NULLIF($1::text, '')::date) AND (NULLIF($2::text, '')::date IS NULL OR created_at < (NULLIF($2::text, '')::date + interval '1 day')) GROUP BY 1 ORDER BY 2 DESC`, analyticsInputs), ["read", "report", entity.key]));
    }

    if (dt) {
      qs.push(createQuery(spec, `${entitySlug}.overdue`, `${entity.title} · overdue`, parameterized(`SELECT ${selectColumns(entity)} FROM ${table(entity.key)}
WHERE ${entity.softDelete !== false ? "deleted_at IS NULL AND " : ""}${quoteQ(dt.key)} IS NOT NULL
  AND ${quoteQ(dt.key)} < now() - ($1::int || ' days')::interval
  ${st ? `AND ${quoteQ(st.key)} NOT IN (${st.values.filter(isClosedStatus).map((v) => sqlString(v)).join(", ") || "''"})` : ""}
ORDER BY ${quoteQ(dt.key)} ASC LIMIT 100`, [input("days", "number", { default: 7 })]), ["read", "report", entity.key]));
    }
  }

  ctx.queries.push(...qs);
  return qs;
}

function fTypeCast(field) {
  if (!field) return "";
  switch (field.type) {
    case "int":
    case "ref":
      return "::int";
    case "money":
    case "decimal":
      return "::numeric";
    case "bool":
      return "::boolean";
    case "json":
      return "::jsonb";
    case "date":
      return "::date";
    case "timestamptz":
      return "::timestamptz";
    default:
      return "::text";
  }
}

function slugFromValue(value) {
  return `status_${String(value).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
}

function buildSharedQueries(spec, ctx) {
  const qs = [];
  const core = coreEntities(spec);
  const main = core[0];
  const mainEntitySlug = `${spec.alias}.${main.key}`;
  const st = statusField(main);
  const owner = ownerField(main);
  const dt = dateField(main);
  const amount = amountField(main);
  const label = labelField(main);

  qs.push(createQuery(spec, `${spec.alias}.shared.staff_list`, "Team · directory", parameterized(`SELECT id, full_name AS label, role_key, department, job_title, email FROM ${table("staff")} WHERE is_active = true ORDER BY full_name`, []), ["read", "shared", "lookup"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.staff_detail`, "Team · profile", parameterized(`SELECT id, full_name, email, role_key, department, job_title, phone, city, is_active, created_at FROM ${table("staff")} WHERE id = $1::int`, [input("id", "number", { default: 1 })]), ["read", "shared"]));
  qs.push(createQuery(spec, `${spec.alias}.shared.staff_update`, "Team · update profile", parameterized(`UPDATE ${table("staff")} SET full_name = $2::text, department = $3::text, job_title = $4::text, phone = $5::text, city = $6::text, updated_at = now() WHERE id = $1::int RETURNING id`, [input("id", "number", { default: 1 }), input("fullName", "string"), input("department", "string"), input("jobTitle", "string"), input("phone", "string"), input("city", "string")]), ["write", "shared"]));

  if (owner) {
    qs.push(createQuery(spec, `${spec.alias}.shared.portal_records`, "Client portal · my records", parameterized(`SELECT ${selectColumns(main)} FROM ${table(main.key)}
WHERE ${main.softDelete !== false ? "deleted_at IS NULL AND " : ""}${quoteQ(owner.key)} = $1::int ORDER BY created_at DESC LIMIT 100`, [input("staffID", "number", { default: 1 })]), ["read", "portal"]));
  }

  qs.push(createQuery(spec, `${spec.alias}.shared.integration_ping`, "Integrations · health probe", {
    method: "GET",
    path: "/status",
    headers: [],
    queryParams: [],
    timeoutSeconds: 5,
  }, ["read", "integration"], "integration"));

  qs.push(createQuery(spec, `${spec.alias}.shared.notifications`, "Notifications · inbox", parameterized(`SELECT n.id, n.title, n.body, n.category, n.is_read, n.link_page, n.created_at, s.full_name AS staff_name
FROM ${table("notifications")} n LEFT JOIN ${table("staff")} s ON s.id = n.staff_id
WHERE n.staff_id = $1::int
ORDER BY n.is_read ASC, n.created_at DESC LIMIT 200`, [input("staffID", "number", { default: 1 })]), ["read", "shared"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.notifications_read`, "Notifications · mark read", parameterized(`UPDATE ${table("notifications")} SET is_read = true WHERE id = ANY($1::int[]) RETURNING id`, [input("ids", "array", { default: [] })]), ["write", "shared"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.notification_create`, "Notifications · create", parameterized(`INSERT INTO ${table("notifications")} (staff_id, title, body, category, is_read, link_page, created_at)
VALUES ($1::int, $2::text, $3::text, $4::text, false, $5::text, now())
RETURNING id`, [input("staffID", "number", { default: 1 }), input("title", "string", { required: true }), input("body"), input("category", "string", { default: "info" }), input("linkPage")]), ["write", "shared"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.settings`, "Settings · configuration", parameterized(`SELECT id, kind, config_key, config_value, label, updated_at FROM ${table("app_config")} WHERE kind = ANY($1::text[]) ORDER BY kind, config_key`, [input("kinds", "array", { default: ["setting", "branding", "feature_flag"] })]), ["read", "shared"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.settings_update`, "Settings · update value", parameterized(`UPDATE ${table("app_config")} SET config_value = $3::jsonb, updated_at = now() WHERE kind = $1::text AND config_key = $2::text RETURNING id, config_key, config_value`, [input("kind", "string", { required: true }), input("configKey", "string", { required: true }), input("value", "object", { required: true })]), ["write", "shared"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.saved_views`, "Saved views · list", parameterized(`SELECT id, config_key, config_value, label, updated_at FROM ${table("app_config")} WHERE kind = 'saved_view' AND config_key LIKE $1::text || '%' ORDER BY label`, [input("prefix", "string", { default: `saved_view.${spec.alias}-` })]), ["read", "shared"]));
  qs.push(createQuery(spec, `${spec.alias}.shared.saved_view_create`, "Saved views · create", parameterized(`INSERT INTO ${table("app_config")} (kind, config_key, config_value, label, updated_at)
VALUES ('saved_view', $1::text, $2::jsonb, $3::text, now())
ON CONFLICT (kind, config_key) DO UPDATE SET config_value = EXCLUDED.config_value, label = EXCLUDED.label, updated_at = now()
RETURNING id`, [input("configKey", "string", { required: true }), input("value", "object", { required: true }), input("label", "string", { required: true })]), ["write", "shared"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.comments`, "Comments · list", parameterized(`SELECT c.id, c.entity, c.entity_id, c.body, c.created_at, c.updated_at, s.full_name AS author
FROM ${table("comments")} c LEFT JOIN ${table("staff")} s ON s.id = c.author_id
WHERE c.entity = $1::text AND c.entity_id = $2::int AND c.deleted_at IS NULL
ORDER BY c.created_at DESC LIMIT 100`, [input("entity", "string"), input("entityID", "number", { default: 1 })]), ["read", "shared"]));
  qs.push(createQuery(spec, `${spec.alias}.shared.comment_create`, "Comments · create", parameterized(`INSERT INTO ${table("comments")} (entity, entity_id, author_id, body, created_at, updated_at)
VALUES ($1::text, $2::int, $3::int, $4::text, now(), now()) RETURNING id`, [input("entity", "string"), input("entityID", "number", { default: 1 }), input("authorID", "number", { default: 1 }), input("body", "string", { required: true })]), ["write", "shared"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.attachments`, "Attachments · list", parameterized(`SELECT a.id, a.entity, a.entity_id, a.file_name, a.file_url, a.mime_type, a.created_at, s.full_name AS uploaded_by_name
FROM ${table("attachments")} a LEFT JOIN ${table("staff")} s ON s.id = a.uploaded_by
WHERE a.entity = $1::text AND a.entity_id = $2::int ORDER BY a.created_at DESC`, [input("entity", "string"), input("entityID", "number", { default: 1 })]), ["read", "shared"]));
  qs.push(createQuery(spec, `${spec.alias}.shared.attachment_create`, "Attachments · create", parameterized(`INSERT INTO ${table("attachments")} (entity, entity_id, file_name, file_url, mime_type, uploaded_by, created_at)
VALUES ($1::text, $2::int, $3::text, $4::text, $5::text, $6::int, now()) RETURNING id`, [input("entity", "string"), input("entityID", "number", { default: 1 }), input("fileName", "string", { required: true }), input("fileURL", "string", { required: true }), input("mimeType", "string", { default: "application/pdf" }), input("uploadedBy", "number", { default: 1 })]), ["write", "shared"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.audit`, "Audit log · list", parameterized(`SELECT id, entity, entity_id, action, actor, old_data, new_data, created_at,
  (action || ' · ' || entity) AS title,
  COALESCE(actor, 'system') AS description
FROM ${table("audit_log")}
WHERE ($1::text = '' OR entity = $1::text)
  AND ($2::int IS NULL OR entity_id = $2::int)
  AND ($3::text = '' OR actor ILIKE '%' || $3::text || '%')
  AND (NULLIF($4::text, '')::date IS NULL OR created_at >= NULLIF($4::text, '')::date)
  AND (NULLIF($5::text, '')::date IS NULL OR created_at < (NULLIF($5::text, '')::date + interval '1 day'))
ORDER BY created_at DESC LIMIT 500`, [input("entity"), input("entityID", "number"), input("actor"), input("dateFrom"), input("dateTo")]), ["read", "shared", "admin"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.import_jobs`, "Import center · jobs", parameterized(`SELECT id, entity, file_name, status, total_rows, success_rows, error_rows, error_report, created_at, completed_at FROM ${table("import_jobs")} ORDER BY created_at DESC LIMIT 100`, []), ["read", "shared", "admin"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.ops`, "Operations · event log", parameterized(`SELECT id, kind, source, status, severity, message, payload, created_at FROM ${table("ops_events")} WHERE kind = ANY($1::text[]) ORDER BY created_at DESC LIMIT 200`, [input("kinds", "array", { default: ["integration_health", "webhook", "job_run", "data_quality"] })]), ["read", "shared", "admin"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.operational_staff`, "Staff · workload assignment", parameterized(`SELECT s.id, s.full_name, s.role_key, count(t.id)::int AS assigned
FROM ${table("staff")} s LEFT JOIN ${table(main.key)} t ON t.${owner ? quoteQ(owner.key) : "id"} = s.id ${main.softDelete !== false ? `AND t.deleted_at IS NULL` : ""}
GROUP BY s.id, s.full_name, s.role_key ORDER BY assigned ASC, s.full_name`, []), ["read", "shared", "report"]));

  // Global search across core entities.
  const searchSql = core
    .map((entity) => {
      const lf = labelField(entity);
      const sf = statusField(entity);
      return `SELECT ${sqlString(entity.key)} AS entity, id, ${quoteQ(lf)}::text AS title, coalesce(${quoteQ(entity.fields.find((f) => f.type === "email")?.key || lf)}::text, '') AS subtitle, ${sf ? `${quoteQ(sf.key)} AS status` : "'' AS status"}, created_at FROM ${table(entity.key)} WHERE ${entity.softDelete !== false ? "deleted_at IS NULL AND " : ""}${quoteQ(lf)}::text ILIKE '%' || $1 || '%'`;
    })
    .join("\nUNION ALL\n");
  qs.push(createQuery(spec, `${spec.alias}.shared.search`, "Global search · records", parameterized(`SELECT * FROM (\n${searchSql}\n) results ORDER BY created_at DESC LIMIT 50`, [input("search", "string", { default: "" })]), ["read", "shared"]));

  // My tasks for the main entity.
  if (owner) {
    qs.push(createQuery(spec, `${spec.alias}.shared.my_tasks`, "Dashboard · tasks for me", parameterized(`SELECT ${selectColumns(main)} FROM ${table(main.key)}
WHERE ${main.softDelete !== false ? "deleted_at IS NULL AND " : ""}${quoteQ(owner.key)} = $1::int
${st ? `AND ${quoteQ(st.key)} NOT IN (${st.values.filter(isClosedStatus).map((v) => sqlString(v)).join(", ") || "''"})` : ""}
ORDER BY ${dt ? quoteQ(dt.key) : "created_at"} ASC LIMIT 12`, [input("staffID", "number", { default: 1 })]), ["read", "core"]));
  }

  // Dashboard recent activity.

  // Platform admin reads (read-only, tenant-scoped).
  qs.push(createQuery(spec, `${spec.alias}.shared.admin_users`, "Admin · tenant users", parameterized(`SELECT u."userID" AS "userID", u.email, u."firstName", u."lastName", utr.role, utr."createdAt" AS joined_at, r."roleTitle" AS primary_role
FROM "tblUsersTenantsRelationship" utr
JOIN "tblUsers" u ON u."userID" = utr."userID"
LEFT JOIN "tblUserTenantRoleMappings" utm ON utm."tenantID" = utr."tenantID" AND utm."userID" = utr."userID"
LEFT JOIN "tblRoles" r ON r."roleID" = utm."roleID"
WHERE utr."tenantID" = $1::uuid
ORDER BY u.email LIMIT 200`, [input("tenantID", "string", { required: true })]), ["read", "admin"]));
  qs.push(createQuery(spec, `${spec.alias}.shared.admin_roles`, "Admin · roles and permissions", parameterized(`SELECT r."roleID" AS "roleID", r."roleTitle", r."roleDescription", count(rpm."permissionID")::int AS permission_count
FROM "tblRoles" r
LEFT JOIN "tblRolePermissionMappings" rpm ON rpm."roleID" = r."roleID"
WHERE r."tenantID" = $1::uuid
GROUP BY r."roleID", r."roleTitle", r."roleDescription"
ORDER BY r."roleTitle"`, [input("tenantID", "string", { required: true })]), ["read", "admin"]));

  qs.push(createQuery(spec, `${spec.alias}.shared.admin_workflow_runs`, "Admin · workflow runs", parameterized(`SELECT i."instanceID" AS id, i.status, i."startedAt" AS started_at, i."completedAt" AS completed_at, i.version, i."isTest" AS is_test, w.title AS workflow_title
FROM "tblWorkflowInstances" i LEFT JOIN "tblWorkflows" w ON w."workflowID" = i."workflowID"
WHERE i."tenantID" = $1::uuid ORDER BY i."createdAt" DESC LIMIT 200`, [input("tenantID", "string", { required: true })]), ["read", "admin"]));
  qs.push(createQuery(spec, `${spec.alias}.shared.admin_workflow_logs`, "Admin · workflow run logs", parameterized(`SELECT l."logID" AS id, l."instanceID" AS instance_id, l."nodeID" AS node_id, l."eventType" AS event_type, l."nodeStatus" AS node_status, l."errorMessage" AS error_message, l.payload, l."createdAt" AS created_at
FROM "tblWorkflowInstanceLogs" l JOIN "tblWorkflowInstances" i ON i."instanceID" = l."instanceID"
WHERE i."tenantID" = $1::uuid ORDER BY l."createdAt" DESC LIMIT 300`, [input("tenantID", "string", { required: true })]), ["read", "admin"]));
  qs.push(createQuery(spec, `${spec.alias}.shared.admin_cron_history`, "Admin · cron job history", parameterized(`SELECT h."cronJobHistoryID" AS id, c."cronJobTitle" AS job_title, h.status, h."scheduledAt" AS scheduled_at, h."startTime" AS start_time, h."endTime" AS end_time, h."durationMs" AS duration_ms, h.result
FROM "tblCronJobHistory" h JOIN "tblCronJobs" c ON c."cronJobID" = h."cronJobID"
WHERE c."tenantID" = $1::uuid ORDER BY h."createdAt" DESC LIMIT 200`, [input("tenantID", "string", { required: true })]), ["read", "admin"]));

  // Data quality checks.
  const qualityParts = core.map((entity) => {
    const lf = labelField(entity);
    const amount = amountField(entity);
    return `SELECT ${sqlString(entity.key)} AS entity, 'missing_label' AS check_name, count(*)::int AS affected_rows, 'Records with an empty display label' AS detail FROM ${table(entity.key)} WHERE ${entity.softDelete !== false ? "deleted_at IS NULL AND " : ""}(${quoteQ(lf)} IS NULL OR btrim(${quoteQ(lf)}::text) = '')${amount ? `\nUNION ALL\nSELECT ${sqlString(entity.key)}, 'negative_amount', count(*)::int, 'Records with a negative financial amount' FROM ${table(entity.key)} WHERE ${entity.softDelete !== false ? "deleted_at IS NULL AND " : ""}${quoteQ(amount.key)} < 0` : ""}`;
  }).join("\nUNION ALL\n");
  qs.push(createQuery(spec, `${spec.alias}.shared.data_quality`, "Admin · data quality checks", parameterized(`SELECT * FROM (\n${qualityParts}\n) checks ORDER BY affected_rows DESC, entity`, []), ["read", "admin", "report"]));

  // CSV import for the primary entity.
  const importFields = main.fields.filter((f) => ["text", "email", "phone", "code"].includes(f.type)).slice(0, 3);
  const csvColumns = importFields.map((f) => f.key);
  const importSql = `WITH source AS (
  SELECT btrim(line) AS line, row_number() OVER () AS line_no
  FROM regexp_split_to_table($1::text, E'\\n') AS line
  WHERE btrim(line) <> ''
), parsed AS (
  SELECT line_no, string_to_array(line, ',') AS cols FROM source
), valid AS (
  SELECT line_no, cols FROM parsed WHERE array_length(cols, 1) >= ${csvColumns.length}
), inserted AS (
  INSERT INTO ${table(main.key)} (${csvColumns.map((c) => quoteQ(c)).join(", ")})
  SELECT ${csvColumns.map((_, i) => `btrim(cols[${i + 1}])`).join(", ")} FROM valid
  ON CONFLICT DO NOTHING
  RETURNING id
)
, stats AS (
  SELECT (SELECT count(*)::int FROM source) - 1 AS total_rows, (SELECT count(*)::int FROM inserted) AS success_rows
), job AS (
  INSERT INTO ${table("import_jobs")} (entity, file_name, status, total_rows, success_rows, error_rows, error_report, created_at, completed_at)
  SELECT ${sqlString(main.key)}, 'inline-import.csv',
    CASE WHEN stats.total_rows = stats.success_rows THEN 'completed' ELSE 'completed_with_errors' END,
    stats.total_rows, stats.success_rows, stats.total_rows - stats.success_rows, '[]'::jsonb, now(), now()
  FROM stats RETURNING id
)
SELECT stats.total_rows, stats.success_rows, stats.total_rows - stats.success_rows AS error_rows, (SELECT id FROM job) AS job_id FROM stats`;
  qs.push(createQuery(spec, `${spec.alias}.shared.import_csv`, "Import center · import CSV", parameterized(importSql, [input("csv", "string", { required: true })]), ["write", "admin", "shared"]));

  // Role matrix.
  qs.push(createQuery(spec, `${spec.alias}.shared.role_matrix`, "Admin · role/page matrix", parameterized(`SELECT id, role_key, page_slug, can_view, can_export, updated_at FROM ${table("role_matrix")} ORDER BY role_key, page_slug`, []), ["read", "admin"]));
  qs.push(createQuery(spec, `${spec.alias}.shared.role_matrix_update`, "Admin · update role/page matrix", parameterized(`UPDATE ${table("role_matrix")} SET can_view = $3::boolean, can_export = $4::boolean, updated_at = now() WHERE role_key = $1::text AND page_slug = $2::text RETURNING id`, [input("roleKey", "string"), input("pageSlug", "string"), input("canView", "boolean"), input("canExport", "boolean")]), ["write", "admin"]));

  ctx.queries.push(...qs);
}

function buildQueries(spec, ctx) {
  // Every core entity gets the full CRUD surface.
  for (const entity of coreEntities(spec)) buildEntityQueries(spec, entity, ctx);
  buildSharedQueries(spec, ctx);
}

module.exports = {
  PLATFORM_VERSION,
  SUPPORT_TABLE_NAMES,
  ALLOWED_NODE_TYPES,
  buildSchema,
  buildSeed,
  buildQueries,
  coreEntities,
  statusField,
  labelField,
  ownerField,
  amountField,
  dateField,
  requireSpec,
  qid,
  wid,
  pid,
  wfid,
  lid,
};

