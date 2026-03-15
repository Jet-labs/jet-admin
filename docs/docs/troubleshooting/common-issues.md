---
id: troubleshooting
title: Troubleshooting & FAQ
sidebar_label: Troubleshooting
sidebar_position: 1
description: Comprehensive troubleshooting guide and frequently asked questions for Jet Admin. Find solutions to common issues and errors.
---

# Troubleshooting & FAQ

<div align="center">

### 🔍 Find Solutions to Common Issues

**Error Codes · Common Issues · FAQ · Debug Tips**

</div>

---

## 📋 Table of Contents

- [Quick Diagnostic](#quick-diagnostic)
- [Common Issues](#common-issues)
- [Error Codes Reference](#error-codes-reference)
- [FAQ - General](#faq---general)
- [FAQ - Development](#faq---development)
- [FAQ - Deployment](#faq---deployment)
- [Debug Tools](#debug-tools)
- [Getting Help](#getting-help)

---

## Quick Diagnostic

Use this flowchart to quickly identify your issue:

```
                    ┌─────────────────┐
                    │  Issue Type?    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Connection   │   │  Application  │   │  Performance  │
│  Issues       │   │  Errors       │   │  Issues       │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        ▼                   ▼                   ▼
  • Database          • 401/403 Errors     • Slow Queries
  • API               • 500 Errors         • High Memory
  • WebSocket         • UI Not Loading     • Timeout Errors
```

---

## Common Issues

### 🔌 Connection Issues

#### Cannot Connect to Database

**Symptoms:**
- Datasource test connection fails
- Error: `ECONNREFUSED` or `ETIMEDOUT`

**Solutions:**

1. **Verify Connection Details**
   ```javascript
   // Check these fields
   host: 'correct-hostname.com',  // Not localhost in Docker
   port: 5432,                     // Correct port
   database: 'mydb',              // Database exists
   username: 'user',              // Valid username
   password: 'pass'               // Correct password
   ```

2. **Check Network Connectivity**
   ```bash
   # Test connectivity
   telnet db-hostname.com 5432
   
   # Or use nc
   nc -zv db-hostname.com 5432
   ```

3. **Docker Network Issues**
   ```yaml
   # In docker-compose.yml, ensure services are on same network
   services:
     backend:
       networks:
         - jet-network
     postgres:
       networks:
         - jet-network
   
   networks:
     jet-network:
       driver: bridge
   ```

4. **Firewall Rules**
   - Ensure database accepts connections from Jet Admin server IP
   - Check security groups (AWS) or firewall rules

#### WebSocket Connection Fails

**Symptoms:**
- Real-time updates not working
- Console shows WebSocket errors
- Workflow execution doesn't show live logs

**Solutions:**

1. **Check Socket Configuration**
   ```javascript
   // Frontend: Verify socket host
   console.log(window.JET_ADMIN_CONFIG?.SOCKET_HOST);
   
   // Should match backend URL
   ```

2. **CORS Configuration**
   ```javascript
   // Backend: .env
   CORS_WHITELIST=http://localhost:5173,https://your-domain.com
   ```

3. **Proxy/Firewall**
   - Ensure WebSocket traffic is allowed
   - Some proxies block WebSocket connections
   - Try direct connection without proxy

4. **Token Expiration**
   - Firebase token may have expired
   - Refresh page to get new token
   - Check token refresh logic

---

### 🔐 Authentication Issues

#### 401 Unauthorized

**Symptoms:**
- API requests return 401
- "Token expired" or "Invalid token" errors
- Redirected to login page

**Solutions:**

1. **Check Firebase Configuration**
   ```javascript
   // Frontend: .env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   ```

2. **Verify Backend Firebase Setup**
   ```bash
   # Check firebase-key.json exists in backend root
   ls apps/backend/firebase-key.json
   ```

3. **Token Refresh**
   ```javascript
   // Frontend: Force token refresh
   const user = auth.currentUser;
   if (user) {
     const token = await user.getIdToken(true); // Force refresh
   }
   ```

4. **Time Synchronization**
   - Ensure server time is synchronized
   - Token validation fails if clock skew > 5 minutes

#### 403 Permission Denied

**Symptoms:**
- API returns 403 with `PERMISSION_DENIED`
- Can view but not edit resources

**Solutions:**

1. **Check User Role**
   ```javascript
   // Verify user's role in tenant
   const relationship = await prisma.tblUsersTenantsRelationship.findUnique({
     where: { userID_userId: userId },
     include: { role: true }
   });
   console.log('User role:', relationship.role.roleName);
   ```

2. **Verify Permissions**
   ```javascript
   // Check required permission
   const requiredPermission = 'datasource:update';
   const hasPermission = role.permissions.some(
     p => p.permissionName === requiredPermission
   );
   ```

3. **Add Missing Permission**
   ```sql
   -- Add permission to role
   INSERT INTO tblPermissions (roleID, permissionName, resource, action)
   VALUES ('role-uuid', 'datasource:update', 'datasource', 'update');
   ```

---

### ⚠️ Application Errors

#### 500 Internal Server Error

**Symptoms:**
- API returns 500 error
- Backend logs show exception
- Vague error message

**Solutions:**

1. **Check Backend Logs**
   ```bash
   # Docker logs
   docker logs jet-admin-backend --tail=100
   
   # Or view log files
   tail -f apps/backend/logs/error.log
   ```

2. **Common Causes**
   - Database connection issues
   - Missing environment variables
   - Unhandled exceptions in code
   - Memory exhaustion

3. **Enable Debug Logging**
   ```javascript
   // Backend: .env
   NODE_ENV=development
   LOG_LEVEL=debug
   ```

#### Module Not Found

**Symptoms:**
- Import errors in backend
- `Cannot find module '@jet-admin/...'`
- Frontend build fails

**Solutions:**

1. **Reinstall Dependencies**
   ```bash
   # From repository root
   rm -rf node_modules apps/*/node_modules packages/*/node_modules
   npm install
   ```

2. **Build Packages**
   ```bash
   # Build all packages
   npm run dev:all-packages
   ```

3. **Check Package Links**
   ```bash
   # Verify workspace packages are linked
   npm ls @jet-admin/datasources-logic
   ```

---

### 🐌 Performance Issues

#### Slow Queries

**Symptoms:**
- Dashboards load slowly
- Query execution takes > 10 seconds
- Timeout errors

**Solutions:**

1. **Optimize Queries**
   ```sql
   -- Add indexes
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_orders_created ON orders(created_at);
   
   -- Use EXPLAIN ANALYZE
   EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
   ```

2. **Increase Pool Size**
   ```javascript
   // Backend: DATABASE_URL with pool
   DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20"
   ```

3. **Enable Query Caching**
   ```javascript
   // In datasource configuration
   {
     enableCache: true,
     cacheTTL: 300 // 5 minutes
   }
   ```

#### High Memory Usage

**Symptoms:**
- Backend uses > 1GB RAM
- Out of memory errors
- Slow performance over time

**Solutions:**

1. **Monitor Memory**
   ```bash
   # Check memory usage
   docker stats jet-admin-backend
   
   # Or in code
   console.log(process.memoryUsage());
   ```

2. **Increase Node Memory**
   ```bash
   # Docker: Increase memory limit
   docker update --memory=2g jet-admin-backend
   ```

3. **Fix Memory Leaks**
   - Check for unclosed database connections
   - Clear intervals and timeouts
   - Limit workflow result retention

---

## Error Codes Reference

### Authentication Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `USER_AUTH_TOKEN_EXPIRED` | 401 | Firebase token expired | Refresh token, re-login |
| `USER_AUTH_TOKEN_INVALID` | 401 | Invalid Firebase token | Check Firebase config |
| `API_KEY_INVALID` | 401 | Invalid API key | Regenerate API key |
| `API_KEY_EXPIRED` | 401 | API key expired | Create new API key |

### Authorization Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `PERMISSION_DENIED` | 403 | Missing permission | Grant required permission |
| `TENANT_ACCESS_DENIED` | 403 | No access to tenant | Add user to tenant |
| `INVALID_TENANT` | 400 | Tenant not found | Check tenant ID |

### Resource Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `RESOURCE_NOT_FOUND` | 404 | Resource doesn't exist | Check resource ID |
| `RESOURCE_ALREADY_EXISTS` | 409 | Duplicate resource | Use different name/ID |
| `RESOURCE_IN_USE` | 400 | Cannot delete (in use) | Remove dependencies first |

### Validation Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `INVALID_REQUEST` | 400 | Malformed request | Check request body |
| `VALIDATION_ERROR` | 400 | Field validation failed | Fix invalid fields |
| `MISSING_REQUIRED_FIELD` | 400 | Required field missing | Add missing field |

### System Errors

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `SERVER_ERROR` | 500 | Internal server error | Check logs |
| `DATABASE_ERROR` | 500 | Database operation failed | Check DB connection |
| `EXTERNAL_SERVICE_ERROR` | 502 | External service failed | Check external service |
| `TIMEOUT` | 504 | Operation timed out | Increase timeout |

---

## FAQ - General

### Q: What are the system requirements?

**A:** Minimum requirements:
- **CPU:** 2 cores (4+ recommended)
- **RAM:** 2GB (4GB+ recommended)
- **Storage:** 10GB for application + database
- **Network:** Stable internet connection

### Q: Can I self-host Jet Admin?

**A:** Yes! Jet Admin is designed for self-hosting. You can deploy using:
- Docker Compose (single server)
- Kubernetes (scalable deployment)
- Manual installation
- Cloud platforms (AWS, GCP, Azure)

### Q: Is Jet Admin open-source?

**A:** Yes, Jet Admin is open-source under the MIT License. You can:
- Use it for free
- Modify the code
- Contribute improvements
- Deploy commercially

### Q: How many users can Jet Admin support?

**A:** Jet Admin scales based on your infrastructure:
- **Small deployment:** 10-50 concurrent users
- **Medium deployment:** 50-200 concurrent users
- **Large deployment:** 200+ concurrent users (with scaling)

### Q: What databases are supported?

**A:** Jet Admin supports 25+ data sources including:
- **Databases:** PostgreSQL, MySQL, MongoDB, SQL Server, SQLite
- **Cloud:** BigQuery, Firestore, Supabase, Airtable
- **APIs:** REST, GraphQL, and custom integrations

---

## FAQ - Development

### Q: How do I set up local development?

**A:** Follow these steps:
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up backend: `cd apps/backend && cp .env.example .env`
4. Set up frontend: `cd apps/frontend && cp .env.example .env`
5. Run migrations: `npx prisma migrate dev`
6. Start development: `npm run dev:all`

See [Setup Guide](../setup/setup-backend) for details.

### Q: How do I add a new datasource type?

**A:** Create a new datasource connector:
1. Add schema in `packages/datasource-types`
2. Implement logic in `packages/datasources-logic`
3. Create UI form in `packages/datasources-ui`
4. Register in backend and frontend

See [Creating a Datasource](../developer/creating-datasource) guide.

### Q: Can I customize the UI?

**A:** Yes! You can:
- Modify existing components in `apps/frontend`
- Create custom widgets in `packages/widgets-ui`
- Add custom themes via TailwindCSS
- White-label for your organization

### Q: How do I test workflows?

**A:** Use the built-in test mode:
1. Open workflow editor
2. Click **Test** button
3. Provide test input
4. Watch real-time execution
5. Review output and logs

---

## FAQ - Deployment

### Q: What's the recommended deployment strategy?

**A:** For production:
1. Use Docker Compose or Kubernetes
2. Deploy backend and frontend separately
3. Use managed database (RDS, Cloud SQL)
4. Configure SSL/TLS
5. Set up monitoring and alerts

See [Deployment Guide](../deployment/production-checklist).

### Q: How do I backup data?

**A:** Backup strategies:
```bash
# PostgreSQL backup
pg_dump -U postgres jet_admin_db > backup.sql

# Restore
psql -U postgres jet_admin_db < backup.sql

# Automated daily backups
0 2 * * * pg_dump -U postgres jet_admin_db > /backups/jet_$(date +\%F).sql
```

### Q: Can I scale Jet Admin horizontally?

**A:** Yes:
- **Backend:** Run multiple instances behind load balancer
- **Frontend:** Serve from CDN
- **Database:** Use read replicas
- **Cache:** Add Redis for session/cache

### Q: How do I configure SSL?

**A:** SSL configuration:
```nginx
# nginx.conf
server {
  listen 443 ssl;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  location / {
    proxy_pass http://backend:8090;
  }
}
```

---

## Debug Tools

### Backend Debugging

#### Enable Verbose Logging

```javascript
// Backend: .env
NODE_ENV=development
LOG_LEVEL=debug
DEBUG=true
PRISMA_LOG=query
```

#### Inspect Database Queries

```javascript
// Enable Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

// View all queries in console
```

#### Debug Workflow Execution

```javascript
// Add debug logging in workflow handlers
console.log('Workflow execution:', {
  workflowId,
  instanceId,
  nodeId,
  context: JSON.stringify(context, null, 2)
});
```

### Frontend Debugging

#### React DevTools

Install React DevTools extension to:
- Inspect component tree
- View props and state
- Debug context values
- Profile performance

#### Network Tab

Use browser DevTools Network tab to:
- Monitor API requests
- Check request/response payloads
- Identify slow requests
- Debug WebSocket messages

#### Debug Mode

```javascript
// Frontend: Enable debug mode
localStorage.setItem('DEBUG', 'true');

// Console will show detailed logs
```

### Performance Profiling

#### Backend Profiling

```bash
# Node.js profiler
node --inspect apps/backend/server.js

# Chrome DevTools: Connect to Node.js
chrome://inspect
```

#### Frontend Profiling

```javascript
// React Profiler
import { Profiler } from 'react';

<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

---

## Getting Help

### Support Channels

| Channel | Response Time | Best For |
|---------|--------------|----------|
| **GitHub Issues** | 1-3 days | Bug reports, feature requests |
| **GitHub Discussions** | 1-2 days | Questions, community help |
| **Documentation** | Immediate | How-to guides, references |
| **Email Support** | 24-48 hours | Enterprise support |

### Before Asking for Help

1. ✅ Check documentation
2. ✅ Search existing issues
3. ✅ Review error logs
4. ✅ Try troubleshooting steps
5. ✅ Prepare reproduction steps

### Providing Information

When asking for help, include:

```markdown
**Issue Description:**
Clear description of the problem

**Environment:**
- Jet Admin version: v1.1.0
- Deployment: Docker Compose
- Database: PostgreSQL 14
- Node.js: 18.x

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Logs:**
```
Relevant error logs here
```

**Screenshots:**
If applicable
```

---

## Next Steps

- [**API Reference**](../api-reference/index) - Complete endpoint documentation
- [**Architecture**](../architecture/backend-architecture) - System design
- [**Contributing**](../contributing) - How to contribute
- [**Security**](../concepts/security) - Security best practices

---

<div align="center">

### Still Need Help?

[Open GitHub Issue](https://github.com/Jet-labs/jet-admin/issues) · [Join Discussions](https://github.com/Jet-labs/jet-admin/discussions) · [Contact Support](#)

</div>
