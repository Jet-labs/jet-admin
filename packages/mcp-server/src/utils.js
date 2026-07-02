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
  if (err.status >= 500 || err.status === 429) return true;
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
