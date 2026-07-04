/* eslint-disable no-useless-catch */
import { firebaseAuth } from '../../config/firebase';
import { CONSTANTS } from '../../constants';
import axios from 'axios';

/**
 * Clear the AI session (no-op on the server — client manages history).
 * Calling this allows the frontend to optionally notify the server
 * when the user clicks "clear chat", though the server is stateless.
 */
export const clearAISessionAPI = async ({ tenantID }) => {
  try {
    const url = CONSTANTS.SERVER_HOST + CONSTANTS.APIS.AI.session(tenantID);
    const bearerToken = await firebaseAuth.currentUser.getIdToken();
    if (!bearerToken) throw CONSTANTS.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND;

    const response = await axios.delete(url, {
      headers: { authorization: `Bearer ${bearerToken}` },
    });

    if (response.data?.success === true) return true;
    else if (response.data?.error) throw response.data.error;
    else throw CONSTANTS.ERROR_CODES.SERVER_ERROR;
  } catch (error) {
    throw error;
  }
};

/**
 * Returns a fresh Firebase Bearer token for use in useChat's fetch override.
 * Call this inside the fetch option of useChat to ensure tokens are never stale.
 */
export const getAIBearerToken = async () => {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
};

/**
 * Build the URL for the AI chat streaming endpoint (used by useChat api option).
 */
export const getAIChatStreamURL = (tenantID) =>
  CONSTANTS.SERVER_HOST + CONSTANTS.APIS.AI.chatStream(tenantID);
