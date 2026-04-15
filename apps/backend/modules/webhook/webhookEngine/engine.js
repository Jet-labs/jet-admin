/**
 * WebhookEngine
 * Core logic for processing incoming webhook events:
 *   - Endpoint lookup & caching
 *   - Authentication verification (bearer, hmac-future)
 *   - Listener dispatch to workflows
 */
const Logger = require("../../../utils/logger");
const { prisma } = require("../../../config/prisma.config");
const workflowService = require("../../workflow/workflow.service");

class WebhookEngine {
  constructor() {
    // Optional: in-memory cache for hot-path lookups
    this.endpointCache = new Map();
  }

  /**
   * Process an incoming webhook request.
   * @param {{ tenantID: string, webhookPath: string, headers: object, query: object, body: object, method: string }} params
   * @returns {{ status: number, body: object }}
   */
  async processIncomingWebhook({ tenantID, webhookPath, headers, query, body, method }) {
    Logger.log("info", {
      message: "WebhookEngine:processIncomingWebhook:start",
      params: { tenantID, webhookPath }
    });

    // 1. Resolve webhook definition
    const webhook = await this.resolveWebhook(tenantID, webhookPath);
    if (!webhook || webhook.status !== 'active') {
      return { status: 404, body: { error: "Webhook endpoint not found or inactive" } };
    }

    // 2. Authenticate
    const authResult = this.authenticate(webhook, headers);
    if (!authResult.ok) {
      return { status: 401, body: { error: authResult.reason || "Unauthorized" } };
    }

    // 3. Build event payload
    const eventPayload = {
      headers,
      query,
      body,
      method,
      webhookID: webhook.webhookID,
      timestamp: new Date().toISOString()
    };

    // 4. Trigger listeners (async, fire-and-forget after ACK)
    this.triggerListeners(webhook, tenantID, eventPayload);

    // 5. Update metadata (async)
    this.updateMetadata(webhook.webhookID);

    return { status: 200, body: { success: true, message: "Webhook accepted" } };
  }

  // ─── Internal Methods ───────────────────────────────────────

  async resolveWebhook(tenantID, webhookPath) {
    const cacheKey = `${tenantID}:${webhookPath}`;
    if (this.endpointCache.has(cacheKey)) {
      return this.endpointCache.get(cacheKey);
    }

    const webhook = await prisma.tblWebhooks.findUnique({
      where: {
        uq_tblWebhooks_tenantID_webhookPath: { tenantID, webhookPath }
      },
      include: {
        tblWebhookListeners: { where: { isEnabled: true } }
      }
    });

    if (webhook) {
      this.endpointCache.set(cacheKey, webhook);
    }

    return webhook;
  }

  authenticate(webhook, headers) {
    if (!webhook.authType || webhook.authType === 'none') {
      return { ok: true };
    }

    if (webhook.authType === 'bearer') {
      const authHeader = headers.authorization || '';
      const expectedToken = webhook.authConfig?.token;
      if (!authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== expectedToken) {
        return { ok: false, reason: "Invalid bearer token" };
      }
      return { ok: true };
    }

    // Future: HMAC, basic, etc.
    Logger.log("warning", { message: "WebhookEngine:authenticate:unsupportedAuthType", params: { authType: webhook.authType } });
    return { ok: false, reason: `Unsupported auth type: ${webhook.authType}` };
  }

  async triggerListeners(webhook, tenantID, eventPayload) {
    if (!webhook.tblWebhookListeners) return;

    for (const listener of webhook.tblWebhookListeners) {
      try {
        await workflowService.executeWorkflow({
          workflowID: listener.workflowID,
          tenantID,
          inputArgs: { event: eventPayload }
        });
      } catch (wfErr) {
        Logger.log("error", {
          message: "WebhookEngine:triggerListeners:workflowError",
          params: { workflowID: listener.workflowID, error: wfErr.message }
        });
      }
    }
  }

  updateMetadata(webhookID) {
    prisma.tblWebhooks.update({
      where: { webhookID },
      data: {
        lastReceivedAt: new Date(),
        eventCount: { increment: 1 }
      }
    }).catch(err => {
      Logger.log("error", {
        message: "WebhookEngine:updateMetadata:error",
        params: { webhookID, error: err.message }
      });
    });
  }

  /**
   * Invalidate a cached endpoint (call after CRUD updates).
   */
  invalidateCache(tenantID, webhookPath) {
    this.endpointCache.delete(`${tenantID}:${webhookPath}`);
  }

  invalidateAll() {
    this.endpointCache.clear();
  }
}

const webhookEngine = new WebhookEngine();

module.exports = webhookEngine;
