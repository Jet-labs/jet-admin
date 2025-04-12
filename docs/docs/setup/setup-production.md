
# Production Setup Guide

This document outlines the steps to deploy the Jet Admin application in a production environment using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development only)
- PostgreSQL database (self-hosted or managed service)
- Firebase and Supabase credentials

---

## 1. Environment Configuration

### 1.1 Required Services
1. **Firebase**: Create a project and obtain:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID
   - Measurement ID

2. **Supabase**: Create a project and obtain:
   - Project URL
   - Anonymous API Key

3. **PostgreSQL**: Create a production database and obtain connection URL.

### 1.2 Configure Environment Variables
Update the `docker-compose.yml` with your production values:

```yaml
environment:
  # Firebase Configuration
  - VITE_FIREBASE_API_KEY=your_firebase_api_key
  - VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
  - VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
  - VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
  - VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  - VITE_FIREBASE_APP_ID=your_app_id
  - VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
  
  # Supabase Configuration
  - VITE_SUPABASE_URL=your_supabase_url
  - VITE_SUPABASE_KEY=your_supabase_key
  
  # Database Configuration
  - DATABASE_URL=postgresql://user:password@host:port/dbname

  # AI Configuration
  - GEMINI_API_KEY=your_gemini_api_key
  
  # Security Configuration
  - JWT_ACCESS_TOKEN_SECRET=strong_secret_here
  - JWT_REFRESH_TOKEN_SECRET=strong_secret_here
```

---

## 2. Deployment Setup

### 2.1 Build and Run
```bash
# Clone repository (if applicable)
git clone https://your-repository-url.git
cd project-directory

# Build and start containers
docker-compose up -d --build
```

### 2.2 Database Initialization
The system will automatically:
1. Wait for PostgreSQL connection
2. Run database migrations
3. Seed initial data (if `SEED_DATABASE=true`)

To disable seeding:
```yaml
environment:
  - SEED_DATABASE=false
```

---

## 3. Network Configuration

### 3.1 Port Mapping
| Service    | Container Port | Host Port |
|------------|----------------|-----------|
| Backend API | 8090           | 8090      |
| Frontend    | 80             | 3000      |

### 3.2 CORS Settings
Update CORS whitelist for production:
```yaml
environment:
  - CORS_WHITELIST=https://your-production-domain.com,https://admin.your-domain.com
```

---

## 4. Monitoring & Logging

### 4.1 Log Configuration
```yaml
environment:
  - SYSLOG_HOST=your-log-server.com
  - LOG_RETENTION=30  # Days to keep logs
  - LOG_FILE_SIZE=10  # Max log file size in MB
```

### 4.2 Process Management
The application uses PM2 process manager. Customize PM2 configuration in:
```json
// apps/backend/ecosystem.config.js
module.exports = {
  apps: [{
    name: "jet-admin",
    script: "src/index.js",
    instances: "max",
    autorestart: true
  }]
}
```

---

## 5. Security Best Practices

1. **SSL Configuration**
   - Add SSL certificates to Nginx configuration
   - Update `nginx.conf` for HTTPS:
     ```nginx
     listen 443 ssl;
     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/key.pem;
     ```

2. **Secret Rotation**
   - Rotate JWT secrets regularly
   - Use Docker secrets for sensitive credentials in production

3. **Firewall Rules**
   - Only expose ports 80 (HTTPS) and 443 (HTTPS)
   - Restrict database access to application servers

---

## 6. Maintenance Operations

### 6.1 Database Backups
```bash
docker exec jet-admin-container \
  pg_dump -U postgresuser -h dbhost -p 5432 dbname > backup.sql
```

### 6.2 Application Updates
```bash
# Update workflow
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## 7. Troubleshooting

### Common Issues
**Database Connection Failures**
```bash
# Test database connectivity
docker exec jet-admin-container \
  pg_isready -h your-db-host -p 5432 -U your-db-user
```

**Frontend Not Loading**
```bash
# Check nginx logs
docker exec jet-admin-container tail -f /var/log/nginx/error.log
```

**Missing Environment Variables**
```bash
# Verify container environment
docker exec jet-admin-container env
```

---

> **Important**: Always test configuration changes in a staging environment before deploying to production. Monitor application performance and set up proper alerting for critical services.
```