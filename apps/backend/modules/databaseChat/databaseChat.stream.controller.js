const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { databaseChatService } = require("./databaseChat.service");

const databaseChatStreamController = {};

/**
 * SSE Streaming endpoint for database chat
 * Streams events as they happen for real-time UI updates
 */
databaseChatStreamController.streamMessage = async (req, res) => {
  const { tenantID } = req.params;
  const { message, conversationHistory = [], readOnlyMode = true } = req.body;
  const { userID } = req.user;
  const dbPool = req.dbPool;

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.flushHeaders();

  // Helper to send SSE events
  const sendEvent = (eventType, data) => {
    res.write(`event: ${eventType}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Handle client disconnect
  let isClientConnected = true;
  req.on("close", () => {
    isClientConnected = false;
    Logger.log("info", { message: "databaseChatStreamController:clientDisconnected" });
  });

  try {
    // Stream the response using the generator
    const stream = databaseChatService.processUserRequestStream({
      userID,
      tenantID,
      message,
      history: conversationHistory,
      dbPool,
      readOnlyMode
    });

    for await (const event of stream) {
      if (!isClientConnected) break;
      sendEvent(event.type, event.data);
    }

    Logger.log("success", {
      message: "databaseChatStreamController:streamMessage:success",
      params: { userID, tenantID },
    });

  } catch (error) {
    Logger.log("error", {
      message: "databaseChatStreamController:streamMessage:error",
      params: { error: error.message },
    });

    if (isClientConnected) {
      sendEvent("error", { message: error.message });
    }
  } finally {
    if (isClientConnected) {
      res.end();
    }
  }
};

module.exports = { databaseChatStreamController };
