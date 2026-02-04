---
id: database-schema
title: Database Schema
sidebar_label: Database ERD
sidebar_position: 3
description: Entity Relationship Diagram (ERD) of the Jet Admin PostgreSQL database.
---



# Database Schema

The following diagram represents the core tables and relationships in the Jet Admin database, generated from the Prisma Schema.

## Entity Relationship Diagram

```mermaid
erDiagram
    %% Core Users & Tenants
    tblUsers ||--o{ tblTenants : "manages"
    tblUsers ||--o{ tblUsersTenantsRelationship : "has_roles"
    tblTenants ||--o{ tblUsersTenantsRelationship : "has_members"
    
    %% API Keys & Access
    tblAPIKeys }o--|| tblTenants : "belongs_to"
    tblAPIKeys ||--o{ tblAPIKeyRoleMappings : "has_roles"
    tblRoles ||--o{ tblAPIKeyRoleMappings : "assigned_to"
    
    %% Dashboards & Widgets
    tblDashboards }o--|| tblTenants : "belongs_to"
    tblDashboards ||--o{ tblWidgets : "contains"
    tblWidgets }o--|| tblTenants : "belongs_to"
    
    %% Data Connectivity
    tblDatasources }o--|| tblTenants : "owned_by"
    tblDataQueries }o--|| tblDatasources : "queries"
    tblDataQueries }o--|| tblTenants : "belongs_to"
    
    %% Workflow Engine
    tblWorkflows }o--|| tblTenants : "belongs_to"
    tblWorkflows ||--o{ tblWorkflowNodes : "contains"
    tblWorkflows ||--o{ tblWorkflowEdge : "connects"
    tblWorkflows ||--o{ tblWorkflowInstances : "instantiates"
    
    %% Execution Logs
    tblWorkflowInstances ||--o{ tblNodeExecutionLogs : "generates"
    tblWorkflowNodes ||--o{ tblNodeExecutionLogs : "logs"

    %% Table Definitions
    tblUsers {
        uuid userID PK
        string email
        string firebaseID
        string firstName
        string lastName
    }

    tblTenants {
        uuid tenantID PK
        string tenantTitle
        string tenantDBURL
    }

    tblWorkflows {
        uuid workflowID PK
        string title
        json workflowOptions
    }

    tblWorkflowNodes {
        uuid nodeID PK
        string nodeType
        json nodeConfig
    }

    tblWorkflowInstances {
        uuid instanceID PK
        string status
        json contextData
    }
```

## Core Entities

### User Management

| Table | Description |
|:------|:------------|
| `tblUsers` | System users synced with Firebase Authentication |
| `tblTenants` | Workspaces/organizations in the multi-tenant system |
| `tblUsersTenantsRelationship` | Junction table linking users to tenants with roles |
| `tblRoles` | Role definitions (Admin, Editor, Viewer) |
| `tblPermissions` | Granular permissions assigned to roles |

### Resources (Tenant-Scoped)

| Table | Description |
|:------|:------------|
| `tblDatasources` | External database connection configurations (encrypted) |
| `tblDataQueries` | Saved SQL/API queries for reuse |
| `tblWorkflows` | Workflow metadata and settings |
| `tblWorkflowVersions` | Versioned workflow graph (nodes/edges as JSON) |
| `tblDashboards` | Dashboard layouts and settings |
| `tblWidgets` | Widget instances with configuration |

### Runtime & Logging

| Table | Description |
|:------|:------------|
| `tblWorkflowInstances` | Individual workflow execution runs |
| `tblNodeExecutionLogs` | Per-node execution logs within a run |
| `tblAuditLogs` | Security audit trail for compliance |
| `tblCronJobs` | Scheduled task configurations |

## Key Design Patterns

- **Multi-tenancy**: All resource tables have a `tenantID` foreign key for data isolation
- **UUIDs**: Primary keys use `gen_random_uuid()` for distributed ID generation
- **Soft Deletes**: Critical tables support `deletedAt` for recoverable deletion
- **Timestamps**: Standard `createdAt` and `updatedAt` on all tables
- **Encrypted Fields**: Datasource credentials are AES-encrypted at rest

