---
id: workflow-engine
title: Workflow Engine
sidebar_label: Workflow Engine
sidebar_position: 7
description: Architecture of the DAG-based workflow orchestrator and executor.
---

# Workflow Engine

The Workflow Engine is a robust, distributed system for executing multi-step business logic asynchronously. While Queries are synchronous and meant for immediate data fetching, Workflows are asynchronous, long-running Directed Acyclic Graphs (DAGs).

## Workflow Concepts

- **DAG Structure:** Workflows are composed of **Nodes** connected by directed **Edges**. The engine ensures there are no infinite cycles.
- **Triggers:** Workflows can be initiated manually via UI, scheduled via cron jobs, or triggered by incoming webhooks/events.
- **Context Log:** Workflows do not share a mutable global state. Instead, they use an XCom-style append-only context log. As each node finishes, its output is appended to the context. Downstream nodes can reference upstream outputs via bindings like `{{context.steps.queryData.data}}`.

## Data Model

Workflows consist of several relational entities in the database:
- `tblWorkflows`: The definition metadata (title, tenant ID, creator).
- `tblWorkflowNodes`: The individual steps (type, config schema, retry limits).
- `tblWorkflowInstances`: A specific execution run of a workflow. Tracks status (`RUNNING`, `COMPLETED`, `FAILED`).
- `tblWorkflowInstanceLogs`: The append-only context log. Stores the output payload of every executed node for a given instance.

## Execution Architecture

The Workflow Engine is split into two primary components to allow horizontal scaling: the **Orchestrator** and the **Executor (Workers)**.

### The Orchestrator (`workflowEngine/engine.js`)
The Orchestrator's job is scheduling.
1. It analyzes the DAG.
2. It determines which nodes are ready to run (i.e., all their upstream dependencies have successfully completed).
3. It packages the node configuration and the current instance context into a job payload.
4. It enqueues the job into **pg-boss** (the PostgreSQL-backed job queue).

### The Executor Workers (`workers/taskWorker.js`)
The Workers handle the actual execution.
1. A worker claims a job from pg-boss.
2. It evaluates any `{{bindings}}` in the node's configuration using the provided context.
3. It hands the configuration to the specific Node Handler (e.g., `dataQueryHandler`, `javascriptHandler`).
4. The Handler executes the logic (running a DB query, executing JS in isolated-vm).
5. The result is returned to the Orchestrator via a dedicated results queue.

## Execution Lifecycle

Here is the chronological order of a workflow execution:

1. **Trigger:** A workflow is triggered (e.g., via a Webhook).
2. **Instance Creation:** A new `tblWorkflowInstances` record is created with status `PENDING`.
3. **Start Resolution:** The Orchestrator resolves the `Start` node and enqueues a job for it.
4. **Worker Execution:** A Worker picks up the job, executes the Start node handler, and pushes the result back to the Orchestrator.
5. **Context Appended:** The Orchestrator appends the node's output to `tblWorkflowInstanceLogs`.
6. **DAG Re-evaluation:** The Orchestrator checks the DAG to see which downstream nodes are now unblocked.
7. **Next Jobs Enqueued:** It enqueues jobs for the newly unblocked nodes in pg-boss.
8. **Loop:** Steps 4-7 repeat concurrently for all branches of the DAG.
9. **Terminal State:** Once terminal nodes (`EndNode`) complete, or if an unhandled error occurs, the instance status updates to `COMPLETED` or `FAILED`.
10. **Socket Event:** A Socket.IO event is emitted to connected clients indicating the final status and context.

## Node Type Reference

The engine supports various node types out-of-the-box:

- **Start Node:** The entry point. Handles incoming trigger payloads.
- **Data Query Node:** Executes a saved Query against a Datasource. Appends the data result to the context.
- **JavaScript Node:** Executes custom JS in the secure `isolated-vm` environment to transform data.
- **Condition Node:** Evaluates a boolean expression (e.g., `{{context.steps.query1.total > 10}}`). Branches execution down true or false edges.
- **Loop Node:** Iterates over an array in the context, executing a sub-graph of nodes for each item.
- **Delay Node:** Pauses execution for a set duration.
- **Data Collection Node:** A specialized node that pauses workflow execution entirely. It issues a secure token and waits for human input (e.g., via an email form or API callback). Once data is submitted, the Orchestrator resumes the workflow.
- **End Node:** Explicitly terminates a branch or the entire workflow.

## Error Handling & Retry

Robust error handling is critical for distributed systems.
- **Retry Policy:** Nodes can be configured with a retry limit (`retryLimit` in `tblWorkflowNodes`) and backoff strategy. If a REST API query node fails due to network timeout, the Executor will retry it automatically.
- **Failure Propagation:** If a node exhausts its retries, it is marked as `FAILED`. Downstream nodes dependent on it will never run. Depending on DAG configuration, the entire workflow instance may be marked `FAILED`.
- **Debugging:** Because the context log is persisted (`tblWorkflowInstanceLogs`), developers can inspect exactly what data entered and exited a node at the time of failure using the Jet Admin UI.
