const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { databaseChatService } = require("./databaseChat.service");

const databaseChatController = {};

databaseChatController.sendMessage = async (req, res) => {
  const { tenantID } = req.params;
  const { message, conversationHistory = [] } = req.body;
  const { userID } = req.user;
  const dbPool = req.dbPool;

  try {
    // The Gateway handles the complexity now
    const response = await databaseChatService.processUserRequest({
      userID,
      tenantID,
      message,
      history: conversationHistory,
      dbPool
    });

    Logger.log("success", {
      message: "databaseChatController:sendMessage:success",
      params: { userID, tenantID, mode: response.metadata?.mode },
    });

    return expressUtils.sendResponse(res, true, response);
  } catch (error) {
    Logger.log("error", {
      message: "databaseChatController:sendMessage:error",
      params: { error: error.message },
    });
    return expressUtils.sendResponse(res, false, null, error.message);
  }
};

module.exports = { databaseChatController };