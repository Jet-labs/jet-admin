---
title: Configuration Reference
description: Every environment variable the code actually reads — backend, frontend, MCP — with defaults and failure modes.
sidebar_position: 11
---

# Configuration Reference

Source of truth: `apps/backend/environment.js` (sole sanctioned `process.env` reader), `apps/frontend/src/{constants.js,config/*}`, `apps/mcp-server/environment.js`, `packages/mcp-server/src/{config.js,index.js}`, and the `docker-compose*.yml` environment sections. Where compose/`.env.docker` and code disagree, **code wins** and the drift is flagged.

All backend changes require process restart. All `VITE_*` changes require frontend rebuild (`vite build` statically replaces them at build time) — except `SERVER_HOST` / `SOCKET_HOST`, which `docker-entrypoint.frontend.sh` writes to `/config.js` at container startup (runtime `SERVER_HOST`/`SOCKET_HOST` env wins, no rebuild).

## Backend (`apps/backend`, read via `environment.js`)

### Core

| Key | Required | Default | Format | Read by | What breaks if wrong |
|---|---|---|---|---|---|
| `NODE_ENV` | no | `development` | `development`/`production`/`test` | everything (`NODE_ID` derivation, logging) | `test` enables `authProviderTest` bypass — never set in prod |
| `NODE_ID` | no | `dev_node_1` / `prod_node_1` | string | `winston.config.js` (log filename `logs/<NODE_ID>-<date>.log`) | Log files collide across nodes if duplicated |
| `PORT` | no | `8090` | int | `http-server.config.js` | Compose sets `3000`; Render injects `$PORT`. Healthchecks must target the effective port |
| `DATABASE_URL` | **yes** | — | Prisma Postgres URL | Prisma (`schema.prisma` `env("DATABASE_URL")`), `run-manual-migrations.js` | Boot fails; nothing works. Compose defaults to bundled postgres; set `DATABASE_URL` to your own DB and leave `postgres` out of the `up` service list to skip it (nothing depends on it) |
| `ENABLED_MODULES` | no | `auth,tenant` only | comma list, no spaces | `config/module.config.js` `isModuleEnabled()` (missing key = enabled) | Compose enables 16 modules; minimal default disables datasource/query/workflow/widget — most UI 404s |
| `EXPRESS_REQUEST_SIZE_LIMIT` | no | `5mb` | bytes string (`5mb`, `10mb`) | `express-app.config.js` (`json`+`urlencoded`) | Large bundle imports rejected; uploads use separate 10 MB multer cap |
| `CORS_WHITELIST` | no | `http://localhost:3000,5173,3001,127.0.0.1:3000,3001` | comma URLs | `express-app.config.js`, `socket.io.js` | Browsers blocked; `/webhooks` stays open (`origin:true`) regardless |

### Auth / secrets

| Key | Required | Default | Format | Read by | What breaks if wrong |
|---|---|---|---|---|---|
| `FIREBASE_CREDENTIALS` | **yes** (any user auth) | — | JSON service-account blob | `config/firebase.config.js` (`verifyIdToken`) | All `Bearer` logins fail |
| `VAULT_ENCRYPTION_KEY` | **yes** (vault/OAuth/datasources) | — | 32-byte hex | `utils/encryption.util.js` (AES-256-GCM) | Decrypt throws; datasource tests, OAuth callback, AI tools fail. No auto-rotation |
| `OAUTH_STATE_SECRET` | yes (Google OAuth) | — | JWT secret | `modules/oauth/oauth.controller.js` (10-min state) | OAuth handshake fails signature check |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | yes (Google OAuth) | — | OAuth client pair | `modules/oauth/*`, `modules/vault/vault.service.js` | `/oauth/google/*` 500s |
| `BACKEND_URL` | no | — | public backend URL | OAuth callback + `OPENROUTER_HTTP_REFERER` fallback | OAuth redirect + OpenRouter referer header wrong behind proxies |

### AI (Jet Agent, OpenRouter-compatible)

| Key | Required | Default | Format | Notes |
|---|---|---|---|---|
| `OPENROUTER_API_KEY` | yes (agent) | — | `sk-or-…` | Workspace fallback; tenant vault `ai_config` wins when set |
| `AI_BASE_URL` | no | `https://openrouter.ai/api/v1` | URL | OpenAI-compatible endpoint |
| `AI_MODEL` | no | `minimax/minimax-m3` | model slug | Primary model |
| `AI_FALLBACK_MODELS` | no | 3 free models (Nemotron Ultra/Super, GLM 5.2) | comma slugs | Tried in order |
| `OPENROUTER_HTTP_REFERER` | no | `BACKEND_URL` → `http://localhost:8090` | URL | Required by OpenRouter rankings |
| `OPENROUTER_APP_TITLE` | no | `Jet Admin` | string | OpenRouter dashboard label |
| `AI_MAX_STEPS` | no | `25` | int | Agent tool-call ceiling |
| `AI_TEMPERATURE` | no | `0.2` | float | Generation temperature |
| ~~`GEMINI_API_KEY` / `NVIDIA_API_KEY`~~ | — | — | — | **Removed**: nothing in production code consumed them (`GEMINI_API_KEY` only in `scratch/` dev scripts, which read `process.env` directly) |

### Storage / files (S3 only — AWS, MinIO, RustFS)

| Key | Required | Default | Format | Read by |
|---|---|---|---|---|
| `S3_ENDPOINT` | yes (uploads) | — | URL (server-side, reachable from backend) | `utils/fileStorage.util.js` (`S3 → axios` fallback for foreign URLs) |
| `S3_REGION` | no | `us-east-1` | string | Same |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | yes (uploads) | — | credentials | Same; unset = uploads throw a clear error |
| `S3_BUCKET` | no | `jet-admin-datasource-file-uploads` | bucket name | Same; `tenant-assets` bucket for logos is fixed in `constants.STORAGE` |
| `S3_PUBLIC_BASE_URL` | yes (uploads) | — | browser-facing base URL | Public file URLs (`<base>/<bucket>/<key>`) |
| `S3_FORCE_PATH_STYLE` | no | `"true"` | `"true"`/`"false"` | `false` for AWS virtual-hosted style |
| `RUSTFS_ACCESS_KEY` / `RUSTFS_SECRET_KEY` | storage profile | `rustfsadmin` | credentials | Bundled `rustfs` service (`--profile storage`); must match `S3_*` keys |

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
| `MCP_SERVER_URL` | no | `http://localhost:<MCP_SERVER_PORT>` | URL | Advertised URL (backend → MCP; compose sets `http://mcp-server:5001`) |

Docker: `mcp-server` service runs under `--profile mcp` (`docker compose --profile mcp up -d`), needs `FIREBASE_CREDENTIALS`, talks to the backend at `JET_ADMIN_BACKEND_URL` (default `http://backend:3000` in compose). Backend degrades to `AI_TOOLS_UNAVAILABLE` when MCP is absent.

### Drift: set in Docker but unread by backend

:::warning
`SEED_DATABASE` is read only by `docker-entrypoint.backend.sh` (not Node) and `POSTGRES_*` only by the postgres image — both intentional. The former no-ops (`JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`, `ACCESS_TOKEN_TIMEOUT`, `REFRESH_TOKEN_TIMEOUT`, `SESSION_SECRET`, `RABBITMQ_URL`/`USER`/`PASS`, `GEMINI_API_KEY`, `SSL_CERT_CN`, `UNPOOLED_DATABASE_URL`, `JET_ADMIN_INTERNAL_API_KEY`) were removed from compose / `.env.docker` / `environment.js` — do not re-add them. `amqplib` stays as a dependency: `RabbitMQDataSource` uses per-datasource user URLs, not env.
:::

## Frontend (`apps/frontend`, `import.meta.env`)

| Key | Required | Default | Format | Read by | What breaks if wrong |
|---|---|---|---|---|---|
| `VITE_SERVER_HOST` / `SERVER_HOST` | yes | build default `http://localhost:8090`; runtime `/config.js` wins; final fallback `window.location.origin` | URL, no trailing slash | `src/constants.js` → all `src/data/apis/*.js` (axios base). `SERVER_HOST` container env is written to `/config.js` by `docker-entrypoint.frontend.sh` (runtime, no rebuild); `VITE_SERVER_HOST` build arg is the baked-in fallback | Every REST call fails |
| `VITE_SOCKET_HOST` / `SOCKET_HOST` | yes | same as above | URL | `executionStreamService.js`, `useSocketStore.js` | No realtime (workflows, listeners, widgets) |
| `VITE_FIREBASE_API_KEY` / `VITE_FIREBASE_AUTH_DOMAIN` / `VITE_FIREBASE_PROJECT_ID` / `VITE_FIREBASE_STORAGE_BUCKET` / `VITE_FIREBASE_MESSAGING_SENDER_ID` / `VITE_FIREBASE_APP_ID` / `VITE_FIREBASE_MEASUREMENT_ID` | **yes** | none (hard fail) | Firebase web config | `src/config/firebase.js` | `initializeApp` throws; blank app |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | uploads only | — | URL + anon JWT | `src/config/supabase.js` | Storage features fail. Compose passes `VITE_SUPABASE_KEY` (no `_ANON`) — **mismatch, ignored by code** |
| `VITE_WEBHOOK_PORT` | no | `8095` | int | `realtimeListenerGuidanceBox.jsx` (display only) | Test-URL hint shows wrong port; ingestion unaffected |
| `VITE_USE_CRAFT_EDITOR` | no | `true` (in `.env`) | `true`/`false` | Craft.js page editor switch | Wrong editor variant renders |

Stale README names `VITE_API_URL` / `VITE_FIREBASE_CONFIG` — neither exists in code.

## MCP servers

Standalone `apps/mcp-server/environment.js`: `PORT` (default `5001`), `JET_ADMIN_BACKEND_URL` (**required**), `FIREBASE_CREDENTIALS` (**required**), `DEBUG`. Package `packages/mcp-server/src/config.js`: `JET_ADMIN_BACKEND_URL` (falls back to `JET_ADMIN_BASE_URL`), `JET_ADMIN_FRONTEND_URL`, `JET_ADMIN_TIMEOUT`, `JET_ADMIN_RETRIES`, `JET_ADMIN_RETRY_DELAY`, `DEBUG`; `src/index.js` requires `JET_ADMIN_API_KEY` + `JET_ADMIN_TENANT_ID` per invocation.
