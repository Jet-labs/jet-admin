/* eslint-disable no-useless-catch */
import axios from "axios";
import { firebaseAuth } from "../../config/firebase";
import { CONSTANTS } from "../../constants";

/**
 * Send a natural language message to the database chat endpoint
 * @param {object} params
 * @param {string} params.tenantID - Tenant ID
 * @param {string} params.message - Natural language message
 * @param {Array} params.conversationHistory - Previous conversation turns
 * @returns {Promise<object>} - Rich content response
 */
export const sendDatabaseChatMessage = async ({
  tenantID,
  message,
  conversationHistory = [],
}) => {
  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/chat/message`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();

    if (bearerToken) {
      const response = await axios.post(
        url,
        { message, conversationHistory },
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      if (response.data && response.data.success === true) {
        // Response has type and content at root level
        return {
          type: response.data.type,
          content: response.data.content,
          metadata: response.data.metadata,
        };
      } else if (response.data.error) {
        throw response.data.error;
      } else {
        throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
      }
    } else {
      throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Stream a natural language message using SSE
 * @param {object} params
 * @param {string} params.tenantID - Tenant ID
 * @param {string} params.message - Natural language message
 * @param {Array} params.conversationHistory - Previous conversation turns
 * @param {boolean} params.readOnlyMode - If true, write queries are analyzed but not executed
 * @param {Function} params.onEvent - Callback for each SSE event ({ type, data })
 * @param {Function} params.onComplete - Callback when stream completes with final response
 * @param {Function} params.onError - Callback for errors
 * @returns {AbortController} - Controller to cancel the stream
 */
export const streamDatabaseChatMessage = async ({
  tenantID,
  message,
  conversationHistory = [],
  readOnlyMode = true,
  onEvent,
  onComplete,
  onError,
}) => {
  const abortController = new AbortController();

  try {
    const url = `${CONSTANTS.SERVER_HOST}/api/v1/tenants/${tenantID}/database/chat/message/stream`;
    const bearerToken = await firebaseAuth.currentUser.getIdToken();

    if (!bearerToken) {
      throw new Error(CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ message, conversationHistory, readOnlyMode }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // Parse SSE events from the stream
    const processLine = (line) => {
      if (line.startsWith("event: ")) {
        // Extract event type from previous line
        return { eventType: line.slice(7).trim() };
      } else if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          return { data };
        } catch {
          return { data: line.slice(6) };
        }
      }
      return null;
    };

    let currentEventType = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.startsWith("event: ")) {
          currentEventType = trimmedLine.slice(7).trim();
        } else if (trimmedLine.startsWith("data: ") && currentEventType) {
          try {
            const data = JSON.parse(trimmedLine.slice(6));
            const event = { type: currentEventType, data };

            if (onEvent) {
              onEvent(event);
            }

            // Call onComplete when we get the final response
            if (currentEventType === "complete" && onComplete) {
              onComplete(data);
            }

            // Handle errors
            if (currentEventType === "error" && onError) {
              onError(new Error(data.message || "Stream error"));
            }
          } catch (parseError) {
            console.warn("Failed to parse SSE data:", trimmedLine);
          }
          currentEventType = null;
        }
      }
    }

  } catch (error) {
    if (error.name === "AbortError") {
      // Stream was cancelled, not an error
      return abortController;
    }

    if (onError) {
      onError(error);
    }
  }

  return abortController;
};
