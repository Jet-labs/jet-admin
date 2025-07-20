
const constants = require("../../../constants");
const Logger = require("../../../utils/logger");
const {v4: uuid } = require("uuid");
const { aiController } = require("../ai.controller");
const { Socket } = require("socket.io");


const aiSocketController = {};

/**
 *
 * @param {object} param0
 * @param {Socket} param0.socket
 * @param {String} param0.firebaseID
 */
aiSocketController.subscribeUserToChatRoom = async ({ socket, firebaseID }) => {
  try {
    Logger.log("info", {
      message: "aiSocketController:subscribeUserToChatRoom",
      params: { firebaseID },
    });
    const chatRoomID = uuid();
    await socket.join(chatRoomID);
    socket.emit(constants.SOCKET_EMIT_EVENTS.AI_CHAT_ROOM_ID, { chatRoomID });
    Logger.log("success", {
      message: "aiSocketController:subscribeUserToChatRoom:user",
      params: { firebaseID },
    });
    return chatRoomID;
  } catch (error) {
    Logger.log("error", {
      message: "aiSocketController:subscribeUserToChatRoom:catch-1",
      params: { error },
    });
  }
};

aiSocketController.unsubscribeUserFromChatRoom = async ({
  socket,
  chatRoomID,
}) => {
    try {
      Logger.log("info", {
        message: "aiSocketController:unsubscribeUserFromChatRoom",
        params: { chatRoomID },
      });
      await socket.leave(chatRoomID);
      Logger.log("success", {
        message: "aiSocketController:unsubscribeUserFromChatRoom:user",
        params: { chatRoomID },
      });
    } catch (error) {
      Logger.log("error", {
        message: "aiSocketController:unsubscribeUserFromChatRoom:catch-1",
        params: { error },
      });
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Socket} param0.socket
   * @param {String} param0.message
   * @param {String} param0.chatRoomID
   */
   aiSocketController.onUserMessageReceived = async ({
     socket,
     message,
     chatRoomID,
     firebaseID,
     tenantID = 5,
   }) => {
     try {
       Logger.log("info", {
         message: "aiSocketController:onUserMessageReceived",
         params: { message, chatRoomID, firebaseID,tenantID },
       });

       let botResponse;

       switch(message.action){
        case 'approve':
            botResponse =
              await aiController.generateRechartsJSXFromQueryResult({
                aiPrompt: message,
                firebaseID,
                tenantID,
              });
          break;
        case 'reject':
        case 'test':
        default:
            botResponse =
              await aiController.generateAIPromptForChatVisualization({
                aiPrompt: message,
                firebaseID,
                tenantID,
              });
          break;
       }

       
       await socket
         .emit(constants.SOCKET_EMIT_EVENTS.AI_CHAT_BOT_MESSAGE, {
           text: botResponse,
         });
       Logger.log("success", {
         message: "aiSocketController:onUserMessageReceived:botResponse",
         params: { message, chatRoomID ,firebaseID,tenantID},
       });
     } catch (error) {
       Logger.log("error", {
         message: "aiSocketController:onUserMessageReceived:catch-1",
         params: { error },
       });
     }
   };
  

module.exports = { aiSocketController };