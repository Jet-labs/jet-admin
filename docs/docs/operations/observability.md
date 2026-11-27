---
title: Observability
description: Logs, audit trail, health probes, workflow and listener visibility, failure modes, and incident runbooks.
sidebar_position: 16
---

# Observability

Jet Admin has three first-party signal sources: **Winston logs**, the **audit table**, and **health/status endpoints**. There is no Prometheus endpoint, no OpenTelemetry exporter, and no built-in metrics database. Monitoring is therefore log-, database-, and probe-driven.

```mermaid
flowchart TD
    subgraph Runtime
      API[backend]
      LP[listener-proxy]
      TW[temporal-worker]
      FE[frontend nginx]
    end
    API -->|Winston files + console + syslog| LOGS[(backend_logs volume / collector)]
    API -->|buffered API_REQUEST rows| AUD[(tblAuditLogs)]
    API -->|/health| PROBE[probes]
    LP -->|/health| PROBE
    TW -->|process check| PROBE
    FE -->|/health| PROBE
    API -->|status endpoints| OPS[operator checks]
    LP -->|status endpoints| OPS
    TW -->|Temporal UI / history| TMP[Temporal]
```

## Logging

Implementation: `apps/backend/config/winston.config.js`, `apps/backend/utils/logger.js`, `apps/backend/config/morgan.config.js`.

### Levels and transports

Winston is configured with four custom levels:

| Level | Numeric priority | Typical use |
|---|---|---|
| `error` | 2 | Failed request, unhandled error, decrypt/connection failure |
| `warning` | 3 | Recoverable/degraded condition |
| `success` | 4 | Successful lifecycle event |
| `info` | 5 | Request params, state transitions, access logs |

Transports:

1. **Syslog** at `SYSLOG_LEVEL` (default `warning`) to `SYSLOG_HOST:SYSLOG_PORT` (`127.0.0.1:514/udp4`). Unreachable syslog drops silently and does not affect file logging.
2. **Console** with no explicit level, so it emits every custom level.
3. **DailyRotateFile** at `LOG_LEVEL` (default `info`), filename `logs/<NODE_ID>-%DATE%.log`, `maxSize` = `LOG_FILE_SIZE` MB (default 1), `maxFiles` = `LOG_RETENTION` days (default 7).

:::warning NODE_ID is not configurable
`NODE_ID` is computed from `NODE_ENV` (`dev_node_1` or `prod_node_1`), not read from the environment. Every production replica writes `prod_node_1-<date>.log`. On a shared `backend_logs` volume, replicas collide. Use per-replica volumes, a sidecar log shipper, or change the log filename scheme in code.
:::

### Format and redaction

Each line is roughly:

```text
info: prod_node_1: DD-MM-YYYY HH:mm:ss: message |====| {"param":"value"}
```

`Logger.log` runs `redact()` from `apps/backend/utils/sensitive.js` on every `params` object **before** handing it to Winston. Redaction has two layers:

- Exact key matches (`apikey`, `authorization`, `password`, `secret`, `token`, `connectionString`, `cookie`, and related names) become `[REDACTED]`.
- String sanitization removes credentials embedded in URLs (`scheme://user:pass@host`), `password=...`, `token=...`, and `Bearer ...` values.

`console.log` is only emitted by the logger on `error`; application code is expected to use `Logger`, never `console.*`.

Access logs come from `morgan` in the format:

```text
:method :url :status :res[content-length] - :response-time ms
```

They are written through `winstonLogger.info`, so they land in the same file transport. `/health` requests are also logged.

### Where the files are

In Compose, `backend_logs:/app/apps/backend/logs` is mounted. The directory also contains `nginx_access.log` and `nginx_error.log` from the backend container's internal nginx.

```bash
docker compose logs -f backend
docker exec jet-admin-backend ls -lh /app/apps/backend/logs
docker exec jet-admin-backend tail -n 200 /app/apps/backend/logs/prod_node_1-*.log
```

PM2 runs the Node process with `--no-daemon`; its child output is also available at `/root/.pm2/logs/index-out.log` when the file transport is not enough:

```bash
docker exec jet-admin-backend tail -n 200 /root/.pm2/logs/index-out.log
```

Frontend nginx writes to `/var/log/nginx`; in the official `nginx:alpine` image those files are symlinked to stdout/stderr, so `docker compose logs frontend` is the primary path.

### Audit-safe log searching

```bash
# Errors only
docker exec jet-admin-backend sh -lc \
  'grep -h "error:" /app/apps/backend/logs/prod_node_1-*.log | tail -n 100'

# A specific tenant or route
docker exec jet-admin-backend sh -lc \
  'grep -h "tenantID" /app/apps/backend/logs/prod_node_1-*.log | tail -n 100'
```

Logs are not a tamper-evident audit record. Use the audit table for that.

## Audit trail

Implementation: `apps/backend/modules/audit/`.

### What is recorded

`auditLogMiddleware.audit` wraps requests on the tenant router and the auth router. It captures:

- Method, original URL, IP, headers (with `authorization` stripped), and request body.
- Response status, body, and headers.
- Duration in milliseconds.
- `userID`, `tenantID`, `apiKeyID`, `authType` (`USER` or `API_KEY`), and API-key title.
- `success` = status code 200–399; otherwise `error.status`.

Bodies pass through `redact()` and are truncated at **2,000 characters** (`{ _truncated: "..." }` if longer).

The audit middleware is **not** mounted on the operator control plane, Socket.IO events, webhook ingress, or the MCP server. Those paths have their own logs or no audit record.

### Buffering and loss window

`auditService.log()` pushes into an in-memory array; `startFlusher()` flushes every **5 seconds**, and the buffer flushes immediately when it reaches **50 entries**. Writes use `createMany({ skipDuplicates: true })` via `setImmediate`, so request latency is unaffected.

If the process crashes before a flush, the buffered entries are lost. `stopAllListeners()` calls `stopFlusher()` on graceful shutdown, which attempts one final flush. If the database write itself fails, the spliced batch is logged and **not re-queued**, so a database outage can create an audit gap even though the process is healthy.

### Querying and export

| Endpoint | Permission | Notes |
|---|---|---|
| `GET /api/v1/tenants/:tenantID/audit` | `audit.list` | Paginated list; filters `dateFrom`, `dateTo`, `search`, `entityType`, `compact=true` |
| `GET /api/v1/tenants/:tenantID/audit/export` | `audit.list` | CSV attachment for a date range; no pagination |

The list response includes `auditLogs`, `auditLogsCount`, `nextPage`, and `compact`. `compact=true` removes response bodies/headers and request headers from the returned metadata.

```bash
curl -s \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  "https://app.example.com/api/v1/tenants/$TENANT_ID/audit?page=1&pageSize=50&dateFrom=2026-11-01"
```

CSV is the supported bulk export. Treat it as sensitive: it can contain request payloads and user identifiers even after redaction.

## Health checks

| Probe | Target | Auth | What it actually verifies |
|---|---|---|---|
| `GET /health` | backend nginx / Node | none | Process + proxy chain; returns `{status:"ok", timestamp}`. Does **not** check PostgreSQL, Redis, Temporal, Firebase, or vault. |
| `GET /health` | frontend nginx | none | Static `200 OK`; does not verify the backend. |
| `GET /health` | listener-proxy | none | Process, active listener count, Redis readiness, assigned shard/version (best effort). Returns 200 even when `redis` is `"not-ready"` unless the handler throws. |
| `GET /health` | MCP HTTP server | none | Process + registered tool count; does not verify the backend or Firebase. |
| `pg_isready` | PostgreSQL | — | Database accepts connections. |
| `redis-cli ping` | Redis | — | Redis responds. |
| `tctl cluster health` | Temporal | — | Temporal frontend reports `SERVING`. |
| `pgrep` | temporal-worker | — | Worker process exists; does not verify task-queue polling. |
| `GET /:tenantID/cronjobs/status/connections` | cron engine | tenant auth | Per-job connection/engine status. |
| `GET /:tenantID/listeners/status/connections` | listener engine | tenant auth | Per-listener state, retry count, transport state. |
| `GET /:tenantID/datasources/:datasourceID/health` | datasource | `datasource.test` | Decrypts stored options and tests the saved connection. |
| `isConnectionHealthy()` | Redis bus | internal | `redis.config` client readiness; no HTTP exposure. |

```bash
curl -fsS http://localhost:8090/health
curl -fsS http://localhost:8095/health
curl -fsS http://localhost:5001/health
```

:::warning No readiness gate
A 200 from `/health` is a liveness signal, not a readiness signal. After a cold boot the backend can answer `/health` while migrations, seeding, Temporal worker connection, or the listener consumer are still converging. Gate traffic on your own dependency checks if that matters.
:::

## Workflow and listener visibility

### Workflows

- `GET /api/v1/tenants/:tenantID/workflows/instances` — paginated history, filterable by `workflowID`, `status`, `isTest`, `parentInstanceID`.
- `GET /api/v1/tenants/:tenantID/workflows/instances/:instanceID` — status, timestamps, `workflowOutput`, `contextData`, log rows, and `pendingDataCollectionRequests`.
- `DELETE /api/v1/tenants/:tenantID/workflows/instances/:instanceID/stop` — stop a **test** instance.
- `POST /api/v1/tenants/:tenantID/workflows/instances/:instanceID/cancel` — request cancellation of a production instance.

A run can be `COMPLETED` and still have taken the wrong branch. Inspect `contextData`/`output`, not only `status`.

At boot and every five minutes, `startup.js` selects `RUNNING` instances older than `WORKFLOW_STALE_AFTER_MS` and calls Temporal reconciliation. Age is a selection criterion, not proof of failure: a human-in-the-loop run or a long timer can be legitimately idle.

### Temporal

- UI: `http://localhost:8088` in the bundled stack.
- Task queue: `TEMPORAL_TASK_QUEUE` (default `jet-admin-workflows`).
- Worker health: `docker compose logs -f temporal-worker`, plus the Temporal UI's task-queue pollers.
- The worker enables SDK tracing (`enableSDKTracing: true`), but no exporter/collector is configured. Do not assume traces are being shipped anywhere.

### Listeners

The backend does not own subscriptions. `listener-proxy` owns datasource subscriptions and webhook ingress, publishes raw envelopes to the Redis Stream, and backend pipeline workers consume them as competing consumers.

Inspect the bus:

```bash
docker compose exec redis redis-cli XLEN listener:events
docker compose exec redis redis-cli XINFO GROUPS listener:events
docker compose exec redis redis-cli XPENDING listener:events listener-workers
docker compose exec redis redis-cli XRANGE listener:events:dlq - + COUNT 5
```

What the numbers mean:

- **Stream length** includes unread and pending entries; `MAXLEN ~10000` is approximate.
- **Pending (PEL)** entries are delivered but unacknowledged. The consumer reclaims entries idle for more than 5 minutes every 60 seconds with `XAUTOCLAIM`.
- **DLQ** receives parse failures and hard pipeline failures (for example, action resolution against a down database). Transform errors stop the pipeline for that event; individual dispatch errors are logged and the loop continues. Neither reaches the DLQ.
- An empty stream with a growing DLQ means the consumer is alive but the payload/action path is failing.

Proxy health also reports `activeListeners`, `assignedListeners`, `assignmentVersion`, and `redis`. A proxy that lost registry ownership fails closed: `resync()` stops all local subscriptions when it cannot read its shard.

## Metrics and tracing gap

There is **no** `/metrics` endpoint and no bundled Prometheus, Grafana, OpenTelemetry, or StatsD integration. Do not scrape an endpoint that does not exist. The practical substitutes are:

- HTTP access logs (status, latency, route) shipped to a log platform.
- Database counts for business-level backlog and failures.
- Redis `XLEN`/`XPENDING` for listener lag.
- Temporal UI and Temporal's own metrics if you operate the cluster.
- Docker/platform health status and restart counts.
- Audit-table growth and 4xx/5xx ratios.

Useful read-only queries:

```sql
SELECT status, count(*) FROM "tblWorkflowInstances" GROUP BY status;
SELECT count(*) FROM "tblListeners" WHERE status = 'active';
SELECT count(*) FROM "tblAuditLogs";
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;
```

If you need first-class metrics, add an exporter or OpenTelemetry SDK in a dedicated change; the current code has neither.

## Failure modes

| Failure | User-visible effect | Degraded behavior |
|---|---|---|
| PostgreSQL unavailable | API errors; boot fails; audit writes fail | No graceful mode. Reconnect/restore; Prisma retries are bounded by the pool. |
| Redis unavailable | Listener ingestion stops; cross-replica Socket.IO emits fail; cron runs fail closed | API CRUD still works. Listener consumer retries every 2 s; cron skips runs unless `CRON_LOCK_FAIL_OPEN=true`. |
| Temporal unavailable | Workflow start/status fails; workers retry; runs can remain `RUNNING` | CRUD works; the backend starts an in-process worker with background retry. |
| listener-proxy unavailable | Webhooks return 502; subscriptions stop; no new events | Backend API and workflow CRUD continue. |
| MCP unavailable | AI chat returns `503 AI_TOOLS_UNAVAILABLE` | Rest of the platform works. |
| S3/storage unavailable | Uploads fail; image/file widgets may show broken URLs | Existing metadata remains; queries and workflows still run. |
| Firebase misconfigured | All Bearer logins fail | API keys and operator sessions use separate paths and may still work. |
| Vault key wrong/missing | Datasource tests, OAuth, AI tenant config, listener decryption fail | API boots; encrypted features throw. |
| Audit DB write failure | Audit table stops growing; buffer batches are dropped | Requests continue; logs still record errors. |
| Log volume full | Winston write errors; container may become unstable | No automatic disk guard; alert on volume usage. |

## Runbooks

### API 5xx spike

1. `docker compose logs --tail=200 backend` and grep the rotated files for `error:`.
2. `curl -fsS http://localhost:8090/health`. A 200 with route-level 500s points at application dependencies, not the process.
3. Check PostgreSQL: `docker compose exec postgres pg_isready -U postgres -d jet_admin_db`; inspect `pg_stat_activity` for long-running queries or connection exhaustion.
4. Check Redis: `docker compose exec redis redis-cli ping`.
5. Check `VAULT_ENCRYPTION_KEY` consistency across backend, worker, and listener-proxy.
6. If the failure started after a deploy, roll back the image/checkout and restore the database only if the schema changed.

### Workflows stuck `RUNNING`

1. Get the instance and inspect `status`, `pendingDataCollectionRequests`, `logs`, and `contextData`.
2. Open the Temporal UI and confirm the workflow execution exists and which activity/task is pending.
3. If Temporal is unreachable, fix connectivity; the worker retries with backoff. Do not mark the run failed by editing the database.
4. If a human request is pending, submit it or let the configured timeout route it.
5. To stop a run deliberately, use the cancel/stop endpoint; test runs are deleted, production runs are cancelled.

### Listeners silent

1. `curl -fsS http://localhost:8095/health`; confirm `redis: "ready"` and a non-zero `assignedListeners` where expected.
2. `GET /:tenantID/listeners/status/connections`; look for `error` state and retry counts.
3. `docker compose logs -f listener-proxy backend | grep -i listener`.
4. Webhook path: verify the sender uses the exact `pathSuffix` and the configured method/auth. A wrong suffix is a 404 by design; wrong auth is 401; a method mismatch is 405.
5. Check `XLEN`/`XPENDING`; a large PEL means consumers are alive but not ACKing.
6. Inspect the DLQ before replaying. Replaying a poison event without fixing the action will return it to the DLQ.

### Cron jobs not firing

1. `GET /:tenantID/cronjobs/status/connections`.
2. Check the cron expression in `tblCronJobs`; validation accepts five-field expressions.
3. Check Redis locks: `redis-cli --scan --pattern 'cron:lock:*'`. Locks carry TTLs.
4. Check history in `tblCronJobHistory` (`SUCCESS` / `FAILURE`).
5. Scheduling is synchronized at boot and on changes; a job created while the backend was down is scheduled on the next boot. Missed occurrences are not backfilled.

### Audit gaps

1. Confirm traffic is still reaching audited routes (tenant/auth), not only operator or webhook paths.
2. Check logs for `auditService:flushBuffer` errors.
3. Query `tblAuditLogs` count over time; a flat line with live traffic means flushes are failing.
4. Restart backend only after capturing logs; a restart loses the current buffer.

### Redis outage

1. Listener pipeline stops; backend logs `queue.config:redis:consumer:error` and retries.
2. Cron jobs fail closed by default; do not set `CRON_LOCK_FAIL_OPEN=true` to "fix" an outage in a multi-replica deployment.
3. Socket.IO emits only reach sockets on the same replica until Redis returns; check for adapter warnings.
4. Restore Redis, then verify `XINFO GROUPS` and consumer recovery. Pending entries are reclaimed automatically after 5 minutes idle.

### Disk and log growth

1. `docker system df` and `docker exec jet-admin-backend du -sh /app/apps/backend/logs`.
2. Reduce `LOG_RETENTION` or `LOG_FILE_SIZE`, or ship logs off-host.
3. Check for a tight error loop before simply rotating; the loop will refill the disk.

## Boot and shutdown behavior

On boot, `index.js` starts HTTP, schedules cron jobs, then `startAllListeners()`:

1. Initialize the Redis bus/consumer group.
2. Start the Temporal worker (in-process); failures defer to background retry.
3. Reconcile stale `RUNNING` projections against Temporal.
4. Start the listener pipeline worker and submission delivery.
5. Sweep proxy placements; repeat every 30 seconds.
6. Start the audit flusher; repeat every 5 seconds.

On `SIGINT`/`SIGTERM`, `stopAllListeners()` stops submission delivery, proxy/reconcile timers, cron sync, the audit flusher, the Temporal worker/client, and Redis clients, then closes HTTP. The listener-proxy deregisters from the registry immediately so peers rebalance without waiting for TTL expiry.

## Related pages

- [Configuration Reference](./configuration-reference.md) — log, Redis, Temporal, and audit-related variables.
- [Deployment](./deployment.md) — health-check wiring, backups, and upgrade procedures.
- [Security](./security.md) — what audit does and does not cover.
