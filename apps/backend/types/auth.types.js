/**
 * Authentication Types for Jet Admin
 * 
 * This file contains type definitions for the authentication context
 * used throughout the application.
 */

/**
 * @typedef {'USER' | 'API_KEY'} AuthType
 * The type of authentication used for the current request.
 * - 'USER': Direct user authentication via Firebase/Bearer token
 * - 'API_KEY': Authentication via API key
 */

/**
 * @typedef {Object} APIKeyData
 * @property {string} apiKeyID - The unique identifier of the API key
 * @property {string} tenantID - The tenant ID the API key belongs to
 * @property {string} apiKeyTitle - The title/name of the API key
 * @property {string} creatorID - The user ID of the API key creator
 * @property {boolean} isDisabled - Whether the API key is disabled
 * @property {Date} createdAt - When the API key was created
 */

/**
 * @typedef {Object} UserData
 * @property {string} userID - The unique identifier of the user
 * @property {string} email - The user's email address
 * @property {string} [firstName] - The user's first name
 * @property {string} [lastName] - The user's last name
 * @property {string} firebaseID - The user's Firebase ID
 */

/**
 * @typedef {Object} AuthContext
 * @property {AuthType} authType - Type of authentication used
 * @property {UserData} user - User object (for API keys, this is the creator)
 * @property {APIKeyData|null} apiKey - API key data (null for direct user auth)
 */

/**
 * Auth type constants
 */
const AUTH_TYPES = {
  USER: 'USER',
  API_KEY: 'API_KEY',
};

module.exports = {
  AUTH_TYPES,
};
