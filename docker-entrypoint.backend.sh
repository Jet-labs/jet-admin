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

# Capture Render's external port BEFORE we override PORT.
# Render sets PORT to the single public-facing port (e.g. 10000).
# We need nginx to bind to that port, while Node.js binds to 8090 internally.
export NGINX_PORT=${PORT:-10000}

# Force Node.js onto the internal port.
# All other env vars (FIREBASE_CREDENTIALS, VAULT_ENCRYPTION_KEY, SUPABASE_*,
# GROQ_API_KEY, GOOGLE_CLIENT_*, BACKEND_URL, etc.) are already present in
# process.env — injected by Render's environment panel. No .env file needed.
export PORT=8090

# ============================================
# Wait for Dependencies
# ============================================
echo "[2/3] Waiting for dependencies..."

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
echo "Generating NGINX configuration for port $NGINX_PORT..."
envsubst '${NGINX_PORT}' < /etc/nginx/nginx.backend.conf > /etc/nginx/nginx.conf

echo "Starting internal NGINX router..."
nginx -g 'daemon off;' &

echo "Starting Node.js backend server on port 8090..."
echo "============================================"

exec "$@"
