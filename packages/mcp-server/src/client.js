/**
 * client.js
 *
 * Factory that creates a tenant-scoped HTTP client for the Jet Admin backend.
 * Each call to createApiClient() returns a fresh set of API methods bound to
 * the given tenantId and apiKey — enabling true multi-tenant usage.
 *
 * In stdio mode:  context comes from env vars (one tenant per process)
 * In HTTP mode:   context comes from the authenticated request (any tenant)
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const axios = require("axios");

import { config, debugLog } from "./config.js";
import { withRetry } from "./utils.js";

/**
 * Normalizes an Axios error into a plain Error with a readable message.
 * @param {import("axios").AxiosError} err
 * @returns {Error}
 */
function normalizeError(err) {
  if (err.response) {
    const status = err.response.status;
    const data = err.response.data;
    let msg;

    // Try to extract a human-readable message from various response shapes
    if (data && typeof data === "object") {
      msg = data?.error?.message || data?.message || data?.error;
    }
    if (!msg) msg = `HTTP ${status}`;

    const e = new Error(`Jet Admin API error: ${msg}`);
    e.status = status;
    e.data = data;

    // Add specific hints for well-known status codes
    if (status === 429) {
      e.message = "Jet Admin API error: Rate limit exceeded — please wait before retrying.";
    } else if (status === 503) {
      e.message = "Jet Admin API error: Service temporarily unavailable (503).";
    }

    return e;
  }
  if (err.request) {
    const e = new Error(
      `Jet Admin API unreachable at ${config.baseUrl} — is the backend running?`
    );
    e.code = err.code;
    return e;
  }
  return err;
}

/**
 * Creates a fully scoped API client for a specific tenant.
 *
 * Accepts a context object with either a Bearer token (user identity)
 * or an API key (MCP stdio mode / service-to-service).
 *
 * @param {string} tenantId     - The Jet Admin tenant UUID
 * @param {string} [apiKey]     - Raw API key (without prefix). Used in stdio/MCP mode.
 * @param {string} [bearerToken]- Firebase JWT. Used when the AI agent acts on behalf of a user.
 *
 * @example
 * // User-identity mode (AI chat panel):
 * createApiClient(tenantId, null, req.bearerToken)
 *
 * // API key mode (MCP stdio):
 * createApiClient(tenantId, context.apiKey)
 */
export function createApiClient(tenantId, apiKey, bearerToken) {
  if (!tenantId) throw new Error("createApiClient: tenantId is required");
  if (!apiKey && !bearerToken)
    throw new Error("createApiClient: either apiKey or bearerToken is required");

  /** Tenant-scoped base path for all resource endpoints */
  const T = `/api/v1/tenants/${tenantId}`;

  // Prefer user Bearer token when available (AI chat panel path)
  const authHeader = bearerToken
    ? `Bearer ${bearerToken}`
    : `api_key ${apiKey}`;

  /** Axios instance scoped to this tenant's credentials */
  const http = axios.create({
    baseURL: config.baseUrl,
    timeout: config.timeout,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
  });

  /**
   * Executes an API call with retry and normalizes the response.
   * Jet Admin wraps responses in { success: true, data: { ... } }
   */
  async function call(fn) {
    try {
      debugLog(`→ [tenant:${tenantId}]`, fn.name || "request");

      const response = await withRetry(() => fn());

      debugLog(`←`, response.status);

      const body = response.data;

      // Guard against non-object body (e.g. empty string on 204)
      if (!body || typeof body !== "object") {
        return body ?? null;
      }

      if (body.success === false) {
        const msg = body.error?.message || body.error || "Unknown API error";
        const e = new Error(`Jet Admin API error: ${msg}`);
        e._isJetAdminError = true;
        throw e;
      }

      return body?.data ?? body;
    } catch (err) {
      // If we manually threw a structured Jet Admin error above, rethrow it as-is
      if (err._isJetAdminError) {
        throw err;
      }
      throw normalizeError(err);
    }
  }

  // ─── Datasource API ──────────────────────────────────────────────────────

  const datasourceAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/datasources`, { params })),

    getById: (datasourceID) =>
      call(() => http.get(`${T}/datasources/${datasourceID}`)),

    create: (body) =>
      call(() => http.post(`${T}/datasources`, body)),

    update: (datasourceID, body) =>
      call(() => http.patch(`${T}/datasources/${datasourceID}`, body)),

    delete: (datasourceID) =>
      call(() => http.delete(`${T}/datasources/${datasourceID}`)),

    test: (body) =>
      call(() => http.post(`${T}/datasources/test`, body)),

    proxy: (datasourceID, body) =>
      call(() => http.post(`${T}/datasources/${datasourceID}/proxy`, body)),
  };

  // ─── Data Query API ──────────────────────────────────────────────────────

  const queryAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/queries`, { params })),

    getById: (dataQueryID) =>
      call(() => http.get(`${T}/queries/${dataQueryID}`)),

    create: (body) =>
      call(() => http.post(`${T}/queries`, body)),

    update: (dataQueryID, body) =>
      call(() => http.patch(`${T}/queries/${dataQueryID}`, body)),

    delete: (dataQueryID) =>
      call(() => http.delete(`${T}/queries/${dataQueryID}`)),

    run: (dataQueryID, body = {}) =>
      call(() => http.post(`${T}/queries/${dataQueryID}/run`, body)),

    test: (dataQueryID, body = {}) =>
      call(() => http.post(`${T}/queries/${dataQueryID}/queryTest`, body)),

    testByData: (body) =>
      call(() => http.patch(`${T}/queries/queryTest`, body)),
  };

  // ─── Listener API ────────────────────────────────────────────────────────

  const listenerAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/listeners`, { params })),

    getById: (listenerID) =>
      call(() => http.get(`${T}/listeners/${listenerID}`)),

    create: (body) =>
      call(() => http.post(`${T}/listeners`, body)),

    update: (listenerID, body) =>
      call(() => http.put(`${T}/listeners/${listenerID}`, body)),

    delete: (listenerID) =>
      call(() => http.delete(`${T}/listeners/${listenerID}`)),

    activate: (listenerID) =>
      call(() => http.post(`${T}/listeners/${listenerID}/activate`)),

    deactivate: (listenerID) =>
      call(() => http.post(`${T}/listeners/${listenerID}/deactivate`)),
  };

  // ─── Workflow API ─────────────────────────────────────────────────────────

  const workflowAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/workflows`, { params })),

    getById: (workflowID) =>
      call(() => http.get(`${T}/workflows/${workflowID}`)),

    create: (body) =>
      call(() => http.post(`${T}/workflows`, body)),

    update: (workflowID, body) =>
      call(() => http.patch(`${T}/workflows/${workflowID}`, body)),

    delete: (workflowID) =>
      call(() => http.delete(`${T}/workflows/${workflowID}`)),

    execute: (workflowID, body = {}) =>
      call(() => http.post(`${T}/workflows/${workflowID}/execute`, body)),

    getInstance: (instanceID) =>
      call(() => http.get(`${T}/workflows/instances/${instanceID}`)),
  };

  // ─── Widget API ───────────────────────────────────────────────────────────

  const widgetAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/widgets`, { params })),

    getById: (widgetID) =>
      call(() => http.get(`${T}/widgets/${widgetID}`)),

    create: (body) =>
      call(() => http.post(`${T}/widgets`, body)),

    update: (widgetID, body) =>
      call(() => http.patch(`${T}/widgets/${widgetID}`, body)),

    delete: (widgetID) =>
      call(() => http.delete(`${T}/widgets/${widgetID}`)),
  };

  // ─── App Page API ─────────────────────────────────────────────────────────

  const appPageAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/app-pages`, { params })),

    getById: (appPageID) =>
      call(() => http.get(`${T}/app-pages/${appPageID}`)),

    create: (body) =>
      call(() => http.post(`${T}/app-pages`, body)),

    update: (appPageID, body) =>
      call(() => http.patch(`${T}/app-pages/${appPageID}`, body)),

    delete: (appPageID) =>
      call(() => http.delete(`${T}/app-pages/${appPageID}`)),
  };

  // ─── IAM API ─────────────────────────────────────────────────────────────

  const iamAPI = {
    listMembers: (params = {}) =>
      call(() => http.get(`${T}/users`, { params })),

    listRoles: (params = {}) =>
      call(() => http.get(`${T}/roles`, { params })),

    getTenant: () =>
      call(() => http.get(`/api/v1/tenants/${tenantId}`)),
  };

  return {
    tenantId,
    datasourceAPI,
    queryAPI,
    listenerAPI,
    workflowAPI,
    widgetAPI,
    appPageAPI,
    iamAPI,
  };
}
