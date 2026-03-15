---
id: workflow-nodes
title: Workflow Nodes - Complete Reference
sidebar_label: Node Types
sidebar_position: 2
description: Complete reference for all workflow node types. Every configuration option, field, and setting explained in detail.
---

# Workflow Nodes - Complete Reference

<div align="center">

### 🧩 Workflow Building Blocks

**7 Node Types · Every Option · Configuration Guide · Examples**

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Start Node](#start-node)
- [Data Query Node](#data-query-node)
- [JavaScript Node](#javascript-node)
- [Condition Node](#condition-node)
- [Loop Node](#loop-node)
- [Delay Node](#delay-node)
- [End Node](#end-node)
- [Error Handling](#error-handling)

---

## Overview

Jet Admin workflows are built from **7 node types**, each serving a specific purpose in the automation pipeline.

### Node Types Summary

| Node | Icon | Purpose | Required |
|------|------|---------|----------|
| **Start** | 🟢 | Entry point, input definition | ✅ Yes (1 per workflow) |
| **Data Query** | 🔷 | Execute database/API queries | ❌ No |
| **JavaScript** | 📜 | Run custom code | ❌ No |
| **Condition** | 🔀 | Branch logic | ❌ No |
| **Loop** | 🔁 | Iterate over arrays | ❌ No |
| **Delay** | ⏱️ | Pause execution | ❌ No |
| **End** | 🔴 | Output mapping | ✅ Yes (at least 1) |

### Common Configuration Fields

All nodes share these common fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Title** | String | ✅ Yes | Node display name |
| **Description** | String | ❌ No | Node documentation |
| **Output Variable** | String | ✅ Yes | Variable name for result |
| **Timeout** | Integer | ❌ No | Execution timeout (seconds) |
| **Retry Limit** | Integer | ❌ No | Number of retry attempts |
| **Retry Delay** | Integer | ❌ No | Delay between retries (seconds) |
| **Error Handling** | String | ❌ No | Behavior on error |
| **Is Disabled** | Boolean | ❌ No | Skip node execution |

---

## Start Node

### Purpose

The **Start Node** is the entry point for every workflow. It defines:
- Workflow metadata
- Input parameters (arguments)
- Execution triggers

### Configuration

#### Basic Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| **Title** | String | ✅ Yes | "Start" | Node title |
| **Description** | String | ❌ No | - | Workflow description |

#### Input Parameters

**Purpose:** Define arguments that the workflow accepts.

**Configuration Location:** Input Parameters panel (right side of workflow editor)

**Parameter Structure:**
```json
{
  "name": "parameterName",
  "type": "string|number|boolean|object|array",
  "required": true|false,
  "default": "defaultValue"
}
```

**Parameter Types:**

| Type | Description | Example |
|------|-------------|---------|
| **string** | Text value | `"user@example.com"` |
| **number** | Numeric value | `42` |
| **boolean** | True/false | `true` |
| **object** | JSON object | `{"key": "value"}` |
| **array** | List of values | `[1, 2, 3]` |

### How It Works

**Triggers:**
1. **Manual** - Click "Test Workflow" button
2. **API** - `POST /api/v1/workflows/:id/execute`
3. **Widget** - Linked to widget
4. **Cron** - Scheduled execution
5. **Workflow** - Called from another workflow

**Input Access:**
```javascript
// In other nodes, access input parameters via:
{{ctx.input.parameterName}}
{{ctx.input.userId}}
{{ctx.input.email}}
```

### Example Configuration

**Workflow: User Registration**

**Input Parameters:**
```json
[
  {
    "name": "email",
    "type": "string",
    "required": true
  },
  {
    "name": "name",
    "type": "string",
    "required": true
  },
  {
    "name": "role",
    "type": "string",
    "required": false,
    "default": "user"
  }
]
```

**Usage in Other Nodes:**
```sql
-- In Data Query node
INSERT INTO users (email, name, role)
VALUES ({{ctx.input.email}}, {{ctx.input.name}}, {{ctx.input.role}})
RETURNING id, email, name, role;
```

---

## Data Query Node

### Purpose

Execute saved data queries against configured datasources (PostgreSQL, REST API, etc.).

### Configuration Fields

#### General Tab

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| **Title** | String | ✅ Yes | - | Min: 1, Max: 255 | Node title |
| **Description** | String | ❌ No | - | - | Node description |
| **Data Query** | UUID | ✅ Yes | - | Valid query ID | Select query from dropdown |
| **Arguments** | Object | ❌ No | {} | - | Map parameter values |

#### Output Tab

| Field | Type | Required | Default | Pattern | Description |
|-------|------|----------|---------|---------|-------------|
| **Output Variable** | String | ✅ Yes | "queryResult" | `^[a-zA-Z_][a-zA-Z0-9_]*$` | Variable name to store result |

#### Execution Settings Tab

| Field | Type | Required | Default | Min/Max | Description |
|-------|------|----------|---------|---------|-------------|
| **Timeout** | Integer | ❌ No | 300 | 1-3600 | Execution timeout (seconds) |
| **Retry Limit** | Integer | ❌ No | 0 | 0-10 | Number of retry attempts |
| **Retry Delay** | Integer | ❌ No | 5 | 1-300 | Delay between retries (seconds) |
| **Error Handling** | String | ❌ No | "fail_workflow" | See below | Behavior on error |
| **Is Disabled** | Boolean | ❌ No | false | - | Skip this node |

### Error Handling Options

| Option | Value | Description |
|--------|-------|-------------|
| **Fail Workflow** | `fail_workflow` | Stop workflow execution immediately |
| **Continue** | `continue` | Continue to next node, result is null |
| **Retry then Continue** | `retry_then_continue` | Retry, then continue if still fails |
| **Retry then Fail** | `retry_then_fail` | Retry, then fail workflow if still fails |

### Arguments Configuration

**Purpose:** Map values to query parameters.

**Dynamic Mapping:**
Arguments are auto-populated based on selected query's parameters.

**Value Sources:**
```javascript
// Input parameters
{{ctx.input.userId}}

// Previous node outputs
{{ctx.fetchUser.result}}

// String interpolation
"id_{{ctx.input.id}}"

// JavaScript expressions
{{ ctx.input.date || new Date().toISOString() }}
```

### Example Configuration

**Node: Fetch User Data**

**General Tab:**
```json
{
  "title": "Fetch User Data",
  "description": "Get user details by ID",
  "dataQueryID": "query-uuid-here",
  "args": {
    "userId": "{{ctx.input.userId}}"
  }
}
```

**Output Tab:**
```json
{
  "outputVariable": "userData"
}
```

**Execution Settings:**
```json
{
  "timeoutSeconds": 30,
  "retryLimit": 2,
  "retryDelaySeconds": 5,
  "errorHandling": "retry_then_fail",
  "isDisabled": false
}
```

**Access Result:**
```javascript
// In subsequent nodes:
{{ctx.userData.result}}
{{ctx.userData.result[0].name}}
{{ctx.userData.rowCount}}
```

---

## JavaScript Node

### Purpose

Execute custom JavaScript code for data transformation, logic, or integrations.

### Configuration Fields

#### General Tab

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| **Title** | String | ✅ Yes | - | Node title |
| **Description** | String | ❌ No | - | Node description |
| **Code** | String | ✅ Yes | - | JavaScript code to execute |

#### Output Tab

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| **Output Variable** | String | ✅ Yes | "scriptResult" | Variable name for result |

#### Execution Settings Tab

Same as Data Query Node (timeout, retry, error handling)

### Available Variables

| Variable | Type | Description |
|----------|------|-------------|
| **ctx** | Object | All previous node outputs |
| **args** | Object | Workflow input parameters |
| **utils** | Object | Helper functions |

### Utility Functions

```javascript
// Date formatting
utils.formatDate(date, format)

// String manipulation
utils.toUpperCase(str)
utils.toLowerCase(str)
utils.trim(str)

// Math operations
utils.sum(array)
utils.average(array)
utils.round(number, decimals)

// Object operations
utils.pick(object, keys)
utils.omit(object, keys)
utils.flatten(object)

// Array operations
utils.map(array, fn)
utils.filter(array, fn)
utils.reduce(array, fn, initial)
```

### Code Examples

#### Example 1: Transform Data

**Code:**
```javascript
// Transform user data
const user = ctx.fetchUser.result[0];

return {
  fullName: `${user.firstName} ${user.lastName}`,
  email: user.email.toLowerCase(),
  age: new Date().getFullYear() - new Date(user.birthDate).getFullYear(),
  isActive: user.status === 'active'
};
```

**Output:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true
}
```

#### Example 2: Conditional Logic

**Code:**
```javascript
const order = ctx.fetchOrder.result[0];

if (order.total > 1000) {
  return {
    requiresApproval: true,
    approvalLevel: 'manager'
  };
} else if (order.total > 500) {
  return {
    requiresApproval: true,
    approvalLevel: 'supervisor'
  };
} else {
  return {
    requiresApproval: false
  };
}
```

#### Example 3: Data Aggregation

**Code:**
```javascript
const orders = ctx.fetchOrders.result;

const total = orders.reduce((sum, order) => sum + order.total, 0);
const average = total / orders.length;
const max = Math.max(...orders.map(o => o.total));

return {
  totalRevenue: total,
  averageOrderValue: average,
  highestOrder: max,
  orderCount: orders.length
};
```

#### Example 4: API Response Formatting

**Code:**
```javascript
const apiResponse = ctx.callAPI.result;

return {
  success: apiResponse.status === 200,
  data: apiResponse.data,
  message: apiResponse.message || 'Success',
  timestamp: new Date().toISOString()
};
```

### Best Practices

✅ **DO:**
- Return objects for structured data
- Use try-catch for error handling
- Keep code focused and simple
- Comment complex logic
- Use output variables meaningfully

❌ **DON'T:**
- Perform async operations (not supported)
- Access external resources directly
- Write overly complex logic (use multiple nodes)
- Modify ctx directly (read-only)

---

## Condition Node

### Purpose

Branch workflow execution based on conditions and expressions.

### Configuration Fields

#### General Tab

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Title** | String | ✅ Yes | Node title |
| **Description** | String | ❌ No | Node description |
| **Branches** | Array | ✅ Yes | Condition branches |

#### Branch Configuration

Each branch has:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Name** | String | ✅ Yes | Branch identifier |
| **Condition Type** | String | ✅ Yes | Comparison type |
| **Expression/Operands** | Varies | ✅ Yes | Condition logic |

### Condition Types

| Type | Value | Operands | Description |
|------|-------|----------|-------------|
| **JavaScript Expression** | `expression` | expression | Custom JS boolean expression |
| **Equals** | `equals` | left, right | left == right |
| **Not Equals** | `not_equals` | left, right | left != right |
| **Contains** | `contains` | left, right | left contains right |
| **Greater Than** | `greater_than` | left, right | left > right |
| **Less Than** | `less_than` | left, right | left < right |
| **Is Empty** | `is_empty` | left | left is empty/null/undefined |
| **Is Not Empty** | `is_not_empty` | left | left is not empty |
| **Regex Match** | `regex` | left, pattern | left matches regex pattern |

### Branch Configuration Examples

#### JavaScript Expression

**Configuration:**
```json
{
  "name": "High Value Order",
  "conditionType": "expression",
  "expression": "ctx.orderData.result.total > 1000"
}
```

**Use Case:** Complex conditions

#### Equals

**Configuration:**
```json
{
  "name": "Status is Active",
  "conditionType": "equals",
  "leftOperand": "{{ctx.userData.result.status}}",
  "rightOperand": "active"
}
```

**Use Case:** Simple equality checks

#### Contains

**Configuration:**
```json
{
  "name": "Email Contains Domain",
  "conditionType": "contains",
  "leftOperand": "{{ctx.input.email}}",
  "rightOperand": "@company.com"
}
```

**Use Case:** String contains check

#### Greater Than

**Configuration:**
```json
{
  "name": "Amount Over Limit",
  "conditionType": "greater_than",
  "leftOperand": "{{ctx.transactionData.result.amount}}",
  "rightOperand": "10000"
}
```

**Use Case:** Numeric comparisons

#### Is Empty

**Configuration:**
```json
{
  "name": "No Results Found",
  "conditionType": "is_empty",
  "leftOperand": "{{ctx.searchResults.result}}"
}
```

**Use Case:** Check for empty/null values

#### Regex Match

**Configuration:**
```json
{
  "name": "Valid Email Format",
  "conditionType": "regex",
  "leftOperand": "{{ctx.input.email}}",
  "rightOperand": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
}
```

**Use Case:** Pattern validation

### Multiple Branches

**Configuration:**
```json
{
  "branches": [
    {
      "id": "branch_1",
      "name": "VIP Customer",
      "conditionType": "greater_than",
      "leftOperand": "{{ctx.customerData.result.lifetimeValue}}",
      "rightOperand": "50000"
    },
    {
      "id": "branch_2",
      "name": "Regular Customer",
      "conditionType": "greater_than",
      "leftOperand": "{{ctx.customerData.result.lifetimeValue}}",
      "rightOperand": "1000"
    },
    {
      "id": "branch_3",
      "name": "New Customer",
      "conditionType": "expression",
      "expression": "true"
    }
  ]
}
```

**Execution Flow:**
1. Evaluate branches in order
2. Execute first matching branch
3. Continue to connected node
4. If no match, use default path (if configured)

### Available Variables in Conditions

```javascript
// Previous node outputs
ctx.queryResult
ctx.scriptResult
ctx.fetchData.result

// Input parameters
ctx.input.userId
ctx.input.email

// Nested access
ctx.userData.result[0].name
ctx.orderData.result.total
```

---

## Loop Node

### Purpose

Iterate over arrays and execute child nodes for each item.

### Configuration Fields

#### General Tab

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| **Title** | String | ✅ Yes | - | Node title |
| **Description** | String | ❌ No | - | Node description |
| **Array Expression** | String | ✅ Yes | - | Array to iterate over |
| **Loop Variable** | String | ❌ No | "item" | Variable name for current item |
| **Batch Size** | Integer | ❌ No | 1 | Items per iteration |
| **Parallel** | Boolean | ❌ No | false | Run iterations in parallel |

#### Output Tab

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| **Output Variable** | String | ✅ Yes | "loopResult" | Variable for results array |

### Array Expression

**Purpose:** Specify which array to iterate over.

**Examples:**
```javascript
// From query result
{{ctx.fetchUsers.result}}

// From script output
{{ctx.transformData.result.items}}

// From input
{{ctx.input.userIds}}

// Nested array
{{ctx.orderData.result[0].items}}
```

### Loop Variable

**Purpose:** Name for accessing current iteration item.

**Default:** `item`

**Access in Child Nodes:**
```javascript
// Current item
{{ctx.item}}

// Item property
{{ctx.item.id}}
{{ctx.item.email}}

// With custom variable name
{{ctx.currentUser}}
{{ctx.orderItem}}
```

### Batch Size

**Purpose:** Process multiple items per iteration.

**Use Cases:**
- Batch database inserts
- Bulk API calls
- Grouped processing

**Example:**
```json
{
  "batchSize": 10
}
```

Processes 10 items at a time.

### Parallel Execution

**Purpose:** Run iterations concurrently.

**⚠️ Warning:** Use with caution - may cause race conditions or API rate limit issues.

**Configuration:**
```json
{
  "parallel": true
}
```

### Example Configuration

**Loop: Process Order Items**

**Configuration:**
```json
{
  "title": "Process Order Items",
  "description": "Process each item in the order",
  "arrayExpression": "{{ctx.orderData.result.items}}",
  "loopVariable": "item",
  "batchSize": 1,
  "parallel": false,
  "outputVariable": "processResults"
}
```

**Child Nodes:**
```
Loop: Process Order Items
├── Data Query: Create Inventory Record
│   Args: { itemId: "{{ctx.item.id}}", quantity: "{{ctx.item.quantity}}" }
├── Data Query: Update Product Stock
│   Args: { productId: "{{ctx.item.productId}}", decrease: "{{ctx.item.quantity}}" }
└── JavaScript: Log Processing
    Code: return { processed: ctx.item.id, timestamp: new Date() };
```

**Result Access:**
```javascript
// Array of all iteration results
{{ctx.processResults}}

// Individual result
{{ctx.processResults[0]}}
{{ctx.processResults[0].processed}}
```

---

## Delay Node

### Purpose

Pause workflow execution for a specified duration or until a condition is met.

### Configuration Fields

#### General Tab

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| **Title** | String | ✅ Yes | - | Node title |
| **Description** | String | ❌ No | - | Node description |
| **Delay Type** | String | ✅ Yes | "seconds" | Duration or until |
| **Duration** | Integer | ❌ No | - | Milliseconds to wait |
| **Until Expression** | String | ❌ No | - | Wait until condition is true |

### Delay Types

#### Fixed Duration

**Delay Type:** `seconds`, `milliseconds`, `minutes`, `hours`

**Configuration:**
```json
{
  "delayType": "seconds",
  "duration": 5000
}
```

**Duration Examples:**

| Type | Value | Actual Delay |
|------|-------|--------------|
| **milliseconds** | 5000 | 5 seconds |
| **seconds** | 30 | 30 seconds |
| **minutes** | 5 | 5 minutes |
| **hours** | 1 | 1 hour |

#### Wait Until Condition

**Delay Type:** `until`

**Configuration:**
```json
{
  "delayType": "until",
  "untilExpression": "ctx.approvalReceived.result === true"
}
```

**Use Cases:**
- Wait for approval
- Wait for external event
- Poll for status change

### Example Configurations

#### Example 1: Rate Limiting

**Purpose:** Avoid API rate limits

**Configuration:**
```json
{
  "title": "Rate Limit Delay",
  "description": "Wait 1 second between API calls",
  "delayType": "seconds",
  "duration": 1000
}
```

#### Example 2: Approval Wait

**Purpose:** Wait for manager approval

**Configuration:**
```json
{
  "title": "Wait for Approval",
  "description": "Wait until approval is received",
  "delayType": "until",
  "untilExpression": "{{ctx.checkApproval.result.approved !== null}}"
}
```

#### Example 3: Staggered Execution

**Purpose:** Delay before sending notification

**Configuration:**
```json
{
  "title": "Delay Notification",
  "description": "Wait 5 minutes before sending reminder",
  "delayType": "minutes",
  "duration": 5
}
```

---

## End Node

### Purpose

Terminate workflow execution and define output mapping.

### Configuration Fields

#### General Tab

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Title** | String | ✅ Yes | Node title |
| **Description** | String | ❌ No | Node description |

#### Output Mapping Tab

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Output Mappings** | Object | ❌ No | Map variables to output |

### Output Mapping

**Purpose:** Define what data is returned when workflow completes.

**Structure:**
```json
{
  "outputMapping": {
    "success": "{{ctx.finalResult.success}}",
    "userId": "{{ctx.createUser.result.id}}",
    "message": "\"User created successfully\"",
    "data": "{{ctx.userData.result}}"
  }
}
```

### Output Mapping Examples

#### Example 1: Simple Success Response

**Configuration:**
```json
{
  "outputMapping": {
    "success": true,
    "message": "Operation completed successfully"
  }
}
```

**Result:**
```json
{
  "success": true,
  "message": "Operation completed successfully"
}
```

#### Example 2: Return Created Resource

**Configuration:**
```json
{
  "outputMapping": {
    "id": "{{ctx.createUser.result.id}}",
    "email": "{{ctx.createUser.result.email}}",
    "name": "{{ctx.createUser.result.name}}",
    "createdAt": "{{ctx.createUser.result.created_at}}"
  }
}
```

**Result:**
```json
{
  "id": "uuid-123",
  "email": "john@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Example 3: Conditional Output

**Configuration:**
```json
{
  "outputMapping": {
    "success": "{{ctx.finalCheck.result.passed}}",
    "data": "{{ctx.processData.result}}",
    "error": "{{ctx.finalCheck.error || null}}",
    "requiresAction": "{{ctx.finalCheck.result.requiresAction}}"
  }
}
```

---

## Error Handling

### Node-Level Error Handling

Each node can configure error handling behavior:

#### Fail Workflow (Default)

**Behavior:** Stop execution immediately

**Configuration:**
```json
{
  "errorHandling": "fail_workflow"
}
```

**Use Case:** Critical operations that must succeed

#### Continue

**Behavior:** Continue to next node, result is null

**Configuration:**
```json
{
  "errorHandling": "continue"
}
```

**Use Case:** Non-critical operations

#### Retry then Continue

**Behavior:** Retry configured times, then continue

**Configuration:**
```json
{
  "errorHandling": "retry_then_continue",
  "retryLimit": 3,
  "retryDelaySeconds": 5
}
```

**Use Case:** Flaky external services

#### Retry then Fail

**Behavior:** Retry configured times, then fail workflow

**Configuration:**
```json
{
  "errorHandling": "retry_then_fail",
  "retryLimit": 3,
  "retryDelaySeconds": 5
}
```

**Use Case:** Important but potentially transient failures

### Retry Behavior

**Retry Logic:**
1. Attempt execution
2. On failure, check retry limit
3. If retries remaining, wait delay duration
4. Retry with exponential backoff
5. If still fails, apply error handling

**Exponential Backoff:**
```
Attempt 1: Immediate
Attempt 2: After 5 seconds
Attempt 3: After 10 seconds (5 × 2)
Attempt 4: After 20 seconds (5 × 4)
```

---

## Next Steps

- [**Workflow Edges**](./edges) - Connections and conditions
- [**Workflow Execution**](./execution) - Run and monitor workflows
- [**Examples**](./examples) - Complete workflow examples
- [**API Reference**](../../api-reference/index) - Execute via API

---

<div align="center">

### Need Help?

[Troubleshooting Guide](../../troubleshooting/troubleshooting) · [API Reference](../../api-reference/index) · [Community Support](#)

</div>
