---
id: database-schema
title: Data Model Reference
sidebar_label: Database Schema
sidebar_position: 11
description: Comprehensive reference of every PostgreSQL operational database table, column, and relationship.
---

# Data Model Reference

Jet Admin uses PostgreSQL for its operational database, managed via Prisma. This database stores configuration, metadata, and state—**it does not store your external business data**.

Below is an exhaustive reference of the tables derived from `prisma/schema.prisma`.

---

## Multi-Tenancy & Identity

### `tblTenants`
The root entity establishing isolation boundaries for all resources.
- **Columns:**
  - `tenantID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `tenantName` (String, VarChar)
  - `createdAt` (DateTime, Timestamptz, Default: now())
  - `updatedAt` (DateTime, Timestamptz, Default: now())
- **Relationships:** One-to-many with Apps, Pages, Users, Roles, Datasources, Queries, Workflows.

### `tblUsers`
Users who log into the Jet Admin platform.
- **Columns:**
  - `userID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `email` (String, VarChar, Unique)
  - `passwordHash` (String, VarChar)
  - `firstName` (String, VarChar, Nullable)
  - `lastName` (String, VarChar, Nullable)
  - `isActive` (Boolean, Default: true)
  - `createdAt` / `updatedAt` (DateTime)
- **Indexes:** Unique index on `email`.

### `tblTenantUsers`
Junction table mapping users to tenants and assigning their RBAC role.
- **Columns:**
  - `id` (UUID, Primary Key, Default: uuid_generate_v4())
  - `tenantID` (UUID) - FK to `tblTenants`
  - `userID` (UUID) - FK to `tblUsers`
  - `roleID` (UUID) - FK to `tblTenantRoles`
- **Indexes:** `idx_tblTenantUsers_tenantID`, `idx_tblTenantUsers_userID`.
- **Relationships:** Links Users, Tenants, and Roles.

### `tblTenantRoles`
Defines available RBAC roles and their associated permission matrices.
- **Columns:**
  - `roleID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `tenantID` (UUID) - FK to `tblTenants`
  - `roleName` (String, VarChar)
  - `permissions` (JSON, Default: "{}") - Granular matrix of allowed actions.
  - `isSystem` (Boolean, Default: false) - Prevents deletion of default roles.
- **Indexes:** `idx_tblTenantRoles_tenantID`.

### `tblAPIKeys`
Machine-to-machine authentication tokens.
- **Columns:**
  - `apiKeyID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `tenantID` (UUID) - FK to `tblTenants`
  - `keyHash` (String, VarChar) - Cryptographic hash of the raw token.
  - `keyName` (String, VarChar)
  - `roleID` (UUID, Nullable) - FK to `tblTenantRoles`
  - `createdAt` / `lastUsedAt` (DateTime)
- **Indexes:** `idx_tblAPIKeys_tenantID`.

---

## Application & UI

### `tblApps`
The top-level container for a project or workspace.
- **Columns:**
  - `appID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `tenantID` (UUID) - FK to `tblTenants`
  - `appName` (String, VarChar)
  - `appDescription` (String, VarChar, Nullable)
  - `appOptions` (JSON, Default: "{}") - Global theme, routing, and navigation config.
  - `createdAt` / `updatedAt` (DateTime)

### `tblAppPages`
A specific view within an app, storing the widget layout.
- **Columns:**
  - `appPageID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `tenantID` (UUID) - FK to `tblTenants`
  - `appPageTitle` (String, VarChar)
  - `appPageDescription` (String, VarChar, Nullable)
  - `appPageConfig` (JSON, Nullable) - The layout and widget tree definition.
  - `creatorID` (UUID, Nullable) - FK to `tblUsers`
  - `createdAt` / `updatedAt` (DateTime)

---

## Data Integration

### `tblDatasources`
Saved configurations for connecting to external systems.
- **Columns:**
  - `datasourceID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `tenantID` (UUID) - FK to `tblTenants`
  - `datasourceName` (String, VarChar)
  - `datasourceType` (String, VarChar) - e.g., "postgresql", "restapi".
  - `datasourceOptions` (JSON, Default: "{}") - Non-sensitive connection config (host, port).
  - `datasourceCredentials` (String, VarChar, Nullable) - Base64 AES-encrypted secret blob.
  - `createdAt` / `updatedAt` (DateTime)

### `tblQueries`
Executable operations run against datasources.
- **Columns:**
  - `queryID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `tenantID` (UUID) - FK to `tblTenants`
  - `datasourceID` (UUID) - FK to `tblDatasources`
  - `queryName` (String, VarChar)
  - `queryConfig` (JSON, Default: "{}") - The query payload, body, or SQL string.
  - `transformer` (String, VarChar, Nullable) - JavaScript code for post-processing.
  - `runOnPageLoad` (Boolean, Default: false)
  - `createdAt` / `updatedAt` (DateTime)

---

## Workflows

### `tblWorkflows`
Metadata definition of a DAG workflow.
- **Columns:**
  - `workflowID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `tenantID` (UUID) - FK to `tblTenants`
  - `title` (String, VarChar)
  - `workflowOptions` (JSON, Default: "{}") - Input definitions and global workflow settings.
  - `creatorID` (UUID, Nullable) - FK to `tblUsers`
  - `isDisabled` (Boolean, Nullable)
  - `createdAt` / `updatedAt` (DateTime)

### `tblWorkflowNodes`
Individual steps within a workflow definition.
- **Columns:**
  - `nodeID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `workflowID` (UUID) - FK to `tblWorkflows`
  - `nodeType` (String, VarChar) - e.g., "start", "dataQuery", "condition".
  - `nodeConfig` (JSON, Nullable) - Properties and settings for the specific node.
  - `timeoutSeconds` (Int, Default: 300)
  - `retryLimit` (Int, Default: 3)
  - `createdAt` / `updatedAt` (DateTime)

### `tblWorkflowEdge`
Connects nodes to form the DAG.
- **Columns:**
  - `edgeID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `workflowID` (UUID) - FK to `tblWorkflows`
  - `upstreamNodeID` (UUID) - FK to `tblWorkflowNodes`
  - `downstreamNodeID` (UUID) - FK to `tblWorkflowNodes`
  - `sourceHandle` (String, VarChar, Nullable) - Branch identifier (e.g., 'true', 'false', 'completed').

### `tblWorkflowInstances`
A specific execution run of a workflow.
- **Columns:**
  - `instanceID` (UUID, Primary Key, Default: uuid_generate_v4())
  - `workflowID` (UUID, Nullable) - FK to `tblWorkflows`
  - `tenantID` (UUID) - FK to `tblTenants`
  - `status` (String, VarChar, Default: "PENDING") - State machine enum.
  - `version` (Int, Default: 0) - Optimistic concurrency lock.
  - `isTest` (Boolean, Default: false)
  - `startedAt` / `completedAt` (DateTime, Nullable)

### `tblWorkflowInstanceLogs`
Append-only context log for a running instance.
- **Columns:**
  - `logID` (BigInt, Primary Key, Auto-increment)
  - `instanceID` (UUID) - FK to `tblWorkflowInstances`
  - `nodeID` (String, VarChar, Nullable)
  - `eventType` (String, VarChar) - e.g., "NODE_COMPLETED".
  - `nodeStatus` (String, VarChar, Nullable)
  - `outputVariable` (String, VarChar, Nullable)
  - `payload` (JSON, Default: "{}")
  - `nodeAttempt` (Int, Nullable)
  - `createdAt` (DateTime)
- **Indexes:** `idx_tblWorkflowInstanceLogs_instance_seq` on `[instanceID, logID]`.

### `tblWorkflowDataCollectionRequests`
State tracking for human-in-the-loop wait nodes.
- **Columns:**
  - `collectionRequestID` (UUID, Primary Key)
  - `instanceID` (UUID) - FK to `tblWorkflowInstances`
  - `nodeID` (String, VarChar)
  - `status` (String, VarChar, Default: "PENDING")
  - `collectionConfig` (JSON)
  - `submittedData` (JSON, Nullable)
  - `expiresAt` (DateTime, Nullable)

---

## Event Listeners

### `tblListeners`
Definitions for incoming data streams (Webhooks).
- **Columns:**
  - `listenerID` (UUID, Primary Key)
  - `tenantID` (UUID) - FK to `tblTenants`
  - `datasourceID` (UUID) - FK to `tblDatasources`
  - `listenerType` (String, VarChar)
  - `listenerConfig` (JSON)
  - `endpointPath` (String, VarChar, Nullable) - Unique URL suffix for webhooks.
  - `status` (String, VarChar, Default: "inactive")

### `tblListenerActions`
Actions triggered by a listener (e.g., run workflow).
- **Columns:**
  - `actionID` (UUID, Primary Key)
  - `listenerID` (UUID) - FK to `tblListeners`
  - `actionType` (String, VarChar)
  - `actionConfig` (JSON)
  - `orderIndex` (Int, Default: 0)

### `tblListenerEvents`
Buffer queue for incoming events.
- **Columns:**
  - `eventID` (UUID, Primary Key)
  - `listenerID` (UUID) - FK to `tblListeners`
  - `bufferName` (String, VarChar)
  - `eventData` (JSON) - Raw payload.
  - `seqNo` (BigInt, Auto-increment)
- **Indexes:** `idx_tblListenerEvents_buffer_seq` (descending on seqNo).

### `tblEventDLQ`
Dead Letter Queue for failed listener events.
- **Columns:**
  - `dlqId` (UUID, Primary Key)
  - `rawPayload` (Bytes, Nullable)
  - `errorMessage` (String, Nullable)
  - `retryCount` (Int, Default: 0)

---

## Automation & Auditing

### `tblCronJobs`
Scheduled task definitions.
- **Columns:**
  - `cronJobID` (UUID, Primary Key)
  - `tenantID` (UUID) - FK to `tblTenants`
  - `cronExpression` (String, VarChar)
  - `workflowID` (UUID) - FK to `tblWorkflows`
  - `isEnabled` (Boolean, Default: true)
  - `lastRunAt` / `nextRunAt` (DateTime, Nullable)

### `tblAuditLogs`
Tracks sensitive operations for security and compliance.
- **Columns:**
  - `logID` (UUID, Primary Key)
  - `tenantID` (UUID) - FK to `tblTenants`
  - `userID` (UUID, Nullable) - FK to `tblUsers`
  - `action` (String, VarChar)
  - `resource` (String, VarChar)
  - `resourceID` (String, VarChar, Nullable)
  - `payload` (JSON, Nullable) - Filtered payload devoid of sensitive keys.
  - `ipAddress` / `userAgent` (String, VarChar, Nullable)
  - `createdAt` (DateTime)
