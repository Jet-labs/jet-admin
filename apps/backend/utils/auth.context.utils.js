/**
 * Auth Context Utilities
 * 
 * Helper functions for working with authentication context in controllers and services.
 */

const { AUTH_TYPES } = require('../types/auth.types');

/**
 * Extracts auth context from request for use in services and logging.
 * 
 * @param {import('express').Request} req - Express request object
 * @returns {Object} Auth context object with type, user info, and API key info
 */
function getAuthContext(req) {
  const authContext = req.authContext || {};
  const authType = authContext.authType || AUTH_TYPES.USER;
  
  return {
    authType,
    userID: req.user?.userID || null,
    apiKeyID: authContext.apiKey?.apiKeyID || null,
    // For logging purposes - identifies who/what performed the action
    actorType: authType,
    actorID: authType === AUTH_TYPES.API_KEY 
      ? authContext.apiKey?.apiKeyID 
      : req.user?.userID,
    // Human-readable actor description for logs
    actorDescription: authType === AUTH_TYPES.API_KEY
      ? `API Key: ${authContext.apiKey?.apiKeyTitle || authContext.apiKey?.apiKeyID}`
      : `User: ${req.user?.email || req.user?.userID}`,
  };
}

/**
 * Gets the userID to use as creatorID for new resources.
 * For API keys, this returns the creator of the API key (the human user).
 * 
 * @param {import('express').Request} req - Express request object
 * @returns {string|null} The user ID to use as creator
 */
function getCreatorID(req) {
  // Always use the human user's ID for resource ownership
  // For API keys, req.user is already set to the API key creator
  return req.user?.userID || null;
}

/**
 * Checks if the current request is authenticated via API key.
 * 
 * @param {import('express').Request} req - Express request object
 * @returns {boolean} True if authenticated via API key
 */
function isAPIKeyAuth(req) {
  return req.authContext?.authType === AUTH_TYPES.API_KEY;
}

/**
 * Checks if the current request is authenticated via direct user login.
 * 
 * @param {import('express').Request} req - Express request object
 * @returns {boolean} True if authenticated via user login
 */
function isUserAuth(req) {
  return !req.authContext?.authType || req.authContext?.authType === AUTH_TYPES.USER;
}

/**
 * Gets logging metadata that includes auth context.
 * Useful for including in service logs.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {Object} additionalParams - Additional parameters to include
 * @returns {Object} Merged logging parameters
 */
function getLoggingParams(req, additionalParams = {}) {
  const authContext = getAuthContext(req);
  
  return {
    ...additionalParams,
    userID: authContext.userID,
    authType: authContext.authType,
    ...(authContext.apiKeyID && { apiKeyID: authContext.apiKeyID }),
  };
}

/**
 * Creates a standardized auth context object for passing to services.
 * This provides all necessary auth information for services to use.
 * 
 * @param {import('express').Request} req - Express request object
 * @returns {Object} Auth context for service methods
 */
function getServiceAuthContext(req) {
  const authType = req.authContext?.authType || AUTH_TYPES.USER;
  
  return {
    authType,
    userID: req.user?.userID || null,
    apiKeyID: authType === AUTH_TYPES.API_KEY ? req.authContext?.apiKey?.apiKeyID : null,
    apiKeyTitle: authType === AUTH_TYPES.API_KEY ? req.authContext?.apiKey?.apiKeyTitle : null,
    // Actor info - who is performing the action
    actorID: authType === AUTH_TYPES.API_KEY 
      ? req.authContext?.apiKey?.apiKeyID 
      : req.user?.userID,
    actorType: authType,
  };
}

/**
 * Formats auth context for logging purposes.
 * Returns a concise object suitable for log params.
 * 
 * @param {Object} authContext - Auth context from getServiceAuthContext
 * @returns {Object} Formatted auth context for logging
 */
function formatAuthContextForLog(authContext) {
  if (!authContext) return { authType: 'UNKNOWN' };
  
  const logContext = {
    authType: authContext.authType,
  };
  
  if (authContext.authType === AUTH_TYPES.API_KEY) {
    logContext.apiKeyID = authContext.apiKeyID;
    logContext.apiKeyTitle = authContext.apiKeyTitle;
    logContext.userID = authContext.userID; // Creator ID
  } else {
    logContext.userID = authContext.userID;
  }
  
  return logContext;
}

/**
 * Gets the creation context for resource creation.
 * Uses mutually exclusive pattern:
 * - User auth: creatorID is set, createdByApiKeyID is null
 * - API key auth: creatorID is null, createdByApiKeyID is set
 * 
 * Use this when creating resources that have a creatorID field.
 * 
 * @param {import('express').Request} req - Express request object
 * @returns {Object} Object with creatorID and createdByApiKeyID (mutually exclusive)
 * 
 * @example
 * const { creatorID, createdByApiKeyID } = getCreationContext(req);
 * await prisma.tblWorkflows.create({
 *   data: {
 *     title,
 *     creatorID,           // null if created via API key
 *     createdByApiKeyID,   // null if created by user directly
 *     // ...other fields
 *   }
 * });
 */
function getCreationContext(req) {
  const authType = req.authContext?.authType || AUTH_TYPES.USER;
  
  if (authType === AUTH_TYPES.API_KEY) {
    return {
      creatorID: null, // No human user - API key created this
      createdByApiKeyID: req.authContext?.apiKey?.apiKeyID || null,
    };
  }
  
  return {
    creatorID: req.user?.userID || null, // Human user created this
    createdByApiKeyID: null,
  };
}

/**
 * Gets creation context from an authContext object (for use in services).
 * Uses mutually exclusive pattern:
 * - User auth: creatorID is set, createdByApiKeyID is null
 * - API key auth: creatorID is null, createdByApiKeyID is set
 * 
 * @param {Object} authContext - Auth context from getServiceAuthContext
 * @returns {Object} Object with creatorID and createdByApiKeyID (mutually exclusive)
 * 
 * @example
 * // In a service:
 * const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
 */
function getCreationContextFromAuthContext(authContext) {
  if (!authContext) {
    return {
      creatorID: null,
      createdByApiKeyID: null,
    };
  }
  
  if (authContext.authType === AUTH_TYPES.API_KEY) {
    return {
      creatorID: null, // No human user - API key created this
      createdByApiKeyID: authContext.apiKeyID || null,
    };
  }
  
  return {
    creatorID: authContext.userID || null, // Human user created this
    createdByApiKeyID: null,
  };
}

module.exports = {
  getAuthContext,
  getCreatorID,
  isAPIKeyAuth,
  isUserAuth,
  getLoggingParams,
  getServiceAuthContext,
  formatAuthContextForLog,
  getCreationContext,
  getCreationContextFromAuthContext,
};
