---
id: index
title: Datasource Module
sidebar_label: Datasource
description: Manages connections to external databases and APIs.
---

# Datasource Module

The **Datasource Module** (`apps/backend/modules/datasource`) handles the storage and validation of connection details for external systems (PostgreSQL, REST APIs, etc.).

## Architecture

Datasources are stored in the `tblDatasources` table. Key operations include:

- **Creation:** Storing connection strings/creds.
- **Testing:** Verifying connectivity before saving.
- **Usage:** Used by the `DataQuery` module to execute commands.

### `DATASOURCE_LOGIC_COMPONENTS`

The actual connection logic is decoupled into a shared package `@jet-admin/datasources-logic`. This pattern allows for easy addition of new datasource types.

```javascript
const connectionResult = await DATASOURCE_LOGIC_COMPONENTS[datasourceType]
  .testConnection({ datasourceOptions });
```

## API Reference

### `testDatasourceConnection`

**Endpoint:** `POST /api/datasources/:tenantID/test`

Tests if the provided credentials are valid without saving them.

### `createDatasource`

**Endpoint:** `POST /api/datasources/:tenantID`

Persists the datasource configuration.

| Field | Type | Description |
| :--- | :--- | :--- |
| `datasourceType` | String | e.g., `postgresql`, `restapi` |
| `datasourceOptions` | JSON | Connection details (host, port, user, etc.) |
| `datasourceTags` | Array | Metadata for organization |

## Security

*Documentation Note: Ensure to describe if credentials are encrypted at rest.*
Currently, `datasourceOptions` is stored as a JSON blob.
