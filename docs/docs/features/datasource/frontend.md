---
sidebar_position: 2
title: Managing Connections
description: Step-by-step guide on how to configure and manage your external Datasources in the Jet Admin UI.
---

# Managing Connections (Datasource UI)


The **Datasources UI** provides a centralized interface for adding, editing, and testing connections to your external systems. Connecting your data is the foundational step before building any internal tools, dashboards, or automation workflows in Jet Admin.

## Creating a New Datasource

To establish a new connection:

1. Navigate to the **Datasources** section from the main Jet Admin sidebar.
2. Click the **Create Datasource** button.
3. You will be presented with a catalog of supported systems organized by type (Databases, Cloud Services, APIs, etc.).
4. Select the system you want to connect to. 

### Configuration Tabs

Once you select a connector type, the **Datasource Editor** provides a tailored form. The complexity of the form depends on the type of datasource selected, but it generally features a tabbed interface:

#### 1. Connection Details
This is the main configuration area.
- For **Relational Databases** (e.g., PostgreSQL, MySQL): You will provide the Host, Port, Database Name, Username, and Password.
- For **APIs** (e.g., REST API, GraphQL): You will define the Base URL, Authentication mechanisms (Bearer Tokens, Basic Auth), and default Headers.
- For **Cloud Services** (e.g., Firestore, BigQuery): You typically upload a JSON Service Account key or provide OAuth details.

#### 2. Advanced / SSL
For strict security requirements, you can configure SSL certificates (client certs, root CA) or custom connection timeouts.

#### 3. SSH Tunnel (Coming Soon/Feature Dependant)
If your database is hosted behind a firewall or private VPC, you can configure an SSH tunnel directly within the Jet Admin UI to securely bridge the connection.

## Testing and Saving

Before you save a connection, it is highly recommended to use the **Test Connection** feature.

- Click **Test Connection** at the bottom of the form.
- Jet Admin's backend will attempt to ping the resource using the provided credentials.
- The UI will display a success toast if the connection establishes, or it will surface the specific error message (e.g., *Access Denied*, *Connection Timed Out*) returned by the external system.

Once tested successfully, click **Save Datasource**.

## Editing and Managing

All saved connections appear in the Datasource List. 

From here, you can:
- **Edit:** Update passwords or rotate API keys without breaking the downstream queries that rely on this datasource.
- **Clone:** Duplicate an existing connection. This is highly useful for setting up "Staging" vs "Production" databases that share the exact same configuration shape but point to different hosts.
- **Delete:** Remove the datasource. *(Warning: Deleting a datasource that is actively used by existing Queries will cause those queries to fail).*

## Architecture Hint for Developers

If you are curious about how the UI dynamically renders different forms for different databases, it is powered by a central repository package called `@jet-admin/datasource-types` which dictates the JSON schema for every supported connector. For more on this, check out the [Frontend Architecture](../../architecture/frontend-architecture.mdx) guide.
