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
