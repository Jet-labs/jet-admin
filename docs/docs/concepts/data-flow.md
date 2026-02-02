---
id: data-flow
title: Data Flow
sidebar_label: Data Flow
sidebar_position: 1
description: Detailed breakdown of Jet Admin's data flow.
---

# Data Flow

Jet Admin is designed as a modular, event-driven system. It separates the concerns of user interaction (Frontend), data persistence/logic (Backend), and asynchronous processing (Workflow Engine).

## Core Components

### 1. The Frontend Client
The frontend is a Single Page Application (SPA) built with Vite and React. It communicates with the backend via:
- **REST API:** For standard CRUD operations (creating dashboards, fetching users).
- **Socket.io:** For real-time updates (workflow execution logs, chat, notifications).

### 2. The Backend Server
The backend is a monolithic Node.js application (modularized internally) that handles:
- **API Gateway:** Routes requests to appropriate modules.
- **Authentication:** Validates JWTs and manages user sessions.
- **Workflow Orchestrator:** A specialized module that interprets and executes Directed Acyclic Graphs (DAGs).

### 3. Data Storage
- **PostgreSQL:** The primary source of truth for application data (Users, Apps, Dashboards) AND the user's connected databases.
- **Prisma ORM:** Used for type-safe database interactions.

## Data Flow Architecture

### Request Lifecycle (Synchronous)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Middleware
    participant C as Controller
    participant S as Service
    participant D as Database

    U->>F: Click "Save Dashboard"
    F->>A: POST /api/dashboards (Bearer Token)
    A->>A: Validate Token
    A->>C: Pass to DashboardController
    C->>S: Call createDashboard()
    S->>D: Prisma.tblDashboards.create()
    D-->>S: Return New ID
    S-->>C: Return Dashboard Object
    C-->>F: JSON Response 201 Created
    F-->>U: Show Success Notification
```

### Workflow Execution (Asynchronous)

Workflows in Jet Admin can be triggered manually, via webhook, or on a schedule (Cron).

```mermaid
sequenceDiagram
    participant T as Trigger (Cron/Webhook)
    participant O as Orchestrator
    participant Q as Job Queue (Internal/RabbitMQ)
    participant W as Worker Node
    participant S as Socket Service
    participant F as Frontend

    T->>O: Initiate Workflow Execution
    O->>Q: Enqueue Job (WorkflowInstance)
    Q->>W: Pick up Job
    loop For Each Node in DAG
        W->>W: Execute Node Logic
        W->>S: Emit "NodeExecutionLog"
        S-->>F: Push Real-time Log Update
    end
    W->>O: Report Completion
    O->>D: Update Instance Status (COMPLETED)
```

## Module Interaction Map

The backend is divided into specialized modules. Here is how they interact:

```mermaid
flowchart TB
    Auth["Auth Module"] -->|Protects| API["API Routes"]
    
    API --> Workflow["Workflow Module"]
    API --> Dashboard["Dashboard Module"]
    API --> Datasource["Datasource Module"]
    
    Workflow -->|Uses| Datasource["Datasource Module"]
    Workflow -->|Updates| Audit["Audit Log Module"]
    
    Dashboard -->|Queries| Datasource
    
    Datasource -->|Connects| ExtDB[("User Databases")]
```
