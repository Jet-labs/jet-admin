#!/bin/sh
set -e

# Build frontend with environment variables
echo "Building frontend..."
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
npm run build

# Change to backend directory
cd /apps/backend

# Set default NODE_ENV to production if not specified
export NODE_ENV=${NODE_ENV:-production}

# Generate environment-specific .env file from Docker environment variables
cat > .env <<EOL
NODE_ENV=${NODE_ENV}
PORT=${PORT:-8090}
DATABASE_URL=${DATABASE_URL}
JWT_ACCESS_TOKEN_SECRET=${JWT_ACCESS_TOKEN_SECRET}
JWT_REFRESH_TOKEN_SECRET=${JWT_REFRESH_TOKEN_SECRET}
SYSLOG_HOST=${SYSLOG_HOST:-127.0.0.1}
SYSLOG_PORT=${SYSLOG_PORT:-514}
SYSLOG_PROTOCOL=${SYSLOG_PROTOCOL:-udp4}
LOG_RETENTION=${LOG_RETENTION:-7}
SYSLOG_LEVEL=${SYSLOG_LEVEL:-warning}
LOG_LEVEL=${LOG_LEVEL:-info}
LOG_FILE_SIZE=${LOG_FILE_SIZE:-1}
EXPRESS_REQUEST_SIZE_LIMIT=${EXPRESS_REQUEST_SIZE_LIMIT:-5mb}
CORS_WHITELIST=${CORS_WHITELIST:-http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:3001,http://localhost:3001}
ACCESS_TOKEN_TIMEOUT=${ACCESS_TOKEN_TIMEOUT:-900}
REFRESH_TOKEN_TIMEOUT=${REFRESH_TOKEN_TIMEOUT:-100h}
EOL

# Source the generated environment file
set -a
. ./.env
set +a

# Database initialization logic
if [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding PostgreSQL database"
  
  # Parse connection details from DATABASE_URL
  DB_HOST=$(echo $DATABASE_URL | awk -F[@/] '{print $4}')
  DB_PORT=$(echo $DATABASE_URL | awk -F[@:] '{print $5}' | awk -F/ '{print $1}')
  DB_USER=$(echo $DATABASE_URL | awk -F[:/@] '{print $2}')
  DB_PASS=$(echo $DATABASE_URL | awk -F[:/@] '{print $3}')
  DB_NAME=$(echo $DATABASE_URL | awk -F[/] '{print $4}' | awk -F? '{print $1}')

  echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
  until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
    sleep 2
  done

  # Run Migrations AFTER Client Generation
  echo "Running database migrations..."
  npx prisma migrate deploy

  # Seed Data LAST
  echo "Seeding database..."
  npm run seed
else
  echo "Using external PostgreSQL database"
fi

echo "Starting nginx for frontend..."
nginx -g "daemon off;" &

# Start backend application (keep in foreground)
echo "Starting backend application..."
exec "$@"
