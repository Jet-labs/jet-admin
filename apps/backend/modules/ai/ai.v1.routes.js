const express = require('express');
const { aiController } = require('./ai.controller');
const { authMiddleware } = require('../auth/auth.middleware');
const { validate } = require('../../utils/validation.utils');
const { streamChatBodySchema } = require('./ai.validator');
const { schemas } = require('../../utils/validation.utils');
const { P } = require('../../config/permissions');

const router = express.Router({ mergeParams: true });

/**
 * POST /api/v1/tenants/:tenantID/ai/chat/stream
 *
 * Streams an AI SDK data stream response to the useChat frontend hook.
 * Body: { messages: UIMessage[] } — full conversation history from useChat.
 */
router.post(
  '/chat/stream',
  authMiddleware.authProvider,
  validate(schemas.tenantIdParamSchema, 'params'),
  validate(streamChatBodySchema, 'body'),
  authMiddleware.checkTenantMembership,
  authMiddleware.authorize(P.ai.chat),
  aiController.streamChat
);

/**
 * DELETE /api/v1/tenants/:tenantID/ai/session
 * No-op in the stateless model — exists for frontend compatibility.
 */
router.delete(
  '/session',
  authMiddleware.authProvider,
  validate(schemas.tenantIdParamSchema, 'params'),
  authMiddleware.checkTenantMembership,
  authMiddleware.authorize(P.ai.delete),
  aiController.clearSession
);

module.exports = router;
