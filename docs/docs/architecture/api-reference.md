---
sidebar_position: 4
title: API Reference
description: Complete REST API endpoints reference for Jet Admin
---

# API Reference

This document provides a comprehensive reference for all REST API endpoints in Jet Admin.

## Base URL

All API V1 routes are prefixed with `/api/v1`.

```
Production: https://your-domain.com/api/v1
Development: http://localhost:4000/api/v1
```

## Authentication

Most endpoints require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

Additionally, tenant-scoped endpoints require a tenant context header:

```http
x-tenant-id: <TENANT_UUID>
```

---

## Auth Module

Base path: `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:--------------|
| `GET` | `/` | Get current user info | ✅ |
| `GET` | `/config/:tenantID` | Get user configuration for a tenant | ✅ |
| `POST` | `/config/:tenantID` | Update user configuration | ✅ |

---

## Tenant Module

Base path: `/api/v1/tenants`

| Method | Endpoint | Description | Permission |
|:-------|:---------|:------------|:-----------|
| `GET` | `/` | List all tenants for current user | Authenticated |
| `POST` | `/` | Create a new tenant | Authenticated |
| `GET` | `/:tenantID` | Get tenant details | `tenant:read` |
| `PATCH` | `/:tenantID` | Update tenant | `tenant:update` |

---

## Workflow Module

Base path: `/api/v1/tenants/:tenantID/workflows`

| Method | Endpoint | Description | Permission |
|:-------|:---------|:------------|:-----------|
| `GET` | `/` | List all workflows | `workflow:list` |
| `POST` | `/` | Create a new workflow | `workflow:create` |
| `GET` | `/:workflowID` | Get workflow details | `workflow:read` |
| `PATCH` | `/:workflowID` | Update workflow | `workflow:update` |
| `DELETE` | `/:workflowID` | Delete workflow | `workflow:delete` |
| `POST` | `/:workflowID/execute` | Execute workflow (async) | `workflow:execute` |
| `POST` | `/test` | Test run without saving | `workflow:execute` |
| `GET` | `/instances/:instanceID` | Get run status | `workflow:read` |
| `DELETE` | `/instances/:instanceID/stop` | Stop a running instance | `workflow:execute` |

---

## Datasource Module

Base path: `/api/v1/tenants/:tenantID/datasources`

| Method | Endpoint | Description | Permission |
|:-------|:---------|:------------|:-----------|
| `GET` | `/` | List all datasources | `datasource:list` |
| `POST` | `/` | Create a new datasource | `datasource:create` |
| `GET` | `/:datasourceID` | Get datasource details | `datasource:read` |
| `PATCH` | `/:datasourceID` | Update datasource | `datasource:update` |
| `DELETE` | `/:datasourceID` | Delete datasource | `datasource:delete` |
| `POST` | `/test` | Test connection (without saving) | `datasource:test` |
| `POST` | `/:datasourceID/clone` | Clone a datasource | `datasource:clone` |

---

## Data Query Module

Base path: `/api/v1/tenants/:tenantID/data-queries`

| Method | Endpoint | Description | Permission |
|:-------|:---------|:------------|:-----------|
| `GET` | `/` | List all data queries | `dataquery:list` |
| `POST` | `/` | Create a new query | `dataquery:create` |
| `GET` | `/:queryID` | Get query details | `dataquery:read` |
| `PATCH` | `/:queryID` | Update query | `dataquery:update` |
| `DELETE` | `/:queryID` | Delete query | `dataquery:delete` |
| `POST` | `/:queryID/execute` | Execute query | `dataquery:execute` |

---

## Widget Module

Base path: `/api/v1/tenants/:tenantID/widgets`

| Method | Endpoint | Description | Permission |
|:-------|:---------|:------------|:-----------|
| `GET` | `/` | List all widgets | `widget:list` |
| `POST` | `/` | Create a new widget | `widget:create` |
| `GET` | `/:widgetID` | Get widget details | `widget:read` |
| `PATCH` | `/:widgetID` | Update widget | `widget:update` |
| `DELETE` | `/:widgetID` | Delete widget | `widget:delete` |

---

## Dashboard Module

Base path: `/api/v1/tenants/:tenantID/dashboards`

| Method | Endpoint | Description | Permission |
|:-------|:---------|:------------|:-----------|
| `GET` | `/` | List all dashboards | `dashboard:list` |
| `POST` | `/` | Create a new dashboard | `dashboard:create` |
| `GET` | `/:dashboardID` | Get dashboard with widgets | `dashboard:read` |
| `PATCH` | `/:dashboardID` | Update dashboard layout | `dashboard:update` |
| `DELETE` | `/:dashboardID` | Delete dashboard | `dashboard:delete` |

---

## Error Responses

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|:-----|:------------|:------------|
| `PERMISSION_DENIED` | 403 | User lacks required permission |
| `INVALID_REQUEST` | 400 | Malformed request or validation error |
| `INVALID_TENANT` | 400 | Invalid or missing tenant context |
| `USER_AUTH_TOKEN_EXPIRED` | 401 | Firebase token has expired |
| `SERVER_ERROR` | 500 | Internal server error |
