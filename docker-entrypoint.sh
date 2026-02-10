#!/bin/sh
set -e

# ===============================================================
# --- Graceful Shutdown Handler ---
# ===============================================================
cleanup() {
    echo "Received shutdown signal, cleaning up..."
    nginx -s quit 2>/dev/null || true
    # Give nginx time to shutdown gracefully
    sleep 2
    exit 0
}
trap cleanup SIGTERM SIGINT SIGQUIT

# ===============================================================
# --- Build Frontend ---
# ===============================================================
echo "=========================================="
echo "Building frontend..."
echo "=========================================="
cd /apps/frontend

# Create .env file from environment variables
cat > .env <<EOL
VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
VITE_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_KEY=${VITE_SUPABASE_KEY}
EOL

# Install dev dependencies and build
echo "Running npm build..."
npm run build || { echo "ERROR: Frontend build failed!"; exit 1; }
echo "Frontend build completed successfully."

# ===============================================================
# --- Configure Backend ---
# ===============================================================
echo "=========================================="
echo "Configuring backend..."
echo "=========================================="
cd /apps/backend

# Set default NODE_ENV to production if not specified
export NODE_ENV=${NODE_ENV:-production}

# Generate environment-specific .env file from Docker environment variables
cat > .env <<EOL
NODE_ENV=${NODE_ENV}
PORT=${PORT:-8090}
DATABASE_URL=${DATABASE_URL}
GEMINI_API_KEY=${GEMINI_API_KEY}
SYSLOG_HOST=${SYSLOG_HOST:-127.0.0.1}
SYSLOG_PORT=${SYSLOG_PORT:-514}
SYSLOG_PROTOCOL=${SYSLOG_PROTOCOL:-udp4}
LOG_RETENTION=${LOG_RETENTION:-7}
SYSLOG_LEVEL=${SYSLOG_LEVEL:-warning}
LOG_LEVEL=${LOG_LEVEL:-info}
LOG_FILE_SIZE=${LOG_FILE_SIZE:-1}
EXPRESS_REQUEST_SIZE_LIMIT=${EXPRESS_REQUEST_SIZE_LIMIT:-5mb}
CORS_WHITELIST=${CORS_WHITELIST:-http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:3001,http://localhost:3001,https://localhost}
EOL

# Source the generated environment file
set -a
. ./.env
set +a

# ===============================================================
# --- Database Initialization ---
# ===============================================================
if [ "$SEED_DATABASE" = "true" ]; then
  echo "=========================================="
  echo "Initializing PostgreSQL database..."
  echo "=========================================="
  
  # Validate DATABASE_URL is set
  if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is required when SEED_DATABASE=true"
    exit 1
  fi

  # Parse connection details from DATABASE_URL
  # Format: postgresql://user:password@host:port/database?params
  # More robust parsing using shell parameter expansion
  
  # Remove the protocol prefix
  DB_URL_NO_PROTOCOL="${DATABASE_URL#*://}"
  
  # Extract user:password part (before @)
  DB_AUTH="${DB_URL_NO_PROTOCOL%%@*}"
  DB_USER="${DB_AUTH%%:*}"
  DB_PASS="${DB_AUTH#*:}"
  
  # Extract host:port/database part (after @)
  DB_HOST_PORT_DB="${DB_URL_NO_PROTOCOL#*@}"
  
  # Extract host:port (before /)
  DB_HOST_PORT="${DB_HOST_PORT_DB%%/*}"
  DB_HOST="${DB_HOST_PORT%%:*}"
  DB_PORT="${DB_HOST_PORT#*:}"
  
  # Handle case where port is not specified
  if [ "$DB_PORT" = "$DB_HOST" ]; then
    DB_PORT="5432"
  fi
  
  # Extract database name (after / and before ?)
  DB_NAME_PARAMS="${DB_HOST_PORT_DB#*/}"
  DB_NAME="${DB_NAME_PARAMS%%\?*}"

  echo "Database connection details:"
  echo "  Host: $DB_HOST"
  echo "  Port: $DB_PORT"
  echo "  User: $DB_USER"
  echo "  Database: $DB_NAME"

  echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
  
  # Wait for PostgreSQL with timeout
  MAX_RETRIES=30
  RETRY_COUNT=0
  
  until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
      echo "ERROR: Timeout waiting for PostgreSQL after $MAX_RETRIES attempts"
      exit 1
    fi
    echo "Waiting for PostgreSQL... attempt $RETRY_COUNT/$MAX_RETRIES"
    sleep 2
  done
  
  echo "PostgreSQL is ready!"

  # Run Migrations
  echo "Running database migrations..."
  npx prisma migrate deploy || { echo "ERROR: Database migration failed!"; exit 1; }

  # Seed Data
  echo "Seeding database..."
  npm run seed || { echo "WARNING: Database seeding failed, continuing..."; }
  
  echo "Database initialization completed."
else
  echo "Using external PostgreSQL database (SEED_DATABASE is not 'true')"
fi

# ===============================================================
# --- SSL Certificate Generation for Nginx (Self-Signed) ---
# ===============================================================
echo "=========================================="
echo "Configuring SSL certificates..."
echo "=========================================="

SSL_DIR="/etc/nginx/ssl"
SSL_KEY_PATH="$SSL_DIR/nginx-selfsigned.key"
SSL_CERT_PATH="$SSL_DIR/nginx-selfsigned.crt"

# Use environment variable for Common Name (CN), default to localhost
SSL_CERT_CN=${SSL_CERT_CN:-localhost}

# Ensure the target directory for SSL certs exists
mkdir -p "$SSL_DIR"

# Check if both certificate and key files already exist (e.g., mounted via volume)
if [ ! -f "$SSL_CERT_PATH" ] || [ ! -f "$SSL_KEY_PATH" ]; then
  echo "Generating self-signed SSL certificate for CN=$SSL_CERT_CN..."

  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
      -keyout "$SSL_KEY_PATH" \
      -out "$SSL_CERT_PATH" \
      -subj "/C=US/ST=State/L=City/O=JetAdmin/OU=Development/CN=$SSL_CERT_CN" \
      2>/dev/null

  echo "----------------------------------------------------------------------"
  echo "Self-signed SSL certificate generated:"
  echo "  Certificate: $SSL_CERT_PATH"
  echo "  Private Key: $SSL_KEY_PATH"
  echo ""
  echo "NOTE: This is a self-signed certificate suitable for DEVELOPMENT ONLY."
  echo "      Your browser will show security warnings."
  echo "----------------------------------------------------------------------"
else
  echo "Existing SSL certificate found in $SSL_DIR. Skipping generation."
fi

# ===============================================================
# --- Start Services ---
# ===============================================================
echo "=========================================="
echo "Starting services..."
echo "=========================================="

echo "Starting nginx for frontend..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Give nginx a moment to start
sleep 2

# Verify nginx started
if ! kill -0 $NGINX_PID 2>/dev/null; then
  echo "ERROR: Nginx failed to start!"
  exit 1
fi
echo "Nginx started successfully (PID: $NGINX_PID)"

# Start backend application (keep in foreground)
echo "Starting backend application..."
echo "=========================================="
exec "$@"
