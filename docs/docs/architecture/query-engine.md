---
id: query-engine
title: Query Engine
sidebar_label: Query Engine
sidebar_position: 5
description: How queries are modeled, executed, and cached.
---

# Query Engine

The Query Engine sits between the frontend Presentation Layer and the backend Integration Fabric. It is responsible for safely parameterizing queries, executing them, and handling post-processing transformations.

## Query Model

A **Query** is a saved operation in the operational database (`tblQueries`).

### Query Schema
A query record contains:
- `queryID`: Unique identifier.
- `datasourceID`: Reference to the Datasource this query executes against.
- `queryName`: A human-readable name (e.g., `getUsers`).
- `queryConfig`: A JSON blob containing the actual query payload (e.g., the SQL string or REST API parameters).
- `runOnPageLoad`: Boolean indicating if the query runs automatically when its parent page is opened.
- `transformer`: Optional JavaScript code to post-process the data before it is returned to the client.

### Parameterization and Bindings
Jet Admin queries rely on `{{bindings}}` to be dynamic.

For example, a SQL query might look like:
```sql
SELECT * FROM users WHERE status = {{inputs.status}} LIMIT 10;
```

**Security:** To prevent injection attacks, Jet Admin does *not* blindly concatenate strings.
When the Query Engine executes, it extracts the `{{inputs.status}}` expression, evaluates it against the provided context, and passes the value to the underlying database driver using **Prepared Statements** (e.g., `$1`).

### Transformer Functions
Sometimes the data returned by an API or Database is not in the shape required by a widget. Queries can include a **Transformer**, which is a snippet of JavaScript executed on the backend after the query completes but before the data is sent to the frontend.

```javascript
// Example Transformer
return data.map(row => ({
  fullName: `${row.firstName} ${row.lastName}`,
  isActive: row.status === 'active'
}));
```

## Query Execution Lifecycle

The execution of a query is a coordinated dance between the frontend and backend. Below is the chronological lifecycle:

1. **Trigger:** A query is triggered on the frontend (e.g., via page load or a widget `onClick` event).
2. **Context Gathering:** The frontend gathers all required parameters specified in the query's inputs, pulling values from the local Zustand state (e.g., the value of a Select widget).
3. **HTTP Dispatch:** The frontend sends a POST request to `/api/v1/data-query/execute` with the `queryID` and the resolved `inputs` object.
4. **Auth & RBAC:** The backend authenticates the user and verifies they have read access to the query and its datasource.
5. **Config Retrieval:** The Query Engine fetches the `queryConfig` from PostgreSQL.
6. **Backend Evaluation:** The Query Engine uses the `@jet-admin/expression-engine` to evaluate any `{{bindings}}` located within the `queryConfig`, substituting them with the values from the `inputs` object safely.
7. **Execution:** The sanitized query payload is passed to the Integration Fabric, which executes the request against the external system.
8. **Transformation:** If a transformer function is defined, the raw result is passed into an isolated JavaScript VM, transformed, and returned.
9. **Response:** The final JSON result is sent back to the frontend over HTTP.

## Caching & Invalidation

To ensure high performance and prevent unnecessary database load, Jet Admin relies heavily on client-side caching.

### TanStack Query
The frontend utilizes **TanStack Query** (formerly React Query) to manage query state.

- **Cache Keys:** Query results are cached using a composite key: `['query', queryID, stringifiedInputs]`. This ensures that changing a parameter (like paginating to page 2) results in a distinct cache entry, while returning to page 1 instantly loads the cached data.
- **Loading State:** TanStack Query automatically provides `.isLoading` and `.isFetching` booleans, which the Zustand store exposes to widgets (e.g., `{{queries.getUsers.isLoading}}` can be bound to a Button's "loading" state).

### Invalidation
Data becomes stale when a user performs a mutation (e.g., updating a user record). Jet Admin allows developers to configure "On Success" actions for mutation queries to invalidate cache keys.

When a query is invalidated:
1. TanStack Query marks the cached data as stale.
2. It immediately triggers a background refetch for any active queries using that key.
3. Once the fresh data arrives, Zustand state updates, and widgets re-render seamlessly.
