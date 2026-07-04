/**
 * Unit tests for Standalone Webhook Receiver Server
 */

process.env.VAULT_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const { webhookReceiverServer } = require("../../../modules/listener/listenerEngine/webhookReceiverServer");
const { prisma } = require("../../../config/prisma.config");
const { addListenerEvent } = require("../../../config/queue.config");

jest.mock("../../../config/prisma.config", () => ({
  prisma: {
    tblListeners: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("../../../config/queue.config", () => ({
  addListenerEvent: jest.fn().mockResolvedValue(undefined),
}));

describe("Standalone Webhook Receiver Server", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {},
      method: "POST",
      headers: {},
      query: {},
      body: { event: "payment_success", amount: 500 },
      originalUrl: "/webhooks/v1/inbound/tenant-123/stripe-event",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
  });

  it("should match listener by tenantID and pathSuffix", async () => {
    req.params = { tenantID: "tenant-123", pathSuffix: "stripe-event" };

    prisma.tblListeners.findMany.mockResolvedValue([
      {
        listenerID: "listener-stripe-999",
        tenantID: "tenant-123",
        status: "active",
        listenerConfig: { pathSuffix: "stripe-event", responseStatusCode: 201, responseBody: '{"status":"received"}' },
        tblDatasources: {
          datasourceOptions: { authType: "none", allowedMethods: "POST" },
        },
        tblListenerActions: [],
      },
    ]);

    await webhookReceiverServer.handleWebhookRequest(req, res, true);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ status: "received" });
    expect(addListenerEvent).toHaveBeenCalledTimes(1);
    expect(addListenerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        listenerID: "listener-stripe-999",
        tenantID: "tenant-123",
      })
    );
  });

  it("should match listener by listenerID fallback endpoint", async () => {
    req.params = { listenerID: "listener-direct-100" };

    prisma.tblListeners.findFirst.mockResolvedValue({
      listenerID: "listener-direct-100",
      tenantID: "tenant-123",
      status: "active",
      listenerConfig: {},
      tblDatasources: {
        datasourceOptions: { authType: "none", allowedMethods: "POST" },
      },
      tblListenerActions: [],
    });

    await webhookReceiverServer.handleWebhookRequest(req, res, false);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(addListenerEvent).toHaveBeenCalledTimes(1);
  });

  it("should reject requests with disallowed HTTP methods", async () => {
    req.method = "GET";
    req.params = { listenerID: "listener-direct-100" };

    prisma.tblListeners.findFirst.mockResolvedValue({
      listenerID: "listener-direct-100",
      tenantID: "tenant-123",
      status: "active",
      tblDatasources: {
        datasourceOptions: { authType: "none", allowedMethods: "POST" },
      },
    });

    await webhookReceiverServer.handleWebhookRequest(req, res, false);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(addListenerEvent).not.toHaveBeenCalled();
  });

  it("should enforce Basic Auth on dedicated Webhook Receiver", async () => {
    req.params = { listenerID: "listener-basic-auth" };

    prisma.tblListeners.findFirst.mockResolvedValue({
      listenerID: "listener-basic-auth",
      tenantID: "tenant-123",
      status: "active",
      tblDatasources: {
        datasourceOptions: {
          authType: "basic",
          username: "webhookuser",
          password: "supersecretpassword",
          allowedMethods: "POST",
        },
      },
      tblListenerActions: [],
    });

    // Invalid credentials
    req.headers["authorization"] = "Basic " + Buffer.from("webhookuser:wrongpassword").toString("base64");
    await webhookReceiverServer.handleWebhookRequest(req, res, false);
    expect(res.status).toHaveBeenCalledWith(401);

    // Valid credentials
    jest.clearAllMocks();
    req.headers["authorization"] = "Basic " + Buffer.from("webhookuser:supersecretpassword").toString("base64");
    await webhookReceiverServer.handleWebhookRequest(req, res, false);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(addListenerEvent).toHaveBeenCalledTimes(1);
  });
});
