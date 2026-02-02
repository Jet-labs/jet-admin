#!/bin/bash
# ============================================
# Jet Admin - Database Backup Script
# ============================================
# Usage: ./backup-db.sh [backup_dir]
# 
# Environment variables:
#   DATABASE_URL - PostgreSQL connection string (optional)
#   POSTGRES_PASSWORD - Database password (optional)
#   BACKUP_RETENTION_DAYS - Days to keep old backups (default: 7)

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${1:-./backups}"
CONTAINER_NAME="jet-admin-postgres"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-jet_admin_db}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Parse database host from DATABASE_URL if available
if [ -n "$DATABASE_URL" ]; then
    DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|.*@([^:/]+).*|\1|')
    DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
    DB_USER=$(echo "$DATABASE_URL" | sed -E 's|.*://([^:]+):.*|\1|')
    DB_PASSWORD=$(echo "$DATABASE_URL" | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|')
    
    if [ -z "$DB_PORT" ] || [ "$DB_PORT" = "$DATABASE_URL" ]; then
        DB_PORT=5432
    fi
else
    DB_HOST="localhost"
    DB_PORT=5432
    DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
fi

BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

echo "============================================"
echo "Jet Admin - Database Backup"
echo "============================================"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_FILE_GZ"
echo "Timestamp: $TIMESTAMP"
echo "============================================"

# Determine backup method
if command -v docker &> /dev/null && [ "$DB_HOST" = "localhost" ] && docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Using Docker container backup method..."
    docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE_GZ"
elif command -v pg_dump &> /dev/null; then
    echo "Using pg_dump backup method..."
    PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE_GZ"
else
    echo "ERROR: Cannot find docker or pg_dump to perform backup."
    echo "Please ensure either:"
    echo "  - Docker is installed and the postgres container is running"
    echo "  - pg_dump is installed (part of postgresql-client)"
    exit 1
fi

# Verify backup was created
if [ -f "$BACKUP_FILE_GZ" ] && [ -s "$BACKUP_FILE_GZ" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
    echo "============================================"
    echo "Backup completed successfully!"
    echo "File: $BACKUP_FILE_GZ"
    echo "Size: $BACKUP_SIZE"
    echo "============================================"
else
    echo "ERROR: Backup file was not created or is empty"
    exit 1
fi

# Clean up old backups
if [ "$RETENTION_DAYS" -gt 0 ]; then
    echo "Cleaning up backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    REMAINING=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f | wc -l)
    echo "Remaining backups: $REMAINING"
fi

echo "============================================"
echo "Backup process complete"
echo "============================================"
