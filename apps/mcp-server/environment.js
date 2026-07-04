/**
 * environment.js — single source of truth for all env vars in apps/mcp-server.
 *
 * Following the same convention as apps/backend/environment.js:
 * this is the ONLY module that reads process.env. All other modules
 * import from here.
 *
 * dotenv.config() is called here synchronously. Because this module is
 * statically imported first in index.js, the env vars are set before
 * the tool modules (which have their own dotenv.config calls) are loaded.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env') });

function requireEnv(name) {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(
      `[mcp-server] Missing required environment variable: ${name}\n` +
      `  Copy .env.example to .env and fill in the required values.`
    );
  }
  return value.trim();
}

function optionalEnv(name, defaultValue = null) {
  const value = process.env[name];
  if (!value?.trim()) return defaultValue;
  return value.trim();
}

export const environment = {
  /** Port this MCP HTTP server listens on */
  PORT: parseInt(process.env.PORT || '5001', 10),

  /** Base URL of the Jet Admin backend (for tool HTTP calls) */
  JET_ADMIN_MCP_BASE_URL: requireEnv('JET_ADMIN_MCP_BASE_URL').replace(/\/+$/, ''),

  /** Firebase service account credentials JSON string */
  FIREBASE_CREDENTIALS: requireEnv('FIREBASE_CREDENTIALS'),

  /** Enable verbose request/tool logging to stderr */
  DEBUG: process.env.DEBUG === 'true',
};
