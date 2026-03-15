---
sidebar_position: 1
title: Overview & Nodes
description: Automate business logic with Jet Admin's visual Workflow Engine.
---

# Workflow Engine Overview

Jet Admin includes a powerful visual **Workflow Engine** for automating complex business logic, orchestrating external integrations, and building data-processing pipelines.

![Workflow Editor](/img/workflow_editor.png)

## What is a Workflow?

A Workflow is a Directed Acyclic Graph (DAG)—a series of connected "Nodes" that execute in a specific order. When a workflow is triggered, Jet Admin's backend engine executes each block, passes data between them, and evaluates conditions to decide which path to follow.

You can use Workflows to:
- Run a sequence of database queries (e.g., check inventory, then insert order).
- Fetch data from an API, transform it using JavaScript, and save it to PostgreSQL.
- Send a Slack notification if a financial transaction exceeds a threshold.

### Testing vs. Production
Jet Admin's editor allows you to **Test** a workflow interactively before saving it. Testing executes the logic and provides real-time, step-by-step visual feedback and execution logs directly in your browser. Once validated, you save the workflow for **Production** runs triggered by UI Widgets or external events.

---

## Node Library Reference

Nodes are the building blocks of your workflow. Every workflow must begin with a **Start Node** and should conclude with an **End Node**.

### 🟢 Start Node
The required entry point of every workflow. 
- **Purpose:** Initializes the execution environment. 
- **Configuration:** You can define *Input Arguments* here. For example, if your workflow requires a `user_id` to run, you declare it in the Start Node. Subsequent nodes can then access this via `{{ctx.input.user_id}}`.

### 🔴 End Node
The terminal point.
- **Purpose:** Stops the execution path.
- **Configuration:** You construct the final JSON output of your workflow here by mapping variables from the context. This output is returned to whatever triggered the workflow (e.g., a Button widget).

### 🔷 Data Query Node
Executes a saved database or API [Data Query](../data-query/overview.mdx).
- **Purpose:** Reading or writing data to your external Datasources.
- **Configuration:** You select the query and provide any required dynamic arguments.
- **Outputs:** The data returned by the database/API is saved to the workflow context under the configured `outputVariable` (e.g., `{{ctx.queryResult}}`).

### 📜 JavaScript Node
Executes custom code in a secure, sandboxed environment.
- **Purpose:** Data transformation, calculations, or complex formatting.
- **Configuration:** You write standard JavaScript. The `ctx` object is globally available to access previous node outputs.
- **Example:**
  ```javascript
  // Extract and sum totals from a previous query result
  const orders = ctx.fetchOrders.data;
  const total = orders.reduce((sum, order) => sum + order.amount, 0);
  return { totalValue: total, processDate: new Date() };
  ```

### 🔀 Condition Node
Routes execution down different paths based on Boolean logic.
- **Purpose:** Building `if / else if / else` workflows.
- **Configuration:** You define multiple "Branches" using JavaScript expressions (e.g., `ctx.input.amount > 100`). The engine evaluates these from top to bottom and follows the *first* edge that evaluates to `true`. If none match, it follows the `default` edge.

### 🔄 Loop Node
Iterates over an array of items.
- **Purpose:** Bulk processing.
- **Configuration:** You provide a `sourceVariable` (e.g., `{{ctx.fetchUsers.data}}`). The engine will execute the connected "loop body" nodes once for every item in the array before continuing down the "done" path.

### ⏱️ Delay Node
Pauses the workflow.
- **Purpose:** Rate-limiting APIs, waiting for external state changes, or pacing notifications.
- **Configuration:** Set a fixed duration (minutes/seconds) or read a dynamic duration from the context. The engine safely suspends the job and resumes it automatically.

---

## Edges and Error Handling

**Edges** (the lines connecting nodes) carry semantic meaning about *when* a path should be followed.

- **Green (Success):** The default path followed if a node completes successfully.
- **Red (Error):** By default, if a node fails (e.g., a database timeout), the entire workflow aborts. However, you can configure nodes (like JS or Data Query) to **"Continue on Error"**. When enabled, the engine will follow the red Error edge, allowing you to build fallback logic or send alert notifications.
- **Yellow (Branch):** Used exclusively by the Condition node to represent different logical paths.

## Context (`ctx`) Data Flow

Data is passed between nodes using a shared memory space called the **Context**, accessed via `ctx`. 

If a Data Query node is named `getCustomer` and its output variable is `queryResult`, subsequent nodes can access that data using:
`{{ctx.getCustomer.queryResult}}`

The Context accumulates data as the workflow progresses, ensuring that a node at the very end of the graph has access to the outputs of every node that executed before it.
