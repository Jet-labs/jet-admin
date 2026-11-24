/**
 * utils.js
 *
 * Shared utility functions for the Jet Admin MCP Server.
 * Imported by tool files and client.js to avoid duplicated defensive patterns.
 */

import { config } from "./config.js";

// ─── Array Helpers ────────────────────────────────────────────────────────────

/**
 * Safely extracts an array from an API response.
 * Handles: { [key]: [...] }, plain arrays, and empty/null responses.
 *
 * @param {any} data - The raw API response
 * @param {string} key - The expected object key (e.g. "datasources")
 * @returns {Array}
 */
export function safeArray(data, key) {
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data)) return data;
  return [];
}

// ─── ID Validation ────────────────────────────────────────────────────────────

/**
 * Trims whitespace from a string ID and validates it's non-empty.
 * Prevents confusing 404s caused by trailing spaces or newlines in UUIDs.
 *
 * @param {string} id - The raw ID value from tool args
 * @param {string} name - The parameter name (used in error messages)
 * @returns {string} The trimmed, validated ID
 * @throws {Error} If the ID is missing or empty after trimming
 */
export function trimId(id, name = "id") {
  if (id == null) throw new Error(`${name} is required but was not provided.`);
  const trimmed = String(id).trim();
  if (!trimmed) throw new Error(`${name} must not be empty.`);
  return trimmed;
}

// ─── Retry Logic ──────────────────────────────────────────────────────────────

/**
 * Executes an async function with exponential backoff retry.
 * Only retries on transient errors: network failures and 5xx server errors.
 * Does NOT retry on 4xx client errors (those are permanent failures).
 *
 * @param {() => Promise<any>} fn - The async function to execute
 * @param {object} [opts]
 * @param {number} [opts.retries] - Max number of retry attempts (default from config)
 * @param {number} [opts.delayMs] - Base delay in ms (default from config)
 * @returns {Promise<any>}
 */
export async function withRetry(fn, { retries, delayMs } = {}) {
  const maxRetries = retries ?? config.retries;
  const baseDelay = delayMs ?? config.retryDelay;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const isRetryable = isRetryableError(err);
      const hasAttemptsLeft = attempt < maxRetries;

      if (!isRetryable || !hasAttemptsLeft) {
        throw err;
      }

      const wait = baseDelay * Math.pow(2, attempt);
      process.stderr.write(
        `[jet-admin-mcp] Retrying after ${wait}ms (attempt ${attempt + 1}/${maxRetries})...\n`
      );
      await sleep(wait);
    }
  }

  throw lastError;
}

/**
 * Determines if an error is transient and should be retried.
 * @param {Error} err
 * @returns {boolean}
 */
function isRetryableError(err) {
  // Network-level errors (no response received)
  if (!err.response && err.request) return true;
  // Network codes
  if (["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "EPIPE"].includes(err.code)) return true;
  // HTTP 5xx server errors and 429 rate limit
  // Axios carries the status on err.response.status; normalized errors carry err.status.
  const status = err.status ?? err.response?.status;
  if (status >= 500 || status === 429) return true;
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Result shaping (large payloads) ────────────────────────────────────────

/**
 * Truncates an array result to maxRows with a summary envelope.
 * Prevents MCP tool-output truncation (e.g. 284KB EICAR-style payloads) by
 * returning { totalCount, truncated, maxRows, rows } instead of the full array.
 *
 * @param {any} data - Raw backend result (array or { data: [...] } or object)
 * @param {number} [maxRows] - Cap rows returned (1-1000). Omit/0 = no truncation.
 * @returns {any} Possibly wrapped result.
 */
export function summarizeRows(data, maxRows) {
  const cap = Number(maxRows);
  if (!Number.isFinite(cap) || cap <= 0) return data;
  const limit = Math.min(Math.floor(cap), 1000);
  const pickArray = (d) => {
    if (Array.isArray(d)) return { arr: d, set: (v) => v };
    // Backend wraps run/test results as { success, dataQueryResult } — most common shape.
    if (Array.isArray(d?.dataQueryResult)) return { arr: d.dataQueryResult, set: (v) => ({ ...d, dataQueryResult: v }) };
    if (Array.isArray(d?.data)) return { arr: d.data, set: (v) => ({ ...d, data: v }) };
    if (Array.isArray(d?.rows)) return { arr: d.rows, set: (v) => ({ ...d, rows: v }) };
    if (Array.isArray(d?.result)) return { arr: d.result, set: (v) => ({ ...d, result: v }) };
    return null;
  };
  const found = pickArray(data);
  if (!found) return data;
  if (found.arr.length <= limit) return data;
  return {
    totalCount: found.arr.length,
    truncated: true,
    maxRows: limit,
    rows: found.arr.slice(0, limit),
    hint: "Result truncated client-side. Narrow the query (lower limit, filter, or summary aggregation) for full data.",
  };
}

// ─── Logging ──────────────────────────────────────────────────────────────────

/**
 * Writes a consistent error log entry to stderr.
 * Always logs to stderr — never stdout (MCP protocol requirement).
 *
 * @param {string} toolName - The tool that encountered the error
 * @param {Error} error - The error object
 */
export function logError(toolName, error) {
  const status = error.status ? ` [HTTP ${error.status}]` : "";
  process.stderr.write(
    `[jet-admin-mcp] ERROR in ${toolName}${status}: ${error.message}\n`
  );
}

// ─── Error formatting (shared by stdio and HTTP transports) ─────────────────

/**
 * Maps an error to a concrete, actionable hint. Prefer backend codes/details
 * over HTTP status alone so SQL and graph errors are not mislabelled as
 * "validation".
 */
export function hintForError(error) {
  if (!error) return "An unknown error occurred.";
  const msg = String(error.message || error);
  const code = error.backendCode || error.code;
  const issues = error.details?.issues || error.issues;

  if (Array.isArray(issues) && issues.length) {
    const fields = issues.map((i) => `${i.path || "body"}: ${i.message}`).slice(0, 6).join("; ");
    return `Backend validation failed: ${fields}. Fix those fields, then retry. Use validate_workflow / validate_app_page / validate_form_schema when applicable.`;
  }
  if (/^[0-9A-Z]{5}$/.test(String(code || ""))) {
    return `SQL execution error (SQLSTATE ${code}). Fix the query/table/column; use get_datasource_schema for real names.`;
  }
  if (/Invalid .*handle/i.test(msg)) {
    return "Invalid workflow edge handle. Run validate_workflow: condition/switch use branch/case id or 'default', loop uses 'loop'/'completed', fanout uses branch ids, join uses 'output', dataQuery/javascript/subWorkflow use 'success'/'error'.";
  }
  if (/case ids must be unique|branch ids must be unique|duplicate/i.test(msg)) {
    return "Duplicate branch/case id. Run validate_workflow; every condition branch and switch case needs a unique id.";
  }
  if (/submittedData must be a non-null object/i.test(msg)) {
    return "submit_data_collection_request expects the submitted values under submittedData. The MCP wraps formData for you in the fixed version; if calling the API directly, send {submittedData:{...}}.";
  }
  if (/actionType|actionConfig/.test(msg)) {
    return "Listener actions use {actionType, actionConfig}, not {type, config}. Use list_listener_action_types and validate_listener.";
  }
  if (error.status === 401) return "Authentication failed. Check that JET_ADMIN_API_KEY is valid.";
  if (error.status === 403) {
    return "Permission denied (Casbin). The key is valid but its role lacks the required grant — e.g. move needs folder.update + per-entity update; clone needs create+read; page create needs dataquery/workflow/listener/widget execute. Fix in Roles, not by retrying.";
  }
  if (error.status === 404) return "Resource not found. Verify the ID is correct and belongs to the configured tenant.";
  if (error.status === 429) return "Rate limit exceeded. Wait a moment before retrying.";
  if (error.status === 422 || error.status === 400) {
    return "Backend rejected the request. Read the message for the offending field; use the matching validate_* tool before retrying.";
  }
  if (error.status >= 500) return "The Jet Admin backend returned a server error. Check backend logs for details.";
  if (
    msg.includes("unreachable") ||
    ["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT"].includes(error.code)
  ) {
    return `Cannot connect to Jet Admin backend at ${config.baseUrl}. Ensure the backend is running.`;
  }
  return "See error message above for details.";
}

/** Builds the structured error payload returned by both transports. */
export function formatToolError(error, toolName) {
  const payload = {
    error: true,
    message: error?.message || String(error),
    tool: toolName,
    hint: hintForError(error),
  };
  const status = error?.status;
  if (status !== undefined) payload.status = status;
  const code = error?.backendCode || error?.code;
  if (code !== undefined) payload.code = code;
  if (error?.details !== undefined) {
    if (error.details && typeof error.details === "object" && !Array.isArray(error.details)) {
      const { stack, name, ...rest } = error.details;
      if (Object.keys(rest).length) payload.details = rest;
    } else {
      payload.details = error.details;
    }
  }
  if (error?.issues !== undefined) payload.issues = error.issues;
  return payload;
}
