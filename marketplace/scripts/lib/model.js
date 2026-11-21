/** Shared template spec model helpers (no generation side effects). */

function coreEntities(spec) {
  return spec.entities.filter((entity) => entity.core !== false);
}

function statusField(entity) {
  return entity.fields.find((f) => f.type === "enum" && /status|stage|state|priority|severity|health/i.test(f.key)) || null;
}

function labelField(entity) {
  const preferred = ["name", "title", "subject", "full_name", "code", "label"];
  for (const key of preferred) {
    const field = entity.fields.find((f) => f.key === key);
    if (field) return field.key;
  }
  return entity.fields.find((f) => ["text", "email", "code"].includes(f.type))?.key || "id";
}

function dateField(entity) {
  return (
    entity.fields.find((f) => ["timestamptz", "date"].includes(f.type) && /due|date|at|start|end|deadline|expiry|renewal/i.test(f.key)) ||
    null
  );
}

function amountField(entity) {
  return entity.fields.find((f) => ["money", "decimal", "int"].includes(f.type) && /amount|value|revenue|price|cost|budget|total|salary|fee|balance/i.test(f.key));
}

function ownerField(entity) {
  return entity.fields.find((f) => f.type === "ref" && f.ref === "staff" && /owner|assignee|agent|manager|approver|driver|recruiter|steward|analyst/i.test(f.key)) ||
    entity.fields.find((f) => f.type === "ref" && f.ref === "staff");
}

function isClosedStatus(value) {
  return /^(closed|resolved|done|complete|completed|cancelled|canceled|archived|won|lost|paid|inactive|retired|expired|rejected|failed)$/i.test(String(value));
}

module.exports = { coreEntities, statusField, labelField, dateField, amountField, ownerField, isClosedStatus };
