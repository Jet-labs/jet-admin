---
id: datasource-integration
title: Datasource & Integration Fabric
sidebar_label: Datasource & Integrations
sidebar_position: 4
description: How Jet Admin connects to external databases and APIs.
---

# Datasource & Integration Fabric

Jet Admin acts as a unified interface over your existing infrastructure. It does not store your business data; instead, it provides an **Integration Fabric** to securely query databases, APIs, and SaaS applications.

## Datasource Model

A **Datasource** is a saved configuration record in the Jet Admin operational database (`tblDatasources`).

### What a Datasource Represents
At the data model level, a datasource contains:
- `datasourceID`: Unique identifier.
- `tenantID`: The workspace that owns the connection.
- `datasourceType`: A string identifier matching a driver (e.g., `postgresql`, `stripe`, `restapi`).
- `datasourceOptions`: A JSON blob containing the connection parameters (e.g., host, port, database name, URLs).
- `datasourceCredentials`: Encrypted secrets (e.g., passwords, API keys, bearer tokens).

### Supported Types
Jet Admin supports a wide array of systems out-of-the-box (defined in `@jet-admin/datasource-types` and implemented in `@jet-admin/datasources-logic`), including:
- **SQL Databases:** PostgreSQL, MySQL, MSSQL, Oracle, SQLite, CockroachDB, Supabase, BigQuery.
- **NoSQL / Documents:** MongoDB, Firestore, Neo4j, Elasticsearch, Airtable, Google Sheets.
- **APIs & SaaS:** REST APIs, GraphQL, Stripe, Twilio, SendGrid, Slack, Notion, Jira, Google Analytics.
- **Messaging & Cache:** Kafka, RabbitMQ, Redis.
- **Storage:** AWS S3.
- **Web:** Web URL (Scraping/fetching).

### Security & Encryption
Credentials are never sent to the frontend. When a user creates a datasource, the backend encrypts the sensitive fields before saving them to PostgreSQL. When a query executes, the backend decrypts the credentials in memory just in time to establish the connection.

## Integration Fabric Architecture

The Integration Fabric is the backend system that manages drivers, routing, and connection pooling.

### The Connector Model
Every datasource type has a corresponding class implementation extending the base `DataSource` interface in `packages/datasources-logic`.

Connectors define how to:
1. `testConnection()`: Validate credentials and network reachability.
2. `execute()`: Run a specific query or operation.

### Unified Capabilities Manifests
To allow the frontend to render the correct UI for building queries, each connector exports a manifest (`packages/datasources-logic/src/data-sources/manifests.js`). This manifest describes:
- **Capabilities:** Whether the source supports `read`, `write`, `filter`, or `aggregate`.
- **Query Instructions:** Structural guidelines for what a query payload should look like for this specific driver.

### Connection Pooling
For relational databases like PostgreSQL, opening a new TCP connection for every query is extremely slow. The Integration Fabric utilizes connection pooling. When a query is executed, the fabric checks if an active pool exists for that specific `datasourceID`. If so, it borrows a connection; if not, it initializes a new pool.

## Datasource Resolution at Runtime

When a query is triggered from the frontend, it contains only the `datasourceID`.

### Execution Pipeline

1. **Request:** The frontend requests `/api/v1/data-query/execute` with a query ID.
2. **Lookup:** The backend looks up the query to find its associated `datasourceID`.
3. **Retrieval:** The backend fetches the `tblDatasources` record and decrypts the credentials.
4. **Environment Routing:** *[VERIFY: If environment-specific overrides (dev/prod) exist, they are resolved here.]*
5. **Instantiation:** The Integration Fabric uses the `datasourceType` to instantiate the correct driver class (e.g., `PostgreSQLDataSource`).
6. **Execution:** The backend invokes the driver's `execute()` method with the evaluated query body.
7. **Error Handling:** If the connection times out, the credentials fail, or the query syntax is invalid, the driver throws a normalized error that the Express router wraps in a standard API error response.
