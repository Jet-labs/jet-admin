---
id: system-overview
title: System Overview (C4 Model)
sidebar_label: System Overview
sidebar_position: 1
description: High-level C4 model architecture diagrams for Jet Admin.
---

# System Architecture Overview

This document provides a high-level overview of the Jet Admin platform architecture using the **C4 Model** (Context, Containers, Components, Code).

## System Context (C4 Level 1)

The System Context diagram shows Jet Admin in the center of its environment, interacting with users and external systems.

```mermaid
C4Context
  title System Context Diagram for Jet Admin

  Person(admin, "Platform Admin", "Configures datasources, users, and roles")
  Person(user, "End User", "Uses widgets, runs workflows, views data")
  
  System(jetadmin, "Jet Admin Platform", "Internal tools platform for multi-tenant data management and workflows")
  
  System_Ext(postgres, "Customer PostgreSQL", "External databases connected by tenants")
  System_Ext(restapi, "External REST APIs", "Third-party APIs connected by tenants")
  System_Ext(firebase, "Firebase Auth", "Authentication provider")

  Rel(admin, jetadmin, "Configures and manages")
  Rel(user, jetadmin, "Interacts with internal tools")
  
  Rel(jetadmin, firebase, "Authenticates users via")
  Rel(jetadmin, postgres, "Queries and mutates data via")
  Rel(jetadmin, restapi, "Integrates with via")
```

## Container Architecture (C4 Level 2)

The Container diagram zooms into the Jet Admin system to show the high-level technical containers that make up the system.

```mermaid
C4Container
  title Container Diagram for Jet Admin

  Person(user, "User", "Admin or End User")

  System_Boundary(jetadmin, "Jet Admin Platform") {
    Container(frontend, "Frontend SPA", "React, Vite, MUI", "Provides the UI for dashboards, workflows, and queries")
    Container(api, "Backend API", "Node.js, Express", "Handles business logic, auth, and API routing")
    Container(queue, "Workflow Queue", "fastq (In-Memory)", "Manages workflow task execution")
    ContainerDb(db, "Platform Database", "PostgreSQL", "Stores tenants, users, workflows, widgets, and logs")
  }

  System_Ext(firebase, "Firebase Auth", "Authentication")
  System_Ext(externalData, "External Data Sources", "PostgreSQL / REST APIs")

  Rel(user, frontend, "Visits", "HTTPS")
  Rel(frontend, firebase, "Authenticates", "HTTPS")
  Rel(frontend, api, "Makes API calls", "JSON/HTTPS")
  Rel(frontend, api, "Real-time updates", "Socket.IO")
  
  Rel(api, firebase, "Verifies Tokens", "HTTPS")
  Rel(api, db, "Reads/Writes", "Prisma/TCP")
  Rel(api, queue, "Enqueues tasks", "In-Process")
  Rel(queue, api, "Executes tasks", "In-Process")
  
  Rel(api, externalData, "Queries data", "TCP/HTTPS")
  Rel(queue, externalData, "Queries data during workflows", "TCP/HTTPS")
```

## Next Steps

For detailed **Component Architecture (C4 Level 3)**, please refer to the specific module architectures:
- [Backend Architecture](./backend-architecture.md)
- [Frontend Architecture](./frontend-architecture.md)
- [Database Schema](./database-schema.md)
