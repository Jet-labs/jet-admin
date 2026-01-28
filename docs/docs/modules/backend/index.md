---
id: backend-modules-index
title: Backend Modules
sidebar_label: Backend Modules
sidebar_position: 1
description: Overview of the Jet Admin Backend Module System.
---

# Backend Modules

The backend is organized into domain-specific modules. Each module typically contains:
- **`controller`**: Handles HTTP requests.
- **`service`**: Contains business logic and database interactions.
- **`routes`**: Defines API endpoints.
- **`validator`**: Zod/Express-Validator schemas.

## List of Modules

| Module | Description | Key Services |
| :--- | :--- | :--- |
| **Workflow** | Manages DAG execution, orchestration, and logging. | `WorkflowService`, `Orchestrator` |
| **Auth** | Authentication and Authorization. | `AuthService` |
| **Datasource** | Management of user database connections. | `DatasourceService` |
| **Dashboard** | Layout and widget configuration storage. | `DashboardService` |
| **...** | *See sidebar for full list.* | ... |
