---
id: core-glossary
title: Core Concepts Glossary
sidebar_label: Core Glossary
sidebar_position: 1
description: Definitions of the foundational concepts within Jet Admin.
---

# Core Concepts Glossary

To understand Jet Admin, you must understand the primitive building blocks that make up the platform. This glossary defines each concept precisely, clarifying what it is, what it is not, and how it relates to adjacent concepts.

---

### Application / App
**What it is:** A logical container of pages, datasources, queries, and workflows scoped to a specific team or project. It is the top-level entity that users interact with.
**What it is NOT:** An app is not a single web page. It is a collection of resources.
**Relation:** An app contains **Pages**, executes **Queries** against **Datasources**, and triggers **Workflows**.

---

### Page
**What it is:** A visual canvas of widgets, serving as a distinct view within an Application. A page handles routing, layout configuration, and scopes local state.
**What it is NOT:** A page is not a global store; its widget state is destroyed and re-initialized when navigating away and back.
**Relation:** A page lives inside an **App** and contains **Widgets**. Loading a page often triggers on-load **Queries**.

---

### Widget
**What it is:** An atomic UI unit (e.g., Table, Button, Chart, Text Input) placed on a Page. Widgets have configurable *properties*, emit *events*, and can be *bound* to data.
**What it is NOT:** A widget does not fetch data itself. It only displays data provided to it via bindings.
**Relation:** Widgets live on a **Page**, display data from **Queries**, and their events (like `onClick`) can trigger new queries or **Workflows**.

---

### Datasource
**What it is:** A saved configuration defining a connection to an external system. This could be a database (PostgreSQL, MySQL), a REST API, a SaaS application (Stripe, Slack), or a message broker (Kafka). It stores credentials securely.
**What it is NOT:** A datasource is not the data itself, nor is it a specific request for data. It is only the *connection definition*.
**Relation:** A datasource is required to execute a **Query** or a **Workflow Node** that interacts with an external system. It is managed by the **Integration Fabric**.

---

### Query
**What it is:** A parameterized operation executed against a specific Datasource, returning structured data. Queries can be parameterized using `{{inputs.param}}`.
**What it is NOT:** A query is not a UI component, nor is it a multi-step background job. It is a single synchronous (from the client's perspective) request/response cycle.
**Relation:** Queries are executed against **Datasources**. The resulting data is bound to **Widgets** using **Template Expressions**.

---

### Workflow
**What it is:** A versioned, directed acyclic graph (DAG) of nodes executed asynchronously by the backend orchestrator. Workflows handle multi-step, long-running, or complex backend logic.
**What it is NOT:** A workflow is not a synchronous frontend operation. It runs in the background and reports progress via WebSockets.
**Relation:** Workflows are composed of **Workflow Nodes**. They can be triggered by **Widget** events, cron schedules, or incoming webhooks.

---

### Workflow Node
**What it is:** An atomic unit of work within a Workflow DAG. Examples include executing a query, transforming data with JavaScript, evaluating conditions, looping, or waiting for human input.
**What it is NOT:** A workflow node is not a standalone executable script; it requires the workflow context and orchestrator to run.
**Relation:** Nodes are connected by edges to form a **Workflow**. They read from and write to the workflow's append-only context log.

---

### Binding / Template Expression
**What it is:** The `{{expression}}` syntax used throughout Jet Admin to inject dynamic values. Expressions are evaluated in a sandboxed JavaScript runtime against the current context (widget states, query data, etc.).
**What it is NOT:** A binding is not full-fledged React code. It is an isolated AST-evaluated expression (e.g., `{{queries.getUsers.data.length > 0}}`).
**Relation:** Bindings connect **Query** results to **Widget** properties, or inject **Widget** state into **Query** parameters.

---

### Integration
**What it is:** A typed, specific connector implemented within Jet Admin's Integration Fabric (e.g., the "PostgreSQL Integration" or the "Stripe Integration").
**What it is NOT:** An integration is not a specific configured instance; that is a **Datasource**. The integration is the underlying driver logic.
**Relation:** Integrations define the capabilities and UI forms for creating **Datasources**.

---

### ETL Pipeline
**What it is:** A standalone extract-transform-load graph designed specifically for moving and shaping high-volume data between a source and a sink, separate from UI workflows.
**What it is NOT:** An ETL pipeline is not a standard **Workflow**. Workflows are designed for operational logic and orchestration; ETL pipelines are optimized for data ingestion and mapping.
**Relation:** Shares some underlying engine mechanics with Workflows but is functionally distinct, focusing on continuous or batch data synchronization.

---

### Role / Permission
**What it is:** The primitives defining Role-Based Access Control (RBAC). Roles are assigned to users and contain specific permissions determining what actions they can perform and what data they can see.
**What it is NOT:** A simple boolean admin flag. It is a granular matrix of permissions.
**Relation:** Roles govern access to **Apps**, **Pages**, **Datasources**, and **Workflows** within a tenant workspace.
