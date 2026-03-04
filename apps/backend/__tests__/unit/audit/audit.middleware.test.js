const { _filterSensitiveKeys, _safeGetPayload, auditLogMiddleware } = require("../../../modules/audit/audit.middleware");

describe('audit.middleware', () => {
  describe('filterSensitiveKeys', () => {
    it('should filter sensitive keys at the top level', () => {
      const data = {
        username: 'testuser',
        password: 'secretpassword',
        token: 'secret-token'
      };
      const filtered = _filterSensitiveKeys(data);
      expect(filtered.username).toBe('testuser');
      expect(filtered.password).toBe('[FILTERED]');
      expect(filtered.token).toBe('[FILTERED]');
    });

    it('should filter sensitive keys case-insensitively', () => {
      const data = {
        Password: 'secretpassword',
        TOKEN: 'secret-token'
      };
      const filtered = _filterSensitiveKeys(data);
      expect(filtered.Password).toBe('[FILTERED]');
      expect(filtered.TOKEN).toBe('[FILTERED]');
    });

    it('should filter sensitive keys that are part of other keys', () => {
      const data = {
        user_password: 'secretpassword',
        access_token: 'secret-token',
        my_secret_key: 'secret-value'
      };
      const filtered = _filterSensitiveKeys(data);
      expect(filtered.user_password).toBe('[FILTERED]');
      expect(filtered.access_token).toBe('[FILTERED]');
      expect(filtered.my_secret_key).toBe('[FILTERED]');
    });

    it('should filter sensitive keys recursively', () => {
      const data = {
        user: {
          username: 'testuser',
          password: 'secretpassword'
        },
        items: [
          { id: 1, token: 'token1' },
          { id: 2, token: 'token2' }
        ]
      };
      const filtered = _filterSensitiveKeys(data);
      expect(filtered.user.password).toBe('[FILTERED]');
      expect(filtered.items[0].token).toBe('[FILTERED]');
      expect(filtered.items[1].token).toBe('[FILTERED]');
    });
  });

  describe('safeGetPayload', () => {
    it('should filter sensitive data in the payload object', () => {
      const payload = {
        username: 'testuser',
        password: 'secretpassword'
      };
      const result = _safeGetPayload(payload);
      expect(result.username).toBe('testuser');
      expect(result.password).toBe('[FILTERED]');
    });

    it('should filter sensitive data in a JSON string payload', () => {
      const payload = JSON.stringify({
        username: 'testuser',
        password: 'secretpassword'
      });
      const result = _safeGetPayload(payload);
      expect(result.username).toBe('testuser');
      expect(result.password).toBe('[FILTERED]');
    });

    it('should handle non-JSON string payloads', () => {
      const payload = 'plain text payload';
      const result = _safeGetPayload(payload);
      expect(result).toBe('plain text payload');
    });

    it('should truncate large payloads', () => {
      const largePayload = 'a'.repeat(3000);
      const result = _safeGetPayload(largePayload);
      expect(result._truncated).toBeDefined();
      expect(result._truncated.length).toBeLessThan(3000);
    });
  });

  describe('auditLogMiddleware.audit', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        method: 'POST',
        originalUrl: '/api/test',
        ip: '127.0.0.1',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer secret-token'
        },
        body: {
          password: 'secretpassword'
        },
        user: { userID: 'user123' },
        params: { tenantID: 'tenant456' },
        authContext: { authType: 'USER' }
      };
      res = {
        statusCode: 200,
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
        on: jest.fn(),
        getHeaders: jest.fn().mockReturnValue({ 'set-cookie': 'secret-cookie' })
      };
      next = jest.fn();
    });

    it('should call next()', () => {
      auditLogMiddleware.audit(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    // More complex tests would require mocking auditService.log and simulating res 'finish' event
  });
});
