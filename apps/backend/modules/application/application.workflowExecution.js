const { applicationError } = require("./application.errors");

// Provenance is stored in the server-created executionDefinition, not supplied
// through workflow inputs or trusted from mutable workflow context variables.
async function resolveApplicationWorkflowExecution({ provenance, tenantID, workflowID }) {
  const { prisma } = require("../../config/prisma.config");
  const { enforce } = require("../../config/casbin.config");
  const { caller, applicationID, releaseID, workflowVersionID } = provenance || {};
  if (!caller?.id || !["user", "apiKey"].includes(caller.type) || provenance.tenantID !== tenantID) {
    throw applicationError("PERMISSION_DENIED", "Application workflow access denied.", 403);
  }
  const [app, release, membership] = await Promise.all([
    prisma.tblApplications.findFirst({ where: { applicationID, tenantID }, select: { status: true } }),
    prisma.tblApplicationReleases.findFirst({ where: { applicationID, releaseID, tenantID } }),
    caller.type === "apiKey"
      ? prisma.tblAPIKeys.findFirst({ where: { apiKeyID: caller.id, tenantID, isDisabled: false } })
      : prisma.tblUsersTenantsRelationship.findFirst({ where: { userID: caller.id, tenantID } }),
  ]);
  if (!membership || app?.status !== "DRAFT" || !release || !await enforce(caller.id, tenantID, `application:${applicationID}`, "execute")) {
    throw applicationError("PERMISSION_DENIED", "Application workflow access denied.", 403);
  }
  let workflow;
  let queryVersions = {};
  let childWorkflowVersions = {};
  if (workflowVersionID) {
    const workflowVersion = await prisma.tblAssetVersions.findFirst({
      where: { tenantID, assetVersionID: workflowVersionID, assetType: "workflow", assetID: workflowID },
    });
    if (!workflowVersion) throw applicationError("APPLICATION_DEPENDENCY_NOT_CAPTURED", "The workflow version is not available.", 409);
    workflow = { ...workflowVersion.payload, workflowID, assetVersionID: workflowVersion.assetVersionID };
    const queryIDs = Object.values(workflowVersion.payload?.queryVersions || {});
    const childIDs = Object.values(workflowVersion.payload?.childWorkflowVersions || {});
    const rows = queryIDs.length || childIDs.length
      ? await prisma.tblAssetVersions.findMany({ where: { tenantID, assetVersionID: { in: [...queryIDs, ...childIDs] } } })
      : [];
    const byID = Object.fromEntries(rows.map(row => [row.assetVersionID, row]));
    for (const [queryID, versionID] of Object.entries(workflowVersion.payload?.queryVersions || {})) {
      const row = byID[versionID];
      if (!row || row.assetType !== "query" || row.assetID !== queryID) throw applicationError("APPLICATION_DEPENDENCY_NOT_CAPTURED", "A workflow query version is unavailable.", 409);
      queryVersions[queryID] = { ...row.payload, dataQueryID: queryID, assetVersionID: versionID };
    }
    for (const [childID, versionID] of Object.entries(workflowVersion.payload?.childWorkflowVersions || {})) {
      const row = byID[versionID];
      if (!row || row.assetType !== "workflow" || row.assetID !== childID) throw applicationError("APPLICATION_DEPENDENCY_NOT_CAPTURED", "A child workflow version is unavailable.", 409);
      childWorkflowVersions[childID] = { ...row.payload, workflowID: childID, assetVersionID: versionID };
    }
  } else {
    // Backward compatibility for releases created before asset versions.
    workflow = release.serverManifest?.workflows?.[workflowID];
    if (!workflow || (workflow.tenantID && workflow.tenantID !== tenantID)) {
      throw applicationError("APPLICATION_DEPENDENCY_NOT_CAPTURED", "The workflow is not in the starting release.", 409);
    }
    queryVersions = release.serverManifest?.queries || {};
    childWorkflowVersions = release.serverManifest?.workflows || {};
  }
  const environment = await prisma.tblApplicationEnvironments.findFirst({
    where: { tenantID, applicationID, name: provenance.environment || "production" },
    select: { bindings: true },
  });
  const bindings = environment?.bindings && typeof environment.bindings === "object" ? environment.bindings : {};
  for (const query of Object.values(queryVersions || {})) {
    const boundDatasourceID = bindings[query.datasourceID];
    if (typeof boundDatasourceID === "string" && boundDatasourceID) query.datasourceID = boundDatasourceID;
  }
  return {
    release, workflow, queryVersions, childWorkflowVersions, provenance,
    executionCtx: { tenantID, caller, originatingResource: { type: "application", id: applicationID } },
  };
}

async function loadApplicationWorkflowExecution({ instanceID, tenantID, workflowID }) {
  if (!instanceID || !tenantID) return null; // Non-persisted standalone handler tests.
  const { prisma } = require("../../config/prisma.config");
  const instance = await prisma.tblWorkflowInstances.findFirst({ where: { instanceID, tenantID }, select: { workflowID: true, executionDefinition: true } });
  if (!instance) throw applicationError("APPLICATION_RUN_NOT_FOUND", "The workflow instance is unavailable in this tenant.", 404);
  const provenance = instance?.executionDefinition?.application;
  if (!provenance) return null;
  if (instance.workflowID !== workflowID) throw applicationError("APPLICATION_RUN_MISMATCH", "Workflow run identity does not match.", 409);
  return resolveApplicationWorkflowExecution({ provenance, tenantID, workflowID });
}

module.exports = { resolveApplicationWorkflowExecution, loadApplicationWorkflowExecution };
