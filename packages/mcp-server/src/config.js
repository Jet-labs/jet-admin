/**
 * config.js
 * 
 * Reads and validates environment variables for the Jet Admin MCP Server.
 * All configuration is sourced from environment variables (never hardcoded).
 * 
 * Load order: .env file → process.env → defaults
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the package root (packages/mcp-server/.env)
const require = createRequire(import.meta.url);
const dotenv = require("dotenv");
dotenv.config({ path: resolve(__dirname, "../.env") });

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `[jet-admin-mcp] Missing required environment variable: ${name}\n` +
        `  Copy .env.example to .env and fill in your values.`
    );
  }
  return value.trim();
}

export const config = {
  /** Base URL of the Jet Admin backend (e.g. http://localhost:5000) */
  baseUrl: requireEnv("JET_ADMIN_MCP_BASE_URL").trim().replace(/\/+$/, ""),

  /** HTTP request timeout in milliseconds */
  timeout: (() => {
    const raw = parseInt(process.env.JET_ADMIN_TIMEOUT || "", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 30000;
  })(),

  /** Max number of retry attempts on transient failures (network errors, 5xx) */
  retries: (() => {
    const raw = parseInt(process.env.JET_ADMIN_RETRIES || "", 10);
    return Number.isFinite(raw) && raw >= 0 ? raw : 3;
  })(),

  /** Base delay in ms for exponential backoff (doubles each attempt) */
  retryDelay: (() => {
    const raw = parseInt(process.env.JET_ADMIN_RETRY_DELAY || "", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 500;
  })(),

  /** Whether to log debug information to stderr */
  debug: process.env.DEBUG === "true",
};

export function debugLog(...args) {
  if (config.debug) {
    // MCP protocol: ONLY stderr for logging — never stdout
    process.stderr.write("[jet-admin-mcp] " + args.join(" ") + "\n");
  }
}
