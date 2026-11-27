const { createHash } = require("crypto");
const { createApplicationDefinition, validateApplicationDefinition, collectPageWidgetIDs, isSafeApplicationJSON } = require("@jet-admin/application-contracts");
const { applicationError } = require("./application.errors");
const { compileApplicationRelease } = require("./application.compiler");
const { createAssetVersionService } = require("../assetVersion/assetVersion.service");
const { assembleApplicationRelease } = require("./application.versionRelease");

// Only safe, non-executable widget types are admitted to composition previews.
// Rich HTML/iframe/custom code and autonomous media/network widgets fail closed.
const PREVIEW_WIDGET_TYPES = new Set(["text", "stat", "alert", "badge", "progress", "divider", "button", "table", "key-value", "json-viewer", "list", "text-input", "search-input", "select", "multi-select", "checkbox", "radio-group", "switch", "slider", "date-picker", "date-range-picker", "form", "tabs"]);
const metadataSelect = { applicationID: true, tenantID: true, title: true, slug: true, description: true, status: true, createdAt: true, updatedAt: true };
const conflict = () => applicationError("APPLICATION_REVISION_CONFLICT", "The draft changed. Reload before saving; your changes have not been applied.", 409);

// Immutable page manifests are safe to cache per page version. The key includes
// the release, environment binding revision, consumer-policy revision and route
// so a policy or binding change can never reuse an older authorization context.
const RUNTIME_PAGE_CACHE_MAX = 200;
const runtimePageManifestCache = new Map();
const runtimePageCacheEnabled = process.env.NODE_ENV !== "test";

function runtimePageCacheKey({ tenantID, releaseID, pageVersionID, bindingRevision, policyRevision, policyEnabled, routeID }) {
  return createHash("sha256")
    .update(JSON.stringify({ tenantID, releaseID, pageVersionID, bindingRevision: bindingRevision || 0, policyRevision: policyRevision || 0, policyEnabled: Boolean(policyEnabled), routeID }))
    .digest("hex");
}

function readRuntimePageCache(key) {
  if (!runtimePageCacheEnabled) return null;
  const entry = runtimePageManifestCache.get(key);
  if (!entry) return null;
  runtimePageManifestCache.delete(key);
  runtimePageManifestCache.set(key, entry);
  return entry;
}

function writeRuntimePageCache(key, value) {
  if (!runtimePageCacheEnabled) return;
  runtimePageManifestCache.delete(key);
  runtimePageManifestCache.set(key, value);
  while (runtimePageManifestCache.size > RUNTIME_PAGE_CACHE_MAX) {
    runtimePageManifestCache.delete(runtimePageManifestCache.keys().next().value);
  }
}


// Translate proxy failures without exposing query IDs, SQL, or connector
// details. Unknown execution failures stay as-is so the controller hides them.
function mapRuntimeExecutionError(error) {
  if (typeof error?.message === "string" && error.message.startsWith("Query input validation failed")) {
    return applicationError("INVALID_QUERY_INPUTS", "The query inputs are invalid.", 400);
  }
  if (typeof error?.message === "string" && error.message.startsWith("Authorization denied")) {
    return applicationError("PERMISSION_DENIED", "You cannot execute one of the release resources.", 403);
  }
  return error;
}

function createApplicationService({ db, enforce, grantCreatorAccess }) {
  const assetVersions = createAssetVersionService({ db, enforce });
  const releaseApplication = release => ({
    applicationID: release.applicationID,
    tenantID: release.tenantID,
    title: release.clientManifest?.applicationTitle || release.applicationID,
    slug: release.clientManifest?.applicationSlug || release.applicationID,
  });
  async function authorize(ctx, resourceID, action) {
    const { caller, tenantID } = ctx || {};
    if (!tenantID || !caller?.id || !["user", "apiKey"].includes(caller.type)) throw applicationError("PERMISSION_DENIED", "Application access denied.", 403);
    const membership = caller.type === "apiKey"
      ? await db.tblAPIKeys.findFirst({ where: { apiKeyID: caller.id, tenantID, isDisabled: false }, select: { apiKeyID: true } })
      : await db.tblUsersTenantsRelationship.findFirst({ where: { tenantID, userID: caller.id }, select: { userID: true } });
    if (!membership || !await enforce(caller.id, tenantID, `application:${resourceID}`, action)) throw applicationError("PERMISSION_DENIED", "Application access denied.", 403);
  }
  async function sourceAccess(ctx, resource, id, action = "read") {
    if (!await enforce(ctx.caller.id, ctx.tenantID, `${resource}:${id}`, action)) throw applicationError("PERMISSION_DENIED", "You cannot read one of the referenced assets.", 403);
  }
  async function assetExecuteAccess(ctx, resource, id, action = "execute") {
    if (!await enforce(ctx.caller.id, ctx.tenantID, `${resource}:${id}`, action)) {
      throw applicationError("PERMISSION_DENIED", "You cannot execute one of the release assets.", 403);
    }
  }
  async function find(tx, ctx, applicationID, active = false) {
    const app = await tx.tblApplications.findFirst({ where: { applicationID, tenantID: ctx.tenantID }, include: { draft: true, assets: { orderBy: { assetKey: "asc" } } } });
    if (!app) throw applicationError("APPLICATION_NOT_FOUND", "Application not found.", 404);
    if (active && app.status !== "DRAFT") throw applicationError("APPLICATION_ARCHIVED", "This application is archived.", 409);
    return app;
  }
  async function lock(tx, ctx, applicationID, expectedRevision) {
    // All composition writes take this row lock, including archive and asset edits.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${ctx.tenantID + ":" + applicationID}, 0))`;
    const app = await find(tx, ctx, applicationID, true);
    if (app.draft.revision !== expectedRevision) throw conflict();
    return app;
  }
  const releaseMetadata = release => ({
    releaseID: release.releaseID,
    applicationID: release.applicationID,
    releaseNumber: release.releaseNumber,
    sourceRevision: release.sourceRevision,
    schemaVersion: release.schemaVersion,
    contentHash: release.contentHash,
    createdAt: release.createdAt,
    pageVersionCount: Object.keys(release.serverManifest?.pageVersions || release.clientManifest?.pageVersions || {}).length,
    pageVersions: release.serverManifest?.pageVersions || release.clientManifest?.pageVersions || {},
    warningCount: Array.isArray(release.clientManifest?.diagnostics)
      ? release.clientManifest.diagnostics.filter(item => item.severity === "warning").length
      : 0,
  });
  const environmentName = value => {
    const name = String(value || "production").trim().toLowerCase();
    if (!/^[a-z][a-z0-9-]{0,39}$/.test(name)) throw applicationError("INVALID_ENVIRONMENT", "Environment names use lowercase letters, numbers, and hyphens.", 400);
    return name;
  };
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  async function normalizeBindings({ ctx, db: tx, bindings }) {
    if (!isSafeApplicationJSON(bindings) || !bindings || typeof bindings !== "object" || Array.isArray(bindings)) {
      throw applicationError("INVALID_ENVIRONMENT_BINDINGS", "Bindings must be a bounded JSON object.", 400);
    }
    const entries = Object.entries(bindings);
    if (entries.length > 100) throw applicationError("INVALID_ENVIRONMENT_BINDINGS", "Bindings support at most 100 datasource mappings.", 400);
    for (const [sourceID, targetID] of entries) {
      if (!uuidPattern.test(sourceID) || typeof targetID !== "string" || !uuidPattern.test(targetID)) {
        throw applicationError("INVALID_ENVIRONMENT_BINDINGS", "Binding keys and values must be datasource UUIDs.", 400);
      }
    }
    if (!entries.length) return {};
    const ids = [...new Set(entries.flat())];
    const datasources = await tx.tblDatasources.findMany({
      where: { tenantID: ctx.tenantID, datasourceID: { in: ids } },
      select: { datasourceID: true, datasourceType: true },
    });
    const byID = new Map(datasources.map(row => [row.datasourceID, row]));
    for (const [sourceID, targetID] of entries) {
      const target = byID.get(targetID);
      if (!target) throw applicationError("INVALID_ENVIRONMENT_BINDING_TARGET", "A binding target datasource is missing.", 409);
      const source = byID.get(sourceID);
      if (source && source.datasourceType !== target.datasourceType) {
        throw applicationError("ENVIRONMENT_BINDING_TYPE_MISMATCH", "A binding target must use the same datasource type as the release datasource.", 409);
      }
    }
    return Object.fromEntries(entries);
  }
  const CONSUMER_SUBJECT_TYPES = new Set(["user", "role", "apiKey"]);
  const consumerPolicyKey = entry =>
    `${entry.subjectType}:${entry.subjectID}:route:${entry.routeID || "*"}:action:${entry.actionKey || "*"}`;
  async function loadConsumerPolicyState(ctx, applicationID) {
    const [config, entries] = await Promise.all([
      db.tblApplicationConsumerConfigs.findUnique({ where: { applicationID } }),
      db.tblApplicationConsumerPolicies.findMany({ where: { applicationID, tenantID: ctx.tenantID } }),
    ]);
    if (!config?.enabled) return { enabled: false, config, entries: [] };
    const roleRows = ctx.caller.type === "apiKey"
      ? await db.tblAPIKeyRoleMappings.findMany({ where: { apiKeyID: ctx.caller.id }, select: { roleID: true } })
      : await db.tblUserTenantRoleMappings.findMany({ where: { userID: ctx.caller.id, tenantID: ctx.tenantID }, select: { roleID: true } });
    const subjects = new Set([`${ctx.caller.type}:${ctx.caller.id}`, ...roleRows.map(row => `role:${row.roleID}`)]);
    return {
      enabled: true,
      config,
      entries: entries.filter(entry => subjects.has(`${entry.subjectType}:${entry.subjectID}`)),
    };
  }
  const routeDenied = (entries, routeID) => entries.some(entry =>
    !entry.allow && (entry.routeID === null || entry.routeID === routeID) && entry.actionKey === null
  );
  const routeGranted = (entries, routeID) => entries.some(entry =>
    entry.allow && (entry.routeID === null || entry.routeID === routeID)
  );
  const actionDenied = (entries, routeID, actionKey) => entries.some(entry =>
    !entry.allow &&
    (entry.routeID === null || entry.routeID === routeID) &&
    (entry.actionKey === null || entry.actionKey === actionKey)
  );
  const actionGranted = (entries, routeID, actionKey) => entries.some(entry =>
    entry.allow &&
    (entry.routeID === null || entry.routeID === routeID) &&
    (entry.actionKey === null || entry.actionKey === actionKey)
  );
  async function findRelease(tx, ctx, applicationID, releaseID) {
    const release = await tx.tblApplicationReleases.findFirst({
      where: { releaseID, applicationID, tenantID: ctx.tenantID },
    });
    if (!release) throw applicationError("APPLICATION_RELEASE_NOT_FOUND", "Release not found.", 404);
    return release;
  }
  async function findEnvironment(tx, ctx, applicationID, name) {
    return tx.tblApplicationEnvironments.findFirst({
      where: { tenantID: ctx.tenantID, applicationID, name },
      include: { currentRelease: true },
    });
  }
  async function runtimeRelease(tx, ctx, applicationID, name) {
    const app = await tx.tblApplications.findFirst({
      where: { applicationID, tenantID: ctx.tenantID },
      select: { status: true },
    });
    if (!app || app.status !== "DRAFT") {
      throw applicationError("APPLICATION_ARCHIVED", "This application is not available.", 409);
    }
    const environment = await findEnvironment(tx, ctx, applicationID, name);
    if (!environment?.currentRelease) {
      throw applicationError("APPLICATION_NOT_DEPLOYED", "This application has no deployed release in that environment.", 409);
    }
    return { environment, release: environment.currentRelease };
  }
  const principalMatches = (a, b) => a?.type === b?.type && a?.id === b?.id;

  async function loadDeployedPageVersion(ctx, release, pageAssetKey) {
    const pageVersionID = release.serverManifest?.pageVersions?.[pageAssetKey];
    if (!pageVersionID) {
      throw applicationError("APPLICATION_RESOURCE_NOT_FOUND", "That page is not part of the deployed release.", 404);
    }
    const pageVersion = await db.tblAssetVersions.findFirst({
      where: {
        tenantID: ctx.tenantID,
        assetVersionID: pageVersionID,
        assetType: "appPage",
        status: "published",
      },
    });
    if (!pageVersion) {
      throw applicationError("APPLICATION_PAGE_VERSION_NOT_FOUND", "The deployed page version is unavailable.", 409);
    }
    return pageVersion;
  }

  function resolveRuntimeRoute(release, pageAssetKey, requestedRouteID) {
    const routes = release.clientManifest?.definition?.routes || [];
    const pageRoutes = routes.filter(route => route.pageAssetKey === pageAssetKey);
    if (!pageRoutes.length) {
      throw applicationError("APPLICATION_RESOURCE_NOT_FOUND", "That page is not routed in the deployed release.", 404);
    }
    if (requestedRouteID) {
      const requested = pageRoutes.find(route => route.id === requestedRouteID);
      if (!requested) {
        throw applicationError("APPLICATION_ROUTE_MISMATCH", "That route does not own the requested page.", 409);
      }
      return requested;
    }
    return pageRoutes[0];
  }

  async function resolveRuntimeSource(ctx, release, pageAssetKey, alias) {
    const pageVersion = await loadDeployedPageVersion(ctx, release, pageAssetKey);
    const pageConfig = pageVersion.payload?.appPageConfig || {};
    const sourceDescriptor = (Array.isArray(pageConfig.dataSources) ? pageConfig.dataSources : [])
      .find(source => source?.alias === alias);
    const ref = pageVersion.payload?.sourceVersions?.[alias];
    if (!sourceDescriptor || !ref) {
      throw applicationError("APPLICATION_RESOURCE_NOT_FOUND", "That data source is not part of the deployed release.", 404);
    }
    const sourceVersion = await db.tblAssetVersions.findFirst({
      where: {
        tenantID: ctx.tenantID,
        assetVersionID: ref.assetVersionID,
        assetType: ref.assetType,
        assetID: ref.assetID,
        status: "published",
      },
    });
    if (!sourceVersion) {
      throw applicationError("APPLICATION_DEPENDENCY_NOT_CAPTURED", "The data source version is unavailable in the release.", 409);
    }
    return { pageVersion, pageConfig, sourceDescriptor, ref, sourceVersion };
  }
  async function runtimeRun({ ctx, applicationID, environment: requestedName, pageAssetKey, alias, instanceID }) {
    await authorize(ctx, applicationID, "execute");
    await find(db, ctx, applicationID, true);
    const instance = await db.tblWorkflowInstances.findFirst({ where: { instanceID, tenantID: ctx.tenantID } });
    const provenance = instance?.executionDefinition?.application;
    if (!provenance || provenance.applicationID !== applicationID || provenance.environment !== environmentName(requestedName) ||
      provenance.pageAssetKey !== pageAssetKey || provenance.alias !== alias || !principalMatches(provenance.caller, ctx.caller) || instance.parentInstanceID) {
      throw applicationError("APPLICATION_RUN_NOT_FOUND", "That run does not belong to this application operation and caller.", 404);
    }
    const release = await findRelease(db, ctx, applicationID, provenance.releaseID);
    const runtimeEnvironment = await findEnvironment(db, ctx, applicationID, environmentName(requestedName));
    if (!runtimeEnvironment) throw applicationError("APPLICATION_NOT_DEPLOYED", "This application has no deployed release in that environment.", 409);
    const runRouteID = resolveRuntimeRoute(release, pageAssetKey, provenance.routeID || null).id;
    const consumerPolicy = await loadConsumerPolicyState(ctx, applicationID);
    if (consumerPolicy.enabled) {
      const routeAllowed = routeGranted(consumerPolicy.entries, runRouteID) && !routeDenied(consumerPolicy.entries, runRouteID);
      const actionAllowed = actionGranted(consumerPolicy.entries, runRouteID, alias) && !actionDenied(consumerPolicy.entries, runRouteID, alias);
      if (!routeAllowed || !actionAllowed) throw applicationError("APPLICATION_CONSUMER_ACCESS_DENIED", "This run is not available to the current consumer.", 403);
    }
    const compiled = null;
    const { ref, sourceVersion } = await resolveRuntimeSource(ctx, release, pageAssetKey, alias);
    const matchesSource = ref.assetType === "workflow" && ref.assetID === instance.workflowID &&
      (!sourceVersion.assetVersionID || !provenance.workflowVersionID || sourceVersion.assetVersionID === provenance.workflowVersionID);
    if (!matchesSource) throw applicationError("APPLICATION_RUN_NOT_FOUND", "That run is not an admitted workflow operation.", 404);
    return { instance, provenance, release, compiled };
  }
  async function runFamily(instance, provenance) {
    const ids = [instance.instanceID];
    let parents = ids;
    for (let depth = 0; parents.length && depth <= 20; depth++) {
      const children = await db.tblWorkflowInstances.findMany({ where: { tenantID: provenance.tenantID, parentInstanceID: { in: parents } }, select: { instanceID: true, executionDefinition: true } });
      parents = children.filter(child => {
        const p = child.executionDefinition?.application;
        return p?.releaseID === provenance.releaseID && p.applicationID === provenance.applicationID && p.alias === provenance.alias && p.pageAssetKey === provenance.pageAssetKey && principalMatches(p.caller, provenance.caller);
      }).map(child => child.instanceID);
      ids.push(...parents);
      if (ids.length > 100) throw applicationError("APPLICATION_RUN_LIMIT", "The workflow family exceeds the observation limit.", 413);
    }
    if (parents.length) throw applicationError("APPLICATION_RUN_LIMIT", "The workflow family exceeds the nesting limit.", 413);
    return ids;
  }
  async function bump(tx, ctx, applicationID, expectedRevision, definition) {
    const result = await tx.tblApplicationDrafts.updateMany({
      where: { applicationID, tenantID: ctx.tenantID, revision: expectedRevision },
      data: { revision: { increment: 1 }, updatedAt: new Date(), ...(definition ? { definition } : {}) },
    });
    if (result.count !== 1) throw conflict();
    await tx.tblApplications.updateMany({ where: { applicationID, tenantID: ctx.tenantID }, data: { updatedAt: new Date() } });
  }
  const service = {
    async list({ ctx, search, page = 1, pageSize = 20 }) {
      await authorize(ctx, "*", "list");
      const rows = await db.tblApplications.findMany({
        where: { tenantID: ctx.tenantID, ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { slug: { contains: search, mode: "insensitive" } }] } : {}) },
        select: metadataSelect, orderBy: [{ createdAt: "desc" }, { applicationID: "asc" }],
      });
      // Filter before pagination/count: collection permission must not disclose
      // names, descriptions, or counts of individually denied applications.
      const allowed = [];
      for (const row of rows) if (await enforce(ctx.caller.id, ctx.tenantID, `application:${row.applicationID}`, "read")) allowed.push(row);
      return { applications: allowed.slice((page - 1) * pageSize, page * pageSize), totalCount: allowed.length, page, pageSize, totalPages: Math.ceil(allowed.length / pageSize) };
    },
    async create({ ctx, title, slug, description, authContext }) {
      await authorize(ctx, "*", "create");
      const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
      const ownership = getCreationContextFromAuthContext(authContext);
      const app = await db.$transaction(async tx => {
        const application = await tx.tblApplications.create({ data: { tenantID: ctx.tenantID, title, slug, description, ...ownership } });
        await tx.tblApplicationDrafts.create({ data: { tenantID: ctx.tenantID, applicationID: application.applicationID, definition: createApplicationDefinition() } });
        return application;
      });
      await grantCreatorAccess(ctx.tenantID, "application", app.applicationID, authContext);
      return app;
    },
    async get({ ctx, applicationID }) {
      await authorize(ctx, applicationID, "read");
      return find(db, ctx, applicationID);
    },
    async getDraft({ ctx, applicationID }) {
      return (await service.get({ ctx, applicationID })).draft;
    },
    async saveDraft({ ctx, applicationID, expectedRevision, definition }) {
      await authorize(ctx, applicationID, "update");
      return db.$transaction(async tx => {
        const app = await lock(tx, ctx, applicationID, expectedRevision);
        const validation = validateApplicationDefinition(definition, app.assets);
        if (!validation.valid) throw applicationError("INVALID_APPLICATION_DEFINITION", "Fix the draft validation errors before saving.", 400, { diagnostics: validation.diagnostics });
        await bump(tx, ctx, applicationID, expectedRevision, validation.definition);
        return (await find(tx, ctx, applicationID)).draft;
      });
    },
    async linkPage({ ctx, applicationID, expectedRevision, assetKey, appPageID, managementMode = "referenced" }) {
      await authorize(ctx, applicationID, "update");
      await sourceAccess(ctx, "appPage", appPageID);
      if (!["referenced", "managed"].includes(managementMode)) {
        throw applicationError("INVALID_MANAGEMENT_MODE", "Page links must be referenced or managed.", 400);
      }
      if (managementMode === "managed") {
        if (!await enforce(ctx.caller.id, ctx.tenantID, "appPage:*", "create")) {
          throw applicationError("PERMISSION_DENIED", "You cannot create a managed page copy.", 403);
        }
      }
      return db.$transaction(async tx => {
        const app = await lock(tx, ctx, applicationID, expectedRevision);
        if (app.assets.length >= 100) throw applicationError("APPLICATION_ASSET_LIMIT", "An application can link at most 100 pages in this phase.");
        const page = await tx.tblAppPages.findFirst({
          where: { tenantID: ctx.tenantID, appPageID },
          select: { appPageID: true, appPageTitle: true, appPageDescription: true, appPageConfig: true },
        });
        if (!page) throw applicationError("APPLICATION_ASSET_NOT_FOUND", "Page not found in this tenant.", 404);
        let linkedPageID = appPageID;
        if (managementMode === "managed") {
          const copy = await tx.tblAppPages.create({
            data: {
              tenantID: ctx.tenantID,
              appPageTitle: `${page.appPageTitle} · ${assetKey}`.slice(0, 255),
              appPageDescription: page.appPageDescription || null,
              appPageConfig: structuredClone(page.appPageConfig || {}),
              creatorID: ctx.caller?.type === "user" ? ctx.caller.id : null,
              createdByApiKeyID: ctx.caller?.type === "apiKey" ? ctx.caller.id : null,
            },
          });
          linkedPageID = copy.appPageID;
        }
        await tx.tblApplicationAssets.create({
          data: {
            tenantID: ctx.tenantID,
            applicationID,
            assetKey,
            assetType: "appPage",
            appPageID: linkedPageID,
            managementMode,
          },
        });
        await bump(tx, ctx, applicationID, expectedRevision);
        return find(tx, ctx, applicationID);
      });
    },
    async selectPageVersion({ ctx, applicationID, expectedRevision, assetKey, pageVersionID }) {
      await authorize(ctx, applicationID, "update");
      return db.$transaction(async tx => {
        const app = await lock(tx, ctx, applicationID, expectedRevision);
        const asset = app.assets.find(item => item.assetKey === assetKey && item.assetType === "appPage");
        if (!asset) throw applicationError("APPLICATION_ASSET_NOT_FOUND", "Page link not found.", 404);
        if (pageVersionID) {
          const version = await tx.tblAssetVersions.findFirst({
            where: {
              tenantID: ctx.tenantID,
              assetVersionID: pageVersionID,
              assetType: "appPage",
              assetID: asset.appPageID,
              status: "published",
            },
            select: { assetVersionID: true },
          });
          if (!version) {
            throw applicationError(
              "APPLICATION_PAGE_VERSION_NOT_FOUND",
              "That page version is not available for this linked page.",
              409
            );
          }
        }
        await tx.tblApplicationAssets.update({
          where: { applicationAssetID: asset.applicationAssetID },
          data: { pageVersionID: pageVersionID || null },
        });
        await bump(tx, ctx, applicationID, expectedRevision);
        return find(tx, ctx, applicationID);
      });
    },
    async unlinkAsset({ ctx, applicationID, expectedRevision, assetKey }) {
      await authorize(ctx, applicationID, "update");
      return db.$transaction(async tx => {
        const app = await lock(tx, ctx, applicationID, expectedRevision);
        if (app.draft.definition.routes.some(route => route.pageAssetKey === assetKey)) throw applicationError("APPLICATION_ASSET_IN_USE", "Remove routes using this page before unlinking it.", 409);
        const asset = await tx.tblApplicationAssets.findFirst({
          where: { applicationID, tenantID: ctx.tenantID, assetKey },
          select: { managementMode: true, appPageID: true },
        });
        if (!asset) throw applicationError("APPLICATION_ASSET_NOT_FOUND", "Asset link not found.", 404);
        const result = await tx.tblApplicationAssets.deleteMany({ where: { applicationID, tenantID: ctx.tenantID, assetKey } });
        if (!result.count) throw applicationError("APPLICATION_ASSET_NOT_FOUND", "Asset link not found.", 404);
        // Managed copies are owned by this application. Delete an unreleased
        // clone with its link, but retain one that already has immutable
        // versions so history and published releases stay inspectable.
        if (asset.managementMode === "managed" && asset.appPageID) {
          const [versionCount, otherLinks] = await Promise.all([
            tx.tblAssetVersions.count({ where: { tenantID: ctx.tenantID, assetType: "appPage", assetID: asset.appPageID } }),
            tx.tblApplicationAssets.count({ where: { tenantID: ctx.tenantID, appPageID: asset.appPageID } }),
          ]);
          if (versionCount === 0 && otherLinks === 0) {
            await tx.tblAppPages.deleteMany({ where: { tenantID: ctx.tenantID, appPageID: asset.appPageID } });
          }
        }
        await bump(tx, ctx, applicationID, expectedRevision);
        return find(tx, ctx, applicationID);
      });
    },
    async publish({ ctx, applicationID, expectedRevision }) {
      await authorize(ctx, applicationID, "publish");
      return db.$transaction(async tx => {
        const app = await lock(tx, ctx, applicationID, expectedRevision);
        const pageVersions = {};
        const publishDiagnostics = [];
        for (const asset of app.assets.filter(item => item.assetType === "appPage")) {
          await sourceAccess(ctx, "appPage", asset.appPageID);
          let version;
          if (asset.pageVersionID) {
            version = await tx.tblAssetVersions.findFirst({
              where: {
                tenantID: ctx.tenantID,
                assetVersionID: asset.pageVersionID,
                assetType: "appPage",
                assetID: asset.appPageID,
                status: "published",
              },
            });
            if (!version) {
              throw applicationError(
                "APPLICATION_PAGE_VERSION_NOT_FOUND",
                `Selected page version for "${asset.assetKey}" is unavailable. Choose another version or use capture latest at publish.`,
                409
              );
            }
            const inspection = await assetVersions.inspectVersion({
              ctx, tx, assetType: "appPage", assetID: asset.appPageID, version,
            });
            if (inspection.dirty) {
              publishDiagnostics.push({
                severity: "warning",
                code: "APPLICATION_PAGE_VERSION_STALE",
                path: `pages.${asset.assetKey}`,
                message: `Page "${asset.assetKey}" uses version ${version.versionNumber}, but its live editor state has changed since that version was captured. Publish again or create a new page version to capture it.`,
              });
            }
            if (inspection.staleDependencies.length > 0) {
              const labels = [...new Set(inspection.staleDependencies.map(ref => ref.assetType))].sort();
              publishDiagnostics.push({
                severity: "warning",
                code: "APPLICATION_PAGE_DEPENDENCY_STALE",
                path: `pages.${asset.assetKey}.dependencies`,
                message: `Page "${asset.assetKey}" captures older ${labels.join(", ")} versions. The live assets differ from this release; create a new page version to capture them.`,
              });
            }
          } else {
            version = await assetVersions.ensureVersion({
              ctx, tx, assetType: "appPage", assetID: asset.appPageID,
              changeNote: `Application ${app.slug} release capture`,
            });
          }
          pageVersions[asset.assetKey] = version.assetVersionID;
        }
        const compiled = await assembleApplicationRelease({
          db: tx, application: app, definition: app.draft.definition, pageVersions, tenantID: ctx.tenantID,
          extraDiagnostics: publishDiagnostics,
        });
        if (Buffer.byteLength(JSON.stringify(compiled)) > 4 * 1024 * 1024) throw applicationError("APPLICATION_RELEASE_LIMIT", "The assembled manifest exceeds 4 MiB.", 400);
        const latest = await tx.tblApplicationReleases.findFirst({
          where: { applicationID, tenantID: ctx.tenantID },
          orderBy: { releaseNumber: "desc" },
          select: { releaseNumber: true },
        });
        const releaseClient = { ...compiled.clientManifest };
        delete releaseClient.pages;
        delete releaseClient.widgets;
        const release = await tx.tblApplicationReleases.create({
          data: {
            applicationID,
            tenantID: ctx.tenantID,
            releaseNumber: (latest?.releaseNumber || 0) + 1,
            sourceRevision: app.draft.revision,
            schemaVersion: 1,
            contentHash: compiled.contentHash,
            clientManifest: { ...releaseClient, pageVersions },
            serverManifest: {
              schemaVersion: 1,
              applicationID,
              tenantID: ctx.tenantID,
              pageVersions,
            },
          },
        });
        await assetVersions.recordReleaseReferences({ tx, ctx, releaseID: release.releaseID, pageVersionIDs: Object.values(pageVersions) });
        return releaseMetadata(release);
      }, { isolationLevel: "RepeatableRead", timeout: 180000, maxWait: 20000 });
    },
    async listWorkflowRuns({ ctx, applicationID, environment: requestedName, limit = 50 }) {
      await authorize(ctx, applicationID, "read");
      await find(db, ctx, applicationID);
      const name = environmentName(requestedName);
      const take = Math.max(1, Math.min(Number(limit) || 50, 100));
      const rows = await db.tblWorkflowInstances.findMany({
        where: {
          tenantID: ctx.tenantID,
          AND: [
            { executionDefinition: { path: ["application", "applicationID"], equals: applicationID } },
            { executionDefinition: { path: ["application", "environment"], equals: name } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take,
        select: { instanceID: true, workflowID: true, status: true, createdAt: true, updatedAt: true, executionDefinition: true },
      });
      return {
        runs: rows
          .map(row => {
            const provenance = row.executionDefinition?.application || {};
            return {
              instanceID: row.instanceID,
              workflowID: row.workflowID,
              status: row.status,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
              releaseID: provenance.releaseID || null,
              environment: provenance.environment || null,
              routeID: provenance.routeID || null,
              pageAssetKey: provenance.pageAssetKey || null,
              alias: provenance.alias || null,
              callerType: provenance.caller?.type || null,
            };
          })
          .filter(run => run.environment === name),
        environment: name,
      };
    },
    async listReleases({ ctx, applicationID }) {
      await authorize(ctx, applicationID, "read");
      const releases = await db.tblApplicationReleases.findMany({
        where: { applicationID, tenantID: ctx.tenantID },
        orderBy: { releaseNumber: "desc" },
        select: {
          releaseID: true, applicationID: true, releaseNumber: true, sourceRevision: true,
          schemaVersion: true, contentHash: true, createdAt: true,
          clientManifest: true, serverManifest: true,
        },
      });
      return releases.map(releaseMetadata);
    },
    async getEnvironment({ ctx, applicationID, environment: requestedName }) {
      await authorize(ctx, applicationID, "read");
      const name = environmentName(requestedName);
      const environment = await findEnvironment(db, ctx, applicationID, name);
      if (!environment) return { name, configRevision: 0, bindingRevision: 0, bindings: {}, bindingHistory: [], currentRelease: null, deployments: [] };
      const deployments = await db.tblApplicationDeployments.findMany({
        where: { environmentID: environment.environmentID },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { deploymentID: true, releaseID: true, actorID: true, createdAt: true },
      });
      const bindingHistory = await db.tblApplicationEnvironmentBindingRevisions.findMany({
        where: { environmentID: environment.environmentID },
        orderBy: { revision: "desc" },
        take: 20,
        select: { bindingRevisionID: true, revision: true, bindings: true, changeNote: true, createdByUserID: true, createdByApiKeyID: true, createdAt: true },
      });
      return {
        environmentID: environment.environmentID,
        name: environment.name,
        configRevision: environment.configRevision,
        bindingRevision: environment.bindingRevision,
        bindings: environment.bindings || {},
        bindingHistory,
        currentRelease: environment.currentRelease ? releaseMetadata(environment.currentRelease) : null,
        diagnostics: environment.currentRelease?.clientManifest?.diagnostics || [],
        deployments,
      };
    },
    async updateBindings({ ctx, applicationID, environment: requestedName, expectedRevision, bindings, changeNote }) {      await authorize(ctx, applicationID, "deploy");
      const name = environmentName(requestedName);
      return db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${ctx.tenantID + ":" + applicationID + ":bindings:" + name}, 0))`;
        let environment = await findEnvironment(tx, ctx, applicationID, name);
        if (!environment) {
          if (expectedRevision !== undefined && expectedRevision !== null && expectedRevision !== 0) {
            throw applicationError("ENVIRONMENT_BINDING_CONFLICT", "The environment binding revision changed. Reload and try again.", 409);
          }
          environment = await tx.tblApplicationEnvironments.create({
            data: { tenantID: ctx.tenantID, applicationID, name, bindingRevision: 1, bindings: {} },
          });
        } else if (expectedRevision !== undefined && expectedRevision !== null && expectedRevision !== environment.bindingRevision) {
          throw applicationError("ENVIRONMENT_BINDING_CONFLICT", "The environment binding revision changed. Reload and try again.", 409);
        }
        const normalized = await normalizeBindings({ ctx, db: tx, bindings });
        const revision = environment.bindingRevision + 1;
        const updated = await tx.tblApplicationEnvironments.update({
          where: { environmentID: environment.environmentID },
          data: { bindingRevision: revision, bindings: normalized, updatedAt: new Date() },
        });
        await tx.tblApplicationEnvironmentBindingRevisions.create({
          data: {
            environmentID: environment.environmentID,
            revision,
            bindings: normalized,
            changeNote: changeNote || null,
            createdByUserID: ctx.caller?.type === "user" ? ctx.caller.id : null,
            createdByApiKeyID: ctx.caller?.type === "apiKey" ? ctx.caller.id : null,
          },
        });
        return {
          environmentID: environment.environmentID,
          name: updated.name,
          configRevision: updated.configRevision,
          bindingRevision: revision,
          bindings: normalized,
        };
      });
    },
    async getConsumerPolicy({ ctx, applicationID }) {
      await authorize(ctx, applicationID, "read");
      const [config, entries] = await Promise.all([
        db.tblApplicationConsumerConfigs.findUnique({ where: { applicationID } }),
        db.tblApplicationConsumerPolicies.findMany({
          where: { applicationID, tenantID: ctx.tenantID },
          orderBy: [{ createdAt: "asc" }],
          select: { policyID: true, subjectType: true, subjectID: true, routeID: true, actionKey: true, allow: true, createdAt: true },
        }),
      ]);
      return {
        enabled: config?.enabled === true,
        revision: config?.revision || 0,
        entries,
      };
    },
    async updateConsumerPolicy({ ctx, applicationID, expectedRevision = 0, enabled, entries = [] }) {
      await authorize(ctx, applicationID, "update");
      if (!Array.isArray(entries) || entries.length > 200) {
        throw applicationError("INVALID_CONSUMER_POLICY", "Consumer policies support at most 200 entries.", 400);
      }
      const app = await find(db, ctx, applicationID, true);
      const routeIDs = new Set((app.draft?.definition?.routes || []).map(route => route.id));
      const normalized = [];
      const seen = new Set();
      for (const entry of entries) {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
          throw applicationError("INVALID_CONSUMER_POLICY", "Each policy entry must be an object.", 400);
        }
        const { subjectType, subjectID, routeID = null, actionKey = null, allow = true } = entry;
        if (!CONSUMER_SUBJECT_TYPES.has(subjectType) || !uuidPattern.test(String(subjectID || ""))) {
          throw applicationError("INVALID_CONSUMER_POLICY_SUBJECT", "Policy subjects must be user, role, or API-key UUIDs.", 400);
        }
        if (routeID !== null && !routeIDs.has(routeID)) {
          throw applicationError("INVALID_CONSUMER_POLICY_ROUTE", "A policy route must exist in the draft definition.", 409);
        }
        if (actionKey !== null && !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(String(actionKey))) {
          throw applicationError("INVALID_CONSUMER_POLICY_ACTION", "Action keys use letters, numbers, underscores, or hyphens.", 400);
        }
        if (typeof allow !== "boolean") {
          throw applicationError("INVALID_CONSUMER_POLICY_ALLOW", "Policy allow must be a boolean.", 400);
        }
        if (subjectType === "user") {
          const membership = await db.tblUsersTenantsRelationship.findFirst({ where: { userID: subjectID, tenantID: ctx.tenantID }, select: { userID: true } });
          if (!membership) throw applicationError("INVALID_CONSUMER_POLICY_SUBJECT", "A policy user is not a tenant member.", 409);
        } else if (subjectType === "apiKey") {
          const key = await db.tblAPIKeys.findFirst({ where: { apiKeyID: subjectID, tenantID: ctx.tenantID, isDisabled: false }, select: { apiKeyID: true } });
          if (!key) throw applicationError("INVALID_CONSUMER_POLICY_SUBJECT", "A policy API key is missing or disabled.", 409);
        } else {
          const role = await db.tblRoles.findFirst({ where: { roleID: subjectID }, select: { roleID: true, tenantID: true } });
          if (!role || (role.tenantID && role.tenantID !== ctx.tenantID)) {
            throw applicationError("INVALID_CONSUMER_POLICY_SUBJECT", "A policy role is not available in this tenant.", 409);
          }
        }
        const normalizedEntry = { subjectType, subjectID, routeID, actionKey, allow };
        const key = consumerPolicyKey(normalizedEntry);
        if (seen.has(key)) continue;
        seen.add(key);
        normalized.push({ ...normalizedEntry, policyKey: key });
      }
      return db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${ctx.tenantID + ":" + applicationID + ":consumer-policy"}, 0))`;
        const existing = await tx.tblApplicationConsumerConfigs.findUnique({ where: { applicationID } });
        if ((existing?.revision || 0) !== expectedRevision) {
          throw applicationError("CONSUMER_POLICY_CONFLICT", "The consumer policy changed. Reload and try again.", 409);
        }
        const revision = (existing?.revision || 0) + 1;
        await tx.tblApplicationConsumerConfigs.upsert({
          where: { applicationID },
          update: { enabled: enabled === true, revision, updatedAt: new Date() },
          create: { applicationID, tenantID: ctx.tenantID, enabled: enabled === true, revision },
        });
        await tx.tblApplicationConsumerPolicies.deleteMany({ where: { applicationID, tenantID: ctx.tenantID } });
        if (normalized.length) {
          await tx.tblApplicationConsumerPolicies.createMany({
            data: normalized.map(entry => ({
              applicationID,
              tenantID: ctx.tenantID,
              policyKey: entry.policyKey,
              subjectType: entry.subjectType,
              subjectID: entry.subjectID,
              routeID: entry.routeID,
              actionKey: entry.actionKey,
              allow: entry.allow,
            })),
          });
        }
        return { enabled: enabled === true, revision, entries: normalized.map(({ policyKey, ...entry }) => entry) };
      });
    },
    async deploy({ ctx, applicationID, environment: requestedName, releaseID }) {
      await authorize(ctx, applicationID, "deploy");
      const name = environmentName(requestedName);
      return db.$transaction(async tx => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${ctx.tenantID + ":" + applicationID + ":environment:" + name}, 0))`;
        const [app, release] = await Promise.all([
          find(tx, ctx, applicationID, true),
          findRelease(tx, ctx, applicationID, releaseID),
        ]);
        let environment = await findEnvironment(tx, ctx, applicationID, name);
        if (!environment) {
          environment = await tx.tblApplicationEnvironments.create({
            data: { tenantID: ctx.tenantID, applicationID, name },
            include: { currentRelease: true },
          });
        }
        await tx.tblApplicationEnvironments.update({
          where: { environmentID: environment.environmentID },
          data: { currentReleaseID: release.releaseID, configRevision: { increment: 1 }, updatedAt: new Date() },
        });
        const deployment = await tx.tblApplicationDeployments.create({
          data: {
            environmentID: environment.environmentID,
            releaseID: release.releaseID,
            actorID: ctx.caller.type === "user" ? ctx.caller.id : null,
          },
        });
        return {
          environmentID: environment.environmentID,
          name,
          release: releaseMetadata(release),
          deployment: { deploymentID: deployment.deploymentID, createdAt: deployment.createdAt },
          application: { applicationID: app.applicationID, title: app.title },
        };
      }, { timeout: 15000, maxWait: 5000 });
    },
    async runtimeManifest({ ctx, applicationID, environment: requestedName }) {
      await authorize(ctx, applicationID, "execute");
      const name = environmentName(requestedName);
      const { environment, release } = await runtimeRelease(db, ctx, applicationID, name);
      let definition = release.clientManifest.definition;
      const policy = await loadConsumerPolicyState(ctx, applicationID);
      let allowedRouteIDs = null;
      if (policy.enabled) {
        const routes = (definition.routes || []).filter(route =>
          routeGranted(policy.entries, route.id) && !routeDenied(policy.entries, route.id)
        );
        const navigation = (definition.shell.navigation || []).filter(item =>
          routes.some(route => route.id === item.routeID)
        );
        const homeRouteID = routes.some(route => route.id === definition.shell.homeRouteID)
          ? definition.shell.homeRouteID
          : routes.find(route => !route.path.includes(":"))?.id || null;
        definition = {
          ...definition,
          routes,
          shell: { ...definition.shell, navigation, homeRouteID },
        };
        allowedRouteIDs = routes.map(route => route.id);
      }
      return {
        ...release.clientManifest,
        definition,
        // Page configs/widgets are resolved per page by the page manifest
        // endpoint. The application manifest intentionally contains no
        // query/workflow/listener definitions.
        pages: {},
        widgets: {},
        diagnostics: release.clientManifest?.diagnostics || [],
        runtime: {
          releaseID: release.releaseID,
          releaseNumber: release.releaseNumber,
          sourceRevision: release.sourceRevision,
          contentHash: release.contentHash,
          environment: environment.name,
          bindingRevision: environment.bindingRevision,
          actionsEnabled: release.clientManifest?.actionsEnabled === true,
          warningCount: (release.clientManifest?.diagnostics || []).filter(item => item.severity === "warning").length,
          pageVersionCount: Object.keys(release.serverManifest?.pageVersions || {}).length,
          consumerPolicy: {
            enabled: policy.enabled,
            revision: policy.config?.revision || 0,
            allowedRouteIDs,
          },
        },
      };
    },
    async runtimePageManifest({ ctx, applicationID, environment: requestedName, pageAssetKey, routeID: requestedRouteID }) {
      await authorize(ctx, applicationID, "execute");
      const name = environmentName(requestedName);
      const { environment, release } = await runtimeRelease(db, ctx, applicationID, name);
      const routeID = resolveRuntimeRoute(release, pageAssetKey, requestedRouteID).id;
      const policy = await loadConsumerPolicyState(ctx, applicationID);
      if (policy.enabled) {
        const routeAllowed = routeGranted(policy.entries, routeID) && !routeDenied(policy.entries, routeID);
        if (!routeAllowed) throw applicationError("APPLICATION_CONSUMER_ACCESS_DENIED", "This page is not available to the current consumer.", 403);
      }
      const pageVersionID = release.serverManifest?.pageVersions?.[pageAssetKey];
      if (!pageVersionID) throw applicationError("APPLICATION_RESOURCE_NOT_FOUND", "That page is not part of the deployed release.", 404);
      const pageVersion = await loadDeployedPageVersion(ctx, release, pageAssetKey);
      await assetExecuteAccess(ctx, "appPage", pageVersion.assetID);
      const cacheKey = runtimePageCacheKey({
        tenantID: ctx.tenantID,
        releaseID: release.releaseID,
        pageVersionID,
        bindingRevision: environment.bindingRevision,
        policyRevision: policy.config?.revision || 0,
        policyEnabled: policy.enabled,
        routeID,
      });
      const cached = readRuntimePageCache(cacheKey);
      if (cached) return cached;
      const assembled = await assembleApplicationRelease({
        db,
        application: releaseApplication(release),
        definition: release.clientManifest?.definition,
        pageVersions: { [pageAssetKey]: pageVersionID },
        tenantID: ctx.tenantID,
        bindings: environment.bindings || null,
        assets: [...new Set((release.clientManifest?.definition?.routes || []).map(route => route.pageAssetKey))]
          .map(assetKey => ({ assetKey, assetType: "appPage" })),
      });
      const page = assembled?.clientManifest?.pages?.[pageAssetKey];
      if (!page) throw applicationError("APPLICATION_PAGE_VERSION_NOT_FOUND", "The page manifest could not be assembled.", 409);
      const manifest = {
        releaseID: release.releaseID,
        environment: environment.name,
        pageAssetKey,
        pageVersionID,
        page,
        widgets: assembled.clientManifest.widgets || {},
        diagnostics: assembled.clientManifest.diagnostics || [],
        runtime: {
          releaseNumber: release.releaseNumber,
          contentHash: release.contentHash,
          bindingRevision: environment.bindingRevision,
        },
      };
      writeRuntimePageCache(cacheKey, manifest);
      return manifest;
    },
    async runtimeExecute({ ctx, applicationID, environment: requestedName, pageAssetKey, alias, inputValues, releaseID, routeID: requestedRouteID }) {
      await authorize(ctx, applicationID, "execute");
      if (!isSafeApplicationJSON(inputValues || {}) || Buffer.byteLength(JSON.stringify(inputValues || {})) > 32768) {
        throw applicationError("INVALID_INPUT_VALUES", "Input values must be bounded JSON.", 400);
      }
      const name = environmentName(requestedName);
      const {
        authorizedExecuteDataQuery,
        createQueryEngine,
        defaultDatasourceFetcher,
      } = require("../../utils/authorizedProxy");
      const { environment: runtimeEnvironment, release } = await runtimeRelease(db, ctx, applicationID, name);
      if (releaseID && releaseID !== release.releaseID) throw applicationError("APPLICATION_RELEASE_CHANGED", "The deployment changed. Reload the application before starting another operation.", 409);
      const { pageVersion, sourceDescriptor, ref, sourceVersion } = await resolveRuntimeSource(ctx, release, pageAssetKey, alias);
      await assetExecuteAccess(ctx, "appPage", pageVersion.assetID);
      const sourceType = ref.assetType;
      if (sourceType === "listener") throw applicationError("APPLICATION_SOURCE_NOT_EXECUTABLE", "Observe this listener through its event subscription.", 409);
      const routeID = resolveRuntimeRoute(release, pageAssetKey, requestedRouteID).id;
      const consumerPolicy = await loadConsumerPolicyState(ctx, applicationID);
      if (consumerPolicy.enabled) {
        const routeAllowed = routeGranted(consumerPolicy.entries, routeID) && !routeDenied(consumerPolicy.entries, routeID);
        const actionAllowed = actionGranted(consumerPolicy.entries, routeID, alias) && !actionDenied(consumerPolicy.entries, routeID, alias);
        if (!routeAllowed || !actionAllowed) {
          throw applicationError("APPLICATION_CONSUMER_ACCESS_DENIED", "This route or action is not available to the current consumer.", 403);
        }
      }
      if (sourceType === "workflow") {
        await assetExecuteAccess(ctx, "workflow", ref.assetID);
        const workflow = {
          ...(sourceVersion.payload || {}),
          workflowID: ref.assetID,
          assetVersionID: sourceVersion.assetVersionID,
        };
        try {
          const run = await require("../../utils/authorizedProxy").authorizedExecuteWorkflow({
            workflowID: ref.assetID, tenantID: ctx.tenantID, inputValues: inputValues || {}, pinnedWorkflow: workflow,
            executionCtx: { ...ctx, originatingResource: { type: "application", id: applicationID } },
            applicationExecution: { tenantID: ctx.tenantID, applicationID, releaseID: release.releaseID, environment: name, pageAssetKey, alias, routeID,
              pageVersionID: pageVersion.assetVersionID, sourceVersionID: sourceVersion.assetVersionID, workflowVersionID: sourceVersion.assetVersionID,
              caller: { type: ctx.caller.type, id: ctx.caller.id } },
          });
          return { instanceID: run.instanceID };
        } catch (error) {
          if (error.message?.startsWith("Workflow input validation failed")) throw applicationError("INVALID_WORKFLOW_INPUTS", "The workflow inputs are invalid.", 400);
          if (error.startUncertain && error.instanceID) throw applicationError("APPLICATION_WORKFLOW_START_UNKNOWN", "Workflow acceptance could not be confirmed. Observe this run instead of starting it again.", 503, { instanceID: error.instanceID });
          if (error.code === "TEMPORAL_NOT_RUNNING") throw applicationError("APPLICATION_WORKFLOW_UNAVAILABLE", "Workflow execution is temporarily unavailable.", 503);
          if (error.instanceID) throw applicationError("APPLICATION_WORKFLOW_START_FAILED", "The workflow could not be started. Check the run history before retrying.", 502);
          throw mapRuntimeExecutionError(error);
        }
      }
      await assetExecuteAccess(ctx, "dataquery", ref.assetID);
      const queryPayload = sourceVersion.payload || {};
      const datasourceID = runtimeEnvironment.bindings?.[queryPayload.datasourceID] || queryPayload.datasourceID;
      if (!datasourceID) {
        throw applicationError("APPLICATION_DEPENDENCY_NOT_CAPTURED", "The query has no datasource in this release.", 409);
      }
      const pinnedQuery = {
        dataQueryID: ref.assetID,
        tenantID: ctx.tenantID,
        datasourceID,
        datasourceType: queryPayload.datasourceType,
        dataQueryOptions: queryPayload.dataQueryOptions,
      };
      const engine = createQueryEngine({
        queryFetcher: async dataQueryID => (dataQueryID === ref.assetID ? pinnedQuery : null),
        datasourceFetcher: (datasourceId, options) => defaultDatasourceFetcher(datasourceId, options),
      });
      let result;
      try {
        result = await authorizedExecuteDataQuery({
          dataQueryID: ref.assetID,
          engine,
          inputDefinitions: queryPayload.inputDefinitions || [],
          inputValues: inputValues || {},
          executionCtx: {
            ...ctx,
            originatingResource: { type: "application", id: applicationID },
          },
        });
      } catch (error) {
        throw mapRuntimeExecutionError(error);
      }
      let serialized;
      try { serialized = JSON.stringify(result); } catch { serialized = ""; }
      if (serialized.length > 2 * 1024 * 1024) {
        throw applicationError("APPLICATION_RESULT_TOO_LARGE", "The query result exceeds the runtime size limit.", 413);
      }
      return result;
    },
    async runtimeWorkflowStatus(params) {
      const { instance, provenance } = await runtimeRun(params);
      const ids = await runFamily(instance, provenance);
      const requests = await db.tblWorkflowDataCollectionRequests.findMany({ where: { instanceID: { in: ids }, status: { in: ["PENDING", "SUBMITTED"] } }, orderBy: { createdAt: "asc" }, take: 100 });
      // Expose declared workflow outputs and user-facing requests, not raw logs,
      // query SQL, internal context, input values, or the release dependency graph.
      const { stateManager } = require("../workflow/workflowEngine/stateManager");
      const { OUTPUT_DEFAULTS } = require("@jet-admin/workflow-nodes-logic/runtime-contract");
      const fullContext = await stateManager.assembleContext(instance.instanceID);
      const declared = new Set(["output"]);
      for (const node of instance.executionDefinition?.args?.nodes || []) {
        const key = node?.data?.outputVariable || OUTPUT_DEFAULTS[node?.type];
        if (typeof key === "string" && key !== "input" && !["__proto__", "prototype", "constructor"].includes(key) && /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(key)) declared.add(key);
      }
      const contextData = {};
      for (const key of declared) if (fullContext?.[key] !== undefined) contextData[key] = fullContext[key];
      if (contextData.output === undefined) contextData.output = instance.workflowOutput ?? null;
      const result = { instanceID: instance.instanceID, status: instance.status, output: instance.workflowOutput ?? null,
        contextData,
        pendingDataCollectionRequests: requests.map(request => ({ collectionRequestID: request.collectionRequestID, collectionType: request.collectionType, status: request.status, expiresAt: request.expiresAt, collectionConfig: request.collectionConfig })),
      };
      if (Buffer.byteLength(JSON.stringify(result)) > 2 * 1024 * 1024) throw applicationError("APPLICATION_RESULT_TOO_LARGE", "The workflow result exceeds the runtime size limit.", 413);
      return result;
    },
    async runtimeWorkflowCancel(params) {
      const { instance } = await runtimeRun(params);
      if (["COMPLETED", "FAILED", "CANCELLED", "STOPPED"].includes(instance.status)) return { cancellationRequested: false, status: instance.status };
      return require("../workflow/temporal/service").cancelWorkflow({ instanceID: instance.instanceID });
    },
    async runtimeWorkflowSubmit(params) {
      const { instance, provenance } = await runtimeRun(params);
      if (!isSafeApplicationJSON(params.submittedData || {}) || Buffer.byteLength(JSON.stringify(params.submittedData || {})) > 32768) throw applicationError("INVALID_INPUT_VALUES", "Submitted values must be bounded JSON.", 400);
      const ids = await runFamily(instance, provenance);
      const request = await db.tblWorkflowDataCollectionRequests.findFirst({ where: { collectionRequestID: params.collectionRequestID, instanceID: { in: ids } }, select: { collectionRequestID: true } });
      if (!request) throw applicationError("APPLICATION_REQUEST_NOT_FOUND", "That input request does not belong to this run.", 404);
      try { return await require("../workflow/dataCollection/dataCollection.service").dataCollectionService.submitCollectionData({ collectionRequestID: request.collectionRequestID, submittedData: params.submittedData, tenantID: params.ctx.tenantID }); }
      catch (error) {
        if (/Invalid submitted data|comment is required/.test(error.message)) throw applicationError("INVALID_WORKFLOW_SUBMISSION", "The submitted values do not satisfy this request.", 400);
        throw error;
      }
    },
    async runtimeListenerEvents({ ctx, applicationID, environment: requestedName, pageAssetKey, alias, releaseID, cursor, routeID: requestedRouteID }) {
      await authorize(ctx, applicationID, "execute");
      const name = environmentName(requestedName);
      const { environment: runtimeEnvironment, release } = await runtimeRelease(db, ctx, applicationID, name);
      if (release.releaseID !== releaseID) throw applicationError("APPLICATION_RELEASE_CHANGED", "The deployment changed. Reload the application before subscribing.", 409);
      const { pageVersion, sourceDescriptor, ref, sourceVersion } = await resolveRuntimeSource(ctx, release, pageAssetKey, alias);
      if (ref.assetType !== "listener") throw applicationError("APPLICATION_RESOURCE_NOT_FOUND", "That listener is not part of the deployed release.", 404);
      await assetExecuteAccess(ctx, "appPage", pageVersion.assetID);
      await assetExecuteAccess(ctx, "listener", ref.assetID, "observe");
      const routeID = resolveRuntimeRoute(release, pageAssetKey, requestedRouteID).id;
      const consumerPolicy = await loadConsumerPolicyState(ctx, applicationID);
      if (consumerPolicy.enabled) {
        const routeAllowed = routeGranted(consumerPolicy.entries, routeID) && !routeDenied(consumerPolicy.entries, routeID);
        const actionAllowed = actionGranted(consumerPolicy.entries, routeID, alias) && !actionDenied(consumerPolicy.entries, routeID, alias);
        if (!routeAllowed || !actionAllowed) throw applicationError("APPLICATION_CONSUMER_ACCESS_DENIED", "This listener is not available to the current consumer.", 403);
      }
      const source = {
        type: "listener",
        listenerID: ref.assetID,
        listenerVersionID: sourceVersion.assetVersionID,
        bufferName: sourceDescriptor.bufferName || "default",
        definitionHash: sourceVersion.payload?.definitionHash,
        actions: sourceVersion.payload?.actions || [],
        mode: sourceVersion.payload?.actions?.find(action => action.actionType === "push_to_app_page")?.actionConfig?.mode || "replace",
        limit: Math.min(1000, Math.max(1, Number(sourceVersion.payload?.actions?.find(action => action.actionType === "push_to_app_page")?.actionConfig?.maxArrayLength) || 1000)),
      };
      return require("./application.listenerRuntime").readApplicationListenerEvents({ db, ctx, applicationID, environment: name, release, pageAssetKey, alias, source, cursor });
    },
    async archive({ ctx, applicationID, expectedRevision }) {
      await authorize(ctx, applicationID, "archive");
      return db.$transaction(async tx => {
        await lock(tx, ctx, applicationID, expectedRevision);
        await bump(tx, ctx, applicationID, expectedRevision);
        await tx.tblApplications.updateMany({ where: { applicationID, tenantID: ctx.tenantID }, data: { status: "ARCHIVED", updatedAt: new Date() } });
        return find(tx, ctx, applicationID);
      });
    },
    async validate({ ctx, applicationID }) {
      await authorize(ctx, applicationID, "read");
      const app = await find(db, ctx, applicationID);
      const result = validateApplicationDefinition(app.draft.definition, app.assets);
      return {
        ...result,
        revision: app.draft.revision,
        productionReady: false,
        capabilities: {
          composition: true,
          release: true,
          runtimeExecution: true,
          workflows: true,
          bufferedListeners: true,
          managedAdoption: false,
        },
      };
    },
    async preview({ ctx, applicationID }) {
      await authorize(ctx, applicationID, "update");
      // A repeatable snapshot freezes this preview response, not a production release.
      return db.$transaction(async tx => {
        const app = await find(tx, ctx, applicationID, true);
        const result = validateApplicationDefinition(app.draft.definition, app.assets);
        if (!result.valid) throw applicationError("INVALID_APPLICATION_DEFINITION", "The draft is invalid.", 400, { diagnostics: result.diagnostics });
        const pages = {};
        const widgets = {};
        const diagnostics = [];
        for (const asset of app.assets.filter(item => item.assetType === "appPage")) {
          await sourceAccess(ctx, "appPage", asset.appPageID);
          const page = await tx.tblAppPages.findFirst({ where: { tenantID: ctx.tenantID, appPageID: asset.appPageID }, select: { appPageID: true, appPageTitle: true, appPageConfig: true } });
          if (!page) throw applicationError("APPLICATION_ASSET_NOT_FOUND", "A linked page no longer exists.", 409);
          if (!isSafeApplicationJSON(page.appPageConfig || {})) throw applicationError("INVALID_PAGE_CONFIG", "A linked page contains unsupported JSON.");
          const ids = collectPageWidgetIDs(page.appPageConfig);
          if (ids.length > 500) throw applicationError("APPLICATION_PREVIEW_LIMIT", "A page exceeds the 500-widget preview limit.");
          for (const widgetID of ids) {
            if (widgets[widgetID]) continue;
            if (Object.keys(widgets).length >= 500) throw applicationError("APPLICATION_PREVIEW_LIMIT", "An application exceeds the 500-widget preview limit.");
            await sourceAccess(ctx, "widget", widgetID);
            const widget = await tx.tblWidgets.findFirst({ where: { tenantID: ctx.tenantID, widgetID }, select: { widgetID: true, widgetTitle: true, widgetType: true, widgetConfig: true } });
            if (!widget) throw applicationError("APPLICATION_ASSET_NOT_FOUND", "A page references a missing widget.", 409);
            if (!PREVIEW_WIDGET_TYPES.has(widget.widgetType)) {
              diagnostics.push({ severity: "warning", code: "PREVIEW_WIDGET_DISABLED", path: `widgets.${widgetID}`, message: `${widget.widgetType} is disabled in composition preview.` });
              // No untrusted HTML, remote URL, or executable config reaches the browser.
              widgets[widgetID] = { widgetID, widgetTitle: widget.widgetTitle, widgetType: "alert", widgetConfig: { title: "Preview unavailable", message: "This widget is not supported in composition-only preview.", variant: "info" } };
            } else if (!isSafeApplicationJSON(widget.widgetConfig)) {
              throw applicationError("INVALID_WIDGET_CONFIG", "A widget contains unsupported JSON.");
            } else {
              widgets[widgetID] = { ...widget, widgetConfig: { ...widget.widgetConfig, events: {} }, refreshInterval: null };
            }
          }
          pages[asset.assetKey] = { ...page, appPageConfig: { ...page.appPageConfig, dataSources: [] } };
        }
        const artifact = { schemaVersion: 1, mode: "composition", executionEnabled: false, applicationID, applicationTitle: app.title, applicationSlug: app.slug, tenantID: ctx.tenantID, revision: app.draft.revision, definition: result.definition, pages, widgets, diagnostics };
        const json = JSON.stringify(artifact);
        if (Buffer.byteLength(json) > 2 * 1024 * 1024) throw applicationError("APPLICATION_PREVIEW_LIMIT", "Preview exceeds the 2 MiB limit.");
        return { ...artifact, previewID: createHash("sha256").update(json).digest("hex") };
      }, { isolationLevel: "RepeatableRead", timeout: 15000 });
    },
  };
  return service;
}

const { prisma } = require("../../config/prisma.config");
const { enforce, grantCreatorAccess } = require("../../config/casbin.config");
module.exports = { createApplicationService, applicationService: createApplicationService({ db: prisma, enforce, grantCreatorAccess }) };
