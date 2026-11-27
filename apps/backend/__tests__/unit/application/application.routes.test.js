const mockService = {
  list: jest.fn(), create: jest.fn(), get: jest.fn(), getDraft: jest.fn(), saveDraft: jest.fn(),
  linkPage: jest.fn(), selectPageVersion: jest.fn(), unlinkAsset: jest.fn(), archive: jest.fn(), validate: jest.fn(), preview: jest.fn(),
  publish: jest.fn(), listReleases: jest.fn(), getEnvironment: jest.fn(), updateBindings: jest.fn(), deploy: jest.fn(), runtimeManifest: jest.fn(), runtimeExecute: jest.fn(),
  getConsumerPolicy: jest.fn(), updateConsumerPolicy: jest.fn(), listWorkflowRuns: jest.fn(),
  runtimeWorkflowStatus: jest.fn(), runtimeWorkflowCancel: jest.fn(), runtimeWorkflowSubmit: jest.fn(), runtimeListenerEvents: jest.fn(),
};
let mockAllowed = true;
jest.mock('../../../modules/application/application.service', () => ({ applicationService: mockService }));
jest.mock('../../../modules/auth/auth.middleware', () => ({ authMiddleware: { authorize: () => (req, res, next) => {
  if (!mockAllowed) return res.status(403).json({ success: false, error: { code: 'PERMISSION_DENIED' } });
  req.executionCtx = { tenantID: req.params.tenantID, caller: { type: 'user', id: 'verified-user' } };
  next();
} } }));
const express = require('express');
const request = require('supertest');
const { createApplicationDefinition } = require('@jet-admin/application-contracts');
const router = require('../../../modules/application/application.v1.routes');
const tenant = '11111111-1111-4111-8111-111111111111';
const application = '22222222-2222-4222-8222-222222222222';
const base = `/api/${tenant}/applications`;
const app = express();
app.use(express.json());
app.use((req, _res, next) => { req.user = { userID: 'verified-user' }; next(); });
app.use('/api/:tenantID/applications', router);

describe('Applications HTTP contracts', () => {
  beforeEach(() => { mockAllowed = true; Object.values(mockService).forEach(mock => mock.mockReset().mockResolvedValue({})); });
  it('uses the existing success envelope and marks draft data non-cacheable', async () => {
    mockService.getDraft.mockResolvedValue({ revision: 3, definition: createApplicationDefinition() });
    const result = await request(app).get(`${base}/${application}/draft`);
    expect(result.status).toBe(200); expect(result.body).toMatchObject({ success: true, draft: { revision: 3 } });
    expect(result.headers['cache-control']).toBe('no-store');
  });
  it('rejects malformed IDs and omitted revisions before invoking the service', async () => {
    expect((await request(app).get(`${base}/not-an-id`)).status).toBe(400);
    expect((await request(app).patch(`${base}/${application}/draft`).send({ definition: createApplicationDefinition() })).status).toBe(400);
    expect(mockService.get).not.toHaveBeenCalled(); expect(mockService.saveDraft).not.toHaveBeenCalled();
  });
  it('requires explicit page ownership mode and rejects caller-controlled authority', async () => {
    const data = { appPageID: tenant, assetKey: 'page', expectedRevision: 1, managementMode: 'referenced' };
    expect((await request(app).post(`${base}/${application}/assets/pages`).send({ ...data, managementMode: 'managed' })).status).toBe(201);
    expect((await request(app).post(`${base}/${application}/assets/pages`).send({ ...data, managementMode: 'clone' })).status).toBe(400);
    expect((await request(app).post(`${base}/${application}/assets/pages`).send({ ...data, ctx: { caller: { type: 'system' } } })).status).toBe(400);
    const result = await request(app).post(`${base}/${application}/assets/pages`).send(data);
    expect(result.status).toBe(201);
    expect(mockService.linkPage).toHaveBeenCalledWith(expect.objectContaining({ applicationID: application, managementMode: 'managed', ctx: { tenantID: tenant, caller: { type: 'user', id: 'verified-user' } } }));
  });
  it('pins and unpins an exact page version with an expected revision', async () => {
    const url = `${base}/${application}/assets/page/version`;
    expect((await request(app).patch(url).send({ expectedRevision: 2, pageVersionID: tenant })).status).toBe(200);
    expect(mockService.selectPageVersion).toHaveBeenCalledWith(expect.objectContaining({
      applicationID: application,
      assetKey: 'page',
      pageVersionID: tenant,
      expectedRevision: 2,
    }));
    expect((await request(app).patch(url).send({ expectedRevision: 2, pageVersionID: null })).status).toBe(200);
    expect((await request(app).patch(url).send({ expectedRevision: 2 })).status).toBe(400);
  });
  it('does not invoke service methods when route permission is denied', async () => {
    mockAllowed = false;
    expect((await request(app).post(`${base}/${application}/preview`)).status).toBe(403);
    expect(mockService.preview).not.toHaveBeenCalled();
  });
  it('returns explicit conflict codes without database internals', async () => {
    mockService.create.mockRejectedValue(Object.assign(new Error('private SQL and connection details'), { code: 'P2002' }));
    const result = await request(app).post(base).send({ title: 'Orders', slug: 'orders' });
    expect(result.status).toBe(409); expect(result.body.error.code).toBe('APPLICATION_DUPLICATE');
    expect(JSON.stringify(result.body)).not.toContain('private SQL');
  });
  it('exposes release/deploy routes but no arbitrary action execution route', async () => {
    expect((await request(app).post(`${base}/${application}/releases`).send({ expectedRevision: 1 })).status).toBe(201);
    expect((await request(app).post(`${base}/${application}/environments/production/deployments`).send({ releaseID: tenant })).status).toBe(200);
    expect((await request(app).post(`${base}/${application}/actions/save/execute`).send({})).status).toBe(404);
    expect((await request(app).post(`${base}/${application}/runtime/production/pages/page/data-sources/orders/read`).send({ inputValues: {} })).status).toBe(404);
    const result = await request(app).post(`${base}/${application}/runtime/production/pages/page/data-sources/orders/execute`).send({ inputValues: {} });
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ success: true, dataQueryResult: {} });
    expect(mockService.runtimeExecute).toHaveBeenCalledWith(expect.objectContaining({
      applicationID: application,
      pageAssetKey: 'page',
      alias: 'orders',
      ctx: { tenantID: tenant, caller: { type: 'user', id: 'verified-user' } },
    }));
  });
  it('rejects client-supplied operation definitions, authority, or obsolete policy fields', async () => {
    for (const extra of [{ queryID: tenant }, { effect: 'read' }, { readOnly: true }, { idempotencyKey: 'operation-12345678' }, { ctx: { caller: { type: 'system' } } }]) {
      expect((await request(app).post(`${base}/${application}/runtime/production/pages/page/data-sources/orders/execute`).send({ inputValues: {}, ...extra })).status).toBe(400);
    }
    expect(mockService.runtimeExecute).not.toHaveBeenCalled();
  });
  it('requires execute permission on the unified runtime endpoint', async () => {
    mockAllowed = false;
    expect((await request(app).post(`${base}/${application}/runtime/production/pages/page/data-sources/orders/execute`).send({ inputValues: {} })).status).toBe(403);
    expect(mockService.runtimeExecute).not.toHaveBeenCalled();
  });
  it('exposes bounded workflow observation/input/cancel and listener cursor contracts', async () => {
    const source = `${base}/${application}/runtime/production/pages/page/data-sources/approve`;
    expect((await request(app).get(`${source}/runs/${tenant}`)).status).toBe(200);
    expect((await request(app).post(`${source}/runs/${tenant}/cancel`).send({})).status).toBe(200);
    expect((await request(app).post(`${source}/runs/${tenant}/requests/${application}/submit`).send({ submittedData: { approved: true } })).status).toBe(200);
    expect((await request(app).post(`${source}/runs/${tenant}/requests/${application}/submit`).send({ submittedData: [], ctx: {} })).status).toBe(400);
    expect((await request(app).get(`${source}/events`).query({ releaseID: tenant })).status).toBe(200);
    expect((await request(app).get(`${source}/events`)).status).toBe(400);
    expect((await request(app).get(`${source}/events`).query({ releaseID: tenant, cursor: 'a'.repeat(2049) })).status).toBe(400);
  });
  it('returns run history and consumer policy as top-level payloads for the client', async () => {
    mockService.listWorkflowRuns.mockResolvedValue({ runs: [{ instanceID: tenant }], environment: 'production' });
    const runs = await request(app).get(`${base}/${application}/runs`).query({ environment: 'production' });
    expect(runs.status).toBe(200);
    expect(runs.body).toMatchObject({ success: true, runs: [{ instanceID: tenant }], environment: 'production' });
    expect(runs.body).not.toHaveProperty('runs.runs');

    mockService.getConsumerPolicy.mockResolvedValue({ enabled: true, revision: 3, entries: [] });
    const policy = await request(app).get(`${base}/${application}/consumer-policy`);
    expect(policy.status).toBe(200);
    expect(policy.body).toMatchObject({ success: true, enabled: true, revision: 3, entries: [] });
    expect(policy.body).not.toHaveProperty('consumerPolicy');
  });
  it('validates and routes binding and consumer policy mutations', async () => {
    const bindings = await request(app)
      .put(`${base}/${application}/environments/production/bindings`)
      .send({ expectedRevision: 2, bindings: { [tenant]: application } });
    expect(bindings.status).toBe(200);
    expect(mockService.updateBindings).toHaveBeenCalledWith(expect.objectContaining({
      expectedRevision: 2,
      bindings: { [tenant]: application },
    }));

    const policy = await request(app)
      .put(`${base}/${application}/consumer-policy`)
      .send({ expectedRevision: 3, enabled: true, entries: [] });
    expect(policy.status).toBe(200);
    expect(mockService.updateConsumerPolicy).toHaveBeenCalledWith(expect.objectContaining({
      expectedRevision: 3,
      enabled: true,
      entries: [],
    }));
    expect((await request(app)
      .put(`${base}/${application}/consumer-policy`)
      .send({ expectedRevision: 3, enabled: true, entries: [{ subjectType: 'user', subjectID: 'not-a-uuid' }] })).status).toBe(400);
  });
});
