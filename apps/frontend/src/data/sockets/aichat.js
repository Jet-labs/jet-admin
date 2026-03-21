import { Socket } from "socket.io-client";
import { CONSTANTS } from "../../constants";

/**
 * Sends a message to the agentic AI backend.
 * @param {Socket} socket 
 * @param {Object} payload 
 * @param {string} payload.chatRoomID
 * @param {string} payload.tenantID
 * @param {string} payload.message
 */
export const sendAgentUserMessage = async(socket, payload) => {
    try {
      await socket.emit(CONSTANTS.SOCKET_EMIT_EVENTS.AGENT_USER_MESSAGE, payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
};

/**
 * Sends datasource approval to the agent.
 * @param {Socket} socket 
 * @param {Object} payload 
 */
export const sendAgentDatasourceApproval = async(socket, payload) => {
    try {
      await socket.emit(CONSTANTS.SOCKET_EMIT_EVENTS.AGENT_DATASOURCE_APPROVAL, payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
};

/**
 * Sends query execution approval to the agent.
 * @param {Socket} socket 
 * @param {Object} payload 
 */
export const sendAgentQueryApproval = async(socket, payload) => {
    try {
      await socket.emit(CONSTANTS.SOCKET_EMIT_EVENTS.AGENT_QUERY_APPROVAL, payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
};

/**
 * Sends request to promote agent thread to a widget.
 * @param {Socket} socket 
 * @param {Object} payload 
 */
export const sendAgentPromoteToWidget = async(socket, payload) => {
    try {
      await socket.emit(CONSTANTS.SOCKET_EMIT_EVENTS.AGENT_PROMOTE_TO_WIDGET, payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
};

/**
 * Cancels an ongoing agent request.
 * @param {Socket} socket 
 * @param {Object} payload 
 */
export const sendAgentCancel = async(socket, payload) => {
    try {
      await socket.emit(CONSTANTS.SOCKET_EMIT_EVENTS.AGENT_CANCEL, payload);
    } catch (error) {
      console.error(error);
      throw error;
    }
};