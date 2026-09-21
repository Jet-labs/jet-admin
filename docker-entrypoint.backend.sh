#!/bin/bash
set -e

echo "============================================"
echo "Jet Admin Backend - Docker Entrypoint"
echo "============================================"

cd /app/apps/backend

# ============================================
# Setup Environment + nginx reverse proxy
# ============================================
echo "[1/4] Configuring backend + nginx..."

export NODE_ENV=${NODE_ENV:-production}

# Port layout (single container, two listeners):
#   NGINX_PORT — public port of THIS container. Compose sets PORT=3000
#     (host 8090 -> container 3000); Render injects PORT (e.g. 10000).
#     When NGINX_PORT is unset we adopt PORT so Render works unmodified.
#   NODE_PORT  — internal Node.js listener (never exposed directly).
#   PORT is what Node reads via environment.js, so from here on it MUST be
#   the internal port.
NGINX_PORT=${NGINX_PORT:-${PORT:-3000}}
NODE_PORT=${NODE_PORT:-3001}
CLIENT_MAX_BODY_SIZE=${CLIENT_MAX_BODY_SIZE:-10m}
export NGINX_PORT NODE_PORT CLIENT_MAX_BODY_SIZE
export PORT=$NODE_PORT

# Render nginx config from the template baked into the image.
# envsubst is restricted to our three vars so nginx variables
# ($host, $remote_addr, $http_upgrade, …) are left intact.
if command -v nginx >/dev/null 2>&1 && [ -f /etc/nginx/nginx.conf.template ]; then
    envsubst '${NGINX_PORT} ${NODE_PORT} ${CLIENT_MAX_BODY_SIZE}' \
        < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
    nginx -t
    if [ -f /tmp/nginx.pid ] && kill -0 "$(cat /tmp/nginx.pid)" 2>/dev/null; then
        nginx -s reload
        echo "  nginx reloaded: :${NGINX_PORT} -> 127.0.0.1:${NODE_PORT}"
    else
        nginx
        echo "  nginx started: :${NGINX_PORT} -> 127.0.0.1:${NODE_PORT}"
    fi
else
    echo "  nginx skipped (no nginx binary or template — running Node directly on :${PORT})"
fi

# ============================================
# Wait for Dependencies
# ============================================
echo "[2/4] Waiting for dependencies..."

# Wait for PostgreSQL
if [ -n "$DATABASE_URL" ]; then
    DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
    DB_PORT=$(echo "$DATABASE_URL" | sed -nE 's|.*:([0-9]+)/.*|\1|p')
    DB_USER=$(echo "$DATABASE_URL" | sed -E 's|.*://([^:]+):.*|\1|')
    [ -z "$DB_PORT" ] && DB_PORT=5432

    echo "  Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
    timeout=60
    while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -q 2>/dev/null; do
        timeout=$((timeout - 1))
        if [ $timeout -le 0 ]; then
            echo "  ERROR: PostgreSQL not available at $DB_HOST:$DB_PORT"
            if [ "$DB_HOST" = "postgres" ]; then
                echo "  HINT: DATABASE_URL points at the bundled 'postgres' service, which isn't reachable."
                echo "  HINT: add 'postgres' to your 'docker compose up' service list (or run a full 'up'),"
                echo "  HINT: or set DATABASE_URL to your own database to skip it."
            fi
            exit 1
        fi
        sleep 1
    done
    echo "  PostgreSQL is ready"
fi

# ============================================
# Database Initialization
# ============================================
if [ "$SEED_DATABASE" = "true" ]; then
    echo "[3/4] Initializing database..."
    # NOTE: `prisma migrate deploy` cannot be used here. This repo keeps its
    # SQL history in prisma/migrations/manual/ (applied idempotently by
    # scripts/run-manual-migrations.js, tracked in _manual_migrations) and
    # ships no Prisma migration directories — so `migrate deploy` aborts
    # with P3015 ("Could not find the migration file at
    # prisma/migrations/manual/migration.sql"). `db push` reconciles a fresh
    # database directly from schema.prisma instead.
    npx prisma db push
    # Best-effort: each file runs in its own transaction and applied files
    # are tracked in _manual_migrations, so re-runs only retry pending ones.
    # On a fresh `db push`ed database some legacy files fail benignly with
    # "already exists" (schema.prisma already contains those objects) or
    # "does not exist" (e.g. a table that was since renamed in the schema).
    # A genuinely broken schema still fails loudly at the seed step below.
    node scripts/run-manual-migrations.js || echo "  WARNING: some manual migrations reported failures (see above) — continuing to seed."
    npm run seed
    echo "  Database initialized"
else
    echo "[3/4] Skipping database seed"
fi

# ============================================
# Start Backend
# ============================================
echo "============================================"
echo "Starting Node.js backend on 127.0.0.1:${PORT} (via nginx :${NGINX_PORT})..."
echo "============================================"

exec "$@"
