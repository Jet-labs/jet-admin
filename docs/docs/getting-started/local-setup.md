---
title: Local Setup
description: Prerequisites, Docker and native setup, environment variables, database bootstrap, verification, reset commands, and troubleshooting.
sidebar_position: 9
---

# Local Setup

This page takes you from a clone to a working local installation. Commands are
verified against `package.json`, `docker-compose-sample.yml`, `Dockerfile.*`,
`docker-entrypoint.*.sh`, `apps/backend/environment.js`, and the frontend runtime
config.

| Path | Best for | What runs |
|---|---|---|
| **A — Docker** | First evaluation, demos, reference stack | Frontend, backend, PostgreSQL, Redis, listener proxy, Temporal, optional RustFS and MCP |
| **B — Native** | Day-to-day development with hot reload | Vite frontend, nodemon backend, package watchers, Docker infrastructure |

:::tip Just want to build something?
The [Quickstart](quickstart.md) walks through a complete application after the stack
is running. Use this page to get the stack healthy first.
:::

## 1. Prerequisites

| Requirement | Version / detail | Why it matters |
|---|---|---|
| **Node.js** | **20.x** (root `engines`) | Backend, frontend build, MCP, workspace packages. |
| **npm** | Ships with Node 20; workspaces | `npm install` at the root installs `apps/*` and `packages/*`. |
| **PostgreSQL** | **14+**; reference compose uses `postgres:15-alpine` | System store for tenants, assets, IAM, audit, application metadata. |
| **Docker + Compose** | Recent Docker Desktop / Engine with Compose v2 | Recommended path and easiest way to get Redis/Temporal. |
| **Firebase project** | Web app config + service-account JSON | Human sign-in. The frontend has no fallback; the backend verifies ID tokens. |
| **S3-compatible storage (optional)** | Endpoint, keys, bucket | File uploads. The app runs without it, but uploads fail. |
| **OpenRouter key (optional)** | `OPENROUTER_API_KEY` or tenant vault `ai_config` | Jet Agent. Everything else works without it. |
| **Temporal** | Bundled in Docker, or standalone | Primary and only workflow runner. Required for workflow execution, human approvals, timers, loops, and durable runs. |
| **Redis** | Required for listeners and Socket.IO fan-out | The listener pipeline is proxy-only and publishes to Redis Streams. |

:::warning Firebase is not optional for human login
There is no local username/password fallback. If the seven `VITE_FIREBASE_*` values
are missing, `initializeApp` throws and the app is blank. API keys do not replace
Firebase for interactive users.
:::

## 2. Ports and service URLs

| Service | Docker | Native | Notes |
|---|---|---|---|
| Frontend | `http://localhost` (80) | `http://localhost:5173` | Docker nginx proxies `/api`, `/socket.io`, `/webhooks`. |
| Backend API | `http://localhost:8090` | `http://localhost:8090` | Docker maps host `8090` → container nginx `3000` → Node `3001`. |
| PostgreSQL | `localhost:5432` | `localhost:5432` | `POSTGRES_HOST_PORT` configurable; close exposure in production. |
| Redis | internal `redis:6379` | `localhost:6379` | No host port published by the sample compose. |
| Listener proxy | `http://localhost:8095` | `http://localhost:8095` | Webhook ingress and `/health`. |
| Temporal gRPC | `localhost:7233` | `localhost:7233` | Required for workflow execution; the `WORKFLOW_ENGINE_DRIVER` variable is legacy and has no effect. |
| Temporal UI | `http://localhost:8088` | `http://localhost:8088` | Pinned `temporalio/ui:2.28.0`. |
| Temporal PostgreSQL | `localhost:5433` | `localhost:5433` | Separate from the application database. |
| RustFS S3 / console | `:9000` / `:9001` | — | Only with `--profile storage`. |
| MCP server | `http://localhost:5001` | `http://localhost:5001` | Only with `--profile mcp` or `npm run start:mcp`. |
| Docs site | — | `http://localhost:3000` | `cd docs && npm start`. |

## 3. Path A — Docker quick start

### Step 1: Create the environment file

```bash
cp .env.docker .env
```

PowerShell: `Copy-Item .env.docker .env`. `docker compose` reads `.env`
automatically. Do not commit it.

### Step 2: Set the minimum values

| Variable | What to use |
|---|---|
| `POSTGRES_PASSWORD` | Strong password; must match an existing volume if reusing one. |
| `VAULT_ENCRYPTION_KEY` | 32-byte hex, e.g. `openssl rand -hex 32`. Changing it later makes stored credentials unreadable. |
| `OAUTH_STATE_SECRET` | Random secret for OAuth state tokens. Set it even if Google sign-in is optional. |
| `FIREBASE_CREDENTIALS` | Firebase service-account JSON as one line, wrapped in single quotes. |
| `SEED_DATABASE` | `true` for the **first** boot, then `false`. |
| `VITE_SERVER_HOST` / `VITE_SOCKET_HOST` | `http://localhost:8090` for the default local stack. |
| `POSTGRES_USER` / `POSTGRES_DB` | `postgres` / `jet_admin_db` unless intentionally changed. |

:::danger The seed flag is easy to miss
`.env.docker` ships with `SEED_DATABASE=false`. The sample compose defaults the same
variable to `true`, but the value in `.env` wins. Copying `.env.docker` unchanged and
starting on a fresh volume leaves the schema empty; login and queries then fail with
missing-table errors. Set `SEED_DATABASE=true` before the first `up`.
:::

### Step 3: Put Firebase web config into the frontend build

The sample compose hardcodes **placeholder** `VITE_FIREBASE_*` build arguments. The
`VITE_FIREBASE_*` values in `.env.docker` are not automatically passed into them.
Replace the placeholders in the compose file (or a local copy/override) before
building. The frontend also accepts runtime `SERVER_HOST` / `SOCKET_HOST`, written to
`/config.js` by `docker-entrypoint.frontend.sh`, but Firebase values are baked at
build time.

### Step 4: Start the stack

```bash
docker compose -f docker-compose-sample.yml up -d --build
```

Equivalent: `npm run docker:up`. If your Docker host is remote, change
`VITE_SERVER_HOST`, `VITE_SOCKET_HOST`, and `CORS_WHITELIST` to browser-reachable
URLs. `localhost` inside a container is the container, not your machine.

### Step 5: Understand the first boot

`docker-entrypoint.backend.sh`:

1. Waits up to **60 seconds** for PostgreSQL with `pg_isready`.
2. If `SEED_DATABASE=true`: runs `npx prisma db push`, then
   `node scripts/run-manual-migrations.js` for `prisma/migrations/manual/*.sql`, then
   `npm run seed` to create permissions, built-in roles, and the system user.
3. Starts Node behind nginx.

The seed does **not** create a demo tenant, datasource, or app page.

:::note Why not `prisma migrate deploy`?
The repo keeps SQL history in `prisma/migrations/manual/` and deliberately uses
`prisma db push` in the entrypoint. `migrate deploy` aborts with `P3015` because there
is no standard Prisma migration directory. Use `db push` + the manual runner.
:::

### Step 6: Optional profiles

```bash
# Bundled S3-compatible storage (RustFS)
docker compose -f docker-compose-sample.yml --profile storage up -d rustfs storage-init

# MCP server for external AI clients
docker compose -f docker-compose-sample.yml --profile mcp up -d mcp-server

# Temporal CLI tools
docker compose -f docker-compose-sample.yml --profile tools up -d temporal-admin-tools
```

`mcp-server` requires `FIREBASE_CREDENTIALS`; it exits without it. RustFS defaults to
`rustfsadmin` / `rustfsadmin`; change those before exposing the ports. Temporal is
the **only** workflow engine: starting the Temporal profile is required for workflow
execution. Set `TEMPORAL_ADDRESS`, `TEMPORAL_NAMESPACE`, and
`TEMPORAL_TASK_QUEUE` to match the worker. The legacy `WORKFLOW_ENGINE_DRIVER`
variable is still read but has no effect.

### Step 7: Verify

```bash
docker compose -f docker-compose-sample.yml ps
curl http://localhost:8090/health
curl http://localhost/health
```

Expected: services running/healthy; the API returns
`{"status":"ok","timestamp":"..."}`; nginx returns `OK`; Temporal UI loads at
`http://localhost:8088`.

```bash
docker compose -f docker-compose-sample.yml logs -f backend
docker compose -f docker-compose-sample.yml logs -f listener-proxy
```

Application logs are in the `jet-admin-backend-logs` volume and
`/app/apps/backend/logs/`. `docker compose logs backend` shows entrypoint/Node output,
not every application log line.

## 4. Path B — Native development

### Step 1: Install dependencies and build packages

```bash
npm install
npm run build:packages
```

`build:packages` is required on a fresh clone because workspace packages resolve to
`dist/index.cjs` / `dist/index.mjs`, and `dist/` is gitignored. Docker images build
packages themselves; a native checkout must do it explicitly.

### Step 2: Start infrastructure

```bash
docker compose -f docker-compose-sample.yml up -d postgres redis
npm run temporal:up   # required for workflow execution
```

Do not run the standalone Temporal compose and the full sample compose at the same
time: both use `jet-admin-network` and host ports `7233`, `8088`, `5433`. If `5432` is
taken, set `POSTGRES_HOST_PORT` (e.g. `5433`) and update `DATABASE_URL`.

### Step 3: Create `apps/backend/.env`

There is **no tracked `apps/backend/.env.example`** in this checkout. Create the file
yourself; use root `.env.docker` as a reference, but change container hostnames to
`localhost`.

```env
NODE_ENV=development
PORT=8090
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/jet_admin_db
REDIS_URL=redis://localhost:6379
VAULT_ENCRYPTION_KEY=YOUR_64_HEX_CHARS
OAUTH_STATE_SECRET=YOUR_RANDOM_SECRET
FIREBASE_CREDENTIALS='{"type":"service_account",...}'
ENABLED_MODULES=auth,tenant,database,datasource,dataQuery,workflow,widget,dashboard,userManagement,role,apiKey,cronJob,audit,ai,notification,permission
CORS_WHITELIST=http://localhost:5173,http://127.0.0.1:5173
LISTENER_PROXY_PORT=8095
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=jet-admin-workflows
# Optional: S3_* for uploads, OPENROUTER_API_KEY for Jet Agent
```

:::warning `ENABLED_MODULES` defaults are minimal
If omitted, `environment.js` enables only `auth` and `tenant`. The UI loads, but
datasource, query, workflow, widget, and page routes are missing or fail. Use the full
list above for a normal development instance.
:::

### Step 4: Bootstrap the database

```bash
cd apps/backend
npx prisma db push
node scripts/run-manual-migrations.js
npm run seed
cd ../..
```

`npm run seed` creates the permission catalogue, built-in roles, and a system user;
it does not create demo business data. Check migration status with
`node scripts/run-manual-migrations.js --status`.

### Step 5: Create `apps/frontend/.env`

```env
VITE_SERVER_HOST=http://localhost:8090
VITE_SOCKET_HOST=http://localhost:8090
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_WEBHOOK_PORT=8095
```

All seven Firebase values are required by `src/config/firebase.js`.

### Step 6: Run the applications

```bash
npm run dev:all
```

This runs `temporal:up` and concurrently starts Vite (`:5173`), backend nodemon
(`:8090`), and the `dev:*` package watchers (except `dev:ui`). The root `start:b`
script uses the Windows `set NODE_ENV=development&& …` form. On macOS/Linux, use
`cd apps/backend && npm run dev` so the POSIX `export` form sets the environment
explicitly.

| Command | What it starts |
|---|---|
| `npm run start:f` | Vite frontend |
| `npm run start:b` | Backend nodemon (Windows form) |
| `cd apps/backend && npm run dev` | Backend nodemon (POSIX form) |
| `npm run dev:all-packages` | Package watchers |
| `npm run dev:ui` | Shared UI watcher (not in `dev:all-packages`) |
| `npm run start:mcp` | MCP HTTP server on `:5001` |
| `npm run start:listener-proxy` | Listener proxy on `:8095` |
| `cd apps/backend && npm run temporal:worker` | Temporal workflow worker |
| `npm run temporal:*` | Temporal lifecycle |

### Step 7: Run listeners locally

The backend no longer subscribes to datasources itself. Listener runtime needs
**PostgreSQL + Redis + listener-proxy + backend**.

```bash
docker compose -f docker-compose-sample.yml up -d redis
# create apps/listener-proxy/.env from .env.example; match DATABASE_URL,
# REDIS_URL, and VAULT_ENCRYPTION_KEY with the backend
npm run start:listener-proxy
```

`VITE_WEBHOOK_PORT` only changes the displayed test URL; ingestion goes through the
proxy on `:8095`.

### Step 8: Run the docs site

```bash
cd docs
npm ci
npm start
```

Production build: `npm run build`.

### Optional: one-command launcher

`start.ps1` / `start.sh` wrap `scripts/start.js`:

```powershell
.\start.ps1                 # core: frontend + backend + infrastructure
.\start.ps1 --all           # all apps + storage + tools profiles
.\start.ps1 --all --mode dev
.\start.ps1 --stop
.\start.ps1 --list
```

The launcher expects a local `docker-compose.yml`, which is gitignored. Copy
`docker-compose-sample.yml` to `docker-compose.yml` and edit it first if you want the
launcher to use your configuration. The explicit commands above are what this page
verifies.

## 5. Verification checklist

| Check | Command | Expected |
|---|---|---|
| Backend health | `curl http://localhost:8090/health` | `{"status":"ok",...}` |
| Frontend health (Docker) | `curl http://localhost/health` | `OK` |
| Frontend loads (native) | Open `http://localhost:5173` | Sign-in page; no Firebase error |
| Database schema | `docker exec -it jet-admin-postgres psql -U postgres -d jet_admin_db -c '\dt'` | `tblTenants`, `tblDatasources`, `tblWorkflows`, … |
| Manual migrations | `… -c 'SELECT count(*) FROM "_manual_migrations";'` | Positive count after first boot |
| Seed permissions | `… -c 'SELECT count(*) FROM "tblPermissions";'` | Non-zero count |
| Listener proxy | `curl http://localhost:8095/health` | Health payload |
| Temporal UI | `http://localhost:8088` | UI loads |
| MCP (profile) | `curl http://localhost:5001/health` | Health payload with tool count |
| Sign-in + tenant | Open the app, sign in, create a tenant | Tenant dashboard appears |

:::tip First useful smoke test
Create a tenant, add a PostgreSQL datasource pointing at a **non-production**
database, create a `SELECT 1 AS ok` query, test it, and bind it to a Text or Table
widget. That exercises auth, tenant scoping, credential decryption, the connector,
the query engine, and the page runtime in one pass.
:::

## 6. Migrations and schema changes

Jet Admin uses a two-part schema workflow:

| Part | Tool | Purpose |
|---|---|---|
| Prisma schema | `npx prisma db push` | Reconciles tables/columns/relations from `schema.prisma`. |
| Manual SQL | `node scripts/run-manual-migrations.js` | Constraints, indexes, backfills, features in `prisma/migrations/manual/*.sql`. |
| Seed | `npm run seed` | Permission catalogue, built-in roles, system user. |

Applied manual files are recorded in `_manual_migrations`, so the runner is safe to
re-run; it applies files in filename order and reports per-file failures.

```bash
cd apps/backend
npx prisma db push
node scripts/run-manual-migrations.js
npm run seed
```

For production-like changes: review the `db push` plan, back up the database, apply
manual SQL deliberately, and restart the backend. Do not rely on `db push` to preserve
data through destructive changes.

:::warning No generic migration framework
`prisma migrate dev` is not the bootstrap path, and `prisma migrate deploy` fails with
`P3015` because there is no standard Prisma migration history. If you introduce a
formal process, document it and update the Docker entrypoint.
:::

## 7. Reset and clean commands

| Goal | Command | Effect |
|---|---|---|
| Stop, keep data | `docker compose -f docker-compose-sample.yml down` | Containers stop; named volumes remain. |
| Full Docker reset | `docker compose -f docker-compose-sample.yml down -v --remove-orphans` | Deletes app DB, Redis, Temporal, logs, and RustFS data. |
| Remove local images too | `docker compose -f docker-compose-sample.yml down -v --rmi local` | Also deletes locally built images. |
| Reset only app DB | `down`, `docker volume rm jet-admin-postgres-data`, then `up -d --build` | New empty app database; set `SEED_DATABASE=true`. |
| Reset only Temporal | `npm run temporal:clean` | Removes Temporal volume only. |
| Native DB reset | `npx prisma db push --force-reset` + manual runner + seed | Drops/recreates the schema; destructive. |
| Delete one tenant | UI, or `DELETE /api/v1/tenants/:tenantID` | Cascades tenant resources and policies; irreversible. |

Named volumes: `jet-admin-postgres-data`, `jet-admin-redis-data`,
`jet-admin-backend-logs`, `jet-temporal-postgres-data`, `jet-rustfs-data`.

### Clean up a quickstart demo

1. Archive the application in Application Studio (releases and page links are
   retained; there is no release delete route).
2. Delete the demo tenant to remove its pages, widgets, queries, datasources, and
   roles in one operation.
3. Drop the separate demo database:

   ```bash
   docker exec -it jet-admin-postgres psql -U postgres -c "DROP DATABASE IF EXISTS jet_demo;"
   ```

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank frontend; Firebase error | `VITE_FIREBASE_*` missing/placeholder in a Docker build | Fill all seven values; rebuild frontend. Runtime host vars do not fix Firebase. |
| Sign-in says invalid API key | Sample compose baked `your_firebase_api_key` placeholders | Replace `frontend.build.args` values and rebuild. |
| Backend exits after ~60 s | `DATABASE_URL` host wrong for the runtime | Compose: `postgres:5432`; native: `localhost:5432`; remote: reachable host. |
| `relation "tblUsers" does not exist` | `SEED_DATABASE=false` on a fresh volume | Set `true`, restart; or run db push + manual runner + seed. |
| Backend unhealthy, API works on `:8090` | Healthcheck probes container port | Keep `http://localhost:3000/health` inside compose. |
| `dev:all` backend environment looks wrong on macOS/Linux | Root `start:b` uses the Windows `set` form | `cd apps/backend && npm run dev`. |
| `dev:all` hangs on Temporal | First pull of `temporalio/auto-setup:1.23` | Wait or `npm run temporal:logs`; workflow execution requires Temporal. |
| Port conflict (80/8090/5432/5433/8088/8095) | Another service bound | Stop it or remap host port; update hosts/CORS. |
| API calls fail after frontend loads | Wrong `VITE_SERVER_HOST`/`SERVER_HOST`, or CORS | Use browser-reachable URL; add exact origin to `CORS_WHITELIST`; restart backend. |
| `ECONNREFUSED 127.0.0.1:6379` | Redis not running | Start Redis, set `REDIS_URL`. |
| Listener test URL 404 | Wrong suffix, inactive listener, proxy down | Check status, suffix, `logs listener-proxy`. |
| Listener events don't update page | No `push_to_app_page`, wrong channel, page not subscribed | Add the action; confirm listener data source. |
| Uploads fail | `S3_*` missing or bucket absent | Set S3 values or run `storage` profile; create bucket. |
| Jet Agent tools unavailable | MCP down or `MCP_SERVER_URL` wrong | Start `mcp-server`; check `/health`. |
| MCP container exits | `FIREBASE_CREDENTIALS` missing | Provide the service-account JSON. |
| 403 after role change | Casbin drift/missing asset grant | Check role/asset permission; sync policies. |
| `migrate deploy` fails `P3015` | Standard Prisma history absent | Use `db push` + manual runner. |
| Docs build OOM | Large Docusaurus build | `NODE_OPTIONS=--max-old-space-size=4096 npm run build`. |
| Container name already in use | Standalone/other Compose project owns a fixed name | Stop/rename it; avoid `down -v` as a first resort. |

## 9. Next steps

- Build the tutorial app: [Quickstart](quickstart.md).
- Understand the runtime: [Platform Architecture](../platform/architecture.md).
- Read every environment variable: [Configuration Reference](../operations/configuration-reference.md).
- Harden the install: [Security](../operations/security.md).
- Plan a real deployment: [Deployment](../operations/deployment.md).
