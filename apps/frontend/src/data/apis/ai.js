/* eslint-disable no-useless-catch */
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";
import axios from "axios";

/**
 * Stream a message using SSE. Calls handler callbacks as events arrive.
 *
 * @param {{ tenantID: string, message: string }} params
 * @param {{
 *   onThinking: (content: string) => void,
 *   onText:     (content: string) => void,
 *   onToolStart:(toolName: string, args: object) => void,
 *   onToolEnd:  (toolName: string, result: any, error: string|null) => void,
 *   onDone:     (messageCount: number) => void,
 *   onError:    (message: string) => void,
 * }} callbacks
 * @returns {Promise<void>}
 */
export const streamChatWithAgentAPI = async (
  { tenantID, message },
  { onThinking, onText, onToolStart, onToolEnd, onDone, onError }
) => {
  const url =
    CONSTANTS.SERVER_HOST + CONSTANTS.APIS.AI.chatStream(tenantID);
  const bearerToken = await firebaseAuth.currentUser.getIdToken();
  if (!bearerToken) throw new Error("Not authenticated");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  // SSE line parser: lines are "event: <type>\ndata: <json>\n\n"
  function processBuffer() {
    const events = buffer.split("\n\n");
    buffer = events.pop(); // keep incomplete last chunk
    for (const block of events) {
      let eventType = "message";
      let dataStr = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event: ")) eventType = line.slice(7).trim();
        if (line.startsWith("data: ")) dataStr = line.slice(6).trim();
      }
      if (!dataStr) continue;
      let data;
      try { data = JSON.parse(dataStr); } catch (_) { continue; }

      if (eventType === "thinking") onThinking?.(data.content);
      else if (eventType === "text") onText?.(data.content);
      else if (eventType === "tool_start") onToolStart?.(data.toolName, data.args);
      else if (eventType === "tool_end") onToolEnd?.(data.toolName, data.result, data.error);
      else if (eventType === "done") onDone?.(data.messageCount);
      else if (eventType === "error") onError?.(data.message);
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    processBuffer();
  }
  // Flush any remaining buffer
  if (buffer.trim()) processBuffer();
};

/**
 * Non-streaming fallback — returns full reply at once.
 */
export const chatWithAgentAPI = async ({ tenantID, message }) => {
  try {
    const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.AI.chat(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (!bearerToken) throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;

    const response = await axios.post(
      url,
      { message },
      { headers: { authorization: `Bearer ${bearerToken}` } }
    );
    if (response.data?.success === true) {
      return {
        reply: response.data.reply,
        toolCallSteps: response.data.toolCallSteps || [],
        messageCount: response.data.messageCount,
      };
    } else if (response.data.error) throw response.data.error;
    else throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
  } catch (error) { throw error; }
};

/**
 * Get the current session message history for this tenant.
 */
export const getAISessionAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.AI.session(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (!bearerToken) throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;

    const response = await axios.get(url, {
      headers: { authorization: `Bearer ${bearerToken}` },
    });

    if (response.data && response.data.success === true) {
      return {
        messages: response.data.messages || [],
        messageCount: response.data.messageCount || 0,
      };
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Clear the AI session for this tenant (wipe conversation history).
 */
export const clearAISessionAPI = async ({ tenantID }) => {
  try {
    const url =
      CONSTANTS.SERVER_HOST +
      CONSTANTS.APIS.AI.session(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (!bearerToken) throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;

    const response = await axios.delete(url, {
      headers: { authorization: `Bearer ${bearerToken}` },
    });

    if (response.data && response.data.success === true) {
      return true;
    } else if (response.data.error) {
      throw response.data.error;
    } else {
      throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
    }
  } catch (error) {
    throw error;
  }
};
