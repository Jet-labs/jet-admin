const express = require("express");
const router = express.Router({ mergeParams: true });
const { aiController } = require("./ai.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// All AI routes require Firebase authentication and tenant membership verification.

/**
 * POST /api/v1/tenants/:tenantID/ai/chat
 * Send a message to the AI agent and get a response with optional tool call trace.
 */
router.post("/chat", authMiddleware.authProvider, authMiddleware.checkTenantMembership, aiController.chat);

/**
 * POST /api/v1/tenants/:tenantID/ai/chat/stream
 * SSE stream — emits thinking/text/tool_start/tool_end/done events in real time.
 */
router.post("/chat/stream", authMiddleware.authProvider, authMiddleware.checkTenantMembership, aiController.streamChat);

/**
 * GET /api/v1/tenants/:tenantID/ai/session
 * Get current session message history.
 */
router.get("/session", authMiddleware.authProvider, authMiddleware.checkTenantMembership, aiController.getSession);

/**
 * DELETE /api/v1/tenants/:tenantID/ai/session
 * Clear the current session history (start fresh).
 */
router.delete("/session", authMiddleware.authProvider, authMiddleware.checkTenantMembership, aiController.clearSession);

module.exports = router;
