const { assembleApplicationRelease } = require('../../../modules/application/application.versionRelease');
const { createApplicationDefinition } = require('@jet-admin/application-contracts');

const tenantID = 'tenant-a';
const pageID = '11111111-1111-4111-8111-111111111111';
const pageVersionID = '22222222-2222-4222-8222-222222222222';
const widgetID = '33333333-3333-4333-8333-333333333333';
const widgetVersionID = '44444444-4444-4444-8444-444444444444';
const queryID = '55555555-5555-4555-8555-555555555555';
const queryVersionID = '66666666-6666-4666-8666-666666666666';
const workflowID = '77777777-7777-4777-8777-777777777777';
const workflowVersionID = '88888888-8888-4888-8888-888888888888';
const listenerID = '99999999-9999-4999-8999-999999999999';
const listenerVersionID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const definition = {
  ...createApplicationDefinition(),
  routes: [{ id: 'home', path: '/', pageAssetKey: 'page' }],
  shell: { kind: 'sidebar', homeRouteID: 'home', navigation: [{ routeID: 'home', label: 'Home' }] },
};
const rows = {
  [pageVersionID]: { assetVersionID: pageVersionID, tenantID, assetType: 'appPage', assetID: pageID, payload: {
    appPageID: pageID, appPageTitle: 'Page', appPageConfig: { widgets: [`widget_${widgetID}_1`], dataSources: [{ alias: 'orders', type: 'query', queryID }, { alias: 'flow', type: 'workflow', workflowID }, { alias: 'live', type: 'listener', listenerID }] },
    sourceVersions: { orders: { assetType: 'query', assetID: queryID, assetVersionID: queryVersionID }, flow: { assetType: 'workflow', assetID: workflowID, assetVersionID: workflowVersionID }, live: { assetType: 'listener', assetID: listenerID, assetVersionID: listenerVersionID } },
    widgetVersions: { [widgetID]: widgetVersionID },
  } },
  [widgetVersionID]: { assetVersionID: widgetVersionID, tenantID, assetType: 'widget', assetID: widgetID, payload: { widgetID, widgetTitle: 'Orders', widgetType: 'table', widgetConfig: { events: {
    onClick: [{ actionType: 'TRIGGER_QUERY', config: { queryID, inputValues: { limit: 3 } } }],
    onLoad: [{ actionType: 'TRIGGER_WORKFLOW', config: { workflowID, successToast: 'Sent' } }],
    onSearch: [{ actionType: 'TRIGGER_QUERY', config: { queryID: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' } }],
  } } } },
  [queryVersionID]: { assetVersionID: queryVersionID, tenantID, assetType: 'query', assetID: queryID, payload: { dataQueryID: queryID, dataQueryOptions: { query: 'select * from orders', inputDefinitions: [] }, datasourceID: 'ds', datasourceType: 'postgresql' } },
  [workflowVersionID]: { assetVersionID: workflowVersionID, tenantID, assetType: 'workflow', assetID: workflowID, payload: { workflowID, workflowOptions: {}, nodes: [{ id: 'start', type: 'start', data: {} }], edges: [], queryVersions: {}, childWorkflowVersions: {} } },
  [listenerVersionID]: { assetVersionID: listenerVersionID, tenantID, assetType: 'listener', assetID: listenerID, payload: { listenerID, actions: [{ actionID: 'a1', actionType: 'save_to_buffer', actionConfig: { bufferName: 'default' }, isEnabled: true, orderIndex: 0 }], definitionHash: 'a'.repeat(64) } },
};
const db = { tblAssetVersions: { findMany: jest.fn(async ({ where }) => where.assetVersionID.in.map(id => rows[id]).filter(Boolean)) } };
const application = { applicationID: 'app', tenantID, title: 'App', slug: 'app' };

it('assembles runtime definitions from page versions without storing them in the release', async () => {
  const assembled = await assembleApplicationRelease({ db, application, definition, pageVersions: { page: pageVersionID }, tenantID });
  expect(assembled.clientManifest.pages.page.appPageConfig.dataSources).toEqual(expect.arrayContaining([
    expect.objectContaining({ alias: 'orders', type: 'query' }),
    expect.objectContaining({ alias: 'flow', type: 'workflow' }),
    expect.objectContaining({ alias: 'live', type: 'listener' }),
  ]));
  expect(assembled.clientManifest.widgets[widgetID]).toMatchObject({ widgetType: 'table' });
  expect(assembled.clientManifest.widgets[widgetID].widgetConfig.events).toEqual({
    onClick: [{ actionType: 'EXECUTE_QUERY', config: { alias: 'orders', inputValues: { limit: 3 } } }],
    onLoad: [{ actionType: 'EXECUTE_QUERY', config: { alias: 'flow', successToast: 'Sent' } }],
  });
  expect(assembled.clientManifest.diagnostics).toEqual([
    expect.objectContaining({
      code: 'ACTION_TARGET_NOT_ALIASED',
      path: `pages.page.widgets.${widgetID}.events.onSearch.0`,
    }),
  ]);
  expect(assembled.serverManifest.pages.page.flow).toMatchObject({ workflowVersionID, type: 'workflow' });
  expect(assembled.serverManifest.pages.page.orders).toMatchObject({ assetVersionID: queryVersionID, dataQueryID: queryID });
  expect(assembled.serverManifest.pages.page.live).toMatchObject({ listenerVersionID, definitionHash: 'a'.repeat(64) });
  expect(JSON.stringify(assembled.clientManifest)).not.toContain(queryID);
  expect(JSON.stringify(assembled.clientManifest)).not.toContain(workflowID);
  expect(JSON.stringify(assembled.clientManifest)).not.toContain(listenerID);
});

it('fails closed when a page references a missing version', async () => {
  await expect(assembleApplicationRelease({ db, application, definition, pageVersions: { page: 'missing' }, tenantID }))
    .rejects.toMatchObject({ code: 'ASSET_VERSION_INVALID' });
});
