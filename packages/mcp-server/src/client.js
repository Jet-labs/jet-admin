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

    getSchemas: (params = {}) =>
      call(() => http.get(`${T}/datasources/schemas`, { params })),

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

    testJson: (body) =>
      call(() => http.post(`${T}/datasources/test-json`, body)),

    proxy: (datasourceID, body) =>
      call(() => http.post(`${T}/datasources/${datasourceID}/proxy`, body)),
  };

  // ─── Data Query API ──────────────────────────────────────────────────────

  const queryAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/queries`, { params })),

    getSchemas: (params = {}) =>
      call(() => http.get(`${T}/queries/schemas`, { params })),

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

    testByData: ({ datasourceID, datasourceType, dataQueryOptions, inputValues }) =>
      call(() => http.patch(`${T}/queries/queryTest`, {
        dataQuery: { datasourceID, datasourceType, dataQueryOptions },
        inputValues,
      })),
  };

  // ─── Listener API ────────────────────────────────────────────────────────

  const listenerAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/listeners`, { params })),

    getSchemas: (params = {}) =>
      call(() => http.get(`${T}/listeners/schemas`, { params })),

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

    getSchemas: (params = {}) =>
      call(() => http.get(`${T}/workflows/schemas`, { params })),

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

    getSchemas: (params = {}) =>
      call(() => http.get(`${T}/widgets/schemas`, { params })),

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

    getSchema: () =>
      call(() => http.get(`${T}/app-pages/schemas`)),

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

  // ─── Folders ─────────────────────────────────────────────────────────────
  // Backend: apps/backend/modules/folder/folder.v1.routes.js
  //   GET /folders?entityType= | POST /folders | POST /folders/move
  //   PATCH /folders/:folderID | DELETE /folders/:folderID
  // entityType ∈ widget, workflow, dataQuery, cronJob, appPage, listener

  const folderAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/folders`, { params })),

    create: (body) =>
      call(() => http.post(`${T}/folders`, body)),

    update: (folderID, body) =>
      call(() => http.patch(`${T}/folders/${folderID}`, body)),

    delete: (folderID) =>
      call(() => http.delete(`${T}/folders/${folderID}`)),

    move: (body) =>
      call(() => http.post(`${T}/folders/move`, body)),
  };

  // ─── CronJobs ────────────────────────────────────────────────────────────
  // Backend: apps/backend/modules/cronJob/cronJob.v1.routes.js
  // NOTE path is lowercase `/cronjobs` (not cronJobs).

  const cronJobAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/cronjobs`, { params })),

    getById: (cronJobID) =>
      call(() => http.get(`${T}/cronjobs/${cronJobID}`)),

    create: (body) =>
      call(() => http.post(`${T}/cronjobs`, body)),

    update: (cronJobID, body) =>
      call(() => http.patch(`${T}/cronjobs/${cronJobID}`, body)),

    delete: (cronJobID) =>
      call(() => http.delete(`${T}/cronjobs/${cronJobID}`)),

    clone: (cronJobID) =>
      call(() => http.post(`${T}/cronjobs/${cronJobID}/clone`)),

    history: (cronJobID, params = {}) =>
      call(() => http.get(`${T}/cronjobs/${cronJobID}/history`, { params })),

    connectionStatus: () =>
      call(() => http.get(`${T}/cronjobs/status/connections`)),
  };

  // ─── Audit ───────────────────────────────────────────────────────────────
  // Backend: apps/backend/modules/audit/audit.v1.routes.js (read-only)

  const auditAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/audit`, { params })),

    exportCSV: (params = {}) =>
      call(() => http.get(`${T}/audit/export`, { params })),
  };

  // ─── API Keys ────────────────────────────────────────────────────────────
  // Backend: apps/backend/modules/apiKey/apiKey.v1.routes.js
  // NOTE path is lowercase `/apikeys`.

  const apiKeyAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/apikeys`, { params })),

    getById: (apiKeyID) =>
      call(() => http.get(`${T}/apikeys/${apiKeyID}`)),

    create: (body) =>
      call(() => http.post(`${T}/apikeys`, body)),

    update: (apiKeyID, body) =>
      call(() => http.patch(`${T}/apikeys/${apiKeyID}`, body)),

    delete: (apiKeyID) =>
      call(() => http.delete(`${T}/apikeys/${apiKeyID}`)),

    clone: (apiKeyID) =>
      call(() => http.post(`${T}/apikeys/${apiKeyID}/clone`)),
  };

  // ─── Users (extended) ────────────────────────────────────────────────────
  // Backend: apps/backend/modules/userManagement/userManagement.v1.routes.js

  const userAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/users`, { params })),

    getById: (tenantUserID) =>
      call(() => http.get(`${T}/users/${tenantUserID}`)),

    add: (body) =>
      call(() => http.post(`${T}/users`, body)),

    remove: (tenantUserID) =>
      call(() => http.delete(`${T}/users/${tenantUserID}`)),

    updateRoles: (tenantUserID, body) =>
      call(() => http.patch(`${T}/users/${tenantUserID}/roles`, body)),
  };

  // ─── Roles + Permissions ─────────────────────────────────────────────────
  // Backend: apps/backend/modules/tenantRole/tenantRole.v1.routes.js

  const roleAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/roles`, { params })),

    getById: (roleID) =>
      call(() => http.get(`${T}/roles/${roleID}`)),

    create: (body) =>
      call(() => http.post(`${T}/roles`, body)),

    update: (roleID, body) =>
      call(() => http.patch(`${T}/roles/${roleID}`, body)),

    delete: (roleID) =>
      call(() => http.delete(`${T}/roles/${roleID}`)),

    listPermissions: (params = {}) =>
      call(() => http.get(`${T}/roles/permissions`, { params })),

    syncPolicies: () =>
      call(() => http.post(`${T}/roles/sync-policies`, {})),
  };

  // ─── Tenant (extended) ───────────────────────────────────────────────────
  // Backend: apps/backend/modules/tenant/tenant.v1.routes.js

  const tenantAPI = {
    listMine: (params = {}) =>
      call(() => http.get(`/api/v1/tenants`, { params })),

    getById: (id) =>
      call(() => http.get(`/api/v1/tenants/${id || tenantId}`)),

    create: (body) =>
      call(() => http.post(`/api/v1/tenants`, body)),

    update: (body) =>
      call(() => http.patch(`/api/v1/tenants/${tenantId}`, body)),

    getAiConfig: () =>
      call(() => http.get(`/api/v1/tenants/${tenantId}/ai-config`)),

    updateAiConfig: (body) =>
      call(() => http.post(`/api/v1/tenants/${tenantId}/ai-config`, body)),
  };

  // ─── Bundle (import/export) ──────────────────────────────────────────────
  // Backend: apps/backend/modules/bundle/bundle.v1.routes.js
  // Export lives per-resource (`/:id/export`, `/:id/clone`); import is central.

  const bundleAPI = {
    previewImport: (body) =>
      call(() => http.post(`${T}/import/preview`, body)),

    executeImport: (body) =>
      call(() => http.post(`${T}/import/execute`, body)),

    exportDatasource: (datasourceID) =>
      call(() => http.get(`${T}/datasources/${datasourceID}/export`)),

    cloneDatasource: (datasourceID) =>
      call(() => http.post(`${T}/datasources/${datasourceID}/clone`)),

    exportQuery: (dataQueryID) =>
      call(() => http.get(`${T}/queries/${dataQueryID}/export`)),

    cloneQuery: (dataQueryID) =>
      call(() => http.post(`${T}/queries/${dataQueryID}/clone`)),

    exportWidget: (widgetID) =>
      call(() => http.get(`${T}/widgets/${widgetID}/export`)),

    cloneWidget: (widgetID) =>
      call(() => http.post(`${T}/widgets/${widgetID}/clone`)),

    exportAppPage: (appPageID) =>
      call(() => http.get(`${T}/app-pages/${appPageID}/export`)),

    cloneAppPage: (appPageID) =>
      call(() => http.post(`${T}/app-pages/${appPageID}/clone`)),

    exportListener: (listenerID) =>
      call(() => http.get(`${T}/listeners/${listenerID}/export`)),

    cloneListener: (listenerID) =>
      call(() => http.post(`${T}/listeners/${listenerID}/clone`)),

    exportWorkflow: (workflowID) =>
      call(() => http.get(`${T}/workflows/${workflowID}/export`)),

    cloneWorkflow: (workflowID) =>
      call(() => http.post(`${T}/workflows/${workflowID}/clone`)),

    cloneCronJob: (cronJobID) =>
      call(() => http.post(`${T}/cronjobs/${cronJobID}/clone`)),

    cloneApiKey: (apiKeyID) =>
      call(() => http.post(`${T}/apikeys/${apiKeyID}/clone`)),
  };

  // ─── Widget Library ──────────────────────────────────────────────────────
  // Backend: apps/backend/modules/widgetLibrary/widgetLibrary.tenant.v1.routes.js

  const libraryAPI = {
    list: (params = {}) =>
      call(() => http.get(`${T}/widget-library`, { params })),

    publish: (body) =>
      call(() => http.post(`${T}/widget-library`, body)),

    previewInstall: (libraryEntryID) =>
      call(() => http.post(`${T}/widget-library/${libraryEntryID}/preview`, {})),

    install: (libraryEntryID, body = {}) =>
      call(() => http.post(`${T}/widget-library/${libraryEntryID}/install`, body)),

    unpublish: (libraryEntryID) =>
      call(() => http.delete(`${T}/widget-library/${libraryEntryID}`)),
  };

  // ─── App Page versions ───────────────────────────────────────────────────

  const appPageVersionAPI = {
    list: (appPageID, params = {}) =>
      call(() => http.get(`${T}/app-pages/${appPageID}/versions`, { params })),

    getById: (appPageID, versionID) =>
      call(() => http.get(`${T}/app-pages/${appPageID}/versions/${versionID}`)),

    restore: (appPageID, versionID) =>
      call(() => http.post(`${T}/app-pages/${appPageID}/versions/${versionID}/restore`, {})),
  };

  // ─── Listener extras (actions + status) ──────────────────────────────────

  const listenerExtraAPI = {
    connectionStatus: () =>
      call(() => http.get(`${T}/listeners/status/connections`)),

    addAction: (listenerID, body) =>
      call(() => http.post(`${T}/listeners/${listenerID}/actions`, body)),

    updateAction: (listenerID, actionID, body) =>
      call(() => http.put(`${T}/listeners/${listenerID}/actions/${actionID}`, body)),

    deleteAction: (listenerID, actionID) =>
      call(() => http.delete(`${T}/listeners/${listenerID}/actions/${actionID}`)),
  };

  // ─── Workflow extras (instances, test, data-collection) ──────────────────

  const workflowExtraAPI = {
    listInstances: (params = {}) =>
      call(() => http.get(`${T}/workflows/instances`, { params })),

    test: (body) =>
      call(() => http.post(`${T}/workflows/test`, body)),

    stopInstance: (instanceID) =>
      call(() => http.delete(`${T}/workflows/instances/${instanceID}/stop`)),

    widgetData: (instanceID) =>
      call(() => http.post(`${T}/workflows/instances/${instanceID}/widget`, {})),

    getDataCollection: (collectionRequestID) =>
      call(() => http.get(`${T}/workflows/data-collection/${collectionRequestID}`)),

    submitDataCollection: (collectionRequestID, body = {}) =>
      call(() => http.post(`${T}/workflows/data-collection/${collectionRequestID}/submit`, body)),
  };

  // ─── Datasource generic proxy ────────────────────────────────────────────
  // Exposes the full ALLOWED_ACTIONS matrix per type (not just getSchema/sample).

  const datasourceProxyAPI = {
    invoke: (datasourceID, action, params = {}) =>
      call(() => http.post(`${T}/datasources/${datasourceID}/proxy`, { action, params })),
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
    folderAPI,
    cronJobAPI,
    auditAPI,
    apiKeyAPI,
    userAPI,
    roleAPI,
    tenantAPI,
    bundleAPI,
    libraryAPI,
    appPageVersionAPI,
    listenerExtraAPI,
    workflowExtraAPI,
    datasourceProxyAPI,
  };
}
