jest.mock('../../../config/prisma.config', () => ({ prisma: {} }));
jest.mock('../../../config/casbin.config', () => ({ enforce: jest.fn() }));
const { createAssetVersionService } = require('../../../modules/assetVersion/assetVersion.service');
const { listenerDefinitionHash } = require('../../../modules/listener/listenerDefinition');

const queryID = '11111111-1111-4111-8111-111111111111';
const datasourceID = '22222222-2222-4222-8222-222222222222';
const widgetID = '33333333-3333-4333-8333-333333333333';
const pageID = '44444444-4444-4444-8444-444444444444';
const workflowID = '55555555-5555-4555-8555-555555555555';
const childID = '66666666-6666-4666-8666-666666666666';
const listenerID = '77777777-7777-4777-8777-777777777777';
const ctx = { tenantID: 'tenant-a', caller: { type: 'user', id: 'user-a' } };

function fixture() {
  const query = { dataQueryID: queryID, tenantID: 'tenant-a', dataQueryTitle: 'Orders', dataQueryDescription: null, datasourceID, datasourceType: 'postgresql', dataQueryOptions: { query: 'select * from orders', inputDefinitions: [{ key: 'limit', type: 'number' }] }, runOnLoad: false, dataQueryResultSchema: null, isDisabled: false };
  const datasource = { datasourceID, tenantID: 'tenant-a', datasourceTitle: 'Ops', datasourceDescription: null, datasourceType: 'postgresql', datasourceTags: ['ops'], datasourceOptions: { __encrypted: true, data: 'SECRET' } };
  const widget = { widgetID, tenantID: 'tenant-a', widgetTitle: 'Orders table', widgetType: 'table', widgetConfig: { events: {} } };
  const child = { workflowID: childID, tenantID: 'tenant-a', title: 'Child', workflowOptions: {}, isDisabled: false, tblWorkflowNodes: [{ nodeID: 'start', nodeType: 'start', nodeConfig: {} }], tblWorkflowEdge: [] };
  const workflow = { workflowID, tenantID: 'tenant-a', title: 'Root', workflowOptions: { inputDefinitions: [{ key: 'limit', type: 'number' }] }, isDisabled: false,
    tblWorkflowNodes: [{ nodeID: 'start', nodeType: 'start', nodeConfig: {} }, { nodeID: 'query', nodeType: 'dataQuery', nodeConfig: { dataQueryID: queryID } }, { nodeID: 'child', nodeType: 'subWorkflow', nodeConfig: { childWorkflowID: childID } }],
    tblWorkflowEdge: [{ edgeID: 'e1', upstreamNodeID: 'start', downstreamNodeID: 'query', sourceHandle: 'output', targetHandle: null }, { edgeID: 'e2', upstreamNodeID: 'query', downstreamNodeID: 'child', sourceHandle: 'output', targetHandle: null }] };
  const listener = { listenerID, tenantID: 'tenant-a', datasourceID, listenerTitle: 'Live', listenerDescription: null, listenerType: 'webhook', listenerConfig: { topic: 'orders' }, status: 'active', endpointPath: '/orders', tblListenerActions: [{ actionID: 'a1', actionType: 'save_to_buffer', actionConfig: { bufferName: 'orders' }, isEnabled: true, orderIndex: 0 }] };
  const page = { appPageID: pageID, tenantID: 'tenant-a', appPageTitle: 'Page', appPageDescription: null,
    appPageConfig: { widgets: [`widget_${widgetID}_1`], dataSources: [{ alias: 'orders', type: 'query', queryID }, { alias: 'flow', type: 'workflow', workflowID }, { alias: 'live', type: 'listener', listenerID }] } };
  const tables = { tblDataQueries: { findFirst: jest.fn(async ({ where }) => query.dataQueryID === where.dataQueryID ? query : null), update: jest.fn(async ({ data }) => { Object.assign(query, data); return query; }) }, tblDatasources: { findFirst: jest.fn(async ({ where }) => datasource.datasourceID === where.datasourceID ? datasource : null) }, tblWidgets: { findFirst: jest.fn(async ({ where }) => widget.widgetID === where.widgetID ? widget : null) }, tblWorkflows: { findFirst: jest.fn(async ({ where }) => where.workflowID === workflowID ? workflow : where.workflowID === childID ? child : null) }, tblListeners: { findFirst: jest.fn(async ({ where }) => listener.listenerID === where.listenerID ? listener : null), update: jest.fn(async ({ data }) => { Object.assign(listener, data); return listener; }), deleteMany: jest.fn(async () => ({ count: 1 })) }, tblListenerActions: { deleteMany: jest.fn(async () => ({ count: 1 })), createMany: jest.fn(async ({ data }) => ({ count: data.length })) }, tblAppPages: { findFirst: jest.fn(async ({ where }) => page.appPageID === where.appPageID ? page : null) } };
  const versions = [];
  const references = [];
  const tx = { ...tables,
    tblAssetVersionReferences: {
      createMany: jest.fn(async ({ data }) => { references.push(...data); return { count: data.length }; }),
      findMany: jest.fn(async ({ where }) => references.filter(ref => where.tenantID === ref.tenantID && (where.childVersionID?.in || []).includes(ref.childVersionID))),
    },
    tblAssetVersions: {
      findFirst: jest.fn(async ({ where }) => [...versions].reverse().find(v => v.tenantID === where.tenantID && v.assetType === where.assetType && v.assetID === where.assetID && (!where.assetVersionID || v.assetVersionID === where.assetVersionID)) || null),
      create: jest.fn(async ({ data }) => { const row = { ...data, assetVersionID: `v-${versions.length + 1}`, createdAt: new Date() }; versions.push(row); return row; }),
      findMany: jest.fn(async ({ where }) => versions.filter(v => where.assetVersionID?.in?.includes(v.assetVersionID))),
    },
  };
  tx.$transaction = fn => fn(tx);
  const db = { ...tx, $transaction: tx.$transaction,
    tblApplications: { findMany: jest.fn().mockResolvedValue([]) },
    tblApplicationReleases: { findMany: jest.fn().mockResolvedValue([]) },
    tblApplicationEnvironments: { findMany: jest.fn().mockResolvedValue([]) },
  };
  const enforce = jest.fn().mockResolvedValue(true);
  return { tx, db, versions, references, query, datasource, widget, workflow, child, listener, page, enforce, service: createAssetVersionService({ db, enforce }) };
}

describe('Immutable asset versions', () => {
  it('captures query/datasource definitions, excludes credentials, and reuses unchanged hashes', async () => {
    const f = fixture();
    const first = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'query', assetID: queryID });
    const second = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'query', assetID: queryID });
    expect(first.payload.dataQueryOptions.query).toBe('select * from orders');
    expect(first.payload.datasourceVersionID).toEqual(expect.any(String));
    expect(second.assetVersionID).toBe(first.assetVersionID);
    expect(f.versions.find(v => v.assetType === 'datasource').payload).not.toHaveProperty('datasourceOptions');
    expect(JSON.stringify(f.versions.find(v => v.assetType === 'datasource').payload)).not.toContain('SECRET');
    expect(f.versions).toHaveLength(2);
  });

  it('captures page widget/source versions and changes the page version when a dependency changes', async () => {
    const f = fixture();
    f.widget.widgetConfig = { events: { onClick: [{ actionType: 'TRIGGER_QUERY', config: { queryID } }] } };
    const pageVersion = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'appPage', assetID: pageID });
    expect(pageVersion.payload.sourceVersions.orders).toMatchObject({ assetType: 'query', assetID: queryID });
    expect(pageVersion.payload.sourceVersions.flow).toMatchObject({ assetType: 'workflow', assetID: workflowID });
    expect(pageVersion.payload.widgetVersions[widgetID]).toEqual(expect.any(String));
    expect(pageVersion.payload.triggerBindings.query[queryID]).toBe('orders');
    const before = f.versions.length;
    f.query.dataQueryOptions = { ...f.query.dataQueryOptions, query: 'select * from orders where id=$1' };
    const changed = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'appPage', assetID: pageID });
    expect(changed.assetVersionID).not.toBe(pageVersion.assetVersionID);
    expect(f.versions.length).toBeGreaterThan(before);
    expect(f.versions.at(-1).payload.sourceVersions.orders.assetVersionID).not.toBe(pageVersion.payload.sourceVersions.orders.assetVersionID);
  });

  it('captures workflow query and child dependency versions and rejects cycles', async () => {
    const f = fixture();
    const version = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'workflow', assetID: workflowID });
    expect(version.payload.queryVersions[queryID]).toEqual(expect.any(String));
    expect(version.payload.childWorkflowVersions[childID]).toEqual(expect.any(String));
    f.child.tblWorkflowNodes.push({ nodeID: 'back', nodeType: 'subWorkflow', nodeConfig: { childWorkflowID: workflowID } });
    await expect(f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'workflow', assetID: workflowID })).rejects.toMatchObject({ code: expect.stringMatching(/ASSET_VERSION_CYCLE|INVALID_RELEASE_WORKFLOW/) });
  });

  it('reports captured dependency changes between workflow versions', async () => {
    const f = fixture();
    const first = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'workflow', assetID: workflowID });
    f.query.dataQueryOptions = { ...f.query.dataQueryOptions, query: 'select * from orders where id=$1' };
    const second = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'workflow', assetID: workflowID });
    expect(second.assetVersionID).not.toBe(first.assetVersionID);
    const diff = await f.service.getVersionDiff({
      ctx, assetType: 'workflow', assetID: workflowID,
      versionID: first.assetVersionID, againstVersionID: second.assetVersionID,
    });
    expect(diff.dependencyChanges).toEqual(expect.arrayContaining([
      expect.objectContaining({
        assetType: 'query',
        assetID: queryID,
        change: 'updated',
        beforeVersionID: first.payload.queryVersions[queryID],
        afterVersionID: second.payload.queryVersions[queryID],
      }),
    ]));
    expect(diff.changes).toEqual([]);
  });

  it('captures query and workflow dependencies declared on a widget', async () => {
    const f = fixture();
    f.widget.widgetConfig = {
      dataSources: [
        { alias: 'orders', type: 'query', queryID },
        { alias: 'flow', type: 'workflow', workflowID },
      ],
    };
    const widgetVersion = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'widget', assetID: widgetID });
    expect(widgetVersion.payload.queryVersions[queryID]).toEqual(expect.any(String));
    expect(widgetVersion.payload.workflowVersions[workflowID]).toEqual(expect.any(String));
    expect(f.references.some(ref => ref.childVersionID === widgetVersion.payload.queryVersions[queryID])).toBe(true);
  });

  it('captures an explicitly selected datasource version for query and listener parents', async () => {
    const f = fixture();
    const datasourceV1 = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'datasource', assetID: datasourceID });
    f.datasource.datasourceTitle = 'Ops changed';
    const datasourceV2 = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'datasource', assetID: datasourceID });
    expect(datasourceV2.assetVersionID).not.toBe(datasourceV1.assetVersionID);

    f.query.dataQueryOptions = {
      ...f.query.dataQueryOptions,
      datasourceVersionMode: 'specific',
      datasourceVersionID: datasourceV1.assetVersionID,
    };
    const queryVersion = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'query', assetID: queryID });
    expect(queryVersion.payload.datasourceVersionID).toBe(datasourceV1.assetVersionID);

    f.listener.listenerConfig = {
      ...f.listener.listenerConfig,
      datasourceVersionMode: 'specific',
      datasourceVersionID: datasourceV1.assetVersionID,
    };
    const listenerVersion = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'listener', assetID: listenerID });
    expect(listenerVersion.payload.datasourceVersionID).toBe(datasourceV1.assetVersionID);
  });

  it('captures an explicitly selected widget version for a page', async () => {
    const f = fixture();
    const widgetV1 = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'widget', assetID: widgetID });
    f.widget.widgetConfig = { events: { onClick: [{ actionType: 'TRIGGER_QUERY', config: { queryID } }] } };
    const widgetV2 = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'widget', assetID: widgetID });
    expect(widgetV2.assetVersionID).not.toBe(widgetV1.assetVersionID);

    f.page.appPageConfig = {
      ...f.page.appPageConfig,
      widgetVersionSelections: {
        [widgetID]: { versionMode: 'specific', widgetVersionID: widgetV1.assetVersionID },
      },
    };
    const pageVersion = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'appPage', assetID: pageID });
    expect(pageVersion.payload.widgetVersions[widgetID]).toBe(widgetV1.assetVersionID);
  });

  it('rejects a selected widget version that belongs to another widget', async () => {
    const f = fixture();
    f.page.appPageConfig = {
      ...f.page.appPageConfig,
      widgetVersionSelections: {
        [widgetID]: { versionMode: 'specific', widgetVersionID: queryID },
      },
    };
    await expect(f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'appPage', assetID: pageID }))
      .rejects.toMatchObject({ code: 'APP_PAGE_SOURCE_VERSION_NOT_FOUND' });
  });

  it('captures an explicitly selected dependency version for workflow and listener parents', async () => {
    const f = fixture();
    const queryV1 = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'query', assetID: queryID });
    f.query.dataQueryOptions = { ...f.query.dataQueryOptions, query: 'select * from orders where id=$1' };
    const queryV2 = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'query', assetID: queryID });
    expect(queryV2.assetVersionID).not.toBe(queryV1.assetVersionID);

    f.workflow.tblWorkflowNodes[1].nodeConfig = {
      dataQueryID: queryID, versionMode: 'specific', queryVersionID: queryV1.assetVersionID,
    };
    const workflowVersion = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'workflow', assetID: workflowID });
    expect(workflowVersion.payload.queryVersions[queryID]).toBe(queryV1.assetVersionID);

    f.listener.tblListenerActions.push({
      actionID: 'a2', actionType: 'trigger_workflow', isEnabled: true, orderIndex: 1,
      actionConfig: { workflowID, versionMode: 'specific', workflowVersionID: workflowVersion.assetVersionID },
    });
    const listenerVersion = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'listener', assetID: listenerID });
    expect(listenerVersion.payload.workflowVersions[workflowID]).toBe(workflowVersion.assetVersionID);
  });

  it('rejects a selected dependency version that belongs to another asset', async () => {
    const f = fixture();
    await expect(f.service.ensureVersion({
      ctx, tx: f.tx, assetType: 'workflow', assetID: workflowID,
    })).resolves.toBeDefined();
    f.workflow.tblWorkflowNodes[1].nodeConfig = {
      dataQueryID: queryID, versionMode: 'specific', queryVersionID: childID,
    };
    await expect(f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'workflow', assetID: workflowID }))
      .rejects.toMatchObject({ code: 'APP_PAGE_SOURCE_VERSION_NOT_FOUND' });
  });

  it('requires asset permission and exposes scoped version reads', async () => {
    const f = fixture();
    f.enforce.mockResolvedValueOnce(false);
    await expect(f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'query', assetID: queryID })).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
    f.enforce.mockResolvedValue(true);
    const version = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'query', assetID: queryID });
    expect(await f.service.getVersion({ ctx, assetType: 'query', assetID: queryID, versionID: version.assetVersionID })).toMatchObject({ assetVersionID: version.assetVersionID });
    expect(f.enforce).toHaveBeenCalledWith('user-a', 'tenant-a', 'dataquery:' + queryID, 'read');
  });

  it('records dependency edges and reports direct and transitive impact', async () => {
    const f = fixture();
    const queryVersion = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'query', assetID: queryID });
    const pageVersion = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'appPage', assetID: pageID });
    f.db.tblAssetVersions.findMany.mockImplementation(async ({ where }) => f.versions.filter(v => where.assetVersionID.in.includes(v.assetVersionID)));
    const impact = await f.service.getImpact({ ctx, assetType: 'query', assetID: queryID, versionID: queryVersion.assetVersionID });
    expect(impact.usedBy).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'assetVersion', assetType: 'appPage', assetVersionID: pageVersion.assetVersionID })]));
    expect(f.references.some(ref => ref.parentVersionID === pageVersion.assetVersionID && ref.childVersionID === queryVersion.assetVersionID)).toBe(true);
  });

  it('reports application release impact and filters inaccessible applications', async () => {
    const f = fixture();
    const version = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'query', assetID: queryID });
    f.references.push({ tenantID: 'tenant-a', parentType: 'applicationRelease', parentVersionID: null, parentReleaseID: 'release-1', childVersionID: version.assetVersionID, referenceKey: 'release:release-1:' + version.assetVersionID });
    f.db.tblApplicationReleases.findMany.mockResolvedValue([{ releaseID: 'release-1', releaseNumber: 1, applicationID: 'app-1' }]);
    f.db.tblApplications.findMany.mockResolvedValue([{ applicationID: 'app-1', title: 'App One' }]);
    f.enforce.mockResolvedValueOnce(true); // ensureVersion read
    f.enforce.mockResolvedValueOnce(true); // impact read
    f.enforce.mockResolvedValueOnce(true); // application read
    const impact = await f.service.getImpact({ ctx, assetType: 'query', assetID: queryID, versionID: version.assetVersionID });
    expect(impact.usedBy).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'applicationRelease', applicationTitle: 'App One' })]));
    f.enforce.mockReset();
    f.enforce.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const hidden = await f.service.getImpact({ ctx, assetType: 'query', assetID: queryID, versionID: version.assetVersionID });
    expect(hidden.usedBy.some(item => item.type === 'applicationRelease')).toBe(false);
  });

  it('fingerprints listener definitions without activation status', async () => {
    const f = fixture();
    const version = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'listener', assetID: listenerID });
    expect(version.payload.definitionHash).toBe(listenerDefinitionHash(f.listener));
    expect(version.payload).not.toHaveProperty('status');
  });

  it('diffs a version against the current draft and restores it with conflict protection', async () => {
    const f = fixture();
    f.query.updatedAt = new Date('2026-11-22T10:00:00.000Z');
    const version = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'query', assetID: queryID });
    f.query.dataQueryTitle = 'Orders changed';
    f.query.dataQueryOptions = { query: 'select 1' };
    const diff = await f.service.getVersionDiff({ ctx, assetType: 'query', assetID: queryID, versionID: version.assetVersionID });
    expect(diff.currentUpdatedAt).toEqual(f.query.updatedAt);
    expect(diff.changes).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'dataQueryTitle', change: 'changed' }),
      expect.objectContaining({ path: 'dataQueryOptions.query', change: 'changed' }),
    ]));

    await expect(f.service.restoreVersion({ ctx, assetType: 'query', assetID: queryID, versionID: version.assetVersionID, expectedUpdatedAt: '2026-11-22T09:00:00.000Z' }))
      .rejects.toMatchObject({ code: 'ASSET_VERSION_RESTORE_CONFLICT' });

    const restored = await f.service.restoreVersion({ ctx, assetType: 'query', assetID: queryID, versionID: version.assetVersionID, expectedUpdatedAt: '2026-11-22T10:00:00.000Z' });
    expect(restored.restored).toBe(true);
    expect(f.query.dataQueryTitle).toBe('Orders');
    expect(f.query.dataQueryOptions.query).toBe('select * from orders');
  });

  it('restores listener definitions with their datasource binding', async () => {
    const f = fixture();
    const version = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'listener', assetID: listenerID });
    f.listener.listenerTitle = 'Live changed';
    const diff = await f.service.getVersionDiff({ ctx, assetType: 'listener', assetID: listenerID, versionID: version.assetVersionID });
    expect(diff.changes).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'listenerTitle', change: 'changed' })])
    );
    await f.service.restoreVersion({ ctx, assetType: 'listener', assetID: listenerID, versionID: version.assetVersionID });
    expect(f.listener.listenerTitle).toBe('Live');
    expect(f.listener.datasourceID).toBe(datasourceID);
    expect(f.tx.tblListenerActions.createMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: [expect.objectContaining({ listenerID })] })
    );
  });

  it('reports no draft changes when content matches the current version', async () => {
    const f = fixture();
    f.query.updatedAt = new Date('2026-11-22T10:00:00.000Z');
    const version = await f.service.ensureVersion({ ctx, tx: f.tx, assetType: 'query', assetID: queryID });
    const diff = await f.service.getVersionDiff({ ctx, assetType: 'query', assetID: queryID, versionID: version.assetVersionID });
    expect(diff.changes).toEqual([]);
  });

  it('gives page snapshots a long transaction budget and retries transient failures', async () => {
    const f = fixture();
    const transaction = jest.fn(f.db.$transaction);
    transaction.mockRejectedValueOnce(Object.assign(new Error('Transaction already closed'), { code: 'P2028' }));
    f.db.$transaction = transaction;

    const version = await f.service.createVersion({ ctx, assetType: 'appPage', assetID: pageID, changeNote: 'snapshot' });

    expect(version).toMatchObject({ assetType: 'appPage', reused: false });
    expect(transaction).toHaveBeenCalledTimes(2);
    expect(transaction.mock.calls[0][1]).toEqual({ timeout: 180000, maxWait: 20000 });
  });
});
