---
title: Deployment
description: Docker Compose, Render, Firebase Hosting, docs on GitHub Pages, and optional Temporal stack.
sidebar_position: 15
---

# Deployment

## Docker Compose self-host (primary)

`docker-compose.yml` (≡ `docker-compose-sample.yml` except hardcoded demo secrets vs `your_*` placeholders). Three services on `jet-network`:

| Service | Build | Ports | Depends | Healthcheck |
|---|---|---|---|---|
| `frontend` (`jet-admin-frontend`) | `Dockerfile.frontend` (Node 20 build → `nginx:alpine`, `nginx.frontend.conf`, SPA fallback, workspace packages built in-image) | `80:80` | `backend` healthy | `wget --spider http://127.0.0.1/health` 30 s |
| `backend` (`jet-admin-backend`) | `Dockerfile.backend` (Node 20-slim, workspace packages built in-image, `prisma generate`, `ENTRYPOINT entrypoint.sh`, `CMD npm run pm2`) | `8090:3000` | `postgres` healthy (entrypoint also waits on `DATABASE_URL` itself) | `wget --spider http://localhost:<nginx-port>/health` (port resolved via `/tmp/nginx_port`, correct on Render too) |
| `postgres` (`jet-admin-postgres`) | `postgres:15-alpine` | `5432:5432` | — | `pg_isready -U postgres -d jet_admin_db` 10 s |

```bash
cp .env.docker .env
docker compose -f docker-compose-sample.yml up -d --build
docker compose -f docker-compose-sample.yml ps
docker compose -f docker-compose-sample.yml logs -f backend
```

Volumes: `jet-admin-postgres-data` (`/var/lib/postgresql/data`), `jet-admin-backend-logs` (`/app/apps/backend/logs`). Networks: `jet-admin-network` (bridge).

:::warning
`VITE_SERVER_HOST` / `VITE_SOCKET_HOST` are baked at build time (overridable per build via compose `args:`) AND at runtime via `/config.js` (runtime wins, no rebuild). `VITE_FIREBASE_*` values are build-time only — rebuild (or set compose `args:`) to change them; the placeholders baked by default mean Firebase auth stays disabled until you do.
:::

Rollback: `docker compose -f docker-compose-sample.yml down && docker compose -f docker-compose-sample.yml up -d --build <previous-tag>`; data persists in `postgres_data` unless `-v` is passed. `postgres:5432` is exposed for debugging — close it in production.

## Render (backend + MCP)

Both Dockerfiles bind `$PORT` (`environment.js: PORT || 8090`; `HEALTHCHECK ${PORT:-8090|5001}`), so Render's injected `PORT` (e.g. `10000`) works unmodified. `docker-entrypoint.backend.sh` waits for Postgres and runs `prisma migrate deploy` + `seed` when `SEED_DATABASE=true`.

Set in the Render panel: `DATABASE_URL`, `FIREBASE_CREDENTIALS`, `VAULT_ENCRYPTION_KEY`, `SUPABASE_*`, `OPENROUTER_API_KEY` (or provider keys), `BACKEND_URL` (public URL), `CORS_WHITELIST` (frontend origin), `WORKFLOW_ENGINE_DRIVER` + `TEMPORAL_*` if using Temporal. Healthcheck path: `/health`.

## Firebase Hosting (frontend)

`apps/frontend/firebase.json`: `public: dist`, SPA rewrite `** → /index.html`, immutable cache for `/assets/**`, no-cache for `index.html`. Project: `.firebaserc` `default: jet-labs-projects`.

```bash
cd apps/frontend
npm run build
npm run deploy   # build + firebase deploy --only hosting
```

## Docs (GitHub Pages, CI-only)

No app CI exists — both workflows deploy **docs only**:

| Workflow | Trigger | Steps |
|---|---|---|
| `.github/workflows/main.yml` | push `main` | Node 18, `npm ci` in `docs/`, `docusaurus build`, `upload-pages-artifact` (`docs/build`) → `deploy-pages` |
| `.github/workflows/deploy.yml` | push `dev` | Node 20, `npm install --legacy-peer-deps`, same build/deploy |

Docs alt (manual): `cd docs && npm run build && npm run deploy` (`gh-pages -d build`).

## Temporal dev stack (optional workflow engine)

```bash
npm run temporal:up   # postgres :5433, server :7233, UI :8088, admin-tools
```

Set `WORKFLOW_ENGINE_DRIVER=temporal` + `TEMPORAL_ADDRESS=localhost:7233`, then `cd apps/backend && npm run temporal:worker`. `temporal/dynamicconfig/development-sql.yaml` disables client version check and enables update-workflow execution. Compose env: `DB=postgres12`, `DBNAME=temporal`, `VISIBILITY_DBNAME=temporal_visibility`, `ENABLE_ES=false`. Do not use `:latest` UI with server `1.23` (pinned `ui:2.28.0`).

## Scaling knobs

- Backend: stateless except the audit buffer — listener ingress lives in the dedicated `listener-proxy` service (single subscriber, raw events → Redis Stream `listener:events`, group `listener-workers`, DLQ `listener:events:dlq`), consumed by backend pipeline workers over Redis Streams (`REDIS_URL` required — there is no embedded mode). Socket.IO uses the Redis adapter when `REDIS_URL` is set so `push_to_app_page` emits fan out across replicas. `pm2` single process in image; scale via replicas. Redis: `redis:7-alpine`, `noeviction` + AOF, persistent `redis_data` volume.
- Temporal: `TEMPORAL_MAX_CONCURRENT_ACTIVITIES/WORKFLOWS` (20/20), worker restart policy envs.
- Frontend: static nginx; cache-bust via hashed assets. `client_max_body_size` 50 M only in legacy `nginx.conf`; active `nginx.frontend.conf` inherits nginx default — large uploads should go direct to backend (10 MB multer cap) or Supabase.
