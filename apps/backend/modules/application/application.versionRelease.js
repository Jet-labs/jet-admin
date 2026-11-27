const { createHash } = require("crypto");
const { applicationError } = require("./application.errors");
const { compileApplicationRelease } = require("./application.compiler");
const { normalizePageWidgetActions } = require("../appPage/appPage.actions");

// Assemble a runtime manifest from immutable page versions. Definitions are
// read from version rows; the Application release itself stores only pointers.
// Each page is normalized and compiled independently so shared widgets resolve
// their trigger actions against the page that owns the data sources.
async function assembleApplicationRelease({ db, application, definition, pageVersions, tenantID, bindings = null, assets = null, extraDiagnostics = [] }) {
  const pageVersionIDs = Object.values(pageVersions || {});
  if (!pageVersionIDs.length) {
    const compiled = compileApplicationRelease({ application, definition, pagesByAsset: {}, widgetsByID: {}, queriesByID: {} });
    return { ...compiled, pageVersionIDs: [] };
  }
  const pageRows = await db.tblAssetVersions.findMany({ where: { tenantID, assetVersionID: { in: pageVersionIDs } } });
  const byID = Object.fromEntries(pageRows.map(row => [row.assetVersionID, row]));
  const directVersionIDs = new Set();
  for (const versionID of pageVersionIDs) {
    const pageVersion = byID[versionID];
    if (!pageVersion || pageVersion.assetType !== "appPage") throw applicationError("ASSET_VERSION_INVALID", "A release page version is missing or invalid.", 409);
    directVersionIDs.add(pageVersion.assetVersionID);
    for (const ref of Object.values(pageVersion.payload?.sourceVersions || {})) directVersionIDs.add(ref.assetVersionID);
    for (const version of Object.values(pageVersion.payload?.widgetVersions || {})) directVersionIDs.add(version);
  }
  const directRows = directVersionIDs.size
    ? await db.tblAssetVersions.findMany({ where: { tenantID, assetVersionID: { in: [...directVersionIDs] } } })
    : [];
  const all = { ...byID, ...Object.fromEntries(directRows.map(row => [row.assetVersionID, row])) };
  const queriesByID = {};
  const workflowsByID = {};
  const listenersByID = {};
  for (const [assetKey, versionID] of Object.entries(pageVersions)) {
    const pageVersion = all[versionID];
    for (const ref of Object.values(pageVersion?.payload?.sourceVersions || {})) {
      const version = all[ref.assetVersionID];
      if (!version) throw applicationError("ASSET_VERSION_INVALID", "A page version references a missing source version.", 409);
      if (ref.assetType === "query") {
        queriesByID[ref.assetID] = { ...version.payload, dataQueryID: ref.assetID, assetVersionID: ref.assetVersionID };
      } else if (ref.assetType === "workflow") {
        workflowsByID[ref.assetID] = { ...version.payload, workflowID: ref.assetID, assetVersionID: ref.assetVersionID };
      } else if (ref.assetType === "listener") {
        listenersByID[ref.assetID] = { ...version.payload, listenerID: ref.assetID, assetVersionID: ref.assetVersionID };
      }
    }
  }
  if (bindings && typeof bindings === "object") {
    for (const query of Object.values(queriesByID)) {
      const boundDatasourceID = bindings[query.datasourceID];
      if (typeof boundDatasourceID === "string" && boundDatasourceID) {
        query.datasourceID = boundDatasourceID;
      }
    }
  }

  const pages = {};
  const widgets = {};
  const serverPages = {};
  const diagnostics = [];
  let normalizedDefinition = null;
  let serverManifest = null;
  const orderedKeys = Object.keys(pageVersions).sort();
  const releaseAssets = assets || orderedKeys.map(assetKey => ({
    assetKey,
    assetType: "appPage",
    appPageID: all[pageVersions[assetKey]]?.assetID,
  }));
  for (const assetKey of orderedKeys) {
    const versionID = pageVersions[assetKey];
    const pageVersion = all[versionID];
    const payload = pageVersion?.payload || {};
    const page = { appPageID: pageVersion.assetID, appPageTitle: payload.appPageTitle, appPageConfig: payload.appPageConfig || {} };
    const pageWidgets = {};
    for (const [widgetID, widgetVersionID] of Object.entries(payload.widgetVersions || {})) {
      const widgetVersion = all[widgetVersionID];
      if (!widgetVersion || widgetVersion.assetType !== "widget") throw applicationError("ASSET_VERSION_INVALID", "A page version references a missing widget version.", 409);
      pageWidgets[widgetID] = {
        widgetID: widgetVersion.assetID, widgetTitle: widgetVersion.payload.widgetTitle,
        widgetType: widgetVersion.payload.widgetType, widgetConfig: widgetVersion.payload.widgetConfig || {},
        assetVersionID: widgetVersionID,
      };
    }
    const normalizedWidgets = normalizePageWidgetActions({
      pageAssetKey: assetKey,
      pageConfig: page.appPageConfig,
      widgetsByID: pageWidgets,
      triggerBindings: payload.triggerBindings || null,
      diagnostics,
    });
    const compiled = compileApplicationRelease({
      application, definition, pagesByAsset: { [assetKey]: page }, widgetsByID: normalizedWidgets,
      queriesByID, workflowsByID, listenersByID, assets: releaseAssets,
    });
    normalizedDefinition = compiled.clientManifest.definition;
    serverManifest = compiled.serverManifest;
    Object.assign(pages, compiled.clientManifest.pages);
    Object.assign(widgets, compiled.clientManifest.widgets);
    Object.assign(serverPages, compiled.serverManifest.pages);
    diagnostics.push(...compiled.clientManifest.diagnostics);
  }

  diagnostics.sort((a, b) => `${a.path}:${a.code}`.localeCompare(`${b.path}:${b.code}`));
  diagnostics.unshift(...extraDiagnostics);
  const mergedServerManifest = {
    ...serverManifest,
    pages: serverPages,
  };
  const clientManifest = {
    schemaVersion: 1,
    mode: "runtime",
    executionEnabled: true,
    actionsEnabled: true,
    applicationID: application.applicationID,
    applicationTitle: application.title,
    applicationSlug: application.slug,
    tenantID: application.tenantID,
    definition: normalizedDefinition,
    pages,
    widgets,
    diagnostics,
  };
  const contentHash = createHash("sha256")
    .update(JSON.stringify({ definition: normalizedDefinition, pages, widgets, serverManifest: mergedServerManifest, diagnostics }))
    .digest("hex");
  return { clientManifest, serverManifest: mergedServerManifest, contentHash, pageVersionIDs, pageVersions };
}

function applyManifestDatasourceBindings(serverManifest, bindings) {
  if (!serverManifest || !bindings || typeof bindings !== "object") return serverManifest;
  const apply = (source) => {
    if (!source || typeof source !== "object") return;
    const bound = bindings[source.datasourceID];
    if (typeof bound === "string" && bound) source.datasourceID = bound;
  };
  for (const page of Object.values(serverManifest.pages || {})) {
    for (const source of Object.values(page || {})) apply(source);
  }
  for (const query of Object.values(serverManifest.queries || {})) apply(query);
  return serverManifest;
}

module.exports = { assembleApplicationRelease, applyManifestDatasourceBindings };
