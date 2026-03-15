---
id: datasource-postgresql
title: PostgreSQL Datasource - Complete Guide
sidebar_label: PostgreSQL
sidebar_position: 2
description: Complete guide to configuring PostgreSQL datasource in Jet Admin. Every field, option, and configuration explained in detail.
---

# PostgreSQL Datasource - Complete Guide

<div align="center">

### 🔌 Connect PostgreSQL Database

**Connection Details · SSL Configuration · Connection String · Testing**

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Connection Methods](#connection-methods)
- [Connection Details Configuration](#connection-details-configuration)
- [Connection String Configuration](#connection-string-configuration)
- [SSL Configuration](#ssl-configuration)
- [Advanced Options](#advanced-options)
- [Testing Connection](#testing-connection)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

---

## Overview

Jet Admin provides **native PostgreSQL connectivity** with full support for:

- ✅ Standard PostgreSQL connections
- ✅ SSL/TLS encrypted connections
- ✅ Connection pooling
- ✅ Custom connection parameters
- ✅ Connection testing before saving
- ✅ Encrypted credential storage

**PostgreSQL Version Support:** 9.4 and above

---

## Connection Methods

Jet Admin offers **two methods** to connect to PostgreSQL:

### Method 1: Connection Details (Recommended)
Enter individual connection parameters (host, port, database, etc.)

**Best for:**
- Standard database connections
- When you need fine-grained control
- SSL configuration requirements

### Method 2: Connection String
Provide a complete PostgreSQL connection URI

**Best for:**
- Quick connections
- Copy-pasting from hosting providers
- Heroku, Railway, Supabase deployments

---

## Connection Details Configuration

When you select **"Connection Details"**, you'll configure these fields:

### Basic Connection Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| **Connection Name** | String | ✅ Yes | - | Min: 3 chars, Max: 255 | A unique name to identify this datasource in Jet Admin |
| **Host** | String | ✅ Yes | - | Valid hostname or IP | PostgreSQL server hostname or IP address |
| **Port** | Integer | ❌ No | 5432 | 1 - 65535 | PostgreSQL server port number |
| **Database** | String | ✅ Yes | - | Min: 1 char | Name of the database to connect to |
| **User** | String | ✅ Yes | - | Min: 1 char | PostgreSQL username for authentication |
| **Password** | String | ✅ Yes | - | - | Password for the PostgreSQL user |

### Connection Name

**Purpose:** Identify this datasource within Jet Admin's datasource list.

**Best Practices:**
- Use descriptive names: `Production-Orders-DB` not `DB1`
- Include environment: `Dev-Postgres`, `Staging-DB`, `Prod-Analytics`
- Keep it unique across your tenant

**Examples:**
```
✅ Good: "Production-Postgres-Main"
✅ Good: "Dev-Database-Orders"
❌ Bad: "DB1"
❌ Bad: "Test"
```

### Host

**Purpose:** The PostgreSQL server address.

**Accepted Formats:**
- Domain name: `db.example.com`
- Subdomain: `postgres.internal.network`
- IP address: `192.168.1.100`
- localhost: `localhost` (for local development)
- AWS RDS: `mydb.123456789012.us-east-1.rds.amazonaws.com`
- Heroku: `ec2-54-123-45-67.compute-1.amazonaws.com`
- Supabase: `dbabcdefghijklmnop.supabase.co`

**Important Notes:**
- For Docker deployments, use the service name (e.g., `postgres`)
- For cloud databases, use the public endpoint provided
- Ensure the server is accessible from Jet Admin's network

### Port

**Purpose:** TCP port for PostgreSQL connections.

**Default:** `5432` (standard PostgreSQL port)

**Common Variations:**
- Standard PostgreSQL: `5432`
- Heroku PostgreSQL: Varies (provided in connection URL)
- Custom installations: Any available port

**When to Change:**
- Your PostgreSQL server uses a non-standard port
- Multiple PostgreSQL instances on same server
- Cloud provider assigns custom ports

### Database

**Purpose:** The specific database to connect to within PostgreSQL.

**Requirements:**
- Must exist on the PostgreSQL server
- User must have CONNECT privilege
- Case-sensitive on some systems

**Examples:**
```
✅ myapp_production
✅ analytics_db
✅ orders_database
✅ jetadmin
```

### User

**Purpose:** PostgreSQL role for authentication.

**Best Practices:**
- Use dedicated user for Jet Admin (not postgres superuser)
- Grant only required privileges (SELECT, INSERT, UPDATE, DELETE)
- Avoid using superuser accounts in production

**Recommended Privileges:**
```sql
-- Create dedicated user
CREATE ROLE jetadmin WITH LOGIN PASSWORD 'secure_password';

-- Grant database access
GRANT CONNECT ON DATABASE mydb TO jetadmin;

-- Grant schema access
GRANT USAGE ON SCHEMA public TO jetadmin;

-- Grant table privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO jetadmin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO jetadmin;
```

### Password

**Purpose:** Authentication credential for the PostgreSQL user.

**Security:**
- Stored encrypted in Jet Admin database (AES-256)
- Never displayed in plain text after saving
- Transmitted over encrypted connection (when SSL enabled)

**Password Requirements:**
- Minimum 8 characters recommended
- Include uppercase, lowercase, numbers, special characters
- Rotate regularly (every 90 days recommended)

---

## SSL Configuration

### SSL Mode Options

| SSL Mode | Description | Use Case |
|----------|-------------|----------|
| **disable** | No SSL encryption | Local development only |
| **allow** | Try non-SSL, then SSL | Legacy servers |
| **prefer** | Try SSL, then non-SSL | **Default - Recommended** |
| **require** | Require SSL (no verification) | Production with self-signed certs |
| **verify-ca** | Require SSL + verify CA | Production with trusted CA |
| **verify-full** | Require SSL + verify CA + verify host | **Most Secure - Production** |

### SSL Mode Details

#### disable
```
Encryption: ❌ None
Certificate Verification: ❌ None
Security Level: ⚠️ None
```
**Use Only For:** Local development with localhost PostgreSQL

#### prefer (Default)
```
Encryption: ✅ Preferred
Certificate Verification: ⚠️ Optional
Security Level: ✅ Good
```
**Use For:** Most production deployments

#### require
```
Encryption: ✅ Required
Certificate Verification: ❌ None
Security Level: ✅ Good
```
**Use For:** Production with self-signed certificates

#### verify-ca
```
Encryption: ✅ Required
Certificate Verification: ✅ CA verified
Security Level: ✅✅ Better
```
**Use For:** Production with certificates from trusted CA

#### verify-full
```
Encryption: ✅ Required
Certificate Verification: ✅ CA + Host verified
Security Level: ✅✅✅ Best
```
**Use For:** High-security production environments

---

## Advanced Options

### Additional Connection Parameters

Jet Admin supports **any PostgreSQL connection parameter** via `additionalOptions`:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| **connectTimeout** | Integer | Connection timeout in seconds | `10` |
| **applicationName** | String | Application identifier sent to server | `JetAdmin-App` |
| **searchPath** | String | Default schema search path | `public,analytics` |
| **sslcert** | String | Path to client SSL certificate | `/path/to/cert.pem` |
| **sslkey** | String | Path to client SSL key | `/path/to/key.pem` |
| **sslrootcert** | String | Path to root CA certificate | `/path/to/ca.pem` |
| **options** | String | Command-line options for PostgreSQL | `-c timezone=UTC` |

### connectTimeout

**Purpose:** Maximum time to wait for connection establishment.

**Type:** Integer (seconds)

**Default:** `30` seconds

**When to Adjust:**
- Slow networks: Increase to `60`
- Fast local network: Decrease to `5`
- Cloud databases with firewalls: `15-30`

**Example:**
```json
{
  "additionalOptions": {
    "connectTimeout": 15
  }
}
```

### applicationName

**Purpose:** Identify the application to PostgreSQL.

**Benefits:**
- Track connections in `pg_stat_activity`
- Filter logs by application
- Set application-specific configurations

**Example:**
```json
{
  "additionalOptions": {
    "applicationName": "JetAdmin-Dashboard"
  }
}
```

**Query Running Applications:**
```sql
SELECT application_name, count(*) 
FROM pg_stat_activity 
GROUP BY application_name;
```

### searchPath

**Purpose:** Default schema search order.

**Use Case:** When using multiple schemas

**Example:**
```json
{
  "additionalOptions": {
    "options": "-c search_path=analytics,public"
  }
}
```

---

## Connection String Configuration

### Connection String Format

When you select **"Connection String"**, provide a complete PostgreSQL URI:

```
postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&param2=value2]
```

### Complete Example

```
postgresql://myuser:mypassword@db.example.com:5432/mydb?sslmode=require&application_name=JetAdmin
```

### Connection String Components

| Component | Format | Required | Example |
|-----------|--------|----------|---------|
| **Protocol** | `postgresql://` or `postgres://` | ✅ Yes | `postgresql://` |
| **User** | `username` | ✅ Yes | `myuser` |
| **Password** | `:password` | ✅ Yes | `:mypassword` |
| **Host** | `@hostname` | ✅ Yes | `@db.example.com` |
| **Port** | `:port` | ❌ No (default: 5432) | `:5432` |
| **Database** | `/dbname` | ✅ Yes | `/mydb` |
| **Parameters** | `?key=value&key2=value2` | ❌ No | `?sslmode=require` |

### Special Characters in Password

URL-encode special characters in passwords:

| Character | URL Encoding |
|-----------|--------------|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |
| `&` | `%26` |
| `=` | `%3D` |
| `+` | `%2B` |
| `%` | `%25` |

**Example:**
```
Password: my@pass:word
Encoded: my%40pass%3Aword
Connection String: postgresql://user:my%40pass%3Aword@host:5432/db
```

### Common Connection String Examples

#### Local Development
```
postgresql://postgres:password@localhost:5432/mydb
```

#### Heroku PostgreSQL
```
postgresql://username:password@ec2-54-123-45-67.compute-1.amazonaws.com:5432/dbname?sslmode=require
```

#### AWS RDS
```
postgresql://admin:password@mydb.123456789012.us-east-1.rds.amazonaws.com:5432/production?sslmode=require
```

#### Supabase
```
postgresql://postgres:password@dbabcdefghijklmnop.supabase.co:5432/postgres?sslmode=require
```

#### Railway
```
postgresql://user:password@railway.railway.internal:5432/railway?sslmode=require
```

#### With SSL Verification
```
postgresql://user:pass@host:5432/db?sslmode=verify-full&sslrootcert=/path/to/ca.pem
```

#### With Application Name
```
postgresql://user:pass@host:5432/db?application_name=JetAdmin-Dashboard
```

#### With Search Path
```
postgresql://user:pass@host:5432/db?options=-c%20search_path%3Danalytics,public
```

---

## Testing Connection

### How to Test

1. **Configure** your PostgreSQL connection (details or string)
2. **Click** "Test Connection" button
3. **Wait** for connection attempt (1-5 seconds)
4. **Review** the result

### Test Results

#### ✅ Success

```
┌─────────────────────────────────────────┐
│  ✓ Connection Successful!               │
│                                         │
│  Connected to: postgresql://host:5432   │
│  Database: mydb                         │
│  User: myuser                           │
│  SSL: enabled (verify-full)             │
│  Response Time: 45ms                    │
│  PostgreSQL Version: 14.5               │
└─────────────────────────────────────────┘
```

#### ❌ Failure

```
┌─────────────────────────────────────────┐
│  ✗ Connection Failed                    │
│                                         │
│  Error: ECONNREFUSED                    │
│  Message: Connection refused            │
│  Host: db.example.com:5432              │
│                                         │
│  Troubleshooting:                       │
│  • Check if PostgreSQL is running       │
│  • Verify host and port                 │
│  • Check firewall rules                 │
│  • Ensure network connectivity          │
└─────────────────────────────────────────┘
```

### Common Test Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | PostgreSQL not running or wrong port | Start PostgreSQL, verify port |
| `ETIMEDOUT` | Network unreachable or firewall | Check network, firewall rules |
| `ER_ACCESS_DENIED` | Wrong username or password | Verify credentials |
| `FATAL: database does not exist` | Database name incorrect | Check database exists |
| `no pg_hba.conf entry` | Host not allowed in pg_hba.conf | Update pg_hba.conf |
| `SSL required` | Server requires SSL | Enable SSL mode |
| `certificate verify failed` | Invalid SSL certificate | Use verify-ca or verify-full |

---

## Troubleshooting

### Connection Issues

#### "Connection Refused"

**Symptoms:**
- Test connection fails immediately
- Error: `ECONNREFUSED`

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Windows
   Get-Service -Name postgresql
   ```

2. Check PostgreSQL is listening:
   ```bash
   netstat -an | grep 5432
   ```

3. Verify host and port are correct

4. Check firewall allows connections:
   ```bash
   # Linux
   sudo ufw allow 5432/tcp
   
   # AWS Security Group
   # Add inbound rule: TCP 5432 from Jet Admin IP
   ```

#### "Connection Timeout"

**Symptoms:**
- Test hangs for 30+ seconds
- Error: `ETIMEDOUT`

**Solutions:**
1. Check network connectivity:
   ```bash
   ping db.example.com
   telnet db.example.com 5432
   ```

2. Verify DNS resolution:
   ```bash
   nslookup db.example.com
   ```

3. Check for network proxies

4. Increase connection timeout in advanced options

#### "Access Denied"

**Symptoms:**
- Connection established but authentication fails
- Error: `FATAL: password authentication failed`

**Solutions:**
1. Verify username and password are correct
2. Check user exists in PostgreSQL:
   ```sql
   \du
   ```

3. Verify user has CONNECT privilege:
   ```sql
   GRANT CONNECT ON DATABASE mydb TO myuser;
   ```

4. Check pg_hba.conf allows your connection:
   ```
   # Allow from specific IP
   host    mydb    myuser    192.168.1.0/24    md5
   
   # Allow from any IP (not recommended for production)
   host    mydb    myuser    0.0.0.0/0    md5
   ```

### SSL Issues

#### "SSL Required"

**Symptoms:**
- Error: `FATAL: no pg_hba.conf entry for host, SSL off`

**Solutions:**
1. Enable SSL in connection configuration
2. Set SSL mode to `require` or higher
3. Update pg_hba.conf to require SSL:
   ```
   hostssl    mydb    myuser    0.0.0.0/0    md5
   ```

#### "Certificate Verification Failed"

**Solutions:**
1. For self-signed certificates, use `sslmode=require` (not verify-full)
2. For production, install CA certificate:
   ```json
   {
     "additionalOptions": {
       "sslrootcert": "/path/to/ca-cert.pem"
     }
   }
   ```

3. Verify certificate chain is complete

### Performance Issues

#### Slow Connections

**Solutions:**
1. Increase connection pool size in PostgreSQL:
   ```sql
   SHOW max_connections;
   -- Default: 100
   -- Increase if needed: ALTER SYSTEM SET max_connections = 200;
   ```

2. Add connection pooling (PgBouncer)

3. Use connection pooling in Jet Admin (coming soon)

4. Optimize network latency

---

## Examples

### Example 1: Local Development

```json
{
  "connectionOption": "connectionDetails",
  "connectionDetails": {
    "connectionName": "Local-Dev-Postgres",
    "host": "localhost",
    "port": 5432,
    "database": "myapp_dev",
    "user": "postgres",
    "password": "password",
    "sslMode": "disable"
  }
}
```

### Example 2: Heroku Production

```json
{
  "connectionOption": "connectionString",
  "connectionString": "postgresql://username:password@ec2-54-123-45-67.compute-1.amazonaws.com:5432/dbname?sslmode=require"
}
```

### Example 3: AWS RDS with SSL

```json
{
  "connectionOption": "connectionDetails",
  "connectionDetails": {
    "connectionName": "AWS-RDS-Production",
    "host": "mydb.123456789012.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "database": "production",
    "user": "jetadmin",
    "password": "secure-password-here",
    "sslMode": "verify-full",
    "additionalOptions": {
      "connectTimeout": 15,
      "applicationName": "JetAdmin-Production"
    }
  }
}
```

### Example 4: Supabase

```json
{
  "connectionOption": "connectionString",
  "connectionString": "postgresql://postgres:password@dbabcdefghijklmnop.supabase.co:5432/postgres?sslmode=require&application_name=JetAdmin"
}
```

### Example 5: Multiple Schemas

```json
{
  "connectionOption": "connectionDetails",
  "connectionDetails": {
    "connectionName": "Analytics-DB",
    "host": "analytics.internal",
    "port": 5432,
    "database": "analytics_prod",
    "user": "analyst",
    "password": "secure-pass",
    "sslMode": "require",
    "additionalOptions": {
      "options": "-c search_path=analytics,public"
    }
  }
}
```

---

## Next Steps

- [**Create Data Queries**](../data-query/overview) - Build queries on this datasource
- [**REST API Datasource**](./rest-api) - Connect to REST APIs
- [**Workflow Integration**](../workflow/overview) - Use in workflows
- [**Troubleshooting**](../../troubleshooting/troubleshooting) - Common issues

---

<div align="center">

### Need Help?

[Troubleshooting Guide](../../troubleshooting/troubleshooting) · [API Reference](../../api-reference/index) · [Community Support](#)

</div>
