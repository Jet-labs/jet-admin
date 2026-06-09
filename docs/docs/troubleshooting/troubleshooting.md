---
id: troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
sidebar_position: 1
description: Common issues and how to diagnose them in Jet Admin.
---

# Troubleshooting

This guide covers common issues you might encounter while building with Jet Admin and how to resolve them.

## Common Issues

### 1. Datasource Connection Failures
**Symptom:** You receive a "Connection timeout" or "Authentication failed" error when trying to test a Datasource or run a Query.
**Root Cause:** Invalid credentials, firewall blocking access, or incorrect hostname.
**Diagnostic Steps:**
- Check the backend logs for the exact driver error (e.g., `ECONNREFUSED`).
- If running in Docker, ensure the backend container can reach the target IP (e.g., `localhost` refers to the container itself, not the host machine; use `host.docker.internal` instead).
- Verify the DB user has the necessary read/write permissions.

### 2. Query Returning Stale Data
**Symptom:** You update a record in your database, but the Table widget still shows old data.
**Root Cause:** TanStack Query is caching the result, and you haven't configured a cache invalidation trigger.
**Fix:**
- To force a refresh manually, add a Button widget that calls `{{queries.myQuery.run()}}` or `{{widgets.Table1.refresh()}}`.
- Or, configure an "On Success" trigger on the mutation query that explicitly invalidates the cache for the read query.

### 3. Workflow Stuck in PENDING
**Symptom:** You trigger a workflow, but its status remains `PENDING` and no nodes execute.
**Root Cause:** The `pg-boss` background workers are not running, or the queue is paused.
**Diagnostic Steps:**
- Check the backend console. Do you see "Worker started" logs?
- Ensure your `DATABASE_URL` is correct. `pg-boss` requires a working PostgreSQL connection to manage jobs.
- **Fix:** If the orchestrator crashed mid-execution, restart the backend server. The orchestrator runs a startup check to recover stuck instances.

### 4. WebSocket Connection Drops
**Symptom:** Widgets don't update in real-time, or you see continuous reconnect attempts in the browser console.
**Root Cause:** The reverse proxy (Nginx, Caddy, etc.) is not configured to forward WebSocket headers.
**Fix:** Ensure your Nginx config includes:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "Upgrade";
```

### 5. Permission Denied Errors
**Symptom:** You get a 403 Forbidden error when trying to save a query or view an app.
**Root Cause:** Your assigned RBAC role lacks the necessary permissions for the Tenant or resource.
**Fix:** An Admin must update your role in the Tenant settings.

### 6. pg-boss Job Queue Buildup
**Symptom:** Workflows execute very slowly or seem delayed.
**Root Cause:** The worker concurrency is too low for the volume of jobs, or jobs are hanging due to slow queries or infinite loops.
**Diagnostic Steps:**
- Check the `pg-boss` tables (e.g., `pgboss.job`) directly in your PostgreSQL database to see the queue depth.
- Increase `WORKER_CONCURRENCY` in your `.env` file.

### 7. Build Failures After Schema Migration
**Symptom:** After pulling new code and restarting, the backend crashes complaining about missing tables or columns.
**Root Cause:** Prisma migrations were not applied.
**Fix:** Run `npx prisma migrate deploy` in the `apps/backend` directory.

## Viewing Logs

If you need deeper insight into what's happening:

### Backend Logs
Jet Admin uses Winston for backend logging. In a Docker deployment, view logs via:
```bash
docker-compose logs -f backend
```
Look for lines prefixed with `[error]` or `[warn]`.

### Workflow Logs
If a specific workflow fails, you don't need to check server logs. Open the Jet Admin builder, navigate to the Workflow, and view its Execution History. The UI displays the append-only context log, showing exactly what data was passed into the failed node and the specific error message generated.
