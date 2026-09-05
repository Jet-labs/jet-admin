---
title: Observability
description: Logging, audit trail, health checks, and incident runbooks.
sidebar_position: 16
---

# Observability

## Logging

Winston (`config/winston.config.js`), levels `error, warn, success, info`:

- **Syslog** at `SYSLOG_LEVEL` (default `warning`) → `SYSLOG_HOST:PORT/proto` (`127.0.0.1:514/udp4`). Unreachable syslog drops silently; files unaffected.
- **Console** + **daily-rotated files** `logs/<NODE_ID>-<date>.log` at `LOG_LEVEL` (default `info`), `maxSize LOG_FILE_SIZE` MB (default `1`), `maxFiles LOG_RETENTION` days (default `7`). `NODE_ID` defaults `dev_node_1`/`prod_node_1` — set uniquely per replica or files collide on shared volumes.
- Every log line passes `utils/sensitive.js` `redact()` (`connectionString`, `webhookSecret`, OAuth secrets, `*_KEY`, `*_SECRET` → `●●●●●●●●`). `console.log` only fires on `error`.
- HTTP access: `morgan` (`:method :url :status :res[content-length] - :response-time ms`) → `winston.info` (`config/morgan.config.js`).

Backend volume `backend_logs:/app/apps/backend/logs` persists files in compose. `nginx.backend.conf` (Render path) adds `logs/nginx_*.log`; active compose nginx logs to stdout.

## Audit trail

`modules/audit/`: in-memory `logBuffer` (50 entries, 5 s flush via `startFlusher` in `config/startup.js`), written with `setImmediate` so requests never block. Middleware captures `req`+`res` bodies, strips `authorization`, redacts + truncates at 2 k chars, `type: API_REQUEST` → `tblAuditLogs`.

Query: `GET /api/v1/tenants/:tenantID/audit` (permission `audit.list`), export `GET /:tenantID/audit/export` (CSV). Buffer loss on crash ≤ 5 s by design.

## Health checks

| Probe | Target | Auth | Notes |
|---|---|---|---|
| `GET /health` | backend (compose `:3000` in container, host `:8090`) | none | `{status:'ok', timestamp}`. All Docker/Render healthchecks use this |
| `GET /health` (nginx) | frontend `:80` | none | static `200 'OK'` in `nginx.frontend.conf` |
| `pg_isready` | postgres | — | `pg_isready -U postgres -d jet_admin_db` |
| `GET /:tenantID/cronjobs/status/connections` | cron engine | tenant auth | `cronJobEngine.getStatus()` |
| `GET /:tenantID/listeners/status/connections` | listener engine | tenant auth | `listenerEngine.getStatus()` |
| `isConnectionHealthy()` | queue | internal | `queue.config.js`; no HTTP exposure |

:::warning
No Prometheus/OpenTelemetry endpoint exists (`monitorBus/publishToMonitor` in `queue.config.js` is a no-op). Monitoring = logs + audit + the status endpoints above. The backend compose healthcheck probes `:8090` while the container listens on `:3000` — fix the probe port or `PORT`.
:::

Boot recovery: `startup.js` marks `RUNNING` workflow instances older than `WORKFLOW_STALE_AFTER_MS` (default 5 min) as `FAILED`, schedules all cron jobs (`scheduleAllCronJobs`), starts all listeners, and starts the audit flusher. Shutdown (`SIGINT/SIGTERM/SIGUSR2`) stops listeners then closes HTTP.

## Runbooks

### API 5xx spike

1. `docker compose logs --tail=200 backend` (or `logs/<NODE_ID>-*.log`); filter `error`.
2. Check `DATABASE_URL` connectivity: `pg_isready -h <host>`; Prisma pool exhaustion shows as query timeouts.
3. Check `GET /health`; if 200 but routes 500, suspect `FIREBASE_CREDENTIALS` (auth) or `VAULT_ENCRYPTION_KEY` (decrypt throws on datasource/OAuth/AI paths).
4. Roll back image tag; data volume untouched.

### Workflows stuck RUNNING

1. Note `WORKFLOW_STALE_AFTER_MS` — instances older than the window flip to `FAILED` on next boot only.
2. `GET /:tenantID/workflows/instances` + `GET /instances/:instanceID`; `DELETE /instances/:instanceID/stop` to halt.
3. Temporal mode: check `:8088` UI + `npm run temporal:logs`; verify `TEMPORAL_ADDRESS/NAMESPACE/TASK_QUEUE` match worker.

### Listeners silent

1. `GET /:tenantID/listeners/status/connections`; `docker compose logs backend | grep -i listener`.
2. Webhook path: `POST /webhooks/v1/inbound/:tenantID/:pathSuffix` must match stored `endpointPath`; wrong suffix = 404 by design (open CORS, no auth logs).
3. Queue backlog: `listener.events` (+`.dlq`) are in-process — restart clears them; check `.dlq` handling before restart.

### Cron jobs not firing

1. `GET /:tenantID/cronjobs/status/connections`; verify `node-cron` schedule string in `tblCronJobs`; history in `tblCronJobHistory` (`SUCCESS|FAILURE`, `SCHEDULED`).
2. `scheduleAllCronJobs()` runs once at boot — jobs created while down schedule on next boot; missed runs do not backfill.

### Audit gaps

Buffer holds 50 entries / 5 s — a crash loses at most that window. If `tblAuditLogs` stops growing but traffic continues, the flusher died with the process; restart backend. CSV export is the supported backup path.
