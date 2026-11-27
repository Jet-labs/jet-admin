jest.mock('../../../config/prisma.config', () => ({ prisma: {} }));
jest.mock('../../../config/casbin.config', () => ({ enforce: jest.fn(), grantCreatorAccess: jest.fn() }));
jest.mock('../../../utils/authorizedProxy', () => ({
  authorizedExecuteDataQuery: jest.fn(),
  authorizedExecuteWorkflow: jest.fn(),
  createQueryEngine: jest.fn(() => ({})),
  defaultDatasourceFetcher: jest.fn(),
}));
jest.mock('../../../modules/workflow/temporal/service', () => ({ cancelWorkflow: jest.fn().mockResolvedValue({ cancellationRequested: true }) }));
jest.mock('../../../modules/workflow/dataCollection/dataCollection.service', () => ({ dataCollectionService: { submitCollectionData: jest.fn().mockResolvedValue({ success: true }) } }));
jest.mock('../../../modules/workflow/workflowEngine/stateManager', () => ({
  stateManager: { assembleContext: jest.fn().mockResolvedValue({ output: { approved: true }, approved: true, input: { secret: 'SECRET' }, privateValue: 'SECRET' }) },
}));
const { authorizedExecuteDataQuery, authorizedExecuteWorkflow, createQueryEngine } = require('../../../utils/authorizedProxy');
const { createApplicationService } = require('../../../modules/application/application.service');
const { createApplicationDefinition } = require('@jet-admin/application-contracts');
const ctx = { tenantID: 'tenant-a', caller: { type: 'user', id: 'user-a' } };
const tenantID = ctx.tenantID;
const widgetID = '11111111-1111-4111-8111-111111111111';
const pageVersionID = '22222222-2222-4222-8222-222222222222';
const queryVersionID = '33333333-3333-4333-8333-333333333333';
const workflowVersionID = '44444444-4444-4444-8444-444444444444';
const listenerVersionID = '55555555-5555-4555-8555-555555555555';
const queryID = '66666666-6666-4666-8666-666666666666';
const workflowID = '77777777-7777-4777-8777-777777777777';
const listenerID = '88888888-8888-4888-8888-888888888888';
beforeEach(() => {
  authorizedExecuteDataQuery.mockReset();
  authorizedExecuteWorkflow.mockReset();
  createQueryEngine.mockClear();
});

function fixture() {
  const app = { applicationID: 'app-a', tenantID: 'tenant-a', status: 'DRAFT', draft: { revision: 2, definition: createApplicationDefinition() }, assets: [] };
  const db = {
    tblUsersTenantsRelationship: { findFirst: jest.fn().mockResolvedValue({ userID: 'user-a' }) },
    tblAPIKeys: { findFirst: jest.fn().mockResolvedValue(null) },
    tblApplications: { findFirst: jest.fn().mockResolvedValue(app), findMany: jest.fn().mockResolvedValue([]), updateMany: jest.fn() },
    tblApplicationDrafts: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    tblApplicationAssets: { create: jest.fn(), findFirst: jest.fn(), count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
    tblAppPages: { findFirst: jest.fn().mockResolvedValue({ appPageID: 'page-a', appPageTitle: 'Source page', appPageDescription: null, appPageConfig: { widgets: [`widget_${widgetID}_1`], dataSources: [{ type: 'workflow', workflowID: 'unsafe' }] } }), create: jest.fn(async ({ data }) => ({ ...data, appPageID: 'managed-page' })), deleteMany: jest.fn() },
    tblAssetVersions: { count: jest.fn().mockResolvedValue(0) },
    tblApplicationEnvironments: { findFirst: jest.fn().mockResolvedValue(null), update: jest.fn(), create: jest.fn() },
    tblApplicationEnvironmentBindingRevisions: { findMany: jest.fn().mockResolvedValue([]) },
    tblDatasources: { findMany: jest.fn().mockResolvedValue([]) },
    tblApplicationConsumerConfigs: { findUnique: jest.fn().mockResolvedValue(null), upsert: jest.fn() },
    tblApplicationConsumerPolicies: { findMany: jest.fn().mockResolvedValue([]), deleteMany: jest.fn(), createMany: jest.fn() },
    tblAPIKeyRoleMappings: { findMany: jest.fn().mockResolvedValue([]) },
    tblUserTenantRoleMappings: { findMany: jest.fn().mockResolvedValue([]) },
    tblRoles: { findFirst: jest.fn() },
    tblApplicationDeployments: { findMany: jest.fn().mockResolvedValue([]) },
    tblApplicationReleases: { findFirst: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
    tblWorkflowInstances: { findFirst: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
    tblWorkflowDataCollectionRequests: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn() },
    tblWidgets: { findFirst: jest.fn().mockResolvedValue({ widgetID, widgetType: 'button', widgetConfig: { text: 'Save', events: { onLoad: [{ actionType: 'TRIGGER_QUERY' }] } } }) },
    $executeRaw: jest.fn(),
  };
  db.$transaction = jest.fn(callback => callback(db));
  const enforce = jest.fn().mockResolvedValue(true);
  return { app, db, enforce, service: createApplicationService({ db, enforce, grantCreatorAccess: jest.fn() }) };
}

function deployedRelease(options = {}) {
  const sourceType = options.type || "query";
  const sourceVersionID = sourceType === "workflow" ? workflowVersionID
    : sourceType === "listener" ? listenerVersionID : queryVersionID;
  const sourceID = sourceType === "workflow" ? (options.workflowID || workflowID)
    : sourceType === "listener" ? listenerID : "query-a";
  const pageVersion = {
    assetVersionID: pageVersionID, tenantID, assetType: "appPage", assetID: "page-a", status: "published",
    payload: {
      appPageID: "page-a", appPageTitle: "Page",
      appPageConfig: {
        widgets: [], variables: [],
        dataSources: [{ alias: "orders", type: sourceType, ...(sourceType === "workflow" ? { workflowID: sourceID } : sourceType === "listener" ? { listenerID: sourceID } : { queryID: sourceID }) }],
      },
      sourceVersions: { orders: { assetType: sourceType, assetID: sourceID, assetVersionID: sourceVersionID } },
      widgetVersions: {},
    },
  };
  const queryVersion = {
    assetVersionID: queryVersionID, tenantID, assetType: "query", assetID: "query-a", status: "published",
    payload: { dataQueryID: "query-a", datasourceID: "ds-a", datasourceType: "postgresql", dataQueryOptions: { sql: "select 1" }, inputDefinitions: [], ...options },
  };
  const workflowVersion = {
    assetVersionID: workflowVersionID, tenantID, assetType: "workflow", assetID: options.workflowID || workflowID, status: "published",
    payload: { workflowID: options.workflowID || workflowID, tenantID, workflowOptions: {}, nodes: [{ id: "s", type: "start", data: {} }], edges: [], queryVersions: {}, childWorkflowVersions: {} },
  };
  const listenerVersion = {
    assetVersionID: listenerVersionID, tenantID, assetType: "listener", assetID: listenerID, status: "published",
    payload: { listenerID, actions: [], definitionHash: "hash" },
  };
  const release = {
    releaseID: "release-a", releaseNumber: 2, sourceRevision: 2, contentHash: "a".repeat(64),
    clientManifest: {
      mode: "runtime", executionEnabled: true, actionsEnabled: true,
      applicationTitle: "Orders", definition: { ...createApplicationDefinition(), routes: [{ id: "route-a", path: "/orders", pageAssetKey: "page-a" }] }, pages: {}, widgets: {},
      diagnostics: [{ severity: "warning", code: "ACTION_TYPE_UNAVAILABLE", path: "widgets.w.events.onLoad", message: "omitted" }],
    },
    serverManifest: { schemaVersion: 1, applicationID: "app-a", tenantID, pageVersions: { "page-a": pageVersionID } },
  };
  return { release, pageVersion, queryVersion, workflowVersion, listenerVersion };
}

function deployFixture(options) {
  const result = fixture();
  const deployed = deployedRelease(options);
  result.db.tblAssetVersions.findFirst = jest.fn(async ({ where }) => {
    if (where.assetVersionID === pageVersionID) return deployed.pageVersion;
    if (where.assetVersionID === queryVersionID) return deployed.queryVersion;
    if (where.assetVersionID === workflowVersionID) return deployed.workflowVersion;
    if (where.assetVersionID === listenerVersionID) return deployed.listenerVersion;
    return null;
  });
  result.db.tblAssetVersions.findMany = jest.fn(async () => [deployed.pageVersion, deployed.queryVersion, deployed.workflowVersion, deployed.listenerVersion]);
  result.db.tblApplicationEnvironments.findFirst.mockResolvedValue({ environmentID: "env-a", name: "production", currentRelease: deployed.release });
  result.db.tblApplicationReleases.findFirst.mockResolvedValue(deployed.release);
  return { ...result, ...deployed, release: deployed.release };
}

const execution = { ctx, applicationID: 'app-a', environment: 'production', pageAssetKey: 'page-a', alias: 'orders', inputValues: {} };

describe('Application service boundary', () => {
  it('requires tenant membership even if Casbin grants access', async () => {
    const { db, service, enforce } = fixture(); db.tblUsersTenantsRelationship.findFirst.mockResolvedValue(null);
    await expect(service.get({ ctx, applicationID: 'app-a' })).rejects.toMatchObject({ code: 'PERMISSION_DENIED', statusCode: 403 });
    expect(enforce).not.toHaveBeenCalled(); expect(db.tblApplications.findFirst).not.toHaveBeenCalled();
  });
  it('rejects system callers and API keys from other tenants', async () => {
    const { service, db } = fixture();
    await expect(service.get({ ctx: { ...ctx, caller: { type: 'system', id: 'cron' } }, applicationID: 'app-a' })).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
    await expect(service.get({ ctx: { ...ctx, caller: { type: 'apiKey', id: 'key' } }, applicationID: 'app-a' })).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
    expect(db.tblAPIKeys.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { apiKeyID: 'key', tenantID: ctx.tenantID, isDisabled: false } }));
  });
  it('scopes every application lookup to the verified tenant', async () => {
    const { db, service } = fixture(); db.tblApplications.findFirst.mockResolvedValue(null);
    await expect(service.get({ ctx, applicationID: 'foreign-app' })).rejects.toMatchObject({ statusCode: 404 });
    expect(db.tblApplications.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantID: ctx.tenantID, applicationID: 'foreign-app' } }));
  });
  it('filters collection metadata and counts by per-application read access', async () => {
    const { db, service, enforce } = fixture();
    db.tblApplications.findMany.mockResolvedValue([{ applicationID: 'visible' }, { applicationID: 'hidden' }]);
    enforce.mockImplementation((_subject, _tenant, resource) => Promise.resolve(resource !== 'application:hidden'));
    expect(await service.list({ ctx })).toMatchObject({ applications: [{ applicationID: 'visible' }], totalCount: 1 });
  });
  it('rejects stale writes before making any changes', async () => {
    const { db, service } = fixture();
    await expect(service.saveDraft({ ctx, applicationID: 'app-a', expectedRevision: 1, definition: createApplicationDefinition() })).rejects.toMatchObject({ code: 'APPLICATION_REVISION_CONFLICT', statusCode: 409 });
    expect(db.tblApplicationDrafts.updateMany).not.toHaveBeenCalled();
  });
  it('advances revisions with a tenant-scoped compare-and-swap', async () => {
    const { db, service } = fixture();
    await service.saveDraft({ ctx, applicationID: 'app-a', expectedRevision: 2, definition: createApplicationDefinition() });
    expect(db.tblApplicationDrafts.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantID: ctx.tenantID, applicationID: 'app-a', revision: 2 }, data: expect.objectContaining({ revision: { increment: 1 } }) }));
  });
  it('checks source permissions and existence in the same tenant before linking', async () => {
    const { db, service, enforce } = fixture(); db.tblAppPages.findFirst.mockResolvedValue(null);
    await expect(service.linkPage({ ctx, applicationID: 'app-a', expectedRevision: 2, appPageID: 'foreign-page', assetKey: 'page' })).rejects.toMatchObject({ statusCode: 404 });
    expect(enforce).toHaveBeenCalledWith('user-a', 'tenant-a', 'appPage:foreign-page', 'read');
    expect(db.tblApplicationAssets.create).not.toHaveBeenCalled();
  });
  it('creates a managed page copy without changing the shared source page', async () => {
    const { db, service, enforce } = fixture();
    await service.linkPage({
      ctx, applicationID: 'app-a', expectedRevision: 2, appPageID: 'page-a', assetKey: 'managed', managementMode: 'managed',
    });
    expect(enforce).toHaveBeenCalledWith('user-a', 'tenant-a', 'appPage:*', 'create');
    expect(db.tblAppPages.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tenantID: 'tenant-a', appPageTitle: 'Source page · managed' }),
    }));
    expect(db.tblApplicationAssets.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ assetKey: 'managed', appPageID: 'managed-page', managementMode: 'managed' }),
    }));
  });

  it('deletes an unreleased managed copy on unlink but retains a versioned one', async () => {
    const f = fixture();
    f.db.tblApplicationAssets.findFirst.mockResolvedValue({ managementMode: 'managed', appPageID: 'managed-page' });
    await f.service.unlinkAsset({ ctx, applicationID: 'app-a', expectedRevision: 2, assetKey: 'managed' });
    expect(f.db.tblAppPages.deleteMany).toHaveBeenCalledWith({
      where: { tenantID: 'tenant-a', appPageID: 'managed-page' },
    });

    f.db.tblAppPages.deleteMany.mockClear();
    f.db.tblAssetVersions.count.mockResolvedValue(1);
    await f.service.unlinkAsset({ ctx, applicationID: 'app-a', expectedRevision: 2, assetKey: 'managed' });
    expect(f.db.tblAppPages.deleteMany).not.toHaveBeenCalled();
  });

  it('never deletes a referenced page on unlink', async () => {
    const f = fixture();
    f.db.tblApplicationAssets.findFirst.mockResolvedValue({ managementMode: 'referenced', appPageID: 'page-a' });
    await f.service.unlinkAsset({ ctx, applicationID: 'app-a', expectedRevision: 2, assetKey: 'shared' });
    expect(f.db.tblAppPages.deleteMany).not.toHaveBeenCalled();
  });

  it('cannot unlink an in-use page or mutate an archived app', async () => {
    const { app, service, db } = fixture(); app.draft.definition.routes.push({ pageAssetKey: 'page' });
    await expect(service.unlinkAsset({ ctx, applicationID: 'app-a', expectedRevision: 2, assetKey: 'page' })).rejects.toMatchObject({ code: 'APPLICATION_ASSET_IN_USE' });
    app.status = 'ARCHIVED';
    await expect(service.saveDraft({ ctx, applicationID: 'app-a', expectedRevision: 2, definition: createApplicationDefinition() })).rejects.toMatchObject({ code: 'APPLICATION_ARCHIVED' });
    expect(db.tblApplicationAssets.deleteMany).not.toHaveBeenCalled();
  });
  it('returns a bounded composition snapshot, removes automatic execution and checks widget rights', async () => {
    const { app, service, enforce } = fixture(); app.assets.push({ assetType: 'appPage', assetKey: 'page', appPageID: 'page-a' });
    const preview = await service.preview({ ctx, applicationID: 'app-a' });
    expect(preview.executionEnabled).toBe(false); expect(preview.pages.page.appPageConfig.dataSources).toEqual([]);
    expect(preview.widgets[widgetID].widgetConfig.events).toEqual({});
    expect(preview.previewID).toMatch(/^[a-f0-9]{64}$/);
    expect(enforce).toHaveBeenCalledWith(ctx.caller.id, ctx.tenantID, `widget:${widgetID}`, 'read');
  });
  it('does not send executable iframe configuration to the preview client', async () => {
    const { app, db, service } = fixture(); app.assets.push({ assetType: 'appPage', assetKey: 'page', appPageID: 'page-a' });
    db.tblWidgets.findFirst.mockResolvedValue({ widgetID, widgetType: 'iframe', widgetConfig: { srcDoc: '<script>steal()</script>' } });
    const preview = await service.preview({ ctx, applicationID: 'app-a' });
    expect(preview.widgets[widgetID].widgetType).toBe('alert');
    expect(JSON.stringify(preview)).not.toContain('steal');
  });
  it('returns the deployed pinned client manifest without read/write claims', async () => {
    const { service } = deployFixture();
    const manifest = await service.runtimeManifest({ ctx, applicationID: 'app-a', environment: 'production' });
    expect(manifest.runtime).toMatchObject({ releaseID: 'release-a', releaseNumber: 2, actionsEnabled: true });
    expect(manifest.runtime).not.toHaveProperty('readOnly');
    expect(manifest.runtime).not.toHaveProperty('mutationsEnabled');
    expect(manifest.serverManifest).toBeUndefined();
  });
  it('denies runtime manifest and execution access when the application is archived', async () => {
    const { app, service } = deployFixture(); app.status = 'ARCHIVED';
    await expect(service.runtimeManifest({ ctx, applicationID: 'app-a', environment: 'production' }))
      .rejects.toMatchObject({ code: 'APPLICATION_ARCHIVED', statusCode: 409 });
    await expect(service.runtimeExecute(execution)).rejects.toMatchObject({ code: 'APPLICATION_ARCHIVED' });
    expect(authorizedExecuteDataQuery).not.toHaveBeenCalled();
  });
  it('rejects an alias that is not in the deployed release', async () => {
    const { service } = deployFixture();
    await expect(service.runtimeExecute({ ...execution, alias: 'missing' }))
      .rejects.toMatchObject({ code: 'APPLICATION_RESOURCE_NOT_FOUND', statusCode: 404 });
    expect(authorizedExecuteDataQuery).not.toHaveBeenCalled();
  });
  it.each(['select 1', 'update orders set status = $1', 'insert into orders (status) values ($1)'])(
    'executes the pinned operation without a page classification: %s', async sql => {
      const { service, enforce } = deployFixture({ dataQueryOptions: { sql } });
      authorizedExecuteDataQuery.mockResolvedValue({ data: [{ value: 1 }] });
      expect(await service.runtimeExecute(execution)).toEqual({ data: [{ value: 1 }] });
      expect(enforce).toHaveBeenCalledWith('user-a', 'tenant-a', 'application:app-a', 'execute');
      expect(authorizedExecuteDataQuery).toHaveBeenCalledWith(expect.objectContaining({
        dataQueryID: 'query-a', inputDefinitions: [], inputValues: {},
        executionCtx: expect.objectContaining({ originatingResource: { type: 'application', id: 'app-a' } }),
      }));
      const engineConfig = createQueryEngine.mock.calls[0][0];
      expect(await engineConfig.queryFetcher('query-a')).toMatchObject({ tenantID: 'tenant-a', dataQueryOptions: { sql } });
      expect(await engineConfig.queryFetcher('other-query')).toBeNull();
    }
  );
  it('ignores legacy policy labels without modifying published release records', async () => {
    const { service, release } = deployFixture({ effect: 'write', idempotency: 'required' });
    const snapshot = JSON.stringify(release);
    authorizedExecuteDataQuery.mockResolvedValue({ rowCount: 1 });
    await expect(service.runtimeExecute(execution)).resolves.toEqual({ rowCount: 1 });
    expect(JSON.stringify(release)).toBe(snapshot);
  });
  it('denies execution before invoking the query proxy when permission is missing', async () => {
    const { service, enforce } = deployFixture(); enforce.mockResolvedValue(false);
    await expect(service.runtimeExecute(execution)).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
    expect(authorizedExecuteDataQuery).not.toHaveBeenCalled();
  });
  it('rejects oversized inputs before invoking the query proxy', async () => {
    const { service } = deployFixture();
    await expect(service.runtimeExecute({ ...execution, inputValues: { value: 'a'.repeat(32769) } }))
      .rejects.toMatchObject({ code: 'INVALID_INPUT_VALUES' });
    expect(authorizedExecuteDataQuery).not.toHaveBeenCalled();
  });
  it('maps input and authorization failures without leaking query definitions', async () => {
    const { service } = deployFixture();
    authorizedExecuteDataQuery.mockRejectedValue(new Error('Query input validation failed: private details'));
    await expect(service.runtimeExecute(execution)).rejects.toMatchObject({ code: 'INVALID_QUERY_INPUTS', message: 'The query inputs are invalid.' });
    authorizedExecuteDataQuery.mockRejectedValue(new Error('Authorization denied: private details'));
    await expect(service.runtimeExecute(execution)).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
  });
  it('propagates connector failures without recording retryability or replaying', async () => {
    const { service } = deployFixture();
    const failure = new Error('connector timed out'); authorizedExecuteDataQuery.mockRejectedValue(failure);
    await expect(service.runtimeExecute(execution)).rejects.toBe(failure);
    expect(authorizedExecuteDataQuery).toHaveBeenCalledTimes(1);
  });
  it('reports release metadata and warnings without a separate write action catalog', async () => {
    const { service } = deployFixture();
    const environment = await service.getEnvironment({ ctx, applicationID: 'app-a', environment: 'production' });
    expect(environment.currentRelease).toMatchObject({ releaseNumber: 2, warningCount: 1 });
    expect(environment.currentRelease).not.toHaveProperty('mutationsEnabled');
    expect(environment.currentRelease).not.toHaveProperty('actionCount');
    expect(environment).not.toHaveProperty('actions');
    expect(environment.diagnostics).toHaveLength(1);
  });
  it('lists immutable releases with page-version and warning summaries', async () => {
    const { db, service } = fixture();
    const { release } = deployedRelease();
    release.serverManifest.pageVersions = { 'page-a': 'page-version-1' };
    db.tblApplicationReleases.findMany.mockResolvedValue([release]);
    const releases = await service.listReleases({ ctx, applicationID: 'app-a' });
    expect(releases).toHaveLength(1);
    expect(releases[0]).toMatchObject({
      releaseID: 'release-a', releaseNumber: 2, pageVersionCount: 1, warningCount: 1,
      pageVersions: { 'page-a': 'page-version-1' },
    });
    expect(releases[0]).not.toHaveProperty('clientManifest');
  });
  it('pins an exact page version and rejects a version from another page', async () => {
    const f = fixture();
    const asset = { applicationAssetID: 'asset-a', assetKey: 'page', assetType: 'appPage', appPageID: 'page-a', pageVersionID: null };
    f.db.tblApplications.findFirst.mockResolvedValue({ ...f.app, assets: [asset] });
    f.db.tblAssetVersions = { findFirst: jest.fn().mockResolvedValue({ assetVersionID: 'pv1' }) };
    f.db.tblApplicationAssets.update = jest.fn().mockResolvedValue({});
    const result = await f.service.selectPageVersion({
      ctx, applicationID: 'app-a', expectedRevision: 2, assetKey: 'page', pageVersionID: 'pv1',
    });
    expect(f.db.tblAssetVersions.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ tenantID: 'tenant-a', assetVersionID: 'pv1', assetType: 'appPage', assetID: 'page-a', status: 'published' }),
    }));
    expect(f.db.tblApplicationAssets.update).toHaveBeenCalledWith({
      where: { applicationAssetID: 'asset-a' },
      data: { pageVersionID: 'pv1' },
    });
    expect(result).toBeDefined();
    f.db.tblAssetVersions.findFirst.mockResolvedValue(null);
    await expect(f.service.selectPageVersion({
      ctx, applicationID: 'app-a', expectedRevision: 2, assetKey: 'page', pageVersionID: 'pv-other',
    })).rejects.toMatchObject({ code: 'APPLICATION_PAGE_VERSION_NOT_FOUND' });
  });
  it('updates environment bindings with revision checks and type validation', async () => {
    const sourceID = '11111111-1111-4111-8111-111111111111';
    const targetID = '22222222-2222-4222-8222-222222222222';
    const { db, service, release } = deployFixture();
    db.tblApplicationEnvironments.findFirst.mockResolvedValue({
      environmentID: 'env-a', name: 'production', bindingRevision: 2,
      bindings: {}, currentRelease: release,
    });
    db.tblApplicationEnvironments.update.mockResolvedValue({
      environmentID: 'env-a', name: 'production', configRevision: 4, bindingRevision: 3,
    });
    db.tblApplicationEnvironmentBindingRevisions.create = jest.fn().mockResolvedValue({});
    db.tblDatasources.findMany.mockResolvedValue([
      { datasourceID: sourceID, datasourceType: 'postgresql', isDisabled: false },
      { datasourceID: targetID, datasourceType: 'postgresql', isDisabled: false },
    ]);
    const result = await service.updateBindings({
      ctx, applicationID: 'app-a', environment: 'production',
      expectedRevision: 2, bindings: { [sourceID]: targetID }, changeNote: 'Rotate connection',
    });
    expect(result).toMatchObject({ bindingRevision: 3, bindings: { [sourceID]: targetID } });
    expect(db.tblApplicationEnvironments.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { environmentID: 'env-a' },
      data: expect.objectContaining({ bindingRevision: 3, bindings: { [sourceID]: targetID } }),
    }));
    expect(db.tblApplicationEnvironmentBindingRevisions.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ revision: 3, changeNote: 'Rotate connection' }),
    }));

    await expect(service.updateBindings({
      ctx, applicationID: 'app-a', environment: 'production',
      expectedRevision: 1, bindings: {}, changeNote: 'stale',
    })).rejects.toMatchObject({ code: 'ENVIRONMENT_BINDING_CONFLICT' });

    db.tblDatasources.findMany.mockResolvedValue([
      { datasourceID: sourceID, datasourceType: 'postgresql', isDisabled: false },
      { datasourceID: targetID, datasourceType: 'mysql', isDisabled: false },
    ]);
    await expect(service.updateBindings({
      ctx, applicationID: 'app-a', environment: 'production',
      expectedRevision: 2, bindings: { [sourceID]: targetID },
    })).rejects.toMatchObject({ code: 'ENVIRONMENT_BINDING_TYPE_MISMATCH' });
  });

  it('applies environment datasource bindings during runtime execution', async () => {
    const targetID = '33333333-3333-4333-8333-333333333333';
    const { db, service, release } = deployFixture();
    db.tblApplicationEnvironments.findFirst.mockResolvedValue({
      environmentID: 'env-a', name: 'production', bindingRevision: 1,
      bindings: { 'ds-a': targetID }, currentRelease: release,
    });
    authorizedExecuteDataQuery.mockResolvedValue({ data: [] });
    await service.runtimeExecute(execution);
    const engineOptions = createQueryEngine.mock.calls.at(-1)[0];
    const pinnedQuery = await engineOptions.queryFetcher('query-a');
    expect(pinnedQuery.datasourceID).toBe(targetID);
  });

  it('deploys a retained release for rollback without mutating it', async () => {
    const { db, service, release } = deployFixture();
    db.tblApplicationEnvironments.update = jest.fn().mockResolvedValue({});
    db.tblApplicationDeployments.create = jest.fn(async ({ data }) => ({ ...data, deploymentID: 'deployment-1', createdAt: new Date() }));
    const result = await service.deploy({ ctx, applicationID: 'app-a', environment: 'production', releaseID: 'release-a' });
    expect(result.release).toMatchObject({ releaseID: 'release-a', releaseNumber: 2 });
    expect(db.tblApplicationEnvironments.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { environmentID: 'env-a' },
      data: expect.objectContaining({ currentReleaseID: 'release-a' }),
    }));
    expect(db.tblApplicationDeployments.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ releaseID: release.releaseID }),
    }));
    expect(release).not.toHaveProperty('updatedAt');
  });

  it('stores consumer policy entries and enforces route/action grants at runtime', async () => {
    const subjectID = '44444444-4444-4444-8444-444444444444';
    const { db, service, release } = deployFixture();
    db.tblRoles.findFirst.mockResolvedValue({ roleID: subjectID, tenantID: 'tenant-a' });
    db.tblApplicationConsumerConfigs.findUnique.mockResolvedValue({ applicationID: 'app-a', enabled: true, revision: 1 });
    db.tblUserTenantRoleMappings.findMany.mockResolvedValue([{ roleID: subjectID }]);
    db.tblApplicationConsumerPolicies.findMany.mockResolvedValue([
      { subjectType: 'role', subjectID, routeID: 'route-a', actionKey: 'orders', allow: true },
    ]);
    release.clientManifest.definition = {
      ...release.clientManifest.definition,
      routes: [
        { id: 'route-a', path: '/a', pageAssetKey: 'page-a', params: {}, query: {} },
        { id: 'route-b', path: '/b', pageAssetKey: 'page-b', params: {}, query: {} },
      ],
      shell: { kind: 'sidebar', homeRouteID: 'route-a', navigation: [{ routeID: 'route-a', label: 'A' }, { routeID: 'route-b', label: 'B' }] },
    };
    release.clientManifest.pages = {
      'page-a': { appPageID: 'page-a', appPageTitle: 'A', appPageConfig: { dataSources: [] } },
      'page-b': { appPageID: 'page-b', appPageTitle: 'B', appPageConfig: { dataSources: [] } },
    };
    release.clientManifest.widgets = {};
    const manifest = await service.runtimeManifest({ ctx, applicationID: 'app-a', environment: 'production' });
    expect(manifest.runtime.consumerPolicy).toMatchObject({ enabled: true, allowedRouteIDs: ['route-a'] });
    expect(manifest.definition.routes.map(route => route.id)).toEqual(['route-a']);
    expect(manifest.pages).toEqual({});
    await expect(service.runtimePageManifest({ ctx, applicationID: 'app-a', environment: 'production', pageAssetKey: 'page-b', routeID: 'route-b' }))
      .rejects.toMatchObject({ code: 'APPLICATION_CONSUMER_ACCESS_DENIED' });
    await expect(service.runtimePageManifest({ ctx, applicationID: 'app-a', environment: 'production', pageAssetKey: 'page-a', routeID: 'route-b' }))
      .rejects.toMatchObject({ code: 'APPLICATION_ROUTE_MISMATCH' });

    authorizedExecuteDataQuery.mockResolvedValue({ data: [] });
    await expect(service.runtimeExecute({ ...execution, routeID: 'route-b' }))
      .rejects.toMatchObject({ code: 'APPLICATION_ROUTE_MISMATCH' });
    await expect(service.runtimeExecute({ ...execution, routeID: 'route-a' }))
      .resolves.toEqual({ data: [] });

    db.tblApplicationConsumerConfigs.findUnique.mockResolvedValue({ applicationID: 'app-a', enabled: false, revision: 2 });
    await expect(service.runtimeExecute({ ...execution, routeID: 'route-a' })).resolves.toEqual({ data: [] });
  });

  it('updates consumer policy with revision checks and validates subjects', async () => {
    const subjectID = '55555555-5555-4555-8555-555555555555';
    const { db, service } = fixture();
    db.tblRoles.findFirst.mockResolvedValue({ roleID: subjectID, tenantID: 'tenant-a' });
    db.tblApplicationConsumerConfigs.findUnique.mockResolvedValue(null);
    db.tblApplicationConsumerConfigs.upsert.mockResolvedValue({});
    db.tblApplicationConsumerPolicies.deleteMany.mockResolvedValue({ count: 0 });
    db.tblApplicationConsumerPolicies.createMany.mockResolvedValue({ count: 1 });
    const result = await service.updateConsumerPolicy({
      ctx, applicationID: 'app-a', expectedRevision: 0, enabled: true,
      entries: [{ subjectType: 'role', subjectID, routeID: null, actionKey: null, allow: true }],
    });
    expect(result).toMatchObject({ enabled: true, revision: 1 });
    expect(db.tblApplicationConsumerPolicies.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: [expect.objectContaining({ subjectType: 'role', subjectID, allow: true })],
    }));
    db.tblApplicationConsumerConfigs.findUnique.mockResolvedValue({ applicationID: 'app-a', enabled: true, revision: 1 });
    await expect(service.updateConsumerPolicy({
      ctx, applicationID: 'app-a', expectedRevision: 0, enabled: true, entries: [],
    })).rejects.toMatchObject({ code: 'CONSUMER_POLICY_CONFLICT' });
  });

  it('lists workflow runs filtered by application environment provenance', async () => {
    const { db, service } = fixture();
    const createdAt = new Date('2026-11-22T10:00:00.000Z');
    db.tblWorkflowInstances.findMany.mockResolvedValue([
      {
        instanceID: 'run-a', workflowID: 'workflow-a', status: 'COMPLETED', createdAt, updatedAt: createdAt,
        executionDefinition: { application: { applicationID: 'app-a', environment: 'production', releaseID: 'rel-a', routeID: 'risk', pageAssetKey: 'risk-page', alias: 'score', caller: { type: 'user' } } },
      },
      {
        instanceID: 'run-b', workflowID: 'workflow-b', status: 'RUNNING', createdAt, updatedAt: createdAt,
        executionDefinition: { application: { applicationID: 'app-a', environment: 'staging', releaseID: 'rel-b' } },
      },
    ]);
    const result = await service.listWorkflowRuns({ ctx, applicationID: 'app-a', environment: 'production', limit: 500 });
    expect(db.tblWorkflowInstances.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 100 }));
    expect(result).toMatchObject({ environment: 'production' });
    expect(result.runs).toEqual([
      expect.objectContaining({ instanceID: 'run-a', routeID: 'risk', pageAssetKey: 'risk-page', alias: 'score', callerType: 'user', releaseID: 'rel-a' }),
    ]);
  });

  const workflowFixture = () => {
    const fixture = deployFixture({ type: 'workflow', workflowID: 'wf' });
    const provenance = { tenantID: 'tenant-a', applicationID: 'app-a', releaseID: 'release-a', environment: 'production', pageAssetKey: 'page-a', alias: 'orders', caller: ctx.caller, workflowVersionID };
    const instance = { instanceID: 'run', workflowID: 'wf', tenantID: 'tenant-a', status: 'RUNNING', workflowOutput: null,
      executionDefinition: { application: provenance, args: { nodes: [{ data: { outputVariable: 'approved' } }] }, privateGraph: 'SECRET' }, contextProjection: { privateValue: 'SECRET' },
    };
    fixture.db.tblWorkflowInstances.findFirst.mockResolvedValue(instance);
    return { ...fixture, instance, provenance };
  };
  it('starts a workflow through the authorized proxy using captured definitions and real caller provenance', async () => {
    const { service, workflowVersion } = workflowFixture();
    authorizedExecuteWorkflow.mockResolvedValue({ instanceID: 'run', temporalWorkflowId: 'private' });
    await expect(service.runtimeExecute(execution)).resolves.toEqual({ instanceID: 'run' });
    expect(authorizedExecuteDataQuery).not.toHaveBeenCalled();
    expect(authorizedExecuteWorkflow).toHaveBeenCalledWith(expect.objectContaining({ workflowID: 'wf', tenantID: 'tenant-a', pinnedWorkflow: expect.objectContaining(workflowVersion.payload),
      applicationExecution: expect.objectContaining({ releaseID: 'release-a', caller: ctx.caller, alias: 'orders' }), executionCtx: expect.objectContaining({ caller: ctx.caller, originatingResource: { type: 'application', id: 'app-a' } }),
    }));
  });
  it('returns uncertain start identity so clients observe instead of blindly executing again', async () => {
    const { service } = workflowFixture();
    authorizedExecuteWorkflow.mockRejectedValue(Object.assign(new Error('deadline'), { instanceID: 'run', startUncertain: true }));
    await expect(service.runtimeExecute(execution)).rejects.toMatchObject({ code: 'APPLICATION_WORKFLOW_START_UNKNOWN', statusCode: 503, details: { instanceID: 'run' } });
  });
  it('rejects starting with a stale deployment and never treats listener observation as execution', async () => {
    const { service } = workflowFixture();
    await expect(service.runtimeExecute({ ...execution, releaseID: 'old' })).rejects.toMatchObject({ code: 'APPLICATION_RELEASE_CHANGED' });
    const listenerFixture = deployFixture({ type: 'listener' });
    await expect(listenerFixture.service.runtimeExecute(execution)).rejects.toMatchObject({ code: 'APPLICATION_SOURCE_NOT_EXECUTABLE' });
    expect(authorizedExecuteWorkflow).not.toHaveBeenCalled();
  });
  it('observes the starting release after deployment changes and exposes no raw logs, inputs or graph', async () => {
    const { db, service, instance } = workflowFixture();
    db.tblApplicationEnvironments.findFirst.mockResolvedValue({ currentRelease: { releaseID: 'release-new' } });
    instance.workflowOutput = { approved: true };
    db.tblWorkflowDataCollectionRequests.findMany.mockResolvedValue([{ collectionRequestID: 'req', collectionType: 'approval', collectionConfig: { title: 'Review' }, submittedData: { secret: 'SECRET' }, status: 'PENDING' }]);
    const result = await service.runtimeWorkflowStatus({ ...execution, instanceID: 'run' });
    expect(result).toMatchObject({ instanceID: 'run', status: 'RUNNING', contextData: { output: { approved: true }, approved: true } });
    expect(result.pendingDataCollectionRequests[0]).toMatchObject({ collectionRequestID: 'req', collectionConfig: { title: 'Review' } });
    expect(JSON.stringify(result)).not.toContain('SECRET');
    expect(db.tblApplicationEnvironments.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { tenantID: 'tenant-a', applicationID: 'app-a', name: 'production' },
    }));
  });
  it.each([{ applicationID: 'other' }, { alias: 'other' }, { environment: 'staging' }, { ctx: { ...ctx, caller: { type: 'user', id: 'other' } } }])('denies a run from a different scope: %j', async changed => {
    const { service, db } = workflowFixture();
    await expect(service.runtimeWorkflowStatus({ ...execution, instanceID: 'run', ...changed })).rejects.toMatchObject({ code: 'APPLICATION_RUN_NOT_FOUND' });
    expect(db.tblWorkflowDataCollectionRequests.findMany).not.toHaveBeenCalled();
  });
  it('authorizes child human-input requests through the root run family and rejects unrelated requests', async () => {
    const { service, db, provenance } = workflowFixture();
    db.tblWorkflowInstances.findMany.mockResolvedValueOnce([{ instanceID: 'child', executionDefinition: { application: provenance } }]).mockResolvedValue([]);
    db.tblWorkflowDataCollectionRequests.findFirst.mockResolvedValue({ collectionRequestID: 'req' });
    const submit = require('../../../modules/workflow/dataCollection/dataCollection.service').dataCollectionService.submitCollectionData;
    await expect(service.runtimeWorkflowSubmit({ ...execution, instanceID: 'run', collectionRequestID: 'req', submittedData: { approved: true } })).resolves.toEqual({ success: true });
    expect(db.tblWorkflowDataCollectionRequests.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { collectionRequestID: 'req', instanceID: { in: ['run', 'child'] } } }));
    expect(submit).toHaveBeenCalledWith({ collectionRequestID: 'req', submittedData: { approved: true }, tenantID: 'tenant-a' });
    db.tblWorkflowDataCollectionRequests.findFirst.mockResolvedValue(null);
    await expect(service.runtimeWorkflowSubmit({ ...execution, instanceID: 'run', collectionRequestID: 'foreign', submittedData: {} })).rejects.toMatchObject({ code: 'APPLICATION_REQUEST_NOT_FOUND' });
  });
  it('requests cancellation without deleting run history; terminal cancellation is a no-op', async () => {
    const { service, instance } = workflowFixture();
    await expect(service.runtimeWorkflowCancel({ ...execution, instanceID: 'run' })).resolves.toEqual({ cancellationRequested: true });
    instance.status = 'COMPLETED';
    await expect(service.runtimeWorkflowCancel({ ...execution, instanceID: 'run' })).resolves.toEqual({ cancellationRequested: false, status: 'COMPLETED' });
  });
});
