const { aiService } = require('./ai.service');
const { expressUtils } = require('../../utils/express.utils');
const constants = require('../../constants');
const Logger = require('../../utils/logger');

const aiController = {};

/**
 * POST /api/v1/tenants/:tenantID/ai/chat/stream
 *
 * Accepts the full message history from the useChat frontend hook and
 * streams an AI SDK data stream response back. The AI SDK's streamText
 * handles the multi-step agentic loop, MCP tool calls, and streaming.
 *
 * Response format: text/plain with X-Vercel-AI-Data-Stream: v1 header,
 * parsed natively by useChat on the frontend.
 */
aiController.streamChat = async (req, res) => {
  const { tenantID } = req.params;
  const { messages } = req.body;
  const userID = req.user?.userID || req.firebaseUser?.uid;

  const bearerToken =
    req.headers.authorization?.startsWith(constants.AUTH_PREFIXES.BEARER)
      ? req.headers.authorization.slice(constants.AUTH_PREFIXES.BEARER.length)
      : null;

  Logger.log('info', {
    message: 'aiController:streamChat:params',
    params: { userID, tenantID, messageCount: messages?.length },
  });

  if (!bearerToken) {
    return expressUtils.sendResponse(
      res,
      false,
      {},
      constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND,
      constants.HTTP_STATUS.UNAUTHORIZED
    );
  }

  try {
    await aiService.streamChat({ messages, tenantID, bearerToken, res });
  } catch (error) {
    Logger.log('error', {
      message: 'aiController:streamChat:catch-1',
      params: { userID, tenantID, error: error.message },
    });
    if (!res.headersSent) {
      return expressUtils.sendResponse(
        res,
        false,
        {},
        error,
        constants.HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
};

/**
 * DELETE /api/v1/tenants/:tenantID/ai/session
 *
 * No-op in the stateless AI SDK model — the client (useChat) owns
 * the conversation history. This endpoint exists for compatibility so
 * the frontend's "clear chat" button still works (it clears client-side
 * state and optionally pings this endpoint).
 */
aiController.clearSession = (req, res) => {
  const { tenantID } = req.params;
  const userID = req.user?.userID || req.firebaseUser?.uid;

  Logger.log('info', {
    message: 'aiController:clearSession:params',
    params: { userID, tenantID },
  });

  return expressUtils.sendResponse(res, true, { cleared: true }, null, constants.HTTP_STATUS.OK);
};

module.exports = { aiController };
