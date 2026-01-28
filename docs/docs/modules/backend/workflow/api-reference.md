---
id: api-reference
title: API Reference
sidebar_label: API Reference
sidebar_position: 2
description: Technical specification of Workflow Service and Controller functions.
---

# API Reference

## WorkflowController

Located in `apps/backend/modules/workflow/workflow.controller.js`.

### `createWorkflow`

**Endpoint:** `POST /api/workflows/:tenantID`

Creates a new workflow definition. It wraps the DB operations in a transaction to ensure atomic creation of the Workflow, Nodes, and Edges.

**Request Body:**
```json
{
  "title": "My Workflow",
  "nodes": [...], // Array of ReactFlow keys
  "edges": [...], // Array of ReactFlow edges
  "workflowOptions": {}
}
```

### `executeWorkflow`

**Endpoint:** `POST /api/workflows/:tenantID/:workflowID/execute`

Triggers an asynchronous execution of a saved workflow.

- **Returns:** `{ success: true, instanceID: "..." }` immediately.
- **Side Effects:** Pushes a job to the execution queue. Does NOT wait for completion.

### `getRunStatusForWidget`

**Endpoint:** `POST /api/workflows/run-status/:instanceID/widget`

A specialized endpoint for Widgets. It fetches the workflow run status AND pre-processes the data for charting.

**Process:**
1. Calls `workflowService.getRunStatus`.
2. Checks if status is `COMPLETED`.
3. If completed, calls `processWorkflowDataForWidget` (from `@jet-admin/widgets`) to transform `contextData` into chart-ready format (arrays of labels/values).

## WorkflowService

Located in `apps/backend/modules/workflow/workflow.service.js`.

### `testWorkflow({ tenantID, nodes, edges, inputParams })`

Initiates a **Test Run**. Unlike `executeWorkflow`, this does NOT read the workflow definition from the database. Instead, it accepts the `nodes` and `edges` array directly from memory (what the user sees in the editor).

**Logic:**
1. Generates a temporary `instanceID`.
2. Creates an instance record with `isTest: true`.
3. Stores the entire `nodes` and `edges` graph in `contextData.__workflowDefinition`.
4. The Orchestrator uses this in-memory definition to navigate the graph instead of querying `tblWorkflowNodes`.

### `handleTaskResult(result)`

*Internal Function (Orchestrator)*

The core state machine transition function. Called whenever a worker finishes a node.

**Steps:**
1. **Load State:** invalidates if instance not found.
2. **Log:** Writes to `tblNodeExecutionLogs`.
3. **Update Context:** Merges node output into `contextData`.
    - Flattening strategy: `output.queryResult` -> `ctx.queryResult`.
4. **Emit Events:** Sends `WORKFLOW_NODE_UPDATE` via Socket.io.
5. **Route:**
    - If `nodeType === 'end'`: Mark instance COMPLETED.
    - Else: Calculate next nodes using `dagScheduler`.
6. **Next Step:** Enqueues jobs for all downstream nodes.
