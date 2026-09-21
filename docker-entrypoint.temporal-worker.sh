#!/bin/bash
set -e

echo "============================================"
echo "Jet Admin Temporal Worker - Docker Entrypoint"
echo "============================================"

cd /app/apps/backend

export NODE_ENV=${NODE_ENV:-production}
TEMPORAL_HOST=${TEMPORAL_ADDRESS:-temporal:7233}
# TEMPORAL_ADDRESS may be "host:port" — split for nc check
T_HOST=$(echo "$TEMPORAL_HOST" | cut -d: -f1)
T_PORT=$(echo "$TEMPORAL_HOST" | cut -d: -f2)
[ -z "$T_PORT" ] && T_PORT=7233

echo "  Temporal target: $T_HOST:$T_PORT"
echo "  Task queue:      ${TEMPORAL_TASK_QUEUE:-jet-admin-workflows}"
echo "  Namespace:       ${TEMPORAL_NAMESPACE:-default}"

# ============================================
# Wait for Temporal server (worker retries
# indefinitely anyway, but fail-fast message
# is clearer than a crash loop)
# ============================================
echo "Waiting for Temporal at $T_HOST:$T_PORT..."
timeout=120
while ! nc -z "$T_HOST" "$T_PORT" 2>/dev/null; do
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo "  WARNING: Temporal not reachable yet — starting anyway,"
        echo "  worker will retry with backoff (see worker.js)."
        break
    fi
    sleep 1
done
echo "  Temporal check done (worker has built-in retry)."

# ============================================
# Wait for app Postgres (activities use Prisma)
# ============================================
if [ -n "$DATABASE_URL" ]; then
    echo "Checking app database reachability..."
    DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
    DB_PORT=$(echo "$DATABASE_URL" | sed -nE 's|.*:([0-9]+)/.*|\1|p')
    [ -z "$DB_PORT" ] && DB_PORT=5432
    timeout=60
    while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
        timeout=$((timeout - 1))
        if [ $timeout -le 0 ]; then
            echo "  WARNING: app DB not reachable yet — starting anyway."
            break
        fi
        sleep 1
    done
    echo "  App DB check done."
fi

echo "============================================"
echo "Starting Temporal worker: $@"
echo "============================================"

exec "$@"
