const express = require("express");
const router = express.Router({ mergeParams: true });
const { aiController } = require("./ai.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// All AI routes require Firebase authentication.
// No resource-level Casbin checks — every authenticated member of the tenant can use AI.

/**
 * POST /api/v1/tenants/:tenantID/ai/chat
 * Send a message to the AI agent and get a response with optional tool call trace.
 */
router.post("/chat", authMiddleware.authProvider, aiController.chat);

/**
 * POST /api/v1/tenants/:tenantID/ai/chat/stream
 * SSE stream — emits thinking/text/tool_start/tool_end/done events in real time.
 */
router.post("/chat/stream", authMiddleware.authProvider, aiController.streamChat);

/**
 * GET /api/v1/tenants/:tenantID/ai/session
 * Get current session message history.
 */
router.get("/session", authMiddleware.authProvider, aiController.getSession);

/**
 * DELETE /api/v1/tenants/:tenantID/ai/session
 * Clear the current session history (start fresh).
 */
router.delete("/session", authMiddleware.authProvider, aiController.clearSession);

module.exports = router;
