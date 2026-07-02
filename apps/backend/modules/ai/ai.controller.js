const { aiService } = require("./ai.service");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");

const aiController = {};

/**
 * POST /api/v1/tenants/:tenantID/ai/chat/stream
 * SSE stream — emits thinking, text, tool_start, tool_end, done events.
 */
aiController.streamChat = async (req, res) => {
  const { tenantID } = req.params;
  const { message } = req.body;
  const userID = req.user?.userID || req.firebaseUser?.uid;
  const bearerToken =
    req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split("Bearer ")[1]
      : null;

  Logger.log("info", {
    message: "aiController:streamChat:params",
    params: { userID, tenantID, messageLength: message?.length },
  });

  if (!message || typeof message !== "string" || message.trim() === "") {
    res.status(400).json({ success: false, error: { message: "message is required" } });
    return;
  }

  // Delegate to service — it owns the SSE lifecycle (headers + res.end)
  try {
    await aiService.streamChat({
      userID,
      tenantID,
      message: message.trim(),
      bearerToken,
      res,
    });
  } catch (error) {
    Logger.log("error", {
      message: "aiController:streamChat:uncaught",
      params: { userID, tenantID, error: error.message },
    });
    // If headers weren't sent yet, send a normal error
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: { message: error.message } });
    } else {
      // Headers already sent (SSE started) — send error event and close
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    }
  }
};

/**
 * POST /api/v1/tenants/:tenantID/ai/chat
 * Body: { message: string }
 * Returns: { success, reply, toolCallSteps, messageCount }
 */
aiController.chat = async (req, res) => {
  const { tenantID } = req.params;
  const { message } = req.body;
  const userID = req.user?.userID || req.firebaseUser?.uid;

  // Extract the raw Firebase JWT that was already verified by authProvider.
  // We forward it into the AI service so tool calls run under this user's identity.
  const bearerToken =
    req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split("Bearer ")[1]
      : null;

  Logger.log("info", {
    message: "aiController:chat:params",
    params: { userID, tenantID, messageLength: message?.length, hasBearerToken: !!bearerToken },
  });

  if (!message || typeof message !== "string" || message.trim() === "") {
    return expressUtils.sendResponse(res, false, {}, { message: "message is required" });
  }

  try {
    const result = await aiService.chat({
      userID,
      tenantID,
      message: message.trim(),
      bearerToken,
    });

    return expressUtils.sendResponse(res, true, {
      reply: result.reply,
      toolCallSteps: result.toolCallSteps,
      messageCount: result.messageCount,
    });
  } catch (error) {
    Logger.log("error", {
      message: "aiController:chat:error",
      params: { userID, tenantID, error: error.message },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * GET /api/v1/tenants/:tenantID/ai/session
 * Returns current session message history (excluding system prompt).
 */
aiController.getSession = (req, res) => {
  const { tenantID } = req.params;
  const userID = req.user?.userID || req.firebaseUser?.uid;

  const result = aiService.getSession({ userID, tenantID });
  return expressUtils.sendResponse(res, true, result);
};

/**
 * DELETE /api/v1/tenants/:tenantID/ai/session
 * Clears the session for this user+tenant.
 */
aiController.clearSession = (req, res) => {
  const { tenantID } = req.params;
  const userID = req.user?.userID || req.firebaseUser?.uid;

  const result = aiService.clearSession({ userID, tenantID });
  return expressUtils.sendResponse(res, true, result);
};

module.exports = { aiController };
