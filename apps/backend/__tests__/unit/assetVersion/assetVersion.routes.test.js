const mockService = { listVersions: jest.fn(), getVersion: jest.fn(), getImpact: jest.fn(), createVersion: jest.fn() };
jest.mock('../../../modules/assetVersion/assetVersion.service', () => ({
  ASSET_TYPES: { datasource: {}, listener: {}, query: {}, cronjob: {}, widget: {}, workflow: {}, appPage: {} },
  assetVersionService: mockService,
}));
const express = require('express');
const request = require('supertest');
const router = require('../../../modules/assetVersion/assetVersion.v1.routes');
const tenant = '11111111-1111-4111-8111-111111111111';
const asset = '22222222-2222-4222-8222-222222222222';
const version = '33333333-3333-4333-8333-333333333333';
const app = express();
app.use(express.json());
app.use('/api/:tenantID/asset-versions', router);

describe('Asset version HTTP contracts', () => {
  beforeEach(() => { Object.values(mockService).forEach(mock => mock.mockReset().mockResolvedValue({})); });
  it('lists, reads and creates scoped immutable versions', async () => {
    expect((await request(app).get(`/api/${tenant}/asset-versions/query/${asset}/versions?page=1&pageSize=20`)).status).toBe(200);
    expect((await request(app).get(`/api/${tenant}/asset-versions/query/${asset}/versions/${version}`)).status).toBe(200);
    expect((await request(app).get(`/api/${tenant}/asset-versions/query/${asset}/versions/${version}/impact`)).status).toBe(200);
    expect(mockService.getImpact).toHaveBeenCalledWith(expect.objectContaining({ tenantID: tenant, assetType: 'query', assetID: asset, versionID: version }));
    const created = await request(app).post(`/api/${tenant}/asset-versions/query/${asset}/versions`).send({ changeNote: 'snapshot' });
    expect(created.status).toBe(200);
    expect(mockService.createVersion).toHaveBeenCalledWith(expect.objectContaining({ tenantID: tenant, assetType: 'query', assetID: asset, changeNote: 'snapshot', ctx: undefined }));
  });
  it('rejects unknown asset types and malformed version parameters before service calls', async () => {
    expect((await request(app).get(`/api/${tenant}/asset-versions/mystery/${asset}/versions`)).status).toBe(400);
    expect((await request(app).post(`/api/${tenant}/asset-versions/query/${asset}/versions`).send({ changeNote: 'x'.repeat(2001) })).status).toBe(400);
    expect((await request(app).get(`/api/${tenant}/asset-versions/query/${asset}/versions/not-a-uuid`)).status).toBe(400);
    expect(mockService.createVersion).not.toHaveBeenCalled();
  });
});
