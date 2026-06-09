---
id: api-endpoints
title: API Endpoints Reference
sidebar_label: API Endpoints
sidebar_position: 2
description: Comprehensive reference for Jet Admin's REST API routes, including schemas and auth requirements.
---

# API Endpoints Reference

Jet Admin exposes a comprehensive RESTful API for managing resources. The frontend SPA consumes these exact same endpoints.

*Note: All endpoints documented below are prefixed with `/api/v1/`.*

---

## Authentication (`/auth`)
Handles user identity and session management.

### `GET /auth/`
- **Description:** Returns the currently authenticated user's profile and permissions.
- **Auth:** Requires valid Session/JWT.
- **Side Effects:** Creates an audit log entry.

### `GET /auth/config/:tenantID`
- **Description:** Retrieves user-specific configuration for a given tenant.
- **Auth:** Requires valid Session/JWT.
- **Parameters:** `tenantID` (UUID in URL).

### `POST /auth/config/:tenantID`
- **Description:** Updates the user-specific configuration.
- **Auth:** Requires valid Session/JWT.
- **Parameters:** `tenantID` (UUID in URL).
- **Side Effects:** Updates DB record; creates an audit log entry.

---

## App Pages (`/tenants/:tenantID/appPages`)
Manages the individual views and widget layouts within an App.

### `GET /tenants/:tenantID/appPages`
- **Description:** Lists all pages for a specific tenant.
- **Auth:** Requires `tenant:appPage:list` permission.

### `POST /tenants/:tenantID/appPages`
- **Description:** Creates a new page.
- **Auth:** Requires `tenant:appPage:create` permission.
- **Body Schema:**
  - `appPageTitle` (String, required)
  - `appPageDescription` (String, optional)
  - `appPageConfig` (Object, optional)

### `GET /tenants/:tenantID/appPages/:appPageID`
- **Description:** Retrieves the complete page definition, including the widget layout.
- **Auth:** Requires `tenant:appPage:read` permission.

### `PATCH /tenants/:tenantID/appPages/:appPageID`
- **Description:** Updates the page layout or configuration.
- **Auth:** Requires `tenant:appPage:update` permission.
- **Body Schema:** (Partial updates allowed)
  - `appPageTitle` (String)
  - `appPageConfig` (Object)

### `POST /tenants/:tenantID/appPages/:appPageID/clone`
- **Description:** Clones an existing page.
- **Auth:** Requires `tenant:appPage:clone` permission.

### `DELETE /tenants/:tenantID/appPages/:appPageID`
- **Description:** Deletes a page permanently.
- **Auth:** Requires `tenant:appPage:delete` permission.
- **Side Effects:** Cascading deletion of related layout records.

---

## Data Queries (`/tenants/:tenantID/queries`)
Manages the definitions and execution of data operations.

### `GET /tenants/:tenantID/queries`
- **Description:** Lists all saved queries.
- **Auth:** Requires `tenant:query:list` permission.

### `POST /tenants/:tenantID/queries`
- **Description:** Creates a new query definition.
- **Auth:** Requires `tenant:query:create` permission.
- **Body Schema:**
  - `datasourceID` (UUID, required)
  - `queryName` (String, required)
  - `queryConfig` (Object, required)

### `GET /tenants/:tenantID/queries/:dataQueryID`
- **Description:** Retrieves a specific query definition.
- **Auth:** Requires `tenant:query:read` permission.

### `PATCH /tenants/:tenantID/queries/:dataQueryID`
- **Description:** Updates a query definition.
- **Auth:** Requires `tenant:query:update` permission.

### `POST /tenants/:tenantID/queries/:dataQueryID/run`
- **Description:** **(Critical Execution Endpoint)** Executes a saved query against its target datasource.
- **Auth:** Requires `tenant:query:read` permission.
- **Body Schema:**
  - `inputs` (Object, optional) - Dynamic parameters injected into `{{bindings}}`.
- **Side Effects:** The backend connects to the external database/API, executes the command, runs any transformers, and returns the result.

### `PATCH /tenants/:tenantID/queries/queryTest`
- **Description:** Executes a query payload *without* saving it to the database. Useful for the builder's preview panel.
- **Auth:** Requires `tenant:query:test` permission.

---

## Workflows (`/tenants/:tenantID/workflow`)
Manages background processes and DAG definitions.

### `GET /tenants/:tenantID/workflow`
- **Description:** Lists workflow definitions.
- **Auth:** Requires `tenant:workflow:list` permission.

### `POST /tenants/:tenantID/workflow`
- **Description:** Creates a new workflow definition.
- **Auth:** Requires `tenant:workflow:create` permission.
- **Body Schema:**
  - `title` (String, required)
  - `workflowOptions` (Object, optional)

### `GET /tenants/:tenantID/workflow/:workflowID`
- **Description:** Retrieves a specific workflow definition, including nodes and edges.
- **Auth:** Requires `tenant:workflow:read` permission.

### `PATCH /tenants/:tenantID/workflow/:workflowID`
- **Description:** Updates the workflow DAG definition.
- **Auth:** Requires `tenant:workflow:update` permission.

### `POST /tenants/:tenantID/workflow/:workflowID/execute`
- **Description:** Triggers a saved workflow to run.
- **Auth:** Requires `tenant:workflow:execute` permission.
- **Side Effects:** Creates a `tblWorkflowInstances` record, enqueues pg-boss jobs, and returns an `instanceID` immediately (asynchronous execution).

### `POST /tenants/:tenantID/workflow/test`
- **Description:** Test-runs a workflow payload in memory without saving the definition.
- **Auth:** Requires `tenant:workflow:execute` permission.
- **Body Schema:**
  - `nodes` (Array, required)
  - `edges` (Array, required)
  - `inputValues` (Object, optional)

### `GET /tenants/:tenantID/workflow/instances/:instanceID`
- **Description:** Retrieves the real-time status and complete XCom log payload for a specific execution instance.
- **Auth:** Requires `tenant:workflow:read` permission.
- **Response:** Includes `status`, `createdAt`, and `logs` array.

---

## Datasources (`/tenants/:tenantID/datasources`)
Manages integration connections. Credentials are encrypted upon save.

- `GET /tenants/:tenantID/datasources`: Lists datasources (passwords omitted).
- `POST /tenants/:tenantID/datasources`: Creates a new connection.
- `PATCH /tenants/:tenantID/datasources/:id`: Updates config/credentials.
- `DELETE /tenants/:tenantID/datasources/:id`: Deletes a datasource.
- `POST /tenants/:tenantID/datasources/test`: Tests connection reachability without saving.

## Listeners (`/tenants/:tenantID/listener`)
Manages incoming data streams and webhook ingestions.

- `GET /tenants/:tenantID/listener`: Lists active listeners.
- `POST /tenants/:tenantID/listener`: Creates a new listener definition.
- `PATCH /tenants/:tenantID/listener/:id`: Updates listener configuration.
- `DELETE /tenants/:tenantID/listener/:id`: Deletes a listener.

## Users & Roles (`/tenants/:tenantID/userManagement`, `/tenants/:tenantID/tenantRole`)
Manages RBAC and Tenant membership.

- `GET /tenants/:tenantID/userManagement/users`: Lists users.
- `PUT /tenants/:tenantID/userManagement/users/:id/role`: Updates user's assigned role.
- `GET /tenants/:tenantID/tenantRole`: Lists available roles.
- `POST /tenants/:tenantID/tenantRole`: Creates a custom role definition.

## System & Audit (`/system`, `/tenants/:tenantID/audit`)
Manages global settings and logs.

- `GET /system/health`: Basic health check endpoint.
- `GET /tenants/:tenantID/audit`: Retrieves paginated audit logs. Payloads containing passwords or tokens are automatically masked as `[FILTERED]` by middleware.
