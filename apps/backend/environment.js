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
  SYSLOG_HOST: process.env.SYSLOG_HOST || "127.0.0.1",
  SYSLOG_PORT: process.env.SYSLOG_PORT || 514,
  SYSLOG_PROTOCOL: process.env.SYSLOG_PROTOCOL || "udp4",
  LOG_RETENTION: process.env.LOG_RETENTION || 7,
  SYSLOG_LEVEL: process.env.SYSLOG_LEVEL || "warning",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE_SIZE: process.env.LOG_FILE_SIZE || 1,
  EXPRESS_REQUEST_SIZE_LIMIT: process.env.EXPRESS_REQUEST_SIZE_LIMIT || "5mb",
  CORS_WHITELIST: process.env.CORS_WHITELIST
    ? process.env.CORS_WHITELIST.split(",").map((s) => s.trim()).filter(Boolean)
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:3001",
      ],
  // ── S3-compatible object storage (AWS S3, MinIO, RustFS, …) ───────────────
  // Server-side endpoint (reachable from the backend container), e.g.
  //   AWS:    https://s3.ap-south-1.amazonaws.com
  //   MinIO:  http://minio:9000
  //   RustFS: http://rustfs:9000
  S3_ENDPOINT: process.env.S3_ENDPOINT || "",
  S3_REGION: process.env.S3_REGION || "us-east-1",
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || "",
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || "",
  S3_BUCKET: process.env.S3_BUCKET || "",
  // Browser-facing base URL used to build public file URLs, e.g.
  //   local RustFS/MinIO: http://localhost:9000
  //   production:         https://cdn.example.com  (or the S3 endpoint itself)
  S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL || "",
  // "true" (default) for MinIO/RustFS path style;
  // "false" for AWS virtual-hosted style.
  S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE || "true",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  BACKEND_URL: process.env.BACKEND_URL,
  // ── Jet Agent (OpenRouter, OpenAI-compatible) ─────────────────────────────
  // Workspace-level fallback so the agent works even before a tenant configures
  // its own key in Tenant Settings. Tenant vault ai_config always wins when set.
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  AI_BASE_URL: process.env.AI_BASE_URL || "https://openrouter.ai/api/v1",
  AI_MODEL: process.env.AI_MODEL || "minimax/minimax-m3",
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
  VAULT_ENCRYPTION_KEY: process.env.VAULT_ENCRYPTION_KEY,
  OAUTH_STATE_SECRET: process.env.OAUTH_STATE_SECRET,
  FIREBASE_CREDENTIALS: process.env.FIREBASE_CREDENTIALS,
  // ── Listener ingress + queue (Redis) ────────────────────────────────────
  // QUEUE_DRIVER: 'memory' (in-process fastq, default) or 'redis' (Redis Streams).
  // LISTENER_INGRESS: 'embedded' (backend subscribes itself, default) or
  //   'proxy' (a dedicated listener-proxy node subscribes + publishes raw
  //   events to Redis; this backend only consumes + dispatches).
  QUEUE_DRIVER: process.env.QUEUE_DRIVER || 'memory',
  LISTENER_INGRESS: process.env.LISTENER_INGRESS || 'embedded',
  REDIS_URL: process.env.REDIS_URL || '',
  LISTENER_PROXY_PORT: parseInt(process.env.LISTENER_PROXY_PORT || '8095', 10),
  LISTENER_STREAM: process.env.LISTENER_STREAM || 'listener:events',
  LISTENER_GROUP: process.env.LISTENER_GROUP || 'listener-workers',
  LISTENER_DLQ_STREAM: process.env.LISTENER_DLQ_STREAM || 'listener:events:dlq',
  LISTENER_CONTROL_CHANNEL: process.env.LISTENER_CONTROL_CHANNEL || 'listener:control',
  LISTENER_PREFETCH: parseInt(process.env.LISTENER_PREFETCH || '20', 10),
  LISTENER_STREAM_MAXLEN: parseInt(process.env.LISTENER_STREAM_MAXLEN || '10000', 10),
  // Shared secret for the proxy's internal control endpoint (optional;
  // cluster-internal only — set it when the proxy port is reachable).
  PROXY_CONTROL_TOKEN: process.env.PROXY_CONTROL_TOKEN || null,
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
