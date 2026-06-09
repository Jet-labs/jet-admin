---
sidebar_position: 2
title: Creating a Datasource
description: How to add support for a new database or API type
---

# Creating a Custom Datasource

This guide walks through adding support for a new datasource type (e.g., a new database or SaaS API) to the Jet Admin Integration Fabric.

## Overview

Adding a datasource requires changes to three packages:

1. **`@jet-admin/datasource-types`**: Register the identifier.
2. **`@jet-admin/datasources-logic`**: Implement the backend connection driver.
3. **`@jet-admin/datasources-ui`**: Create the connection form for the frontend.

---

## Step 1: Define the Type

In `packages/datasource-types/src/index.js`, add your new type to the main registry.

```javascript
// packages/datasource-types/src/index.js

export const DATASOURCE_TYPES = {
  // ... existing types
  CLICKHOUSE: {
    name: 'ClickHouse',
    value: 'clickhouse',
    category: 'database',
    description: 'Fast open-source OLAP DBMS'
  }
};
```

---

## Step 2: Implement the Driver Logic

The driver handles the actual execution on the backend. Create a new folder in `packages/datasources-logic/src/data-sources/clickhouse/` and implement the `DataSource` interface.

```javascript
// packages/datasources-logic/src/data-sources/clickhouse/datasource.js
import { ClickHouseClient } from '@clickhouse/client';

export class ClickHouseDataSource {
  constructor(options, credentials) {
    this.options = options;
    this.credentials = credentials;
    this.client = null;
  }

  async connect() {
    if (!this.client) {
      this.client = new ClickHouseClient({
        host: this.options.host,
        port: this.options.port,
        username: this.credentials.username,
        password: this.credentials.password,
        database: this.options.database
      });
    }
    return this.client;
  }

  // Called when a user clicks "Test Connection" in the UI
  async testConnection() {
    try {
      const client = await this.connect();
      await client.query('SELECT 1').toPromise();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Called when a Query is executed
  async execute(queryConfig, evaluatedParams) {
    const client = await this.connect();
    // Use parameterization! Do not inject variables directly.
    const result = await client.query(queryConfig.sql, {
      query_params: evaluatedParams
    }).toPromise();

    return result;
  }
}
```

### Register the Driver

Expose the driver to the Integration Fabric in `packages/datasources-logic/src/data-sources/index.js`:

```javascript
import { ClickHouseDataSource } from './clickhouse/datasource';

export const DataSourceDrivers = {
  // ... existing drivers
  clickhouse: ClickHouseDataSource
};
```

---

## Step 3: Define the Manifest

The manifest tells the Query Engine what capabilities your datasource has and provides instructions for the frontend query editor.

In `packages/datasources-logic/src/data-sources/manifests.js`:

```javascript
export const DATASOURCE_MANIFESTS = {
  // ...
  clickhouse: {
    name: "ClickHouse",
    description: "Execute fast analytical queries against ClickHouse.",
    capabilities: ["read", "write"],
    queryInstructions: "Write standard ClickHouse SQL. Use {{bindings}} for parameters."
  }
};
```

---

## Step 4: Create the Configuration UI

Jet Admin uses JSON Forms (or custom React components) to generate the UI for setting up a connection.

In `packages/datasources-ui/src/components/`, create the form for ClickHouse. It should emit the `options` and `credentials` objects separately, as the backend encrypts `credentials`.

```javascript
// Example schema for your UI component
export const clickhouseSchema = {
  options: {
    host: 'localhost',
    port: 8123,
    database: 'default'
  },
  credentials: {
    username: 'default',
    password: ''
  }
};
```

Register this form component in the `datasources-ui` index so the frontend router can render it when "ClickHouse" is selected.

---

## Step 5: Test Your Datasource

1. Rebuild all packages: `npm run dev:all-packages`
2. Start the backend (`npm run dev` in `apps/backend`) and frontend (`npm run dev` in `apps/frontend`).
3. Navigate to the **Datasources** tab in the Jet Admin UI.
4. Click **New Datasource**, select **ClickHouse**, fill out the credentials, and click **Test Connection**.

---

## Best Practices

- **Security**: Never log `this.credentials` or include passwords in error messages.
- **Connection Pooling**: If your database library supports connection pooling, use it to prevent exhausting backend resources.
- **Parameterization**: Always use the native parameterization features of the underlying database driver (e.g., `$1`, `?`) when substituting `evaluatedParams`. Never use string concatenation for SQL queries to prevent SQL injection.
