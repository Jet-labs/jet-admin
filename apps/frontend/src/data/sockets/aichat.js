// eslint-disable-next-line no-unused-vars
import { Socket } from "socket.io-client";
import { CONSTANTS } from "../../constants";

/**
 * 
 * @param {Socket} socket 
 * @param {function} onConnected
 */
export const connectToAIChatSocket = async(socket) => {
    try{
        await socket.emit(CONSTANTS.SOCKET_EMIT_EVENTS.AI_CHAT_ROOM_JOIN);
    }catch(error){
        console.log(error);
        throw error;
    }
};

/**
 * 
 * @param {Socket} socket 
 * @param {string} onDisconnect
 */
export const disconnectFromAIChatSocket = async(socket) => {
    try {
      await socket.emit(CONSTANTS.SOCKET_EMIT_EVENTS.AI_CHAT_ROOM_DISCONNECT);
    } catch (error) {
      console.log(error);
      throw error;
    }
};

/**
 * 
 * @param {Socket} socket 
 * @param {string} message 
 * @param {string} roomId 
 */
export const sendAIChatMessage = async(socket, message, roomId) => {
    try {
      await socket.emit(CONSTANTS.SOCKET_EMIT_EVENTS.AI_CHAT_USER_MESSAGE, { message, roomId });
    } catch (error) {
      console.log(error);
      throw error;
    }
};