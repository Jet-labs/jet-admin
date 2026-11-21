/**
 * Tenant reference validation.
 *
 * JSON-configured resources (workflow graphs, listener actions, app pages,
 * cron jobs) store IDs as plain strings, so the database cannot enforce that
 * a referenced query/workflow/listener belongs to the same tenant. Every save
 * path that accepts one of those IDs must validate it here.
 *
 * Runtime execution is intentionally NOT the only guard: rejecting bad
 * references at save time gives callers a clear 400 instead of a failure in
 * a background workflow/listener run.
 */

const { isUUID } = require("validator");
const { prisma } = require("../config/prisma.config");

class TenantReferenceError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "TenantReferenceError";
    this.code = "INVALID_TENANT_REFERENCE";
    this.statusCode = 400;
    this.details = details;
  }
}

const normalizeIDs = (ids = []) =>
  [...new Set((Array.isArray(ids) ? ids : [ids])
    .filter((id) => id !== undefined && id !== null && String(id).trim() !== "")
    .map((id) => String(id)))];

const CHUNK_SIZE = 500;

async function findExistingIDs({ tenantID, ids, model, field }) {
  const existing = new Set();
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    // eslint-disable-next-line no-await-in-loop
    const rows = await prisma[model].findMany({
      where: { tenantID, [field]: { in: chunk } },
      select: { [field]: true },
    });
    for (const row of rows) existing.add(String(row[field]));
  }
  return existing;
}

const REFERENCE_CHECKS = [
  { key: "dataQueryIDs", model: "tblDataQueries", field: "dataQueryID", label: "Data query" },
  { key: "workflowIDs", model: "tblWorkflows", field: "workflowID", label: "Workflow" },
  { key: "listenerIDs", model: "tblListeners", field: "listenerID", label: "Listener" },
  { key: "appPageIDs", model: "tblAppPages", field: "appPageID", label: "App page" },
  { key: "datasourceIDs", model: "tblDatasources", field: "datasourceID", label: "Datasource" },
];

/**
 * Assert that every supplied reference belongs to `tenantID`.
 *
 * Invalid UUIDs are reported as missing rather than reaching Prisma (which
 * would throw a P2023 and surface as a 500).
 *
 * @param {object} refs
 * @param {string} refs.tenantID
 * @param {Array<string>} [refs.dataQueryIDs]
 * @param {Array<string>} [refs.workflowIDs]
 * @param {Array<string>} [refs.listenerIDs]
 * @param {Array<string>} [refs.appPageIDs]
 * @param {Array<string>} [refs.datasourceIDs]
 * @throws {TenantReferenceError}
 */
async function assertTenantReferences({
  tenantID,
  dataQueryIDs = [],
  workflowIDs = [],
  listenerIDs = [],
  appPageIDs = [],
  datasourceIDs = [],
}) {
  if (!tenantID) return;

  const missing = [];
  const supplied = {
    dataQueryIDs,
    workflowIDs,
    listenerIDs,
    appPageIDs,
    datasourceIDs,
  };

  for (const check of REFERENCE_CHECKS) {
    const ids = normalizeIDs(supplied[check.key]);
    if (ids.length === 0) continue;

    const valid = ids.filter((id) => isUUID(id));
    const invalid = ids.filter((id) => !isUUID(id));

    for (const id of invalid) {
      missing.push({ type: check.field, id, reason: "not a valid UUID" });
    }

    if (valid.length === 0) continue;

    // eslint-disable-next-line no-await-in-loop
    const existing = await findExistingIDs({
      tenantID,
      ids: valid,
      model: check.model,
      field: check.field,
    });

    for (const id of valid) {
      if (!existing.has(id)) {
        missing.push({ type: check.field, id, reason: "not found in tenant" });
      }
    }
  }

  if (missing.length > 0) {
    const summary = missing
      .slice(0, 5)
      .map((entry) => `${entry.type} ${entry.id}`)
      .join(", ");
    throw new TenantReferenceError(
      `Invalid or cross-tenant reference(s): ${summary}${missing.length > 5 ? ` (+${missing.length - 5} more)` : ""}`,
      { missing }
    );
  }
}

module.exports = { assertTenantReferences, TenantReferenceError };
