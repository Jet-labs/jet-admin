---
id: production-checklist
title: Production Deployment Checklist
sidebar_label: Production Checklist
sidebar_position: 1
description: Comprehensive checklist for deploying Jet Admin to production. Ensure security, performance, and reliability before going live.
---

# Production Deployment Checklist

<div align="center">

### ✅ Deploy with Confidence

**Pre-deployment · Security · Performance · Monitoring · Post-deployment**

</div>

---

## 📋 Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Infrastructure Setup](#infrastructure-setup)
- [Security Hardening](#security-hardening)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Alerting](#monitoring--alerting)
- [Backup & Recovery](#backup--recovery)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment Verification](#post-deployment-verification)
- [Maintenance Schedule](#maintenance-schedule)

---

## Pre-Deployment Checklist

### Environment Configuration

- [ ] **Production Environment Variables Set**
  ```bash
  # Backend: .env.production
  NODE_ENV=production
  PORT=8090
  
  # Database
  DATABASE_URL=postgresql://user:pass@prod-db:5432/jetadmin
  
  # Security
  JWT_ACCESS_TOKEN_SECRET=<strong-random-secret>
  ENCRYPTION_KEY=<32-byte-random-key>
  
  # Firebase
  FIREBASE_PROJECT_ID=your-project
  FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
  
  # CORS
  CORS_WHITELIST=https://your-domain.com
  
  # Logging
  LOG_LEVEL=info
  ENABLE_DEBUG_ROUTES=false
  ```

- [ ] **Frontend Configuration**
  ```javascript
  // config.js (runtime)
  window.JET_ADMIN_CONFIG = {
    SERVER_HOST: 'https://api.your-domain.com',
    SOCKET_HOST: 'https://api.your-domain.com',
    FIREBASE: {
      apiKey: 'AIzaSy...',
      authDomain: 'your-app.firebaseapp.com',
      projectId: 'your-project-id'
    }
  };
  ```

- [ ] **Firebase Production Project**
  - [ ] Production Firebase project created
  - [ ] Admin SDK key generated and secured
  - [ ] Authentication providers configured
  - [ ] Firebase security rules set

### Database Setup

- [ ] **Production Database Provisioned**
  - [ ] PostgreSQL 14+ installed
  - [ ] Database created
  - [ ] User with appropriate permissions created
  - [ ] Connection string tested

- [ ] **Database Configuration**
  ```sql
  -- Create production database
  CREATE DATABASE jetadmin_production;
  
  -- Create user with limited permissions
  CREATE USER jetadmin WITH PASSWORD 'secure-password';
  GRANT CONNECT ON DATABASE jetadmin_production TO jetadmin;
  GRANT USAGE ON SCHEMA public TO jetadmin;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO jetadmin;
  
  -- Enable required extensions
  \c jetadmin_production
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

- [ ] **Migrations Applied**
  ```bash
  cd apps/backend
  npx prisma migrate deploy
  ```

- [ ] **Database Indexes Created**
  ```sql
  -- Common indexes for performance
  CREATE INDEX idx_datasources_tenant ON "tblDatasources"("tenantID");
  CREATE INDEX idx_workflows_tenant ON "tblWorkflows"("tenantID");
  CREATE INDEX idx_dashboards_tenant ON "tblDashboards"("tenantID");
  CREATE INDEX idx_audit_logs_tenant ON "tblAuditLogs"("tenantID", "timestamp");
  ```

---

## Infrastructure Setup

### Server Requirements

**Minimum Production Specs:**
- **CPU:** 4 cores
- **RAM:** 8GB
- **Storage:** 50GB SSD
- **Network:** 1Gbps

**Recommended for Medium Load:**
- **CPU:** 8 cores
- **RAM:** 16GB
- **Storage:** 100GB SSD
- **Network:** 1Gbps+

### Docker Deployment

- [ ] **Docker Compose Configuration**
  ```yaml
  version: '3.8'
  
  services:
    frontend:
      image: jet-admin-frontend:latest
      ports:
        - "80:80"
      environment:
        - VITE_SERVER_HOST=https://api.your-domain.com
      restart: unless-stopped
      networks:
        - jet-network
  
    backend:
      image: jet-admin-backend:latest
      ports:
        - "8090:8090"
      environment:
        - NODE_ENV=production
        - DATABASE_URL=postgresql://...
      restart: unless-stopped
      networks:
        - jet-network
      depends_on:
        - postgres
  
    postgres:
      image: postgres:14-alpine
      volumes:
        - postgres-data:/var/lib/postgresql/data
      environment:
        - POSTGRES_DB=jetadmin
        - POSTGRES_USER=jetadmin
        - POSTGRES_PASSWORD=<secure-password>
      restart: unless-stopped
      networks:
        - jet-network
  
  volumes:
    postgres-data:
  
  networks:
    jet-network:
      driver: bridge
  ```

- [ ] **Resource Limits Configured**
  ```yaml
  services:
    backend:
      deploy:
        resources:
          limits:
            cpus: '2'
            memory: 2G
          reservations:
            cpus: '1'
            memory: 1G
  ```

### Load Balancer Configuration

- [ ] **Nginx Reverse Proxy**
  ```nginx
  upstream frontend {
    server frontend:80;
  }
  
  upstream backend {
    server backend:8090;
  }
  
  server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
  }
  
  server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Frontend
    location / {
      proxy_pass http://frontend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
      proxy_pass http://backend:8090;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      
      # WebSocket support
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      
      # Timeouts
      proxy_connect_timeout 60s;
      proxy_send_timeout 60s;
      proxy_read_timeout 60s;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
  }
  ```

---

## Security Hardening

### Network Security

- [ ] **SSL/TLS Configured**
  - [ ] Valid SSL certificate installed
  - [ ] TLS 1.2+ enforced
  - [ ] HTTP redirects to HTTPS
  - [ ] HSTS header enabled

- [ ] **Firewall Rules**
  ```bash
  # Allow only necessary ports
  ufw allow 22/tcp      # SSH
  ufw allow 80/tcp      # HTTP (for redirect)
  ufw allow 443/tcp     # HTTPS
  ufw enable
  ```

- [ ] **Database Network Isolation**
  - [ ] Database not exposed to public internet
  - [ ] Only backend container can access database
  - [ ] Database port blocked from external access

### Application Security

- [ ] **Authentication Hardened**
  - [ ] Firebase Auth configured for production
  - [ ] MFA enabled for admin users
  - [ ] Session timeout configured
  - [ ] Failed login attempt limiting

- [ ] **Authorization Configured**
  - [ ] RBAC roles defined
  - [ ] Default admin user created
  - [ ] API keys rotated from development
  - [ ] Permission audit completed

- [ ] **Secrets Management**
  - [ ] All secrets in environment variables
  - [ ] No secrets in code or config files
  - [ ] Encryption keys securely stored
  - [ ] Secrets rotation procedure documented

- [ ] **Security Headers**
  ```nginx
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://firebase.googleapis.com; connect-src 'self' https://firebase.googleapis.com wss://api.your-domain.com;" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  ```

### Data Security

- [ ] **Encryption at Rest**
  - [ ] Database encryption enabled
  - [ ] Datasource credentials encrypted
  - [ ] Backup encryption enabled

- [ ] **Encryption in Transit**
  - [ ] All connections use HTTPS/WSS
  - [ ] Database connections use SSL
  - [ ] Internal service communication encrypted

- [ ] **Data Protection**
  - [ ] PII identified and protected
  - [ ] Audit logging enabled
  - [ ] Data retention policy defined
  - [ ] GDPR compliance measures implemented

---

## Performance Optimization

### Database Optimization

- [ ] **Connection Pooling**
  ```javascript
  // DATABASE_URL with pool settings
  DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=30"
  ```

- [ ] **Query Optimization**
  - [ ] Slow query log enabled
  - [ ] Query execution time monitored
  - [ ] Missing indexes identified and created
  - [ ] N+1 query problems resolved

- [ ] **Database Maintenance**
  ```sql
  -- Regular VACUUM
  VACUUM ANALYZE;
  
  -- Reindex periodically
  REINDEX DATABASE jetadmin_production;
  ```

### Application Optimization

- [ ] **Caching Strategy**
  - [ ] Redis configured for caching (optional)
  - [ ] Query result caching enabled
  - [ ] Static assets cached
  - [ ] CDN configured for frontend assets

- [ ] **Resource Limits**
  ```yaml
  # Docker resource limits
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
  ```

- [ ] **Compression Enabled**
  ```nginx
  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
  ```

### Frontend Optimization

- [ ] **Build Optimization**
  - [ ] Production build with minification
  - [ ] Tree-shaking enabled
  - [ ] Code splitting configured
  - [ ] Source maps disabled in production

- [ ] **Asset Optimization**
  - [ ] Images optimized
  - [ ] Fonts subsetted
  - [ ] CSS purged
  - [ ] Bundle size analyzed

---

## Monitoring & Alerting

### Application Monitoring

- [ ] **Logging Configured**
  ```javascript
  // Winston logger configuration
  {
    level: 'info',
    format: combine(
      timestamp(),
      json()
    ),
    transports: [
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' })
    ]
  }
  ```

- [ ] **Metrics Collection**
  - [ ] Application metrics enabled
  - [ ] Performance metrics tracked
  - [ ] Error rates monitored
  - [ ] User activity tracked

- [ ] **Health Checks**
  ```javascript
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  ```

### Alerting Configuration

- [ ] **Critical Alerts**
  - [ ] Application down
  - [ ] Database connection lost
  - [ ] Error rate > 5%
  - [ ] Response time > 2s

- [ ] **Warning Alerts**
  - [ ] Memory usage > 80%
  - [ ] Disk usage > 70%
  - [ ] CPU usage > 80%
  - [ ] Failed login attempts

- [ ] **Alert Channels**
  - [ ] Email notifications configured
  - [ ] Slack/PagerDuty integration
  - [ ] SMS for critical alerts
  - [ ] On-call rotation defined

---

## Backup & Recovery

### Backup Strategy

- [ ] **Database Backups**
  ```bash
  # Daily backup script
  0 2 * * * pg_dump -U jetadmin jetadmin_production | gzip > /backups/db_$(date +\%F).sql.gz
  
  # Weekly full backup
  0 3 * * 0 pg_dump -U jetadmin jetadmin_production | gzip > /backups/db_weekly_$(date +\%F).sql.gz
  ```

- [ ] **Backup Retention**
  - [ ] Daily backups: 7 days
  - [ ] Weekly backups: 4 weeks
  - [ ] Monthly backups: 12 months

- [ ] **Backup Verification**
  - [ ] Backup integrity checks
  - [ ] Monthly restore tests
  - [ ] Backup monitoring enabled

### Disaster Recovery

- [ ] **Recovery Procedures**
  - [ ] Database restore procedure documented
  - [ ] Application restore procedure documented
  - [ ] RTO (Recovery Time Objective) defined
  - [ ] RPO (Recovery Point Objective) defined

- [ ] **High Availability** (Optional)
  - [ ] Database replication configured
  - [ ] Load balancer with multiple backend instances
  - [ ] Failover procedure tested

---

## Deployment Steps

### Pre-Deployment

1. [ ] **Code Review Completed**
   - [ ] All changes reviewed
   - [ ] Tests passing
   - [ ] Security audit completed

2. [ ] **Staging Verification**
   - [ ] Deployed to staging environment
   - [ ] Integration tests passed
   - [ ] Performance tests passed

3. [ ] **Backup Created**
   - [ ] Current production database backed up
   - [ ] Configuration backed up

### Deployment

1. [ ] **Deploy Backend**
   ```bash
   # Pull latest image
   docker-compose pull backend
   
   # Run migrations
   docker-compose run backend npx prisma migrate deploy
   
   # Restart backend
   docker-compose up -d backend
   ```

2. [ ] **Deploy Frontend**
   ```bash
   # Pull latest image
   docker-compose pull frontend
   
   # Restart frontend
   docker-compose up -d frontend
   ```

3. [ ] **Verify Deployment**
   - [ ] Health checks passing
   - [ ] No errors in logs
   - [ ] All services running

### Post-Deployment

1. [ ] **Smoke Tests**
   - [ ] Login works
   - [ ] Can create datasource
   - [ ] Can create workflow
   - [ ] Can view dashboard
   - [ ] WebSocket connection works

2. [ ] **Monitor for Issues**
   - [ ] Error rates normal
   - [ ] Response times acceptable
   - [ ] No unusual log entries
   - [ ] User reports normal

---

## Post-Deployment Verification

### Functional Testing

- [ ] **Authentication**
  - [ ] User login works
  - [ ] Token refresh works
  - [ ] Logout works
  - [ ] Password reset works

- [ ] **Core Features**
  - [ ] Datasource CRUD operations
  - [ ] Query execution
  - [ ] Workflow creation and execution
  - [ ] Dashboard creation
  - [ ] Widget rendering

- [ ] **Real-time Features**
  - [ ] WebSocket connections
  - [ ] Live workflow logs
  - [ ] Widget real-time updates

### Performance Testing

- [ ] **Response Times**
  - [ ] API responses < 200ms (p50)
  - [ ] API responses < 500ms (p95)
  - [ ] Page load < 3s
  - [ ] WebSocket latency < 100ms

- [ ] **Load Testing**
  - [ ] 100 concurrent users supported
  - [ ] No memory leaks after 1 hour
  - [ ] Database connections stable

### Security Verification

- [ ] **Security Scan**
  - [ ] No critical vulnerabilities
  - [ ] SSL/TLS configuration valid
  - [ ] Security headers present
  - [ ] CORS configured correctly

---

## Maintenance Schedule

### Daily Tasks

- [ ] Check error logs
- [ ] Review monitoring dashboards
- [ ] Verify backups completed
- [ ] Check disk space

### Weekly Tasks

- [ ] Review performance metrics
- [ ] Check for security updates
- [ ] Review user feedback
- [ ] Analyze slow queries

### Monthly Tasks

- [ ] Apply security patches
- [ ] Review and rotate secrets
- [ ] Test backup restoration
- [ ] Performance optimization
- [ ] Database maintenance (VACUUM, REINDEX)

### Quarterly Tasks

- [ ] Security audit
- [ ] Disaster recovery drill
- [ ] Capacity planning
- [ ] Documentation review
- [ ] Dependency updates

---

## Rollback Procedure

If deployment fails:

1. **Stop Deployment**
   ```bash
   docker-compose stop
   ```

2. **Restore Previous Version**
   ```bash
   # Pull previous version tags
   docker-compose pull backend:previous-tag
   docker-compose pull frontend:previous-tag
   
   # Start previous version
   docker-compose up -d
   ```

3. **Restore Database** (if needed)
   ```bash
   # Restore from backup
   gunzip -c /backups/db_YYYY-MM-DD.sql.gz | psql -U jetadmin jetadmin_production
   ```

4. **Verify Rollback**
   - Run smoke tests
   - Check logs for errors
   - Monitor user reports

---

## Next Steps

- [**Monitoring Setup**](./monitoring) - Detailed monitoring configuration
- [**Scaling Guide**](./scaling) - Horizontal scaling strategies
- [**Backup & Recovery**](./backup-recovery) - Comprehensive backup procedures
- [**Security Best Practices**](../concepts/security) - Security hardening

---

<div align="center">

### Need Help?

[Deployment Guide](../setup/docker-deployment) · [Troubleshooting](../troubleshooting/common-issues) · [Support](#)

</div>
