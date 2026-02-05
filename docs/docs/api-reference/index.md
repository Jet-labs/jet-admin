---
sidebar_position: 1
title: Introduction
description: Jet Admin API Documentation
slug: /api-reference
---

# Jet Admin API

Welcome to the **Jet Admin API** documentation. This API allows you to programmatically interact with your Jet Admin workspace, offering control over:

- **Tenants & Users**: Manage accounts, access, and roles.
- **Data**: Connect datasources, query databases, and manage schemas.
- **Workflows**: Execute and monitor automation workflows.
- **UI Components**: Configure widgets and dashboards.

## Getting Started

The API is organized around RESTful principles.

- **Base URL**: `http://localhost:3000/api/v1` (Development)
- **Response Format**: JSON

## API Specifications

Download the complete API specifications for use in your favorite API tools:

| Specification | Description | Download |
|---------------|-------------|----------|
| **OpenAPI 3.1** | Complete REST API specification | [openapi.yaml](/specs/openapi.yaml) |
| **AsyncAPI 2.6** | WebSocket events specification | [socket-events.yaml](/specs/socket-events.yaml) |

:::tip Import into API Tools
You can import these specifications into tools like **Postman**, **Insomnia**, **Swagger UI**, or **Stoplight** for interactive API exploration and testing.
:::

## Sections

### [Authentication](/docs/api-reference/authentication)
Learn how to authenticate your requests using Firebase Tokens or API Keys.

### [REST Endpoints](/docs/api-reference/category/jet-admin-api)
Explore the full list of available REST endpoints, grouped by module.

### [WebSocket API](/docs/api-reference/websocket)
Real-time API for AI chat, workflow streaming, and interactive widgets.

## Error Handling

The API uses standard HTTP status codes to indicate success or failure. Error responses typically follow this format:

\`\`\`json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The provided parameters are invalid."
  }
}
\`\`\`
