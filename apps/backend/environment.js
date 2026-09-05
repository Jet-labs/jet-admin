const dotenv = require("dotenv");
const path = require("path");
const constants = require("./constants");
const p = path.resolve(__dirname, `.env`);
dotenv.config({
  path: p,
});
const env = process.env.NODE_ENV || "development";
const environmentVariables = {
  NODE_ENV: env,
  NODE_ID: env == "development" ? "dev_node_1" : "prod_node_1",
  PORT: process.env.PORT || 8090,
  ENABLED_MODULES: process.env.ENABLED_MODULES
    ? process.env.ENABLED_MODULES.split(",")
    : [constants.MODULES.AUTH, constants.MODULES.TENANT],
  DATABASE_URL: process.env.DATABASE_URL,
  UNPOOLED_DATABASE_URL: process.env.UNPOOLED_DATABASE_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  SYSLOG_HOST: process.env.SYSLOG_HOST || "127.0.0.1",
  SYSLOG_PORT: process.env.SYSLOG_PORT || 514,
  SYSLOG_PROTOCOL: process.env.SYSLOG_PROTOCOL || "udp4",
  LOG_RETENTION: process.env.LOG_RETENTION || 7,
  SYSLOG_LEVEL: process.env.SYSLOG_LEVEL || "warning",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE_SIZE: process.env.LOG_FILE_SIZE || 1,
  EXPRESS_REQUEST_SIZE_LIMIT: process.env.EXPRESS_REQUEST_SIZE_LIMIT || "5mb",
  CORS_WHITELIST: process.env.CORS_WHITELIST
    ? process.env.CORS_WHITELIST.split(",")
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:3001",
      ],
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_S3_ENDPOINT: process.env.SUPABASE_S3_ENDPOINT,
  SUPABASE_S3_REGION: process.env.SUPABASE_S3_REGION,
  SUPABASE_S3_ACCESS_KEY_ID: process.env.SUPABASE_S3_ACCESS_KEY_ID,
  SUPABASE_S3_SECRET_ACCESS_KEY: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
  SUPABASE_S3_BUCKET: process.env.SUPABASE_S3_BUCKET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  BACKEND_URL: process.env.BACKEND_URL,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  // ── Jet Agent (OpenRouter, OpenAI-compatible) ─────────────────────────────
  // Workspace-level fallback so the agent works even before a tenant configures
  // its own key in Tenant Settings. Tenant vault ai_config always wins when set.
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  AI_BASE_URL: process.env.AI_BASE_URL || "https://openrouter.ai/api/v1",
  AI_MODEL: process.env.AI_MODEL || "minimax/minimax-m3:free",
  AI_FALLBACK_MODELS: process.env.AI_FALLBACK_MODELS
    ? process.env.AI_FALLBACK_MODELS.split(",").map((s) => s.trim()).filter(Boolean)
    : [
        "nvidia/nemotron-3-ultra-550b-a55b:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
        "z-ai/glm-5.2:free",
      ],
  OPENROUTER_HTTP_REFERER: process.env.OPENROUTER_HTTP_REFERER || process.env.BACKEND_URL || "http://localhost:8090",
  OPENROUTER_APP_TITLE: process.env.OPENROUTER_APP_TITLE || "Jet Admin",
  AI_MAX_STEPS: parseInt(process.env.AI_MAX_STEPS || "25", 10),
  AI_TEMPERATURE: parseFloat(process.env.AI_TEMPERATURE || "0.2"),
  /** Port the standalone apps/mcp-server listens on (default 5001) */
  MCP_SERVER_PORT: parseInt(process.env.MCP_SERVER_PORT || '5001', 10),
  /** Base URL for the MCP server */
  MCP_SERVER_URL: process.env.MCP_SERVER_URL || `http://localhost:${parseInt(process.env.MCP_SERVER_PORT || '5001', 10)}`,
  JET_ADMIN_INTERNAL_API_KEY: process.env.JET_ADMIN_INTERNAL_API_KEY,
  VAULT_ENCRYPTION_KEY: process.env.VAULT_ENCRYPTION_KEY,
  OAUTH_STATE_SECRET: process.env.OAUTH_STATE_SECRET,
  FIREBASE_CREDENTIALS: process.env.FIREBASE_CREDENTIALS,
  // ── Temporal (Strangler Fig) ──────────────────────────────────────────────
  WORKFLOW_ENGINE_DRIVER: process.env.WORKFLOW_ENGINE_DRIVER || process.env.WORKFLOW_ENGINE || 'native',
  TEMPORAL_ADDRESS: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  TEMPORAL_NAMESPACE: process.env.TEMPORAL_NAMESPACE || 'default',
  TEMPORAL_TASK_QUEUE: process.env.TEMPORAL_TASK_QUEUE || 'jet-admin-workflows',
  TEMPORAL_API_KEY: process.env.TEMPORAL_API_KEY || null,
  TEMPORAL_TLS: process.env.TEMPORAL_TLS || 'false',
  TEMPORAL_TLS_CERT: process.env.TEMPORAL_TLS_CERT || null,
  TEMPORAL_TLS_KEY: process.env.TEMPORAL_TLS_KEY || null,
  TEMPORAL_TLS_SERVER_NAME: process.env.TEMPORAL_TLS_SERVER_NAME || null,
  TEMPORAL_TLS_CA: process.env.TEMPORAL_TLS_CA || null,
  TEMPORAL_MAX_CONCURRENT_ACTIVITIES: parseInt(process.env.TEMPORAL_MAX_CONCURRENT_ACTIVITIES || '20', 10),
  TEMPORAL_MAX_CONCURRENT_WORKFLOWS: parseInt(process.env.TEMPORAL_MAX_CONCURRENT_WORKFLOWS || '20', 10),
  TEMPORAL_WORKER_START_MAX_ATTEMPTS: parseInt(process.env.TEMPORAL_WORKER_START_MAX_ATTEMPTS || '0', 10),
  TEMPORAL_WORKER_START_BASE_DELAY_MS: parseInt(process.env.TEMPORAL_WORKER_START_BASE_DELAY_MS || '1000', 10),
  TEMPORAL_WORKER_START_MAX_DELAY_MS: parseInt(process.env.TEMPORAL_WORKER_START_MAX_DELAY_MS || '30000', 10),
  TEMPORAL_WORKER_RESTART_ON_CRASH: process.env.TEMPORAL_WORKER_RESTART_ON_CRASH || 'true',
  WORKFLOW_STALE_AFTER_MS: parseInt(process.env.WORKFLOW_STALE_AFTER_MS || `${5 * 60 * 1000}`, 10),
};

module.exports = environmentVariables;
