jest.mock('../../../config/prisma.config', () => ({ prisma: {} }));
jest.mock('../../../config/casbin.config', () => ({ enforce: jest.fn() }));
jest.mock('../../../utils/authorizedProxy', () => ({
  authorizedExecuteDataQuery: jest.fn(),
  authorizedExecuteWorkflow: jest.fn(),
  createQueryEngine: jest.fn(options => options),
  defaultDatasourceFetcher: jest.fn(),
}));
const { authorizedExecuteDataQuery, authorizedExecuteWorkflow, createQueryEngine } = require('../../../utils/authorizedProxy');
const { createApplicationService } = require('../../../modules/application/application.service');
const { createApplicationDefinition } = require('@jet-admin/application-contracts');

const tenantID = 'tenant-a';
const applicationID = 'app-a';
const pageID = '11111111-1111-4111-8111-111111111111';
const pageVersionID = '22222222-2222-4222-8222-222222222222';
const widgetID = '33333333-3333-4333-8333-333333333333';
const widgetVersionID = '44444444-4444-4444-8444-444444444444';
const queryID = '55555555-5555-4555-8555-555555555555';
const queryVersionID = '66666666-6666-4666-8666-666666666666';
const workflowID = '77777777-7777-4777-8777-777777777777';
const workflowVersionID = '88888888-8888-4888-8888-888888888888';
const definition = {
  ...createApplicationDefinition(),
  routes: [{ id: 'home', path: '/', pageAssetKey: 'page' }],
  shell: { kind: 'sidebar', homeRouteID: 'home', navigation: [{ routeID: 'home', label: 'Home' }] },
};
const rows = {
  [pageVersionID]: { assetVersionID: pageVersionID, tenantID, assetType: 'appPage', assetID: pageID, payload: {
    appPageID: pageID, appPageTitle: 'Page', appPageConfig: { widgets: [`widget_${widgetID}_1`], dataSources: [{ alias: 'orders', type: 'query', queryID }, { alias: 'flow', type: 'workflow', workflowID }] },
    sourceVersions: { orders: { assetType: 'query', assetID: queryID, assetVersionID: queryVersionID }, flow: { assetType: 'workflow', assetID: workflowID, assetVersionID: workflowVersionID } }, widgetVersions: { [widgetID]: widgetVersionID },
  } },
  [widgetVersionID]: { assetVersionID: widgetVersionID, tenantID, assetType: 'widget', assetID: widgetID, payload: { widgetID, widgetTitle: 'Orders', widgetType: 'table', widgetConfig: { events: {} } } },
  [queryVersionID]: { assetVersionID: queryVersionID, tenantID, assetType: 'query', assetID: queryID, payload: { dataQueryID: queryID, dataQueryOptions: { query: 'select * from orders', inputDefinitions: [] }, datasourceID: 'ds', datasourceType: 'postgresql', assetVersionID: queryVersionID } },
  [workflowVersionID]: { assetVersionID: workflowVersionID, tenantID, assetType: 'workflow', assetID: workflowID, payload: { workflowID, tenantID, workflowOptions: {}, nodes: [{ id: 'start', type: 'start', data: {} }], edges: [], queryVersions: {}, childWorkflowVersions: {} } },
};
const release = { releaseID: 'release-a', releaseNumber: 2, sourceRevision: 1, contentHash: 'a'.repeat(64),
  clientManifest: { mode: 'runtime', executionEnabled: true, actionsEnabled: true, applicationID, applicationTitle: 'App', applicationSlug: 'app', tenantID, definition, pageVersions: { page: pageVersionID }, diagnostics: [] },
  serverManifest: { schemaVersion: 1, applicationID, tenantID, pageVersions: { page: pageVersionID } },
};
function fixture() {
  const db = {
    tblUsersTenantsRelationship: { findFirst: jest.fn().mockResolvedValue({ userID: 'user-a' }) },
    tblApplications: { findFirst: jest.fn().mockResolvedValue({ applicationID, tenantID, status: 'DRAFT' }) },
    tblApplicationEnvironments: { findFirst: jest.fn().mockResolvedValue({ environmentID: 'env', name: 'production', currentRelease: release }) },
    tblApplicationConsumerConfigs: { findUnique: jest.fn().mockResolvedValue(null) },
    tblApplicationConsumerPolicies: { findMany: jest.fn().mockResolvedValue([]) },
    tblUserTenantRoleMappings: { findMany: jest.fn().mockResolvedValue([]) },
    tblAPIKeyRoleMappings: { findMany: jest.fn().mockResolvedValue([]) },
    tblAssetVersions: {
      findMany: jest.fn(async ({ where }) => where.assetVersionID.in.map(id => rows[id]).filter(Boolean)),
      findFirst: jest.fn(async ({ where }) => rows[where.assetVersionID] || null),
    },
  };
  db.$transaction = fn => fn(db);
  const enforce = jest.fn().mockResolvedValue(true);
  return { db, service: createApplicationService({ db, enforce, grantCreatorAccess: jest.fn() }), enforce };
}
const ctx = { tenantID, caller: { type: 'user', id: 'user-a' } };

describe('Thin versioned Application release', () => {
  it('assembles a page manifest from the exact page version without exposing source IDs', async () => {
    const { service } = fixture();
    const pageManifest = await service.runtimePageManifest({ ctx, applicationID, environment: 'production', pageAssetKey: 'page' });
    expect(pageManifest.page.appPageConfig.dataSources[0]).toMatchObject({ alias: 'orders', type: 'query' });
    expect(pageManifest.widgets[widgetID]).toMatchObject({ widgetType: 'table' });
    expect(pageManifest).toMatchObject({ releaseID: 'release-a', pageVersionID });
    expect(JSON.stringify(pageManifest)).not.toContain(queryID);
    expect(JSON.stringify(pageManifest)).not.toContain(workflowID);
  });

  it('keeps the application manifest page-agnostic', async () => {
    const { service } = fixture();
    const manifest = await service.runtimeManifest({ ctx, applicationID, environment: 'production' });
    expect(manifest.pages).toEqual({});
    expect(manifest.widgets).toEqual({});
    expect(manifest.runtime).toMatchObject({ releaseID: 'release-a', pageVersionCount: 1 });
  });

  it('executes the query definition from the page version, not a live query row', async () => {
    const { service } = fixture();
    authorizedExecuteDataQuery.mockResolvedValue({ rows: [1] });
    await expect(service.runtimeExecute({ ctx, applicationID, environment: 'production', pageAssetKey: 'page', alias: 'orders', inputValues: {} })).resolves.toEqual({ rows: [1] });
    const call = authorizedExecuteDataQuery.mock.calls.at(-1)[0];
    expect(call.dataQueryID).toBe(queryID);
    expect(call.executionCtx.originatingResource).toEqual({ type: 'application', id: applicationID });
    const engine = createQueryEngine.mock.calls.at(-1)[0];
    expect(await engine.queryFetcher(queryID)).toMatchObject({ dataQueryOptions: { query: 'select * from orders' } });
    expect(await engine.queryFetcher('live-query')).toBeNull();
  });

  it('starts a workflow from its exact version with release provenance', async () => {
    const { service } = fixture();
    authorizedExecuteWorkflow.mockResolvedValue({ instanceID: 'run' });
    await expect(service.runtimeExecute({ ctx, applicationID, environment: 'production', pageAssetKey: 'page', alias: 'flow', inputValues: {}, releaseID: 'release-a' }))
      .resolves.toEqual({ instanceID: 'run' });
    expect(authorizedExecuteWorkflow).toHaveBeenCalledWith(expect.objectContaining({
      workflowID,
      pinnedWorkflow: expect.objectContaining({ tenantID, assetVersionID: workflowVersionID }),
      applicationExecution: expect.objectContaining({ workflowVersionID, pageVersionID }),
    }));
  });

  it('rejects a page manifest with a missing page version', async () => {
    const { db, service } = fixture();
    db.tblAssetVersions.findFirst.mockResolvedValue(null);
    await expect(service.runtimePageManifest({ ctx, applicationID, environment: 'production', pageAssetKey: 'page' })).rejects.toMatchObject({ code: 'APPLICATION_PAGE_VERSION_NOT_FOUND' });
  });
});
