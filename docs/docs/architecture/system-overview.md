---
id: system-overview
title: System Architecture Overview
sidebar_label: System Overview
sidebar_position: 1
description: High-level system architecture, decoupled design, and request lifecycles.
---

# System Architecture Overview

Jet Admin follows a modern, layered, decoupled architecture designed to cleanly separate presentation logic, orchestration, and data persistence.

## High-Level System Diagram

Below is the high-level flow of data and requests through the Jet Admin platform.

```mermaid
flowchart TD
    subgraph Client [Browser Client (React SPA)]
        UI[Page & Widget Canvas]
        State[Zustand Local State]
        QueryCache[TanStack Query Cache]
        SocketClient[Socket.IO Client]
        UI --> State
        State --> QueryCache
    end

    subgraph Server [Node.js Express API]
        Router[API Routers & Controllers]
        QueryEngine[Query Engine]
        WorkflowOrchestrator[Workflow Orchestrator]
        IntegrationFabric[Integration Fabric / Drivers]
        SocketServer[Socket.IO Server]
        JobQueue[pg-boss Queue]
    end

    subgraph Database [Operational DB]
        PostgreSQL[(PostgreSQL / Prisma)]
    end

    subgraph External [External Systems]
        ExtDB[(External Databases)]
        ExtAPI[REST / GraphQL APIs]
    end

    %% HTTP Paths
    QueryCache -- "HTTP GET/POST" --> Router
    Router -- "Resolves Queries" --> QueryEngine
    QueryEngine -- "Uses" --> IntegrationFabric
    IntegrationFabric -- "Executes against" --> ExtDB
    IntegrationFabric -- "Fetches from" --> ExtAPI

    %% Persistence
    Router -- "Reads/Writes Meta" --> PostgreSQL
    QueryEngine -- "Fetches Config" --> PostgreSQL

    %% Async & WebSockets
    SocketClient <.. "Real-time updates" ..> SocketServer
    Router -- "Enqueues Jobs" --> JobQueue
    JobQueue -- "Processed by" --> WorkflowOrchestrator
    WorkflowOrchestrator -- "Broadcasts progress" --> SocketServer
```

## Layered Architecture

Jet Admin is structured into distinct layers to separate concerns:

1. **Presentation Layer (Frontend):** React components, drag-and-drop Page Builder, and Widget configurations. This layer captures user intent and renders data.
2. **State Layer (Frontend):**
   - *Client State:* Managed by **Zustand**, tracking widget property changes, active selections, and `{{binding}}` evaluation context.
   - *Server State:* Managed by **TanStack Query**, caching API responses, handling loading states, and deduplicating network requests.
3. **Server Layer (Backend):** Node.js/Express application. Contains business logic modules (Auth, App/Page management), the **Workflow Orchestrator**, and the **Query Engine**.
4. **Persistence Layer (Backend):** The core operational **PostgreSQL** database accessed via **Prisma ORM**. Stores metadata—users, RBAC roles, tenant isolation borders, saved queries, workflow definitions, and page layouts. It does *not* store the external data you query.
5. **External Integration Layer (Backend):** The **Integration Fabric**. A collection of datasource drivers (e.g., PostgreSQL driver, Stripe REST driver) that establish connections, pool resources, and execute operations securely on behalf of the user.

## Decoupled Design

The frontend and backend are completely decoupled. The frontend SPA does not know how to connect to a MySQL database or how to execute a Stripe API call. Instead:

- The frontend sends a structured request to the backend: *"Execute Query ID 123 with parameter `limit=10`."*
- The backend checks permissions (RBAC), resolves the datasource credentials for Query 123 from the operational database, evaluates any backend `{{bindings}}`, routes the operation to the correct Integration Fabric driver, executes it, and returns the raw JSON result.
- The frontend receives the result, stores it in TanStack Query, updates the evaluation context, and reactively re-renders any widgets bound to that query's data.

## Request Lifecycle: Widget to Data

Understanding the path of a user interaction helps clarify how Jet Admin works. Here is the chronological sequence when a user clicks a button to execute a query:

1. **User Interaction:** The user clicks a Button widget. The button's `onClick` event is triggered.
2. **Context Evaluation:** The frontend evaluates the action configured for `onClick`. It resolves any `{{bindings}}` using the current Zustand context (e.g., pulling a selected row ID from a Table widget).
3. **HTTP Dispatch:** The frontend dispatches an HTTP POST request to the backend `/api/v1/data-query/execute` endpoint.
4. **Authentication & RBAC:** The Express router authenticates the JWT and verifies the user has permissions to execute this specific query in this workspace.
5. **Query Resolution:** The Query Engine retrieves the saved query definition and its associated datasource configuration from the operational PostgreSQL database.
6. **Execution:** The Integration Fabric instantiates the specific driver (e.g., PostgreSQL), injects the sanitized parameters safely (using parameterized queries to prevent SQL injection), and executes the query against the external system.
7. **Result Return:** The raw result is returned to the Express server, which sends it back to the client as a JSON HTTP response.
8. **Cache & Reactivity:** TanStack Query caches the result under a specific key. The Zustand state slice for that query updates its `.data` and `.isLoading` flags.
9. **Re-render:** Any widgets (like a Table or Chart) whose properties are bound to `{{queries.myQuery.data}}` reactively re-render to display the new information.

## Real-Time Architecture

Jet Admin relies heavily on **Socket.IO** to provide a real-time, collaborative experience:

- **Namespaces & Rooms:** Clients connect to specific socket rooms based on their Tenant ID and current App/Page.
- **Workflow Progress:** Because workflows are executed asynchronously by `pg-boss` background workers, HTTP requests cannot wait for completion. Instead, the Workflow Orchestrator emits progress events via WebSockets. The frontend listens to these events to show real-time progress bars or notifications.
- **Data Push:** For supported datasources (like SSE or incoming Webhooks via the Listener module), data is pushed directly to the client over the active WebSocket connection, instantly updating bound widgets without polling.

## Multi-Tenancy Isolation boundaries

Jet Admin supports multi-tenancy natively. All data in the operational database (apps, pages, queries, datasources) is strictly partitioned by a `tenantID`.

- **Tenant:** The highest level of isolation. Workspaces belong to a tenant.
- **Enforcement:** Every API route utilizes middleware to ensure the authenticated user belongs to the requested `tenantID`. Prisma queries implicitly filter by `tenantID` to prevent cross-tenant data leakage.
