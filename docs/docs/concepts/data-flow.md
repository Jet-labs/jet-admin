---
id: data-flow
title: Data Flow
sidebar_label: Data Flow
sidebar_position: 1
description: How requests, auth context, persistence, realtime updates, and workflow execution move through the system.
---

# Data Flow

Jet Admin moves data through three primary channels:

1. **HTTP request/response** for CRUD and administrative operations,
2. **Socket.IO events** for live execution and interactive features,
3. **internal asynchronous workflow jobs** for DAG-based workflow execution.

Understanding which channel is being used is the easiest way to understand the code path you need to inspect.

## Core system actors

- **Frontend SPA** — collects user input, reads route/tenant context, and calls backend APIs.
- **Auth middleware** — resolves user or API-key identity plus tenant authorization context.
- **Feature services** — perform business operations and persistence.
- **Prisma/PostgreSQL** — stores Jet Admin platform metadata and execution records.
- **Socket.IO** — delivers live events to subscribed clients.
- **Workflow runtime** — handles node dispatch, result ingestion, retries, and completion state.

## Synchronous request flow

Most product actions follow a standard request pipeline.

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth + permission middleware
    participant C as Controller
    participant S as Service
    participant P as Prisma/PostgreSQL

    U->>F: Trigger action in UI
    F->>A: HTTP request with tenant context + bearer token
    A->>A: Validate Firebase token or API key
    A->>C: Attach authContext and continue
    C->>S: Call service method with validated input
    S->>P: Read/write application state
    P-->>S: Persisted data
    S-->>C: Domain result
    C-->>F: JSON response
    F-->>U: Update UI / cache / notifications
```

### What usually travels in this path

- Firebase bearer token from the frontend,
- tenant identifier from the route,
- validated request payload,
- RBAC-derived authorization decision,
- persisted response data from Prisma-backed services.

## Realtime event flow

Some experiences need immediate updates instead of polling.

```mermaid
sequenceDiagram
    participant F as Frontend
    participant S as Socket client
    participant IO as Socket.IO server
    participant M as Socket controllers / services

    F->>S: User signs in
    S->>IO: Connect with Firebase token in handshake
    IO->>M: Authenticate socket
    M-->>S: Connection established
    F->>S: Join workflow or feature-specific room
    M-->>S: Push live updates
    S-->>F: UI reacts in real time
```

Current examples include workflow-run subscription, AI chat events, and widget-workflow bridge messages.

## Workflow execution flow

Workflow execution is the main asynchronous data path in the current system.

```mermaid
sequenceDiagram
    participant F as Frontend / API caller
    participant API as Workflow service
    participant DB as PostgreSQL
    participant O as Orchestrator
    participant Q as In-memory task/result queues
    participant W as Task worker
    participant IO as Socket.IO

    F->>API: Execute or test workflow
    API->>DB: Create / initialize workflow instance
    API->>Q: Enqueue start node job
    Q->>W: Deliver task job
    W->>W: Resolve node handler by nodeType
    W->>Q: Publish success/error result
    Q->>O: Deliver node result
    O->>DB: Merge node output into instance context
    O->>O: Resolve next nodes from graph
    O->>Q: Enqueue downstream jobs or complete run
    O->>IO: Emit node + workflow status updates
    IO-->>F: Frontend receives live progress
```

### Important current-runtime detail

The active queue implementation is **in-memory** via `apps/backend/config/queue.config.js` and `fastq`.

It preserves queue-like semantics (`workflow.tasks`, `workflow.results`, delayed retry behavior, monitor publishing), but it is not currently a distributed RabbitMQ runtime.

## Data ownership boundaries

It helps to distinguish the system's two main data domains.

### 1. Platform metadata

Stored in the Jet Admin application database through Prisma:

- users
- tenants
- roles and permissions
- datasources
- dashboards and widgets
- workflows and workflow instances

### 2. External/tenant-managed data

Accessed through datasource logic, database modules, or workflow handlers:

- third-party APIs
- connected databases
- files/object stores
- service integrations such as Slack or analytics connectors

Jet Admin manages the control plane around those systems even when it does not own the actual business data inside them.

## Authorization in the data path

Before most data reads or writes occur, the backend resolves:

1. who the caller is,
2. which tenant the operation belongs to,
3. whether the caller has the required permission,
4. whether API-key permissions or user-role permissions should apply.

That means most meaningful data flow in Jet Admin is **identity-aware and tenant-aware by design**.

## Cross-module interaction view

```mermaid
flowchart TB
    Frontend --> Auth[Auth module]
    Auth --> TenantRoutes[Tenant routes]

    TenantRoutes --> Datasource[Datasource module]
    TenantRoutes --> Query[Data query module]
    TenantRoutes --> Dashboard[Dashboard module]
    TenantRoutes --> Workflow[Workflow module]
    TenantRoutes --> Admin[Users / roles / API keys]

    Dashboard --> Widget[Widget module]
    Workflow --> Datasource
    Workflow --> Query
    Workflow --> Socket[Realtime updates]

    Datasource --> External[(External systems)]
    Query --> External
    Admin --> Prisma[(Application DB)]
    Dashboard --> Prisma
    Workflow --> Prisma
```

## Summary

Jet Admin data flow is best understood as a combination of:

- **authenticated HTTP CRUD**,
- **tenant-scoped service execution**,
- **realtime socket feedback**,
- **queue-backed workflow orchestration inside the backend process**.

Once you identify which of those four paths a feature uses, the relevant code becomes much easier to trace.