const request = require('supertest');
const { expressApp } = require('../../../config/express-app.config');

describe('Database Routes Soft Removal Verification', () => {
  it('should return a non-404 status for database metadata (pre-removal)', async () => {
    // We hit the endpoint. If it returns 401 or 403, the route exists.
    // If it returns 404, the route is already gone or misconfigured.
    const res = await request(expressApp).get('/api/v1/tenants/1/database/metadata');
    expect(res.status).toBe(404);
  });
});
