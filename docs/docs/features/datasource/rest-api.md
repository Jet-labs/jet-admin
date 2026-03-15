---
id: datasource-rest-api
title: REST API Datasource - Complete Guide
sidebar_label: REST API
sidebar_position: 3
description: Complete guide to configuring REST API datasource in Jet Admin. Authentication, headers, parameters, and every option explained.
---

# REST API Datasource - Complete Guide

<div align="center">

### 🔌 Connect REST APIs

**HTTP Methods · Authentication · Headers · Query Params · Request Body**

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [General Configuration](#general-configuration)
- [Authentication](#authentication)
- [Headers Configuration](#headers-configuration)
- [Query Parameters](#query-parameters)
- [Request Body](#request-body)
- [Advanced Options](#advanced-options)
- [Testing Connection](#testing-connection)
- [Examples](#examples)

---

## Overview

Jet Admin's **REST API connector** enables you to integrate with any RESTful web service:

- ✅ **All HTTP Methods** - GET, POST, PUT, DELETE, PATCH
- ✅ **Multiple Auth Types** - None, Basic, Bearer, OAuth2
- ✅ **Custom Headers** - Add any HTTP header
- ✅ **Query Parameters** - Dynamic URL parameters
- ✅ **Request Body** - JSON, XML, or plain text
- ✅ **SSL/TLS** - Secure HTTPS connections
- ✅ **Timeout Control** - Configurable request timeouts

**Use Cases:**
- Payment gateways (Stripe, PayPal)
- Communication services (Twilio, SendGrid)
- CRM systems (Salesforce, HubSpot)
- Custom internal APIs
- Third-party data services

---

## General Configuration

### Required Fields

| Field | Type | Required | Default | Options | Description |
|-------|------|----------|---------|---------|-------------|
| **Base URL** | String | ✅ Yes | - | Valid URL | Root URL of the REST API |
| **Method** | String | ✅ Yes | GET | GET, POST, PUT, DELETE, PATCH | HTTP method for requests |

### Optional Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| **Timeout** | Integer | ❌ No | 30 | Min: 1 | Request timeout in seconds |
| **Content Type** | String | ❌ No | application/json | application/json, application/xml, text/plain | Default Content-Type header |

### Base URL

**Purpose:** The root endpoint of the REST API.

**Format:** `https://domain.com` or `https://domain.com/api/v1`

**Examples:**
```
✅ https://api.stripe.com/v1
✅ https://api.twilio.com/2010-04-01
✅ https://api.example.com
✅ https://hooks.slack.com/services
❌ api.example.com (missing protocol)
❌ http:// (use https for production)
```

**Best Practices:**
- Always use HTTPS in production
- Include version path if API is versioned
- Don't include trailing slash (unless required)
- Keep environment-specific URLs separate

### HTTP Method

**Purpose:** The HTTP verb for API requests.

**Available Methods:**

| Method | Use Case | Has Body | Idempotent |
|--------|----------|----------|------------|
| **GET** | Retrieve resources | ❌ No | ✅ Yes |
| **POST** | Create resources | ✅ Yes | ❌ No |
| **PUT** | Update/replace resources | ✅ Yes | ✅ Yes |
| **PATCH** | Partial update | ✅ Yes | ❌ No |
| **DELETE** | Delete resources | ❌ No | ✅ Yes |

**When to Use Each:**

**GET** - Fetch data without side effects
```
GET /users/123
GET /orders?status=pending
```

**POST** - Create new resources
```
POST /users
POST /orders
```

**PUT** - Replace entire resource
```
PUT /users/123
```

**PATCH** - Partial update
```
PATCH /users/123
```

**DELETE** - Remove resources
```
DELETE /users/123
```

### Timeout

**Purpose:** Maximum time to wait for API response.

**Type:** Integer (seconds)

**Default:** `30` seconds

**Recommended Values:**
- Fast APIs: `10` seconds
- Standard APIs: `30` seconds
- Slow external APIs: `60` seconds
- File uploads: `120` seconds

**When to Adjust:**
- Increase for slow external services
- Increase for large file transfers
- Decrease for real-time applications

### Content Type

**Purpose:** Default Content-Type header for requests.

**Options:**
- `application/json` (Default)
- `application/xml`
- `text/plain`

**Override Per Request:**
You can override this in the Headers section for specific requests.

---

## Authentication

Jet Admin supports **4 authentication types** for REST APIs:

### 1. No Authentication (none)

**Use Case:** Public APIs that don't require authentication

**Configuration:**
```json
{
  "authType": "none"
}
```

**Examples:**
- Public data APIs
- Webhooks (incoming)
- Open government data

### 2. Basic Authentication (basic)

**Use Case:** APIs using HTTP Basic Auth

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Username** | String | ✅ Yes | API username or key |
| **Password** | String | ✅ Yes | API password or secret |

**Configuration:**
```json
{
  "authType": "basic",
  "username": "api_key_here",
  "password": "api_secret_here"
}
```

**How It Works:**
- Credentials are base64 encoded
- Sent in `Authorization: Basic <encoded>` header
- Automatically handled by Jet Admin

**Examples:**

**SendGrid:**
```json
{
  "authType": "basic",
  "username": "apikey",
  "password": "SG.xxxxxxxxxxxxxxxxxx"
}
```

**Custom API:**
```json
{
  "authType": "basic",
  "username": "myuser",
  "password": "mypassword"
}
```

### 3. Bearer Token (bearer)

**Use Case:** APIs using token-based authentication

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Bearer Token** | String | ✅ Yes | JWT, API token, or access token |

**Configuration:**
```json
{
  "authType": "bearer",
  "bearerToken": "your-token-here"
}
```

**How It Works:**
- Token sent in `Authorization: Bearer <token>` header
- Automatically handled by Jet Admin

**Examples:**

**Stripe:**
```json
{
  "authType": "bearer",
  "bearerToken": "sk_test_xxxxxxxxxxxxxxxxxx"
}
```

**GitHub API:**
```json
{
  "authType": "bearer",
  "bearerToken": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Custom JWT:**
```json
{
  "authType": "bearer",
  "bearerToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. OAuth2 (oauth2)

**Use Case:** APIs requiring OAuth2 authentication flow

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Client ID** | String | ✅ Yes | OAuth2 client identifier |
| **Client Secret** | String | ✅ Yes | OAuth2 client secret |
| **Token URL** | String | ✅ Yes | OAuth2 token endpoint URL |

**Configuration:**
```json
{
  "authType": "oauth2",
  "oauth2": {
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "tokenUrl": "https://auth.example.com/oauth/token"
  }
}
```

**How It Works:**
1. Jet Admin requests access token from token URL
2. Token is cached for subsequent requests
3. Token automatically refreshed when expired
4. Access token sent in `Authorization: Bearer <token>` header

**Examples:**

**Google APIs:**
```json
{
  "authType": "oauth2",
  "oauth2": {
    "clientId": "123456789-abcdefg.apps.googleusercontent.com",
    "clientSecret": "GOCSPX-xxxxxxxxxxxxxxxxx",
    "tokenUrl": "https://oauth2.googleapis.com/token"
  }
}
```

**Microsoft Graph:**
```json
{
  "authType": "oauth2",
  "oauth2": {
    "clientId": "your-app-id",
    "clientSecret": "your-app-secret",
    "tokenUrl": "https://login.microsoftonline.com/common/oauth2/v2.0/token"
  }
}
```

**Custom OAuth2:**
```json
{
  "authType": "oauth2",
  "oauth2": {
    "clientId": "client-123",
    "clientSecret": "secret-456",
    "tokenUrl": "https://api.example.com/oauth/token"
  }
}
```

---

## Headers Configuration

### Purpose

Add custom HTTP headers to all requests made to the REST API.

### Header Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Key** | String | ✅ Yes | Header name |
| **Value** | String | ✅ Yes | Header value |

### Common Headers

| Header | Value | Use Case |
|--------|-------|----------|
| `Accept` | `application/json` | Specify response format |
| `Content-Type` | `application/json` | Specify request format |
| `X-API-Key` | `your-api-key` | Custom API key header |
| `X-Request-ID` | `unique-id` | Request tracking |
| `User-Agent` | `JetAdmin/1.0` | Custom user agent |

### Adding Headers

**Example 1: Custom API Key**
```json
{
  "headers": [
    {
      "key": "X-API-Key",
      "value": "your-api-key-here"
    }
  ]
}
```

**Example 2: Multiple Headers**
```json
{
  "headers": [
    {
      "key": "Accept",
      "value": "application/json"
    },
    {
      "key": "X-API-Key",
      "value": "secret-key"
    },
    {
      "key": "X-Request-ID",
      "value": "req-123456"
    }
  ]
}
```

**Example 3: Override Content-Type**
```json
{
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/xml"
    }
  ]
}
```

### Dynamic Headers with Variables

Use Jet Admin variables in header values:

```
X-User-ID: {{ctx.input.userId}}
X-Tenant-ID: {{ctx.tenant.id}}
Authorization: Bearer {{ctx.auth.token}}
```

---

## Query Parameters

### Purpose

Add URL query parameters to API requests.

### Parameter Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Key** | String | ✅ Yes | Parameter name |
| **Value** | String | ✅ Yes | Parameter value |

### Adding Query Parameters

**Example 1: Simple Parameters**
```json
{
  "queryParams": [
    {
      "key": "status",
      "value": "active"
    },
    {
      "key": "limit",
      "value": "100"
    }
  ]
}
```

**Result:**
```
GET /users?status=active&limit=100
```

**Example 2: Array Parameters**
```json
{
  "queryParams": [
    {
      "key": "ids",
      "value": "1,2,3"
    }
  ]
}
```

**Result:**
```
GET /users?ids=1,2,3
```

**Example 3: Dynamic Parameters**
```json
{
  "queryParams": [
    {
      "key": "userId",
      "value": "{{ctx.input.userId}}"
    },
    {
      "key": "date",
      "value": "{{ctx.input.date}}"
    }
  ]
}
```

### Common Query Parameters

| Parameter | Example | Use Case |
|-----------|---------|----------|
| `limit` | `?limit=100` | Pagination - max results |
| `offset` | `?offset=20` | Pagination - skip results |
| `page` | `?page=2` | Page number |
| `sort` | `?sort=created_at` | Sort field |
| `order` | `?order=desc` | Sort direction |
| `filter` | `?filter=status:active` | Filter criteria |
| `search` | `?search=john` | Search query |
| `fields` | `?fields=id,name,email` | Field selection |

---

## Request Body

### Purpose

Send data in the request body for POST, PUT, and PATCH requests.

### When to Use

| Method | Body Required | Typical Use |
|--------|---------------|-------------|
| **POST** | ✅ Usually | Create resource |
| **PUT** | ✅ Yes | Replace resource |
| **PATCH** | ✅ Yes | Update resource |
| **GET** | ❌ No | Retrieve data |
| **DELETE** | ❌ No | Delete resource |

### Body Format

**Type:** String (JSON, XML, or plain text)

**Default Content-Type:** `application/json`

### JSON Body Examples

**Example 1: Create User**
```json
{
  "body": "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"role\":\"user\"}"
}
```

**Formatted:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

**Example 2: Update Order**
```json
{
  "body": "{\"status\":\"shipped\",\"trackingNumber\":\"1Z999AA10123456784\"}"
}
```

**Example 3: Complex Nested Object**
```json
{
  "body": "{\"user\":{\"name\":\"John\",\"address\":{\"city\":\"NYC\",\"zip\":\"10001\"}},\"sendEmail\":true}"
}
```

### Using Variables in Body

**Example 1: Input Parameters**
```json
{
  "body": "{\"userId\":\"{{ctx.input.userId}}\",\"action\":\"{{ctx.input.action}}\"}"
}
```

**Example 2: Previous Node Output**
```json
{
  "body": "{\"orderId\":\"{{ctx.fetchOrder.result.id}}\",\"status\":\"processed\"}"
}
```

**Example 3: Mixed Variables**
```json
{
  "body": "{\"tenantId\":\"{{ctx.tenant.id}}\",\"createdBy\":\"{{ctx.user.email}}\",\"data\":{{ctx.transform.result}}}"
}
```

### XML Body Example

```json
{
  "contentType": "application/xml",
  "body": "<user><name>John Doe</name><email>john@example.com</email></user>"
}
```

### Plain Text Example

```json
{
  "contentType": "text/plain",
  "body": "Simple text message"
}
```

---

## Advanced Options

### Follow Redirects

**Purpose:** Automatically follow HTTP 3xx redirects.

**Type:** Boolean

**Default:** `true`

**When to Disable:**
- Security requirements
- Debugging redirect issues
- When redirect handling is custom

**Configuration:**
```json
{
  "followRedirects": false
}
```

### SSL Verification

**Purpose:** Verify SSL certificates for HTTPS connections.

**Type:** Boolean

**Default:** `true`

**When to Disable:**
- Development with self-signed certificates
- Testing environments
- Internal APIs without proper SSL

**⚠️ Warning:** Disabling SSL verification reduces security. Only use in development!

**Configuration:**
```json
{
  "sslVerify": false
}
```

---

## Testing Connection

### How to Test

1. **Configure** REST API datasource
2. **Set** method to GET (for testing)
3. **Add** any required authentication
4. **Click** "Test Connection"
5. **Review** response

### Test Results

#### ✅ Success

```
┌─────────────────────────────────────────┐
│  ✓ Connection Successful!               │
│                                         │
│  URL: https://api.example.com/health    │
│  Method: GET                            │
│  Status: 200 OK                         │
│  Response Time: 125ms                   │
│                                         │
│  Response:                              │
│  {"status": "healthy", "version": "1.0"}│
└─────────────────────────────────────────┘
```

#### ❌ Failure

```
┌─────────────────────────────────────────┐
│  ✗ Connection Failed                    │
│                                         │
│  URL: https://api.example.com/users     │
│  Method: GET                            │
│  Status: 401 Unauthorized               │
│                                         │
│  Error: Invalid API key                 │
│                                         │
│  Troubleshooting:                       │
│  • Verify authentication credentials    │
│  • Check API key is valid               │
│  • Ensure API endpoint is correct       │
└─────────────────────────────────────────┘
```

### Common Test Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| `400 Bad Request` | 400 | Invalid request format | Check body, headers, parameters |
| `401 Unauthorized` | 401 | Authentication failed | Verify API key/token |
| `403 Forbidden` | 403 | Insufficient permissions | Check API permissions |
| `404 Not Found` | 404 | Invalid URL | Verify base URL and endpoint |
| `429 Too Many Requests` | 429 | Rate limit exceeded | Wait and retry, check rate limits |
| `500 Internal Server Error` | 500 | API server error | Contact API provider |
| `502 Bad Gateway` | 502 | API gateway error | Retry later |
| `503 Service Unavailable` | 503 | API down | Check API status page |

---

## Examples

### Example 1: Stripe API (Bearer Token)

```json
{
  "baseUrl": "https://api.stripe.com/v1",
  "method": "GET",
  "timeout": 30,
  "authType": "bearer",
  "bearerToken": "sk_test_xxxxxxxxxxxxxxxxxx",
  "headers": [
    {
      "key": "Stripe-Version",
      "value": "2022-11-15"
    }
  ],
  "queryParams": [
    {
      "key": "limit",
      "value": "10"
    }
  ],
  "contentType": "application/json",
  "followRedirects": true,
  "sslVerify": true
}
```

**Usage in Query:**
```
GET /charges?limit=10
```

### Example 2: Twilio API (Basic Auth)

```json
{
  "baseUrl": "https://api.twilio.com/2010-04-01",
  "method": "POST",
  "timeout": 30,
  "authType": "basic",
  "username": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "password": "your_auth_token",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/x-www-form-urlencoded"
    }
  ],
  "body": "To=%2B1234567890&From=%2B0987654321&Body=Hello from Jet Admin!",
  "contentType": "application/x-www-form-urlencoded",
  "followRedirects": true,
  "sslVerify": true
}
```

**Usage:**
```
POST /Accounts/ACxxxx/Messages.json
Body: To=+1234567890&From=+0987654321&Body=Hello from Jet Admin!
```

### Example 3: Custom Internal API (API Key Header)

```json
{
  "baseUrl": "https://api.internal.company.com/v2",
  "method": "GET",
  "timeout": 15,
  "authType": "none",
  "headers": [
    {
      "key": "X-API-Key",
      "value": "your-api-key-here"
    },
    {
      "key": "X-Tenant-ID",
      "value": "{{ctx.tenant.id}}"
    }
  ],
  "queryParams": [
    {
      "key": "status",
      "value": "active"
    }
  ],
  "contentType": "application/json",
  "followRedirects": true,
  "sslVerify": true
}
```

### Example 4: Slack Webhook (No Auth, POST)

```json
{
  "baseUrl": "https://hooks.slack.com/services",
  "method": "POST",
  "timeout": 10,
  "authType": "none",
  "headers": [
    {
      "key": "Content-Type",
      "value": "application/json"
    }
  ],
  "body": "{\"text\":\"New order received!\",\"channel\":\"#orders\",\"username\":\"Order Bot\"}",
  "contentType": "application/json",
  "followRedirects": true,
  "sslVerify": true
}
```

### Example 5: Google Sheets API (OAuth2)

```json
{
  "baseUrl": "https://sheets.googleapis.com/v4/spreadsheets",
  "method": "GET",
  "timeout": 30,
  "authType": "oauth2",
  "oauth2": {
    "clientId": "123456789-abcdefg.apps.googleusercontent.com",
    "clientSecret": "GOCSPX-xxxxxxxxxxxxxxxxx",
    "tokenUrl": "https://oauth2.googleapis.com/token"
  },
  "headers": [],
  "queryParams": [
    {
      "key": "majorDimension",
      "value": "ROWS"
    }
  ],
  "contentType": "application/json",
  "followRedirects": true,
  "sslVerify": true
}
```

### Example 6: GitHub API (Bearer Token with Variables)

```json
{
  "baseUrl": "https://api.github.com",
  "method": "GET",
  "timeout": 30,
  "authType": "bearer",
  "bearerToken": "{{ctx.input.githubToken}}",
  "headers": [
    {
      "key": "Accept",
      "value": "application/vnd.github.v3+json"
    }
  ],
  "queryParams": [
    {
      "key": "per_page",
      "value": "100"
    }
  ],
  "contentType": "application/json",
  "followRedirects": true,
  "sslVerify": true
}
```

**Usage:**
```
GET /repos/Jet-labs/jet-admin/issues?per_page=100
```

---

## Next Steps

- [**PostgreSQL Datasource**](./postgresql) - Connect to PostgreSQL
- [**Create Data Queries**](../data-query/overview) - Execute API calls
- [**Workflow Integration**](../workflow/overview) - Use in workflows
- [**Webhooks**](../webhooks/overview) - Receive webhook data

---

<div align="center">

### Need Help?

[Troubleshooting Guide](../../troubleshooting/troubleshooting) · [API Reference](../../api-reference/index) · [Community Support](#)

</div>
