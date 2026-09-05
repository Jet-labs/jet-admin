---
title: Configuration Reference
description: Every environment variable the code actually reads — backend, frontend, MCP — with defaults and failure modes.
sidebar_position: 11
---

# Configuration Reference

Source of truth: `apps/backend/environment.js` (sole sanctioned `process.env` reader), `apps/frontend/src/{constants.js,config/*}`, `apps/mcp-server/environment.js`, `packages/mcp-server/src/{config.js,index.js}`, and the `docker-compose*.yml` environment sections. Where compose/`.env.docker` and code disagree, **code wins** and the drift is flagged.

All backend changes require process restart. All `VITE_*` changes require frontend rebuild (`vite build` statically replaces them at build time). `docker-entrypoint.frontend.sh` only starts nginx — there is no runtime config override.

## Backend (`apps/backend`, read via `environment.js`)

### Core

| Key | Required | Default | Format | Read by | What breaks if wrong |
|---|---|---|---|---|---|
| `NODE_ENV` | no | `development` | `development`/`production`/`test` | everything (`NODE_ID` derivation, logging) | `test` enables `authProviderTest` bypass — never set in prod |
| `NODE_ID` | no | `dev_node_1` / `prod_node_1` | string | `winston.config.js` (log filename `logs/<NODE_ID>-<date>.log`) | Log files collide across nodes if duplicated |
| `PORT` | no | `8090` | int | `http-server.config.js` | Compose sets `3000`; Render injects `$PORT`. Healthchecks must target the effective port |
| `DATABASE_URL` | **yes** | — | Prisma Postgres URL | Prisma (`schema.prisma` `env("DATABASE_URL")`), `run-manual-migrations.js` | Boot fails; nothing works |
| `UNPOOLED_DATABASE_URL` | no | — | direct Postgres URL | scripts requiring non-pooled connection | Pool timeouts under migration load if unset (uses pooled) |
| `ENABLED_MODULES` | no | `auth,tenant` only | comma list, no spaces | `config/module.config.js` `isModuleEnabled()` (missing key = enabled) | Compose enables 16 modules; minimal default disables datasource/query/workflow/widget — most UI 404s |
| `EXPRESS_REQUEST_SIZE_LIMIT` | no | `5mb` | bytes string (`5mb`, `10mb`) | `express-app.config.js` (`json`+`urlencoded`) | Large bundle imports rejected; uploads use separate 10 MB multer cap |
| `CORS_WHITELIST` | no | `http://localhost:3000,5173,3001,127.0.0.1:3000,3001` | comma URLs | `express-app.config.js`, `socket.io.js` | Browsers blocked; `/webhooks` stays open (`origin:true`) regardless |

### Auth / secrets

| Key | Required | Default | Format | Read by | What breaks if wrong |
|---|---|---|---|---|---|
| `FIREBASE_CREDENTIALS` | **yes** (any user auth) | — | JSON service-account blob | `config/firebase.config.js` (`verifyIdToken`) | All `Bearer` logins fail |
| `VAULT_ENCRYPTION_KEY` | **yes** (vault/OAuth/datasources) | — | 32-byte hex | `utils/encryption.util.js` (AES-256-GCM) | Decrypt throws; datasource tests, OAuth callback, AI tools fail. No auto-rotation |
| `OAUTH_STATE_SECRET` | yes (Google OAuth) | — | JWT secret | `modules/oauth/oauth.controller.js` (10-min state) | OAuth handshake fails signature check |
| `JET_ADMIN_INTERNAL_API_KEY` | yes (AI tools → backend) | — | opaque string | `modules/ai/*` | Agent tool calls rejected |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | yes (Google OAuth) | — | OAuth client pair | `modules/oauth/*` | `/oauth/google/*` 500s |
| `BACKEND_URL` | no | — | public backend URL | OAuth callback + `OPENROUTER_HTTP_REFERER` fallback | OAuth redirect + OpenRouter referer header wrong behind proxies |

### AI (Jet Agent, OpenRouter-compatible)

| Key | Required | Default | Format | Notes |
|---|---|---|---|---|
| `OPENROUTER_API_KEY` | yes (agent) | — | `sk-or-…` | Workspace fallback; tenant vault `ai_config` wins when set |
| `AI_BASE_URL` | no | `https://openrouter.ai/api/v1` | URL | OpenAI-compatible endpoint |
| `AI_MODEL` | no | `minimax/minimax-m3:free` | model slug | Primary model |
| `AI_FALLBACK_MODELS` | no | 3 free models (Nemotron Ultra/Super, GLM 5.2) | comma slugs | Tried in order |
| `OPENROUTER_HTTP_REFERER` | no | `BACKEND_URL` → `http://localhost:8090` | URL | Required by OpenRouter rankings |
| `OPENROUTER_APP_TITLE` | no | `Jet Admin` | string | OpenRouter dashboard label |
| `AI_MAX_STEPS` | no | `25` | int | Agent tool-call ceiling |
| `AI_TEMPERATURE` | no | `0.2` | float | Generation temperature |
| `GEMINI_API_KEY` / `NVIDIA_API_KEY` | no | — | provider keys | Legacy/alternate providers; `GEMINI_API_KEY` also in compose + scratch scripts |

### Storage / files

| Key | Required | Default | Format | Read by |
|---|---|---|---|---|
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | yes (uploads) | — | URL + JWT | `utils/fileStorage.util.js` (S3 → Supabase-JS → axios fallback, `forcePathStyle:true`) |
| `SUPABASE_S3_ENDPOINT` / `SUPABASE_S3_REGION` / `SUPABASE_S3_ACCESS_KEY_ID` / `SUPABASE_S3_SECRET_ACCESS_KEY` / `SUPABASE_S3_BUCKET` | yes (S3 path) | — | S3 fields | Same; missing fields fall through to next strategy |

### Logging

| Key | Required | Default | Format | Notes |
|---|---|---|---|---|
| `LOG_LEVEL` | no | `info` | `error`/`warn`/`success`/`info` | File + console level |
| `LOG_RETENTION` | no | `7` | days (int) | `DailyRotateFile` `maxFiles` |
| `LOG_FILE_SIZE` | no | `1` | MB (`m` suffix added) | `maxSize` per file |
| `SYSLOG_HOST` / `SYSLOG_PORT` / `SYSLOG_PROTOCOL` / `SYSLOG_LEVEL` | no | `127.0.0.1`/`514`/`udp4`/`warning` | host/int/proto/level | `winston-syslog` transport; unreachable host only drops syslog, not files |

### Workflow engine (native + Temporal strangler)

| Key | Required | Default | Format | Notes |
|---|---|---|---|---|
| `WORKFLOW_ENGINE_DRIVER` (`WORKFLOW_ENGINE` alias) | no | `native` | `native`/`temporal` | Selects execution path |
| `TEMPORAL_ADDRESS` | Temporal only | `localhost:7233` | `host:port` | Server endpoint |
| `TEMPORAL_NAMESPACE` | no | `default` | string | Namespace |
| `TEMPORAL_TASK_QUEUE` | no | `jet-admin-workflows` | string | Queue (`temporal/config.js` also reads `process.env` directly) |
| `TEMPORAL_API_KEY` | Cloud only | `null` | string | Cloud auth (read directly in `temporal/client.js`) |
| `TEMPORAL_TLS` | Cloud/mTLS only | `'false'` | `'true'`/`'false'` string | Enables TLS block |
| `TEMPORAL_TLS_CERT` / `TEMPORAL_TLS_KEY` / `TEMPORAL_TLS_CA` / `TEMPORAL_TLS_SERVER_NAME` | mTLS only | `null` | **file paths** (`fs.readFileSync`) | Paths, not PEM literals |
| `TEMPORAL_MAX_CONCURRENT_ACTIVITIES` / `TEMPORAL_MAX_CONCURRENT_WORKFLOWS` | no | `20`/`20` | int | Worker parallelism |
| `TEMPORAL_WORKER_START_MAX_ATTEMPTS` | no | `0` (= infinite) | int | Worker boot retries |
| `TEMPORAL_WORKER_START_BASE_DELAY_MS` / `TEMPORAL_WORKER_START_MAX_DELAY_MS` | no | `1000`/`30000` | int ms | Backoff window |
| `TEMPORAL_WORKER_RESTART_ON_CRASH` | no | `'true'` | string bool | Supervisor restart |
| `WORKFLOW_STALE_AFTER_MS` | no | `300000` (5 min) | int ms | `RUNNING` instances older than this are marked `FAILED` at boot |
| `TEMPORAL_HUMAN_TIMEOUT` | no | `24 hours` | duration | Read directly in `temporal/config.js`; **missing from `environment.js`** |
| `TEMPORAL_WORKFLOW_TYPE` | no | `dslInterpreterWorkflow` | string | Same direct-read gap as above |

### MCP bridge

| Key | Required | Default | Format | Notes |
|---|---|---|---|---|
| `MCP_SERVER_PORT` | no | `5001` | int | Standalone `apps/mcp-server` listen port |
| `MCP_SERVER_URL` | no | `http://localhost:<MCP_SERVER_PORT>` | URL | Advertised URL |

### Drift: set in Docker but unread by backend

:::warning
These keys appear in `docker-compose.yml` / `.env.docker` but have **zero** consumers in `apps/backend` (`environment.js` + `process.env` grep). They are currently no-ops; do not rely on them: `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`, `ACCESS_TOKEN_TIMEOUT`, `REFRESH_TOKEN_TIMEOUT`, `SESSION_SECRET`, `RABBITMQ_URL`, `RABBITMQ_USER`, `RABBITMQ_PASS`, `SEED_DATABASE` (read only by `docker-entrypoint.backend.sh`, not Node), `POSTGRES_*` (postgres image only), `SSL_CERT_CN`.
:::

## Frontend (`apps/frontend`, `import.meta.env`)

| Key | Required | Default | Format | Read by | What breaks if wrong |
|---|---|---|---|---|---|
| `VITE_SERVER_HOST` | yes | dev `http://localhost:8090`, prod `https://jet-admin-1.onrender.com` | URL, no trailing slash | `src/constants.js` → all `src/data/apis/*.js` (axios base) | Every REST call fails |
| `VITE_SOCKET_HOST` | yes | same as above | URL | `executionStreamService.js`, `useSocketStore.js` | No realtime (workflows, listeners, widgets) |
| `VITE_FIREBASE_API_KEY` / `VITE_FIREBASE_AUTH_DOMAIN` / `VITE_FIREBASE_PROJECT_ID` / `VITE_FIREBASE_STORAGE_BUCKET` / `VITE_FIREBASE_MESSAGING_SENDER_ID` / `VITE_FIREBASE_APP_ID` / `VITE_FIREBASE_MEASUREMENT_ID` | **yes** | none (hard fail) | Firebase web config | `src/config/firebase.js` | `initializeApp` throws; blank app |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | uploads only | — | URL + anon JWT | `src/config/supabase.js` | Storage features fail. Compose passes `VITE_SUPABASE_KEY` (no `_ANON`) — **mismatch, ignored by code** |
| `VITE_WEBHOOK_PORT` | no | `8095` | int | `realtimeListenerGuidanceBox.jsx` (display only) | Test-URL hint shows wrong port; ingestion unaffected |
| `VITE_USE_CRAFT_EDITOR` | no | `true` (in `.env`) | `true`/`false` | Craft.js page editor switch | Wrong editor variant renders |

Stale README names `VITE_API_URL` / `VITE_FIREBASE_CONFIG` — neither exists in code.

## MCP servers

Standalone `apps/mcp-server/environment.js`: `PORT` (default `5001`), `JET_ADMIN_BACKEND_URL` (**required**), `FIREBASE_CREDENTIALS` (**required**), `DEBUG`. Package `packages/mcp-server/src/config.js`: `JET_ADMIN_BACKEND_URL` (falls back to `JET_ADMIN_BASE_URL`), `JET_ADMIN_FRONTEND_URL`, `JET_ADMIN_TIMEOUT`, `JET_ADMIN_RETRIES`, `JET_ADMIN_RETRY_DELAY`, `DEBUG`; `src/index.js` requires `JET_ADMIN_API_KEY` + `JET_ADMIN_TENANT_ID` per invocation.
