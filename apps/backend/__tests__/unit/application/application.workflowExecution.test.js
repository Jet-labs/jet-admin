jest.mock('../../../config/prisma.config', () => ({ prisma: {
  tblWorkflowInstances: { findFirst: jest.fn() }, tblApplications: { findFirst: jest.fn() },
  tblApplicationReleases: { findFirst: jest.fn() }, tblUsersTenantsRelationship: { findFirst: jest.fn() },
  tblAPIKeys: { findFirst: jest.fn() }, tblDataQueries: { findFirst: jest.fn() }, tblWorkflows: { findFirst: jest.fn() },
  tblAssetVersions: { findFirst: jest.fn(), findMany: jest.fn() },
  tblApplicationEnvironments: { findFirst: jest.fn().mockResolvedValue(null) },
} }));
jest.mock('../../../config/casbin.config', () => ({ enforce: jest.fn() }));
jest.mock('../../../utils/authorizedProxy', () => ({ authorizedExecuteDataQuery: jest.fn(), createQueryEngine: jest.fn(options => options), defaultDatasourceFetcher: jest.fn() }));
jest.mock('../../../modules/workflow/temporal/service', () => ({ runSubWorkflowAndWait: jest.fn() }));
const { prisma } = require('../../../config/prisma.config');
const { enforce } = require('../../../config/casbin.config');
const { authorizedExecuteDataQuery } = require('../../../utils/authorizedProxy');
const { runSubWorkflowAndWait } = require('../../../modules/workflow/temporal/service');
const { executeNodeActivity } = require('../../../modules/workflow/temporal/activities/executeNode');
const { loadApplicationWorkflowExecution } = require('../../../modules/application/application.workflowExecution');
const provenance = { tenantID: 't', applicationID: 'a', releaseID: 'r1', caller: { type: 'user', id: 'u' } };
const queryNode = { id: 'q', type: 'dataQuery', data: { dataQueryID: 'query', inputValues: { id: '{{ctx.input.id}}' }, outputVariable: 'rows', errorHandling: 'fail_workflow' } };
const childNode = { id: 'child', type: 'subWorkflow', data: { childWorkflowID: 'child-wf', inputMapping: { id: '{{ctx.input.id}}' } } };
const pinnedQuery = { dataQueryID: 'query', tenantID: 't', datasourceID: 'ds', datasourceType: 'sqlite', dataQueryOptions: { query: 'SELECT pinned', inputDefinitions: [{ key: 'id', type: 'number', required: true }] } };
const child = { workflowID: 'child-wf', tenantID: 't', nodes: [{ id: 's', type: 'start', data: {} }], edges: [], workflowOptions: {} };
beforeEach(() => {
  jest.clearAllMocks();
  prisma.tblWorkflowInstances.findFirst.mockResolvedValue({ workflowID: 'wf', executionDefinition: { application: provenance } });
  prisma.tblApplications.findFirst.mockResolvedValue({ status: 'DRAFT' });
  prisma.tblUsersTenantsRelationship.findFirst.mockResolvedValue({ userID: 'u' });
  prisma.tblApplicationReleases.findFirst.mockResolvedValue({ serverManifest: { workflows: { wf: { workflowID: 'wf', tenantID: 't', nodes: [queryNode, childNode] }, 'child-wf': child }, queries: { query: pinnedQuery } } });
  enforce.mockResolvedValue(true);
  authorizedExecuteDataQuery.mockResolvedValue([{ pinned: true }]);
  runSubWorkflowAndWait.mockResolvedValue({ childInstanceID: 'child-run', status: 'COMPLETED', output: { accepted: true } });
});
const run = node => executeNodeActivity({ node, tenantID: 't', instanceID: 'run', workflowID: 'wf', context: { input: { id: '42' }, __executionCtx: { caller: { type: 'system', id: 'forged-context' } } } });

describe('Pinned workflow node execution', () => {
  it('resolves query inputs/options only from R1 and cannot replace the caller with mutable context', async () => {
    const result = await run(queryNode);
    expect(result.output.rows).toEqual([{ pinned: true }]);
    expect(authorizedExecuteDataQuery).toHaveBeenCalledWith(expect.objectContaining({ dataQueryID: 'query', executionInputs: { id: 42 },
      executionCtx: { tenantID: 't', caller: provenance.caller, originatingResource: { type: 'application', id: 'a' } },
    }));
    const engine = authorizedExecuteDataQuery.mock.calls[0][0].engine;
    expect(await engine.queryFetcher('query')).toEqual(pinnedQuery);
    expect(await engine.queryFetcher('latest-query')).toBeNull();
    expect(prisma.tblDataQueries.findFirst).not.toHaveBeenCalled();
  });
  it('injects the captured child graph and original release/caller into child execution', async () => {
    await run(childNode);
    expect(runSubWorkflowAndWait).toHaveBeenCalledWith(expect.objectContaining({ childWorkflowID: 'child-wf', inputValues: { id: '42' }, pinnedGraph: child, applicationExecution: provenance,
      executionCtx: expect.objectContaining({ caller: provenance.caller }),
    }));
    expect(prisma.tblWorkflows.findFirst).not.toHaveBeenCalled();
  });
  it('fails closed for nodes or dependencies outside the captured closure', async () => {
    await expect(run({ ...queryNode, id: 'not-pinned' })).rejects.toThrow('not part of the starting');
    await expect(run({ ...queryNode, data: { ...queryNode.data, dataQueryID: 'other-query' } })).rejects.toThrow('not pinned');
    expect(authorizedExecuteDataQuery).not.toHaveBeenCalled();
  });
  it('rechecks current membership, application permissions and archive state for activities', async () => {
    enforce.mockResolvedValue(false);
    await expect(run(queryNode)).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
    enforce.mockResolvedValue(true); prisma.tblApplications.findFirst.mockResolvedValue({ status: 'ARCHIVED' });
    await expect(run(queryNode)).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
    prisma.tblApplications.findFirst.mockResolvedValue({ status: 'DRAFT' }); prisma.tblUsersTenantsRelationship.findFirst.mockResolvedValue(null);
    await expect(run(queryNode)).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
    expect(authorizedExecuteDataQuery).not.toHaveBeenCalled();
  });
  it('denies missing/cross-tenant instances rather than falling back to live execution', async () => {
    prisma.tblWorkflowInstances.findFirst.mockResolvedValue(null);
    await expect(run(queryNode)).rejects.toMatchObject({ code: 'APPLICATION_RUN_NOT_FOUND' });
    expect(prisma.tblWorkflowInstances.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { instanceID: 'run', tenantID: 't' } }));
    expect(authorizedExecuteDataQuery).not.toHaveBeenCalled();
  });
  it('executes query and child dependencies from workflow version IDs', async () => {
    const versionedProvenance = { ...provenance, workflowVersionID: 'wv1', pageVersionID: 'pv1' };
    prisma.tblWorkflowInstances.findFirst.mockResolvedValue({ workflowID: 'wf', executionDefinition: { application: versionedProvenance } });
    prisma.tblApplicationReleases.findFirst.mockResolvedValue({ serverManifest: { pageVersions: { page: 'pv1' } } });
    const workflowVersion = { assetVersionID: 'wv1', tenantID: 't', assetType: 'workflow', assetID: 'wf', payload: { workflowID: 'wf', workflowOptions: {}, nodes: [{ id: 'q', type: 'dataQuery', data: { dataQueryID: 'query' } }, { id: 'child', type: 'subWorkflow', data: { childWorkflowID: 'child-wf' } }], edges: [], queryVersions: { query: 'qv1' }, childWorkflowVersions: { 'child-wf': 'cv1' } } };
    prisma.tblAssetVersions.findFirst.mockResolvedValue(workflowVersion);
    prisma.tblAssetVersions.findMany.mockResolvedValue([
      { ...workflowVersion, assetVersionID: 'qv1', assetType: 'query', assetID: 'query', payload: { ...pinnedQuery, assetVersionID: 'qv1' } },
      { ...workflowVersion, assetVersionID: 'cv1', assetType: 'workflow', assetID: 'child-wf', payload: { ...child, assetVersionID: 'cv1' } },
    ]);
    const result = await run(queryNode);
    expect(result.output.rows).toEqual([{ pinned: true }]);
    const call = authorizedExecuteDataQuery.mock.calls.at(-1)[0];
    expect(call.engine.queryFetcher).toBeDefined();
    await run(childNode);
    expect(runSubWorkflowAndWait).toHaveBeenCalledWith(expect.objectContaining({ pinnedGraph: expect.objectContaining({ assetVersionID: 'cv1' }), applicationExecution: expect.objectContaining({ workflowVersionID: 'cv1' }) }));
  });
  it('preserves the legacy node adapter for genuine standalone instances', async () => {
    prisma.tblWorkflowInstances.findFirst.mockResolvedValue({ workflowID: 'wf', executionDefinition: {} });
    expect(await loadApplicationWorkflowExecution({ instanceID: 'run', tenantID: 't', workflowID: 'wf' })).toBeNull();
    expect(prisma.tblApplicationReleases.findFirst).not.toHaveBeenCalled();
  });
});
