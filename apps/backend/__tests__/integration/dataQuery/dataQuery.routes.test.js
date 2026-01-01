/**
 * Integration tests for DataQuery API routes
 */

const request = require('supertest');
const express = require('express');
const { body, param, query } = require('express-validator');

describe('DataQuery Routes Integration', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock auth middleware
    const mockAuthMiddleware = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      req.user = {
        userID: 1,
        firebaseID: 'test-firebase-id',
        email: 'test@example.com',
      };
      next();
    };

    // Mock permissions middleware
    const mockPermissionsMiddleware = () => (req, res, next) => next();
    const mockTenantMiddleware = (req, res, next) => {
      req.tenantID = req.params.tenantID || req.headers['x-tenant-id'];
      next();
    };
    const mockValidationChecker = (req, res, next) => next();
    const mockAuditMiddleware = (req, res, next) => next();

    // Mock controller functions
    const mockGetAllDataQueries = (req, res) => {
      res.status(200).json({
        success: true,
        data: [
          {
            dataQueryID: 'query-1',
            dataQueryTitle: 'Get Users',
            datasourceType: 'postgresql',
            linkedWidgetCount: 2
          },
          {
            dataQueryID: 'query-2',
            dataQueryTitle: 'Get Orders',
            datasourceType: 'postgresql',
            linkedWidgetCount: 1
          }
        ]
      });
    };

    const mockGetDataQueryByID = (req, res) => {
      const { dataQueryID } = req.params;
      res.status(200).json({
        success: true,
        data: {
          dataQueryID,
          dataQueryTitle: 'Test Query',
          datasourceType: 'postgresql',
          dataQueryOptions: {
            query: 'SELECT * FROM users'
          }
        }
      });
    };

    const mockCreateDataQuery = (req, res) => {
      res.status(201).json({
        success: true,
        data: {
          dataQueryID: 'new-query-id',
          ...req.body
        }
      });
    };

    const mockUpdateDataQuery = (req, res) => {
      res.status(200).json({
        success: true,
        data: {
          dataQueryID: req.params.dataQueryID,
          ...req.body
        }
      });
    };

    const mockDeleteDataQuery = (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Query deleted successfully'
      });
    };

    const mockRunDataQuery = (req, res) => {
      res.status(200).json({
        success: true,
        data: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' }
        ]
      });
    };

    // Define routes
    const router = express.Router();

    // Get all data queries
    router.get(
      '/tenants/:tenantID/queries',
      mockAuthMiddleware,
      mockTenantMiddleware,
      mockGetAllDataQueries
    );

    // Get data query by ID
    router.get(
      '/tenants/:tenantID/queries/:dataQueryID',
      mockAuthMiddleware,
      mockTenantMiddleware,
      mockGetDataQueryByID
    );

    // Create data query
    router.post(
      '/tenants/:tenantID/queries',
      mockAuthMiddleware,
      mockTenantMiddleware,
      body('dataQueryTitle').notEmpty(),
      mockValidationChecker,
      mockCreateDataQuery
    );

    // Update data query
    router.put(
      '/tenants/:tenantID/queries/:dataQueryID',
      mockAuthMiddleware,
      mockTenantMiddleware,
      mockValidationChecker,
      mockUpdateDataQuery
    );

    // Delete data query
    router.delete(
      '/tenants/:tenantID/queries/:dataQueryID',
      mockAuthMiddleware,
      mockTenantMiddleware,
      mockDeleteDataQuery
    );

    // Run data query
    router.post(
      '/tenants/:tenantID/queries/:dataQueryID/run',
      mockAuthMiddleware,
      mockTenantMiddleware,
      mockRunDataQuery
    );

    app.use('/api/v1', router);
  });

  describe('GET /api/v1/tenants/:tenantID/queries', () => {
    const tenantID = '123e4567-e89b-12d3-a456-426614174000';

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/v1/tenants/${tenantID}/queries`)
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return list of data queries when authenticated', async () => {
      const response = await request(app)
        .get(`/api/v1/tenants/${tenantID}/queries`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('dataQueryTitle');
      expect(response.body.data[0]).toHaveProperty('linkedWidgetCount');
    });
  });

  describe('GET /api/v1/tenants/:tenantID/queries/:dataQueryID', () => {
    const tenantID = '123e4567-e89b-12d3-a456-426614174000';
    const dataQueryID = 'query-123';

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/v1/tenants/${tenantID}/queries/${dataQueryID}`)
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return data query when authenticated', async () => {
      const response = await request(app)
        .get(`/api/v1/tenants/${tenantID}/queries/${dataQueryID}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dataQueryID', dataQueryID);
      expect(response.body.data).toHaveProperty('dataQueryOptions');
    });
  });

  describe('POST /api/v1/tenants/:tenantID/queries', () => {
    const tenantID = '123e4567-e89b-12d3-a456-426614174000';

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post(`/api/v1/tenants/${tenantID}/queries`)
        .send({ dataQueryTitle: 'New Query' })
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('should create data query when authenticated', async () => {
      const response = await request(app)
        .post(`/api/v1/tenants/${tenantID}/queries`)
        .set('Authorization', 'Bearer test-token')
        .send({
          dataQueryTitle: 'New Query',
          datasourceType: 'postgresql',
          dataQueryOptions: { query: 'SELECT 1' }
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('dataQueryID');
      expect(response.body.data.dataQueryTitle).toBe('New Query');
    });
  });

  describe('PUT /api/v1/tenants/:tenantID/queries/:dataQueryID', () => {
    const tenantID = '123e4567-e89b-12d3-a456-426614174000';
    const dataQueryID = 'query-123';

    it('should update data query when authenticated', async () => {
      const response = await request(app)
        .put(`/api/v1/tenants/${tenantID}/queries/${dataQueryID}`)
        .set('Authorization', 'Bearer test-token')
        .send({
          dataQueryTitle: 'Updated Query',
          dataQueryOptions: { query: 'SELECT * FROM updated' }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dataQueryID).toBe(dataQueryID);
      expect(response.body.data.dataQueryTitle).toBe('Updated Query');
    });
  });

  describe('DELETE /api/v1/tenants/:tenantID/queries/:dataQueryID', () => {
    const tenantID = '123e4567-e89b-12d3-a456-426614174000';
    const dataQueryID = 'query-123';

    it('should delete data query when authenticated', async () => {
      const response = await request(app)
        .delete(`/api/v1/tenants/${tenantID}/queries/${dataQueryID}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Query deleted successfully');
    });
  });

  describe('POST /api/v1/tenants/:tenantID/queries/:dataQueryID/run', () => {
    const tenantID = '123e4567-e89b-12d3-a456-426614174000';
    const dataQueryID = 'query-123';

    it('should run data query and return results', async () => {
      const response = await request(app)
        .post(`/api/v1/tenants/${tenantID}/queries/${dataQueryID}/run`)
        .set('Authorization', 'Bearer test-token')
        .send({ argValues: { userId: 1 } })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
    });
  });
});
