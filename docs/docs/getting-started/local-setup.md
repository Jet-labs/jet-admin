---
title: Local Setup
description: Prerequisites, Docker and manual setup from clone to running, and common failure fixes.
sidebar_position: 9
---

# Local Setup

Exact commands verified against `package.json`, `docker-compose.yml`, `Dockerfile.*`, and `docker-entrypoint.*.sh`.

## Prerequisites

| Requirement | Version / detail | Why |
|---|---|---|
| Node.js | **20.x** (`engines` in root `package.json`) | Backend, MCP, packages. Frontend builder image uses Node 18 but 20 builds everything |
| npm | ships with Node 20 (workspaces + `concurrently`) | `npm install` at root installs `apps/*` + `packages/*` |
| PostgreSQL | **14+** (compose pins `postgres:15-alpine`) | System store; Prisma `DATABASE_URL` only |
| Docker + Compose | any recent | Recommended path: frontend + backend + postgres |
| Firebase project | project + client config | Backend verifies ID tokens (`FIREBASE_CREDENTIALS`); frontend `VITE_FIREBASE_*` init has no fallback |
| Supabase (optional) | URL + anon key (+ S3 keys for uploads) | File storage; app runs without it but uploads fail |
| AI keys (optional) | `OPENROUTER_API_KEY` or `GEMINI_API_KEY`/`NVIDIA_API_KEY` | Jet Agent only; tenant vault `ai_config` overrides workspace env |

## Path A — Docker (recommended)

```bash
git clone https://github.com/Jet-labs/jet-admin.git
cd jet-admin
cp .env.docker .env
docker compose up -d --build
```

What you get:

| Endpoint | URL | Notes |
|---|---|---|
| App | `http://localhost:80` | nginx serves SPA; proxies `/api`, `/socket.io`, `/webhooks` → `backend:3000` |
| API | `http://localhost:8090` | host-mapped to container `:3000` |
| Postgres | `localhost:5432` | `POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB`; exposed for debugging, remove in production |

First boot runs `docker-entrypoint.backend.sh`: waits for Postgres (`pg_isready`, 60 s), then if `SEED_DATABASE=true` runs `prisma migrate deploy` + `npm run seed`. Set `SEED_DATABASE=false` after the first run.

## Path B — Manual (full stack from root)

```bash
npm install
cd apps/backend
cp .env.example .env   # or craft from Configuration Reference; DATABASE_URL is mandatory
npx prisma migrate dev
cd ../..
npm run dev:all
```

`npm run dev:all` = `temporal:up` + concurrently (`start:f` Vite `:5173`, `start:b` nodemon backend `:8090`, all `dev:*packages` esbuild watchers). Individual commands:

| Command | What it does |
|---|---|
| `npm run start:f` | `apps/frontend` Vite dev server |
| `npm run start:b` | `apps/backend` nodemon (`NODE_ENV=development`) |
| `npm run start:mcp` | `apps/mcp-server` on `:5001` |
| `npm run seed` | `apps/backend/scripts/seed.js` |
| `npm run temporal:up/down/logs/restart/clean/ps` | `docker compose -f docker-compose.temporal.yml …` |

Docs site (separate): `cd docs && npm ci && npm start` (dev) / `npm run build` (prod). Node 18+ works for docs.

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| Backend exits waiting for DB | `DATABASE_URL` host wrong outside compose | Use `localhost:5432` manually, `postgres:5432` inside compose |
| Frontend blank + console Firebase error | `VITE_FIREBASE_*` missing (no fallback in `src/config/firebase.js`) | Provide all 7 vars; rebuild (`vite build` bakes them) |
| Supabase storage calls fail in Docker | Compose passes `VITE_SUPABASE_KEY`, code reads `VITE_SUPABASE_ANON_KEY` | Set `VITE_SUPABASE_ANON_KEY` (naming mismatch, see Configuration Reference) |
| Backend healthcheck never healthy in compose | Probe hits `:8090` but container listens on `:3000` (`PORT=3000` in compose) | Probe the container port (`:3000`) or set `PORT=8090`; tracked as known compose bug |
| `npm run dev` hangs on Temporal | `temporal:up` pulls `temporalio/auto-setup:1.23` first run | `npm run temporal:logs`; UI at `:8088` once `SERVING` |
| Port conflicts | `:80` (frontend), `:8090` (backend), `:5432`/`:5433` (postgres) | Stop conflicting services or remap ports in compose |
