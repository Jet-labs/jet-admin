const { auditLogMiddleware } = require("../../../modules/audit/audit.middleware");
const { auditService } = require("../../../modules/audit/audit.service");

// Mock auditService
jest.mock("../../../modules/audit/audit.service", () => ({
  auditService: {
    log: jest.fn(),
  },
}));

describe("auditLogMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: "POST",
      originalUrl: "/api/test",
      ip: "127.0.0.1",
      headers: {
        "content-type": "application/json",
        "authorization": "Bearer secret-token",
        "cookie": "session=12345",
      },
      body: {
        username: "testuser",
        password: "secretpassword",
        nested: {
          token: "sensitive",
          data: "public",
        },
      },
      params: {
        tenantID: "tenant-1",
      },
      user: {
        userID: "user-1",
      },
      authContext: {
        authType: "USER",
      }
    };

    res = {
      statusCode: 200,
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      getHeaders: jest.fn().mockReturnValue({
        "set-cookie": ["session=abc"],
        "x-custom": "value",
      }),
      on: jest.fn(),
    };

    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should filter sensitive keys in request body and headers", (done) => {
    auditLogMiddleware.audit(req, res, next);

    expect(next).toHaveBeenCalled();

    // Trigger the finish event callback
    const finishCallback = res.on.mock.calls.find(call => call[0] === "finish")[1];

    // Mock the response body capture
    res.json({ success: true, token: "new-token" });

    finishCallback();

    setImmediate(() => {
      expect(auditService.log).toHaveBeenCalled();
      const logEvent = auditService.log.mock.calls[0][0];

      // Check request headers
      expect(logEvent.metadata.request.headers.authorization).toBe("[FILTERED]");
      expect(logEvent.metadata.request.headers.cookie).toBe("[FILTERED]");
      expect(logEvent.metadata.request.headers["content-type"]).toBe("application/json");

      // Check request body
      expect(logEvent.metadata.request.body.password).toBe("[FILTERED]");
      expect(logEvent.metadata.request.body.nested.token).toBe("[FILTERED]");
      expect(logEvent.metadata.request.body.username).toBe("testuser");
      expect(logEvent.metadata.request.body.nested.data).toBe("public");

      // Check response body
      expect(logEvent.metadata.response.body.token).toBe("[FILTERED]");
      expect(logEvent.metadata.response.body.success).toBe(true);

      // Check response headers
      expect(logEvent.metadata.response.headers["set-cookie"]).toBe("[FILTERED]");
      expect(logEvent.metadata.response.headers["x-custom"]).toBe("value");

      done();
    });
  });

  it("should handle JSON string payloads and filter them", (done) => {
    req.body = JSON.stringify({ password: "123", public: "yes" });

    auditLogMiddleware.audit(req, res, next);

    const finishCallback = res.on.mock.calls.find(call => call[0] === "finish")[1];
    res.send(JSON.stringify({ token: "abc", status: "ok" }));
    finishCallback();

    setImmediate(() => {
      const logEvent = auditService.log.mock.calls[0][0];

      expect(logEvent.metadata.request.body.password).toBe("[FILTERED]");
      expect(logEvent.metadata.request.body.public).toBe("yes");

      expect(logEvent.metadata.response.body.token).toBe("[FILTERED]");
      expect(logEvent.metadata.response.body.status).toBe("ok");

      done();
    });
  });

  it("should truncate large payloads after filtering", (done) => {
    const largeData = "a".repeat(3000);
    req.body = { password: "123", large: largeData };

    auditLogMiddleware.audit(req, res, next);

    const finishCallback = res.on.mock.calls.find(call => call[0] === "finish")[1];
    finishCallback();

    setImmediate(() => {
      const logEvent = auditService.log.mock.calls[0][0];
      expect(logEvent.metadata.request.body._truncated).toBeDefined();
      expect(logEvent.metadata.request.body.password).toBeUndefined(); // Because it was truncated
      done();
    });
  });
});
