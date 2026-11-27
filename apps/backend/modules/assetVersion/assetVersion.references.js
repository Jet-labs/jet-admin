// Pure dependency extraction for immutable asset version payloads. Kept
// separate from the service so backfill and audit scripts share one contract.
function payloadChildVersionIDs(type, payload) {
  const ids = new Set();
  if (type === "query" && payload?.datasourceVersionID) ids.add(payload.datasourceVersionID);
  if (type === "workflow") {
    for (const id of Object.values(payload?.queryVersions || {})) ids.add(id);
    for (const id of Object.values(payload?.childWorkflowVersions || {})) ids.add(id);
  }
  if (type === "widget") {
    for (const id of Object.values(payload?.queryVersions || {})) ids.add(id);
    for (const id of Object.values(payload?.workflowVersions || {})) ids.add(id);
  }
  if (type === "listener") {
    if (payload?.datasourceVersionID) ids.add(payload.datasourceVersionID);
    for (const id of Object.values(payload?.workflowVersions || {})) ids.add(id);
    for (const id of Object.values(payload?.queryVersions || {})) ids.add(id);
  }
  if (type === "cronjob" && payload?.workflowVersionID) ids.add(payload.workflowVersionID);
  if (type === "appPage") {
    for (const ref of Object.values(payload?.sourceVersions || {})) ids.add(ref.assetVersionID);
    for (const id of Object.values(payload?.widgetVersions || {})) ids.add(id);
  }
  return [...ids].filter(Boolean);
}

module.exports = { payloadChildVersionIDs };
