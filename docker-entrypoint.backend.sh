#!/bin/bash
set -e

echo "============================================"
echo "Jet Admin Backend - Docker Entrypoint"
echo "============================================"

cd /app/apps/backend

# ============================================
# Setup Environment
# ============================================
echo "[1/3] Configuring backend..."

export NODE_ENV=${NODE_ENV:-production}

# Generate .env file
cat > .env <<EOL
NODE_ENV=${NODE_ENV}
PORT=${PORT:-8090}
DATABASE_URL=${DATABASE_URL}
SESSION_SECRET=${SESSION_SECRET:-supersecret}
GEMINI_API_KEY=${GEMINI_API_KEY}
ENABLED_MODULES=${ENABLED_MODULES:-auth,tenant,database,datasource,dataQuery,workflow,widget,dashboard,userManagement,role,apiKey,cronJob,audit,ai,notification,permission}
NODE_ID=${NODE_ID:-docker_node_1}
SYSLOG_HOST=${SYSLOG_HOST:-127.0.0.1}
SYSLOG_PORT=${SYSLOG_PORT:-514}
SYSLOG_PROTOCOL=${SYSLOG_PROTOCOL:-udp4}
LOG_LEVEL=${LOG_LEVEL:-info}
EXPRESS_REQUEST_SIZE_LIMIT=${EXPRESS_REQUEST_SIZE_LIMIT:-5mb}
CORS_WHITELIST=${CORS_WHITELIST:-http://localhost:3000,http://localhost:5173,http://frontend:80,https://localhost}
JWT_ACCESS_TOKEN_SECRET=${JWT_ACCESS_TOKEN_SECRET}
JWT_REFRESH_TOKEN_SECRET=${JWT_REFRESH_TOKEN_SECRET}
ACCESS_TOKEN_TIMEOUT=${ACCESS_TOKEN_TIMEOUT:-900}
REFRESH_TOKEN_TIMEOUT=${REFRESH_TOKEN_TIMEOUT:-100h}
EOL

set -a
source ./.env
set +a

# ============================================
# Wait for Dependencies
# ============================================
echo "[2/3] Waiting for dependencies..."

# Wait for PostgreSQL
if [ -n "$DATABASE_URL" ]; then
    DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
    DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
    DB_USER=$(echo "$DATABASE_URL" | sed -E 's|.*://([^:]+):.*|\1|')
    [ -z "$DB_PORT" ] && DB_PORT=5432
    
    echo "  Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
    timeout=60
    while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -q 2>/dev/null; do
        timeout=$((timeout - 1))
        [ $timeout -le 0 ] && echo "  ERROR: PostgreSQL not available" && exit 1
        sleep 1
    done
    echo "  PostgreSQL is ready"
fi

# ============================================
# Database Initialization
# ============================================
if [ "$SEED_DATABASE" = "true" ]; then
    echo "[3/3] Initializing database..."
    npx prisma migrate deploy
    npm run seed
    echo "  Database initialized"
else
    echo "[3/3] Skipping database seed"
fi

# ============================================
# Start Backend
# ============================================
echo "============================================"
echo "Starting backend server..."
echo "============================================"

exec "$@"
