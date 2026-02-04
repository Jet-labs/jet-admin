---
sidebar_position: 2
title: Creating a Datasource
description: How to add support for a new database or API type
---

# Creating a Custom Datasource

This guide walks through adding support for a new datasource type (e.g., a new database or API).

## Overview

Adding a datasource requires changes to three packages:

1. **`datasource-types`**: Define the configuration schema
2. **`datasources-logic`**: Implement the connection driver
3. **`datasources-ui`**: Create the connection form (optional, uses JSON Forms)

## Step 1: Define the Type

In `packages/datasource-types/src/index.js`, add your new type:

```javascript
export const DATASOURCE_TYPES = {
  // ... existing types
  CLICKHOUSE: {
    name: 'ClickHouse',
    value: 'clickhouse',
    icon: 'ClickHouseIcon',
    category: 'database'
  }
};
```

## Step 2: Create the Driver

In `packages/datasources-logic/src/`, create a new driver file:

```javascript
// packages/datasources-logic/src/clickhouse/index.js

export class ClickHouseDriver {
  constructor(config) {
    this.config = config;
  }

  async testConnection() {
    // Validate connection and return { success: true } or throw error
    const client = await this.getClient();
    await client.query('SELECT 1');
    return { success: true };
  }

  async runQuery(query, params = {}) {
    const client = await this.getClient();
    const result = await client.query(query, params);
    return {
      rows: result.data,
      fields: result.columns
    };
  }

  async getTables() {
    const result = await this.runQuery('SHOW TABLES');
    return result.rows.map(row => ({ name: row.name }));
  }

  async getClient() {
    // Initialize and return the ClickHouse client
    const { ClickHouse } = require('@clickhouse/client');
    return new ClickHouse({
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      password: this.config.password,
      database: this.config.database
    });
  }
}
```

### Register the Driver

In `packages/datasources-logic/src/index.js`:

```javascript
import { ClickHouseDriver } from './clickhouse';

export const DRIVERS = {
  // ... existing drivers
  clickhouse: ClickHouseDriver
};

export function getDriver(type, config) {
  const Driver = DRIVERS[type];
  if (!Driver) throw new Error(`Unknown datasource type: ${type}`);
  return new Driver(config);
}
```

## Step 3: Define Configuration Schema

In `packages/datasource-types/src/schemas/clickhouse.js`:

```javascript
export const clickhouseSchema = {
  type: 'object',
  required: ['host', 'port', 'database'],
  properties: {
    host: {
      type: 'string',
      title: 'Host',
      default: 'localhost'
    },
    port: {
      type: 'number',
      title: 'Port',
      default: 8123
    },
    database: {
      type: 'string',
      title: 'Database'
    },
    username: {
      type: 'string',
      title: 'Username'
    },
    password: {
      type: 'string',
      title: 'Password',
      format: 'password'
    }
  }
};
```

## Step 4: Test Your Datasource

1. Rebuild packages: `npm run dev:all-packages`
2. Start the app: `npm run dev:all`
3. Create a new datasource and select your type
4. Test the connection

## Driver Interface

All drivers should implement this interface:

```typescript
interface DatasourceDriver {
  testConnection(): Promise<{ success: boolean }>;
  runQuery(query: string, params?: object): Promise<{ rows: any[], fields: any[] }>;
  getTables(): Promise<{ name: string }[]>;
  getColumns?(tableName: string): Promise<{ name: string, type: string }[]>;
}
```

## Best Practices

- **Error Handling**: Wrap errors with meaningful messages
- **Connection Pooling**: Reuse connections where possible
- **Timeouts**: Implement query timeouts to prevent hanging
- **Sanitization**: Never interpolate user input directly into queries
