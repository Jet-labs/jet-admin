/**
 * Execution Context Utilities
 *
 * Provides structured context objects that propagate through internal
 * service calls (workflow → query, listener → workflow, cron → workflow).
 *
 * This solves the "Confused Deputy" problem:
 *   - A user can run Workflow W, which internally runs Query Q.
 *   - The user does NOT have direct permission to run Q.
 *   - The execution context allows Q to verify that the call originated
 *     from W, and that the user is authorized to run W.
 */

// ── Caller Types ─────────────────────────────────────────────────────────────

const CALLER_TYPES = {
  USER: "user",
  API_KEY: "apiKey",
  SYSTEM: "system",
};

// ── Originating Resource Types ───────────────────────────────────────────────

const ORIGIN_TYPES = {
  WORKFLOW: "workflow",
  APP_PAGE: "appPage",
  LISTENER: "listener",
  CRON: "cron",
  DIRECT: "direct", // Direct API call, no parent resource
};

// ── Factory Functions ────────────────────────────────────────────────────────

/**
 * Create an execution context for a direct user API call.
 *
 * @param {object} user - The authenticated user object from req.user
 * @param {string} tenantID
 * @returns {ExecutionContext}
 */
function createUserContext(user, tenantID) {
  return {
    caller: {
      type: CALLER_TYPES.USER,
      id: user.userID,
      email: user.email,
    },
    tenantID,
    originatingResource: null,
  };
}

/**
 * Create an execution context for an API key call.
 *
 * @param {object} apiKey - The API key data from authContext
 * @param {object} user - The user associated with the API key
 * @param {string} tenantID
 * @returns {ExecutionContext}
 */
function createApiKeyContext(apiKey, user, tenantID) {
  return {
    caller: {
      type: CALLER_TYPES.API_KEY,
      id: apiKey.apiKeyID,
      userID: user?.userID,
      email: user?.email,
    },
    tenantID,
    originatingResource: null,
  };
}

/**
 * Create an execution context for a system-triggered call
 * (listener pipeline, cron job, etc.).
 *
 * @param {string} originType - One of ORIGIN_TYPES
 * @param {string} originID   - The ID of the originating resource
 * @param {string} tenantID
 * @returns {ExecutionContext}
 */
function createSystemContext(originType, originID, tenantID) {
  return {
    caller: {
      type: CALLER_TYPES.SYSTEM,
      id: `${originType}:${originID}`,
    },
    tenantID,
    originatingResource: {
      type: originType,
      id: originID,
    },
  };
}

/**
 * Derive a child execution context from a parent context.
 * Used when a workflow node triggers a sub-resource (e.g., a query).
 *
 * The caller identity stays the same (preserving RLS user context),
 * but the originating resource changes to the parent workflow/page.
 *
 * @param {ExecutionContext} parentCtx - The parent execution context
 * @param {string} originType - Type of the new originating resource
 * @param {string} originID   - ID of the new originating resource
 * @returns {ExecutionContext}
 */
function deriveChildContext(parentCtx, originType, originID) {
  return {
    ...parentCtx,
    originatingResource: {
      type: originType,
      id: originID,
    },
    parentContext: parentCtx.originatingResource || null,
  };
}

/**
 * Build execution context from an Express request.
 * Inspects req.authContext to determine caller type.
 *
 * @param {import("express").Request} req
 * @returns {ExecutionContext}
 */
function fromRequest(req) {
  const { user, authContext } = req;
  const tenantID = req.params.tenantID;
  const { AUTH_TYPES } = require("../types/auth.types");

  if (authContext?.authType === AUTH_TYPES.API_KEY && authContext.apiKey) {
    return createApiKeyContext(authContext.apiKey, user, tenantID);
  }

  return createUserContext(user, tenantID);
}

/**
 * Check if the context represents a system (non-user) caller.
 *
 * @param {ExecutionContext} ctx
 * @returns {boolean}
 */
function isSystemCaller(ctx) {
  return ctx?.caller?.type === CALLER_TYPES.SYSTEM;
}

/**
 * Check if the context has an originating resource
 * (i.e., is an indirect/delegated call).
 *
 * @param {ExecutionContext} ctx
 * @returns {boolean}
 */
function isDelegatedCall(ctx) {
  return !!ctx?.originatingResource;
}

/**
 * Extract the user ID from any execution context.
 * For system callers, returns null.
 *
 * @param {ExecutionContext} ctx
 * @returns {string|null}
 */
function getCallerUserID(ctx) {
  if (!ctx?.caller) return null;
  if (ctx.caller.type === CALLER_TYPES.USER) return ctx.caller.id;
  if (ctx.caller.type === CALLER_TYPES.API_KEY) return ctx.caller.userID;
  return null;
}

module.exports = {
  CALLER_TYPES,
  ORIGIN_TYPES,
  createUserContext,
  createApiKeyContext,
  createSystemContext,
  deriveChildContext,
  fromRequest,
  isSystemCaller,
  isDelegatedCall,
  getCallerUserID,
};
